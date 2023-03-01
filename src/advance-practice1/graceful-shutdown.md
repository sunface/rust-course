# 优雅关闭和资源清理

之前的程序，如果使用 `ctrl-c` 的方法来关闭，所有的线程都会立即停止，这会造成正在请求的用户感知到一个明显的错误。


因此我们需要添加一些优雅关闭( Graceful Shutdown )，以更好的完成资源清理等收尾工作。

## 为线程池实现 Drop

当线程池被 drop 时，需要等待所有的子线程完成它们的工作，然后再退出，下面是一个初步尝试:

```rust
impl Drop for ThreadPool {
    fn drop(&mut self) {
        for worker in &mut self.workers {
            println!("Shutting down worker {}", worker.id);

            worker.thread.join().unwrap();
        }
    }
}
```

这里通过实现 `Drop` 特征来为线程池添加资源收尾工作，代码比较简单，就是依次调用每个线程的 `join` 方法。编译下试试：

```rust
$ cargo check
    Checking hello v0.1.0 (file:///projects/hello)
error[E0507]: cannot move out of `worker.thread` which is behind a mutable reference
  --> src/lib.rs:52:13
   |
52 |             worker.thread.join().unwrap();
   |             ^^^^^^^^^^^^^ ------ `worker.thread` moved due to this method call
   |             |
   |             move occurs because `worker.thread` has type `JoinHandle<()>`, which does not implement the `Copy` trait
   |
note: this function takes ownership of the receiver `self`, which moves `worker.thread`

For more information about this error, try `rustc --explain E0507`.
error: could not compile `hello` due to previous error
```

这里的报错很明显，`worker.thread` 试图拿走所有权，但是 `worker` 仅仅是一个可变借用，显然是不可行的。

目前来看，只能将 `thread` 从 `worker` 中移动出来，一个可行的尝试:

```rust
struct Worker {
    id: usize,
    thread: Option<thread::JoinHandle<()>>,
}
```

对于 `Option` 类型，可以使用 `take` 方法拿走内部值的所有权，同时留下一个 `None` 在风中孤独凌乱。继续尝试编译驱动开发模式:

```shell
$ cargo check
    Checking hello v0.1.0 (file:///projects/hello)
error[E0599]: no method named `join` found for enum `Option` in the current scope
  --> src/lib.rs:52:27
   |
52 |             worker.thread.join().unwrap();
   |                           ^^^^ method not found in `Option<JoinHandle<()>>`
   |
note: the method `join` exists on the type `JoinHandle<()>`
help: consider using `Option::expect` to unwrap the `JoinHandle<()>` value, panicking if the value is an `Option::None`
   |
52 |             worker.thread.expect("REASON").join().unwrap();
   |                          +++++++++++++++++

error[E0308]: mismatched types
  --> src/lib.rs:72:22
   |
72 |         Worker { id, thread }
   |                      ^^^^^^ expected enum `Option`, found struct `JoinHandle`
   |
   = note: expected enum `Option<JoinHandle<()>>`
            found struct `JoinHandle<_>`
help: try wrapping the expression in `Some`
   |
72 |         Worker { id, thread: Some(thread) }
   |                      +++++++++++++      +
```

先来解决第二个类型不匹配的错误:

```rust
impl Worker {
    fn new(id: usize, receiver: Arc<Mutex<mpsc::Receiver<Job>>>) -> Worker {
        // --snip--

        Worker {
            id,
            thread: Some(thread),
        }
    }
}
```

简单搞定，回头看看第一个错误，既然换了 `Option`，就可以用 `take` 拿走所有权:

```rust
impl Drop for ThreadPool {
    fn drop(&mut self) {
        for worker in &mut self.workers {
            println!("Shutting down worker {}", worker.id);

            if let Some(thread) = worker.thread.take() {
                thread.join().unwrap();
            }
        }
    }
}
```

注意这种 `if let` 的写法，若 `worker.thread` 已经是 `None`，什么都不会发生，符合我们的预期; 若包含一个线程，那就拿走其所有权，然后调用 `join`。

