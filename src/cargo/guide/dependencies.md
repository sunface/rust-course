# 添加依赖

[`crates.io`](https://crates.io) 是 Rust 社区维护的中心化注册服务，用户可以在其中寻找和下载所需的包。对于 `cargo` 来说，默认就是从这里下载依赖。

下面我们来添加一个 `time` 依赖包，若你的 `Cargo.toml` 文件中没有 `[dependencies]` 部分，就手动添加一个，并添加目标包名和版本号:

```toml
[dependencies]
time = "0.1.12"
```

可以看到我们指定了 `time` 包的版本号 "0.1.12"，关于版本号，实际上还有其它的指定方式，具体参见[指定依赖项](https://course.rs/cargo/reference/specify-deps.html)章节。

如果想继续添加 `regexp` 包，只需在 `time` 包后面添加即可 :

```toml
[package]
name = "hello_world"
version = "0.1.0"
edition = "2021"

[dependencies]
time = "0.1.12"
regex = "0.1.41"
```

此时，再通过运行 `cargo build` 来重新构建，首先 `Cargo` 会获取新的依赖以及依赖的依赖, 接着对它们进行编译并更新 `Cargo.lock`:

```shell
$ cargo build
      Updating crates.io index
   Downloading memchr v0.1.5
   Downloading libc v0.1.10
   Downloading regex-syntax v0.2.1
   Downloading memchr v0.1.5
   Downloading aho-corasick v0.3.0
   Downloading regex v0.1.41
     Compiling memchr v0.1.5
     Compiling libc v0.1.10
     Compiling regex-syntax v0.2.1
     Compiling memchr v0.1.5
     Compiling aho-corasick v0.3.0
     Compiling regex v0.1.41
     Compiling hello_world v0.1.0 (file:///path/to/package/hello_world)
```

在 `Cargo.lock` 中包含了我们项目使用的所有依赖的准确版本信息。这个非常重要，未来就算 `regexp` 的作者升级了该包，我们依然会下载 `Cargo.lock` 中的版本，而不是最新的版本，只有这样，才能保证项目依赖包不会莫名其妙的因为更新升级导致无法编译。 当然，你还可以使用 `cargo update` 来手动更新包的版本。

此时，就可以在 `src/main.rs` 中使用新引入的 `regexp` 包:

```rust,ignore,mdbook-runnable
use regex::Regex;

fn main() {
    let re = Regex::new(r"^\d{4}-\d{2}-\d{2}$").unwrap();
    println!("Did our date match? {}", re.is_match("2014-01-01"));
}
```

运行后输出:

```shell
$ cargo run
   Running `target/hello_world`
Did our date match? true
```
