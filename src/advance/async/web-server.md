# 一个实践项目: Web 服务器

知识学得再多，不实际应用也是纸上谈兵，不是忘掉就是废掉，对于技术学习尤为如此。在之前章节中，我们已经学习了 `Async Rust` 的方方面面，现在来将这些知识融会贯通，最终实现一个并发 Web 服务器。

## 多线程版本的 Web 服务器

在正式开始前，先来看一个单线程版本的 `Web` 服务器，该例子来源于 [`Rust Book`](https://doc.rust-lang.org/book/ch20-01-single-threaded.html) 一书。

`src/main.rs`:

```rust
use std::fs;
use std::io::prelude::*;
use std::net::TcpListener;
use std::net::TcpStream;

fn main() {
    // 监听本地端口 7878 ，等待 TCP 连接的建立
    let listener = TcpListener::bind("127.0.0.1:7878").unwrap();

    // 阻塞等待请求的进入
    for stream in listener.incoming() {
        let stream = stream.unwrap();

        handle_connection(stream);
    }
}

fn handle_connection(mut stream: TcpStream) {
    // 从连接中顺序读取 1024 字节数据
    let mut buffer = [0; 1024];
    stream.read(&mut buffer).unwrap();

    let get = b"GET / HTTP/1.1\r\n";


    // 处理HTTP协议头，若不符合则返回404和对应的`html`文件
    let (status_line, filename) = if buffer.starts_with(get) {
        ("HTTP/1.1 200 OK\r\n\r\n", "hello.html")
    } else {
        ("HTTP/1.1 404 NOT FOUND\r\n\r\n", "404.html")
    };
    let contents = fs::read_to_string(filename).unwrap();

    // 将回复内容写入连接缓存中
    let response = format!("{status_line}{contents}");
    stream.write_all(response.as_bytes()).unwrap();
    // 使用flush将缓存中的内容发送到客户端
    stream.flush().unwrap();
}
```

`hello.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Hello!</title>
  </head>
  <body>
    <h1>Hello!</h1>
    <p>Hi from Rust</p>
  </body>
</html>
```

`404.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Hello!</title>
  </head>
  <body>
    <h1>Oops!</h1>
    <p>Sorry, I don't know what you're asking for.</p>
  </body>
</html>
```

运行以上代码，并从浏览器访问 `127.0.0.1:7878` 你将看到一条来自 `Ferris` 的问候。

在回忆了单线程版本该如何实现后，我们也将进入正题，一起来实现一个基于 `async` 的异步 Web 服务器。

## 运行异步代码

一个 Web 服务器必须要能并发的处理大量来自用户的请求，也就是我们不能在处理完上一个用户的请求后，再处理下一个用户的请求。上面的单线程版本可以修改为多线程甚至于线程池来实现并发处理，但是线程还是太重了，使用 `async` 实现 `Web` 服务器才是最适合的。

首先将 `handle_connection` 修改为 `async` 实现:

```rust
async fn handle_connection(mut stream: TcpStream) {
    //<-- snip -->
}
```

该修改会将函数的返回值从 `()` 变成 `Future<Output=()>` ，因此直接运行将不再有任何效果，只用通过`.await`或执行器的`poll`调用后才能获取 `Future` 的结果。

在之前的代码中，我们使用了自己实现的简单的执行器来进行`.await` 或 `poll` ，实际上这只是为了学习原理，**在实际项目中，需要选择一个三方的 `async` 运行时来实现相关的功能**。 具体的选择我们将在下一章节进行讲解，现在先选择 `async-std` ，该包的最大优点就是跟标准库的 API 类似，相对来说更简单易用。

#### 使用 async-std 作为异步运行时

下面的例子将演示如何使用一个异步运行时`async-std`来让之前的 `async fn` 函数运行起来，该运行时允许使用属性 `#[async_std::main]` 将我们的 `fn main` 函数变成 `async fn main` ，这样就可以在 `main` 函数中直接调用其它 `async` 函数，否则你得用之前章节的 `block_on` 方法来让 `main` 去阻塞等待异步函数的完成，但是这种简单粗暴的阻塞等待方式并不灵活。

修改 `Cargo.toml` 添加 `async-std` 包并开启相应的属性:

```toml
[dependencies]
futures = "0.3"

[dependencies.async-std]
version = "1.6"
features = ["attributes"]
```

下面将 `main` 函数修改为异步的，并在其中调用前面修改的异步版本 `handle_connection` :

```rust
#[async_std::main]
async fn main() {
    let listener = TcpListener::bind("127.0.0.1:7878").unwrap();
    for stream in listener.incoming() {
        let stream = stream.unwrap();
        // 警告，这里无法并发
        handle_connection(stream).await;
    }
}
```

**上面的代码虽然已经是异步的，实际上它还无法并发**，原因我们后面会解释，先来模拟一下慢请求:

```rust
use async_std::task;

async fn handle_connection(mut stream: TcpStream) {
    let mut buffer = [0; 1024];
    stream.read(&mut buffer).unwrap();

    let get = b"GET / HTTP/1.1\r\n";
    let sleep = b"GET /sleep HTTP/1.1\r\n";

    let (status_line, filename) = if buffer.starts_with(get) {
        ("HTTP/1.1 200 OK\r\n\r\n", "hello.html")
    } else if buffer.starts_with(sleep) {
        task::sleep(Duration::from_secs(5)).await;
        ("HTTP/1.1 200 OK\r\n\r\n", "hello.html")
    } else {
        ("HTTP/1.1 404 NOT FOUND\r\n\r\n", "404.html")
    };
    let contents = fs::read_to_string(filename).unwrap();

    let response = format!("{status_line}{contents}");
    stream.write(response.as_bytes()).unwrap();
    stream.flush().unwrap();
}
```

上面是全新实现的 `handle_connection` ，它会在内部睡眠 5 秒，模拟一次用户慢请求，需要注意的是，我们并没有使用 `std::thread::sleep` 进行睡眠，原因是该函数是阻塞的，它会让当前线程陷入睡眠中，导致其它任务无法继续运行！因此我们需要一个睡眠函数 `async_std::task::sleep`，它仅会让当前的任务陷入睡眠，然后该任务会让出线程的控制权，这样线程就可以继续运行其它任务。

因此，光把函数变成 `async` 往往是不够的，还需要将它内部的代码也都变成异步兼容的，阻塞线程绝对是不可行的。

现在运行服务器，并访问 `127.0.0.1:7878/sleep`， 你会发现只有在完成第一个用户请求(5 秒后)，才能开始处理第二个用户请求。现在再来看看该如何解决这个问题，让请求并发起来。

## 并发地处理连接

上面代码最大的问题是 `listener.incoming()` 是阻塞的迭代器。当 `listener` 在等待连接时，执行器是无法执行其它`Future`的，而且只有在我们处理完已有的连接后，才能接收新的连接。

解决方法是将 `listener.incoming()` 从一个阻塞的迭代器变成一个非阻塞的 `Stream`， 后者在前面章节有过专门介绍：

```rust
use async_std::net::TcpListener;
use async_std::net::TcpStream;
use futures::stream::StreamExt;

#[async_std::main]
async fn main() {
    let listener = TcpListener::bind("127.0.0.1:7878").await.unwrap();
    listener
        .incoming()
        .for_each_concurrent(/* limit */ None, |tcpstream| async move {
            let tcpstream = tcpstream.unwrap();
            handle_connection(tcpstream).await;
        })
        .await;
}
```

异步版本的 `TcpListener` 为 `listener.incoming()` 实现了 `Stream` 特征，以上修改有两个好处:

- `listener.incoming()` 不再阻塞
- 使用 `for_each_concurrent` 并发地处理从 `Stream` 获取的元素

现在上面的实现的关键在于 `handle_connection` 不能再阻塞:

```rust
use async_std::prelude::*;

async fn handle_connection(mut stream: TcpStream) {
    let mut buffer = [0; 1024];
    stream.read(&mut buffer).await.unwrap();

    //<-- snip -->
    stream.write(response.as_bytes()).await.unwrap();
    stream.flush().await.unwrap();
}
```

在将数据读写改造成异步后，现在该函数也彻底变成了异步的版本，因此一次慢请求不再会阻止其它请求的运行。

## 使用多线程并行处理请求

聪明的读者不知道有没有发现，之前的例子有一个致命的缺陷：只能使用一个线程并发的处理用户请求。是的，这样也可以实现并发，一秒处理几千次请求问题不大，但是这毕竟没有利用上 CPU 的多核并行能力，无法实现性能最大化。

`async` 并发和多线程其实并不冲突，而 `async-std` 包也允许我们使用多个线程去处理，由于 `handle_connection` 实现了 `Send` 特征且不会阻塞，因此使用 `async_std::task::spawn` 是非常安全的:

```rust
use async_std::task::spawn;

#[async_std::main]
async fn main() {
    let listener = TcpListener::bind("127.0.0.1:7878").await.unwrap();
    listener
        .incoming()
        .for_each_concurrent(/* limit */ None, |stream| async move {
            let stream = stream.unwrap();
            spawn(handle_connection(stream));
        })
        .await;
}
```

至此，我们实现了同时使用并行(多线程)和并发( `async` )来同时处理多个请求！

## 测试 handle_connection 函数

对于测试 Web 服务器，使用集成测试往往是最简单的，但是在本例子中，将使用单元测试来测试连接处理函数的正确性。

为了保证单元测试的隔离性和确定性，我们使用 `MockTcpStream` 来替代 `TcpStream` 。首先，修改 `handle_connection` 的函数签名让测试更简单，之所以可以修改签名，原因在于 `async_std::net::TcpStream` 实际上并不是必须的，只要任何结构体实现了 `async_std::io::Read`, `async_std::io::Write` 和 `marker::Unpin` 就可以替代它：

```rust
use std::marker::Unpin;
use async_std::io::{Read, Write};

async fn handle_connection(mut stream: impl Read + Write + Unpin) {
```

下面，来构建一个 mock 的 `TcpStream` 并实现了上面这些特征，它包含一些数据，这些数据将被拷贝到 `read` 缓存中, 然后返回 `Poll::Ready` 说明 `read` 已经结束：

```rust
use super::*;
use futures::io::Error;
use futures::task::{Context, Poll};

use std::cmp::min;
use std::pin::Pin;

struct MockTcpStream {
    read_data: Vec<u8>,
    write_data: Vec<u8>,
}

impl Read for MockTcpStream {
    fn poll_read(
        self: Pin<&mut Self>,
        _: &mut Context,
        buf: &mut [u8],
    ) -> Poll<Result<usize, Error>> {
        let size: usize = min(self.read_data.len(), buf.len());
        buf[..size].copy_from_slice(&self.read_data[..size]);
        Poll::Ready(Ok(size))
    }
}
```

`Write`的实现也类似，需要实现三个方法 : `poll_write`, `poll_flush`, 与 `poll_close`。 `poll_write` 会拷贝输入数据到 mock 的 `TcpStream` 中，当完成后返回 `Poll::Ready`。由于 `TcpStream` 无需 `flush` 和 `close`，因此另两个方法直接返回 `Poll::Ready` 即可。

```rust
impl Write for MockTcpStream {
    fn poll_write(
        mut self: Pin<&mut Self>,
        _: &mut Context,
        buf: &[u8],
    ) -> Poll<Result<usize, Error>> {
        self.write_data = Vec::from(buf);

        Poll::Ready(Ok(buf.len()))
    }

    fn poll_flush(self: Pin<&mut Self>, _: &mut Context) -> Poll<Result<(), Error>> {
        Poll::Ready(Ok(()))
    }

    fn poll_close(self: Pin<&mut Self>, _: &mut Context) -> Poll<Result<(), Error>> {
        Poll::Ready(Ok(()))
    }
}
```

最后，我们的 mock 需要实现 `Unpin` 特征，表示它可以在内存中安全的移动，具体内容在[前面章节](https://course.rs/async-rust/async/pin-unpin.html)有讲。

```rust
use std::marker::Unpin;
impl Unpin for MockTcpStream {}
```

现在可以准备开始测试了，在使用初始化数据设置好 `MockTcpStream` 后，我们可以使用 `#[async_std::test]` 来运行 `handle_connection` 函数，该函数跟 `#[async_std::main]` 的作用类似。为了确保 `handle_connection` 函数正确工作，需要根据初始化数据检查正确的数据被写入到 `MockTcpStream` 中。

```rust
use std::fs;

#[async_std::test]
async fn test_handle_connection() {
    let input_bytes = b"GET / HTTP/1.1\r\n";
    let mut contents = vec![0u8; 1024];
    contents[..input_bytes.len()].clone_from_slice(input_bytes);
    let mut stream = MockTcpStream {
        read_data: contents,
        write_data: Vec::new(),
    };

    handle_connection(&mut stream).await;
    let mut buf = [0u8; 1024];
    stream.read(&mut buf).await.unwrap();

    let expected_contents = fs::read_to_string("hello.html").unwrap();
    let expected_response = format!("HTTP/1.1 200 OK\r\n\r\n{}", expected_contents);
    assert!(stream.write_data.starts_with(expected_response.as_bytes()));
}
```
