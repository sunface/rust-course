# 通过 config.toml 对 Cargo 进行配置

Cargo 相关的配置有两种，第一种是对自身进行配置，第二种是对指定的项目进行配置，关于后者请查看 [Cargo.toml 清单](https://course.rs/cargo/reference/manifest.html)。对于普通用户而言第二种才是我们最常使用的。

本文讲述的是如何对 Cargo 相关的工具进行配置，该配置中的部分内容可能会覆盖掉 `Cargo.toml` 中对应的部分，例如关于 `profile` 的内容。

## 层级结构

在前面我们已经见识过如何为 Cargo 进行全局配置：`$HOME/.cargo/config.toml`，事实上，还支持在一个 `package` 内对它进行配置。

总体原则是：`Cargo` 会顺着当前目录往上查找，直到找到目标配置文件。例如我们在目录 `/projects/foo/bar/baz` 下调用 Cargo 命令，那查找路径如下所示：

- `/projects/foo/bar/baz/.cargo/config.toml`
- `/projects/foo/bar/.cargo/config.toml`
- `/projects/foo/.cargo/config.toml`
- `/projects/.cargo/config.toml`
- `/.cargo/config.toml`
- `$CARGO_HOME/config.toml` 默认是 :
  - Windows: `%USERPROFILE%\.cargo\config.toml`
  - Unix: `$HOME/.cargo/config.toml`

有了这种机制，我们既可以在全局中设置默认的配置，又可以每个包都设定独立的配置，甚至还能做版本控制。

如果一个 `key` 在多个配置中出现，那这些 `key` 只会保留一个：最靠近 Cargo 执行目录的配置文件中的 key 的值将被最终使用(因此， $HOME 下的都是最低优先级)。**需要注意的是，如果 `key` 的值是数组，那相应的值将被合并( join )**。

对于工作空间而言，`Cargo` 的搜索策略是从 root 开始，对于内部成员中包含的 `.cargo.toml` 会自动忽略。例如一个工作空间拥有两个成员，每个成员都有配置文件: `/projects/foo/bar/baz/mylib/.cargo/config.toml` 和 `/projects/foo/bar/baz/mybin/.cargo/config.toml`，但是 `Cargo` 并不会读取它们而是从工作空间的根( `/projects/foo/bar/baz/` )开始往上查找。

> 注意：Cargo 还支持没有 `.toml` 后缀的 `.cargo/config` 文件。对于 `.toml` 的支持是从 Rust 1.39 版本开始，同时也是目前最推荐的方式。**但若同时存在有后缀和无后缀的文件，Cargo 将使用无后缀的!**

## 配置文件概览

下面是一个完整的配置文件，并对**常用的选项**进行了翻译，大家可以参考下:

```toml
paths = ["/path/to/override"] # 覆盖 `Cargo.toml` 中通过 path 引入的本地依赖

[alias]     # 命令别名
b = "build"
c = "check"
t = "test"
r = "run"
rr = "run --release"
space_example = ["run", "--release", "--", "\"command list\""]

[build]
jobs = 1                      # 并行构建任务的数量，默认等于 CPU 的核心数
rustc = "rustc"               # rust 编译器
rustc-wrapper = "…"           # 使用该 wrapper 来替代 rustc
rustc-workspace-wrapper = "…" # 为工作空间的成员使用 该 wrapper 来替代 rustc
rustdoc = "rustdoc"           # 文档生成工具
target = "triple"             # 为 target triple 构建 ( `cargo install` 会忽略该选项)
target-dir = "target"         # 存放编译输出结果的目录
rustflags = ["…", "…"]        # 自定义flags，会传递给所有的编译器命令调用
rustdocflags = ["…", "…"]     # 自定义flags，传递给 rustdoc
incremental = true            # 是否开启增量编译
dep-info-basedir = "…"        # path for the base directory for targets in depfiles
pipelining = true             # rustc pipelining

[doc]
browser = "chromium"          # `cargo doc --open` 使用的浏览器,
                              # 可以通过 `BROWSER` 环境变量进行重写

[env]
# Set ENV_VAR_NAME=value for any process run by Cargo
ENV_VAR_NAME = "value"
# Set even if already present in environment
ENV_VAR_NAME_2 = { value = "value", force = true }
# Value is relative to .cargo directory containing `config.toml`, make absolute
ENV_VAR_NAME_3 = { value = "relative/path", relative = true }

[cargo-new]
vcs = "none"              # 所使用的 VCS  ('git', 'hg', 'pijul', 'fossil', 'none')

[http]
debug = false               # HTTP debugging
proxy = "host:port"         # HTTP 代理，libcurl 格式
ssl-version = "tlsv1.3"     # TLS version to use
ssl-version.max = "tlsv1.3" # 最高支持的 TLS 版本
ssl-version.min = "tlsv1.1" # 最小支持的 TLS 版本
timeout = 30                # HTTP 请求的超时时间，秒
low-speed-limit = 10        # 网络超时阈值 (bytes/sec)
cainfo = "cert.pem"         # path to Certificate Authority (CA) bundle
check-revoke = true         # check for SSL certificate revocation
multiplexing = true         # HTTP/2 multiplexing
user-agent = "…"            # the user-agent header

[install]
root = "/some/path"         # `cargo install` 安装到的目标目录

[net]
retry = 2                   # 网络重试次数
git-fetch-with-cli = true   # 是否使用 `git` 命令来执行 git 操作
offline = true              # 不能访问网络

[patch.<registry>]
# Same keys as for [patch] in Cargo.toml

[profile.<name>]         # profile 配置，详情见"如何在 Cargo.toml 中配置 profile" : https://course.rs/cargo/reference/profiles.html#profile设置
opt-level = 0
debug = true
split-debuginfo = '...'
debug-assertions = true
overflow-checks = true
lto = false
panic = 'unwind'
incremental = true
codegen-units = 16
rpath = false
[profile.<name>.build-override]
[profile.<name>.package.<name>]

[registries.<name>]  # 设置其它的注册服务： https://course.rs/cargo/reference/specify-deps.html#从其它注册服务引入依赖包
index = "…"          # 注册服务索引列表的 URL
token = "…"          # 连接注册服务所需的鉴权 token

[registry]
default = "…"        # 默认的注册服务名称: crates.io
token = "…"

[source.<name>]      # 注册服务源和替换source definition and replacement
replace-with = "…"   # 使用给定的 source 来替换当前的 source，例如使用科大源来替换crates.io源以提升国内的下载速度：[source.crates-io] replace-with = 'ustc'
directory = "…"      # path to a directory source
registry = "…"       # 注册源的 URL ，例如科大源: [source.ustc] registry = "git://mirrors.ustc.edu.cn/crates.io-index"
local-registry = "…" # path to a local registry source
git = "…"            # URL of a git repository source
branch = "…"         # branch name for the git repository
tag = "…"            # tag name for the git repository
rev = "…"            # revision for the git repository

[target.<triple>]
linker = "…"            # linker to use
runner = "…"            # wrapper to run executables
rustflags = ["…", "…"]  # custom flags for `rustc`

[target.<cfg>]
runner = "…"            # wrapper to run executables
rustflags = ["…", "…"]  # custom flags for `rustc`

[target.<triple>.<links>] # `links` build script override
rustc-link-lib = ["foo"]
rustc-link-search = ["/path/to/foo"]
rustc-flags = ["-L", "/some/path"]
rustc-cfg = ['key="value"']
rustc-env = {key = "value"}
rustc-cdylib-link-arg = ["…"]
metadata_key1 = "value"
metadata_key2 = "value"

[term]
verbose = false        # whether cargo provides verbose output
color = 'auto'         # whether cargo colorizes output
progress.when = 'auto' # whether cargo shows progress bar
progress.width = 80    # width of progress bar
```

## 环境变量

除了 `config.toml` 配置文件，我们还可以使用环境变量的方式对 Cargo 进行配置。

配置文件的中的 key `foo.bar` 对应的环境变量形式为 `CARGO_FOO_BAR`，其中的`.`、`-` 被转换成 `_`，且字母都变成大写的。例如，`target.x86_64-unknown-linux-gnu.runner` key 转换成环境变量后变成 `CARGO_TARGET_X86_64_UNKNOWN_LINUX_GNU_RUNNER`。

就优先级而言，环境变量是比配置文件更高的。除了上面的机制，Cargo 还支持一些[预定义的环境变量](https://doc.rust-lang.org/stable/cargo/reference/environment-variables.html)。

> 官方 Cargo Book 中本文的内容还有[很多](https://doc.rust-lang.org/stable/cargo/reference/config.html#configuration-keys)，但是剩余内容对于绝大多数用户都用不到，因此我们并没有涵盖其中。
