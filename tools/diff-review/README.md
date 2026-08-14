# Git 修改审查页

把 Git 修改生成为单文件、可离线打开的并排对比网页，方便逐文件审查书稿和代码变更。

## 使用

在仓库根目录执行：

```console
$ python3 tools/diff-review/generate.py
```

默认比较 `HEAD` 与当前工作区，包含已暂存、未暂存和未跟踪文件。生成结果位于：

```text
tools/diff-review/output/index.html
```

只审查指定目录：

```console
$ python3 tools/diff-review/generate.py --title "Rust 基础阶段 1" -- docs/plan src/first-try
```

选择其它基线、调整上下文行数或输出位置：

```console
$ python3 tools/diff-review/generate.py \
    --base main \
    --context 5 \
    --output tools/diff-review/output/rust-basic.html
```

不显示未跟踪文件：

```console
$ python3 tools/diff-review/generate.py --no-untracked
```

排除特定路径时可重复使用 `--exclude`：

```console
$ python3 tools/diff-review/generate.py \
    --exclude 'book/**' \
    --exclude '*.lock'
```

## 页面功能

- 文件导航、路径筛选和增删行统计。
- 旧内容与新内容逐行并排展示。
- 行内字符级变化高亮，中文也能准确标出改动位置。
- 大段未修改内容自动折叠，可按需展开。
- 支持只看改动、自动换行和明暗主题。
- 支持 `j`、`k` 切换文件，按 `/` 聚焦文件筛选框。
- HTML 内嵌全部样式与脚本，不依赖 CDN 或本地服务。

## 本地预览

通常直接用浏览器打开生成的 HTML 即可。如果浏览器限制本地文件，可以启动一个临时静态服务：

```console
$ python3 -m http.server 4173 --directory tools/diff-review/output
```

然后访问 `http://127.0.0.1:4173/`。

## 测试

```console
$ python3 -m unittest tools/diff-review/test_generate.py
```
