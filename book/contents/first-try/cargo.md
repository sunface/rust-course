## 认识Cargo

但凡经历过 C/C++、Go 语言 1.10 版本之前的用户都知道，一个好的包管理工具有多么的重要！！我那个时候是如此的渴望类似 `nodejs` 的 `npm `包管理工具，但是却求而不得，包管理工具最重要的意义就是**任何用户拿到你的代码，都能运行起来**"，而不会因为各种包版本依赖焦头烂额，Go 语言在 1.10 版本之前，所有的包都是在 `github.com` 下存放，导致了所有的项目都公用一套依赖代码，在本地项目复杂后，这简直是一种灾难。

说多了都是泪，笔者目前还有一个早期 Go 的项目(15年写的)，用到了 `iris` (一个坑爹HTTP服务)，结果现在运行不起来了，因为找不到 `iris` 当时的那个版本！！

作为一门现代化语言，`Rust` 吸收了多个语言的包管理优点，为大家提供超级大杀器： `cargo`，真的，再挑剔的开发者，都对它赞不绝口。

总而言之，`cargo` 提供了一系列的工具，从项目的建立、构建到测试、运行直至部署，为 Rust 项目的管理提供尽可能完整的手段，同时，与 Rust 语言及其编译器 `rustc` 紧密结合，可以说用了后就忘不掉，如同初恋般的感觉。


## 创建一个"你好,世界"项目

又见"你好,世界"，肯定有读者在批评了：你就不能有点创意吗？"世界,你好"难道不配？你是读者，你说了算，那我们就来创建一个"世界，你好"。

上文提到，Rust 语言的包管理工具是 `cargo`，好在，我们无需手动安装，在之前安装Rust的时候，就一并安装，如果你在终端无法使用这个命令，考虑一下 `环境变量` 是否正确的设置：把 `cargo` 可执行文件所在的目录添加到环境变量中。

终于到了紧张刺激的 new new new 环节:
```console
$ cargo new world_hello
```

上面的命令使用 `cargo new` 创建一个项目，项目名是 `world_hello` (向读者势力低头的项目名称，泪奔)，该项目的结构和配置文件都是由 `cargo` 生成，意味着**我们的项目被 `cargo` 所管理**。

早期的 `cargo` 在创建项目时，必须添加 `--bin` 的参数，如下所示：
```console
$ cargo new world_hello --bin
```

现在的版本，已经无需此参数，`cargo` 默认就创建 `bin` 类型的项目，顺便说一句，Rust 项目主要分为两个类型：`bin` 和 `lib`，前者是一个可运行的项目，后者是一个依赖库项目。

下面来看看创建的项目结构：
```console
.
├── .git
├── .gitignore
├── Cargo.toml
└── src
    └── main.rs

```

是的，连 `git` 都给你创建了，不仅令人感叹，不是女儿，胜似女儿，比小棉袄还体贴。

## 运行项目
有两种方式可以运行项目，先来看看第一种.

#### cargo run
一码胜似千言:
```console
$ cargo run
   Compiling world_hello v0.1.0 (/Users/sunfei/development/rust/world_hello)
    Finished dev [unoptimized + debuginfo] target(s) in 0.43s
     Running `target/debug/world_hello`
Hello, world!
```

好了，你已经看到程序的输出: `"Hello, world"`, 可能有读者不愿意了，说好了"世界，你好"呢? 别急，在下一节，我们再对代码进行修改。认真想来，"你好，世界“强调的是我对世界说你好，而"世界,你好“是世界对我说你好，明显是后者更有包容性和国际范儿，读者真·好眼光。

上述代码，`cargo run` 首先对项目进行编译，然后再运行，因此它实际上等同于运行了两个指令，如同我们下面将做的：

#### 手动编译和运行项目

编译
```console
$ cargo build
    Finished dev [unoptimized + debuginfo] target(s) in 0.00s
```

运行
```console
$ ./target/debug/world_hello 
Hello, world!
```

行云流水，但谈不上一气呵成。 细心的读者可能已经发现，在调用的时候，路径 `./target/debug/world_hello` 中有一个明晃晃的 `debug` 字段，没错我们运行的是 `debug` 模式，在这种模式下，**代码的编译速度会非常快**，可是福兮祸所依，**运行速度就慢了**. 原因是，在 `debug` 模式下，Rust 编译器不会做任何的优化，只为了尽快的编译完成，让你的开发流程更加顺畅。

