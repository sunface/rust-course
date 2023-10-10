# 深入 Tokio 背后的异步原理

在经过多个章节的深入学习后，Tokio 对我们来说不再是一座隐于云雾中的高山，它其实蛮简单好用的，甚至还有一丝丝的可爱!?

但从现在开始，如果想要进一步的深入 Tokio ，首先需要深入理解 `async` 的原理，其实我们在[之前的章节](https://course.rs/async/intro.html)已经深入学习过，这里结合 Tokio 再来回顾下。

## Future

先来回顾一下 `async fn` 异步函数 :

```rust
use tokio::net::TcpStream;

async fn my_async_fn() {
    println!("hello from async");
    // 通过 .await 创建 socket 连接
    let _socket = TcpStream::connect("127.0.0.1:3000").await.unwrap();
    println!("async TCP operation complete");
    // 关闭socket
}
```

接着对它进行调用获取一个返回值，再在返回值上调用 `.await`：

```rust
#[tokio::main]
async fn main() {
    let what_is_this = my_async_fn();
    // 上面的调用不会产生任何效果

    // ... 执行一些其它代码


    what_is_this.await;
    // 直到 .await 后，文本才被打印，socket 连接也被创建和关闭
}
```

在上面代码中 `my_async_fn` 函数为何可以惰性执行( 直到 .await 调用时才执行)？秘密就在于 `async fn` 声明的函数返回一个 `Future`。

`Future` 是一个实现了 [`std::future::Future`](https://doc.rust-lang.org/std/future/trait.Future.html) 特征的值，该值包含了一系列异步计算过程，而这个过程直到 `.await` 调用时才会被执行。

`std::future::Future` 的定义如下所示:

```rust
use std::pin::Pin;
use std::task::{Context, Poll};

pub trait Future {
    type Output;

    fn poll(self: Pin<&mut Self>, cx: &mut Context)
        -> Poll<Self::Output>;
}
```

代码中有几个关键点：

- [关联类型](https://course.rs/basic/trait/advance-trait.html#关联类型) `Output` 是 `Future` 执行完成后返回的值的类型
- `Pin` 类型是在异步函数中进行借用的关键，在[这里](https://course.rs/advance/async/pin-unpin.html)有非常详细的介绍

和其它语言不同，Rust 中的 `Future` 不代表一个发生在后台的计算，而是 `Future` 就代表了计算本身，因此
`Future` 的所有者有责任去推进该计算过程的执行，例如通过 `Future::poll` 函数。听上去好像还挺复杂？但是大家不必担心，因为这些都在 Tokio 中帮你自动完成了 :)

#### 实现 Future

下面来一起实现个五脏俱全的 `Future`，它将：1. 等待某个特定时间点的到来 2. 在标准输出打印文本 3. 生成一个字符串

```rust
use std::future::Future;
use std::pin::Pin;
use std::task::{Context, Poll};
use std::time::{Duration, Instant};

struct Delay {
    when: Instant,
}

// 为我们的 Delay 类型实现 Future 特征
impl Future for Delay {
    type Output = &'static str;

    fn poll(self: Pin<&mut Self>, cx: &mut Context<'_>)
        -> Poll<&'static str>
    {
        if Instant::now() >= self.when {
            // 时间到了，Future 可以结束
            println!("Hello world");
            // Future 执行结束并返回 "done" 字符串
            Poll::Ready("done")
        } else {
            // 目前先忽略下面这行代码
            cx.waker().wake_by_ref();
            Poll::Pending
        }
    }
}

#[tokio::main]
async fn main() {
    let when = Instant::now() + Duration::from_millis(10);
    let future = Delay { when };

    // 运行并等待 Future 的完成
    let out = future.await;

    // 判断 Future 返回的字符串是否是 "done"
    assert_eq!(out, "done");
}
```

以上代码很清晰的解释了如何自定义一个 `Future`，并指定它如何通过 `poll` 一步一步执行，直到最终完成返回 `"done"` 字符串。

#### async fn 作为 Future

大家有没有注意到，上面代码我们在 `main` 函数中初始化一个 `Future` 并使用 `.await` 对其进行调用执行，如果你是在 `fn main` 中这么做，是会报错的。

原因是 `.await` 只能用于 `async fn` 函数中，因此我们将 `main` 函数声明成 `async fn main` 同时使用 `#[tokio::main]` 进行了标注，此时 `async fn main` 生成的代码类似下面：

```rust
use std::future::Future;
use std::pin::Pin;
use std::task::{Context, Poll};
use std::time::{Duration, Instant};

enum MainFuture {
    // 初始化，但永远不会被 poll
    State0,
    // 等待 `Delay` 运行，例如 `future.await` 代码行
    State1(Delay),
    // Future 执行完成
    Terminated,
}

impl Future for MainFuture {
    type Output = ();

    fn poll(mut self: Pin<&mut Self>, cx: &mut Context<'_>)
        -> Poll<()>
    {
        use MainFuture::*;

        loop {
            match *self {
                State0 => {
                    let when = Instant::now() +
                        Duration::from_millis(10);
                    let future = Delay { when };
                    *self = State1(future);
                }
                State1(ref mut my_future) => {
                    match Pin::new(my_future).poll(cx) {
                        Poll::Ready(out) => {
                            assert_eq!(out, "done");
                            *self = Terminated;
                            return Poll::Ready(());
                        }
                        Poll::Pending => {
                            return Poll::Pending;
                        }
                    }
                }
                Terminated => {
                    panic!("future polled after completion")
                }
            }
        }
    }
}
```

可以看出，编译器会将 `Future` 变成状态机， 其中 `MainFuture` 包含了 `Future` 可能处于的状态：从 `State0` 状态开始，当 `poll` 被调用时， `Future` 会尝试去尽可能的推进内部的状态，若它可以被完成时，就会返回 `Poll::Ready`，其中还会包含最终的输出结果。

若 `Future` 无法被完成，例如它所等待的资源还没有准备好，此时就会返回 `Poll::Pending`，该返回值会通知调用者： `Future` 会在稍后才能完成。

同时可以看到：当一个 `Future` 由其它 `Future` 组成时，调用外层 `Future` 的 `poll` 函数会同时调用一次内部 `Future` 的 `poll` 函数。

## 执行器( Excecutor )

`async fn` 返回 `Future` ，而后者需要通过被不断的 `poll` 才能往前推进状态，同时该 `Future` 还能包含其它 `Future` ，那么问题来了谁来负责调用最外层 `Future` 的 `poll` 函数？

回一下之前的内容，为了运行一个异步函数，我们必须使用 `tokio::spawn` 或 通过 `#[tokio::main]` 标注的 `async fn main` 函数。它们有一个非常重要的作用：将最外层 `Future` 提交给 Tokio 的执行器。该执行器负责调用 `poll` 函数，然后推动 `Future` 的执行，最终直至完成。

#### mini tokio

为了更好理解相关的内容，我们一起来实现一个迷你版本的 Tokio，完整的代码见[这里](https://github.com/tokio-rs/website/blob/master/tutorial-code/mini-tokio/src/main.rs)。

先来看一段基础代码:

```rust
use std::collections::VecDeque;
use std::future::Future;
use std::pin::Pin;
use std::task::{Context, Poll};
use std::time::{Duration, Instant};
use futures::task;

fn main() {
    let mut mini_tokio = MiniTokio::new();

    mini_tokio.spawn(async {
        let when = Instant::now() + Duration::from_millis(10);
        let future = Delay { when };

        let out = future.await;
        assert_eq!(out, "done");
    });

    mini_tokio.run();
}

struct MiniTokio {
    tasks: VecDeque<Task>,
}

type Task = Pin<Box<dyn Future<Output = ()> + Send>>;

impl MiniTokio {
    fn new() -> MiniTokio {
        MiniTokio {
            tasks: VecDeque::new(),
        }
    }

    /// 生成一个 Future并放入 mini-tokio 实例的任务队列中
    fn spawn<F>(&mut self, future: F)
    where
        F: Future<Output = ()> + Send + 'static,
    {
        self.tasks.push_back(Box::pin(future));
    }

    fn run(&mut self) {
        let waker = task::noop_waker();
        let mut cx = Context::from_waker(&waker);

        while let Some(mut task) = self.tasks.pop_front() {
            if task.as_mut().poll(&mut cx).is_pending() {
                self.tasks.push_back(task);
            }
        }
    }
}
```

以上代码运行了一个 `async` 语句块 `mini_tokio.spawn(async {...})`， 还创建了一个 `Delay` 实例用于等待所需的时间。看上去相当不错，但这个实现有一个 **重大缺陷**：我们的执行器永远也不会休眠。执行器会持续的循环遍历所有的 `Future` ，然后不停的 `poll` 它们，但是事实上，大多数 `poll` 都是没有用的，因为此时 `Future` 并没有准备好，因此会继续返回 `Poll::Pending` ，最终这个循环遍历会让你的 CPU 疲于奔命，真打工人！

鉴于此，我们的 mini-tokio 只应该在 `Future` 准备好可以进一步运行后，才去 `poll` 它，例如该 `Future` 之前阻塞等待的**资源**已经准备好并可以被使用了，就可以对其进行 `poll`。再比如，如果一个 `Future` 任务在阻塞等待从 TCP socket 中读取数据，那我们只想在 `socket` 中有数据可以读取后才去 `poll` 它，而不是没事就 `poll` 着玩。

回到上面的代码中，mini-tokio 只应该当任务的延迟时间到了后，才去 `poll` 它。 为了实现这个功能，我们需要 `通知 -> 运行` 机制：当任务可以进一步被推进运行时，它会主动通知执行器，然后执行器再来 `poll`。

## Waker

一切的答案都在 `Waker` 中，资源可以用它来通知正在等待的任务：该资源已经准备好，可以继续运行了。

再来看下 `Future::poll` 的定义：

```rust
fn poll(self: Pin<&mut Self>, cx: &mut Context)
    -> Poll<Self::Output>;
```

`Context` 参数中包含有 `waker()`方法。该方法返回一个绑定到当前任务上的 `Waker`，然后 `Waker` 上定义了一个 `wake()` 方法，用于通知执行器相关的任务可以继续执行。

准确来说，当 `Future` 阻塞等待的资源已经准备好时(例如 socket 中有了可读取的数据)，该资源可以调用 `wake()` 方法，来通知执行器可以继续调用该 `Future` 的 `poll` 函数来推进任务的执行。

#### 发送 wake 通知

现在，为 `Delay` 添加下 `Waker` 支持：

```rust
use std::future::Future;
use std::pin::Pin;
use std::task::{Context, Poll};
use std::time::{Duration, Instant};
use std::thread;

struct Delay {
    when: Instant,
}

impl Future for Delay {
    type Output = &'static str;

    fn poll(self: Pin<&mut Self>, cx: &mut Context<'_>)
        -> Poll<&'static str>
    {
        if Instant::now() >= self.when {
            println!("Hello world");
            Poll::Ready("done")
        } else {
            // 为当前任务克隆一个 waker 的句柄
            let waker = cx.waker().clone();
            let when = self.when;

            // 生成一个计时器线程
            thread::spawn(move || {
                let now = Instant::now();

                if now < when {
                    thread::sleep(when - now);
                }

                waker.wake();
            });

            Poll::Pending
        }
    }
}
```

此时，计时器用来模拟一个阻塞等待的资源，一旦计时结束(该资源已经准备好)，资源会通过 `waker.wake()` 调用通知执行器我们的任务再次被调度执行了。

当然，现在的实现还较为粗糙，等会我们会来进一步优化，在此之前，先来看看如何监听这个 `wake` 通知。

> 当 Future 会返回 `Poll::Pending` 时，一定要确保 `wake` 能被正常调用，否则会导致任务永远被挂起，再也不会被执行器 `poll`。
>
> **忘记在返回 `Poll::Pending` 时调用 `wake` 是很多难以发现 bug 的潜在源头！**

再回忆下最早实现的 `Delay` 代码：

```rust
impl Future for Delay {
    type Output = &'static str;

    fn poll(self: Pin<&mut Self>, cx: &mut Context<'_>)
        -> Poll<&'static str>
    {
        if Instant::now() >= self.when {
            // 时间到了，Future 可以结束
            println!("Hello world");
            // Future 执行结束并返回 "done" 字符串
            Poll::Ready("done")
        } else {
            // 目前先忽略下面这行代码
            cx.waker().wake_by_ref();
            Poll::Pending
        }
    }
}
```

在返回 `Poll::Pending` 之前，先调用了 `cx.waker().wake_by_ref()` ，由于此时我们还没有模拟计时资源，因此这里直接调用了 `wake` 进行通知，这样做会导致当前的 `Future` 被立即再次调度执行。

由此可见，这种通知的控制权是在你手里的，甚至可以像上面代码这样，还没准备好资源，就直接进行 `wake` 通知，但是总归意义不大，而且浪费了 CPU，因为这种 `执行 -> 立即通知再调度 -> 执行` 的方式会造成一个非常繁忙的循环。

#### 处理 wake 通知

下面，让我们更新 mini-tokio 服务，让它能接收 wake 通知：当 `waker.wake()` 被调用后，相关联的任务会被放入执行器的队列中，然后等待执行器的调用执行。

为了实现这一点，我们将使用消息通道来排队存储这些被唤醒并等待调度的任务。有一点需要注意，从消息通道接收消息的线程(执行器所在的线程)和发送消息的线程（唤醒任务时所在的线程）可能是不同的，因此消息( `Waker` )必须要实现 `Send`和 `Sync`，才能跨线程使用。

> 关于 `Send` 和 `Sync` 的具体讲解见[这里](https://course.rs/advance/concurrency-with-threads/send-sync.html)

基于以上理由，我们选择使用来自于 `crossbeam` 的消息通道，因为标准库中的消息通道不是 `Sync` 的。在 `Cargo.toml` 中添加以下依赖：

```toml
crossbeam = "0.8"
```

再来更新下 `MiniTokio` 结构体：

```rust
use crossbeam::channel;
use std::sync::Arc;

struct MiniTokio {
    scheduled: channel::Receiver<Arc<Task>>,
    sender: channel::Sender<Arc<Task>>,
}

struct Task {
    // 先空着，后面会填充代码
}
```

`Waker` 实现了 `Sync` 特征，同时还可以被克隆，当 `wake` 被调用时，任务就会被调度执行。

为了实现上述的目的，我们引入了消息通道，当 `waker.wake()` 函数被调用时，任务会被发送到该消息通道中:

```rust
use std::sync::{Arc, Mutex};

struct Task {
    // `Mutex` 是为了让 `Task` 实现 `Sync` 特征，它能保证同一时间只有一个线程可以访问 `Future`。
    // 事实上 `Mutex` 并没有在 Tokio 中被使用，这里我们只是为了简化： Tokio 的真实代码实在太长了 :D
    future: Mutex<Pin<Box<dyn Future<Output = ()> + Send>>>,
    executor: channel::Sender<Arc<Task>>,
}

impl Task {
    fn schedule(self: &Arc<Self>) {
        self.executor.send(self.clone());
    }
}
```

接下来，我们需要让 `std::task::Waker` 能准确的找到所需的调度函数 关联起来，对此标准库中提供了一个底层的 API [`std::task::RawWakerVTable`](https://doc.rust-lang.org/std/task/struct.RawWakerVTable.html) 可以用于手动的访问 `vtable`，这种实现提供了最大的灵活性，但是需要大量 `unsafe` 的代码。

因此我们选择更加高级的实现：由 `futures` 包提供的 [`ArcWake`](https://docs.rs/futures/0.3.19/futures/task/trait.ArcWake.html) 特征，只要简单实现该特征，就可以将我们的 `Task` 转变成一个 `waker`。在 `Cargo.toml` 中添加以下包：

```toml
futures = "0.3"
```

然后为我们的任务 `Task` 实现 `ArcWake`:

```rust
use futures::task::{self, ArcWake};
use std::sync::Arc;
impl ArcWake for Task {
    fn wake_by_ref(arc_self: &Arc<Self>) {
        arc_self.schedule();
    }
}
```

当之前的计时器线程调用 `waker.wake()` 时，所在的任务会被推入到消息通道中。因此接下来，我们需要实现接收端的功能，然后 `MiniTokio::run()` 函数中执行该任务:

```rust
impl MiniTokio {
    // 从消息通道中接收任务，然后通过 poll 来执行
    fn run(&self) {
        while let Ok(task) = self.scheduled.recv() {
            task.poll();
        }
    }

    /// 初始化一个新的 mini-tokio 实例
    fn new() -> MiniTokio {
        let (sender, scheduled) = channel::unbounded();

        MiniTokio { scheduled, sender }
    }


    /// 在下面函数中，通过参数传入的 future 被 `Task` 包裹起来，然后会被推入到调度队列中，当 `run` 被调用时，该 future 将被执行
    fn spawn<F>(&self, future: F)
    where
        F: Future<Output = ()> + Send + 'static,
    {
        Task::spawn(future, &self.sender);
    }
}

impl Task {
    fn poll(self: Arc<Self>) {
        // 基于 Task 实例创建一个 waker, 它使用了之前的 `ArcWake`
        let waker = task::waker(self.clone());
        let mut cx = Context::from_waker(&waker);

        // 没有其他线程在竞争锁时，我们将获取到目标 future
        let mut future = self.future.try_lock().unwrap();

        // 对 future 进行 poll
        let _ = future.as_mut().poll(&mut cx);
    }

    // 使用给定的 future 来生成新的任务
    //
    // 新的任务会被推到 `sender` 中，接着该消息通道的接收端就可以获取该任务，然后执行
    fn spawn<F>(future: F, sender: &channel::Sender<Arc<Task>>)
    where
        F: Future<Output = ()> + Send + 'static,
    {
        let task = Arc::new(Task {
            future: Mutex::new(Box::pin(future)),
            executor: sender.clone(),
        });

        let _ = sender.send(task);
    }

}
```

首先，我们实现了 `MiniTokio::run()` 函数，它会持续从消息通道中接收被唤醒的任务，然后通过 `poll` 来推动其继续执行。

其次，`MiniTokio::new()` 和 `MiniTokio::spawn()` 使用了消息通道而不是一个 `VecDeque` 。当新任务生成后，这些任务中会携带上消息通道的发送端，当任务中的资源准备就绪时，会使用该发送端将该任务放入消息通道的队列中，等待执行器 `poll`。

`Task::poll()` 函数使用 `futures` 包提供的 `ArcWake` 创建了一个 `waker`，后者可以用来创建 `task::Context`，最终该 `Context` 会被传给执行器调用的 `poll` 函数。

> 注意，Task::poll 和执行器调用的 poll 是完全不同的，大家别搞混了

## 一些遗留问题

至此，我们的程序已经差不多完成，还剩几个遗留问题需要解决下。

#### 在异步函数中生成异步任务

之前实现 `Delay Future` 时，我们提到有几个问题需要解决。Rust 的异步模型允许一个 Future 在执行过程中可以跨任务迁移:

```rust
use futures::future::poll_fn;
use std::future::Future;
use std::pin::Pin;

#[tokio::main]
async fn main() {
    let when = Instant::now() + Duration::from_millis(10);
    let mut delay = Some(Delay { when });

    poll_fn(move |cx| {
        let mut delay = delay.take().unwrap();
        let res = Pin::new(&mut delay).poll(cx);
        assert!(res.is_pending());
        tokio::spawn(async move {
            delay.await;
        });

        Poll::Ready(())
    }).await;
}
```

首先，`poll_fn` 函数使用闭包创建了一个 `Future`，其次，上面代码还创建一个 `Delay` 实例，然后在闭包中，对其进行了一次 `poll` ，接着再将该 `Delay` 实例发送到一个新的任务，在此任务中使用 `.await` 进行了执行。

在例子中，`Delay:poll` 被调用了不止一次，且使用了不同的 `Waker` 实例，在这种场景下，你必须确保调用最近一次 `poll` 函数中的 `Waker` 参数中的`wake`方法。也就是调用最内层 `poll` 函数参数( `Waker` )上的 `wake` 方法。

当实现一个 `Future` 时，很关键的一点就是要假设每次 `poll` 调用都会应用到一个不同的 `Waker` 实例上。因此 `poll` 函数必须要使用一个新的 `waker` 去更新替代之前的 `waker`。

我们之前的 `Delay` 实现中，会在每一次 `poll` 调用时都生成一个新的线程。这么做问题不大，但是当 `poll` 调用较多时会出现明显的性能问题！一个解决方法就是记录你是否已经生成了一个线程，然后只有在没有生成时才去创建一个新的线程。但是一旦这么做，就必须确保线程的 `Waker` 在后续 `poll` 调用中被正确更新，否则你无法唤醒最近的 `Waker` ！

这一段大家可能会看得云里雾里的，没办法，原文就饶来绕去，好在终于可以看代码了。。我们可以通过代码来解决疑惑：

```rust
use std::future::Future;
use std::pin::Pin;
use std::sync::{Arc, Mutex};
use std::task::{Context, Poll, Waker};
use std::thread;
use std::time::{Duration, Instant};

struct Delay {
    when: Instant,
    // 用于说明是否已经生成一个线程
    // Some 代表已经生成， None 代表还没有
    waker: Option<Arc<Mutex<Waker>>>,
}

impl Future for Delay {
    type Output = ();

    fn poll(mut self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<()> {
        // 若这是 Future 第一次被调用，那么需要先生成一个计时器线程。
        // 若不是第一次调用(该线程已在运行)，那要确保已存储的 `Waker` 跟当前任务的 `waker` 匹配
        if let Some(waker) = &self.waker {
            let mut waker = waker.lock().unwrap();

            // 检查之前存储的 `waker` 是否跟当前任务的 `waker` 相匹配.
            // 这是必要的，原因是 `Delay Future` 的实例可能会在两次 `poll` 之间被转移到另一个任务中，然后
            // 存储的 waker 被该任务进行了更新。
            // 这种情况一旦发生，`Context` 包含的 `waker` 将不同于存储的 `waker`。
            // 因此我们必须对存储的 `waker` 进行更新
            if !waker.will_wake(cx.waker()) {
                *waker = cx.waker().clone();
            }
        } else {
            let when = self.when;
            let waker = Arc::new(Mutex::new(cx.waker().clone()));
            self.waker = Some(waker.clone());

            // 第一次调用 `poll`，生成计时器线程
            thread::spawn(move || {
                let now = Instant::now();

                if now < when {
                    thread::sleep(when - now);
                }

                // 计时结束，通过调用 `waker` 来通知执行器
                let waker = waker.lock().unwrap();
                waker.wake_by_ref();
            });
        }

        // 一旦 waker 被存储且计时器线程已经开始，我们就需要检查 `delay` 是否已经完成
        // 若计时已完成，则当前 Future 就可以完成并返回 `Poll::Ready`
        if Instant::now() >= self.when {
            Poll::Ready(())
        } else {
            // 计时尚未结束，Future 还未完成，因此返回 `Poll::Pending`.
            //
            // `Future` 特征要求当 `Pending` 被返回时，那我们要确保当资源准备好时，必须调用 `waker` 以通
            // 知执行器。 在我们的例子中，会通过生成的计时线程来保证
            //
            // 如果忘记调用 waker， 那等待我们的将是深渊：该任务将被永远的挂起，无法再执行
            Poll::Pending
        }
    }
}
```

这着实有些复杂(原文。。)，但是简单来看就是：在每次 `poll` 调用时，都会检查 `Context` 中提供的 `waker` 和我们之前记录的 `waker` 是否匹配。若匹配，就什么都不用做，若不匹配，那之前存储的就必须进行更新。

#### Notify

我们之前证明了如何用手动编写的 `waker` 来实现 `Delay Future`。 `Waker` 是 Rust 异步编程的基石，因此绝大多数时候，我们并不需要直接去使用它。例如，在 `Delay` 的例子中， 可以使用 [`tokio::sync::Notify`](https://docs.rs/tokio/1.16.0/tokio/sync/struct.Notify.html) 去实现。

该 `Notify` 提供了一个基础的任务通知机制，它会处理这些 `waker` 的细节，包括确保两次 `waker` 的匹配:

```rust
use tokio::sync::Notify;
use std::sync::Arc;
use std::time::{Duration, Instant};
use std::thread;

async fn delay(dur: Duration) {
    let when = Instant::now() + dur;
    let notify = Arc::new(Notify::new());
    let notify2 = notify.clone();

    thread::spawn(move || {
        let now = Instant::now();

        if now < when {
            thread::sleep(when - now);
        }

        notify2.notify_one();
    });


    notify.notified().await;
}
```

当使用 `Notify` 后，我们就可以轻松的实现如上的 `delay` 函数。

## 总结

在看完这么长的文章后，我们来总结下，否则大家可能还会遗忘:

- 在 Rust 中，`async` 是惰性的，直到执行器 `poll` 它们时，才会开始执行
- `Waker` 是 `Future` 被执行的关键，它可以链接起 `Future` 任务和执行器
- 当资源没有准备时，会返回一个 `Poll::Pending`
- 当资源准备好时，会通过 `waker.wake` 发出通知
- 执行器会收到通知，然后调度该任务继续执行，此时由于资源已经准备好，因此任务可以顺利往前推进了
