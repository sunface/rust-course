# async/await 和 Stream 流处理

在入门章节中，我们简单学习了该如何使用 `async/.await`， 同时在后面也了解了一些底层原理，现在是时候继续深入了。

`async/.await`是 Rust 语法的一部分，它在遇到阻塞操作时( 例如 IO )会让出当前线程的所有权而不是阻塞当前线程，这样就允许当前线程继续去执行其它代码，最终实现并发。

有两种方式可以使用`async`： `async fn`用于声明函数，`async { ... }`用于声明语句块，它们会返回一个实现 `Future` 特征的值:

```rust
// `foo()`返回一个`Future<Output = u8>`,
// 当调用`foo().await`时，该`Future`将被运行，当调用结束后我们将获取到一个`u8`值
async fn foo() -> u8 { 5 }

fn bar() -> impl Future<Output = u8> {
    // 下面的`async`语句块返回`Future<Output = u8>`
    async {
        let x: u8 = foo().await;
        x + 5
    }
}
```

`async` 是懒惰的，直到被执行器 `poll` 或者 `.await` 后才会开始运行，其中后者是最常用的运行 `Future` 的方法。 当 `.await` 被调用时，它会尝试运行 `Future` 直到完成，但是若该 `Future` 进入阻塞，那就会让出当前线程的控制权。当 `Future` 后面准备再一次被运行时(例如从 `socket` 中读取到了数据)，执行器会得到通知，并再次运行该 `Future` ，如此循环，直到完成。

以上过程只是一个简述，详细内容在[底层探秘](async-rust/async/future-excuting.md)中已经被深入讲解过，因此这里不再赘述。

## `async` 的生命周期

`async fn` 函数如果拥有引用类型的参数，那它返回的 `Future` 的生命周期就会被这些参数的生命周期所限制:

```rust
async fn foo(x: &u8) -> u8 { *x }

// 上面的函数跟下面的函数是等价的:
fn foo_expanded<'a>(x: &'a u8) -> impl Future<Output = u8> + 'a {
    async move { *x }
}
```

意味着 `async fn` 函数返回的 `Future` 必须满足以下条件: 当 `x` 依然有效时， 该 `Future` 就必须继续等待( `.await` ), 也就是说`x` 必须比 `Future`活得更久。

在一般情况下，在函数调用后就立即 `.await` 不会存在任何问题，例如`foo(&x).await`。但是，若 `Future` 被先存起来或发送到另一个任务或者线程，就可能存在问题了:

```rust
use std::future::Future;
fn bad() -> impl Future<Output = u8> {
    let x = 5;
    borrow_x(&x) // ERROR: `x` does not live long enough
}

async fn borrow_x(x: &u8) -> u8 { *x }
```

以上代码会报错，因为 `x` 的生命周期只到 `bad` 函数的结尾。 但是 `Future` 显然会活得更久：

```shell
error[E0597]: `x` does not live long enough
 --> src/main.rs:4:14
  |
4 |     borrow_x(&x) // ERROR: `x` does not live long enough
  |     ---------^^-
  |     |        |
  |     |        borrowed value does not live long enough
  |     argument requires that `x` is borrowed for `'static`
5 | }
  | - `x` dropped here while still borrowed
```

其中一个常用的解决方法就是将具有引用参数的 `async fn` 函数转变成一个具有 `'static` 生命周期的 `Future` 。 以上解决方法可以通过将参数和对 `async fn` 的调用放在同一个 `async` 语句块来实现:

```rust
use std::future::Future;

async fn borrow_x(x: &u8) -> u8 { *x }

fn good() -> impl Future<Output = u8> {
    async {
        let x = 5;
        borrow_x(&x).await
    }
}
```

如上所示，通过将参数移动到 `async` 语句块内， 我们将它的生命周期扩展到 `'static`， 并跟返回的 `Future` 保持了一致。

## async move

`async` 允许我们使用 `move` 关键字来将环境中变量的所有权转移到语句块内，就像闭包那样，好处是你不再发愁该如何解决借用生命周期的问题，坏处就是无法跟其它代码实现对变量的共享:

```rust
// 多个不同的 `async` 语句块可以访问同一个本地变量，只要它们在该变量的作用域内执行
async fn blocks() {
    let my_string = "foo".to_string();

    let future_one = async {
        // ...
        println!("{my_string}");
    };

    let future_two = async {
        // ...
        println!("{my_string}");
    };

    // 运行两个 Future 直到完成
    let ((), ()) = futures::join!(future_one, future_two);
}



// 由于`async move`会捕获环境中的变量，因此只有一个`async move`语句块可以访问该变量，
// 但是它也有非常明显的好处： 变量可以转移到返回的 Future 中，不再受借用生命周期的限制
fn move_block() -> impl Future<Output = ()> {
    let my_string = "foo".to_string();
    async move {
        // ...
        println!("{my_string}");
    }
}
```

