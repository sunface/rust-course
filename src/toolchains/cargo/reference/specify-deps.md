# 指定依赖项

我们的项目可以引用在 `crates.io` 或 `github` 上的依赖包，也可以引用存放在本地文件系统中的依赖包。

大家可能会想，直接从前两个引用即可，为何还提供了本地方式？可以设想下，如果你要有一个正处于开发中的包，然后需要在本地的另一个项目中引用测试，那是将该包先传到网上，然后再引用简单，还是直接从本地路径的方式引用简单呢？答案显然不言而喻。

本章节，我们一起来看看有哪些方式可以指定和引用三方依赖包。

## 从 `crates.io` 引入依赖包

默认设置下，`Cargo` 就从 [crates.io](https://crates.io) 上下载依赖包，只需要一个包名和版本号即可：

```toml
[dependencies]
time = "0.1.12"
```

字符串 `"0.1.12"` 是一个 [`semver`](https://semver.org) 格式的版本号，符合 `"x.y.z"` 的形式，其中 `x` 被称为主版本(major), `y` 被称为小版本 `minor` ，而 `z` 被称为 补丁 `patch`，可以看出从左到右，版本的影响范围逐步降低，补丁的更新是无关痛痒的，并不会造成 API 的兼容性被破坏。

`"0.1.12"` 中并没有任何额外的符号，在版本语义上，它跟使用了 `^` 的 `"^0.1.12"` 是相同的，都是指定非常具体的版本进行引入。

但是 `^` 能做的更多。

> npm 使用的就是 `semver` 版本号，从 JS 过来的同学应该非常熟悉。

#### `^` 指定版本

与之前的 `"0.1.12"` 不同， `^` 可以指定一个版本号范围，**然后会使用该范围内的最大版本号来引用对应的包**。

只要新的版本号没有修改最左边的非零数字，那该版本号就在允许的版本号范围中。例如 `"^0.1.12"` 最左边的非零数字是 `1`，因此，只要新的版本号是 `"0.1.z"` 就可以落在范围内，而`0.2.0` 显然就没有落在范围内，因此通过 `"^0.1.12"` 引入的依赖包是无法被升级到 `0.2.0` 版本的。

同理，若是 `"^1.0"`，则 `1.1` 在范围中，`2.0` 则不在。 大家思考下，`"^0.0.1"` 与哪些版本兼容？答案是：无，因为它最左边的数字是 `1` ，而该数字已经退无可退，我们又不能修改 `1`，因此没有版本落在范围中。

```shell
^1.2.3  :=  >=1.2.3, <2.0.0
^1.2    :=  >=1.2.0, <2.0.0
^1      :=  >=1.0.0, <2.0.0
^0.2.3  :=  >=0.2.3, <0.3.0
^0.2    :=  >=0.2.0, <0.3.0
^0.0.3  :=  >=0.0.3, <0.0.4
^0.0    :=  >=0.0.0, <0.1.0
^0      :=  >=0.0.0, <1.0.0
```

以上是更多的例子，**事实上，这个规则跟 `SemVer` 还有所不同**，因为对于 `SemVer` 而言，`0.x.y` 的版本是没有其它版本与其兼容的，而对于 Rust，只要版本号 `0.x.y` 满足 ： `z>=y` 且 `x>0` 的条件，那它就能更新到 `0.x.z` 版本。

#### `~` 指定版本

`~` 指定了最小化版本 :

```rust
~1.2.3  := >=1.2.3, <1.3.0
~1.2    := >=1.2.0, <1.3.0
~1      := >=1.0.0, <2.0.0
```

#### `*` 通配符

这种方式允许将 `*` 所在的位置替换成任何数字:

```rust
*     := >=0.0.0
1.*   := >=1.0.0, <2.0.0
1.2.* := >=1.2.0, <1.3.0
```

不过 `crates.io` 并不允许我们只使用孤零零一个 `*` 来指定版本号 : `*`。

#### 比较符

可以使用比较符的方式来指定一个版本号范围或一个精确的版本号:

```rust
>= 1.2.0
> 1
< 2
= 1.2.3
```

同时还能使用比较符进行组合，并通过逗号分隔：

```rust
>= 1.2, < 1.5
```

需要注意，以上的版本号规则仅仅针对 `crate.io` 和基于它搭建的注册服务(例如科大服务源) ，其它注册服务(例如 github )有自己相应的规则。

## 从其它注册服务引入依赖包

为了使用 `crates.io` 之外的注册服务，我们需要对 `$HOME/.cargo/config.toml` ($CARGO_HOME 下) 文件进行配置，添加新的服务提供商，有两种方式可以实现。

> 由于国内访问国外注册服务的不稳定性，我们可以使用[科大的注册服务](http://mirrors.ustc.edu.cn/help/crates.io-index.html)来提升下载速度，以下注册服务的链接都是科大的

**首先是在 `crates.io` 之外添加新的注册服务**，修改 `.cargo/config.toml` 添加以下内容：

```toml
[registries]
ustc = { index = "https://mirrors.ustc.edu.cn/crates.io-index/" }
```

对于这种方式，我们的项目的 `Cargo.toml` 中的依赖包引入方式也有所不同：

```toml
[dependencies]
time = {  registry = "ustc" }
```

在重新配置后，初次构建可能要较久的时间，因为要下载更新 `ustc` 注册服务的索引文件，还挺大的...

注意，这一种使用方式最大的缺点就是在引用依赖包时要指定注册服务: `time = { registry = "ustc" }`。

**而第二种方式就不需要，因为它是直接使用新注册服务来替代默认的 `crates.io`**。

```toml
[source.crates-io]
replace-with = 'ustc'

[source.ustc]
registry = "git://mirrors.ustc.edu.cn/crates.io-index"
```

上面配置中的第一个部分，首先将源 `source.crates-io` 替换为 `ustc`，然后在第二部分指定了 `ustc` 源的地址。

> 注意，如果你要发布包到 `crates.io` 上，那该包的依赖也必须在 `crates.io` 上

#### 引入 git 仓库作为依赖包

若要引入 git 仓库中的库作为依赖包，你至少需要提供一个仓库的地址:

```toml
[dependencies]
regex = { git = "https://github.com/rust-lang/regex" }
```

由于没有指定版本，Cargo 会假定我们使用 `master` 或 `main` 分支的最新 `commit` 。你可以使用 `rev`、`tag` 或 `branch` 来指定想要拉取的版本。例如下面代码拉取了 `next` 分支上的最新 `commit`：

```toml
[dependencies]
regex = { git = "https://github.com/rust-lang/regex", branch = "next" }
```

任何非 `tag` 和 `branch` 的类型都可以通过 `rev` 来引入，例如通过最近一次 `commit` 的哈希值引入: `rev = "4c59b707"`，再比如远程仓库提供的的具名引用: `rev = "refs/pull/493/head"`。

一旦 `git` 依赖被拉取下来，该版本就会被记录到 `Cargo.lock` 中进行锁定。因此 `git` 仓库中后续新的提交不再会被自动拉取，除非你通过 `cargo update` 来升级。需要注意的是锁定一旦被删除，那 Cargo 依然会按照 `Cargo.toml` 中配置的地址和版本去拉取新的版本，如果你配置的版本不正确，那可能会拉取下来一个不兼容的新版本！

**因此不要依赖锁定来完成版本的控制，而应该老老实实的在 `Cargo.toml` 小心配置你希望使用的版本。**

如果访问的是私有仓库，你可能需要授权来访问该仓库，可以查看[这里](https://course.rs/toolchains/cargo/git-auth.html)了解授权的方式。

#### 通过路径引入本地依赖包

Cargo 支持通过路径的方式来引入本地的依赖包：一般来说，本地依赖包都是同一个项目内的内部包，例如假设我们有一个 `hello_world` 项目( package )，现在在其根目录下新建一个包:

```shell
#  在 hello_world/ 目录下
$ cargo new hello_utils
```

新建的 `hello_utils` 文件夹跟 `src`、`Cargo.toml` 同级，现在修改 `Cargo.toml` 让 `hello_world` 项目引入新建的包:

```toml
[dependencies]
hello_utils = { path = "hello_utils" }
# 以下路径也可以
# hello_utils = { path = "./hello_utils" }
# hello_utils = { path = "../hello_world/hello_utils" }
```

但是，此时的 `hello_world` 是无法发布到 `crates.io` 上的。想要发布，需要先将 `hello_utils` 先发布到 `crates.io` 上，然后再通过 `crates.io` 的方式来引入:

```toml
[dependencies]
hello_utils = { path = "hello_utils", version = "0.1.0" }
```

> 注意！使用 `path` 指定依赖的 package 将无法发布到 `crates.io`，除非 `path` 存在于 [[dev-dependencies]](#dev-dependencies) 中。当然，你还可以使用多种引用混合的方式来解决这个问题，下面将进行介绍

## 多引用方式混合

实际上，我们可以同时使用多种方式来引入同一个包，例如本地引入和 `crates.io` :

```toml
[dependencies]
# 本地使用时，通过 path 引入,
# 发布到 `crates.io` 时，通过 `crates.io` 的方式引入：  version = "1.0"
bitflags = { path = "my-bitflags", version = "1.0" }

# 本地使用时，通过 git 仓库引入
# 当发布时，通过 `crates.io` 引入： version = "1.0"
smallvec = { git = "https://github.com/servo/rust-smallvec", version = "1.0" }

# N.B. 若 version 无法匹配，Cargo 将无法编译
```

这种方式跟下章节将要讲述的依赖覆盖类似，但是前者只会应用到当前声明的依赖包上。

## 根据平台引入依赖

我们还可以根据特定的平台来引入依赖:

```toml
[target.'cfg(windows)'.dependencies]
winhttp = "0.4.0"

[target.'cfg(unix)'.dependencies]
openssl = "1.0.1"

[target.'cfg(target_arch = "x86")'.dependencies]
native = { path = "native/i686" }

[target.'cfg(target_arch = "x86_64")'.dependencies]
native = { path = "native/x86_64" }
```

此处的语法跟 Rust 的 [`#[cfg]`](https://doc.rust-lang.org/stable/reference/conditional-compilation.html) 语法非常相像，因此我们还能使用逻辑操作符进行控制:

```toml
[target.'cfg(not(unix))'.dependencies]
openssl = "1.0.1"
```

这里的意思是，当不是 `unix` 操作系统时，才对 `openssl` 进行引入。

如果你想要知道 `cfg` 能够作用的目标，可以在终端中运行 `rustc --print=cfg` 进行查询。当然，你可以指定平台查询: `rustc --print=cfg --target=x86_64-pc-windows-msvc`，该命令将对 `64bit` 的 Windows 进行查询。

聪明的同学已经发现，这非常类似于条件依赖引入，那我们是不是可以根据自定义的条件来决定是否引入某个依赖呢？具体答案参见后续的 [feature](https://course.rs/toolchains/cargo/reference/features.html) 章节。这里是一个简单的示例:

```toml
[dependencies]
foo = { version = "1.0", optional = true }
bar = { version = "1.0", optional = true }

[features]
fancy-feature = ["foo", "bar"]
```

但是需要注意的是，你如果妄图通过 `cfg(feature)`、`cfg(debug_assertions)`, `cfg(test)` 和 `cfg(proc_macro)` 的方式来条件引入依赖，那是不可行的。

`Cargo` 还允许通过下面的方式来引入平台特定的依赖:

```toml
[target.x86_64-pc-windows-gnu.dependencies]
winhttp = "0.4.0"

[target.i686-unknown-linux-gnu.dependencies]
openssl = "1.0.1"
```

## 自定义 target 引入

如果你在使用自定义的 `target` ：例如 `--target bar.json`，那么可以通过下面方式来引入依赖:

```toml
[target.bar.dependencies]
winhttp = "0.4.0"

[target.my-special-i686-platform.dependencies]
openssl = "1.0.1"
native = { path = "native/i686" }
```

> 需要注意，这种使用方式在 `stable` 版本的 Rust 中无法被使用，建议大家如果没有特别的需求，还是使用之前提到的 feature 方式

## [dev-dependencies]

你还可以为项目添加只在测试时需要的依赖库，类似于 `package.json`( Nodejs )文件中的 `devDependencies`，可以在 `Cargo.toml` 中添加 `[dev-dependencies]` 来实现:

```toml
[dev-dependencies]
tempdir = "0.3"
```

这里的依赖只会在运行测试、示例和 benchmark 时才会被引入。并且，假设`A` 包引用了 `B`，而 `B` 通过 `[dev-dependencies]` 的方式引用了 `C` 包， 那 `A` 是不会引用 `C` 包的。

当然，我们还可以指定平台特定的测试依赖包:

```toml
[target.'cfg(unix)'.dev-dependencies]
mio = "0.0.1"
```

> 注意，当发布包到 crates.io 时，`[dev-dependencies]` 中的依赖只有指定了 `version` 的才会被包含在发布包中。况且，再加上测试稳定性的考虑，我们建议为 `[dev-dependencies]` 中的包指定相应的版本号

## [build-dependencies]

我们还可以指定某些依赖仅用于构建脚本:

```toml
[build-dependencies]
cc = "1.0.3"
```

当然，平台特定的依然可以使用：

```toml
[target.'cfg(unix)'.build-dependencies]
cc = "1.0.3"
```

有一点需要注意：构建脚本(` build.rs` )和项目的正常代码是彼此独立，因此它们的依赖不能互通： 构建脚本无法使用 `[dependencies]` 或 `[dev-dependencies]` 中的依赖，而 `[build-dependencies]` 中的依赖也无法被构建脚本之外的代码所使用。

## 选择 features

如果你依赖的包提供了条件性的 `features`，你可以指定使用哪一个:

```toml
[dependencies.awesome]
version = "1.3.5"
default-features = false # 不要包含默认的 features，而是通过下面的方式来指定
features = ["secure-password", "civet"]
```

更多的信息参见 [Features 章节](https://course.rs/toolchains/cargo/reference/features.html)

## 在 Cargo.toml 中重命名依赖

如果你想要实现以下目标：

- 避免在 Rust 代码中使用 `use foo as bar`
- 依赖某个包的多个版本
- 依赖来自于不同注册服务的同名包

那可以使用 Cargo 提供的 `package key` :

```toml
[package]
name = "mypackage"
version = "0.0.1"

[dependencies]
foo = "0.1"
bar = { git = "https://github.com/example/project", package = "foo" }
baz = { version = "0.1", registry = "custom", package = "foo" }
```

此时，你的代码中可以使用三个包：

```rust
extern crate foo; // 来自 crates.io
extern crate bar; // 来自 git repository
extern crate baz; // 来自 registry `custom`
```

有趣的是，由于这三个 `package` 的名称都是 `foo`(在各自的 `Cargo.toml` 中定义)，因此我们显式的通过 `package = "foo"` 的方式告诉 Cargo：我们需要的就是这个 `foo package`，虽然它被重命名为 `bar` 或 `baz`。

有一点需要注意，当使用可选依赖时，如果你将 `foo` 包重命名为 `bar` 包，那引用前者的 feature 时的路径名也要做相应的修改:

```toml
[dependencies]
bar = { version = "0.1", package = 'foo', optional = true }

[features]
log-debug = ['bar/log-debug'] # 若使用 'foo/log-debug' 会导致报错
```

