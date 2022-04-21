# select!

在实际使用时，一个重要的场景就是同时等待多个异步操作的结果，并且对其结果进行进一步处理，在本章节，我们来看看，强大的 `select!` 是如何帮助咱们更好的控制多个异步操作并发执行的。

## tokio::select!

`select!` 允许同时等待多个计算操作，然后当其中一个操作完成时就退出等待:

```rust
use tokio::sync::oneshot;

#[tokio::main]
async fn main() {
    let (tx1, rx1) = oneshot::channel();
    let (tx2, rx2) = oneshot::channel();

    tokio::spawn(async {
        let _ = tx1.send("one");
    });

    tokio::spawn(async {
        let _ = tx2.send("two");
    });

    tokio::select! {
        val = rx1 => {
            println!("rx1 completed first with {:?}", val);
        }
        val = rx2 => {
            println!("rx2 completed first with {:?}", val);
        }
    }

    // 任何一个 select 分支结束后，都会继续执行接下来的代码
}
```

这里用到了两个 `oneshot` 消息通道，虽然两个操作的创建在代码上有先后顺序，但在实际执行时却不这样。因此， `select` 在从两个通道**阻塞等待**接收消息时，`rx1` 和 `rx2` 都有可能被先打印出来。

需要注意，任何一个 `select` 分支完成后，都会继续执行后面的代码，没被执行的分支会被丢弃( `dropped` )。

#### 取消

对于 `Async Rust` 来说，释放( drop )掉一个 `Future` 就意味着取消任务。从上一章节可以得知， `async` 操作会返回一个 `Future`，而后者是惰性的，直到被 `poll` 调用时，才会被执行。一旦 `Future` 被释放，那操作将无法继续，因为所有相关的状态都被释放。

对于 Tokio 的 `oneshot` 的接收端来说，它在被释放时会发送一个关闭通知到发送端，因此发送端可以通过释放任务的方式来终止正在执行的任务。

```rust
use tokio::sync::oneshot;

async fn some_operation() -> String {
    // 在这里执行一些操作...
}

#[tokio::main]
async fn main() {
    let (mut tx1, rx1) = oneshot::channel();
    let (tx2, rx2) = oneshot::channel();

    tokio::spawn(async {
        // 等待 `some_operation` 的完成
        // 或者处理 `oneshot` 的关闭通知
        tokio::select! {
            val = some_operation() => {
                let _ = tx1.send(val);
            }
            _ = tx1.closed() => {
                // 收到了发送端发来的关闭信号
                // `select` 即将结束，此时，正在进行的 `some_operation()` 任务会被取消，任务自动完成，
                // tx1 被释放
            }
        }
    });

    tokio::spawn(async {
        let _ = tx2.send("two");
    });

    tokio::select! {
        val = rx1 => {
            println!("rx1 completed first with {:?}", val);
        }
        val = rx2 => {
            println!("rx2 completed first with {:?}", val);
        }
    }
}
```

上面代码的重点就在于 `tx1.closed` 所在的分支，一旦发送端被关闭，那该分支就会被执行，然后 `select` 会退出，并清理掉还没执行的第一个分支 `val = some_operation()` ，这其中 `some_operation` 返回的 `Future` 也会被清理，根据之前的内容，`Future` 被清理那相应的任务会立即取消，因此 `some_operation` 会被取消，不再执行。

#### Future 的实现

为了更好的理解 `select` 的工作原理，我们来看看如果使用 `Future` 该如何实现。当然，这里是一个简化版本，在实际中，`select!` 会包含一些额外的功能，例如一开始会随机选择一个分支进行 `poll`。

```rust
use tokio::sync::oneshot;
use std::future::Future;
use std::pin::Pin;
use std::task::{Context, Poll};

struct MySelect {
    rx1: oneshot::Receiver<&'static str>,
    rx2: oneshot::Receiver<&'static str>,
}

impl Future for MySelect {
    type Output = ();

    fn poll(mut self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<()> {
        if let Poll::Ready(val) = Pin::new(&mut self.rx1).poll(cx) {
            println!("rx1 completed first with {:?}", val);
            return Poll::Ready(());
        }

        if let Poll::Ready(val) = Pin::new(&mut self.rx2).poll(cx) {
            println!("rx2 completed first with {:?}", val);
            return Poll::Ready(());
        }

        Poll::Pending
    }
}

#[tokio::main]
async fn main() {
    let (tx1, rx1) = oneshot::channel();
    let (tx2, rx2) = oneshot::channel();

    // 使用 tx1 和 tx2

    MySelect {
        rx1,
        rx2,
    }.await;
}
```

