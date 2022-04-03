# 下载并构建 Package

如果看中 `GitHub` 上的某个开源 Rust 项目，那下载并构建它将是非常简单的。

```shell
$ git clone https://github.com/rust-lang/regex.git
$ cd regex
```

如上所示，直接从 `GitHub` 上克隆下来想要的项目，然后使用 `cargo build` 进行构建即可：

```shell
$ cargo build
   Compiling regex v1.5.0 (file:///path/to/package/regex)
```

该命令将下载相关的依赖库，等下载成功后，再对 `package` 和下载的依赖进行一同的编译构建。

这就是包管理工具的强大之处，`cargo build` 搞定一切，而背后隐藏的复杂配置、参数你都无需关心。

