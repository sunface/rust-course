# 下载依赖很慢或卡住？
在目前，大家还不需要自己搭建镜像服务，因此只需知道 [crates.io](https://crates.io) 是 Rust 官方的包注册中心，Cargo 默认从这里查找和下载依赖。

但悲剧的是，在某些网络环境下，访问它难免会遇到下载缓慢或者卡住的情况，下面我们一起来看看。


## 下载很慢?

作为国外的语言，下载慢是正常的，隔壁的那位还被墙呢:) 

解决下载缓慢有两种途径：


### 开启命令行或者全局翻墙
经常有同学反馈，我明明开启翻墙了，但是下载依然还是很慢，无论是命令行中下载还是 VSCode 的 rust-analyzer 插件自动拉取。

事实上，翻墙工具默认开启的仅仅是浏览器的翻墙代理，对于命令行或者软件中的访问，并不会代理流量，因此这些访问还是通过正常网络进行的，自然会失败。

因此，大家需要做的是在你使用的翻墙工具中 `复制终端代理命令` 或者开启全局翻墙。由于每个翻墙软件的使用方式不同，因此具体的还是需要自己研究下。以我使用的 `ClashX` 为例，点击 `复制终端代理命令` 后，会自动复制一些 `export` 文本，将这些文本复制到命令行终端中，执行一下，就可以自动完成代理了。

```shell
export https_proxy=http://127.0.0.1:7890 http_proxy=http://127.0.0.1:7890 all_proxy=socks5://127.0.0.1:7891
```

###  修改 Rust 的下载镜像为国内的镜像地址
这个效果最直接，一劳永逸，但是就是配置起来略微麻烦。

为了使用 `crates.io` 之外的注册服务，我们需要修改 `$CARGO_HOME/config.toml`；`CARGO_HOME` 未单独设置时，类 Unix 系统上的默认路径是 `$HOME/.cargo/config.toml`，Windows 上则是 `%USERPROFILE%\.cargo\config.toml`。有两种方式可以实现：增加新的镜像地址和覆盖默认的镜像地址。

下面的 [USTC](https://mirrors.ustc.edu.cn/help/crates.io-index.html) 与 [RsProxy](https://rsproxy.cn/) 配置已在 2026-08-14 按服务方文档核对。镜像服务可能继续变化，如果配置失效，请优先查看服务方的最新说明。

### 新增镜像地址


**首先是在 `crates.io` 之外添加新的注册服务**，在 Cargo 的 `config.toml`（如果文件不存在则手动创建一个）中添加以下内容：

```toml
[registries.ustc]
index = "sparse+https://mirrors.ustc.edu.cn/crates.io-index/"
```

这种方式只会新增一个新的镜像地址，因此在引入依赖的时候，需要指定该地址，例如在项目中引入 `time` 包，你需要在 `Cargo.toml` 中使用以下方式引入:

```toml
[dependencies]
time = { version = "0.3", registry = "ustc" }
```

稀疏索引会按需获取依赖信息，不再完整克隆庞大的 `crates.io-index` 仓库。初次构建仍然需要下载依赖，因此可能比后续构建慢一些。

此处有两点需要注意：

1. Cargo 1.68 开始支持稀疏索引；从 Cargo 1.70 起，访问 `crates.io` 时已经默认使用稀疏协议。第三方稀疏索引仍需在地址前写明 `sparse+`。
2. 使用命名镜像执行搜索时，需要显式指定注册服务，例如 `cargo search --registry ustc reqwest`。

#### 科大镜像
上面使用的是科大提供的注册服务，也是 Rust 最早期的注册服务，感谢大大们的贡献。除此之外，大家还可以选择下面的镜像服务：

#### 字节跳动

最大的优点就是不限速，当然，你的网速如果能跑到 1000Gbps，我们也可以认为它无情的限制了你，咳咳。

```toml
[source.crates-io]
replace-with = 'rsproxy-sparse'

[source.rsproxy-sparse]
registry = "sparse+https://rsproxy.cn/index/"

[registries.rsproxy-sparse]
index = "sparse+https://rsproxy.cn/index/"
```


### 覆盖默认的镜像地址
事实上，我们更推荐第二种方式，因为第一种方式在项目大了后，实在是很麻烦，全部修改后，万一以后不用这个镜像了，你又要全部修改成其它的。

而第二种方式，则不需要修改 `Cargo.toml` 文件，**因为它是直接使用新注册服务来替代默认的 `crates.io`**。

在 `$HOME/.cargo/config.toml` 添加以下内容：

```toml
[source.crates-io]
replace-with = 'ustc'

[source.ustc]
registry = "sparse+https://mirrors.ustc.edu.cn/crates.io-index/"
```

首先，创建一个新的镜像源 `[source.ustc]`，然后将默认的 `crates-io` 替换成新的镜像源: `replace-with = 'ustc'`。

简单吧？只要这样配置后，以往需要去 `crates.io` 下载的包，会全部从科大的镜像地址下载，速度刷刷的... 我的 300M 大刀（宽带）终于有了用武之地。

**这里强烈推荐大家在学习完后面的基本章节后，看一下 [Cargo 使用指南章节](https://beatai.org/rust-course/cargo/intro)，对于你的 Rust 之旅会有莫大的帮助！**


## 下载卡住
下载卡住可能是网络慢，也可能是有其它 Cargo 进程正在占用缓存。

Cargo 1.70 起，`crates.io` 默认使用稀疏索引，不再完整更新 Git 索引。如果获取索引或依赖时长时间没有进展，可以先检查网络；如果终端显示文件锁提示，则按下一节排查进程占用。

### Blocking waiting for file lock on package cache
不过这里有一个坑，需要大家注意，如果你同时打开了 VSCODE 和命令行，然后修改了 `Cargo.toml`，此时 VSCODE 的 rust-analyzer 插件会自动检测到依赖的变更，去下载新的依赖。

在 VSCODE 下载的过程中（特别是更新索引，可能会耗时很久），假如你又在命令行中运行类似 `cargo run` 或者 `cargo build` 的命令，就会提示一行有些看不太懂的内容：

```shell
$ cargo build
    Blocking waiting for file lock on package cache
    Blocking waiting for file lock on package cache
```

这不是构建失败，而是另一个 Cargo 进程持有软件包缓存锁，当前命令正在等待它释放。等前一个进程完成后，当前构建会继续执行。

解决办法也很简单：

- 增加下载速度，见前面内容
- 耐心等待持有锁的进程构建完成
- 强行停止正在构建的进程，例如杀掉 IDE 使用的 rust-analyzer 插件进程，然后删除 `$HOME/.cargo/.package_cache` 目录