作为尊贵的读者，咱自然可以要求更多，比如你想要高性能的代码怎么办？ 简单，添加 `--release` 来编译：
- `cargo run --release`
- `cargo build --release`

运行我们的高性能 `relese` 程序：

```console
$ ./target/release/world_hello 
Hello, world!
```

## cargo check
当项目大了后，`cargo run` 和 `cargo build` 不可避免的会变慢，那么有没有更快的方式来验证代码的正确性呢？大杀器来了，接着！

`cargo check` 是我们在代码开发过程中最常用的命令，它的作用很简单：快速的检查一下代码能否编译通过。因此该命令速度会非常快，能节省大量的编译时间。

```console
$ cargo check
    Checking world_hello v0.1.0 (/Users/sunfei/development/rust/world_hello)
    Finished dev [unoptimized + debuginfo] target(s) in 0.06s
```

> Rust 虽然编译速度还行，但是还是不能 Go 语言相提并论，因为 Rust 需要做很多复杂的编译优化和语言特性解析, 甚至连如何优化编译速度都成了一门学问：[优化编译速度](../compiler/speed-up.md)


## Cargo.toml 和 Cargo.lock

`Cargo.toml` 和 `Cargo.lock` 是 `cargo` 的核心文件，它的所有活动均基于此二者。

`Cargo.toml` 是 `cargo` 特有的项目数据描述文件，存储了项目的所有元配置信息，如果 Rust 开发者希望 Rust 项目能够按照期望的方式进行构建、测试和运行，那么，必须按照合理的方式构建 `Cargo.toml`。

`Cargo.lock` 文件是 `cargo` 工具根据同一项目的 `toml` 文件生成的项目依赖详细清单，因此我们一般不用修改它，只需要对着 `Cargo.toml` 文件撸就行了。

> 什么情况下该把 `Cargo.lock` 上传到 git仓库里？很简单，当你的项目是一个可运行的程序时，就上传 `Cargo.lock`，如果是一个依赖库项目，那么请把它添加到 `.gitignore` 中

现在用 VSCode 打开上面创建的"世界，你好"项目，然后进入根目录的 `Cargo.toml` 文件，该文件包含不少信息。

#### package配置段落
`package` 中记录了项目的描述信息，典型的如下：

```toml
[package]
name = "world_hello"
version = "0.1.0"
edition = "2021"
```

`name` 字段定义了项目名称，`version` 字段定义当前版本，新项目默认是 `0.1.0`，`edition` 字段定义了我们使用的 Rust 大版本，因为本书很新(不仅仅是现在新，未来也将及时修订，跟得上 Rust 的小步伐)，所以使用的是 `Rust edition 2021` 大版本，详情见[Rust版本详解](../appendix/rust-version.md).


#### 定义项目依赖

使用 `cargo` 工具的最大优势就在于，能够对该项目的各种依赖项进行方便、统一和灵活的管理。在 `Cargo.toml` 中，主要通过各种依赖段落来描述该项目的各种依赖项:

- 基于 Rust 官方仓库 `crates.io`，通过版本说明来描述
- 基于项目源代码的 git仓库地址，通过 URL 来描述
- 基于本地项目的绝对路径或者相对路径，通过类Unix模式的路径来描述 

这三种形式具体写法如下：

```toml
[dependencies]
rand = "0.3"
hammer = { version = "0.5.0"}
color = { git = "https://github.com/bjz/color-rs" }
geometry = { path = "crates/geometry" }
```

相信聪明的读者已经能看懂该如何引入外部依赖库，这里就不再赘述。

详细的说明参见此章：[Cargo依赖管理](../cargo/dependency.md)，但是不建议大家现在去看，只要按照目录浏览，拨云见雾只可待。

## 基于cargo的项目组织结构

前文有提到 `cargo` 默认生成的项目结构，但是真实的项目还有所不同，但是在目前的学习阶段，还无需关注，感兴趣的同学可以移步：[Cargo项目结构](../cargo/layout.md)


至此，大家对 Rust 项目的创建和管理已经有了初步的了解，那么来完善刚才的 `"世界,你好"` 项目吧。
