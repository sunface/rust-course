# EPUB / PDF 电子书

本目录用 [mdbook-pandoc](https://github.com/max-heller/mdbook-pandoc) 把整本书渲染为 EPUB 和 PDF。
配置与网站（根目录的 `book.toml`）分开，网站的构建不需要安装下面这些工具。

| 文件 | 作用 |
| --- | --- |
| `book.toml` | 电子书的 mdBook 配置（EPUB、PDF 两个 pandoc profile） |
| `preprocess.py` | mdBook 预处理器：把 `https://beatai.org/rust-course/...` 形式的章节链接改成书内跳转；为没有标题的章节补上 SUMMARY 中的标题 |
| `filters.lua` | pandoc 过滤器：清理 HTML 空白、限制图片宽度、让长代码/URL 可以换行、修正失效的书内链接 |
| `header.tex` | PDF 的 LaTeX 导言：中文（luatexja）、代码块换行与底色、目录等 |

## 本地构建

需要：

- [mdBook](https://github.com/rust-lang/mdBook) 0.5+
- mdbook-pandoc 0.11+：`cargo install mdbook-pandoc --locked`
- [pandoc](https://pandoc.org/installing.html) 3.x（发行版自带的版本可能过旧，建议用官方 release）
- Python 3
- 仅 PDF 需要：TeX Live（LuaLaTeX、luatexja（在 `texlive-lang-japanese` 里，中文排版也用它）、fvextra、framed）以及 Noto Serif/Sans、Noto CJK SC、Noto Color Emoji、DejaVu 字体。
  Debian/Ubuntu：

  ```sh
  sudo apt-get install texlive-luatex texlive-latex-recommended texlive-latex-extra texlive-lang-japanese lmodern \
      fonts-noto-core fonts-noto-cjk fonts-noto-color-emoji fonts-dejavu
  ```

然后在仓库根目录执行：

```sh
mdbook build ci/ebook
```

产物位于 `ci/ebook/book/epub/rust-course.epub` 和 `ci/ebook/book/pdf/rust-course.pdf`（不放在根目录的 `book/` 下，因为构建网站时 mdbook 会清空那个目录）。
书中的图片大多是外链，构建时会联网下载；下载失败的图片会被替换为其描述文字。
