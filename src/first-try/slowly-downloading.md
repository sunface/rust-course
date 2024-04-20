# 下载依赖很慢或卡住？
在目前，大家还不需要自己搭建的镜像下载服务，因此只需知道下载依赖库的地址是 [crates.io](https://crates.io)，是由 Rust 官方搭建的镜像下载和管理服务。

但悲剧的是，它的默认镜像地址是在国外，这就导致了某些时候难免会遇到下载缓慢或者卡住的情况，下面我们一起来看看。


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

为了使用 `crates.io` 之外的注册服务，我们需要对 `$HOME/.cargo/config.toml` ($CARGO_HOME 下) 文件进行配置，添加新的服务提供商，有两种方式可以实现：增加新的镜像地址和覆盖默认的镜像地址。

### 新增镜像地址


**首先是在 `crates.io` 之外添加新的注册服务**，在 `$HOME/.cargo/config.toml` （如果文件不存在则手动创建一个）中添加以下内容：

```toml
[registries]
ustc = { index = "https://mirrors.ustc.edu.cn/crates.io-index/" }
```

这种方式只会新增一个新的镜像地址，因此在引入依赖的时候，需要指定该地址，例如在项目中引入 `time` 包，你需要在 `Cargo.toml` 中使用以下方式引入:

```toml
[dependencies]
time = {  registry = "ustc" }
```

**在重新配置后，初次构建可能要较久的时间**，因为要下载更新 `ustc` 注册服务的索引文件，由于文件比较大，需要等待较长的时间。

此处有两点需要注意：

1. cargo 1.68 版本开始支持稀疏索引，不再需要完整克隆 crates.io-index 仓库，可以加快获取包的速度，如：

```toml
[source.ustc]
registry = "sparse+https://mirrors.ustc.edu.cn/crates.io-index/"
```

2. cargo search 无法使用镜像

#### 科大镜像
上面使用的是科大提供的注册服务，也是 Rust 最早期的注册服务，感谢大大们的贡献。除此之外，大家还可以选择下面的镜像服务：

#### 字节跳动

最大的优点就是不限速，当然，你的网速如果能跑到 1000Gbps，我们也可以认为它无情的限制了你，咳咳。

```toml
[source.crates-io]
replace-with = 'rsproxy'

[source.rsproxy]
registry = "https://rsproxy.cn/crates.io-index"

# 稀疏索引，要求 cargo >= 1.68
[source.rsproxy-sparse]
registry = "sparse+https://rsproxy.cn/index/"

[registries.rsproxy]
index = "https://rsproxy.cn/crates.io-index"

[net]
git-fetch-with-cli = true
```


### 覆盖默认的镜像地址
事实上，我们更推荐第二种方式，因为第一种方式在项目大了后，实在是很麻烦，全部修改后，万一以后不用这个镜像了，你又要全部修改成其它的。

而第二种方式，则不需要修改 `Cargo.toml` 文件，**因为它是直接使用新注册服务来替代默认的 `crates.io`**。

在 `$HOME/.cargo/config.toml` 添加以下内容：

```toml
[source.crates-io]
replace-with = 'ustc'

[source.ustc]
registry = "git://mirrors.ustc.edu.cn/crates.io-index"
```

首先，创建一个新的镜像源 `[source.ustc]`，然后将默认的 `crates-io` 替换成新的镜像源: `replace-with = 'ustc'`。

简单吧？只要这样配置后，以往需要去 `crates.io` 下载的包，会全部从科大的镜像地址下载，速度刷刷的... 我的 300M 大刀（宽带）终于有了用武之地。

**这里强烈推荐大家在学习完后面的基本章节后，看一下 [Cargo 使用指南章节](https://course.rs/cargo/intro.html)，对于你的 Rust 之旅会有莫大的帮助！**


## 下载卡住
下载卡住其实就一个原因：下载太慢了。

根据经验来看，卡住不动往往发生在更新索引时。毕竟 Rust 的包越来越多，索引也越来越大，如果不使用国内镜像，卡住还蛮正常的，好在，我们也无需经常更新索引 :P

### Blocking waiting for file lock on package cache
不过这里有一个坑，需要大家注意，如果你同时打开了 VSCODE 和命令行，然后修改了 `Cargo.toml`，此时 VSCODE 的 rust-analyzer 插件会自动检测到依赖的变更，去下载新的依赖。

在 VSCODE 下载的过程中（特别是更新索引，可能会耗时很久），假如你又在命令行中运行类似 `cargo run` 或者 `cargo build` 的命令，就会提示一行有些看不太懂的内容：

```shell
$ cargo build
    Blocking waiting for file lock on package cache
    Blocking waiting for file lock on package cache
```

其实这个报错就是因为 VSCODE 的下载太慢了，而且该下载构建还锁住了当前的项目，导致你无法在另一个地方再次进行构建。

解决办法也很简单：

- 增加下载速度，见前面内容
- 耐心等待持有锁的用户构建完成
- 强行停止正在构建的进程，例如杀掉 IDE 使用的 rust-analyzer 插件进程，然后删除 `$HOME/.cargo/.package_cache` 目录