## 当.await 遇见多线程执行器

需要注意的是，当使用多线程 `Future` 执行器( `executor` )时， `Future` 可能会在线程间被移动，因此 `async` 语句块中的变量必须要能在线程间传递。 至于 `Future` 会在线程间移动的原因是：它内部的任何`.await`都可能导致它被切换到一个新线程上去执行。

由于需要在多线程环境使用，意味着 `Rc`、 `RefCell` 、没有实现 `Send` 的所有权类型、没有实现 `Sync` 的引用类型，它们都是不安全的，因此无法被使用

> 需要注意！实际上它们还是有可能被使用的，只要在 `.await` 调用期间，它们没有在作用域范围内。

类似的原因，在 `.await` 时使用普通的锁也不安全，例如 `Mutex` 。原因是，它可能会导致线程池被锁：当一个任务获取锁 `A` 后，若它将线程的控制权还给执行器，然后执行器又调度运行另一个任务，该任务也去尝试获取了锁 `A` ，结果当前线程会直接卡死，最终陷入死锁中。

因此，为了避免这种情况的发生，我们需要使用 `futures` 包下的锁 `futures::lock` 来替代 `Mutex` 完成任务。

## Stream 流处理

`Stream` 特征类似于 `Future` 特征，但是前者在完成前可以生成多个值，这种行为跟标准库中的 `Iterator` 特征倒是颇为相似。

```rust
trait Stream {
    // Stream生成的值的类型
    type Item;

    // 尝试去解析Stream中的下一个值,
    // 若无数据，返回`Poll::Pending`, 若有数据，返回 `Poll::Ready(Some(x))`, `Stream`完成则返回 `Poll::Ready(None)`
    fn poll_next(self: Pin<&mut Self>, cx: &mut Context<'_>)
        -> Poll<Option<Self::Item>>;
}
```

关于 `Stream` 的一个常见例子是消息通道（ `futures` 包中的）的消费者 `Receiver`。每次有消息从 `Send` 端发送后，它都可以接收到一个 `Some(val)` 值， 一旦 `Send` 端关闭(drop)，且消息通道中没有消息后，它会接收到一个 `None` 值。

```rust
async fn send_recv() {
    const BUFFER_SIZE: usize = 10;
    let (mut tx, mut rx) = mpsc::channel::<i32>(BUFFER_SIZE);

    tx.send(1).await.unwrap();
    tx.send(2).await.unwrap();
    drop(tx);

    // `StreamExt::next` 类似于 `Iterator::next`, 但是前者返回的不是值，而是一个 `Future<Output = Option<T>>`，
    // 因此还需要使用`.await`来获取具体的值
    assert_eq!(Some(1), rx.next().await);
    assert_eq!(Some(2), rx.next().await);
    assert_eq!(None, rx.next().await);
}
```

#### 迭代和并发

跟迭代器类似，我们也可以迭代一个 `Stream`。 例如使用`map`，`filter`，`fold`方法，以及它们的*遇到错误提前返回*的版本： `try_map`，`try_filter`，`try_fold`。

但是跟迭代器又有所不同，`for` 循环无法在这里使用，但是命令式风格的循环`while let`是可以用的，同时还可以使用`next` 和 `try_next` 方法:

```rust
async fn sum_with_next(mut stream: Pin<&mut dyn Stream<Item = i32>>) -> i32 {
    use futures::stream::StreamExt; // 引入 next
    let mut sum = 0;
    while let Some(item) = stream.next().await {
        sum += item;
    }
    sum
}

async fn sum_with_try_next(
    mut stream: Pin<&mut dyn Stream<Item = Result<i32, io::Error>>>,
) -> Result<i32, io::Error> {
    use futures::stream::TryStreamExt; // 引入 try_next
    let mut sum = 0;
    while let Some(item) = stream.try_next().await? {
        sum += item;
    }
    Ok(sum)
}
```

上面代码是一次处理一个值的模式，但是需要注意的是：**如果你选择一次处理一个值的模式，可能会造成无法并发，这就失去了异步编程的意义**。 因此，如果可以的话我们还是要选择从一个 `Stream` 并发处理多个值的方式，通过 `for_each_concurrent` 或 `try_for_each_concurrent` 方法来实现:

```rust
async fn jump_around(
    mut stream: Pin<&mut dyn Stream<Item = Result<u8, io::Error>>>,
) -> Result<(), io::Error> {
    use futures::stream::TryStreamExt; // 引入 `try_for_each_concurrent`
    const MAX_CONCURRENT_JUMPERS: usize = 100;

    stream.try_for_each_concurrent(MAX_CONCURRENT_JUMPERS, |num| async move {
        jump_n_times(num).await?;
        report_n_jumps(num).await?;
        Ok(())
    }).await?;

    Ok(())
}
```
