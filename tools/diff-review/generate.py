#!/usr/bin/env python3
"""Generate a readable, standalone HTML review page for Git changes."""

from __future__ import annotations

import argparse
import difflib
import fnmatch
import hashlib
import html
import shlex
import subprocess
import sys
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Iterable, Sequence


DEFAULT_OUTPUT = "tools/diff-review/output/index.html"
MAX_INLINE_BYTES = 2_000_000


@dataclass(frozen=True)
class ChangeSpec:
    status: str
    old_path: str | None
    new_path: str | None

    @property
    def display_path(self) -> str:
        if self.old_path and self.new_path and self.old_path != self.new_path:
            return f"{self.old_path} → {self.new_path}"
        return self.new_path or self.old_path or "(unknown)"

    @property
    def search_text(self) -> str:
        return " ".join(dict.fromkeys(path for path in (self.old_path, self.new_path) if path))


@dataclass
class FileChange:
    spec: ChangeSpec
    old_lines: list[str] | None
    new_lines: list[str] | None
    old_size: int
    new_size: int
    old_ends_with_newline: bool
    new_ends_with_newline: bool
    error: str | None = None

    @property
    def is_binary(self) -> bool:
        return self.old_lines is None or self.new_lines is None


@dataclass
class DiffRow:
    kind: str
    old_no: int | None = None
    new_no: int | None = None
    old_html: str = ""
    new_html: str = ""
    gap_id: str | None = None
    hidden: bool = False
    hidden_count: int = 0


@dataclass
class RenderedFile:
    change: FileChange
    file_id: str
    additions: int
    deletions: int
    body_html: str


