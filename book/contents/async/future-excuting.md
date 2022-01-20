# 底层探秘: Future执行与任务调度
在上个章节，我们知道了 `Future` 是异步函数返回的值，它需要执行器( `executor` )才能进行运行，而本章节，我们一起来看看它背后的奥秘。

如果大家只对如何使用感兴趣，对 `Future` 背后是如何运行的不感兴趣，可以直接跳到下个章节，但是如果你希望能深入理解 Rust 的 `async/.await` 代码是如何工作、理解运行时和性能，甚至未来想要构建自己的 `async` 运行时或相关工具，那么本章节终究不会辜负于你。

## Future 特征
`Future` 特征是 Rust 异步编程的核心，毕竟异步函数是异步编程的核心，而 `Future` 恰恰是异步函数的返回值和被执行的关键。

首先，来给出 `Future` 的定义：它是一个能产出值的异步计算(虽然该值可能为空，例如 `()` )。光看这个定义，可能会觉得很空洞，我们来看看一个简化版的 `Future` 特征:
```rust
trait SimpleFuture {
    type Output;
    fn poll(&mut self, wake: fn()) -> Poll<Self::Output>;
}

enum Poll<T> {
    Ready(T),
    Pending,
}
```

在上一章中，我们提到过 `Future` 需要被执行器`poll`(轮询)后才能运行，诺，这里 `poll` 就来了，通过调用该方法，可以推进 `Future` 的进一步执行，直到被切走为止( 这里不好理解，但是你只需要知道 `Future` 并不能保证被在一次 `poll` 中就被执行完，后面会详解介绍)。

若在当前 `poll` 中， `Future` 可以被完成，则会返回 `Poll::Ready(result)` ，反之则返回 `Poll::Pending`， 并且安排一个 `wake` 函数：当未来 `Future` 准备好进一步执行时， 该函数会被调用，然后管理该 `Future` 的执行器(例如上一章节中的`block_on`函数)会再次调用 `poll` 方法，此时 `Future` 就可以继续执行了。

如果没有 `wake `方法，那执行器无法知道某个`Future`是否可以继续被执行，除非执行器定期的轮询每一个 `Future` ，确认它是否能被执行，但这种作法效率较低。而有了 `wake`，`Future` 就可以主动通知执行器，然后执行器就可以精确的执行该 `Future`。 这种“事件通知 -> 执行”的方式要远比定期对所有 `Future` 进行一次全遍历来的高效。

也许大家还是迷迷糊糊的，没事，我们用一个例子来说明下。考虑一个需要从 `socket` 读取数据的场景：如果有数据，可以直接读取数据并返回 `Poll::Ready(data)`， 但如果没有数据，`Future` 会被阻塞且不会再继续执行，此时它会注册一个 `wake` 函数，当 `socket` 数据准备好时，该函数将被调用以通知执行器：我们的 `Future` 已经准备好了，可以继续执行。

下面的 `SocketRead` 结构体就是一个 `Future`: 
```rust
pub struct SocketRead<'a> {
    socket: &'a Socket,
}

impl SimpleFuture for SocketRead<'_> {
    type Output = Vec<u8>;

    fn poll(&mut self, wake: fn()) -> Poll<Self::Output> {
        if self.socket.has_data_to_read() {
            // socket有数据，写入buffer中并返回
            Poll::Ready(self.socket.read_buf())
        } else {
            // socket中还没数据
            // 
            // 注册一个`wake`函数，当数据可用时，该函数会被调用，
            // 然后当前Future的执行器会再次调用`poll`方法，此时就可以读取到数据
            self.socket.set_readable_callback(wake);
            Poll::Pending
        }
    }
}
``` 

