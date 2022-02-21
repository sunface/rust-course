# Cargo.toml格式讲解
`Cargo.toml` 又被称为清单( `manifest` )，文件格式是 `TOML`，每一个清单文件都由以下部分组成：

* [`cargo-features`](unstable.md) — 只能用于 `nightly`版本的 `feature`
* [`[package]`](#package) — 定义项目( `package` )的元信息
  * [`name`](#name) — 名称
  * [`version`](#the-version-field) — 版本
  * [`authors`](#the-authors-field) — 开发作者
  * [`edition`](#the-edition-field) — Rust edition.
  * [`rust-version`](#the-rust-version-field) — 支持的最小化 Rust 版本
  * [`description`](#the-description-field) — 描述
  * [`documentation`](#the-documentation-field) — 文档 URL
  * [`readme`](#the-readme-field) — README 文件的路径
  * [`homepage`](#the-homepage-field) - 主页 URL
  * [`repository`](#the-repository-field) — 源代码仓库的 URL 
  * [`license`](#the-license-and-license-file-fields) — 开源协议 License.
  * [`license-file`](#the-license-and-license-file-fields) — License 文件的路径.
  * [`keywords`](#the-keywords-field) — 项目的关键词
  * [`categories`](#the-categories-field) — 项目分类
  * [`workspace`](#the-workspace-field) — 工作空间 workspace 的路径
  * [`build`](#the-build-field) — 构建脚本的路径
  * [`links`](#the-links-field) — 本地链接库的名称
  * [`exclude`](#the-exclude-and-include-fields) — 发布时排除的文件
  * [`include`](#the-exclude-and-include-fields) — 发布时包含的文件
  * [`publish`](#the-publish-field) — 用于阻止项目的发布
  * [`metadata`](#the-metadata-table) — 额外的信息，用于提供给外部工具
  * [`default-run`](#the-default-run-field) — [`cargo run`] 所使用的默认可执行文件( binary )
  * [`autobins`](cargo-targets.md#target-auto-discovery) — 禁止可执行文件的自动发现
  * [`autoexamples`](cargo-targets.md#target-auto-discovery) — 禁止示例文件的自动发现
  * [`autotests`](cargo-targets.md#target-auto-discovery) — 禁止测试文件的自动发现
  * [`autobenches`](cargo-targets.md#target-auto-discovery) — 禁止 bench 文件的自动发现
  * [`resolver`](resolver.md#resolver-versions) — 设置依赖解析器( dependency resolver)
* Cargo Target 列表: (查看 [Target 配置](cargo-target.md#Target配置) 获取详细设置)
  * [`[lib]`](./cargo-target.md#library) — Library target 设置.
  * [`[[bin]]`](cargo-target.md#binaries) — Binary target 设置.
  * [`[[example]]`](cargo-target.md#examples) — Example target 设置.
  * [`[[test]]`](cargo-target.md#tests) — Test target 设置.
  * [`[[bench]]`](cargo-target.md#benchmarks) — Benchmark target 设置.
* Dependency tables:
  * [`[dependencies]`](specify-deps.md) — 项目依赖包
  * [`[dev-dependencies]`](specify-deps.md#dev-dependencies) — 用于 examples、tests 和 benchmarks 的依赖包
  * [`[build-dependencies]`](specify-deps.md#build-dependencies) — 用于构建脚本的依赖包
  * [`[target]`](specify-deps.md#根据平台引入依赖) — 平台特定的依赖包
* [`[badges]`](#the-badges-section) — 用于在注册服务(例如 crates.io ) 上显示项目的当前维护状态
* [`[features]`](features.md) — `features` 可以用于条件编译
* [`[patch]`](deps-overriding.md) — 推荐使用的依赖覆盖方式
* [`[replace]`](deps-overriding.md#不推荐的replace) — 不推荐使用的依赖覆盖方式 (deprecated).
* [`[profile]`](profiles.md) — 编译器设置和优化
* [`[workspace]`](workspaces.md) — 工作空间的定义

下面，我们将对其中一些部分进行详细讲解。

## [package]
`Cargo.toml` 中第一个部分就是 `package`，用于设置项目的相关信息：
```toml
[package]
name = "hello_world" # the name of the package
version = "0.1.0"    # the current version, obeying semver
authors = ["Alice <a@example.com>", "Bob <b@example.com>"]
```

其中，只有 `name` 和 `version` 字段是**必须填写的**。当发布到注册服务时，可能会有额外的字段要求，具体参见[发布到crates.io](publishing-on-crates.io.md)。

#### name
项目名用于引用一个项目( `package` )，它有几个用途：

- 其它项目引用我们的 `package` 时，会使用该 `name`
- 编译出的可执行文件(bin target)的默认名称

`name` 只能使用 [`alphanumeric`](https://doc.rust-lang.org/stable/std/primitive.char.html#method.is_alphanumeric) 字符、 `-` 和 `_`，并且不能为空。

事实上，`name` 的限制不止如此，例如:

- **当使用 `cargo new` 或 `cargo init` 创建时**，`name` 还会被施加额外的限制，例如不能使用Rust 关键字名称作为 `name`
- **如果要发布到 `crates.io` ，那还有更多的限制**: `name` 使用 `ASCII` 码，不能使用已经被使用的名称，例如 `uuid` 已经在 `crates.io` 上被使用，因此我们只能使用类如 `uuid_v1` 的名称，才能将项目发布到 `crates.io` 上

#### version
Cargo 使用了[语义化版本控制](https://semver.org)的概念，例如字符串 `"0.1.12"` 是一个 `semver` 格式的版本号，符合 `"x.y.z"` 的形式，其中 `x` 被称为主版本(major), `y` 被称为小版本 `minor` ，而 `z` 被称为 补丁 `patch`，可以看出从左到右，版本的影响范围逐步降低，补丁的更新是无关痛痒的，并不会造成 API 的兼容性被破坏。

使用该规则，你还需要遵循一些基本规则:

- 在版本到达 `1.0.0` 之前，怎么都行，但是如果有破坏性变更( breaking changes )，需要增加 `minor` 版本号。例如，为结构体新增字段或为枚举新增成员就是一种破坏性变更