#!/usr/bin/env python3
"""Audit and test the chapters in “Rust 语言基础学习”."""

from __future__ import annotations

import argparse
import collections
import os
import re
import subprocess
import sys
import tempfile
import tomllib
from dataclasses import dataclass
from pathlib import Path


BOOK_ROOT = Path(__file__).resolve().parents[2]
SUMMARY_PATH = BOOK_ROOT / "src" / "SUMMARY.md"
CHAPTER_PREFIXES = ("first-try/", "basic/", "basic-practice/")
CHAPTER_RE = re.compile(r"^\s*-\s+\[([^]]+)]\(([^)]+)\)")
FENCE_RE = re.compile(r"^\s*(`{3,})(.*)$")


@dataclass(frozen=True)
class Chapter:
    title: str
    relative_path: str

    @property
    def path(self) -> Path:
        return BOOK_ROOT / "src" / self.relative_path


def read_chapters() -> list[Chapter]:
    chapters: list[Chapter] = []

    for line in SUMMARY_PATH.read_text(encoding="utf-8").splitlines():
        match = CHAPTER_RE.match(line)
        if match is None:
            continue

        title, relative_path = match.groups()
        relative_path = relative_path.split("#", maxsplit=1)[0]
        if relative_path.startswith(CHAPTER_PREFIXES):
            chapters.append(Chapter(title, relative_path))

    missing = [chapter.relative_path for chapter in chapters if not chapter.path.is_file()]
    if missing:
        paths = "\n".join(f"- {path}" for path in missing)
        raise RuntimeError(f"SUMMARY.md references missing chapters:\n{paths}")

    return chapters


def fence_types(chapter: Chapter) -> collections.Counter[str]:
    counts: collections.Counter[str] = collections.Counter()
    opening_length: int | None = None

    for line in chapter.path.read_text(encoding="utf-8").splitlines():
        match = FENCE_RE.match(line)
        if match is None:
            continue

        marker, info = match.groups()
        if opening_length is None:
            opening_length = len(marker)
            counts[info.strip() or "plain"] += 1
        elif len(marker) >= opening_length and not info.strip():
            opening_length = None

    return counts


def audit(chapters: list[Chapter]) -> int:
    totals: collections.Counter[str] = collections.Counter()

    for chapter in chapters:
        counts = fence_types(chapter)
        totals.update(counts)
        details = ", ".join(f"{name}={count}" for name, count in sorted(counts.items()))
        print(f"{chapter.relative_path}: {details or 'no code fences'}")

    print()
    print(f"Chapters: {len(chapters)}")
    print(f"Code fences: {sum(totals.values())}")
    for name, count in sorted(totals.items()):
        print(f"  {name}: {count}")

    return 0


def test(chapters: list[Chapter], summary_only: bool) -> int:
    failed: list[Chapter] = []
    environment = os.environ.copy()
    with (BOOK_ROOT / "rust-toolchain.toml").open("rb") as toolchain_file:
        configured_toolchain = tomllib.load(toolchain_file)["toolchain"]["channel"]
    environment.setdefault("RUSTUP_TOOLCHAIN", configured_toolchain)
    environment.setdefault("RUST_TEST_THREADS", "1")

    print(f"Toolchain: {environment['RUSTUP_TOOLCHAIN']}")

    with tempfile.TemporaryDirectory(prefix="rust-course-basic-") as destination:
        for chapter in chapters:
            result = subprocess.run(
                ["mdbook", "test", "-d", destination, "-c", chapter.title],
                cwd=BOOK_ROOT,
                check=False,
                capture_output=True,
                encoding="utf-8",
                env=environment,
                errors="replace",
            )

            if result.returncode == 0:
                print(f"PASS {chapter.relative_path}", flush=True)
                continue

            failed.append(chapter)
            print(f"FAIL {chapter.relative_path}", flush=True)
            if not summary_only:
                sys.stdout.write(result.stdout)
                sys.stderr.write(result.stderr)

    print()
    print(f"Chapters: {len(chapters)}; passed: {len(chapters) - len(failed)}; failed: {len(failed)}")
    for chapter in failed:
        print(f"- {chapter.relative_path}")

    return 1 if failed else 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--audit", action="store_true", help="list chapters and code fence types")
    parser.add_argument("--chapter", action="append", default=[], help="test matching title or path")
    parser.add_argument("--summary-only", action="store_true", help="hide individual rustdoc errors")
    args = parser.parse_args()

    chapters = read_chapters()
    if args.chapter:
        chapters = [
            chapter
            for chapter in chapters
            if any(needle in chapter.title or needle in chapter.relative_path for needle in args.chapter)
        ]
        if not chapters:
            parser.error("no chapter matched --chapter")

    if args.audit:
        return audit(chapters)
    return test(chapters, args.summary_only)


if __name__ == "__main__":
    raise SystemExit(main())
