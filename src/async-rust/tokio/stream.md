# Stream

大家有没有想过， Rust 中的迭代器在迭代时能否异步进行？若不可以，是不是有相应的解决方案？

以上的问题其实很重要，因为在实际场景中，迭代一个集合，然后异步的去执行是很常见的需求，好在 Tokio 为我们提供了 `stream`，我们可以在异步函数中对其进行迭代，甚至和迭代器 `Iterator` 一样，`stream` 还能使用适配器，例如 `map` ! Tokio 在 [`StreamExt`](https://docs.rs/tokio-stream/0.1.8/tokio_stream/trait.StreamExt.html) 特征上定义了常用的适配器。

要使用 `stream` ，目前还需要手动引入对应的包：

```rust
tokio-stream = "0.1"
```

> stream 没有放在 `tokio` 包的原因在于标准库中的 `Stream` 特征还没有稳定，一旦稳定后，`stream` 将移动到 `tokio` 中来

## 迭代

目前， Rust 语言还不支持异步的 `for` 循环，因此我们需要 `while let` 循环和 [`StreamExt::next()`](https://docs.rs/tokio-stream/0.1.8/tokio_stream/trait.StreamExt.html#method.next) 一起使用来实现迭代的目的:

```rust
use tokio_stream::StreamExt;

#[tokio::main]
async fn main() {
    let mut stream = tokio_stream::iter(&[1, 2, 3]);

    while let Some(v) = stream.next().await {
        println!("GOT = {:?}", v);
    }
}
```

和迭代器 `Iterator` 类似，`next()` 方法返回一个 `Option<T>`，其中 `T` 是从 `stream` 中获取的值的类型。若收到 `None` 则意味着 `stream` 迭代已经结束。

#### mini-redis 广播

下面我们来实现一个复杂一些的 mini-redis 客户端，完整代码见[这里](https://github.com/tokio-rs/website/blob/master/tutorial-code/streams/src/main.rs)。

在开始之前，首先启动一下完整的 mini-redis 服务器端：

```console
$ mini-redis-server
```

```rust
use tokio_stream::StreamExt;
use mini_redis::client;

async fn publish() -> mini_redis::Result<()> {
    let mut client = client::connect("127.0.0.1:6379").await?;

    // 发布一些数据
    client.publish("numbers", "1".into()).await?;
    client.publish("numbers", "two".into()).await?;
    client.publish("numbers", "3".into()).await?;
    client.publish("numbers", "four".into()).await?;
    client.publish("numbers", "five".into()).await?;
    client.publish("numbers", "6".into()).await?;
    Ok(())
}

async fn subscribe() -> mini_redis::Result<()> {
    let client = client::connect("127.0.0.1:6379").await?;
    let subscriber = client.subscribe(vec!["numbers".to_string()]).await?;
    let messages = subscriber.into_stream();

    tokio::pin!(messages);

    while let Some(msg) = messages.next().await {
        println!("got = {:?}", msg);
    }

    Ok(())
}

#[tokio::main]
async fn main() -> mini_redis::Result<()> {
    tokio::spawn(async {
        publish().await
    });

    subscribe().await?;

    println!("DONE");

    Ok(())
}
```

上面生成了一个异步任务专门用于发布消息到 min-redis 服务器端的 `numbers` 消息通道中。然后，在 `main` 中，我们订阅了 `numbers` 消息通道，并且打印从中接收到的消息。

还有几点值得注意的:

- [`into_stream`](https://docs.rs/mini-redis/0.4.1/mini_redis/client/struct.Subscriber.html#method.into_stream) 会将 `Subscriber` 变成一个 `stream`
- 在 `stream` 上调用 `next` 方法要求该 `stream` 被固定住([`pinned`](https://doc.rust-lang.org/std/pin/index.html))，因此需要调用 `tokio::pin!`

> 关于 Pin 的详细解读，可以阅读[这篇文章](https://course.rs/async/pin-unpin.html)

大家可以去掉 `pin!` 的调用，然后观察下报错，若以后你遇到这种错误，可以尝试使用下 `pin!`。

此时，可以运行下我们的客户端代码看看效果(别忘了先启动前面提到的 mini-redis 服务端):

```console
got = Ok(Message { channel: "numbers", content: b"1" })
got = Ok(Message { channel: "numbers", content: b"two" })
got = Ok(Message { channel: "numbers", content: b"3" })
got = Ok(Message { channel: "numbers", content: b"four" })
got = Ok(Message { channel: "numbers", content: b"five" })
got = Ok(Message { channel: "numbers", content: b"6" })
```

在了解了 `stream` 的基本用法后，我们再来看看如何使用适配器来扩展它。

## 适配器

在前面章节中，我们了解了迭代器有[两种适配器](https://course.rs/advance/functional-programing/iterator.html#消费者与适配器)：

- 迭代器适配器，会将一个迭代器转变成另一个迭代器，例如 `map`，`filter` 等
- 消费者适配器，会消费掉一个迭代器，最终生成一个值，例如 `collect` 可以将迭代器收集成一个集合

与迭代器类似，`stream` 也有适配器，例如一个 `stream` 适配器可以将一个 `stream` 转变成另一个 `stream` ，例如 `map`、`take` 和 `filter`。

在之前的客户端中，`subscribe` 订阅一直持续下去，直到程序被关闭。现在，让我们来升级下，让它在收到三条消息后就停止迭代，最终结束。

```rust
let messages = subscriber
    .into_stream()
    .take(3);
```

这里关键就在于 `take` 适配器，它会限制 `stream` 只能生成最多 `n` 条消息。运行下看看结果：

```console
got = Ok(Message { channel: "numbers", content: b"1" })
got = Ok(Message { channel: "numbers", content: b"two" })
got = Ok(Message { channel: "numbers", content: b"3" })
```

程序终于可以正常结束了。现在，让我们过滤 `stream` 中的消息，只保留数字类型的值:

```rust
let messages = subscriber
    .into_stream()
    .filter(|msg| match msg {
        Ok(msg) if msg.content.len() == 1 => true,
        _ => false,
    })
    .take(3);
```

运行后输出：

```console
got = Ok(Message { channel: "numbers", content: b"1" })
got = Ok(Message { channel: "numbers", content: b"3" })
got = Ok(Message { channel: "numbers", content: b"6" })
```

需要注意的是，适配器的顺序非常重要，`.filter(...).take(3)` 和 `.take(3).filter(...)` 的结果可能大相径庭，大家可以自己尝试下。

现在，还有一件事要做，咱们的消息被不太好看的 `Ok(...)` 所包裹，现在通过 `map` 适配器来简化下:

```rust
let messages = subscriber
    .into_stream()
    .filter(|msg| match msg {
        Ok(msg) if msg.content.len() == 1 => true,
        _ => false,
    })
    .map(|msg| msg.unwrap().content)
    .take(3);
```

注意到 `msg.unwrap` 了吗？大家可能会以为我们是出于示例的目的才这么用，实际上并不是，由于 `filter` 的先执行， `map` 中的 `msg` 只能是 `Ok(...)`，因此 `unwrap` 非常安全。

```console
got = b"1"
got = b"3"
got = b"6"
```

还有一点可以改进的地方：当 `filter` 和 `map` 一起使用时，你往往可以用一个统一的方法来实现 [`filter_map`](https://docs.rs/tokio-stream/0.1.8/tokio_stream/trait.StreamExt.html#method.filter_map)。

```rust
let messages = subscriber
    .into_stream()
    .filter_map(|msg| match msg {
        Ok(msg) if msg.content.len() == 1 => msg.unwrap().content,
        _ => None,
    })
    .take(3);
```

想要学习更多的适配器，可以看看 [`StreamExt`](https://docs.rs/tokio-stream/0.1.8/tokio_stream/trait.StreamExt.html) 特征。

## 实现 Stream 特征

如果大家还没忘记 `Future` 特征，那 `Stream` 特征相信你也会很快记住，因为它们非常类似：

```rust
use std::pin::Pin;
use std::task::{Context, Poll};

pub trait Stream {
    type Item;

    fn poll_next(
        self: Pin<&mut Self>,
        cx: &mut Context<'_>
    ) -> Poll<Option<Self::Item>>;

    fn size_hint(&self) -> (usize, Option<usize>) {
        (0, None)
    }
}
```

`Stream::poll_next()` 函数跟 `Future::poll` 很相似，区别就是前者为了从 `stream` 收到多个值需要重复的进行调用。 就像在 [`深入async`](https://course.rs/tokio/async.html) 章节提到的那样，当一个 `stream` 没有做好返回一个值的准备时，它将返回一个 `Poll::Pending` ，同时将任务的 `waker` 进行注册。一旦 `stream` 准备好后， `waker` 将被调用。

通常来说，如果想要手动实现一个 `Stream`，需要组合 `Future` 和其它 `Stream`。下面，还记得在[`深入async`](https://course.rs/tokio/async.html) 中构建的 `Delay Future` 吗？现在让我们来更进一步，将它转换成一个 `stream`，每 10 毫秒生成一个值，总共生成 3 次:

```rust
use tokio_stream::Stream;
use std::pin::Pin;
use std::task::{Context, Poll};
use std::time::Duration;

struct Interval {
    rem: usize,
    delay: Delay,
}

impl Stream for Interval {
    type Item = ();

    fn poll_next(mut self: Pin<&mut Self>, cx: &mut Context<'_>)
        -> Poll<Option<()>>
    {
        if self.rem == 0 {
            // 去除计时器实现
            return Poll::Ready(None);
        }

        match Pin::new(&mut self.delay).poll(cx) {
            Poll::Ready(_) => {
                let when = self.delay.when + Duration::from_millis(10);
                self.delay = Delay { when };
                self.rem -= 1;
                Poll::Ready(Some(()))
            }
            Poll::Pending => Poll::Pending,
        }
    }
}
```

#### async-stream

手动实现 `Stream` 特征实际上是相当麻烦的事，不幸地是，Rust 语言的 `async/await` 语法目前还不能用于定义 `stream`，虽然相关的工作已经在进行中。

作为替代方案，[`async-stream`](https://docs.rs/async-stream/latest/async_stream/) 包提供了一个 `stream!` 宏，它可以将一个输入转换成 `stream`，使用这个包，上面的代码可以这样实现：

```rust
use async_stream::stream;
use std::time::{Duration, Instant};

stream! {
    let mut when = Instant::now();
    for _ in 0..3 {
        let delay = Delay { when };
        delay.await;
        yield ();
        when += Duration::from_millis(10);
    }
}
```

嗯，看上去还是相当不错的，代码可读性大幅提升！

<!-- todo generators -->
是不是发现了一个关键字 `yield` ，他是用来配合生成器使用的。详见[原文](https://doc.rust-lang.org/beta/unstable-book/language-features/generators.html)