def run_git(
    root: Path,
    *args: str,
    check: bool = True,
) -> subprocess.CompletedProcess[bytes]:
    result = subprocess.run(
        ["git", "-C", str(root), *args],
        check=False,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    if check and result.returncode != 0:
        message = result.stderr.decode("utf-8", errors="replace").strip()
        raise RuntimeError(message or f"git {' '.join(args)} failed")
    return result


def find_repo_root(candidate: Path) -> Path:
    result = run_git(candidate.resolve(), "rev-parse", "--show-toplevel")
    return Path(result.stdout.decode("utf-8").strip()).resolve()


def verify_base(root: Path, base: str) -> str:
    result = run_git(root, "rev-parse", "--verify", f"{base}^{{commit}}")
    return result.stdout.decode("utf-8").strip()


def decode_path(value: bytes) -> str:
    return value.decode("utf-8", errors="surrogateescape")


def is_excluded(spec: ChangeSpec, patterns: Sequence[str]) -> bool:
    paths = [path for path in (spec.old_path, spec.new_path) if path]
    return any(
        fnmatch.fnmatch(path, pattern) or fnmatch.fnmatch(Path(path).name, pattern)
        for path in paths
        for pattern in patterns
    )


def collect_change_specs(
    root: Path,
    base: str,
    paths: Sequence[str],
    include_untracked: bool,
    excludes: Sequence[str],
) -> list[ChangeSpec]:
    command = ["diff", "--name-status", "-z", "--find-renames", base, "--"]
    command.extend(paths)
    raw = run_git(root, *command).stdout
    fields = raw.split(b"\0")
    if fields and fields[-1] == b"":
        fields.pop()

    specs: list[ChangeSpec] = []
    index = 0
    while index < len(fields):
        status = decode_path(fields[index])
        index += 1
        kind = status[:1]
        if kind in {"R", "C"}:
            old_path = decode_path(fields[index])
            new_path = decode_path(fields[index + 1])
            index += 2
        else:
            path = decode_path(fields[index])
            index += 1
            old_path = None if kind == "A" else path
            new_path = None if kind == "D" else path
        specs.append(ChangeSpec(status, old_path, new_path))

    if include_untracked:
        command = ["ls-files", "--others", "--exclude-standard", "-z", "--"]
        command.extend(paths)
        raw_untracked = run_git(root, *command).stdout
        for value in raw_untracked.split(b"\0"):
            if not value:
                continue
            path = decode_path(value)
            specs.append(ChangeSpec("?", None, path))

    deduplicated: dict[tuple[str | None, str | None], ChangeSpec] = {}
    for spec in specs:
        if is_excluded(spec, excludes):
            continue
        deduplicated[(spec.old_path, spec.new_path)] = spec

    return sorted(deduplicated.values(), key=lambda item: item.display_path.casefold())


def read_base_blob(root: Path, base: str, path: str | None) -> tuple[bytes, str | None]:
    if path is None:
        return b"", None
    result = run_git(root, "show", f"{base}:{path}", check=False)
    if result.returncode == 0:
        return result.stdout, None
    message = result.stderr.decode("utf-8", errors="replace").strip()
    return b"", message or f"无法读取 {base}:{path}"


def read_worktree_file(root: Path, path: str | None) -> tuple[bytes, str | None]:
    if path is None:
        return b"", None
    candidate = root / path
    try:
        if not candidate.is_file():
            return b"", f"工作区中不存在普通文件：{path}"
        return candidate.read_bytes(), None
    except OSError as error:
        return b"", str(error)


def decode_text(data: bytes) -> list[str] | None:
    if len(data) > MAX_INLINE_BYTES or b"\0" in data:
        return None
    try:
        return data.decode("utf-8").splitlines()
    except UnicodeDecodeError:
        return None


def load_file_change(root: Path, base: str, spec: ChangeSpec) -> FileChange:
    old_data, old_error = read_base_blob(root, base, spec.old_path)
    new_data, new_error = read_worktree_file(root, spec.new_path)
    error = old_error or new_error
    return FileChange(
        spec=spec,
        old_lines=decode_text(old_data),
        new_lines=decode_text(new_data),
        old_size=len(old_data),
        new_size=len(new_data),
        old_ends_with_newline=old_data.endswith((b"\n", b"\r")),
        new_ends_with_newline=new_data.endswith((b"\n", b"\r")),
        error=error,
    )


def escaped_line(value: str) -> str:
    return html.escape(value) if value else "&#8203;"


def inline_diff(old: str, new: str) -> tuple[str, str]:
    if old == new:
        escaped = escaped_line(old)
        return escaped, escaped
    if len(old) + len(new) > 4_000:
        return (
            f'<span class="word-del">{escaped_line(old)}</span>',
            f'<span class="word-add">{escaped_line(new)}</span>',
        )

    matcher = difflib.SequenceMatcher(None, old, new, autojunk=False)
    old_parts: list[str] = []
    new_parts: list[str] = []
    for tag, old_start, old_end, new_start, new_end in matcher.get_opcodes():
        old_fragment = html.escape(old[old_start:old_end])
        new_fragment = html.escape(new[new_start:new_end])
        if tag == "equal":
            old_parts.append(old_fragment)
            new_parts.append(new_fragment)
        elif tag == "delete":
            old_parts.append(f'<span class="word-del">{old_fragment}</span>')
        elif tag == "insert":
            new_parts.append(f'<span class="word-add">{new_fragment}</span>')
        else:
            old_parts.append(f'<span class="word-del">{old_fragment}</span>')
            new_parts.append(f'<span class="word-add">{new_fragment}</span>')

    return "".join(old_parts) or "&#8203;", "".join(new_parts) or "&#8203;"


def equal_row(old_lines: Sequence[str], old_index: int, new_index: int) -> DiffRow:
    return DiffRow(
        kind="context",
        old_no=old_index + 1,
        new_no=new_index + 1,
        old_html=escaped_line(old_lines[old_index]),
        new_html=escaped_line(old_lines[old_index]),
    )


def append_collapsed_rows(
    rows: list[DiffRow],
    old_lines: Sequence[str],
    old_start: int,
    new_start: int,
    count: int,
    gap_number: int,
) -> None:
    if count <= 0:
        return
    gap_id = f"gap-{gap_number}"
    rows.append(DiffRow(kind="gap", gap_id=gap_id, hidden_count=count))
    for offset in range(count):
        row = equal_row(old_lines, old_start + offset, new_start + offset)
        row.hidden = True
        row.gap_id = gap_id
        rows.append(row)


def build_diff_rows(
    old_lines: Sequence[str],
    new_lines: Sequence[str],
    context: int,
) -> tuple[list[DiffRow], int, int]:
    matcher = difflib.SequenceMatcher(None, old_lines, new_lines, autojunk=False)
    opcodes = matcher.get_opcodes()
    rows: list[DiffRow] = []
    additions = 0
    deletions = 0
    gap_number = 0

    for opcode_index, (tag, old_start, old_end, new_start, new_end) in enumerate(opcodes):
        if tag == "equal":
            length = old_end - old_start
            if length == 0:
                continue
            leading = opcode_index == 0
            trailing = opcode_index == len(opcodes) - 1

            if length <= context * 2 or (leading and trailing):
                for offset in range(length):
                    rows.append(equal_row(old_lines, old_start + offset, new_start + offset))
                continue

            if leading:
                hidden_count = max(0, length - context)
                gap_number += 1
                append_collapsed_rows(
                    rows, old_lines, old_start, new_start, hidden_count, gap_number
                )
                for offset in range(hidden_count, length):
                    rows.append(equal_row(old_lines, old_start + offset, new_start + offset))
                continue

            for offset in range(min(context, length)):
                rows.append(equal_row(old_lines, old_start + offset, new_start + offset))

            hidden_start = min(context, length)
            hidden_end = max(hidden_start, length - (0 if trailing else context))
            hidden_count = hidden_end - hidden_start
            if hidden_count:
                gap_number += 1
                append_collapsed_rows(
                    rows,
                    old_lines,
                    old_start + hidden_start,
                    new_start + hidden_start,
                    hidden_count,
                    gap_number,
                )

            if not trailing:
                for offset in range(max(context, length - context), length):
                    rows.append(equal_row(old_lines, old_start + offset, new_start + offset))
            continue

        if tag == "delete":
            deletions += old_end - old_start
            for old_index in range(old_start, old_end):
                rows.append(
                    DiffRow(
                        kind="delete",
                        old_no=old_index + 1,
                        old_html=escaped_line(old_lines[old_index]),
                    )
                )
            continue

        if tag == "insert":
            additions += new_end - new_start
            for new_index in range(new_start, new_end):
                rows.append(
                    DiffRow(
                        kind="insert",
                        new_no=new_index + 1,
                        new_html=escaped_line(new_lines[new_index]),
                    )
                )
            continue

        old_count = old_end - old_start
        new_count = new_end - new_start
        deletions += old_count
        additions += new_count
        for offset in range(max(old_count, new_count)):
            old_index = old_start + offset if offset < old_count else None
            new_index = new_start + offset if offset < new_count else None
            old_value = old_lines[old_index] if old_index is not None else ""
            new_value = new_lines[new_index] if new_index is not None else ""
            old_html, new_html = inline_diff(old_value, new_value)
            rows.append(
                DiffRow(
                    kind="replace",
                    old_no=old_index + 1 if old_index is not None else None,
                    new_no=new_index + 1 if new_index is not None else None,
                    old_html=old_html if old_index is not None else "",
                    new_html=new_html if new_index is not None else "",
                )
            )

    return rows, additions, deletions


def render_diff_row(row: DiffRow) -> str:
    if row.kind == "gap":
        return (
            f'<tr class="gap-row" data-gap-row="{row.gap_id}">'
            '<td colspan="4">'
            f'<button type="button" data-expand-gap="{row.gap_id}">'
            f"展开 {row.hidden_count} 行未修改内容"
            "</button></td></tr>"
        )

    attributes = ""
    if row.hidden and row.gap_id:
        attributes = f' hidden data-gap="{row.gap_id}"'
    old_no = str(row.old_no) if row.old_no is not None else ""
    new_no = str(row.new_no) if row.new_no is not None else ""
    old_code = row.old_html or "&#8203;"
    new_code = row.new_html or "&#8203;"
    return (
        f'<tr class="diff-row {row.kind}-row"{attributes}>'
        f'<td class="line-no old-no">{old_no}</td>'
        f'<td class="code-cell old-code"><code>{old_code}</code></td>'
        f'<td class="line-no new-no">{new_no}</td>'
        f'<td class="code-cell new-code"><code>{new_code}</code></td>'
        "</tr>"
    )


def status_label(status: str) -> str:
    labels = {
        "M": "修改",
        "A": "新增",
        "D": "删除",
        "R": "重命名",
        "C": "复制",
        "T": "类型",
        "?": "未跟踪",
    }
    return labels.get(status[:1], status)


def render_file(change: FileChange, context: int) -> RenderedFile:
    digest = hashlib.sha1(change.spec.display_path.encode("utf-8")).hexdigest()[:12]
    file_id = f"file-{digest}"

    if change.error:
        body = f'<div class="file-message error">{html.escape(change.error)}</div>'
        return RenderedFile(change, file_id, 0, 0, body)

    if change.is_binary:
        body = (
            '<div class="file-message">'
            "此文件是二进制文件、非 UTF-8 文本或超过 2 MB，未生成逐行对比。"
            f" 旧文件 {change.old_size:,} 字节，新文件 {change.new_size:,} 字节。"
            "</div>"
        )
        return RenderedFile(change, file_id, 0, 0, body)

    old_lines = change.old_lines or []
    new_lines = change.new_lines or []
    rows, additions, deletions = build_diff_rows(old_lines, new_lines, context)
    notes: list[str] = []
    if (
        change.spec.old_path is not None
        and change.spec.new_path is not None
        and change.old_ends_with_newline != change.new_ends_with_newline
    ):
        notes.append("文件末尾换行状态发生变化")
    if not rows:
        notes.append("未检测到逐行文本变化，可能只修改了文件模式")

    note_html = "".join(f'<div class="file-note">{html.escape(note)}</div>' for note in notes)
    table_rows = "".join(render_diff_row(row) for row in rows)
    table = (
        '<div class="table-scroll"><table class="diff-table">'
        "<colgroup><col class=number-col><col><col class=number-col><col></colgroup>"
        "<thead><tr>"
        "<th colspan=2 class=old-heading>基线</th>"
        "<th colspan=2 class=new-heading>当前工作区</th>"
        "</tr></thead>"
        f"<tbody>{table_rows}</tbody></table></div>"
    )
    return RenderedFile(change, file_id, additions, deletions, note_html + table)


def render_file_section(rendered: RenderedFile) -> str:
    change = rendered.change
    path = html.escape(change.spec.display_path)
    search = html.escape(change.spec.search_text.casefold(), quote=True)
    status = html.escape(status_label(change.spec.status))
    status_class = "untracked" if change.spec.status.startswith("?") else (
        change.spec.status[:1].lower() or "m"
    )
    return (
        f'<details class="file-card" id="{rendered.file_id}" data-path="{search}" open>'
        "<summary>"
        f'<span class="status status-{status_class}">{status}</span>'
        f'<code class="file-path">{path}</code>'
        '<span class="file-counts">'
        f'<span class="additions">+{rendered.additions}</span>'
        f'<span class="deletions">−{rendered.deletions}</span>'
        "</span></summary>"
        f"{rendered.body_html}</details>"
    )


def render_nav_item(rendered: RenderedFile) -> str:
    path = html.escape(rendered.change.spec.display_path)
    search = html.escape(rendered.change.spec.search_text.casefold(), quote=True)
    status = html.escape(rendered.change.spec.status[:1] or "M")
    return (
        f'<a class="file-link" href="#{rendered.file_id}" data-target="{rendered.file_id}" '
        f'data-path="{search}"><span class="nav-status">{status}</span>'
        f'<span class="nav-path">{path}</span>'
        f'<span class="nav-count"><b>+{rendered.additions}</b> '
        f'<i>−{rendered.deletions}</i></span></a>'
    )


CSS = r"""
:root {
  color-scheme: light dark;
  --bg: #f4f6f8;
  --panel: #ffffff;
  --panel-soft: #f8fafc;
  --text: #172033;
  --muted: #64748b;
  --border: #d8dee8;
  --border-strong: #b8c2d1;
  --accent: #2563eb;
  --accent-soft: #dbeafe;
  --add-bg: #e7f8ee;
  --add-strong: #b9ebcb;
  --add-text: #17663a;
  --del-bg: #fff0f0;
  --del-strong: #ffc8c8;
  --del-text: #a32828;
  --replace-bg: #fff8df;
  --replace-strong: #ffe59a;
  --line-no: #f1f4f8;
  --shadow: 0 12px 30px rgb(15 23 42 / 8%);
  --mono: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  --sans: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

html[data-theme="dark"] {
  --bg: #0d1117;
  --panel: #151b23;
  --panel-soft: #111820;
  --text: #e6edf3;
  --muted: #9aa7b5;
  --border: #303844;
  --border-strong: #465160;
  --accent: #6ea8fe;
  --accent-soft: #183154;
  --add-bg: #102b1d;
  --add-strong: #1d5033;
  --add-text: #75d79e;
  --del-bg: #32191c;
  --del-strong: #61252b;
  --del-text: #ff9b9b;
  --replace-bg: #302918;
  --replace-strong: #5f4b1c;
  --line-no: #10161e;
  --shadow: 0 12px 30px rgb(0 0 0 / 30%);
}

@media (prefers-color-scheme: dark) {
  html:not([data-theme="light"]) {
    --bg: #0d1117;
    --panel: #151b23;
    --panel-soft: #111820;
    --text: #e6edf3;
    --muted: #9aa7b5;
    --border: #303844;
    --border-strong: #465160;
    --accent: #6ea8fe;
    --accent-soft: #183154;
    --add-bg: #102b1d;
    --add-strong: #1d5033;
    --add-text: #75d79e;
    --del-bg: #32191c;
    --del-strong: #61252b;
    --del-text: #ff9b9b;
    --replace-bg: #302918;
    --replace-strong: #5f4b1c;
    --line-no: #10161e;
    --shadow: 0 12px 30px rgb(0 0 0 / 30%);
  }
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; scroll-padding-top: 112px; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: var(--sans);
  font-size: 14px;
}
button, input { font: inherit; }
button { cursor: pointer; }

.topbar {
  position: sticky;
  z-index: 30;
  top: 0;
  display: flex;
  align-items: center;
  gap: 18px;
  min-height: 76px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--border);
  background: color-mix(in srgb, var(--panel) 94%, transparent);
  backdrop-filter: blur(14px);
}
.brand { min-width: 260px; }
.brand h1 { margin: 0 0 4px; font-size: 19px; line-height: 1.2; }
.meta { display: flex; flex-wrap: wrap; gap: 5px 12px; color: var(--muted); font-size: 12px; }
.meta code { color: var(--text); font-family: var(--mono); }
.toolbar { display: flex; align-items: center; justify-content: flex-end; gap: 8px; flex: 1; }
.toolbar input {
  width: min(300px, 28vw);
  min-width: 180px;
  padding: 8px 11px;
  color: var(--text);
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  background: var(--panel-soft);
  outline: none;
}
.toolbar input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
.toolbar button {
  padding: 8px 11px;
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--panel);
}
.toolbar button:hover, .toolbar button[aria-pressed="true"] {
  color: var(--accent);
  border-color: var(--accent);
  background: var(--accent-soft);
}

.layout { display: grid; grid-template-columns: 300px minmax(0, 1fr); min-height: calc(100vh - 76px); }
.sidebar {
  position: sticky;
  top: 76px;
  align-self: start;
  height: calc(100vh - 76px);
  overflow: auto;
  padding: 18px 12px 30px;
  border-right: 1px solid var(--border);
  background: var(--panel-soft);
}
.sidebar-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px 10px;
  color: var(--muted);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
}
.file-nav { display: grid; gap: 3px; }
.file-link {
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr) auto;
  align-items: start;
  gap: 7px;
  padding: 9px 8px;
  color: var(--text);
  border: 1px solid transparent;
  border-radius: 8px;
  text-decoration: none;
}
.file-link:hover, .file-link.active { border-color: var(--border); background: var(--panel); }
.file-link.active { box-shadow: inset 3px 0 var(--accent); }
.nav-status {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  color: var(--accent);
  border-radius: 5px;
  background: var(--accent-soft);
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 800;
}
.nav-path { overflow-wrap: anywhere; font-family: var(--mono); font-size: 12px; line-height: 1.45; }
.nav-count { white-space: nowrap; font-family: var(--mono); font-size: 11px; font-style: normal; }
.nav-count b { color: var(--add-text); }
.nav-count i { color: var(--del-text); font-style: normal; }

.content { min-width: 0; padding: 22px 24px 72px; }
.overview {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 18px;
  padding: 14px 16px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--panel);
  box-shadow: var(--shadow);
}
.overview strong { font-size: 16px; }
.pill { padding: 4px 8px; border-radius: 999px; font-family: var(--mono); font-size: 12px; }
.pill.add { color: var(--add-text); background: var(--add-bg); }
.pill.del { color: var(--del-text); background: var(--del-bg); }
.scope { margin-left: auto; color: var(--muted); font-size: 12px; }

.file-card {
  margin: 0 0 20px;
  overflow: clip;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--panel);
  box-shadow: var(--shadow);
}
.file-card[hidden], .file-link[hidden] { display: none; }
.file-card > summary {
  position: sticky;
  top: 76px;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 48px;
  padding: 9px 12px;
  border-bottom: 1px solid var(--border);
  background: var(--panel);
  cursor: pointer;
  list-style: none;
}
.file-card > summary::-webkit-details-marker { display: none; }
.file-card > summary::before { content: "▾"; color: var(--muted); }
.file-card:not([open]) > summary::before { content: "▸"; }
.file-card:not([open]) > summary { border-bottom: 0; }
.file-path { overflow-wrap: anywhere; font-family: var(--mono); font-size: 13px; font-weight: 700; }
.status { padding: 3px 7px; border-radius: 5px; font-size: 11px; font-weight: 800; white-space: nowrap; }
.status-m, .status-r, .status-t { color: #805900; background: var(--replace-bg); }
.status-a, .status-untracked { color: var(--add-text); background: var(--add-bg); }
.status-d { color: var(--del-text); background: var(--del-bg); }
.file-counts { display: flex; gap: 8px; margin-left: auto; font-family: var(--mono); font-size: 12px; font-weight: 700; }
.additions { color: var(--add-text); }
.deletions { color: var(--del-text); }

.table-scroll { overflow-x: auto; }
.diff-table { width: 100%; min-width: 940px; border-collapse: separate; border-spacing: 0; table-layout: fixed; }
.diff-table .number-col { width: 54px; }
.diff-table thead th {
  padding: 8px 12px;
  color: var(--muted);
  border-bottom: 1px solid var(--border);
  background: var(--panel-soft);
  font-size: 11px;
  letter-spacing: .04em;
  text-align: left;
  text-transform: uppercase;
}
.diff-table .new-heading { border-left: 1px solid var(--border-strong); }
.diff-row td { border-bottom: 1px solid color-mix(in srgb, var(--border) 62%, transparent); vertical-align: top; }
.line-no {
  padding: 3px 8px;
  color: var(--muted);
  background: var(--line-no);
  font-family: var(--mono);
  font-size: 11px;
  line-height: 20px;
  text-align: right;
  user-select: none;
}
.new-no { border-left: 1px solid var(--border-strong); }
.code-cell { padding: 3px 10px; }
.code-cell code {
  display: block;
  min-height: 20px;
  white-space: pre;
  font-family: var(--mono);
  font-size: 12px;
  line-height: 20px;
  tab-size: 4;
}
body.wrap-lines .code-cell code { white-space: pre-wrap; overflow-wrap: anywhere; }
.insert-row .new-no, .insert-row .new-code { background: var(--add-bg); }
.delete-row .old-no, .delete-row .old-code { background: var(--del-bg); }
.replace-row .old-no, .replace-row .old-code { background: var(--del-bg); }
.replace-row .new-no, .replace-row .new-code { background: var(--add-bg); }
.replace-row .old-code { border-right: 1px solid var(--border); }
.word-del { color: var(--del-text); background: var(--del-strong); border-radius: 2px; text-decoration: line-through; }
.word-add { color: var(--add-text); background: var(--add-strong); border-radius: 2px; }
.gap-row td { padding: 5px; border-bottom: 1px solid var(--border); background: var(--panel-soft); text-align: center; }
.gap-row button { padding: 3px 12px; color: var(--accent); border: 0; background: transparent; font-size: 12px; }
.gap-row button:hover { text-decoration: underline; }
body.changes-only .context-row, body.changes-only .gap-row { display: none; }
.file-note, .file-message { padding: 12px 16px; color: var(--muted); border-bottom: 1px solid var(--border); background: var(--panel-soft); }
.file-message.error { color: var(--del-text); background: var(--del-bg); }
.empty-state { padding: 70px 20px; color: var(--muted); text-align: center; }
.footer { margin-top: 30px; color: var(--muted); font-size: 11px; text-align: center; }
.footer code { font-family: var(--mono); }

@media (max-width: 980px) {
  .topbar { align-items: flex-start; flex-direction: column; gap: 10px; }
  .toolbar { width: 100%; justify-content: flex-start; overflow-x: auto; }
  .toolbar input { width: 240px; min-width: 200px; }
  .layout { grid-template-columns: 1fr; }
  .sidebar { position: static; height: auto; max-height: 260px; border-right: 0; border-bottom: 1px solid var(--border); }
  .file-nav { grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
  .file-card > summary { top: 127px; }
}

"""


JS = r"""
(() => {
  const body = document.body;
  const filter = document.querySelector('#file-filter');
  const cards = [...document.querySelectorAll('.file-card')];
  const links = [...document.querySelectorAll('.file-link')];
  const visibleCount = document.querySelector('#visible-count');

  const setPressed = (button, pressed) => {
    button.setAttribute('aria-pressed', String(pressed));
  };

  filter?.addEventListener('input', () => {
    const term = filter.value.trim().toLocaleLowerCase();
    let count = 0;
    cards.forEach(card => {
      const visible = !term || card.dataset.path.includes(term);
      card.hidden = !visible;
      if (visible) count += 1;
    });
    links.forEach(link => {
      link.hidden = Boolean(term && !link.dataset.path.includes(term));
    });
    if (visibleCount) visibleCount.textContent = String(count);
  });

  document.querySelector('#changes-only')?.addEventListener('click', event => {
    const pressed = !body.classList.contains('changes-only');
    body.classList.toggle('changes-only', pressed);
    setPressed(event.currentTarget, pressed);
  });

  document.querySelector('#wrap-lines')?.addEventListener('click', event => {
    const pressed = !body.classList.contains('wrap-lines');
    body.classList.toggle('wrap-lines', pressed);
    setPressed(event.currentTarget, pressed);
  });

  document.querySelector('#expand-all')?.addEventListener('click', () => {
    document.querySelectorAll('[data-gap]').forEach(row => { row.hidden = false; });
    document.querySelectorAll('[data-gap-row]').forEach(row => { row.hidden = true; });
    document.querySelectorAll('.file-card').forEach(card => { card.open = true; });
  });

  document.querySelector('#theme-toggle')?.addEventListener('click', () => {
    const root = document.documentElement;
    const current = root.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('diff-review-theme', next); } catch (_) {}
  });

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-expand-gap]');
    if (!button) return;
    const gapId = button.dataset.expandGap;
    document.querySelectorAll(`[data-gap="${gapId}"]`).forEach(row => { row.hidden = false; });
    button.closest('tr')?.remove();
  });

  links.forEach(link => link.addEventListener('click', () => {
    const card = document.getElementById(link.dataset.target);
    if (card) card.open = true;
  }));

  let activeId = cards.find(card => !card.hidden)?.id || '';
  const markActive = id => {
    activeId = id;
    links.forEach(link => link.classList.toggle('active', link.dataset.target === id));
  };
  const observer = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    if (visible[0]) markActive(visible[0].target.id);
  }, { rootMargin: '-90px 0px -70% 0px', threshold: [0, 0.01] });
  cards.forEach(card => observer.observe(card));

  document.addEventListener('keydown', event => {
    if (event.target.matches('input, textarea, select')) return;
    if (event.key === '/') {
      event.preventDefault();
      filter?.focus();
      return;
    }
    if (!['j', 'k'].includes(event.key)) return;
    const visibleCards = cards.filter(card => !card.hidden);
    if (!visibleCards.length) return;
    let index = Math.max(0, visibleCards.findIndex(card => card.id === activeId));
    index += event.key === 'j' ? 1 : -1;
    index = Math.min(visibleCards.length - 1, Math.max(0, index));
    const target = visibleCards[index];
    target.open = true;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    markActive(target.id);
  });

  if (activeId) markActive(activeId);
})();
"""


def render_report(
    root: Path,
    base: str,
    base_commit: str,
    branch: str,
    rendered_files: Sequence[RenderedFile],
    title: str,
    command: str,
    scope: Sequence[str],
) -> str:
    safe_title = html.escape(title)
    total_additions = sum(item.additions for item in rendered_files)
    total_deletions = sum(item.deletions for item in rendered_files)
    generated_at = datetime.now().astimezone().isoformat(timespec="seconds")
    scope_text = ", ".join(scope) if scope else "整个仓库"
    sections = "".join(render_file_section(item) for item in rendered_files)
    navigation = "".join(render_nav_item(item) for item in rendered_files)
    if not rendered_files:
        sections = '<div class="empty-state"><h2>没有检测到修改</h2><p>当前范围与基线一致。</p></div>'

    theme_bootstrap = """
<script>
try {
  const saved = localStorage.getItem('diff-review-theme');
  if (saved) document.documentElement.dataset.theme = saved;
} catch (_) {}
</script>
"""
    return f"""<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{safe_title}</title>
{theme_bootstrap}
<style>{CSS}</style>
</head>
<body class="wrap-lines">
<header class="topbar">
  <div class="brand">
    <h1>{safe_title}</h1>
    <div class="meta">
      <span>仓库 <code>{html.escape(root.name)}</code></span>
      <span>分支 <code>{html.escape(branch or "detached")}</code></span>
      <span>基线 <code>{html.escape(base)} · {html.escape(base_commit[:10])}</code></span>
      <span>{html.escape(generated_at)}</span>
    </div>
  </div>
  <div class="toolbar">
    <input id="file-filter" type="search" placeholder="筛选文件，按 / 聚焦" aria-label="筛选文件">
    <button id="changes-only" type="button" aria-pressed="false">只看改动</button>
    <button id="expand-all" type="button">展开全部</button>
    <button id="wrap-lines" type="button" aria-pressed="true">自动换行</button>
    <button id="theme-toggle" type="button">切换主题</button>
  </div>
</header>
<div class="layout">
  <aside class="sidebar">
    <div class="sidebar-heading"><span>文件</span><span><b id="visible-count">{len(rendered_files)}</b> / {len(rendered_files)}</span></div>
    <nav class="file-nav">{navigation}</nav>
  </aside>
  <main class="content">
    <div class="overview">
      <strong>{len(rendered_files)} 个文件</strong>
      <span class="pill add">+{total_additions}</span>
      <span class="pill del">−{total_deletions}</span>
      <span class="scope">范围：{html.escape(scope_text)}</span>
    </div>
    {sections}
    <div class="footer">由 <code>tools/diff-review/generate.py</code> 生成 · 命令：<code>{html.escape(command)}</code></div>
  </main>
</div>
<script>{JS}</script>
</body>
</html>
"""


def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate a standalone side-by-side HTML page for Git changes."
    )
    parser.add_argument("paths", nargs="*", help="只审查这些仓库相对路径")
    parser.add_argument("--repo", default=".", help="Git 仓库或其子目录，默认当前目录")
    parser.add_argument("--base", default="HEAD", help="比较基线，默认 HEAD")
    parser.add_argument("--output", default=DEFAULT_OUTPUT, help="输出 HTML 路径")
    parser.add_argument("--title", default="Git 修改审查", help="页面标题")
    parser.add_argument("--context", type=int, default=4, help="每处改动显示的上下文行数")
    parser.add_argument(
        "--exclude",
        action="append",
        default=[],
        metavar="GLOB",
        help="排除匹配的路径，可重复使用",
    )
    parser.add_argument(
        "--no-untracked",
        action="store_true",
        help="不包含未跟踪文件",
    )
    args = parser.parse_args(argv)
    if args.context < 0:
        parser.error("--context 不能小于 0")
    return args


