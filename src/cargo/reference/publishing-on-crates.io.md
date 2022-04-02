# 发布到 crates.io

如果你想要把自己的开源项目分享给全世界，那最好的办法自然是 github。但如果是 Rust 的库，那除了发布到 github 外，我们还可以将其发布到 [crates.io](https://crates.io) 上，然后其它用户就可以很简单的对其进行引用。

> 注意：发布包到 `crates.io` 后，特定的版本无法被覆盖，要发布就必须使用新的版本号，代码也无法被删除!

## 首次发布之前

**首先，我们需要一个账号**：访问 crates.io 的[主页](https://crates.io)，然后在右上角使用 Github 账户登陆，接着访问你的[账户设置](https://crates.io/settings/profile)页面，进入到 API Tokens 标签页下，生成新的 Token，并使用该 Token 在终端中进行登录:

```shell
$ cargo login abcdefghijklmnopqrstuvwxyz012345
```

该命令将告诉 Cargo 你的 API Token，然后将其存储在本地的 `~/.cargo/credentials.toml` 文件中。

> 注意：你需要妥善保管好 API Token，并且不要告诉任何人，一旦泄漏，请撤销( Revoke )并重新生成。

## 发布包之前

`crates.io` 上的**包名遵循先到先得**的方式：一旦你想要的包名已经被使用，那么你就得换一个不同的包名。

在发布之前，**确保** `Cargo.toml` 中以下字段已经被设置:

- [license 或 license-file](https://course.rs/cargo/reference/manifest.html#license和license-file)
- [description](https://course.rs/cargo/reference/manifest.html#description)
- [homepage](https://course.rs/cargo/reference/manifest.html#homepage)
- [documentation](https://course.rs/cargo/reference/manifest.html#documentation)
- [repository](https://course.rs/cargo/reference/manifest.html#repository)
- [readme](https://course.rs/cargo/reference/manifest.html#readme)

你还可以设置[关键字](https://course.rs/cargo/reference/manifest.html#keywords)和[类别](https://course.rs/cargo/reference/manifest.html#categories)等元信息，让包更容易被其他人搜索发现，虽然它们不是必须的。

如果你发布的是一个依赖库，那么你可能需要遵循相关的[命名规范](https://course.rs/practice/naming.html)和 [API Guidlines](https://rust-lang.github.io/api-guidelines/).

## 打包

下一步就是将你的项目进行打包，然后上传到 `crates.io`。为了实现这个目的，我们可以使用 `cargo publish` 命令，该命令执行了以下步骤：

1. 对项目进行一些验证
2. 将源代码压缩到 `.crate` 文件中
3. 将 `.crate` 文件解压并放入到临时的目录中，并验证解压出的代码可以顺利编译
4. 上传 `.crate` 文件到 `crates.io`
5. 注册服务会对上传的包进行一些额外的验证，然后才会添加它到注册服务列表中

在发布之前，我们推荐你先运行 `cargo publish --dry-run` (或 [`cargo package`](https://doc.rust-lang.org/stable/cargo/commands/cargo-package.html) ) 命令来确保代码没有 warning 或错误。

```shell
$ cargo publish --dry-run
```

你可以在 `target/package` 目录下观察生成的 `.crate` 文件。例如，目前 `crates.io` 要求该文件的大小不能超过 10MB，你可以通过手动检查该文件的大小来确保不会无意间打包进一些较大的资源文件，比如测试数据、网站文档或生成的代码等。我们还可以使用以下命令来检查其中包含的文件:

```shell
$ cargo package --list
```

当打包时，Cargo 会自动根据版本控制系统的配置来忽略指定的文件，例如 `.gitignore`。除此之外，你还可以通过 [`exclude`](https://course.rs/cargo/reference/manifest.html#exclude和include) 来排除指定的文件:

```toml
[package]
# ...
exclude = [
    "public/assets/*",
    "videos/*",
]
```

如果想要显式地将某些文件包含其中，可以使用 `include`，但是需要注意的是，这个 key 一旦设置，那 `exclude` 就将失效：

```toml
[package]
# ...
include = [
    "**/*.rs",
    "Cargo.toml",
]
```

## 上传包

准备好后，我们就可以正式来上传指定的包了，在根目录中运行：

```shell
$ cargo pulish
```

就是这么简单，恭喜你，完成了第一个包的发布！

## 发布已上传包的新版本

绝大多数时候，我们并不是在发布新包，而是发布已经上传过的包的新版本。

为了实现这一点，只需修改 `Cargo.toml` 中的 [`version`](https://course.rs/cargo/reference/manifest.html#version) 字段 ，但需要注意：**版本号需要遵循 `semver` 规则**。

然后再次使用 `cargo publish` 就可以上传新的版本了。

## 管理 crates.io 上的包

目前来说，管理包更多地是通过 `cargo` 命令而不是在线管理，下面是一些你可以使用的命令。

#### cargo yank

有的时候你会遇到发布的包版本实际上并不可用(例如语法错误，或者忘记包含一个文件等)，对于这种情况，Cargo 提供了 yank 命令:

```shell
$ cargo yank --vers 1.0.1
$ cargo yank --vers 1.0.1 --undo
```

该命令**并不能删除任何代码**，例如如果你上传了一段隐私内容，你需要的是立刻重置它们，而不是使用 `cargo yank`。

`yank` 能做到的就是让其它人不能再使用这个版本作为依赖，但是现存的依赖依然可以继续工作。`crates.io` 的一个主要目标就是作为一个不会随着时间变化的永久性包存档，但**删除某个版本显然违背了这个目标**。

#### cargo owner

一个包可能会有多个主要开发者，甚至维护者 maintainer 都会发生变更。目前来说，只有包的 owner 才能发布新的版本，但是一个 owner 可以指定其它的用户为 owner:

```shell
$ cargo owner --add github-handle
$ cargo owner --remove github-handle
$ cargo owner --add github:rust-lang:owners
$ cargo owner --remove github:rust-lang:owners
```

命令中使用的 ownerID 必须是 Github 用户名或 Team 名。

一旦一个用户 `B` 通过 `--add` 被加入到 `owner` 列表中，他将拥有该包相关的所有权利。例如发布新版本、yank 一个版本，还能增加和移除 owner，包含添加 `B` 为 owner 的 `A` 都可以被移除！

因此，我们必须严肃的指出：**不要将你不信任的人添加为 owner !** 免得哪天反目成仇后，他把你移除了 - , -

但是对于 Team 又有所不同，通过 `-add` 添加的 Github Team owner，只拥有受限的权利。它们可以发布或 yank 某个版本，但是他们**不能添加或移除** owner！总之，Team 除了可以很方便的管理所有者分组的同时，还能防止一些未知的恶意。

如果大家在添加 team 时遇到问题，可以看看官方的[相关文档](https://doc.rust-lang.org/stable/cargo/reference/publishing.html#github-permissions)，由于绝大多数人都无需此功能，因此这里不再详细展开。
