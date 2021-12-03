## 认识Cargo

但凡经历过C/C++、Go语言1.10版本之前的用户都知道，一个好的包管理工具有多么的重要！！我们那个时候时如此的羡慕nodejs的npm包管理，但是却求而不得，包管理工具最重要的意义就是**任何用户拿到你的代码，都能运行起来**"，而不会因为各种包版本依赖焦头烂额，Go语言在1.10版本之前，所有的包都是在github.com下存放，导致了所有的项目都公用一套依赖代码，在本地项目复杂后，这简直是一种依赖。

说多了都是泪，笔者目前还有一个早期Go的项目(15年写的)，用到了iris(一个坑爹http服务)，结果现在运行不起来了，因为找不到iris当时的那个版本！！

作为一门现代化语言，`Rust`吸收了多个语言的包管理优点，为大家提供超级大杀器：`cargo`，真的，但凡用过后，你都不会想要其他语言的包管理工具了。

总而言之，`cargo`提供了一系列的工具，从项目的建立、构建到测试、运行直至部署，为Rust项目的管理提供尽可能完整的手段，同时，与Rust语言及其编译器rustc紧密结合，可以说用了后就忘不掉，如同那种初恋般的触电感觉。


## 创建一个"你好,世界"项目

又见"你好,世界"，肯定有读者在批评了：你就不能优点创意吗？"世界,你好"不行吗？你是读者，你说了算，好的，那我们来创建一个"世界，你好"。

上门提到过，Rust语言的包管理工具名称叫`cargo`，好在，我们无需手动安装，在之前安装Rust的时候，就一起安装了，如果你在终端无法使用这个命令，考虑一下`环境变量`是否正确的设置，你需要把`cargo`可执行文件所在的目录添加到环境变量中。

在终端输入:
```console
$ cargo new world_hello
```

上面的命令使用`cargo new`创建了一个项目，项目名是`world_hello`(向读者势力低头的项目名称，泪奔)，这个项目的结构和配置文件都是由`cargo`生成，这种结构和配置文件意味着**该项目被cargo所管理**，早期的cargo在创建项目时，必须添加`--bin`的参数，如下所示：
```console
$ cargo new world_hello --bin
```

现在的版本，已经无需这个参数，`cargo`默认就为我们创建`bin`类型的项目，顺便说一句，rust项目主要分为两个类型：bin和lib，前者是一个可以运行的项目，后者是一个依赖库项目。

创建的项目结构：
```console
.
├── .git
├── .gitignore
├── Cargo.toml
└── src
    └── main.rs

```

是的，连git都给你创建了，比小棉袄还体贴。

## 运行该项目
有两种方式可以运行我们的项目，先来看看第一种

#### cargo run

真的很简单，我就不废话了，在项目根目录下运行：

```console
$ cargo run
   Compiling world_hello v0.1.0 (/Users/sunfei/development/rust/world_hello)
    Finished dev [unoptimized + debuginfo] target(s) in 0.43s
     Running `target/debug/world_hello`
Hello, world!
```

好了，你已经看到程序的输出: `"Hello, world"`, 可能有读者不愿意了，说好了"世界，你好"呢? 别急，在下一节，我们再对代码进行修改。

在上面的过程中，`cargo run`会对项目进行编译，然后再运行项目，如同我们下面将做的

#### 手动编译和运行项目

先来编译项目:
```console
$ cargo build
    Finished dev [unoptimized + debuginfo] target(s) in 0.00s
```

接着手动运行：
```console
$ ./target/debug/world_hello 
Hello, world!
```

很简单对吧？细心的读者可能已经发现，在调用的时候，路径`./target/debug/world_hello`中有一个明晃晃的`debug`字段，没错我们运行的是`debug模式`，在这种模式下，**代码的编译速度会非常快**，但是**运行速度就比较慢**了，原因在于这个模式下，Rust编译器不会做任何的优化，只为了尽快的编译完成，让你的开发流程更加顺畅。