def generate(args: argparse.Namespace, argv: Sequence[str]) -> tuple[Path, int, int, int]:
    root = find_repo_root(Path(args.repo))
    base_commit = verify_base(root, args.base)
    specs = collect_change_specs(
        root=root,
        base=args.base,
        paths=args.paths,
        include_untracked=not args.no_untracked,
        excludes=args.exclude,
    )
    changes = [load_file_change(root, args.base, spec) for spec in specs]
    rendered = [render_file(change, args.context) for change in changes]

    branch = run_git(root, "branch", "--show-current").stdout.decode("utf-8").strip()
    command = shlex.join(["python3", "tools/diff-review/generate.py", *argv])
    report = render_report(
        root=root,
        base=args.base,
        base_commit=base_commit,
        branch=branch,
        rendered_files=rendered,
        title=args.title,
        command=command,
        scope=args.paths,
    )

    output = Path(args.output)
    if not output.is_absolute():
        output = root / output
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(report, encoding="utf-8")
    additions = sum(item.additions for item in rendered)
    deletions = sum(item.deletions for item in rendered)
    return output, len(rendered), additions, deletions


def main(argv: Sequence[str] | None = None) -> int:
    actual_argv = list(argv if argv is not None else sys.argv[1:])
    try:
        args = parse_args(actual_argv)
        output, files, additions, deletions = generate(args, actual_argv)
    except (OSError, RuntimeError) as error:
        print(f"error: {error}", file=sys.stderr)
        return 1

    print(f"Generated {output}")
    print(f"Files: {files}; additions: {additions}; deletions: {deletions}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
