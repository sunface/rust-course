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

3. Most images are hosted elsewhere (zhimg.com, GitHub, ...) and pandoc tries
   to fetch each of them only once; a network hiccup silently replaces the
   image with its alt text. Download them here instead, with retries, into a
   cache directory that survives between builds (EBOOK_IMAGE_CACHE, default
   ci/ebook/.image-cache; the CI workflow caches it too), and point the book
   at the local copies. Images that still cannot be fetched keep their URL,
   so pandoc gets one more try.
"""

import hashlib
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

SITES = ("https://beatai.org/rust-course", "https://course.rs")

URL = re.compile(
    r"(?P<lead>\]\(\s*<?|^\s*\[[^\]]+\]:\s*<?|href=[\"'])"
    r"(?P<url>(?:" + "|".join(re.escape(s) for s in SITES) + r")(?P<path>/[^\s)\"'<>#?]*)?"
    r"(?:\?[^\s)\"'<>#]*)?(?P<frag>#[^\s)\"'<>]*)?)",
    re.MULTILINE,
)

LEADING_HEADING = re.compile(r"\A\ufeff?\s*#{1,6}\s")

IMAGE_URL = re.compile(
    r"(?P<lead>!\[[^\]]*\]\(\s*<?|<img\b[^>]*?\bsrc\s*=\s*[\"'])"
    r"(?P<url>https?://[^\s)\"'<>]+)",
    re.IGNORECASE,
)

USER_AGENT = "rust-course-ebook/1.0 (+https://github.com/sunface/rust-course)"
ATTEMPTS = 4  # waits 1s, 2s, 4s between attempts
TIMEOUT = 30  # seconds per attempt


# --- 1. links to the online book -------------------------------------------

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


# --- 2. chapter titles -------------------------------------------------------

def ensure_title(content: str, name: str) -> str:
    if LEADING_HEADING.match(content) or not name:
        return content
    return f"# {name}\n\n{content}"


# --- 3. remote images --------------------------------------------------------

def image_type(data: bytes):
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return "png"
    if data.startswith(b"\xff\xd8\xff"):
        return "jpg"
    if data.startswith((b"GIF87a", b"GIF89a")):
        return "gif"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "webp"
    head = data[:512].lstrip().lower()
    if head.startswith(b"<svg") or (head.startswith(b"<?xml") and b"<svg" in head):
        return "svg"
    return None


def fetch_image(url: str, cache: Path):
    """Return (cached file, downloaded now?) for `url`, or (error, False)."""
    key = hashlib.sha256(url.encode()).hexdigest()[:32]
    for cached in cache.glob(key + ".*"):
        if cached.suffix != ".part":
            return cached, False
    error = None
    for attempt in range(ATTEMPTS):
        if attempt:
            time.sleep(2 ** (attempt - 1))
        try:
            req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
                data = resp.read()
        except urllib.error.HTTPError as e:
            error = f"HTTP {e.code}"
            if e.code in (404, 410):
                break  # gone for good, retrying won't help
            continue
        except Exception as e:  # timeouts, resets, DNS failures, ...
            error = str(e) or type(e).__name__
            continue
        ext = image_type(data)
        if ext is None:
            error = "response is not an image"
            break
        path = cache / f"{key}.{ext}"
        tmp = cache / f"{key}.part"
        tmp.write_bytes(data)
        tmp.replace(path)
        return path, True
    return error, False


def collect_strings(node, out):
    if isinstance(node, dict):
        if isinstance(node.get("content"), str):
            out.append(node["content"])
        for value in node.values():
            collect_strings(value, out)
    elif isinstance(node, list):
        for value in node:
            collect_strings(value, out)
    return out


def localize_images(book, root: Path):
    """Download all remote images; return a function rewriting their URLs."""
    cache = Path(os.environ.get("EBOOK_IMAGE_CACHE") or root / ".image-cache").resolve()
    cache.mkdir(parents=True, exist_ok=True)

    urls = sorted({m.group("url") for text in collect_strings(book, [])
                   for m in IMAGE_URL.finditer(text)})
    with ThreadPoolExecutor(max_workers=8) as pool:
        results = dict(zip(urls, pool.map(lambda u: fetch_image(u, cache), urls)))

    local = {u: r.as_uri() for u, (r, _) in results.items() if isinstance(r, Path)}
    downloaded = sum(1 for _, new in results.values() if new)
    failed = {u: r for u, (r, _) in results.items() if not isinstance(r, Path)}
    print(f"[ebook] images: {len(urls)} remote, {len(local) - downloaded} from cache, "
          f"{downloaded} downloaded, {len(failed)} failed ({cache})", file=sys.stderr)
    for url, error in failed.items():
        print(f"[ebook]   could not fetch {url}: {error}", file=sys.stderr)

    def rewrite(content: str) -> str:
        def repl(m):
            uri = local.get(m.group("url"))
            return m.group("lead") + uri if uri else m.group(0)
        return IMAGE_URL.sub(repl, content)

    return rewrite


# -----------------------------------------------------------------------------

def walk(node, src: Path, images):
    if isinstance(node, dict):
        chapter = node.get("source_path") or node.get("path")
        if isinstance(node.get("content"), str) and isinstance(chapter, str):
            content = rewrite_links(node["content"], chapter, src)
            content = images(content)
            node["content"] = ensure_title(content, node.get("name", ""))
        for value in node.values():
            walk(value, src, images)
    elif isinstance(node, list):
        for value in node:
            walk(value, src, images)


def main():
    if len(sys.argv) > 1 and sys.argv[1] == "supports":
        sys.exit(0)
    context, book = json.load(sys.stdin)
    root = Path(context["root"])
    src = root / context["config"]["book"].get("src", "src")
    walk(book, src, localize_images(book, root))
    json.dump(book, sys.stdout, ensure_ascii=False)


if __name__ == "__main__":
    main()
