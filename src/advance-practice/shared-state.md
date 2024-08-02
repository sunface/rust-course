# 共享状态

上一章节中，咱们搭建了一个异步的 redis 服务器，并成功的提供了服务，但是其隐藏了一个巨大的问题：状态(数据)无法在多个连接之间共享，下面一起来看看该如何解决。

## 解决方法

好在 Tokio 十分强大，上面问题对应的解决方法也不止一种：

- 使用 `Mutex` 来保护数据的共享访问
- 生成一个异步任务去管理状态，然后各个连接使用消息传递的方式与其进行交互

其中，第一种方法适合比较简单的数据，而第二种方法适用于需要异步工作的，例如 I/O 原语。由于我们使用的数据存储类型是 `HashMap`，使用到的相关操作是 `insert` 和 `get` ，又因为这两个操作都不是异步的，因此只要使用 `Mutex` 即可解决问题。

在上面的描述中，说实话第二种方法及其适用的场景并不是很好理解，但没关系，在后面章节会进行详细介绍。

## 添加 `bytes` 依赖包

在上一节中，我们使用 `Vec<u8>` 来保存目标数据，但是它有一个问题，对它进行克隆时会将底层数据也整个复制一份，效率很低，但是克隆操作对于我们在多连接间共享数据又是必不可少的。

因此这里咱们新引入一个 `bytes` 包，它包含一个 `Bytes` 类型，当对该类型的值进行克隆时，就不再会克隆底层数据。事实上，`Bytes` 是一个引用计数类型，跟 `Arc` 非常类似，或者准确的说，`Bytes` 就是基于 `Arc` 实现的，但相比后者`Bytes` 提供了一些额外的能力。

在 `Cargo.toml` 的 `[dependencies]` 中引入 `bytes` ：

```console
bytes = "1"
```

## 初始化 HashMap

由于 `HashMap` 会在多个任务甚至多个线程间共享，再结合之前的选择，最终我们决定使用 `Arc<Mutex<T>>` 的方式对其进行包裹。

