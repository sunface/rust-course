# 构建多线程 Web 服务器

目前的单线程版本只能依次处理用户的请求：一时间只能处理一个请求连接。随着用户的请求数增多，可以预料的是排在后面的用户可能要等待数十秒甚至超时！

本章我们将解决这个问题，但是首先来模拟一个慢请求场景，看看单线程是否真的如此糟糕。

## 基于单线程模拟慢请求

下面的代码中，使用 sleep 的方式让每次请求持续 5 秒，模拟真实的慢请求:

```rust
// in main.rs
use std::{
    fs,
    io::{prelude::*, BufReader},
    net::{TcpListener, TcpStream},
    thread,
    time::Duration,
};
// --snip--

fn handle_connection(mut stream: TcpStream) {
    // --snip--

    let (status_line, filename) = match &request_line[..] {
        "GET / HTTP/1.1" => ("HTTP/1.1 200 OK", "hello.html"),
        "GET /sleep HTTP/1.1" => {
            thread::sleep(Duration::from_secs(5));
            ("HTTP/1.1 200 OK", "hello.html")
        }
        _ => ("HTTP/1.1 404 NOT FOUND", "404.html"),
    };

    // --snip--
}
```

由于增加了新的请求路径 `/sleep`，之前的 `if else` 被修改为 `match`，需要注意的是，由于 `match` 不会像方法那样自动做引用或者解引用，因此我们需要显式调用: `match &request_line[..]` ，来获取所需的 `&str` 类型。

可以看出，当用户访问 `/sleep` 时，请求会持续 5 秒后才返回，下面来试试，启动服务器后，打开你的浏览器，这次要分别打开两个页面(tab页): `http://127.0.0.1:7878/` 和 `http://127.0.0.1:7878/sleep`。

此时，如果我们连续访问 `/` 路径，那效果跟之前一样：立刻看到请求的页面。但假如先访问 `/sleep` ，接着在另一个页面访问 `/`，就会看到 `/` 的页面直到 5 秒后才会刷出来，验证了请求排队这个糟糕的事实。

至于如何解决，其实办法不少，本章我们来看看一个经典解决方案：线程池。

## 使用线程池改善吞吐

线程池包含一组已生成的线程，它们时刻等待着接收并处理新的任务。当程序接收到新任务时，它会将线程池中的一个线程指派给该任务，在该线程忙着处理时，新来的任务会交给池中剩余的线程进行处理。最终，当执行任务的线程处理完后，它会被重新放入到线程池中，准备处理新任务。

假设线程池中包含 N 个线程，那么可以推断出，服务器将拥有并发处理 N 个请求连接的能力，从而增加服务器的吞吐量。

同时，我们将限制线程池中的线程数量，以保护服务器免受拒绝服务攻击（DoS）的影响：如果针对每个请求创建一个新线程，那么一个人向我们的服务器发出1000万个请求，会直接耗尽资源，导致后续用户的请求无法被处理，这也是拒绝服务名称的来源。

因此，还需对线程池进行一定的架构设计，首先是设定最大线程数的上限，其次维护一个请求队列。池中的线程去队列中依次弹出请求并处理。这样就可以同时并发处理 N 个请求，其中 N 是线程数。

但聪明的读者可能会想到，假如每个请求依然耗时很长，那请求队列依然会堆积，后续的用户请求还是需要等待较长的时间，毕竟你也就 N 个线程，但总归比单线程要强 N 倍吧 :D

当然，线程池依然是较为传统的提升吞吐方法，比较新的有：单线程异步 IO，例如 redis；多线程异步 IO，例如 Rust 的主流 web 框架。事实上，大家在下一个实战项目中，会看到相关技术的应用。

### 为每个请求生成一个线程

这显然不是我们的最终方案，原因在于它会生成无上限的线程数，最终导致资源耗尽。但它确实是一个好的起点:

```rust
fn main() {
    let listener = TcpListener::bind("127.0.0.1:7878").unwrap();

    for stream in listener.incoming() {
        let stream = stream.unwrap();

        thread::spawn(|| {
            handle_connection(stream);
        });
    }
}
```

这种实现下，依次访问 `/sleep` 和 `/` 就无需再等待，不错的开始。

### 限制创建线程的数量

原则上，我们希望在上面代码的基础上，尽量少的去修改，下面是一个假想的线程池 API 实现:

