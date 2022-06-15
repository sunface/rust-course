# 消息传递

迄今为止，你已经学了不少关于 Tokio 的并发编程的内容，是时候见识下真正的挑战了，接下来，我们一起来实现下客户端这块儿的功能。

首先，将之前实现的 `src/main.rs `文件中的[服务器端代码](https://github.com/tokio-rs/website/blob/master/tutorial-code/shared-state/src/main.rs)放入到一个 bin 文件中，等下可以直接通过该文件来运行我们的服务器:

```console
mkdir src/bin
mv src/main.rs src/bin/server.rs
```

接着创建一个新的 bin 文件，用于包含我们即将实现的客户端代码:

```console
touch src/bin/client.rs
```

由于不再使用 `main.rs` 作为程序入口，我们需要使用以下命令来运行指定的 bin 文件:

```rust
cargo run --bin server
```

此时，服务器已经成功运行起来。 同样的，可以用 `cargo run --bin client` 这种方式运行即将实现的客户端。

万事俱备，只欠代码，一起来看看客户端该如何实现。

## 错误的实现

如果想要同时运行两个 redis 命令，我们可能会为每一个命令生成一个任务，例如:

```rust
use mini_redis::client;

#[tokio::main]
async fn main() {
    // 创建到服务器的连接
    let mut client = client::connect("127.0.0.1:6379").await.unwrap();

    // 生成两个任务，一个用于获取 key, 一个用于设置 key
    let t1 = tokio::spawn(async {
        let res = client.get("hello").await;
    });

    let t2 = tokio::spawn(async {
        client.set("foo", "bar".into()).await;
    });

    t1.await.unwrap();
    t2.await.unwrap();
}
```

这段代码不会编译，因为两个任务都需要去访问 `client`，但是 `client` 并没有实现 `Copy` 特征，再加上我们并没有实现相应的共享代码，因此自然会报错。还有一个问题，方法 `set` 和 `get` 都使用了 `client` 的可变引用 `&mut self`，由此还会造成同时借用两个可变引用的错误。

在上一节中，我们介绍了几个解决方法，但是它们大部分都不太适用于此时的情况，例如：

- `std::sync::Mutex` 无法被使用，这个问题在之前章节有详解介绍过，同步锁无法跨越 `.await` 调用时使用
- 那么你可能会想，是不是可以使用 `tokio::sync:Mutex` ，答案是可以用，但是同时就只能运行一个请求。若客户端实现了 redis 的 [pipelining](https://redis.io/topics/pipelining), 那这个异步锁就会导致连接利用率不足

这个不行，那个也不行，是不是没有办法解决了？还记得我们上一章节提到过几次的消息传递，但是一直没有看到它的庐山真面目吗？现在可以来看看了。

## 消息传递

之前章节我们提到可以创建一个专门的任务 `C1` (消费者 Consumer) 和通过消息传递来管理共享的资源，这里的共享资源就是 `client` 。若任务 `P1` (生产者 Producer) 想要发出 Redis 请求，首先需要发送信息给 `C1`，然后 `C1` 会发出请求给服务器，在获取到结果后，再将结果返回给 `P1`。

在这种模式下，只需要建立一条连接，然后由一个统一的任务来管理 `client` 和该连接，这样之前的 `get` 和 `set` 请求也将不存在资源共享的问题。

同时，`P1` 和 `C1` 进行通信的消息通道是有缓冲的，当大量的消息发送给 `C1` 时，首先会放入消息通道的缓冲区中，当 `C1` 处理完一条消息后，再从该缓冲区中取出下一条消息进行处理，这种方式跟消息队列( Message queue ) 非常类似，可以实现更高的吞吐。而且这种方式还有利于实现连接池，例如不止一个 `P` 和 `C` 时，多个 `P` 可以往消息通道中发送消息，同时多个 `C`，其中每个 `C` 都维护一条连接，并从消息通道获取消息。

## Tokio 的消息通道( channel )

Tokio 提供了多种消息通道，可以满足不同场景的需求:

- [`mpsc`](https://docs.rs/tokio/1.15.0/tokio/sync/mpsc/index.html), 多生产者，单消费者模式
- [`oneshot`](https://docs.rs/tokio/1.15.0/tokio/sync/oneshot/index.html), 单生产者单消费，一次只能发送一条消息
- [`broadcast`](https://docs.rs/tokio/1/tokio/sync/broadcast/index.html)，多生产者，多消费者，其中每一条发送的消息都可以被所有接收者收到，因此是广播
- [`watch`](https://docs.rs/tokio/1/tokio/sync/watch/index.html)，单生产者，多消费者，只保存一条最新的消息，因此接收者只能看到最近的一条消息，例如，这种模式适用于配置文件变化的监听

细心的同学可能会发现，这里还少了一种类型：多生产者、多消费者，且每一条消息只能被其中一个消费者接收，如果有这种需求，可以使用 [`async-channel`](https://docs.rs/async-channel/latest/async_channel/) 包。

以上这些消息通道都有一个共同点：适用于 `async` 编程，对于其它场景，你可以使用在[多线程章节](https://course.rs/advance/concurrency-with-threads/message-passing.html)中提到过的 `std::sync::mpsc` 和 `crossbeam::channel`， 这些通道在等待消息时会阻塞当前的线程，因此不适用于 `async` 编程。

在下面的代码中，我们将使用 `mpsc` 和 `oneshot`， 本章节完整的代码见[这里](https://github.com/tokio-rs/website/blob/master/tutorial-code/channels/src/main.rs)。

## 定义消息类型

在大多数场景中使用消息传递时，都是多个发送者向一个任务发送消息，该任务在处理完后，需要将响应内容返回给相应的发送者。例如我们的例子中，任务需要将 `GET` 和 `SET` 命令处理的结果返回。首先，我们需要定一个 `Command` 枚举用于代表命令：

```rust
use bytes::Bytes;

#[derive(Debug)]
enum Command {
    Get {
        key: String,
    },
    Set {
        key: String,
        val: Bytes,
    }
}
```

## 创建消息通道

在 `src/bin/client.rs` 的 `main` 函数中，创建一个 `mpsc` 消息通道：

```rust
use tokio::sync::mpsc;

#[tokio::main]
async fn main() {
    // 创建一个新通道，缓冲队列长度是 32
    let (tx, mut rx) = mpsc::channel(32);

    // ... 其它代码
}
```

一个任务可以通过此通道将命令发送给管理 redis 连接的任务，同时由于通道支持多个生产者，因此多个任务可以同时发送命令。创建该通道会返回一个发送和接收句柄，这两个句柄可以分别被使用，例如它们可以被移动到不同的任务中。

通道的缓冲队列长度是 32，意味着如果消息发送的比接收的快，这些消息将被存储在缓冲队列中，一旦存满了 32 条消息，使用`send(...).await`的发送者会**进入睡眠**，直到缓冲队列可以放入新的消息(被接收者消费了)。

```rust
use tokio::sync::mpsc;

#[tokio::main]
async fn main() {
    let (tx, mut rx) = mpsc::channel(32);
    let tx2 = tx.clone();

    tokio::spawn(async move {
        tx.send("sending from first handle").await;
    });

    tokio::spawn(async move {
        tx2.send("sending from second handle").await;
    });

    while let Some(message) = rx.recv().await {
        println!("GOT = {}", message);
    }
}
```

你可以使用 `clone` 方法克隆多个发送者，但是接收者无法被克隆，因为我们的通道是 `mpsc` 类型。

当所有的发送者都被 `Drop` 掉后(超出作用域或被 `drop(...)` 函数主动释放)，就不再会有任何消息发送给该通道，此时 `recv` 方法将返回 `None`，也意味着该通道已经**被关闭**。

在我们的例子中，接收者是在管理 redis 连接的任务中，当该任务发现所有发送者都关闭时，它知道它的使命可以完成了，因此它会关闭 redis 连接。

## 生成管理任务

下面，我们来一起创建一个管理任务，它会管理 redis 的连接，当然，首先需要创建一条到 redis 的连接:

```rust
use mini_redis::client;
// 将消息通道接收者 rx 的所有权转移到管理任务中
let manager = tokio::spawn(async move {
    // Establish a connection to the server
    // 建立到 redis 服务器的连接
    let mut client = client::connect("127.0.0.1:6379").await.unwrap();

    // 开始接收消息
    while let Some(cmd) = rx.recv().await {
        use Command::*;

        match cmd {
            Get { key } => {
                client.get(&key).await;
            }
            Set { key, val } => {
                client.set(&key, val).await;
            }
        }
    }
});
```

如上所示，当从消息通道接收到一个命令时，该管理任务会将此命令通过 redis 连接发送到服务器。

现在，让两个任务发送命令到消息通道，而不是像最开始报错的那样，直接发送命令到各自的 redis 连接:

```rust
// 由于有两个任务，因此我们需要两个发送者
let tx2 = tx.clone();

// 生成两个任务，一个用于获取 key，一个用于设置 key
let t1 = tokio::spawn(async move {
    let cmd = Command::Get {
        key: "hello".to_string(),
    };

    tx.send(cmd).await.unwrap();
});

let t2 = tokio::spawn(async move {
    let cmd = Command::Set {
        key: "foo".to_string(),
        val: "bar".into(),
    };

    tx2.send(cmd).await.unwrap();
});
```

在 `main` 函数的末尾，我们让 3 个任务，按照需要的顺序开始运行:

```rust
t1.await.unwrap();
t2.await.unwrap();
manager.await.unwrap();
```

## 接收响应消息

最后一步，就是让发出命令的任务从管理任务那里获取命令执行的结果。为了完成这个目标，我们将使用 `oneshot` 消息通道，因为它针对一发一收的使用类型做过特别优化，且特别适用于此时的场景：接收一条从管理任务发送的结果消息。

```rust
use tokio::sync::oneshot;

let (tx, rx) = oneshot::channel();
```

使用方式跟 `mpsc` 很像，但是它并没有缓存长度，因为只能发送一条，接收一条，还有一点不同：你无法对返回的两个句柄进行 `clone`。

为了让管理任务将结果准确的返回到发送者手中，这个管道的发送端必须要随着命令一起发送, 然后发出命令的任务保留管道的发送端。一个比较好的实现就是将管道的发送端放入 `Command` 的数据结构中，同时使用一个别名来代表该发送端:

```rust
use tokio::sync::oneshot;
use bytes::Bytes;

#[derive(Debug)]
enum Command {
    Get {
        key: String,
        resp: Responder<Option<Bytes>>,
    },
    Set {
        key: String,
        val: Bytes,
        resp: Responder<()>,
    },
}


/// 管理任务可以使用该发送端将命令执行的结果传回给发出命令的任务
type Responder<T> = oneshot::Sender<mini_redis::Result<T>>;
```

下面，更新发送命令的代码：

```rust
let t1 = tokio::spawn(async move {
    let (resp_tx, resp_rx) = oneshot::channel();
    let cmd = Command::Get {
        key: "hello".to_string(),
        resp: resp_tx,
    };

    // 发送 GET 请求
    tx.send(cmd).await.unwrap();

    // 等待回复
    let res = resp_rx.await;
    println!("GOT = {:?}", res);
});

let t2 = tokio::spawn(async move {
    let (resp_tx, resp_rx) = oneshot::channel();
    let cmd = Command::Set {
        key: "foo".to_string(),
        val: "bar".into(),
        resp: resp_tx,
    };

    // 发送 SET 请求
    tx2.send(cmd).await.unwrap();

    // 等待回复
    let res = resp_rx.await;
    println!("GOT = {:?}", res);
});
```

最后，更新管理任务:

```rust
while let Some(cmd) = rx.recv().await {
    match cmd {
        Command::Get { key, resp } => {
            let res = client.get(&key).await;
            // 忽略错误
            let _ = resp.send(res);
        }
        Command::Set { key, val, resp } => {
            let res = client.set(&key, val).await;
            // 忽略错误
            let _ = resp.send(res);
        }
    }
}
```

有一点值得注意，往 `oneshot` 中发送消息时，并没有使用 `.await`，原因是该发送操作要么直接成功、要么失败，并不需要等待。

当 `oneshot` 的接受端被 `drop` 后，继续发送消息会直接返回 `Err` 错误，它表示接收者已经不感兴趣了。对于我们的场景，接收者不感兴趣是非常合理的操作，并不是一种错误，因此可以直接忽略。

本章的完整代码见[这里](https://github.com/tokio-rs/website/blob/master/tutorial-code/channels/src/main.rs)。

## 对消息通道进行限制

无论何时使用消息通道，我们都需要对缓存队列的长度进行限制，这样系统才能优雅的处理各种负载状况。如果不限制，假设接收端无法及时处理消息，那消息就会迅速堆积，最终可能会导致内存消耗殆尽，就算内存没有消耗完，也可能会导致整体性能的大幅下降。

Tokio 在设计时就考虑了这种状况，例如 `async` 操作在 Tokio 中是惰性的:

```rust
loop {
    async_op();
}
```

如果上面代码中，`async_op` 不是惰性的，而是在每次循环时立即执行，那该循环会立即将一个 `async_op` 发送到缓冲队列中，然后开始执行下一个循环，因为无需等待任务执行完成，这种发送速度是非常恐怖的，一秒钟可能会有几十万、上百万的消息发送到消息队列中。在其它语言编程中，相信大家也或多或少遇到过这种情况。

然而在 `Async Rust` 和 Tokio 中，上面的代码 `async_op` 根本就不会运行，也就不会往消息队列中写入消息。原因是我们没有调用 `.await`，就算使用了 `.await` 上面的代码也不会有问题，因为只有等当前循环的任务结束后，才会开始下一次循环。

```rust
loop {
    // 当前 `async_op` 完成后，才会开始下一次循环
    async_op().await;
}
```

总之，在 Tokio 中我们必须要显式地引入并发和队列:

- `tokio::spawn`
- `select!`
- `join!`
- `mpsc::channel`

当这么做时，我们需要小心的控制并发度来确保系统的安全。例如，当使用一个循环去接收 TCP 连接时，你要确保当前打开的 `socket` 数量在可控范围内，而不是毫无原则的接收连接。 再比如，当使用 `mpsc::channel` 时，要设置一个缓冲值。

挑选一个合适的限制值是 `Tokio` 编程中很重要的一部分，可以帮助我们的系统更加安全、可靠的运行。