`MySelect` 包含了两个分支中的 `Future`，当它被 `poll` 时，第一个分支会先执行。如果执行完成，那取出的值会被使用，然后 `MySelect` 也随之结束。而另一个分支对应的 `Future` 会被释放掉，对应的操作也会被取消。

还记得上一章节中很重要的一段话吗？

> 当一个 `Future` 返回 `Poll::Pending` 时，它必须确保会在某一个时刻通过 `Waker` 来唤醒，不然该 `Future` 将永远地被挂起

但是仔细观察我们之前的代码，里面并没有任何的 `wake` 调用！事实上，这是因为参数 `cx` 被传入了内层的 `poll` 调用。 只要内部的 `Future` 实现了唤醒并且返回了 `Poll::Pending`，那 `MySelect` 也等于实现了唤醒！

## 语法

目前来说，`select!` 最多可以支持 64 个分支，每个分支形式如下：

```rust
<模式> = <async 表达式> => <结果处理>,
```

当 `select` 宏开始执行后，所有的分支会开始并发的执行。当任何一个**表达式**完成时，会将结果跟**模式**进行匹配。若匹配成功，则剩下的表达式会被释放。

最常用的**模式**就是用变量名去匹配表达式返回的值，然后该变量就可以在**结果处理**环节使用。

如果当前的模式不能匹配，剩余的 `async` 表达式将继续并发的执行，直到下一个完成。

由于 `select!` 使用的是一个 `async` 表达式，因此我们可以定义一些更复杂的计算。

例如从在分支中进行 TCP 连接：

```rust
use tokio::net::TcpStream;
use tokio::sync::oneshot;

#[tokio::main]
async fn main() {
    let (tx, rx) = oneshot::channel();

    // 生成一个任务，用于向 oneshot 发送一条消息
    tokio::spawn(async move {
        tx.send("done").unwrap();
    });

    tokio::select! {
        socket = TcpStream::connect("localhost:3465") => {
            println!("Socket connected {:?}", socket);
        }
        msg = rx => {
            println!("received message first {:?}", msg);
        }
    }
}
```

再比如，在分支中进行 TCP 监听:

```rust
use tokio::net::TcpListener;
use tokio::sync::oneshot;
use std::io;

#[tokio::main]
async fn main() -> io::Result<()> {
    let (tx, rx) = oneshot::channel();

    tokio::spawn(async move {
        tx.send(()).unwrap();
    });

    let mut listener = TcpListener::bind("localhost:3465").await?;

    tokio::select! {
        _ = async {
            loop {
                let (socket, _) = listener.accept().await?;
                tokio::spawn(async move { process(socket) });
            }

            // 给予 Rust 类型暗示
            Ok::<_, io::Error>(())
        } => {}
        _ = rx => {
            println!("terminating accept loop");
        }
    }

    Ok(())
}
```

分支中接收连接的循环会一直运行，直到遇到错误才停止，或者当 `rx` 中有值时，也会停止。 `_` 表示我们并不关心这个值，这样使用唯一的目的就是为了结束第一分支中的循环。

## 返回值

`select!` 还能返回一个值:

```rust
async fn computation1() -> String {
    // .. 计算
}

async fn computation2() -> String {
    // .. 计算
}

#[tokio::main]
async fn main() {
    let out = tokio::select! {
        res1 = computation1() => res1,
        res2 = computation2() => res2,
    };

    println!("Got = {}", out);
}
```

需要注意的是，此时 `select!` 的所有分支必须返回一样的类型，否则编译器会报错！

## 错误传播

在 Rust 中使用 `?` 可以对错误进行传播，但是在 `select!` 中，`?` 如何工作取决于它是在分支中的 `async` 表达式使用还是在结果处理的代码中使用:

- 在分支中 `async` 表达式使用会将该表达式的结果变成一个 `Result`
- 在结果处理中使用，会将错误直接传播到 `select!` 之外