```rust
fn main() {
    let listener = TcpListener::bind("127.0.0.1:7878").unwrap();
    let pool = ThreadPool::new(4);

    for stream in listener.incoming() {
        let stream = stream.unwrap();

        pool.execute(|| {
            handle_connection(stream);
        });
    }
}
```

代码跟之前的类似，也非常简洁明了， `ThreadPool::new(4)` 创建一个包含 4 个线程的线程池，接着通过 `pool.execute` 去分发执行请求。

显然，上面的代码无法编译，下面来逐步实现。

### 使用编译器驱动的方式开发 ThreadPool

你可能听说过测试驱动开发，但听过编译器驱动开发吗？来见识下 Rust 中的绝招吧。

检查之前的代码，看看报什么错:

```shell
$ cargo check
    Checking hello v0.1.0 (file:///projects/hello)
error[E0433]: failed to resolve: use of undeclared type `ThreadPool`
  --> src/main.rs:11:16
   |
11 |     let pool = ThreadPool::new(4);
   |                ^^^^^^^^^^ use of undeclared type `ThreadPool`

For more information about this error, try `rustc --explain E0433`.
error: could not compile `hello` due to previous error
```

俗话说，不怕敌人很强，就怕他们不犯错，很好，编译器漏出了破绽。看起来我们需要实现 `ThreadPool` 类型。看起来，还需要添加一个库包，未来线程池的代码都将在这个独立的包中完成，甚至于未来你要实现其它的服务，也可以复用这个多线程库包。

创建 `src/lib.rs` 文件并写入如下代码:

```rust
pub struct ThreadPool;
```

接着在 `main.rs` 中引入:

```rust
// main.rs
use hello::ThreadPool;
```

编译后依然报错:

```shell
$ cargo check
    Checking hello v0.1.0 (file:///projects/hello)
error[E0599]: no function or associated item named `new` found for struct `ThreadPool` in the current scope
  --> src/main.rs:12:28
   |
12 |     let pool = ThreadPool::new(4);
   |                            ^^^ function or associated item not found in `ThreadPool`

For more information about this error, try `rustc --explain E0599`.
error: could not compile `hello` due to previous error
```

好，继续实现 `new` 函数 :

```rust
pub struct ThreadPool;

impl ThreadPool {
    pub fn new(size: usize) -> ThreadPool {
        ThreadPool
    }
}
```

继续检查：

```shell
$ cargo check
    Checking hello v0.1.0 (file:///projects/hello)
error[E0599]: no method named `execute` found for struct `ThreadPool` in the current scope
  --> src/main.rs:17:14
   |
17 |         pool.execute(|| {
   |              ^^^^^^^ method not found in `ThreadPool`

For more information about this error, try `rustc --explain E0599`.
error: could not compile `hello` due to previous error
```

这个方法类似于 `thread::spawn`，用于将闭包中的任务交给某个空闲的线程去执行。

其实这里有一个小难点：`execute` 的参数是一个闭包，回忆下之前学过的内容，闭包作为参数时可以由三个特征进行约束: `Fn`、`FnMut` 和 `FnOnce`，选哪个就成为一个问题。由于 `execute` 在实现上类似 `thread::spawn`，我们可以参考下后者的签名如何声明。

```rust
pub fn spawn<F, T>(f: F) -> JoinHandle<T>
    where
        F: FnOnce() -> T,
        F: Send + 'static,
        T: Send + 'static,
```

可以看出，`spawn` 选择 `FnOnce` 作为 `F` 闭包的特征约束，原因是闭包作为任务只需被线程执行一次即可。

`F` 还有一个特征约束 `Send` ，也可以照抄过来，毕竟闭包需要从一个线程传递到另一个线程，至于生命周期约束 `'static`，是因为我们并不知道线程需要多久时间来执行该任务。

```rust
impl ThreadPool {
    // --snip--
    pub fn execute<F>(&self, f: F)
    where
        F: FnOnce() + Send + 'static,
    {
    }
}
```

在理解 `spawn` 后，就可以轻松写出如上的 `execute` 实现，注意这里的 `FnOnce()` 跟 `spawn` 有所不同，原因是要 `execute` 传入的闭包没有参数也没有返回值。

```shell
$ cargo check
    Checking hello v0.1.0 (file:///projects/hello)
    Finished dev [unoptimized + debuginfo] target(s) in 0.24s
```

成功编译，但在浏览器访问依然会报之前类似的错误，下面来实现 `execute`。

### `new` 还是 `build`

关于 `ThreadPool` 的构造函数，存在两个选择 `new` 和 `build`。

