# Cargo 缓存

Cargo 使用了缓存的方式提升构建效率，当构建时，Cargo 会将已下载的依赖包放在 `CARGO_HOME` 目录下，下面一起来看看。

## Cargo Home

默认情况下，Cargo Home 所在的目录是 `$HOME/.cargo/`，例如在 `macos` ，对应的目录是:

```shell
$ echo $HOME/.cargo/
/Users/sunfei/.cargo/
```

我们也可以通过修改 `CARGO_HOME` 环境变量的方式来重新设定该目录的位置。若你需要在项目中通过代码的方式来获取 `CARGO_HOME` ，[`home`](https://crates.io/crates/home) 包提供了相应的 API。

> 注意！ Cargo Home 目录的内部结构并没有稳定化，在未来可能会发生变化

## 文件

- `config.toml` 是 Cargo 的全局配置文件，具体请查看[这里](https://course.rs/toolchains/cargo/reference/configuration.html)
- `credentials.toml` 为 `cargo login` 提供私有化登录证书，用于登录 `package` 注册中心，例如 `crates.io`
- `.crates.toml`, `.crates2.json` 这两个是隐藏文件，包含了通过 `cargo install` 安装的包的 `package` 信息，**请不要手动修改！**

## 目录

- `bin` 目录包含了通过 `cargo install` 或 `rustup` 下载的包编译出的可执行文件。你可以将该目录加入到 `$PATH` 环境变量中，以实现对这些可执行文件的直接访问
- `git` 中存储了 `Git` 的资源文件:
  - `git/db`，当一个包依赖某个 `git` 仓库时，`Cargo` 会将该仓库克隆到 `git/db` 目录下，如果未来需要还会对其进行更新
  - `git/checkouts`，若指定了 `git` 源和 `commit`，那相应的仓库就会从 `git/db` 中 `checkout` 到该目录下，因此同一个仓库的不同 `checkout` 共存成为了可能性
- `registry` 包含了注册中心( 例如 `crates.io` )的元数据 和 `packages`
  - `registry/index` 是一个 git 仓库，包含了注册中心中所有可用包的元数据( 版本、依赖等 )
  - `registry/cache` 中保存了已下载的依赖，这些依赖包以 `gzip` 的压缩档案形式保存，后缀名为 `.crate`
  - `registry/src`，若一个已下载的 `.crate` 档案被一个 `package` 所需要，该档案会被解压缩到 `registry/src` 文件夹下，最终 `rustc` 可以在其中找到所需的 `.rs` 文件

## 在 CI 时缓存 Cargo Home

为了避免持续集成时重复下载所有的包依赖，我们可以将 `$CARGO_HOME` 目录进行缓存，但缓存整个目录是效率低下的，原因是源文件可能会被缓存两次。

例如我们依赖一个包 `serde 1.0.92`，如果将整个 `$CACHE_HOME` 目录缓存，那么`serde` 的源文件就会被缓存两次：在 `registry/cache` 中的 `serde-1.0.92.crate` 以及 `registry/src` 下被解压缩的 `.rs` 文件。

因此，在 CI 构建时，出于效率的考虑，我们仅应该缓存以下目录:

- `bin/`
- `registry/index/`
- `registry/cache/`
- `git/db/`

## 清除缓存

理论上，我们可以手动移除缓存中的任何一部分，当后续有包需要时 `Cargo` 会尽可能去恢复这些资源：

- 解压缩 `registry/cache` 下的 `.crate` 档案
- 从 `.git` 中 `checkout` 缓存的仓库
- 如果以上都没了，会从网络上重新下载

你也可以使用 [cargo-cache](https://crates.io/crates/cargo-cache) 包来选择性的清除 `cache` 中指定的部分，当然，它还可以用来查看缓存中的组件大小。

## 构建时卡住：Blocking waiting for file lock ..

在开发过程中，或多或少我们都会碰到这种问题，例如你同时打开了 VSCode IDE 和终端，然后在 `Cargo.toml` 中刚添加了一个新的依赖。

此时 IDE 会捕捉到这个修改然后自动去重新下载依赖(这个过程可能还会更新 `crates.io` 使用的索引列表)，在此过程中， Cargo 会将相关信息写入到 `$HOME/.cargo/.package_cache` 下，并将其锁住。

如果你试图在另一个地方(例如终端)对同一个项目进行构建，就会报错: `Blocking waiting for file lock on package cache`。

解决办法很简单：

- 既然下载慢，那就使用[国内的注册服务](https://course.rs/toolchains/cargo/reference/specify-deps.html#从其它注册服务引入依赖包)，不再使用 crates.io
- 耐心等待持有锁的用户构建完成
- 强行停止正在构建的进程，例如杀掉 IDE 使用的 rust-analyer 插件进程，然后删除 `$HOME/.cargo/.package_cache` 目录

