# 创建异步任务

同志们，抓稳了，我们即将换挡提速，通向 `mini-redis` 服务端的高速之路已经开启。

不过在开始之前，先来做点收尾工作：上一章节中，我们实现了一个简易的 `mini-redis` 客户端并支持了 `SET`/`GET` 操作, 现在将该[代码](https://course.rs/tokio/getting-startted.html#分析未到代码先行)移动到 `example` 文件夹下，因为我们这个章节要实现的是服务器，后面可以用之前客户端示例对我们的服务器端进行测试:

```shell
$ mkdir -p examples
$ mv src/main.rs examples/hello-redis.rs
```

然后再重新创建一个空的 `src/main.rs` 文件，至此换挡已经完成，提速正式开始。

## 接收 sockets

作为服务器端，最基础的工作无疑是接收外部进来的 TCP 连接，可以通过 `tokio::net::TcpListener` 来完成。

> Tokio 中大多数类型的名称都和标准库中对应的同步类型名称相同，而且，如果没有特殊原因，Tokio 的 API 名称也和标准库保持一致，只不过用 `async fn` 取代 `fn` 来声明函数。

`TcpListener` 监听 **6379** 端口，然后通过循环来接收外部进来的连接，每个连接在处理完后会被关闭。对于目前来说，我们的任务很简单：读取命令、打印到标准输出 `stdout`，最后回复给客户端一个错误。

```rust
use tokio::net::{TcpListener, TcpStream};
use mini_redis::{Connection, Frame};

#[tokio::main]
async fn main() {
    // Bind the listener to the address
    // 监听指定地址，等待 TCP 连接进来
    let listener = TcpListener::bind("127.0.0.1:6379").await.unwrap();

    loop {
        // 第二个被忽略的项中包含有新连接的 `IP` 和端口信息
        let (socket, _) = listener.accept().await.unwrap();
        process(socket).await;
    }
}

async fn process(socket: TcpStream) {
    // `Connection` 对于 redis 的读写进行了抽象封装，因此我们读到的是一个一个数据帧frame(数据帧 = redis命令 + 数据)，而不是字节流
    // `Connection` 是在 mini-redis 中定义
    let mut connection = Connection::new(socket);

    if let Some(frame) = connection.read_frame().await.unwrap() {
        println!("GOT: {:?}", frame);

        // 回复一个错误
        let response = Frame::Error("unimplemented".to_string());
        connection.write_frame(&response).await.unwrap();
    }
}
```

现在运行我们的简单服务器 :

```shel
cargo run
```

此时服务器会处于循环等待以接收连接的状态，接下来在一个新的终端窗口中启动上一章节中的 `redis` 客户端，由于相关代码已经放入 `examples` 文件夹下，因此我们可以使用 `-- example` 来指定运行该客户端示例:

```shell
$ cargo run --example hello-redis
```

此时，客户端的输出是: `Error: "unimplemented"`, 同时服务器端打印出了客户端发来的由 **redis 命令和数据** 组成的数据帧: `GOT: Array([Bulk(b"set"), Bulk(b"hello"), Bulk(b"world")])`。

## 生成任务

上面的服务器，如果你仔细看，它其实一次只能接受和处理一条 TCP 连接，只有等当前的处理完并结束后，才能开始接收下一条连接。原因在于 `loop` 循环中的 `await` 会导致当前任务进入阻塞等待，也就是 `loop` 循环会被阻塞。

而这显然不是我们想要的，服务器能并发地处理多条连接的请求，才是正确的打开姿势，下面来看看如何实现真正的并发。

> 关于并发和并行，在[多线程章节中](https://course.rs/advance/concurrency-with-threads/concurrency-parallelism.html)有详细的解释

为了并发的处理连接，需要为每一条进来的连接都生成( `spawn` )一个新的任务, 然后在该任务中处理连接:

```rust
use tokio::net::TcpListener;

#[tokio::main]
async fn main() {
    let listener = TcpListener::bind("127.0.0.1:6379").await.unwrap();

    loop {
        let (socket, _) = listener.accept().await.unwrap();
        // 为每一条连接都生成一个新的任务，
        // `socket` 的所有权将被移动到新的任务中，并在那里进行处理
        tokio::spawn(async move {
            process(socket).await;
        });
    }
}
```

#### 任务

一个 Tokio 任务是一个异步的绿色线程，它们通过 `tokio::spawn` 进行创建，该函数会返回一个 `JoinHandle` 类型的句柄，调用者可以使用该句柄跟创建的任务进行交互。

`spawn` 函数的参数是一个 `async` 语句块，该语句块甚至可以返回一个值，然后调用者可以通过 `JoinHandle` 句柄获取该值:

```rust
#[tokio::main]
async fn main() {
    let handle = tokio::spawn(async {
       10086
    });

    let out = handle.await.unwrap();
    println!("GOT {}", out);
}
```

以上代码会打印出`GOT 10086`。实际上，上面代码中`.await` 会返回一个 `Result` ，若 `spawn` 创建的任务正常运行结束，则返回一个 `Ok(T)`的值，否则会返回一个错误 `Err`：例如任务内部发生了 `panic` 或任务因为运行时关闭被强制取消时。

任务是调度器管理的执行单元。`spawn`生成的任务会首先提交给调度器，然后由它负责调度执行。需要注意的是，执行任务的线程未必是创建任务的线程，任务完全有可能运行在另一个不同的线程上，而且任务在生成后，它还可能会在线程间被移动。

任务在 Tokio 中远比看上去要更轻量，例如创建一个任务仅仅需要一次 64 字节大小的内存分配。因此应用程序在生成任务上，完全不应该有任何心理负担，除非你在一台没那么好的机器上疯狂生成了几百万个任务。。。

#### `'static` 约束

当使用 Tokio 创建一个任务时，该任务类型的生命周期必须是 `'static`。意味着，在任务中不能使用外部数据的引用:

```rust
use tokio::task;

#[tokio::main]
async fn main() {
    let v = vec![1, 2, 3];

    task::spawn(async {
        println!("Here's a vec: {:?}", v);
    });
}
```

上面代码中，`spawn` 出的任务引用了外部环境中的变量 `v` ，导致以下报错:

```console
error[E0373]: async block may outlive the current function, but
              it borrows `v`, which is owned by the current function
 --> src/main.rs:7:23
  |
7 |       task::spawn(async {
  |  _______________________^
8 | |         println!("Here's a vec: {:?}", v);
  | |                                        - `v` is borrowed here
9 | |     });
  | |_____^ may outlive borrowed value `v`
  |
note: function requires argument type to outlive `'static`
 --> src/main.rs:7:17
  |
7 |       task::spawn(async {
  |  _________________^
8 | |         println!("Here's a vector: {:?}", v);
9 | |     });
  | |_____^
help: to force the async block to take ownership of `v` (and any other
      referenced variables), use the `move` keyword
  |
7 |     task::spawn(async move {
8 |         println!("Here's a vec: {:?}", v);
9 |     });
  |
```

原因在于：默认情况下，变量并不是通过 `move` 的方式转移进 `async` 语句块的， `v` 变量的所有权依然属于 `main` 函数，因为任务内部的 `println!` 是通过借用的方式使用了 `v`，但是这种借用并不能满足 `'static` 生命周期的要求。

在报错的同时，Rust 编译器还给出了相当有帮助的提示：为 `async` 语句块使用 `move` 关键字，这样就能将 `v` 的所有权从 `main` 函数转移到新创建的任务中。

但是 `move` 有一个问题，一个数据只能被一个任务使用，如果想要多个任务使用一个数据，就有些强人所难。不知道还有多少同学记得 [`Arc`](https://course.rs/advance/smart-pointer/rc-arc.html)，它可以轻松解决该问题，还是线程安全的。

在上面的报错中，还有一句很奇怪的信息`function requires argument type to outlive 'static`， 函数要求参数类型的生命周期必须比 `'static` 长，问题是 `'static` 已经活得跟整个程序一样久了，难道函数的参数还能活得更久？大家可能会觉得编译器秀逗了，毕竟其它语言编译器也有秀逗的时候:)

先别急着给它扣帽子，虽然我有时候也想这么做。。原因是它说的是类型必须活得比 `'static` 长，而不是值。当我们说一个值是 `'static` 时，意味着它将永远存活。这个很重要，因为编译器无法知道新创建的任务将存活多久，所以唯一的办法就是让任务永远存活。

如果大家对于 `'&static` 和 `T: 'static` 较为模糊，强烈建议回顾下[该章节](https://course.rs/advance/lifetime/static.html)。

#### Send 约束

`tokio::spawn` 生成的任务必须实现 `Send` 特征，因为当这些任务在 `.await` 执行过程中发生阻塞时，Tokio 调度器会将任务在线程间移动。

**一个任务要实现 `Send` 特征，那它在 `.await` 调用的过程中所持有的全部数据都必须实现 `Send` 特征**。当 `.await` 调用发生阻塞时，任务会让出当前线程所有权给调度器，然后当任务准备好后，调度器会从上一次暂停的位置继续执行该任务。该流程能正确的工作，任务必须将`.await`之后使用的所有状态保存起来，这样才能在中断后恢复现场并继续执行。若这些状态实现了 `Send` 特征(可以在线程间安全地移动)，那任务自然也就可以在线程间安全地移动。

例如以下代码可以工作:

```rust
use tokio::task::yield_now;
use std::rc::Rc;

#[tokio::main]
async fn main() {
    tokio::spawn(async {
        // 语句块的使用强制了 `rc` 会在 `.await` 被调用前就被释放，
        // 因此 `rc` 并不会影响 `.await`的安全性
        {
            let rc = Rc::new("hello");
            println!("{}", rc);
        }

        // `rc` 的作用范围已经失效，因此当任务让出所有权给当前线程时，它无需作为状态被保存起来
        yield_now().await;
    });
}
```

但是下面代码就不行：

```rust
use tokio::task::yield_now;
use std::rc::Rc;

#[tokio::main]
async fn main() {
    tokio::spawn(async {
        let rc = Rc::new("hello");


        // `rc` 在 `.await` 后还被继续使用，因此它必须被作为任务的状态保存起来
        yield_now().await;


        // 事实上，注释掉下面一行代码，依然会报错
        // 原因是：是否保存，不取决于 `rc` 是否被使用，而是取决于 `.await`在调用时是否仍然处于 `rc` 的作用域中
        println!("{}", rc);

        // rc 作用域在这里结束
    });
}
```

这里有一个很重要的点，代码注释里有讲到，但是我们再重复一次： `rc` 是否会保存到任务状态中，取决于 `.await` 的调用是否处于它的作用域中，上面代码中，就算你注释掉 `println!` 函数，该报错依然会报错，因为 `rc` 的作用域直到 `async` 的末尾才结束！

下面是相应的报错，在下一章节，我们还会继续深入讨论该错误:

```shell
error: future cannot be sent between threads safely
   --> src/main.rs:6:5
    |
6   |     tokio::spawn(async {
    |     ^^^^^^^^^^^^ future created by async block is not `Send`
    |
   ::: [..]spawn.rs:127:21
    |
127 |         T: Future + Send + 'static,
    |                     ---- required by this bound in
    |                          `tokio::task::spawn::spawn`
    |
    = help: within `impl std::future::Future`, the trait
    |       `std::marker::Send` is not  implemented for
    |       `std::rc::Rc<&str>`
note: future is not `Send` as this value is used across an await
   --> src/main.rs:10:9
    |
7   |         let rc = Rc::new("hello");
    |             -- has type `std::rc::Rc<&str>` which is not `Send`
...
10  |         yield_now().await;
    |         ^^^^^^^^^^^^^^^^^ await occurs here, with `rc` maybe
    |                           used later
11  |         println!("{}", rc);
12  |     });
    |     - `rc` is later dropped here
```

## 使用 HashMap 存储数据

现在，我们可以继续前进了，下面来实现 `process` 函数，它用于处理进入的命令。相应的值将被存储在 `HashMap` 中: 通过 `SET` 命令存值，通过 `GET` 命令来取值。

同时，我们将使用循环的方式在同一个客户端连接中处理多次连续的请求:

```rust
use tokio::net::TcpStream;
use mini_redis::{Connection, Frame};

async fn process(socket: TcpStream) {
    use mini_redis::Command::{self, Get, Set};
    use std::collections::HashMap;

    // 使用 hashmap 来存储 redis 的数据
    let mut db = HashMap::new();

    // `mini-redis` 提供的便利函数，使用返回的 `connection` 可以用于从 socket 中读取数据并解析为数据帧
    let mut connection = Connection::new(socket);

    // 使用 `read_frame` 方法从连接获取一个数据帧：一条redis命令 + 相应的数据
    while let Some(frame) = connection.read_frame().await.unwrap() {
        let response = match Command::from_frame(frame).unwrap() {
            Set(cmd) => {
                // 值被存储为 `Vec<u8>` 的形式
                db.insert(cmd.key().to_string(), cmd.value().to_vec());
                Frame::Simple("OK".to_string())
            }
            Get(cmd) => {
                if let Some(value) = db.get(cmd.key()) {
                    // `Frame::Bulk` 期待数据的类型是 `Bytes`， 该类型会在后面章节讲解，
                    // 此时，你只要知道 `&Vec<u8>` 可以使用 `into()` 方法转换成 `Bytes` 类型
                    Frame::Bulk(value.clone().into())
                } else {
                    Frame::Null
                }
            }
            cmd => panic!("unimplemented {:?}", cmd),
        };

        // 将请求响应返回给客户端
        connection.write_frame(&response).await.unwrap();
    }
}

// main 函数在之前已实现
```

使用 `cargo run` 运行服务器，然后再打开另一个终端窗口，运行 `hello-redis` 客户端示例: `cargo run --example hello-redis`。

Bingo，在看了这么多原理后，我们终于迈出了小小的第一步，并获取到了存在 `HashMap` 中的值: `got value from the server; result=Some(b"world")`。

但是问题又来了：这些值无法在 TCP 连接中共享，如果另外一个用户连接上来并试图同时获取 `hello` 这个 `key`，他将一无所获。
