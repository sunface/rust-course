#!/usr/bin/env python3
"""mdBook preprocessor for the EPUB/PDF build (see book.toml in this directory).

1. Chapters link to each other with absolute URLs of the online book, e.g.
   `https://beatai.org/rust-course/basic/ownership/ownership#拷贝浅拷贝`. In an
   e-book these should jump inside the book instead of opening a browser, so
   rewrite them to relative Markdown links (`../ownership/ownership.md#拷贝浅拷贝`),
   which mdbook-pandoc resolves to internal references. Only link destinations
   are rewritten (`[text](url)`, `[ref]: url`, `href="url"`); URLs that do not
   map to a chapter file are left untouched.

2. A few chapters (e.g. about-book.md) do not start with a heading. On the
   website the page title comes from SUMMARY.md, but in the e-book such a
   chapter would have no title and no entry in the table of contents, so
   insert its SUMMARY.md name as the heading.
"""

import json
import os
import re
import sys
from pathlib import Path

SITES = ("https://beatai.org/rust-course", "https://course.rs")

URL = re.compile(
    r"(?P<lead>\]\(\s*<?|^\s*\[[^\]]+\]:\s*<?|href=[\"'])"
    r"(?P<url>(?:" + "|".join(re.escape(s) for s in SITES) + r")(?P<path>/[^\s)\"'<>#?]*)?"
    r"(?:\?[^\s)\"'<>#]*)?(?P<frag>#[^\s)\"'<>]*)?)",
    re.MULTILINE,
)

LEADING_HEADING = re.compile(r"\A﻿?\s*#{1,6}\s")


def chapter_file(src: Path, path: str):
    path = path.strip("/")
    if path.endswith(".html"):
        path = path[: -len(".html")]
    if path in ("", "index"):
        return None
    for candidate in (f"{path}.md", f"{path}/index.md", f"{path}/intro.md"):
        if (src / candidate).is_file():
            return candidate
    return None


def rewrite_links(content: str, chapter: str, src: Path) -> str:
    here = os.path.dirname(chapter)

    def repl(m):
        target = chapter_file(src, m.group("path") or "")
        if target is None:
            return m.group(0)
        rel = os.path.relpath(target, here or ".")
        return m.group("lead") + rel + (m.group("frag") or "")

    return URL.sub(repl, content)


def ensure_title(content: str, name: str) -> str:
    if LEADING_HEADING.match(content) or not name:
        return content
    return f"# {name}\n\n{content}"


def walk(node, src: Path):
    if isinstance(node, dict):
        chapter = node.get("source_path") or node.get("path")
        if isinstance(node.get("content"), str) and isinstance(chapter, str):
            content = rewrite_links(node["content"], chapter, src)
            node["content"] = ensure_title(content, node.get("name", ""))
        for value in node.values():
            walk(value, src)
    elif isinstance(node, list):
        for value in node:
            walk(value, src)


def main():
    if len(sys.argv) > 1 and sys.argv[1] == "supports":
        sys.exit(0)
    context, book = json.load(sys.stdin)
    root = Path(context["root"])
    src = root / context["config"]["book"].get("src", "src")
    walk(book, src)
    json.dump(book, sys.stdout, ensure_ascii=False)


if __name__ == "__main__":
    main()