这种 `Future` 模型允许将多个异步操作组合在一起，同时还无需任何内存分配。不仅仅如此，如果你需要同时运行多个 `Future`或链式调用多个 `Future` ，也可以通过无内存分配的状态机实现，例如：
```rust
trait SimpleFuture {
    type Output;
    fn poll(&mut self, wake: fn()) -> Poll<Self::Output>;
}

enum Poll<T> {
    Ready(T),
    Pending,
}

/// 一个SimpleFuture，它会并发地运行两个Future直到它们完成
///
/// 之所以可以并发，是因为两个Future的轮询可以交替进行，一个阻塞，另一个就可以立刻执行，反之亦然
pub struct Join<FutureA, FutureB> {
    // 结构体的每个字段都包含一个Future，可以运行直到完成.
    // 如果Future完成后，字段会被设置为 `None`. 这样Future完成后，就不会再被轮询
    a: Option<FutureA>,
    b: Option<FutureB>,
}

impl<FutureA, FutureB> SimpleFuture for Join<FutureA, FutureB>
where
    FutureA: SimpleFuture<Output = ()>,
    FutureB: SimpleFuture<Output = ()>,
{
    type Output = ();
    fn poll(&mut self, wake: fn()) -> Poll<Self::Output> {
        // 尝试去完成一个 Future `a`
        if let Some(a) = &mut self.a {
            if let Poll::Ready(()) = a.poll(wake) {
                self.a.take();
            }
        }

        // 尝试去完成一个 Future `b`
        if let Some(b) = &mut self.b {
            if let Poll::Ready(()) = b.poll(wake) {
                self.b.take();
            }
        }

        if self.a.is_none() && self.b.is_none() {
            // 两个 Future都已完成 - 我们可以成功地返回了
            Poll::Ready(())
        } else {
            // 至少还有一个 Future 没有完成任务，因此返回 `Poll::Pending`.
            // 当该 Future 再次准备好时，通过调用`wake()`函数来继续执行
            Poll::Pending
        }
    }
}
```

上面代码展示了如何同时运行多个 `Future`， 且在此过程中没有任何内存分配，让并发编程更加高效。 类似的，多个`Future`也可以一个接一个的连续运行：
```rust
/// 一个SimpleFuture, 它使用顺序的方式，一个接一个地运行两个Future
//
// 注意: 由于本例子用于演示，因此功能简单，`AndThenFut` 会假设两个 Future 在创建时就可用了.
// 而真实的`Andthen`允许根据第一个`Future`的输出来创建第二个`Future`，因此复杂的多。
pub struct AndThenFut<FutureA, FutureB> {
    first: Option<FutureA>,
    second: FutureB,
}

impl<FutureA, FutureB> SimpleFuture for AndThenFut<FutureA, FutureB>
where
    FutureA: SimpleFuture<Output = ()>,
    FutureB: SimpleFuture<Output = ()>,
{
    type Output = ();
    fn poll(&mut self, wake: fn()) -> Poll<Self::Output> {
        if let Some(first) = &mut self.first {
            match first.poll(wake) {
                // 我们已经完成了第一个 Future， 可以将它移除， 然后准备开始运行第二个
                Poll::Ready(()) => self.first.take(),
                // 第一个 Future 还不能完成
                Poll::Pending => return Poll::Pending,
            };
        }

        // 运行到这里，说明第一个Future已经完成，尝试去完成第二个
        self.second.poll(wake)
    }
}
```

这些例子展示了在不需要内存对象分配以及深层嵌套回调的情况下，该如何使用`Future`特征去表达异步控制流。 在了解了基础的控制流后，我们再来看看真实的`Future`特征有何不同之处。
```rust
trait Future {
    type Output;
    fn poll(
        // 首先值得注意的地方是，`self`的类型从`&mut self`变成了`Pin<&mut Self>`:
        self: Pin<&mut Self>,
        // 其次将`wake: fn()` 修改为 `cx: &mut Context<'_>`:
        cx: &mut Context<'_>,
    ) -> Poll<Self::Output>;
}
```

首先这里多了一个`Pin`，关于它我们会在后面章节详细介绍，现在你只需要知道使用它可以创建一个无法被移动的`Future`，因为无法被移动，因此它将具有固定的内存地址，意味着我们可以存储它的指针(如果内存地址可能会变动，那存储指针地址将毫无意义！)，也意味着可以实现一个自引用数据结构: `struct MyFut { a: i32, ptr_to_a: *const i32 }`。 而对于`async/await`来说，`Pin`是不可或缺的关键特性。

其次，从`wake: fn()`变成了`&mut Context<'_>`。意味着`wake`函数可以携带数据了，为何要携带数据？考虑一个真实世界的场景，一个复杂应用例如web服务器可能有数千连接同时在线，那么同时就有数千`Future`在被同时管理着，如果不能携带数据，当一个`Future`调用`wake`后，执行器该如何知道是哪个`Future`调用了`wake`,然后进一步去`poll`对应的`Future`？没有办法！那之前的例子为啥就可以使用没有携带数据的`wake`？ 因为足够简单，不存在歧义性。

总之，在正式场景要进行`wake`，就必须携带上数据。 而`Context`类型通过提供一个`Waker`类型的值，就可以用来唤醒特定的的任务。


## 使用 Waker 来唤醒任务