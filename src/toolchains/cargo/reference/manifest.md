# Cargo.toml 格式讲解

`Cargo.toml` 又被称为清单( `manifest` )，文件格式是 `TOML`，每一个清单文件都由以下部分组成：

- [`cargo-features`](unstable.md) — 只能用于 `nightly`版本的 `feature`
- [`[package]`](#package) — 定义项目( `package` )的元信息
  - [`name`](#name) — 名称
  - [`version`](#version) — 版本
  - [`authors`](#authors) — 开发作者
  - [`edition`](#edition) — Rust edition.
  - [`rust-version`](#rust-version) — 支持的最小化 Rust 版本
  - [`description`](#description) — 描述
  - [`documentation`](#documentation) — 文档 URL
  - [`readme`](#readme) — README 文件的路径
  - [`homepage`](#homepage) - 主页 URL
  - [`repository`](#repository) — 源代码仓库的 URL
  - [`license`](#license和license-file) — 开源协议 License.
  - [`license-file`](#license和license-file) — License 文件的路径.
  - [`keywords`](#keywords) — 项目的关键词
  - [`categories`](#categories) — 项目分类
  - [`workspace`](#workspace) — 工作空间 workspace 的路径
  - [`build`](#build) — 构建脚本的路径
  - [`links`](#links) — 本地链接库的名称
  - [`exclude`](#exclude和include) — 发布时排除的文件
  - [`include`](#exclude和include) — 发布时包含的文件
  - [`publish`](#the-publish-field) — 用于阻止项目的发布
  - [`metadata`](#metadata) — 额外的配置信息，用于提供给外部工具
  - [`default-run`](#default-run) — [`cargo run`] 所使用的默认可执行文件( binary )
  - [`autobins`](cargo-target.md#对象自动发现) — 禁止可执行文件的自动发现
  - [`autoexamples`](cargo-target.md#对象自动发现) — 禁止示例文件的自动发现
  - [`autotests`](cargo-target.md#对象自动发现) — 禁止测试文件的自动发现
  - [`autobenches`](cargo-target.md#对象自动发现) — 禁止 bench 文件的自动发现
  - [`resolver`](resolver.md#resolver-versions) — 设置依赖解析器( dependency resolver)
- Cargo Target 列表: (查看 [Target 配置](cargo-target.md#Target配置) 获取详细设置)
  - [`[lib]`](cargo-target.md#库对象library) — Library target 设置.
  - [`[[bin]]`](cargo-target.md#二进制对象binaries) — Binary target 设置.
  - [`[[example]]`](cargo-target.md#示例对象examples) — Example target 设置.
  - [`[[test]]`](cargo-target.md#测试对象tests) — Test target 设置.
  - [`[[bench]]`](cargo-target.md#基准性能对象benches) — Benchmark target 设置.
- Dependency tables:
  - [`[dependencies]`](specify-deps.md) — 项目依赖包
  - [`[dev-dependencies]`](specify-deps.md#dev-dependencies) — 用于 examples、tests 和 benchmarks 的依赖包
  - [`[build-dependencies]`](specify-deps.md#build-dependencies) — 用于构建脚本的依赖包
  - [`[target]`](specify-deps.md#根据平台引入依赖) — 平台特定的依赖包
- [`[badges]`](#badges) — 用于在注册服务(例如 crates.io ) 上显示项目的一些状态信息，例如当前的维护状态：活跃中、寻找维护者、deprecated
- [`[features]`](features.md) — `features` 可以用于条件编译
- [`[patch]`](deps-overriding.md) — 推荐使用的依赖覆盖方式
- [`[replace]`](deps-overriding.md#不推荐的replace) — 不推荐使用的依赖覆盖方式 (deprecated).
- [`[profile]`](profiles.md) — 编译器设置和优化
- [`[workspace]`](workspaces.md) — 工作空间的定义

下面，我们将对其中一些部分进行详细讲解。

## [package]

`Cargo.toml` 中第一个部分就是 `package`，用于设置项目的相关信息：

```toml
[package]
name = "hello_world" # the name of the package
version = "0.1.0"    # the current version, obeying semver
authors = ["Alice <a@example.com>", "Bob <b@example.com>"]
```

其中，只有 `name` 和 `version` 字段是**必须填写的**。当发布到注册服务时，可能会有额外的字段要求，具体参见[发布到 crates.io](publishing-on-crates.io.md)。

#### name

项目名用于引用一个项目( `package` )，它有几个用途：

- 其它项目引用我们的 `package` 时，会使用该 `name`
- 编译出的可执行文件(bin target)的默认名称

`name` 只能使用 [`alphanumeric`](https://doc.rust-lang.org/stable/std/primitive.char.html#method.is_alphanumeric) 字符、 `-` 和 `_`，并且不能为空。

事实上，`name` 的限制不止如此，例如:

- **当使用 `cargo new` 或 `cargo init` 创建时**，`name` 还会被施加额外的限制，例如不能使用 Rust 关键字名称作为 `name`
- **如果要发布到 `crates.io` ，那还有更多的限制**: `name` 使用 `ASCII` 码，不能使用已经被使用的名称，例如 `uuid` 已经在 `crates.io` 上被使用，因此我们只能使用类如 `uuid_v1` 的名称，才能将项目发布到 `crates.io` 上

#### version

Cargo 使用了[语义化版本控制](https://semver.org)的概念，例如字符串 `"0.1.12"` 是一个 `semver` 格式的版本号，符合 `"x.y.z"` 的形式，其中 `x` 被称为主版本(major), `y` 被称为小版本 `minor` ，而 `z` 被称为 补丁 `patch`，可以看出从左到右，版本的影响范围逐步降低，补丁的更新是无关痛痒的，并不会造成 API 的兼容性被破坏。

使用该规则，你还需要遵循一些基本规则:

- 使用标准的 `x.y.z` 形式的版本号，例如 `1.0.0` 而不是 `1.0`
- 在版本到达 `1.0.0` 之前，怎么都行，但是如果有破坏性变更( breaking changes )，需要增加 `minor` 版本号。例如，为结构体新增字段或为枚举新增成员就是一种破坏性变更
- 在 `1.0.0` 之后，如果发生破坏性变更，需要增加 `major` 版本号
- 在 `1.0.0` 之后不要去破坏构建流程
- 在 `1.0.0` 之后，不要在 `patch` 更新中添加新的 `api` ( `pub` 声明)，如果要添加新的 `pub` 结构体、特征、类型、函数、方法等对象时，增加 `minor` 版本号

如果大家想知道 Rust 如何使用版本号来解析依赖，可以查看[这里](https://doc.rust-lang.org/stable/cargo/reference/resolver.html)。同时 [SemVer 兼容性](https://doc.rust-lang.org/stable/cargo/reference/semver.html) 提供了更为详尽的破坏性变更列表。

#### authors

```toml
[package]
authors = ["Sunfei <contact@im.dev>"]
```

该字段仅用于项目的元信息描述和 `build.rs` 用到的 `CARGO_PKG_AUTHORS` 环境变量，它并不会显示在 `crates.io` 界面上。

> 警告：清单中的 `[package]` 部分一旦发布到 `crates.io` 就无法进行更改，因此对于已发布的包来说，`authors` 字段是无法修改的

#### edition

可选字段，用于指定项目所使用的 [Rust Edition](https://course.rs/appendix/rust-version.html)。

该配置将影响项目中的所有 `Cargo Target` 和包，前者包含测试用例、benchmark、可执行文件、示例等。

```toml
[package]
# ...
edition = '2021'
```

大多数时候，我们都无需手动指定，因为 `cargo new` 的时候，会自动帮我们添加。若 `edition` 配置不存在，那 `2015 Edition` 会被默认使用。

#### rust-version

可选字段，用于说明你的项目支持的最低 Rust 版本(编译器能顺利完成编译)。一旦你使用的 Rust 版本比这个字段设置的要低，`Cargo` 就会报错，然后告诉用户所需的最低版本。

该字段是在 Rust 1.56 引入的，若大家使用的 Rust 版本低于该版本，则该字段会被自动忽略时。

```toml
[package]
# ...
edition = '2021'
rust-version = "1.56"
```

还有一点，`rust-version` 必须比第一个引入 `edition` 的 Rust 版本要新。例如 Rust Edition 2021 是在 Rust 1.56 版本引入的，若你使用了 `edition = '2021'` 的 `[package]` 配置，则指定的 `rust version` 字段必须要要大于等于 `1.56` 版本。

还可以使用 `--ignore-rust-version` 命令行参数来忽略 `rust-version`。

该字段将影响项目中的所有 `Cargo Target` 和包，前者包含测试用例、benchmark、可执行文件、示例等。

## description

该字段是项目的简介，`crates.io` 会在项目首页使用该字段包含的内容，**不支持 `Markdown` 格式**。

```toml
[package]
# ...
description = "A short description of my package"
```

> 注意: 若发布 `crates.io` ，则该字段是必须的

## documentation

该字段用于说明项目文档的地址，若没有设置，`crates.io` 会自动链接到 `docs.rs` 上的相应页面。

```toml
[package]
# ...
documentation = "https://docs.rs/bitflags"
```

#### readme

`readme` 字段指向项目的 `Readme.md` 文件，该文件应该存在项目的根目录下(跟 `Cargo.toml` 同级)，用于向用户描述项目的详细信息，支持 `Markdown` 格式。大家看到的 `crates.io` 上的项目首页就是基于该文件的内容进行渲染的。

```toml
[package]
# ...
readme = "README.md"
```

若该字段未设置且项目根目录下存在 `README.md`、`README.txt` 或 `README` 文件，则该文件的名称将被默认使用。

你也可以通过将 `readme` 设置为 `false` 来禁止该功能，若设置为 `true` ，则默认值 `README.md` 将被使用。

#### homepage

该字段用于设置项目主页的 URL:

```toml
[package]
# ...
homepage = "https://serde.rs/"
```

#### repository

设置项目的源代码仓库地址，例如 `github` 链接:

```toml
[package]
# ...
repository = "https://github.com/rust-lang/cargo/"
```

#### license 和 license-file

`license` 字段用于描述项目所遵循的开源协议。而 `license-file` 则用于指定包含开源协议的文件所在的路径(相对于 `Cargo.toml`)。

如果要发布到 `crates.io` ，则该协议必须是 [SPDX2.1 协议表达式](https://doc.rust-lang.org/stable/cargo/reference/manifest.html#the-badges-section)。同时 `license` 名称必须是来自于 [SPDX 协议列表 3.11](https://github.com/spdx/license-list-data/tree/v3.11)。

SPDX 只支持使用 `AND` 、`OR` 来组合多个开源协议:

```toml
[package]
# ...
license = "MIT OR Apache-2.0"
```

`OR` 代表用户可以任选一个协议进行遵循，而 `AND` 表示用户必须要同时遵循两个协议。还可以通过 `WITH` 来在指定协议之外添加额外的要求:

- `MIT OR Apache-2.0`
- `LGPL-2.1-only AND MIT AND BSD-2-Clause`
- `GPL-2.0-or-later WITH Bison-exception-2.2`

**若项目使用了非标准的协议**，你可以通过指定 `license-file` 字段来替代 `license` 的使用:

```toml
[package]
# ...
license-file = "LICENSE.txt"
```

> 注意：crates.io 要求必须设置 `license` 或 `license-file`

#### keywords

该字段使用字符串数组的方式来指定项目的关键字列表，当用户在 `crates.io` 上搜索时，这些关键字可以提供索引的功能。

```toml
[package]
# ...
keywords = ["gamedev", "graphics"]
```

> 注意：`crates.io` 最多只支持 5 个关键字，每个关键字都必须是合法的 `ASCII` 文本，且需要使用字母作为开头，只能包含字母、数字、`_` 和 `-`，最多支持 20 个字符长度

#### categories

`categories` 用于描述项目所属的类别:

```toml
categories = ["command-line-utilities", "development-tools::cargo-plugins"]
```

> 注意：`crates.io` 最多只支持 5 个类别，目前不支持用户随意自定义类别，你所使用的类别需要跟 [https://crates.io/category_slugs](https://crates.io/category_slugs) 上的类别**精准匹配**。

#### workspace

该字段用于配置当前项目所属的工作空间。

若没有设置，则将沿着文件目录向上寻找，直至找到第一个 设置了 `[workspace]` 的`Cargo.toml`。因此，当一个成员不在工作空间的子目录时，设置该字段将非常有用。

```toml
[package]
# ...
workspace = "path/to/workspace/root"
```

需要注意的是 `Cargo.toml` 清单还有一个 `[workspace]` 部分专门用于设置工作空间，若它被设置了，则 `package` 中的 `workspace` 字段将无法被指定。这是因为一个包无法同时满足两个角色：

- 该包是工作空间的根包(root crate)，通过 `[workspace]` 指定)
- 该包是另一个工作空间的成员，通过 `package.workspace` 指定

若要了解工作空间的更多信息，请参见[这里](https://course.rs/toolchains/cargo/reference/workspaces.html)。

#### build

`build` 用于指定位于项目根目录中的构建脚本，关于构建脚本的更多信息，可以阅读 [构建脚本](https://course.rs/toolchains/cargo/reference/build-script/intro.html) 一章。

```toml
[package]
# ...
build = "build.rs"
```

还可以使用 `build = false` 来禁止构建脚本的自动检测。

#### links

用于指定项目链接的本地库的名称，更多的信息请看构建脚本章节的 [links](https://course.rs/toolchains/cargo/reference/build-script/intro.html#links)

```toml
[package]
# ...
links = "foo"
```

#### exclude 和 include

这两个字段可以用于显式地指定想要包含在外或在内的文件列表，往往用于发布到注册服务时。你可以使用 `cargo package --list` 来检查哪些文件被包含在项目中。

```toml
[package]
# ...
exclude = ["/ci", "images/", ".*"]
```

```toml
[package]
# ...
include = ["/src", "COPYRIGHT", "/examples", "!/examples/big_example"]
```

尽管大家可能没有指定 `include` 或 `exclude`，但是任然会有些规则自动被应用，一起来看看。

若 `include` 没有被指定，则以下文件将被排除在外:

- 项目不是 git 仓库，则所有以 `.` 开头的隐藏文件会被排除
- 项目是 git 仓库，通过 `.gitignore` 配置的文件会被排除

无论 `include` 或 `exclude` 是否被指定，以下文件都会被排除在外:

- 任何包含 `Cargo.toml` 的子目录会被排除
- 根目录下的 `target` 目录会被排除

以下文件会永远被 `include` ，你无需显式地指定：

- `Cargo.toml`
- 若项目包含可执行文件或示例代码，则最小化的 `Cargo.lock` 会自动被包含
- `license-file` 指定的协议文件

> 这两个字段很强大，但是对于生产实践而言，我们还是推荐通过 `.gitignore` 来控制，因为这样协作者更容易看懂。如果大家希望更深入的了解 `include/exclude`，可以参考下官方的 `Cargo` [文档](https://doc.rust-lang.org/stable/cargo/reference/manifest.html?search=#the-exclude-and-include-fields)

#### publish

该字段常常用于防止项目因为失误被发布到 `crates.io` 等注册服务上，例如如果希望项目在公司内部私有化，你应该设置：

```toml
[package]
# ...
publish = false
```

也可以通过字符串数组的方式来指定允许发布到的注册服务名称:

```toml
[package]
# ...
publish = ["some-registry-name"]
```

若 `publish` 数组中包含了一个注册服务名称，则 `cargo publish` 命令会使用该注册服务，除非你通过 `--registry` 来设定额外的规则。

#### metadata

Cargo 默认情况下会对 `Cargo.toml` 中未使用的 `key` 进行警告，以帮助大家提前发现风险。但是 `package.metadata` 并不在其中，因为它是由用户自定义的提供给外部工具的配置文件。例如：

```toml
[package]
name = "..."
# ...

# 以下配置元数据可以在生成安卓 APK 时使用
[package.metadata.android]
package-name = "my-awesome-android-app"
assets = "path/to/static"
```

与其相似的还有 `[workspace.metadata]`，都可以作为外部工具的配置信息来使用。

#### default-run

当大家使用 `cargo run` 来运行项目时，该命令会使用默认的二进制可执行文件作为程序启动入口。

我们可以通过 `default-run` 来修改默认的入口，例如现在有两个二进制文件 `src/bin/a.rs` 和 `src/bin/b.rs`，通过以下配置可以将入口设置为前者:

```toml
[package]
default-run = "a"
```

## [badges]

该部分用于指定项目当前的状态，该状态会展示在 `crates.io` 的项目主页中，例如以下配置可以设置项目的维护状态:

```toml
[badges]
# `maintenance` 是项目的当前维护状态，它可能会被其它注册服务所使用，但是目前还没有被 `crates.io` 使用:  https://github.com/rust-lang/crates.io/issues/2437
#
# `status` 字段时必须的，以下是可用的选项:
# - `actively-developed`: 新特性正在积极添加中，bug 在持续修复中
# - `passively-maintained`: 目前没有计划去支持新的特性，但是项目维护者可能会回答你提出的 issue
# - `as-is`: 该项目的功能已经完结，维护者不准备继续开发和提供支持了，但是它的功能已经达到了预期
# - `experimental`: 作者希望同大家分享，但是还不准备满足任何人的特殊要求
# - `looking-for-maintainer`: 当前维护者希望将项目转移给新的维护者
# - `deprecated`: 不再推荐使用该项目，需要说明原因以及推荐的替代项目
# - `none`:  不显示任何 badge ，因此维护者没有说明他们的状态，用户需要自己去调查发生了什么
maintenance = { status = "..." }
```

## [dependencies]

在[之前章节](http://course.rs/toolchains/cargo/reference/specify-deps.html)中，我们已经详细介绍过 `[dependencies]` 、 `[dev-dependencies]` 和 `[build-dependencies]`，这里就不再赘述。

## [profile.*]

该部分可以对编译器进行配置，例如 debug 和优化，在后续的[编译器优化](http://course.rs/toolchains/cargo/reference/profiles.html)章节有详细介绍。

