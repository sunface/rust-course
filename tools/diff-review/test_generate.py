from __future__ import annotations

import importlib.util
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


MODULE_PATH = Path(__file__).with_name("generate.py")
SPEC = importlib.util.spec_from_file_location("diff_review_generate", MODULE_PATH)
assert SPEC is not None and SPEC.loader is not None
generate = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = generate
SPEC.loader.exec_module(generate)


def git(root: Path, *args: str) -> None:
    subprocess.run(
        ["git", "-C", str(root), *args],
        check=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )


class DiffReviewTests(unittest.TestCase):
    def test_inline_diff_highlights_chinese_change(self) -> None:
        old, new = generate.inline_diff("只更新错误内容", "只修正错误内容")
        self.assertIn('class="word-del"', old)
        self.assertIn('class="word-add"', new)
        self.assertIn("更新", old)
        self.assertIn("修正", new)

    def test_long_context_is_collapsed(self) -> None:
        old = [f"line {index}" for index in range(20)]
        new = old.copy()
        new[10] = "changed"
        rows, additions, deletions = generate.build_diff_rows(old, new, context=2)

        self.assertEqual(additions, 1)
        self.assertEqual(deletions, 1)
        self.assertTrue(any(row.kind == "gap" for row in rows))
        self.assertTrue(any(row.hidden for row in rows))
        self.assertTrue(any(row.kind == "replace" for row in rows))

    def test_generates_report_for_tracked_and_untracked_files(self) -> None:
        with tempfile.TemporaryDirectory(prefix="diff-review-test-") as directory:
            root = Path(directory)
            git(root, "init", "-q")
            git(root, "config", "user.email", "test@example.com")
            git(root, "config", "user.name", "Diff Review Test")

            chapter = root / "chapter.md"
            chapter.write_text("# 标题\n\n旧内容\n", encoding="utf-8")
            git(root, "add", "chapter.md")
            git(root, "commit", "-q", "-m", "initial")

            chapter.write_text("# 标题\n\n新内容 <safe>\n", encoding="utf-8")
            (root / "notes.md").write_text("新增文件\n", encoding="utf-8")
            output = root / "report.html"
            argv = ["--repo", str(root), "--output", str(output)]
            args = generate.parse_args(argv)
            result, files, additions, deletions = generate.generate(args, argv)

            self.assertEqual(result, output)
            self.assertEqual(files, 2)
            self.assertGreaterEqual(additions, 2)
            self.assertGreaterEqual(deletions, 1)
            page = output.read_text(encoding="utf-8")
            self.assertIn("chapter.md", page)
            self.assertIn("notes.md", page)
            self.assertIn("&lt;safe&gt;", page)
            self.assertNotIn("<safe>", page)
            self.assertIn('<body class="wrap-lines">', page)


if __name__ == "__main__":
    unittest.main()
