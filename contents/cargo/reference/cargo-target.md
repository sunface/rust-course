# 修改默认的文件目录

## Cargo Target
**Cargo 项目中包含有一些对象，它们包含的源代码文件可以被编译成相应的包，这些对象被称之为 Cargo Target**。例如[之前章节](https://course.rs/cargo/guide/package-layout.html)提到的库对象 `Library` 、二进制对象 `Binary`、示例对象 `Examples`、测试对象 `Tests` 和 基准性能对象 `Benches` 都是 Cargo Target。

本章节我们一起来看看该如何在 `Cargo.toml` 清单中配置这些对象，当然，大部分时候都无需手动配置，因为默认的配置通常由项目目录的布局自动推断出来。

## 对象介绍
在开始讲解如何配置对象前，我们先来看看这些对象究竟是什么，估计还有些同学对此有些迷糊 :)

#### 库对象( Library )
库对象用于定义一个库，该库可以被其它的库或者可执行文件所链接。**该对象包含的默认文件名是 `src/lib.rs`，且默认情况下，库对象的名称[跟项目名是一致的](https://course.rs/basic/crate-module/crate.html#package)**，

一个工程只能有一个库对象，因此也只能有一个 `src/lib.rs` 文件，以下是一种自定义配置:
```shell
# 一个简单的例子：在 Cargo.toml 中定制化库对象
[lib]
crate-type = ["cdylib"]
bench = false
```

#### 二进制对象(Binaries)
二进制对象在被编译后可以生成可执行的文件，默认的文件名是 `src/main.rs`，二进制对象的名称跟项目名也是相同的。

大家应该还记得，一个项目拥有多个二进制文件，因此一个项目可以拥有多个二进制对象。当拥有多个对象时，对象的文件默认会被放在 `src/bin/` 目录下。

二进制对象可以使用库对象提供的公共 API，也可以通过 `[dependencies]` 来引入外部的依赖库。

我们可以使用 `cargo run --bin <bin-name>` 的方式来运行指定的二进制对象，以下是二进制对象的配置示例：
```toml
# Example of customizing binaries in Cargo.toml.
[[bin]]
name = "cool-tool"
test = false
bench = false

[[bin]]
name = "frobnicator"
required-features = ["frobnicate"]
```

#### 示例对象(Examples)
示例对象的文件在根目录下的 `examples` 目录中。既然是示例，自然是使用项目中的库对象的功能进行演示。示例对象编译后的文件会存储在 `target/debug/examples` 目录下。

如上所示，示例对象可以使用库对象的公共 API，也可以通过 `[dependencies]` 来引入外部的依赖库。

默认情况下，示例对象都是可执行的二进制文件( 带有 `fn main()` 函数入口)，毕竟例子是用来测试和演示我们的库对象，是用来运行的。而你完全可以将示例对象改成库的类型: 
```toml
[[example]]
name = "foo"
crate-type = ["staticlib"]
```

如果想要指定运行某个示例对象，可以使用 `cargo run --example <example-name>` 命令。如果是库类型的示例对象，则可以使用 `cargo build --example <example-name>` 进行构建。

与此类似，还可以使用 `cargo install --example <example-name>` 来将示例对象编译出的可执行文件安装到默认的目录中，将该目录添加到 `$PATH` 环境变量中，就可以直接全局运行安装的可执行文件。

最后，`cargo test` 命令默认会对示例对象进行编译，以防止示例代码因为长久没运行，导致严重过期以至于无法运行。

#### 测试对象(Tests)
测试对象的文件位于根目录下的 `tests` 目录中，如果大家还有印象的话，就知道该目录是[集成测试](https://course.rs/test/unit-integration-test.html#集成测试)所使用的。

当运行 `cargo test` 时，里面的每个文件都会被编译成独立的包，然后被执行。

测试对象可以使用库对象提供的公共 API，也可以通过 `[dependencies]` 来引入外部的依赖库。

#### 基准性能对象(Benches)
该对象的文件位于 `benches` 目录下，可以通过 `cargo bench` 命令来运行，关于基准测试，可以通过[这篇文章](https://course.rs/test/benchmark.html)了解更多。

## 配置一个对象
我们可以通过 `Cargo.toml` 中的 `[lib]`、`[[bin]]`、`[[example]]`、`[[test]]` 和 `[[bench]]` 部分对以上对象进行配置。

> 大家可能会疑惑 `[lib]` 和 `[[bin]]` 的写法为何不一致，原因是这种语法是 `TOML` 提供的[数组特性](https://toml.io/en/v1.0.0-rc.3#array-of-tables)， `[[bin]]` 这种写法意味着我们可以在 Cargo.toml 中创建多个 `[[bin]]` ，每一个对应一个二进制文件
>
> 上文提到过，我们只能指定一个库对象，因此这里只能使用 `[lib]` 形式


由于它们的配置内容都是相似的，因此我们以 `[lib]` 为例来说明相应的配置项:
```toml
[lib]
name = "foo"           # The name of the target.
path = "src/lib.rs"    # The source file of the target.
test = true            # Is tested by default.
doctest = true         # Documentation examples are tested by default.
bench = true           # Is benchmarked by default.
doc = true             # Is documented by default.
plugin = false         # Used as a compiler plugin (deprecated).
proc-macro = false     # Set to `true` for a proc-macro library.
harness = true         # Use libtest harness.
edition = "2015"       # The edition of the target.
crate-type = ["lib"]   # The crate types to generate.
required-features = [] # Features required to build this target (N/A for lib).
```

