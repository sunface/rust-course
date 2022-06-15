# 优雅的关闭

如果你的服务是一个小说阅读网站，那大概率用不到优雅关闭的，简单粗暴的关闭服务器，然后用户再次请求时获取一个错误就是了。但如果是一个 web 服务或数据库服务呢？当前的连接很可能在做着重要的事情，一旦关闭会导致数据的丢失甚至错误，此时，我们就需要优雅的关闭(graceful shutdown)了。

要让一个异步应用优雅的关闭往往需要做到 3 点：

- 找出合适的关闭时机
- 通知程序的每一个子部分开始关闭
- 在主线程等待各个部分的关闭结果

在本文的下面部分，我们一起来看看该如何做到这三点。如果想要进一步了解在真实项目中该如何使用，大家可以看看 mini-redis 的完整代码实现，特别是 [`src/server.rs`](https://github.com/tokio-rs/mini-redis/blob/master/src/server.rs) 和 [`src/shutdown.rs`](https://github.com/tokio-rs/mini-redis/blob/master/src/shutdown.rs)。

## 找出合适的关闭时机

一般来说，何时关闭是取决于应用自身的，但是一个常用的关闭准则就是当应用收到来自于操作系统的关闭信号时。例如通过 `ctrl + c` 来关闭正在运行的命令行程序。

为了检测来自操作系统的关闭信号，`Tokio` 提供了一个 `tokio::signal::ctrl_c` 函数，它将一直睡眠直到收到对应的信号:

```rust
use tokio::signal;

#[tokio::main]
async fn main() {
    // ... spawn application as separate task ...
    // 在一个单独的任务中处理应用逻辑

    match signal::ctrl_c().await {
        Ok(()) => {},
        Err(err) => {
            eprintln!("Unable to listen for shutdown signal: {}", err);
        },
    }

    //  发送关闭信号给应用所在的任务，然后等待
}
```

## 通知程序的每一个部分开始关闭

大家看到这个标题，不知道会想到用什么技术来解决问题，反正我首先想到的是，真的很像广播哎。。

事实上也是如此，最常见的通知程序各个部分关闭的方式就是使用一个广播消息通道。关于如何实现，其实也不复杂：应用中的每个任务都持有一个广播消息通道的接收端，当消息被广播到该通道时，每个任务都可以收到该消息，并关闭自己:

```rust
let next_frame = tokio::select! {
    res = self.connection.read_frame() => res?,
    _ = self.shutdown.recv() => {
        // 当收到关闭信号后，直接从 `select!` 返回，此时 `select!` 中的另一个分支会自动释放，其中的任务也会结束
        return Ok(());
    }
};
```

在 `mini-redis` 中，当收到关闭消息时，任务会立即结束，但在实际项目中，这种方式可能会过于理想，例如当我们向文件或数据库写入数据时，立刻终止任务可能会导致一些无法预料的错误，因此，在结束前做一些收尾工作会是非常好的选择。

除此之外，还有两点值得注意:

- 将广播消息通道作为结构体的一个字段是相当不错的选择, 例如[这个例子](https://github.com/tokio-rs/mini-redis/blob/master/src/shutdown.rs)
- 还可以使用 [`watch channel`](https://docs.rs/tokio/1.16.1/tokio/sync/watch/index.html) 实现同样的效果，与之前的方式相比，这两种方法并没有太大的区别

## 等待各个部分的结束

在之前章节，我们讲到过一个 [`mpsc`](https://docs.rs/tokio/1/tokio/sync/mpsc/index.html) 消息通道有一个重要特性：当所有发送端都 `drop` 时，消息通道会自动关闭，此时继续接收消息就会报错。

大家发现没？这个特性特别适合优雅关闭的场景：主线程持有消息通道的接收端，然后每个代码部分拿走一个发送端，当该部分结束时，就 `drop` 掉发送端，因此所有发送端被 `drop` 也就意味着所有的部分都已关闭，此时主线程的接收端就会收到错误，进而结束。

```rust
use tokio::sync::mpsc::{channel, Sender};
use tokio::time::{sleep, Duration};

#[tokio::main]
async fn main() {
    let (send, mut recv) = channel(1);

    for i in 0..10 {
        tokio::spawn(some_operation(i, send.clone()));
    }

    // 等待各个任务的完成
    //
    // 我们需要 drop 自己的发送端，因为等下的 `recv()` 调用会阻塞, 如果不 `drop` ，那发送端就无法被全部关闭
    // `recv` 也将永远无法结束，这将陷入一个类似死锁的困境
    drop(send);

    // 当所有发送端都超出作用域被 `drop` 时 (当前的发送端并不是因为超出作用域被 `drop` 而是手动 `drop` 的)
    // `recv` 调用会返回一个错误
    let _ = recv.recv().await;
}

async fn some_operation(i: u64, _sender: Sender<()>) {
    sleep(Duration::from_millis(100 * i)).await;
    println!("Task {} shutting down.", i);

    // 发送端超出作用域，然后被 `drop`
}
```

关于忘记 `drop` 本身持有的发送端进而导致 bug 的问题，大家可以看看[这篇文章](https://course.rs/compiler/pitfalls/main-with-channel-blocked.html)。
