# 异步跟同步共存
一些异步程序例如 tokio指南 章节中的绝大多数例子，它们整个程序都是异步的，包括程序入口 `main` 函数：
```rust
#[tokio::main]
async fn main() {
    println!("Hello world");
}
```

在一些场景中，你可能只想在异步程序中运行一小部分同步代码，这种需求可以考虑下 [`spawn_blocking`](https://docs.rs/tokio/1.16.1/tokio/task/fn.spawn_blocking.html)。

但是在很多场景中，我们只想让程序的某一个部分成为异步的，也许是因为同步代码更好实现，又或许是同步代码可读性、兼容性都更好。例如一个 `GUI` 应用可能想要让 `UI` 相关的代码在主线程中，然后通过另一个线程使用 `tokio` 的运行时来处理一些异步任务。

因此本章节的目标很纯粹：如何在同步代码中使用一小部分异步代码。

## `#[tokio::main]` 的展开
在 Rust 中， `main` 函数不能是异步的，有同学肯定不愿意了，我们在之前章节..不对，就在开头，你还用到了 `async  fn main` 的声明方式，怎么就不能异步了呢？

其实，`#[tokio::main]` 该宏仅仅是提供语法糖，目的是让大家可以更简单、更一致的去写异步代码，它会将你写下的`async fn main` 函数替换为：
```rust
fn main() {
    tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .build()
        .unwrap()
        .block_on(async {
            println!("Hello world");
        })
}
```

注意到上面的 `block_on` 方法了嘛？在我们自己的同步代码中，可以使用它开启一个 `async/await` 世界。

## mini-redis的同步接口
在下面，我们将一起构建一个同步的 `mini-redis` ，为了实现这一点，需要将 `Runtime` 对象存储起来，然后利用上面提到的 `block_on` 方法。


首先，创建一个文件 `src/blocking_client.rs`，然后使用下面代码将异步的 `Client` 结构体包裹起来:
```rust
use tokio::net::ToSocketAddrs;
use tokio::runtime::Runtime;

pub use crate::client::Message;

/// 建立到 redis 服务端的连接
pub struct BlockingClient {
    /// 之前实现的异步客户端 `Client`
    inner: crate::client::Client,

    /// 一个 `current_thread` 模式的 `tokio` 运行时，
    /// 使用阻塞的方式来执行异步客户端 `Client` 上的操作
    rt: Runtime,
}

pub fn connect<T: ToSocketAddrs>(addr: T) -> crate::Result<BlockingClient> {
    // 构建一个 tokio 运行时： Runtime
    let rt = tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()?;

    // 使用运行时来调用异步的连接方法
    let inner = rt.block_on(crate::client::connect(addr))?;

    Ok(BlockingClient { inner, rt })
}
```

在这里，我们使用了一个构造器函数用于在同步代码中执行异步的方法：使用 `Runtime` 上的 `block_on` 方法来执行一个异步方法并返回结果。

有一个很重要的点，就是我们还使用了 [`current_thread`](https://docs.rs/tokio/1.16.1/tokio/runtime/struct.Builder.html#method.new_current_thread) 模式的运行时。这个可不常见，原因是异步程序往往要利用多线程的威力来实现更高的吞吐性能，相对应的模式就是 [`multi_thread`](https://docs.rs/tokio/1.16.1/tokio/runtime/struct.Builder.html#method.new_multi_thread)，该模式会生成多个运行在后台的线程，它们可以高效的实现多个任务的同时并行处理。

但是对于我们的使用场景来说，在同一时间点只需要做一件事，无需并行处理，多个线程并不能帮助到任何事情，因此 `current_thread` 此时成为了最佳的选择。

在构建 `Runtime` 的过程中还有一个 [`enable_all`](https://docs.rs/tokio/1.16.1/tokio/runtime/struct.Builder.html#method.enable_all) 方法调用，它可以开启 `Tokio` 运行时提供的 IO 和定时器服务。


> 由于 `current_thread` 运行时并不生成新的线程，只是运行在已有的主线程上，因此只有当 `block_on` 被调用后，该运行时才能执行相应的操作。一旦 `block_on` 返回，那运行时上所有生成的任务将再次冻结，直到 `block_on` 的再次调用。
>
> 如果这种模式不符合使用场景的需求，那大家还是需要用 `multi_thread` 运行时来代替。事实上，在 tokio 之前的章节中，我们默认使用的就是 `multi_thread` 模式。

```rust
use bytes::Bytes;
use std::time::Duration;

impl BlockingClient {
    pub fn get(&mut self, key: &str) -> crate::Result<Option<Bytes>> {
        self.rt.block_on(self.inner.get(key))
    }

    pub fn set(&mut self, key: &str, value: Bytes) -> crate::Result<()> {
        self.rt.block_on(self.inner.set(key, value))
    }

    pub fn set_expires(
        &mut self,
        key: &str,
        value: Bytes,
        expiration: Duration,
    ) -> crate::Result<()> {
        self.rt.block_on(self.inner.set_expires(key, value, expiration))
    }

    pub fn publish(&mut self, channel: &str, message: Bytes) -> crate::Result<u64> {
        self.rt.block_on(self.inner.publish(channel, message))
    }
}
```

这代码看上去挺长，实际上很简单，通过 `block_on` 将异步形式的 `Client` 的方法变成同步调用的形式。例如 `BlockingClient` 的 `get` 方法实际上是对内部的异步 `get` 方法的同步调用。

与上面的平平无奇相比，下面的代码将更有趣，因为它将 `Client` 转变成一个 `Subscriber` 对象:
```rust
/// 下面的客户端可以进入 pub/sub (发布/订阅) 模式
///
/// 一旦客户端订阅了某个消息通道，那就只能执行 pub/sub 相关的命令。
/// 将`BlockingClient` 类型转换成 `BlockingSubscriber` 是为了防止非 `pub/sub` 方法被调用
pub struct BlockingSubscriber {
    /// 异步版本的 `Subscriber`
    inner: crate::client::Subscriber,

    /// 一个 `current_thread` 模式的 `tokio` 运行时，
    /// 使用阻塞的方式来执行异步客户端 `Client` 上的操作
    rt: Runtime,
}

impl BlockingClient {
    pub fn subscribe(self, channels: Vec<String>) -> crate::Result<BlockingSubscriber> {
        let subscriber = self.rt.block_on(self.inner.subscribe(channels))?;
        Ok(BlockingSubscriber {
            inner: subscriber,
            rt: self.rt,
        })
    }
}

impl BlockingSubscriber {
    pub fn get_subscribed(&self) -> &[String] {
        self.inner.get_subscribed()
    }

    pub fn next_message(&mut self) -> crate::Result<Option<Message>> {
        self.rt.block_on(self.inner.next_message())
    }

    pub fn subscribe(&mut self, channels: &[String]) -> crate::Result<()> {
        self.rt.block_on(self.inner.subscribe(channels))
    }

    pub fn unsubscribe(&mut self, channels: &[String]) -> crate::Result<()> {
        self.rt.block_on(self.inner.unsubscribe(channels))
    }
}
```

由上可知，`subscribe` 方法会使用运行时将一个异步的 `Client` 转变成一个异步的 `Subscriber`，此外，`Subscriber` 结构体有一个非异步的方法 `get_subscribed`，对于这种方法，只需直接调用即可，而无需使用运行时。

## 其它方法
上面介绍的是最简单的方法，但是，如果只有这一种， tokio 也不会如此大名鼎鼎。

#### runtime.spawn
可以通过 `Runtime` 的 `spawn` 方法来创建一个基于该运行时的后台任务：
```rust
use tokio::runtime::Builder;
use tokio::time::{sleep, Duration};

fn main() {
    let runtime = Builder::new_multi_thread()
        .worker_threads(1)
        .enable_all()
        .build()
        .unwrap();

    let mut handles = Vec::with_capacity(10);
    for i in 0..10 {
        handles.push(runtime.spawn(my_bg_task(i)));
    }

    // 在后台任务运行的同时做一些耗费时间的事情
    std::thread::sleep(Duration::from_millis(750));
    println!("Finished time-consuming task.");

    // 等待这些后台任务的完成
    for handle in handles {
        // `spawn` 方法返回一个 `JoinHandle`，它是一个 `Future`，因此可以通过  `block_on` 来等待它完成
        runtime.block_on(handle).unwrap();
    }
}

async fn my_bg_task(i: u64) {
    let millis = 1000 - 50 * i;
    println!("Task {} sleeping for {} ms.", i, millis);

    sleep(Duration::from_millis(millis)).await;

    println!("Task {} stopping.", i);
}
```

运行该程序，输出如下:
```console
Task 0 sleeping for 1000 ms.
Task 1 sleeping for 950 ms.
Task 2 sleeping for 900 ms.
Task 3 sleeping for 850 ms.
Task 4 sleeping for 800 ms.
Task 5 sleeping for 750 ms.
Task 6 sleeping for 700 ms.
Task 7 sleeping for 650 ms.
Task 8 sleeping for 600 ms.
Task 9 sleeping for 550 ms.
Task 9 stopping.
Task 8 stopping.
Task 7 stopping.
Task 6 stopping.
Finished time-consuming task.
Task 5 stopping.
Task 4 stopping.
Task 3 stopping.
Task 2 stopping.
Task 1 stopping.
Task 0 stopping.
```

在此例中，我们生成了10个后台任务在运行时中运行，然后等待它们的完成。作为一个例子，想象一下在图形渲染应用( GUI )中，有时候需要通过网络访问远程服务来获取一些数据，那上面的这种模式就非常适合，因为这些网络访问比较耗时，而且不会影响图形的主体渲染，因此可以在主线程中渲染图形，然后使用其它线程来运行 Tokio 的运行时，并通过该运行时使用异步的方式完成网络访问，最后将这些网络访问的结果发送到 GUI 进行数据渲染，例如一个进度条。

还有一点很重要，在本例子中只能使用 `multi_thread` 运行时。如果我们使用了 `current_thread`，你会发现主线程的耗时任务会在后台任务开始之前就完成了。因为在 `current_thread` 模式下，生成的任务只会在 `block_on` 期间才执行。

在 `multi_thread` 模式下，我们并不需要通过 `block_on` 来触发任务的运行，这里仅仅是用来阻塞并等待最终的结果。而除了通过 `block_on` 等待结果外，你还可以：

- 使用消息传递的方式，例如 `tokio::sync::mpsc`，让异步任务将结果发送到主线程，然后主线程通过 `.recv`方法等待这些结果
- 通过共享变量的方式，例如 `Mutex`，这种方式非常适合实现 GUI 的进度条: GUI 在每个渲染帧读取该变量即可。

#### 发送消息
在同步代码中使用异步的另一个方法就是生成一个运行时，然后使用消息传递的方式跟它进行交互。这个方法虽然更啰嗦一些，但是相对于之前的两种方法更加灵活：
```rust
use tokio::runtime::Builder;
use tokio::sync::mpsc;

pub struct Task {
    name: String,
    // 一些信息用于描述该任务
}

async fn handle_task(task: Task) {
    println!("Got task {}", task.name);
}

#[derive(Clone)]
pub struct TaskSpawner {
    spawn: mpsc::Sender<Task>,
}

impl TaskSpawner {
    pub fn new() -> TaskSpawner {
        // 创建一个消息通道用于通信
        let (send, mut recv) = mpsc::channel(16);

        let rt = Builder::new_current_thread()
            .enable_all()
            .build()
            .unwrap();

        std::thread::spawn(move || {
            rt.block_on(async move {
                while let Some(task) = recv.recv().await {
                    tokio::spawn(handle_task(task));
                }

                // 一旦所有的发送端超出作用域被 drop 后，`.recv()` 方法会返回 None，同时 while 循环会退出，然后线程结束
            });
        });

        TaskSpawner {
            spawn: send,
        }
    }

    pub fn spawn_task(&self, task: Task) {
        match self.spawn.blocking_send(task) {
            Ok(()) => {},
            Err(_) => panic!("The shared runtime has shut down."),
        }
    }
}
```

为何说这种方法比较灵活呢？以上面代码为例，它可以在很多方面进行配置。例如，可以使用信号量 [`Semaphore`](https://docs.rs/tokio/1.16.1/tokio/sync/struct.Semaphore.html)来限制当前正在进行的任务数，或者你还可以使用一个消息通道将消息反向发送回任务生成器 `spawner`。

抛开细节，抽象来看，这是不是很像一个 Actor ？