`new` 往往用于简单初始化一个实例，而 `build` 往往会完成更加复杂的构建工作，例如入门实战中的 `Config::build`。

在这个项目中，我们并不需要在初始化线程池的同时创建相应的线程，因此 `new` 是更适合的选择:

```rust
impl ThreadPool {
    /// Create a new ThreadPool.
    ///
    /// The size is the number of threads in the pool.
    ///
    /// # Panics
    ///
    /// The `new` function will panic if the size is zero.
    pub fn new(size: usize) -> ThreadPool {
        assert!(size > 0);

        ThreadPool
    }

    // --snip--
}
```

这里有两点值得注意:

- `usize` 类型包含 `0`，但是创建没有任何线程的线程池显然是无意义的，因此做一下 `assert!` 验证
- `ThreadPool` 拥有不错的[文档注释](https://course.rs/basic/comment.html#文档注释)，甚至包含了可能 `panic` 的情况，通过 `cargo doc --open` 可以访问文档注释

### 存储线程

创建 `ThreadPool` 后，下一步就是存储具体的线程，既然要存放线程，一个绕不过去的问题就是：用什么类型来存放，例如假如使用 `Vec<T>`  来存储，那这个 `T` 应该是什么？

估计还得探索下 `thread::spawn` 的签名，毕竟它生成并返回一个线程:

```rust
pub fn spawn<F, T>(f: F) -> JoinHandle<T>
    where
        F: FnOnce() -> T,
        F: Send + 'static,
        T: Send + 'static,
```

看起来 `JoinHandle<T>` 是我们需要的，这里的 `T` 是传入的闭包任务所返回的，我们的任务无需任何返回，因此 `T` 直接使用 `()` 即可。

```rust
use std::thread;

pub struct ThreadPool {
    threads: Vec<thread::JoinHandle<()>>,
}

impl ThreadPool {
    // --snip--
    pub fn new(size: usize) -> ThreadPool {
        assert!(size > 0);

        let mut threads = Vec::with_capacity(size);

        for _ in 0..size {
            // create some threads and store them in the vector
        }

        ThreadPool { threads }
    }
    // --snip--
}
```

如上所示，最终我们使用 `Vec<thread::JoinHandle<()>>` 来存储线程，同时设定了容量上限 `with_capacity(size)`，该方法还可以提前分配好内存空间，比 `Vec::new` 的性能要更好一点。

### 将代码从 ThreadPool 发送到线程中

上面的代码留下一个未实现的 `for` 循环，用于创建和存储线程。

学过多线程一章后，大家应该知道 `thread::spawn` 虽然是生成线程最好的方式，但是它会立即执行传入的任务，然而，在我们的使用场景中，创建线程和执行任务明显是要分离的，因此标准库看起来不再适合。

可以考虑创建一个 `Worker` 结构体，作为 `ThreadPool` 和任务线程联系的桥梁，它的任务是获得将要执行的代码，然后在具体的线程中去执行。想象一个场景：一个餐馆，`Worker` 等待顾客的点餐，然后将具体的点餐信息传递给厨房，感觉类似服务员？

引入 `Worker` 后，就无需再存储 `JoinHandle<()>` 实例，直接存储 `Worker` 实例：该实例内部会存储 `JoinHandle<()>`。下面是新的线程池创建流程:

```rust
use std::thread;

pub struct ThreadPool {
    workers: Vec<Worker>,
}

impl ThreadPool {
    // --snip--
    pub fn new(size: usize) -> ThreadPool {
        assert!(size > 0);

        let mut workers = Vec::with_capacity(size);

        for id in 0..size {
            workers.push(Worker::new(id));
        }

        ThreadPool { workers }
    }
    // --snip--
}

struct Worker {
    id: usize,
    thread: thread::JoinHandle<()>,
}

impl Worker {
    fn new(id: usize) -> Worker {
        // 尚未实现..
        let thread = thread::spawn(|| {});
        // 每个 `Worker` 都拥有自己的唯一 id
        Worker { id, thread }
    }
}
```

由于外部调用者无需知道 `Worker` 的存在，因此这里使用了私有的声明。

大家可以编译下代码，如果出错了，请仔细检查下，是否遗漏了什么，截止目前，代码是完全可以通过编译的，但是任务该怎么执行依然还没有实现。

### 将请求发送给线程

在上面的代码中， `thread::spawn(|| {})` 还没有给予实质性的内容，现在一起来完善下。

首先 `Worker` 结构体需要从线程池 `ThreadPool` 的队列中获取待执行的代码，对于这类场景，消息传递非常适合：我们将使用消息通道( channel )作为任务队列。

```rust
use std::{sync::mpsc, thread};

pub struct ThreadPool {
    workers: Vec<Worker>,
    sender: mpsc::Sender<Job>,
}

struct Job;

impl ThreadPool {
    // --snip--
    pub fn new(size: usize) -> ThreadPool {
        assert!(size > 0);

        let (sender, receiver) = mpsc::channel();

        let mut workers = Vec::with_capacity(size);

        for id in 0..size {
            workers.push(Worker::new(id));
        }

        ThreadPool { workers, sender }
    }
    // --snip--
}
```

阅读过之前内容的同学应该知道，消息通道有发送端和接收端，其中线程池 `ThreadPool` 持有发送端，通过 `execute` 方法来发送任务。那么问题来了，谁持有接收端呢？答案是 `Worker`，它的内部线程将接收任务，然后进行处理。

```rust
impl ThreadPool {
    // --snip--
    pub fn new(size: usize) -> ThreadPool {
        assert!(size > 0);

        let (sender, receiver) = mpsc::channel();

        let mut workers = Vec::with_capacity(size);

        for id in 0..size {
            workers.push(Worker::new(id, receiver));
        }

        ThreadPool { workers, sender }
    }
    // --snip--
}

// --snip--

impl Worker {
    fn new(id: usize, receiver: mpsc::Receiver<Job>) -> Worker {
        let thread = thread::spawn(|| {
            receiver;
        });

        Worker { id, thread }
    }
}
```

看起来很美好，但是很不幸，它会报错: 

```shell
$ cargo check
    Checking hello v0.1.0 (file:///projects/hello)
error[E0382]: use of moved value: `receiver`
  --> src/lib.rs:26:42
   |
21 |         let (sender, receiver) = mpsc::channel();
   |                      -------- move occurs because `receiver` has type `std::sync::mpsc::Receiver<Job>`, which does not implement the `Copy` trait
...
26 |             workers.push(Worker::new(id, receiver));
   |                                          ^^^^^^^^ value moved here, in previous iteration of loop

For more information about this error, try `rustc --explain E0382`.
error: could not compile `hello` due to previous error
```

原因也很简单，`receiver` 并没有实现 `Copy`，因此它的所有权在第一次循环中，就被传入到第一个 `Worker` 实例中，后续自然无法再使用。

报错就解决呗，但 Rust 中的 channel 实现是 mpsc，即多生产者单消费者，因此我们无法通过克隆消费者的方式来修复这个错误。当然，发送多条消息给多个接收者也不在考虑范畴，该怎么办？似乎陷入了绝境。

雪上加霜的是，就算 `receiver` 可以克隆，但是你得保证同一个时间只有一个`receiver` 能接收消息，否则一个任务可能同时被多个 `Worker` 执行，因此多个线程需要安全的共享和使用 `receiver`，等等，安全的共享？听上去 `Arc` 这个多所有权结构非常适合，互斥使用？貌似 `Mutex` 很适合，结合一下，`Arc<Mutex<T>>`，这不就是我们之前见过多次的线程安全类型吗？

总之，`Arc` 允许多个 `Worker` 同时持有 `receiver`，而 `Mutex` 可以确保一次只有一个 `Worker` 能从 `receiver` 接收消息。

```rust
use std::{
    sync::{mpsc, Arc, Mutex},
    thread,
};
// --snip--

impl ThreadPool {
    // --snip--
    pub fn new(size: usize) -> ThreadPool {
        assert!(size > 0);

        let (sender, receiver) = mpsc::channel();

        let receiver = Arc::new(Mutex::new(receiver));

        let mut workers = Vec::with_capacity(size);

        for id in 0..size {
            workers.push(Worker::new(id, Arc::clone(&receiver)));
        }

        ThreadPool { workers, sender }
    }

    // --snip--
}

// --snip--

impl Worker {
    fn new(id: usize, receiver: Arc<Mutex<mpsc::Receiver<Job>>>) -> Worker {
        // --snip--
    }
}
```

修改后，每一个 Worker 都可以安全的持有 `receiver`，同时不必担心一个任务会被重复执行多次，完美！


### 实现 execute 方法

首先，需要为一个很长的类型创建一个别名, 有多长呢？ 

```rust
// --snip--

type Job = Box<dyn FnOnce() + Send + 'static>;

impl ThreadPool {
    // --snip--

    pub fn execute<F>(&self, f: F)
    where
        F: FnOnce() + Send + 'static,
    {
        let job = Box::new(f);

        self.sender.send(job).unwrap();
    }
}

// --snip--
```

创建别名的威力暂时还看不到，敬请期待。总之，这里的工作很简单，将传入的任务包装成 `Job` 类型后，发送出去。

但是还没完，接收的代码也要完善下:

```rust
// --snip--

impl Worker {
    fn new(id: usize, receiver: Arc<Mutex<mpsc::Receiver<Job>>>) -> Worker {
        let thread = thread::spawn(move || loop {
            let job = receiver.lock().unwrap().recv().unwrap();

            println!("Worker {id} got a job; executing.");

            job();
        });

        Worker { id, thread }
    }
}
```

修改后，就可以不停地循环去接收任务，最后进行执行。还可以看到因为之前 `Job` 别名的引入， `new` 函数的签名才没有过度复杂，否则你将看到的是 `fn new(id: usize, receiver: Arc<Mutex<mpsc::Receiver<Box<dyn FnOnce() + Send + 'static>>>>) -> Worker` ，感受下类型别名的威力吧 :D

`lock()` 方法可以获得一个 `Mutex` 锁，至于为何使用 `unwrap`，难道获取锁还能失败？没错，假如当前持有锁的线程 `panic` 了，那么这些等待锁的线程就会获取一个错误，因此 通过 `unwrap` 来让当前等待的线程 `panic` 是一个不错的解决方案，当然你还可以换成 `expect`。

一旦获取到锁里的内容 `mpsc::Receiver<Job>>` 后，就可以调用其上的 `recv` 方法来接收消息，依然是一个 `unwrap`，原因在于持有发送端的线程可能会被关闭，这种情况下直接 `panic` 也是不错的。

`recv` 的调用过程是阻塞的，意味着若没有任何任务，那当前的调用线程将一直等待，直到接收到新的任务。`Mutex<T>` 可以保证同一个任务只会被一个 Worker 获取，不会被重复执行。

```shell
$ cargo run
   Compiling hello v0.1.0 (file:///projects/hello)
warning: field is never read: `workers`
 --> src/lib.rs:7:5
  |
7 |     workers: Vec<Worker>,
  |     ^^^^^^^^^^^^^^^^^^^^
  |
  = note: `#[warn(dead_code)]` on by default

warning: field is never read: `id`
  --> src/lib.rs:48:5
   |
48 |     id: usize,
   |     ^^^^^^^^^

warning: field is never read: `thread`
  --> src/lib.rs:49:5
   |
49 |     thread: thread::JoinHandle<()>,
   |     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

warning: `hello` (lib) generated 3 warnings
    Finished dev [unoptimized + debuginfo] target(s) in 1.40s
     Running `target/debug/hello`
Worker 0 got a job; executing.
Worker 2 got a job; executing.
Worker 1 got a job; executing.
Worker 3 got a job; executing.
Worker 0 got a job; executing.
Worker 2 got a job; executing.
Worker 1 got a job; executing.
Worker 3 got a job; executing.
Worker 0 got a job; executing.
Worker 2 got a job; executing.
```

终于，程序如愿运行起来，我们的线程池可以并发处理任务了！从打印的数字可以看到，只有 4 个线程去执行任务，符合我们对线程池的要求，这样再也不用担心系统的线程资源会被消耗殆尽了！


> 注意： 出于缓存的考虑，有些浏览器会对多次同样的请求进行顺序的执行，因此你可能还是会遇到访问 `/sleep` 后，就无法访问另一个 `/sleep` 的问题 :(


## while let 的巨大陷阱

还有一个问题，为啥之前我们不用 `while let` 来循环？例如：

```rust
// --snip--

impl Worker {
    fn new(id: usize, receiver: Arc<Mutex<mpsc::Receiver<Job>>>) -> Worker {
        let thread = thread::spawn(move || {
            while let Ok(job) = receiver.lock().unwrap().recv() {
                println!("Worker {id} got a job; executing.");

                job();
            }
        });

        Worker { id, thread }
    }
}
```

这段代码编译起来没问题，但是并不会产生我们预期的结果：后续请求依然需要等待慢请求的处理完成后，才能被处理。奇怪吧，仅仅是从 `let` 改成 `while let` 就会变成这样？大家可以思考下为什么会这样，具体答案会在下一章节末尾给出，这里先出给一个小提示：`Mutex` 获取的锁在作用域结束后才会被释放。