但是，大家先来畅想一下使用它进行包裹后的类型长什么样？ 大概，可能，长这样：`Arc<Mutex<HashMap<String, Bytes>>>`，天哪噜，一不小心，你就遇到了 Rust 的阴暗面：类型大串烧。可以想象，如果要在代码中到处使用这样的类型，可读性会极速下降，因此我们需要一个[类型别名](https://course.rs/advance/custom-type.html#类型别名type-alias)( type alias )来简化下：

```rust,ignore,mdbook-runnable
use bytes::Bytes;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

type Db = Arc<Mutex<HashMap<String, Bytes>>>;
```

此时，`Db` 就是一个类型别名，使用它就可以替代那一大串的东东，等下你就能看到功效。

接着，我们需要在 `main` 函数中对 `HashMap` 进行初始化，然后使用 `Arc` 克隆一份它的所有权并将其传入到生成的异步任务中。事实上在 Tokio 中，这里的 `Arc` 被称为 **handle**，或者更宽泛的说，`handle` 在 Tokio 中可以用来访问某个共享状态。

```rust,ignore,mdbook-runnable
use tokio::net::TcpListener;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

#[tokio::main]
async fn main() {
    let listener = TcpListener::bind("127.0.0.1:6379").await.unwrap();

    println!("Listening");

    let db = Arc::new(Mutex::new(HashMap::new()));

    loop {
        let (socket, _) = listener.accept().await.unwrap();
        // 将 handle 克隆一份
        let db = db.clone();

        println!("Accepted");
        tokio::spawn(async move {
            process(socket, db).await;
        });
    }
}
```

#### 为何使用 `std::sync::Mutex`

上面代码还有一点非常重要，那就是我们使用了 `std::sync::Mutex` 来保护 `HashMap`，而不是使用 `tokio::sync::Mutex`。

在使用 Tokio 编写异步代码时，一个常见的错误无条件地使用 `tokio::sync::Mutex` ，而真相是：Tokio 提供的异步锁只应该在跨多个 `.await`调用时使用，而且 Tokio 的 `Mutex` 实际上内部使用的也是 `std::sync::Mutex`。

多补充几句，在异步代码中，关于锁的使用有以下经验之谈：

- 锁如果在多个 `.await` 过程中持有，应该使用 Tokio 提供的锁，原因是 `.await`的过程中锁可能在线程间转移，若使用标准库的同步锁存在死锁的可能性，例如某个任务刚获取完锁，还没使用完就因为 `.await` 让出了当前线程的所有权，结果下个任务又去获取了锁，造成死锁
- 锁竞争不多的情况下，使用 `std::sync::Mutex`
- 锁竞争多，可以考虑使用三方库提供的性能更高的锁，例如 [`parking_lot::Mutex`](https://docs.rs/parking_lot/0.10.2/parking_lot/type.Mutex.html)

## 更新 `process()`

`process()` 函数不再初始化 `HashMap`，取而代之的是它使用了 `HashMap` 的一个 `handle` 作为参数:

```rust,ignore,mdbook-runnable
use tokio::net::TcpStream;
use mini_redis::{Connection, Frame};

async fn process(socket: TcpStream, db: Db) {
    use mini_redis::Command::{self, Get, Set};

    let mut connection = Connection::new(socket);

    while let Some(frame) = connection.read_frame().await.unwrap() {
        let response = match Command::from_frame(frame).unwrap() {
            Set(cmd) => {
                let mut db = db.lock().unwrap();
                db.insert(cmd.key().to_string(), cmd.value().clone());
                Frame::Simple("OK".to_string())
            }
            Get(cmd) => {
                let db = db.lock().unwrap();
                if let Some(value) = db.get(cmd.key()) {
                    Frame::Bulk(value.clone())
                } else {
                    Frame::Null
                }
            }
            cmd => panic!("unimplemented {:?}", cmd),
        };

        connection.write_frame(&response).await.unwrap();
    }
}
```

## 任务、线程和锁竞争

当竞争不多的时候，使用阻塞性的锁去保护共享数据是一个正确的选择。当一个锁竞争触发后，当前正在执行任务(请求锁)的线程会被阻塞，并等待锁被前一个使用者释放。这里的关键就是：**锁竞争不仅仅会导致当前的任务被阻塞，还会导致执行任务的线程被阻塞，因此该线程准备执行的其它任务也会因此被阻塞！**

默认情况下，Tokio 调度器使用了多线程模式，此时如果有大量的任务都需要访问同一个锁，那么锁竞争将变得激烈起来。当然，你也可以使用 [**current_thread**](https://docs.rs/tokio/1.15.0/tokio/runtime/index.html#current-thread-scheduler) 运行时设置，在该设置下会使用一个单线程的调度器(执行器)，所有的任务都会创建并执行在当前线程上，因此不再会有锁竞争。

> current_thread 是一个轻量级、单线程的运行时，当任务数不多或连接数不多时是一个很好的选择。例如你想在一个异步客户端库的基础上提供给用户同步的 API 访问时，该模式就很适用

当同步锁的竞争变成一个问题时，使用 Tokio 提供的异步锁几乎并不能帮你解决问题，此时可以考虑如下选项：

- 创建专门的任务并使用消息传递的方式来管理状态
- 将锁进行分片
- 重构代码以避免锁

在我们的例子中，由于每一个 `key` 都是独立的，因此对锁进行分片将成为一个不错的选择:

```rust,ignore,mdbook-runnable
type ShardedDb = Arc<Vec<Mutex<HashMap<String, Vec<u8>>>>>;

fn new_sharded_db(num_shards: usize) -> ShardedDb {
    let mut db = Vec::with_capacity(num_shards);
    for _ in 0..num_shards {
        db.push(Mutex::new(HashMap::new()));
    }
    Arc::new(db)
}
```

在这里，我们创建了 N 个不同的存储实例，每个实例都会存储不同的分片数据，例如我们有`a-i`共 9 个不同的 `key`, 可以将存储分成 3 个实例，那么第一个实例可以存储 `a-c`，第二个`d-f`，以此类推。在这种情况下，访问 `b` 时，只需要锁住第一个实例，此时二、三实例依然可以正常访问，因此锁被成功的分片了。

在分片后，使用给定的 key 找到对应的值就变成了两个步骤：首先，使用 `key` 通过特定的算法寻找到对应的分片，然后再使用该 `key` 从分片中查询到值:

```rust,ignore,mdbook-runnable
let shard = db[hash(key) % db.len()].lock().unwrap();
shard.insert(key, value);
```

这里我们使用 `hash` 算法来进行分片，但是该算法有个缺陷：分片的数量不能变，一旦变了后，那之前落入分片 1 的`key`很可能将落入到其它分片中，最终全部乱掉。此时你可以考虑[dashmap](https://docs.rs/dashmap)，它提供了更复杂、更精妙的支持分片的`hash map`。

## 在 `.await` 期间持有锁

在某些时候，你可能会不经意写下这种代码:

```rust,ignore,mdbook-runnable
use std::sync::{Mutex, MutexGuard};

async fn increment_and_do_stuff(mutex: &Mutex<i32>) {
    let mut lock: MutexGuard<i32> = mutex.lock().unwrap();
    *lock += 1;

    do_something_async().await;
} // 锁在这里超出作用域
```

如果你要 `spawn` 一个任务来执行上面的函数的话，会报错:

```console
error: future cannot be sent between threads safely
   --> src/lib.rs:13:5
    |
13  |     tokio::spawn(async move {
    |     ^^^^^^^^^^^^ future created by async block is not `Send`
    |
   ::: /playground/.cargo/registry/src/github.com-1ecc6299db9ec823/tokio-0.2.21/src/task/spawn.rs:127:21
    |
127 |         T: Future + Send + 'static,
    |                     ---- required by this bound in `tokio::task::spawn::spawn`
    |
    = help: within `impl std::future::Future`, the trait `std::marker::Send` is not implemented for `std::sync::MutexGuard<'_, i32>`
note: future is not `Send` as this value is used across an await
   --> src/lib.rs:7:5
    |
4   |     let mut lock: MutexGuard<i32> = mutex.lock().unwrap();
    |         -------- has type `std::sync::MutexGuard<'_, i32>` which is not `Send`
...
7   |     do_something_async().await;
    |     ^^^^^^^^^^^^^^^^^^^^^^^^^^ await occurs here, with `mut lock` maybe used later
8   | }
    | - `mut lock` is later dropped here
```

错误的原因在于 `std::sync::MutexGuard` 类型并没有实现 `Send` 特征，这意味着你不能将一个 `Mutex` 锁发送到另一个线程，因为 `.await` 可能会让任务转移到另一个线程上执行，这个之前也介绍过。

#### 提前释放锁

要解决这个问题，就必须重构代码，让 `Mutex` 锁在 `.await` 被调用前就被释放掉。

```rust,ignore,mdbook-runnable
// 下面的代码可以工作！
async fn increment_and_do_stuff(mutex: &Mutex<i32>) {
    {
        let mut lock: MutexGuard<i32> = mutex.lock().unwrap();
        *lock += 1;
    } // lock在这里超出作用域 (被释放)

    do_something_async().await;
}
```

> 大家可能已经发现，很多错误都是因为 `.await` 引起的，其实你只要记住，在 `.await` 执行期间，任务可能会在线程间转移，那么这些错误将变得很好理解，不必去死记硬背

但是下面的代码不工作：

```rust,ignore,mdbook-runnable
use std::sync::{Mutex, MutexGuard};

async fn increment_and_do_stuff(mutex: &Mutex<i32>) {
    let mut lock: MutexGuard<i32> = mutex.lock().unwrap();
    *lock += 1;
    drop(lock);

    do_something_async().await;
}
```

原因我们之前解释过，编译器在这里不够聪明，目前它只能根据作用域的范围来判断，`drop` 虽然释放了锁，但是锁的作用域依然会持续到函数的结束，未来也许编译器会改进，但是现在至少还是不行的。

聪明的读者此时的小脑袋已经飞速运转起来，既然锁没有实现 `Send`， 那我们主动给它实现如何？这样不就可以顺利运行了吗？答案依然是不可以，原因就是我们之前提到过的死锁，如果一个任务获取了锁，然后还没释放就在 `.await` 期间被挂起，接着开始执行另一个任务，这个任务又去获取锁，就会导致死锁。

再来看看其它解决方法：

#### 重构代码：在 `.await` 期间不持有锁

之前的代码其实也是为了在 `.await` 期间不持有锁，但是我们还有更好的实现方式，例如，你可以把 `Mutex` 放入一个结构体中，并且只在该结构体的非异步方法中使用该锁:

```rust,ignore,mdbook-runnable
use std::sync::Mutex;

struct CanIncrement {
    mutex: Mutex<i32>,
}
impl CanIncrement {
    // 该方法不是 `async`
    fn increment(&self) {
        let mut lock = self.mutex.lock().unwrap();
        *lock += 1;
    }
}

async fn increment_and_do_stuff(can_incr: &CanIncrement) {
    can_incr.increment();
    do_something_async().await;
}
```

#### 使用异步任务和通过消息传递来管理状态

该方法常常用于共享的资源是 I/O 类型的资源时，我们在下一章节将详细介绍。

#### 使用 Tokio 提供的异步锁

Tokio 提供的锁最大的优点就是：它可以在 `.await` 执行期间被持有，而且不会有任何问题。但是代价就是，这种异步锁的性能开销会更高，因此如果可以，使用之前的两种方法来解决会更好。

```rust,ignore,mdbook-runnable
use tokio::sync::Mutex; // 注意，这里使用的是 Tokio 提供的锁

// 下面的代码会编译
// 但是就这个例子而言，之前的方式会更好
async fn increment_and_do_stuff(mutex: &Mutex<i32>) {
    let mut lock = mutex.lock().await;
    *lock += 1;

    do_something_async().await;
} // 锁在这里被释放
```
