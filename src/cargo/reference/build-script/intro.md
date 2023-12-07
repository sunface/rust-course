# 构建脚本( Build Scripts)

一些项目希望编译第三方的非 Rust 代码，例如 C 依赖库；一些希望链接本地或者基于源码构建的 C 依赖库；还有一些项目需要功能性的工具，例如在构建之间执行一些代码生成的工作等。

对于这些目标，社区已经提供了一些工具来很好的解决，Cargo 并不想替代它们，但是为了给用户带来一些便利，Cargo 提供了自定义构建脚本的方式，来帮助用户更好的解决类似的问题。

## build.rs

若要创建构建脚本，我们只需在项目的根目录下添加一个 `build.rs` 文件即可。这样一来， Cargo 就会先编译和执行该构建脚本，然后再去构建整个项目。

以下是一个非常简单的脚本示例:

```rust
fn main() {
    // 以下代码告诉 Cargo ，一旦指定的文件 `src/hello.c` 发生了改变，就重新运行当前的构建脚本
    println!("cargo:rerun-if-changed=src/hello.c");
    // 使用 `cc` 来构建一个 C 文件，然后进行静态链接
    cc::Build::new()
        .file("src/hello.c")
        .compile("hello");
}
```

关于构建脚本的一些使用场景如下：

- 构建 C 依赖库
- 在操作系统中寻找指定的 C 依赖库
- 根据某个说明描述文件生成一个 Rust 模块
- 执行一些平台相关的配置

