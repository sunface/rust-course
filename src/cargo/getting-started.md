# 上手使用

Cargo 会在安装 Rust 的时候一并进行安装，无需我们手动的操作执行，安装 Rust 参见[这里](https://course.rs/first-try/installation.html)。

在开始之前，先来明确一个名词: `Package`，由于 `Crate` 被翻译成包，因此 `Package` 再被翻译成包就很不合适，经过斟酌，我们决定翻译成项目，你也可以理解为工程、软件包，总之，在本书中`Package` 意味着项目，而项目也意味着 `Package` 。

安装完成后，接下来使用 `Cargo` 来创建一个新的[二进制项目](https://course.rs/basic/crate-module/crate.html)，二进制意味着该项目可以作为一个服务运行或被编译成可执行文件运行。

```rust
$ cargo new hello_world
```

这里我们使用 `cargo new` 创建一个新的项目 ，事实上该命令等价于 `cargo new hello_world --bin`，`bin` 是 `binary` 的简写，代表着二进制程序，由于 `--bin` 是默认参数，因此可以对其进行省略。

创建成功后，先来看看项目的基本目录结构长啥样：

```shell
$ cd hello_world
$ tree .
.
├── Cargo.toml
└── src
    └── main.rs

1 directory, 2 files
```

这里有一个很显眼的文件 `Cargo.toml`，一看就知道它是 `Cargo` 使用的配置文件，这个关系类似于： `package.json` 是 `npm` 的配置文件。

```toml
[package]
name = "hello_world"
version = "0.1.0"
edition = "2021"

[dependencies]
```

以上就是 `Cargo.toml` 的全部内容，它被称之为清单( manifest )，包含了 `Cargo` 编译程序所需的所有元数据。

下面是 `src/main.rs` 的内容 ：

```rust
fn main() {
    println!("Hello, world!");
}
```

可以看出 `Cargo` 还为我们自动生成了一个 `hello world` 程序，或者说[二进制包](https://course.rs/basic/crate-module/crate.html)，对程序进行编译构建：

```shell
$ cargo build
   Compiling hello_world v0.1.0 (file:///path/to/package/hello_world)
```

然后再运行编译出的二进制可执行文件:

```shell
$ ./target/debug/hello_world
Hello, world!
```

注意到路径中的 `debug` 了吗？它说明我们刚才的编译是 `Debug` 模式，该模式主要用于测试目的，如果想要进行生产编译，我们需要使用 `Release` 模式 `cargo build --release`，然后通过 `./target/release/hello_world` 运行。

除了上面的编译 + 运行方式外，在日常开发中，我们还可以使用一个简单的命令直接运行:

```shell
$ cargo run
     Fresh hello_world v0.1.0 (file:///path/to/package/hello_world)
   Running `target/hello_world`
Hello, world!
```

`cargo run` 会帮我们自动完成编译、运行的过程，当然，该命令也支持 `Release` 模式: `cargo run --release`。

> 如果你的程序在跑性能测试 benchmark，一定要使用 `Release` 模式，因为该模式下，程序会做大量性能优化

在快速了解 `Cargo` 的使用方式后，下面，我们将正式进入 Cargo 的学习之旅。