## 停止工作线程

虽然调用了 `join` ，但是目标线程依然不会停止，原因在于它们在无限的 `loop` 循环等待，看起来需要借用 `channel` 的 `drop` 机制：释放 `sender`发送端后，`receiver` 接收端会收到报错，然后再退出即可。

```rust
pub struct ThreadPool {
    workers: Vec<Worker>,
    sender: Option<mpsc::Sender<Job>>,
}
// --snip--
impl ThreadPool {
    pub fn new(size: usize) -> ThreadPool {
        // --snip--

        ThreadPool {
            workers,
            sender: Some(sender),
        }
    }

    pub fn execute<F>(&self, f: F)
    where
        F: FnOnce() + Send + 'static,
    {
        let job = Box::new(f);

        self.sender.as_ref().unwrap().send(job).unwrap();
    }
}

impl Drop for ThreadPool {
    fn drop(&mut self) {
        drop(self.sender.take());

        for worker in &mut self.workers {
            println!("Shutting down worker {}", worker.id);

            if let Some(thread) = worker.thread.take() {
                thread.join().unwrap();
            }
        }
    }
}
```

上面做了两处改变:

1. 为 `sender` 增加 `Option` 封装，这样可以用 `take` 拿走所有权，跟之前的 `thread` 一样
2. 主动调用 `drop` 关闭发送端 `sender`

关闭 `sender` 后，将关闭对应的 `channel`，意味着不会再有任何消息被发送。随后，所有的处于无限 `loop` 的接收端将收到一个错误，我们根据错误再进行进一步的处理。


```rust
impl Worker {
    fn new(id: usize, receiver: Arc<Mutex<mpsc::Receiver<Job>>>) -> Worker {
        let thread = thread::spawn(move || loop {
            let message = receiver.lock().unwrap().recv();

            match message {
                Ok(job) => {
                    println!("Worker {id} got a job; executing.");

                    job();
                }
                Err(_) => {
                    println!("Worker {id} disconnected; shutting down.");
                    break;
                }
            }
        });

        Worker {
            id,
            thread: Some(thread),
        }
    }
}
```

为了快速验证代码是否正确，修改 `main` 函数，让其只接收前两个请求:

```rust
fn main() {
    let listener = TcpListener::bind("127.0.0.1:7878").unwrap();
    let pool = ThreadPool::new(4);

    for stream in listener.incoming().take(2) {
        let stream = stream.unwrap();

        pool.execute(|| {
            handle_connection(stream);
        });
    }

    println!("Shutting down.");
}
```

`take` 是迭代器 `Iterator` 上的方法，会限制后续的迭代进行最多两次，然后就结束监听，随后 `ThreadPool` 也将超出作用域并自动触发 `drop`。

```shell
$ cargo run
   Compiling hello v0.1.0 (file:///projects/hello)
    Finished dev [unoptimized + debuginfo] target(s) in 1.0s
     Running `target/debug/hello`
Worker 0 got a job; executing.
Shutting down.
Shutting down worker 0
Worker 3 got a job; executing.
Worker 1 disconnected; shutting down.
Worker 2 disconnected; shutting down.
Worker 3 disconnected; shutting down.
Worker 0 disconnected; shutting down.
Shutting down worker 1
Shutting down worker 2
Shutting down worker 3
```

可以看到，代码按照我们的设想如期运行，至此，一个基于线程池的简单 Web 服务器已经完成，下面是完整的代码:


