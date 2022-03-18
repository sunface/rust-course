# tokio 初印象

又到了喜闻乐见的初印象环节，这个环节决定了你心中的那 24 盏灯最终是全绿还是全灭。

在本文中，我们将看看本专题的学习目标、`tokio`该怎么引入以及如何实现一个 `Hello Tokio` 项目，最终留灯还是灭灯的决定权留给各位看官。但我提前说好，如果你全灭了，但却找不到更好的，未来还是得回来真香 :P

## 专题目标

通过 API 学项目无疑是无聊的，因此我们采用一个与众不同的方式：边学边练，在本专题的最后你将拥有一个 `redis` 客户端和服务端，当然不会实现一个完整版本的 `redis` ，只会提供基本的功能和部分常用的命令。

#### mini-redis

`redis` 的项目源码可以在[这里访问](https://github.com/sunface/rust-course/tree/main/pratice/mini-redis)，本项目是从[官方地址](https://github.com/tokio-rs/mini-redis) `fork` 而来，在未来会提供注释和文档汉化。

再次声明：该项目仅仅用于学习目的，因此它的文档注释非常全，但是它完全无法作为 `redis` 的替代品。

## 环境配置

首先，我们假定你已经安装了 Rust 和相关的工具链，例如 `cargo`。其中 Rust 版本的最低要求是 `1.45.0`，建议使用最新版 `1.58`:

```shell
sunfei@sunface $ rustc --version
rustc 1.58.0 (02072b482 2022-01-11)
```

接下来，安装 `mini-redis` 的服务器端，它可以用来测试我们后面将要实现的 `redis` 客户端：

```shell
$ cargo install mini-redis
```

> 如果下载失败，也可以通过[这个地址](https://github.com/sunface/rust-course/tree/main/pratice/mini-redis)下载源码，然后在本地通过 `cargo run`运行。

下载成功后，启动服务端:

```shell
$ mini-redis-server
```

然后，再使用客户端测试下刚启动的服务端:

```shell
$ mini-redis-cli set foo 1
OK
$ mini-redis-cli get foo
"1"
```

不得不说，还挺好用的，先自我陶醉下 :) 此时，万事俱备，只欠东风，接下来是时候亮"箭"了：实现我们的 `Hello Tokio` 项目。

## Hello Tokio

与简单无比的 `Hello World` 有所不同(简单？还记得本书开头时，湖畔边的那个多国语言版本的`你好，世界`嘛~~)，`Hello Tokio` 它承载着"非常艰巨"的任务，那就是向刚启动的 `redis` 服务器写入一个 `key=hello, value=world` ，然后再读取出来，嗯，使用 `mini-redis` 客户端 :)

#### 分析未到，代码先行

在详细讲解之前，我们先来看看完整的代码，让大家有一个直观的印象。首先，创建一个新的 `Rust` 项目:

```shell
$ cargo new my-redis
$ cd my-redis
```

然后在 `Cargo.toml` 中添加相关的依赖:

```toml
[dependencies]
tokio = { version = "1", features = ["full"] }
mini-redis = "0.4"
```

接下来，使用以下代码替换 `main.rs` 中的内容：

```rust
use mini_redis::{client, Result};

#[tokio::main]
async fn main() -> Result<()> {
    // 建立与mini-redis服务器的连接
    let mut client = client::connect("127.0.0.1:6379").await?;

    // 设置 key: "hello" 和 值: "world"
    client.set("hello", "world".into()).await?;

    // 获取"key=hello"的值
    let result = client.get("hello").await?;

    println!("从服务器端获取到结果={:?}", result);

    Ok(())
}
```

不知道你之前启动的 `mini-redis-server` 关闭没有，如果关了，记得重新启动下，否则我们的代码就是意大利空气炮。

最后，运行这个项目:

```shell
$ cargo run
从服务器端获取到结果=Some(b"world")
```

Perfect, 代码成功运行，是时候来解释下其中蕴藏的至高奥秘了。

## 原理解释

代码篇幅虽然不长，但是还是有不少值得关注的地方，接下来我们一起来看看。

```rust
let mut client = client::connect("127.0.0.1:6379").await?;
```