```rust
use tokio::net::TcpListener;
use tokio::sync::oneshot;
use std::io;

#[tokio::main]
async fn main() -> io::Result<()> {
    // [设置 `rx` oneshot 消息通道]

    let listener = TcpListener::bind("localhost:3465").await?;

    tokio::select! {
        res = async {
            loop {
                let (socket, _) = listener.accept().await?;
                tokio::spawn(async move { process(socket) });
            }

            Ok::<_, io::Error>(())
        } => {
            res?;
        }
        _ = rx => {
            println!("terminating accept loop");
        }
    }

    Ok(())
}
```

`listener.accept().await?` 是分支表达式中的 `?`，因此它会将表达式的返回值变成 `Result` 类型，然后赋予给 `res` 变量。

与之不同的是，结果处理中的 `res?;` 会让 `main` 函数直接结束并返回一个 `Result`，可以看出，这里 `?` 的用法跟我们平时的用法并无区别。

## 模式匹配

既然是模式匹配，我们需要再来回忆下 `select!` 的分支语法形式:

```rust
<模式> = <async 表达式> => <结果处理>,
```

迄今为止，我们只用了变量绑定的模式，事实上，[任何 Rust 模式](https://course.rs/basic/match-pattern/all-patterns.html)都可以在此处使用。

```rust
use tokio::sync::mpsc;

#[tokio::main]
async fn main() {
    let (mut tx1, mut rx1) = mpsc::channel(128);
    let (mut tx2, mut rx2) = mpsc::channel(128);

    tokio::spawn(async move {
        // 用 tx1 和 tx2 干一些不为人知的事
    });

    tokio::select! {
        Some(v) = rx1.recv() => {
            println!("Got {:?} from rx1", v);
        }
        Some(v) = rx2.recv() => {
            println!("Got {:?} from rx2", v);
        }
        else => {
            println!("Both channels closed");
        }
    }
}
```

上面代码中，`rx` 通道关闭后，`recv()` 方法会返回一个 `None`，可以看到没有任何模式能够匹配这个 `None`，那为何不会报错？秘密就在于 `else` 上：当使用模式去匹配分支时，若之前的所有分支都无法被匹配，那 `else` 分支将被执行。

## 借用

当在 Tokio 中生成( spawn )任务时，其 async 语句块必须拥有其中数据的所有权。而 `select!` 并没有这个限制，它的每个分支表达式可以直接借用数据，然后进行并发操作。只要遵循 Rust 的借用规则，多个分支表达式可以不可变的借用同一个数据，或者在一个表达式可变的借用某个数据。

来看个例子，在这里我们同时向两个 TCP 目标发送同样的数据:

```rust
use tokio::io::AsyncWriteExt;
use tokio::net::TcpStream;
use std::io;
use std::net::SocketAddr;

async fn race(
    data: &[u8],
    addr1: SocketAddr,
    addr2: SocketAddr
) -> io::Result<()> {
    tokio::select! {
        Ok(_) = async {
            let mut socket = TcpStream::connect(addr1).await?;
            socket.write_all(data).await?;
            Ok::<_, io::Error>(())
        } => {}
        Ok(_) = async {
            let mut socket = TcpStream::connect(addr2).await?;
            socket.write_all(data).await?;
            Ok::<_, io::Error>(())
        } => {}
        else => {}
    };

    Ok(())
}
```

这里其实有一个很有趣的题外话，由于 TCP 连接过程是在模式中发生的，因此当某一个连接过程失败后，它通过 `?` 返回的 `Err` 类型并无法匹配 `Ok`，因此另一个分支会继续被执行，继续连接。

如果你把连接过程放在了结果处理中，那连接失败会直接从 `race` 函数中返回，而不是继续执行另一个分支中的连接！

还有一个非常重要的点，**借用规则在分支表达式和结果处理中存在很大的不同**。例如上面代码中，我们在两个分支表达式中分别对 `data` 做了不可变借用，这当然 ok，但是若是两次可变借用，那编译器会立即进行报错。但是转折来了：当在结果处理中进行两次可变借用时，却不会报错，大家可以思考下为什么，提示下：思考下分支在执行完成后会发生什么？

```rust
use tokio::sync::oneshot;

#[tokio::main]
async fn main() {
    let (tx1, rx1) = oneshot::channel();
    let (tx2, rx2) = oneshot::channel();

    let mut out = String::new();

    tokio::spawn(async move {
    });

    tokio::select! {
        _ = rx1 => {
            out.push_str("rx1 completed");
        }
        _ = rx2 => {
            out.push_str("rx2 completed");
        }
    }

    println!("{}", out);
}
```

例如以上代码，就在两个分支的结果处理中分别进行了可变借用，并不会报错。原因就在于：`select!`会保证只有一个分支的结果处理会被运行，然后在运行结束后，另一个分支会被直接丢弃。

## 循环

来看看该如何在循环中使用 `select!`，顺便说一句，跟循环一起使用是最常见的使用方式。

```rust
use tokio::sync::mpsc;

#[tokio::main]
async fn main() {
    let (tx1, mut rx1) = mpsc::channel(128);
    let (tx2, mut rx2) = mpsc::channel(128);
    let (tx3, mut rx3) = mpsc::channel(128);

    loop {
        let msg = tokio::select! {
            Some(msg) = rx1.recv() => msg,
            Some(msg) = rx2.recv() => msg,
            Some(msg) = rx3.recv() => msg,
            else => { break }
        };

        println!("Got {}", msg);
    }

    println!("All channels have been closed.");
}
```

在循环中使用 `select!` 最大的不同就是，当某一个分支执行完成后，`select!` 会继续循环等待并执行下一个分支，直到所有分支最终都完成，最终匹配到 `else` 分支，然后通过 `break` 跳出循环。

老生常谈的一句话：`select!` 中哪个分支先被执行是无法确定的，因此不要依赖于分支执行的顺序！想象一下，在异步编程场景，若 `select!` 按照分支的顺序来执行会如何：若 `rx1` 中总是有数据，那每次循环都只会去处理第一个分支，后面两个分支永远不会被执行。

#### 恢复之前的异步操作

```rust
async fn action() {
    // 一些异步逻辑
}

#[tokio::main]
async fn main() {
    let (mut tx, mut rx) = tokio::sync::mpsc::channel(128);

    let operation = action();
    tokio::pin!(operation);

    loop {
        tokio::select! {
            _ = &mut operation => break,
            Some(v) = rx.recv() => {
                if v % 2 == 0 {
                    break;
                }
            }
        }
    }
}
```

在上面代码中，我们没有直接在 `select!` 分支中调用 `action()` ，而是在 `loop` 循环外面先将 `action()` 赋值给 `operation`，因此 `operation` 是一个 `Future`。

**重点来了**，在 `select!` 循环中，我们使用了一个奇怪的语法 `&mut operation`，大家想象一下，如果不加 `&mut` 会如何？答案是，每一次循环调用的都是一次全新的 `action()`调用，但是当加了 `&mut operatoion` 后，每一次循环调用就变成了对同一次 `action()` 的调用。也就是我们实现了在每次循环中恢复了之前的异步操作！

`select!` 的另一个分支从消息通道收取消息，一旦收到值是偶数，就跳出循环，否则就继续循环。

还有一个就是我们使用了 `tokio::pin!`，具体的细节这里先不介绍，值得注意的点是：如果要在一个引用上使用 `.await`，那么引用的值就必须是不能移动的或者实现了 `Unpin`，关于 `Pin` 和 `Unpin` 可以参见[这里](https://course.rs/async/pin-unpin.html)。

一旦移除 `tokio::pin!` 所在行的代码，然后试图编译，就会获得以下错误:

```console
error[E0599]: no method named `poll` found for struct
     `std::pin::Pin<&mut &mut impl std::future::Future>`
     in the current scope
  --> src/main.rs:16:9
   |
16 | /         tokio::select! {
17 | |             _ = &mut operation => break,
18 | |             Some(v) = rx.recv() => {
19 | |                 if v % 2 == 0 {
...  |
22 | |             }
23 | |         }
   | |_________^ method not found in
   |             `std::pin::Pin<&mut &mut impl std::future::Future>`
   |
   = note: the method `poll` exists but the following trait bounds
            were not satisfied:
           `impl std::future::Future: std::marker::Unpin`
           which is required by
           `&mut impl std::future::Future: std::future::Future`
```

虽然我们已经学了很多关于 `Future` 的知识，但是这个错误依然不太好理解。但是它不难解决：当你试图在**一个引用上调用 `.await` 然后遇到了 `Future 未实现` 这种错误时**，往往只需要将对应的 `Future` 进行固定即可: ` tokio::pin!(operation);`。

#### 修改一个分支

下面一起来看一个稍微复杂一些的 `loop` 循环，首先，我们拥有：

- 一个消息通道可以传递 `i32` 类型的值
- 定义在 `i32` 值上的一个异步操作

想要实现的逻辑是：

- 在消息通道中等待一个偶数出现
- 使用该偶数作为输入来启动一个异步操作
- 等待异步操作完成，与此同时监听消息通道以获取更多的偶数
- 若在异步操作完成前一个新的偶数到来了，终止当前的异步操作，然后接着使用新的偶数开始异步操作

```rust
async fn action(input: Option<i32>) -> Option<String> {
    // 若 input（输入）是None，则返回 None
    // 事实上也可以这么写: `let i = input?;`
    let i = match input {
        Some(input) => input,
        None => return None,
    };

    // 这里定义一些逻辑
}

#[tokio::main]
async fn main() {
    let (mut tx, mut rx) = tokio::sync::mpsc::channel(128);

    let mut done = false;
    let operation = action(None);
    tokio::pin!(operation);

    tokio::spawn(async move {
        let _ = tx.send(1).await;
        let _ = tx.send(3).await;
        let _ = tx.send(2).await;
    });

    loop {
        tokio::select! {
            res = &mut operation, if !done => {
                done = true;

                if let Some(v) = res {
                    println!("GOT = {}", v);
                    return;
                }
            }
            Some(v) = rx.recv() => {
                if v % 2 == 0 {
                    // `.set` 是 `Pin` 上定义的方法
                    operation.set(action(Some(v)));
                    done = false;
                }
            }
        }
    }
}
```

当第一次循环开始时， 第一个分支会立即完成，因为 `operation` 的参数是 `None`。当第一个分支执行完成时，`done` 会变成 `true`，此时第一个分支的条件将无法被满足，开始执行第二个分支。

当第二个分支收到一个偶数时，`done` 会被修改为 `false`，且 `operation` 被设置了值。 此后再一次循环时，第一个分支会被执行，且 `operation` 返回一个 `Some(2)`，因此会触发 `return` ，最终结束循环并返回。

这段代码引入了一个新的语法: `if !done`，在解释之前，先看看去掉后会如何：

```console
thread 'main' panicked at '`async fn` resumed after completion', src/main.rs:1:55
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace
```

```'`async fn` resumed after completion'``` 错误的含义是：`async fn` 异步函数在完成后，依然被恢复了(继续使用)。

回到例子中来，这个错误是由于 `operation` 在它已经调用完成后依然被使用。通常来说，当使用 `.await` 后，调用 `.await` 的值会被消耗掉，因此并不存在这个问题。但是在这例子中，我们在引用上调用 `.await`，因此之后该引用依然可以被使用。

为了避免这个问题，需要在第一个分支的 `operation` 完成后禁止再使用该分支。这里的 `done` 的引入就很好的解决了问题。对于 `select!` 来说 `if !done` 的语法被称为预条件( **precondition** )，该条件会在分支被 `.await` 执行前进行检查。

那大家肯定有疑问了，既然 `operation` 不能再被调用了，我们该如何在有偶数值时，再回到第一个分支对其进行调用呢？答案就是 `operation.set(action(Some(v)));`，该操作会重新使用新的参数设置 `operation`。

## spawn 和 select! 的一些不同

学到现在，相信大家对于 `tokio::spawn` 和 `select!` 已经非常熟悉，它们的共同点就是都可以并发的运行异步操作。
然而它们使用的策略大相径庭。

`tokio::spawn` 函数会启动新的任务来运行一个异步操作，每个任务都是一个独立的对象可以单独被 Tokio 调度运行，因此两个不同的任务的调度都是独立进行的，甚至于它们可能会运行在两个不同的操作系统线程上。鉴于此，生成的任务和生成的线程有一个相同的限制：不允许对外部环境中的值进行借用。

而 `select!` 宏就不一样了，它在同一个任务中并发运行所有的分支。正是因为这样，在同一个任务中，这些分支无法被同时运行。 `select!` 宏在单个任务中实现了多路复用的功能。
