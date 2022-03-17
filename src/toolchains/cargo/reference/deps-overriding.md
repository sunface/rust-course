# 依赖覆盖

依赖覆盖对于本地开发来说，是很常见的，大部分原因都是我们希望在某个包发布到 `crates.io` 之前使用它，例如：

- 你正在同时开发一个包和一个项目，而后者依赖于前者，你希望能在能项目中对正在开发的包进行测试
- 你引入的一个依赖包在 `master` 分支发布了新的代码，恰好修复了某个 bug，因此你希望能单独对该分支进行下测试
- 你即将发布一个包的新版本，为了确保新版本正常工作，你需要对其进行集成测试
- 你为项目的某个依赖包提了一个 PR 并解决了一个重要 bug，在等待合并到 `master` 分支，但是时间不等人，因此你决定先使用自己修改的版本，等未来合并后，再继续使用官方版本

下面我们来具体看看类似的问题该如何解决。

> 上一章节中我们讲了如果通过[多种引用方式](https://course.rs/cargo/reference/specify-deps/intro.html#多引用方式混合)来引入一个包，其实这也是一种依赖覆盖。

## 测试 bugfix 版本

假设我们有一个项目正在使用 [`uuid`](https://crates.io/crates/uuid) 依赖包，但是却不幸地发现了一个 bug，由于这个 bug 影响了使用，没办法等到官方提交新版本，因此还是自己修复为好。

我们项目的 `Cargo.toml` 内容如下：

```toml
[package]
name = "my-library"
version = "0.1.0"

[dependencies]
uuid = "0.8.2"
```

为了修复 `bug`，首先需要将 `uuid` 的源码克隆到本地，笔者是克隆到和项目同级的目录下:

```shell
git clone https://github.com/uuid-rs/uuid
```

下面，修改项目的 `Cargo.toml` 添加以下内容以引入本地克隆的版本:

```toml
[patch.crates-io]
uuid = { path = "../uuid" }
```

这里我们使用自己修改过的 `patch` 来覆盖来自 `crates.io` 的版本，由于克隆下来的 `uuid` 目录和我们的项目同级，因此通过相对路径 "../uuid" 即可定位到。

在成功为 `uuuid` 打了本地补丁后，现在尝试在项目下运行 `cargo build`，但是却报错了，而且报错内容有一些看不太懂：

```shell
$ cargo build
    Updating crates.io index
warning: Patch `uuid v1.0.0-alpha.1 (/Users/sunfei/development/rust/demos/uuid)` was not used in the crate graph.
Check that the patched package version and available features are compatible
with the dependency requirements. If the patch has a different version from
what is locked in the Cargo.lock file, run `cargo update` to use the new
version. This may also occur with an optional dependency that is not enabled.
```

具体原因比较复杂，但是仔细观察，会发现克隆下来的 `uuid` 的版本是 `v1.0.0-alpha.1` (在 `"../uuid/Cargo.toml"` 中可以查看)，然后我们本地引入的 `uuid` 版本是 `0.8.2`，根据之前讲过的 `crates.io` 的[版本规则](https://course.rs/cargo/reference/specify-deps/intro.html#从-cratesio-引入依赖包)，这两者是不兼容的，`0.8.2` 只能升级到 `0.8.z`，例如 `0.8.3`。

既然如此，我们先将 "../uuid/Cargo.toml" 中的 `version = "1.0.0-alpha.1"` 修改为 `version = "0.8.3"` ，然后看看结果先:

```shell
$ cargo build
    Updating crates.io index
   Compiling uuid v0.8.3 (/Users/sunfei/development/rust/demos/uuid)
```

大家注意到最后一行了吗？我们成功使用本地的 `0.8.3` 版本的 `uuid` 作为最新的依赖，因此也侧面证明了，补丁 `patch` 的版本也必须遵循相应的版本兼容规则！

如果修改后还是有问题，大家可以试试以下命令，指定版本进行更新:

```shell
% cargo update -p uuid --precise 0.8.3
    Updating crates.io index
    Updating uuid v0.8.3 (/Users/sunfei/development/rust/demos/uuid) -> v0.8.3
```

修复 bug 后，我们可以提交 pr 给 `uuid`，一旦 pr 被合并到了 `master` 分支，你可以直接通过以下方式来使用补丁:

```shell
[patch.crates-io]
uuid = { git = 'https://github.com/uuid-rs/uuid' }
```

等未来新的内容更新到 `crates.io` 后，大家就可以移除这个补丁，直接更新 `[dependencies]` 中的 `uuid` 版本即可！

## 使用未发布的小版本

还是 `uuid` 包，这次假设我们要为它新增一个特性，同时我们已经修改完毕，在本地测试过，并提交了相应的 pr，下面一起来看看该如何在它发布到 `crates.io` 之前继续使用。

再做一个假设，对于 `uuid` 来说，目前 `crates.io` 上的版本是 `1.0.0`，在我们提交了 pr 并合并到 `master` 分支后，`master` 上的版本变成了 `1.0.1`，这意味着未来 `crates.io` 上的版本也将变成 `1.0.1`。

为了使用新加的特性，同时当该包在未来发布到 `crates.io` 后，我们可以自动使用 `crates.io` 上的新版本，而无需再使用 `patch` 补丁，可以这样修改 `Cargo.toml`：

```toml
[package]
name = "my-library"
version = "0.1.0"

[dependencies]
uuid = "1.0.1"

[patch.crates-io]
uuid = { git = 'https://github.com/uuid-rs/uuid' }
```

注意，我们将 `[dependencies]` 中的 `uuid` 版本提前修改为 `1.0.1`，由于该版本在 `crates.io` 尚未发布，因此 `patch` 版本会被使用。

现在，我们的项目是基于 `patch` 版本的 `uuid` 来构建，也就是从 `gihtub` 的 `master` 分支中拉取最新的 `commit` 来构建。一旦未来 `crates.io` 上有了 `1.0.1` 版本，那项目就会继续基于 `crates.io` 来构建，此时，`patch` 就可以删除了。

#### 间接使用 `patch`

现在假设项目 `A` 的依赖是 `B` 和 `uuid`，而 `B` 的依赖也是 `uuid`，此时我们可以让 `A` 和 `B` 都使用来自 `github` 的 `patch` 版本，配置如下:

```toml
[package]
name = "my-binary"
version = "0.1.0"

[dependencies]
my-library = { git = 'https://example.com/git/my-library' }
uuid = "1.0.1"

[patch.crates-io]
uuid = { git = 'https://github.com/uuid-rs/uuid' }
```

如上所示，`patch` 不仅仅对于 `my-binary` 项目有用，对于 `my-binary` 的依赖 `my-library` 来说，一样可以间接生效。

#### 非 crates.io 的 patch

若我们想要覆盖的依赖并不是来自 `crates.io` ，就需要对 `[patch]` 做一些修改。例如依赖是 `git` 仓库，然后使用本地路径来覆盖它:

```shell
[patch."https://github.com/your/repository"]
my-library = { path = "../my-library/path" }
```

easy，轻松搞定!

## 使用未发布的大版本

现在假设我们要发布一个大版本 `2.0.0`，与之前类似，可以将 `Cargo.toml` 修改如下:

```toml
[dependencies]
uuid = "2.0"

[patch.crates-io]
uuid = { git = "https://github.com/uuid-rs/uuid", branch = "2.0.0" }
```

此时 `2.0` 版本在 `crates.io` 上还不存在，因此我们使用了 `patch` 版本且指定了 `branch = "2.0.0"`。

#### 间接使用 `patch`

这里需要注意，**与之前的小版本不同，大版本的 `patch` 不会发生间接的传递！**，例如：

```shell
[package]
name = "my-binary"
version = "0.1.0"

[dependencies]
my-library = { git = 'https://example.com/git/my-library' }
uuid = "1.0"

[patch.crates-io]
uuid = { git = 'https://github.com/uuid-rs/uuid', branch = '2.0.0' }
```

以上配置中, `my-binary` 将继续使用 `1.x.y` 系列的版本，而 `my-library` 将使用最新的 `2.0.0` patch。

原因是，大版本更新往往会带来破坏性的功能，Rust 为了让我们平稳的升级，采用了滚动的方式：在依赖图中逐步推进更新，而不是一次性全部更新。

## 多版本[patch]

在之前章节，我们介绍过如何使用 `package key` 来[重命名依赖包](https://course.rs/cargo/reference/specify-deps/intro.html#在-cargotoml-中重命名依赖)，现在来看看如何使用它同时引入多个 `patch`。

假设，我们对 `serde` 有两个新的 `patch` 需求:

- `serde` 官方解决了一个 `bug` 但是还没发布到 `crates.io`，我们想直接从 `git` 仓库的最新 `commit` 拉取版本 `1.*`
- 我们自己为 `serde` 添加了新的功能，命名为 `2.0.0` 版本，并将该版本上传到自己的 `git` 仓库中

为了满足这两个 `patch`，可以使用如下内容的 `Cargo.toml`：

```toml
[patch.crates-io]
serde = { git = 'https://github.com/serde-rs/serde' }
serde2 = { git = 'https://github.com/example/serde', package = 'serde', branch = 'v2' }
```

第一行说明，第一个 `patch` 从官方仓库 `main` 分支的最新 `commit` 拉取，而第二个则从我们自己的仓库拉取 `v2` 分支，同时将其重命名为 `serde2`。

这样，在代码中就可以分别通过 `serde` 和 `serde2` 引用不同版本的依赖库了。

## 通过[path]来覆盖依赖

有时我们只是临时性地对一个项目进行处理，因此并不想去修改它的 `Cargo.toml`。此时可以使用 `Cargo` 提供的路径覆盖方法: **注意，这个方法限制较多，如果可以，还是要使用 [patch]**。

与 `[patch]` 修改 `Cargo.toml` 不同，路径覆盖修改的是 `Cargo` 自身的[配置文件](https://course.rs/cargo/guide/cargo-cache.html#cargo-home) `$Home/.cargo/config.toml`:

```toml
paths = ["/path/to/uuid"]
```

`paths` 数组中的元素是一个包含 `Cargo.toml` 的目录(依赖包)，在当前例子中，由于我们只有一个 `uuid`，因此只需要覆盖它即可。目标路径可以是相对的，也是绝对的，需要注意，如果是相对路径，那是相对包含 `.cargo` 的 `$Home` 来说的。

## 不推荐的[replace]

> `[replace]` 已经被标记为 `deprecated`，并将在未来被移除，请使用 `[patch]` 替代

虽然不建议使用，但是如果大家阅读其它项目时依然可能会碰到这种用法:

```toml
[replace]
"foo:0.1.0" = { git = 'https://github.com/example/foo' }
"bar:1.0.2" = { path = 'my/local/bar' }
```

语法看上去还是很清晰的，`[replace]` 中的每一个 `key` 都是 `Package ID` 格式，通过这种写法可以在依赖图中任意挑选一个节点进行覆盖。