下面的部分我们一起来看看构建脚本具体是如何工作的，然后在[下个章节](https://course.rs/cargo/reference/build-script/examples.html)中还提供了一些关于如何编写构建脚本的示例。

> Note: [`package.build`](https://course.rs/cargo/reference/manifest.html#build) 可以用于改变构建脚本的名称，或者直接禁用该功能

## 构建脚本的生命周期

在项目被构建之前，Cargo 会将构建脚本编译成一个可执行文件，然后运行该文件并执行相应的任务。

在运行的过程中，**脚本可以使用之前 `println` 的方式跟 Cargo 进行通信**：通信内容是以 `cargo:` 开头的格式化字符串。

需要注意的是，Cargo 也不是每次都会重新编译构建脚本，只有当脚本的内容或依赖发生变化时才会。默认情况下，任何文件变化都会触发重新编译，如果你希望对其进行定制，可以使用 `rerun-if`命令，后文会讲。

在构建脚本成功执行后，我们的项目就会开始进行编译。如果构建脚本的运行过程中发生错误，脚本应该通过返回一个非 0 码来立刻退出，在这种情况下，构建脚本的输出会被打印到终端中。

## 构建脚本的输入

我们可以通过[环境变量](https://doc.rust-lang.org/stable/cargo/reference/environment-variables.html#environment-variables-cargo-sets-for-build-scripts)的方式给构建脚本提供一些输入值，除此之外，构建脚本所在的当前目录也可以。

## 构建脚本的输出

构建脚本如果会产出文件，那么这些文件需要放在统一的目录中，该目录可以通过 [`OUT_DIR` 环境变量](https://doc.rust-lang.org/stable/cargo/reference/environment-variables.html#environment-variables-cargo-sets-for-build-scripts)来指定，**构建脚本不应该修改该目录之外的任何文件！**

在之前提到过，构建脚本可以通过 `println!` 输出内容跟 Cargo 进行通信：Cargo 会将每一行带有 `cargo:` 前缀的输出解析为一条指令，其它的输出内容会自动被忽略。

通过 `println!` 输出的内容在构建过程中默认是隐藏的，如果大家想要在终端中看到这些内容，你可以使用 `-vv` 来调用，以下 `build.rs` ：

```rust
fn main() {
    println!("hello, build.rs");
}
```

将输出:

```shell
$ cargo run -vv
[study_cargo 0.1.0] hello, build.rs
```

构建脚本打印到标准输出 `stdout` 的所有内容将保存在文件 `target/debug/build/<pkg>/output` 中 (具体的位置可能取决于你的配置)，`stderr` 的输出内容也将保存在同一个目录中。

以下是 Cargo 能识别的通信指令以及简介，如果大家希望深入了解每个命令，可以点击具体的链接查看官方文档的说明。

- [`cargo:rerun-if-changed=PATH`](https://doc.rust-lang.org/stable/cargo/reference/build-scripts.html#rerun-if-changed) — 当指定路径的文件发生变化时，Cargo 会重新运行脚本
- [`cargo:rerun-if-env-changed=VAR`](https://doc.rust-lang.org/stable/cargo/reference/build-scripts.html#rerun-if-env-changed) — 当指定的环境变量发生变化时，Cargo 会重新运行脚本
- [`cargo:rustc-link-arg=FLAG`](https://doc.rust-lang.org/stable/cargo/reference/build-scripts.html#rustc-link-arg) – 将自定义的 flags 传给 linker，用于后续的基准性能测试 benchmark、 可执行文件 binary,、`cdylib` 包、示例和测试
- [`cargo:rustc-link-arg-bin=BIN=FLAG`](https://doc.rust-lang.org/stable/cargo/reference/build-scripts.html#rustc-link-arg-bin) – 自定义的 flags 传给 linker，用于可执行文件 `BIN`
- [`cargo:rustc-link-arg-bins=FLAG`](https://doc.rust-lang.org/stable/cargo/reference/build-scripts.html#rustc-link-arg-bins) – 自定义的 flags 传给 linker，用于可执行文件
- [`cargo:rustc-link-arg-tests=FLAG`](https://doc.rust-lang.org/stable/cargo/reference/build-scripts.html#rustc-link-arg-tests) – 自定义的 flags 传给 linker，用于测试
- [`cargo:rustc-link-arg-examples=FLAG`](https://doc.rust-lang.org/stable/cargo/reference/build-scripts.html#rustc-link-arg-examples) – 自定义的 flags 传给 linker，用于示例
- [`cargo:rustc-link-arg-benches=FLAG`](https://doc.rust-lang.org/stable/cargo/reference/build-scripts.html#rustc-link-arg-benches) – 自定义的 flags 传给 linker，用于基准性能测试 benchmark
- [`cargo:rustc-cdylib-link-arg=FLAG`](https://doc.rust-lang.org/stable/cargo/reference/build-scripts.html#rustc-cdylib-link-arg) — 自定义的 flags 传给 linker，用于 `cdylib` 包
- [`cargo:rustc-link-lib=[KIND=]NAME`](https://doc.rust-lang.org/stable/cargo/reference/build-scripts.html#rustc-link-lib) — 告知 Cargo 通过 `-l` 去链接一个指定的库，往往用于链接一个本地库，通过 FFI
- [`cargo:rustc-link-search=[KIND=]PATH`](https://doc.rust-lang.org/stable/cargo/reference/build-scripts.html#rustc-link-search) — 告知 Cargo 通过 `-L` 将一个目录添加到依赖库的搜索路径中
- [`cargo:rustc-flags=FLAGS`](https://doc.rust-lang.org/stable/cargo/reference/build-scripts.html#rustc-flags) — 将特定的 flags 传给编译器
- [`cargo:rustc-cfg=KEY[="VALUE"]`](https://doc.rust-lang.org/stable/cargo/reference/build-scripts.html#rustc-cfg) — 开启编译时 `cfg` 设置
- [`cargo:rustc-env=VAR=VALUE`](https://doc.rust-lang.org/stable/cargo/reference/build-scripts.html#rustc-env) — 设置一个环境变量
- [`cargo:warning=MESSAGE`](https://doc.rust-lang.org/stable/cargo/reference/build-scripts.html#cargo-warning) — 在终端打印一条 warning 信息
- [`cargo:KEY=VALUE`](https://doc.rust-lang.org/stable/cargo/reference/build-scripts.html#the-links-manifest-key) — `links` 脚本使用的元数据

## 构建脚本的依赖

构建脚本也可以引入其它基于 Cargo 的依赖包，只需要在 `Cargo.toml` 中添加或修改以下内容:

```toml
[build-dependencies]
cc = "1.0.46"
```

需要这么配置的原因在于构建脚本无法使用通过 `[dependencies]` 或 `[dev-dependencies]` 引入的依赖包，因为构建脚本的编译运行过程跟项目本身的编译过程是分离的的，且前者先于后者发生。同样的，我们项目也无法使用 `[build-dependencies]` 中的依赖包。

**大家在引入依赖的时候，需要仔细考虑它会给编译时间、开源协议和维护性等方面带来什么样的影响**。如果你在 `[build-dependencies]` 和 `[dependencies]` 引入了同样的包，这种情况下 Cargo 也许会对依赖进行复用，也许不会，例如在交叉编译时，如果不会，那编译速度自然会受到不小的影响。

## links

在 `Cargo.toml` 中可以配置 `package.links` 选项，它的目的是告诉 Cargo 当前项目所链接的本地库，同时提供了一种方式可以在项目构建脚本之间传递元信息。

```toml
[package]
# ...
links = "foo"
```

以上配置表明项目链接到一个 `libfoo` 本地库，当使用 `links` 时，项目必须拥有一个构建脚本，并且该脚本需要使用 [`rustc-link-lib`](https://doc.rust-lang.org/stable/cargo/reference/build-scripts.html#rustc-link-lib) 指令来链接目标库。

Cargo 要求一个本地库最多只能被一个项目所链接，换而言之，你无法让两个项目链接到同一个本地库，但是有一种方法可以降低这种限制，感兴趣的同学可以看看[官方文档](https://doc.rust-lang.org/stable/cargo/reference/build-scripts.html#-sys-packages)。

假设 A 项目的构建脚本生成任意数量的 kv 形式的元数据，那这些元数据将传递给 A 用作依赖包的项目的构建脚本。例如，如果包 `bar` 依赖于 `foo`，当 `foo` 生成 `key=value` 形式的构建脚本元数据时，那么 `bar` 的构建脚本就可以通过环境变量的形式使用该元数据：`DEP_FOO_KEY=value`。

需要注意的是，该元数据只能传给直接相关者，对于间接的，例如依赖的依赖，就无能为力了。

## 覆盖构建脚本

当 `Cargo.toml` 设置了 `links` 时， Cargo 就允许我们使用自定义库对现有的构建脚本进行覆盖。在 [Cargo 使用的配置文件](https://course.rs/cargo/reference/configuration.html)中添加以下内容：

```toml
[target.x86_64-unknown-linux-gnu.foo]
rustc-link-lib = ["foo"]
rustc-link-search = ["/path/to/foo"]
rustc-flags = "-L /some/path"
rustc-cfg = ['key="value"']
rustc-env = {key = "value"}
rustc-cdylib-link-arg = ["…"]
metadata_key1 = "value"
metadata_key2 = "value"
```

增加这个配置后，在未来，一旦我们的某个项目声明了它链接到 `foo` ，那项目的构建脚本将不会被编译和运行，替代的是这里的配置将被使用。

`warning`, `rerun-if-changed` 和 `rerun-if-env-changed` 这三个 key 在这里不应该被使用，就算用了也会被忽略。