[`client::connect`](https://docs.rs/mini-redis/0.4.1/mini_redis/client/fn.connect.html) 函数由`mini-redis` 包提供，它使用异步的方式跟指定的远程 `IP` 地址建立 TCP 长连接，一旦连接建立成功，那 `client` 的赋值初始化也将完成。

特别值得注意的是：虽然该连接是异步建立的，但是从代码本身来看，完全是**同步的代码编写方式**，唯一能说明异步的点就是 `.await`。

#### 什么是异步编程

大部分计算机程序都是按照代码编写的顺序来执行的：先执行第一行，然后第二行，以此类推(当然，还要考虑流程控制，例如循环)。当进行同步编程时，一旦程序遇到一个操作无法被立即完成，它就会进入阻塞状态，直到该操作完成为止。

因此同步编程非常符合我们人类的思维习惯，是一个顺其自然的过程，被几乎每一个程序员所喜欢(本来想说所有，但我不敢打包票，毕竟总有特立独行之士)。例如，当建立 TCP 连接时，当前线程会被阻塞，直到等待该连接建立完成，然后才往下继续进行。

而使用异步编程，无法立即完成的操作会被切到后台去等待，因此当前线程不会被阻塞，它会接着执行其它的操作。一旦之前的操作准备好可以继续执行后，它会通知执行器，然后执行器会调度它并从上次离开的点继续执行。但是大家想象下，如果没有使用 `await`，而是按照这个异步的流程使用通知 -> 回调的方式实现，代码该多么的难写和难读！

好在 Rust 为我们提供了 `async/await` 的异步编程特性，让我们可以像写同步代码那样去写异步的代码，也让这个世界美好依旧。

#### 编译时绿色线程

一个函数可以通过`async fn`的方式被标记为异步函数:

```rust
use mini_redis::Result;
use mini_redis::client::Client;
use tokio::net::ToSocketAddrs;

pub async fn connect<T: ToSocketAddrs>(addr: T) -> Result<Client> {
    // ...
}
```

在上例中，`redis` 的连接函数 `connect` 实现如上，它看上去很像是一个同步函数，但是 `async fn` 出卖了它。
`async fn` 异步函数并不会直接返回值，而是返回一个 `Future`，顾名思义，该 `Future` 会在未来某个时间点被执行，然后最终获取到真实的返回值 `Result<Client>`。

> async/await 的原理就算大家不理解，也不妨碍使用 `tokio` 写出能用的服务，但是如果想要更深入的用好，强烈建议认真读下本书的 [`async/await` 异步编程章节](https://course.rs/async/intro.html)，你会对 Rust 的异步编程有一个全新且深刻的认识。

由于 `async` 会返回一个 `Future`，因此我们还需要配合使用 `.await` 来让该 `Future` 运行起来，最终获得返回值:

```rust
async fn say_to_world() -> String {
    String::from("world")
}

#[tokio::main]
async fn main() {
    // 此处的函数调用是惰性的，并不会执行 `say_to_world()` 函数体中的代码
    let op = say_to_world();

    // 首先打印出 "hello"
    println!("hello");

    // 使用 `.await` 让 `say_to_world` 开始运行起来
    println!("{}", op.await);
}
```

上面代码输出如下:

```shell
hello
world
```

而大家可能很好奇 `async fn` 到底返回什么吧？它实际上返回的是一个实现了 `Future` 特征的匿名类型: `impl Future<Output = String>`。

#### async main

在代码中，使用了一个与众不同的 `main` 函数 : `async fn main` ，而且是用 `#[tokio::main]` 属性进行了标记。异步 `main` 函数有以下意义：

- `.await` 只能在 `async` 函数中使用，如果是以前的 `fn main`，那它内部是无法直接使用 `async` 函数的！这个会极大的限制了我们的使用场景
- 异步运行时本身需要初始化

因此 `#[tokio::main]` 宏在将 `async fn main` 隐式的转换为 `fn main` 的同时还对整个异步运行时进行了初始化。例如以下代码:

```rust
#[tokio::main]
async fn main() {
    println!("hello");
}
```

将被转换成:

```rust
fn main() {
    let mut rt = tokio::runtime::Runtime::new().unwrap();
    rt.block_on(async {
        println!("hello");
    })
}
```

最终，Rust 编译器就愉快地执行这段代码了。

## cargo feature

在引入 `tokio` 包时，我们在 `Cargo.toml` 文件中添加了这么一行:

```toml
tokio = { version = "1", features = ["full"] }
```

里面有个 `features = ["full"]` 可能大家会比较迷惑，当然，关于它的具体解释在本书的 [Cargo 详解专题](https://course.rs/toolchains/cargo/intro.html) 有介绍，这里就简单进行说明，

`Tokio` 有很多功能和特性，例如 `TCP`，`UDP`，`Unix sockets`，同步工具，多调度类型等等，不是每个应用都需要所有的这些特性。为了优化编译时间和最终生成可执行文件大小、内存占用大小，应用可以对这些特性进行可选引入。

而这里为了演示的方便，我们使用 `full` ，表示直接引入所有的特性。

## 总结

大家对 `tokio` 的初印象如何？可否 24 灯全绿通过？

总之，`tokio` 做的事情其实是细雨润无声的，在大多数时候，我们并不能感觉到它的存在，但是它确实是异步编程中最重要的一环(或者之一)，深入了解它对我们的未来之路会有莫大的帮助。

接下来，正式开始 `tokio` 的学习之旅。