## 完整代码
```rust
// src/main.rs
use hello::ThreadPool;
use std::fs;
use std::io::prelude::*;
use std::net::TcpListener;
use std::net::TcpStream;
use std::thread;
use std::time::Duration;

fn main() {
    let listener = TcpListener::bind("127.0.0.1:7878").unwrap();
    let pool = ThreadPool::new(4);

    for stream in listener.incoming().take(2) {
        let stream = stream.unwrap();

        pool.execute(|| {
            handle_connection(stream);
        });
    }

    println!("Shutting down.");
}

fn handle_connection(mut stream: TcpStream) {
    let mut buffer = [0; 1024];
    stream.read(&mut buffer).unwrap();

    let get = b"GET / HTTP/1.1\r\n";
    let sleep = b"GET /sleep HTTP/1.1\r\n";

    let (status_line, filename) = if buffer.starts_with(get) {
        ("HTTP/1.1 200 OK", "hello.html")
    } else if buffer.starts_with(sleep) {
        thread::sleep(Duration::from_secs(5));
        ("HTTP/1.1 200 OK", "hello.html")
    } else {
        ("HTTP/1.1 404 NOT FOUND", "404.html")
    };

    let contents = fs::read_to_string(filename).unwrap();

    let response = format!(
        "{}\r\nContent-Length: {}\r\n\r\n{}",
        status_line,
        contents.len(),
        contents
    );

    stream.write_all(response.as_bytes()).unwrap();
    stream.flush().unwrap();
}
```

```rust
// src/lib.rs
use std::{
    sync::{mpsc, Arc, Mutex},
    thread,
};

pub struct ThreadPool {
    workers: Vec<Worker>,
    sender: Option<mpsc::Sender<Job>>,
}

type Job = Box<dyn FnOnce() + Send + 'static>;

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

        let (sender, receiver) = mpsc::channel();

        let receiver = Arc::new(Mutex::new(receiver));

        let mut workers = Vec::with_capacity(size);

        for id in 0..size {
            workers.push(Worker::new(id, Arc::clone(&receiver)));
        }

        ThreadPool {
            workers,
            sender: Some(sender),
        }
    }

    pub fn execute<F>(&self, f: F)
    where
        F: FnOnce() + Send + 'static,
    {
        let job = Box::new(f);

        self.sender.as_ref().unwrap().send(job).unwrap();
    }
}

impl Drop for ThreadPool {
    fn drop(&mut self) {
        drop(self.sender.take());

        for worker in &mut self.workers {
            println!("Shutting down worker {}", worker.id);

            if let Some(thread) = worker.thread.take() {
                thread.join().unwrap();
            }
        }
    }
}

struct Worker {
    id: usize,
    thread: Option<thread::JoinHandle<()>>,
}

impl Worker {
    fn new(id: usize, receiver: Arc<Mutex<mpsc::Receiver<Job>>>) -> Worker {
        let thread = thread::spawn(move || loop {
            let message = receiver.lock().unwrap().recv();

            match message {
                Ok(job) => {
                    println!("Worker {id} got a job; executing.");

                    job();
                }
                Err(_) => {
                    println!("Worker {id} disconnected; shutting down.");
                    break;
                }
            }
        });

        Worker {
            id,
            thread: Some(thread),
        }
    }
}
```

### 可以做的更多

事实上，我们还可以做更多，但是受制于篇幅，就不再展开，感兴趣的同学可以自行完成。

- 增加更多的文档
- 为线程池增加测试
- 尽可能移除 `unwrap`，替换为错误处理
- 使用线程池完成其它类型的工作，而不仅仅是本章的 Web 服务器
- 在 `crates.io` 上找到一个线程池实现，然后使用该包实现一个类似的 Web 服务器


## 上一章节的遗留问题

在上一章节的末尾，我们提到将 `let` 替换为 `while let` 后，多线程的优势将荡然无存，原因藏的很隐蔽：

1. `Mutex` 结构体没有提供显式的 `unlock`，要依赖作用域结束后的 `drop` 来自动释放 
2. `let job = receiver.lock().unwrap().recv().unwrap();` 在这行代码中，由于使用了 `let`，右边的任何临时变量会在 `let` 语句结束后立即被 `drop`，因此锁会自动释放
3. 然而 `while let` (还包括 `if let` 和 `match`) 直到最后一个花括号后，才触发 `drop`

```rust
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

根据之前的分析，上面的代码直到 `job()` 任务执行结束后，才会释放锁，去执行另一个请求，最终造成请求排队。