那如果我们想要高性能的代码怎么办？可以添加`--release`来编译：
- `cargo run --release`
- `cargo build --release`
如果你用的第二个命令，就要换一个路径来运行程序

```console
$ ./target/release/world_hello 
Hello, world!
```

当项目大了后，`cargo run`和`cargo build`不可避免的会变慢，那么有没有更快的方式来验证代码的正确性呢？大杀器来了，接着！

## cargo check

`cargo check`是我们在代码开发过程中用的最多的命令，它的作用很简单：快速的检查一下代码能否编译通过，所以速度会非常快，帮助我们节省大量的编译时间(毕竟Rust不是Go，需要做很多复杂的编译优化和语言特性解析，所以编译速度比Go慢了不少)。

```console
$ cargo check
    Checking world_hello v0.1.0 (/Users/sunfei/development/rust/world_hello)
    Finished dev [unoptimized + debuginfo] target(s) in 0.06s
```

## cargo.toml 和 cargo.lock

`cargo.toml`和`cargo.lock`是cargo项目代码管理的核心文件，cargo工具的所有活动均基于这两个文件。

`cargo.toml`是cargo特有的项目数据描述文件，存储了项目的所有元配置信息，如果rust开发者希望rust项目能够按照期望的方式进行构建、测试和运行，那么，必须按照合理的方式构建`cargo.toml`。

`cargo.lock`文件是cargo工具根据同一项目的toml文件生成的项目依赖详细清单文件，所以我们一般不用不管它，只需要对着cargo.toml文件撸就行了。

> 什么情况下该把`cargo.lock`上传到git仓库里？很简单，当你的项目是一个可运行的程序时，就上传`cargo.lock`，如果是一个依赖库项目，那么请把它添加到`.gitignore`中

现在可以打开"世界，你好"项目下的`cargo.toml`文件，我们来简单介绍下：

#### package配置段落
`package`中配置了我们项目的一些描述信息，典型的如下：

```toml
[package]
name = "world_hello"
version = "0.1.0"
edition = "2021"
```

`name`字段定义了项目名称，`version`字段定义了项目的当前版本，新项目默认是`0.1.0`，`edition`字段定义了我们使用的Rust大版本，因为本书很新(不仅仅是现在新，未来也将及时修订，跟得上Rust最新大版本)，所以我们使用的是`Rust edition 2021`大版本，现有的很多项目还在使用`Rust edition 2018`，具体参见[Rust版本详解](../appendix/rust-version.md).


#### 定义项目依赖

使用cargo工具的最大优势就在于，能够对该项目的各种依赖项进行方便、统一和灵活的管理。这也是使用cargo对Rust项目进行管理的重要目标之一。在cargo的toml文件描述中，主要通过各种依赖段落来描述该项目的各种依赖项。`cargo.toml`中常用的依赖段落包括一下几种：

- 基于rust官方仓库crates.io，通过版本说明来描述
- 基于项目源代码的git仓库地址，通过URL来描述
- 基于本地项目的绝对路径或者相对路径，通过类Unix模式的路径来描述 

这三种形式具体写法如下：

```toml
[dependencies]
rand = "0.3"
hammer = { version = "0.5.0"}
color = { git = "https://github.com/bjz/color-rs" }
geometry = { path = "crates/geometry" }
```

相信聪明的读者已经能看懂该怎么引入外部依赖库，我们就不逐行解释了。

详细的说明参见此章:[Cargo依赖管理](../cargo/dependency.md)，但是不建议新手现在去看，等学习后面，自然就能看到。

## 基于cargo的项目组织结构

在上文我们已经看到了cargo默认生成的项目结构，但是真实的项目还有所不同，但是在目前的学习阶段，我们还不需要关注这个，感兴趣的同学可以移步此处：[Cargo项目结构](../cargo/layout.md)


至此，大家对Rust项目的创建和管理已经有了初步的了解，让我们来完善刚才的`"世界,你好"`项目吧。