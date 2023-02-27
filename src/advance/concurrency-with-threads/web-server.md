# 实践应用：多线程Web服务器

一般来说，现代化的 web 服务器往往都基于更加轻量级的协程或 async/await 等模式实现，但是基于本章的内容，我们还是采取较为传统的多线程的方式来实现，即：一个请求连接分配一个线程去独立处理，当然还有升级版的线程池。

在本章中你将了解：

1. 学习一点 TCP 和 HTTP
2. 在套接字 socket 上监听进入的 TCP 连接
3. 解析 HTTP 请求
4. 创建合适的 HTTP 应答
5. 使用线程池来提升 web 服务器的吞吐量

> 本章的实现方法并不是在 Rust 中实现 Web 服务器的最佳方法，后续章节的 async/await 会更加适合!

## 构建单线程 Web 服务器

在开始之前先来简单回顾下构建所需的网络协议: HTTP 和 TCP。这两种协议都是请求-应答模式的网络协议，意味着在客户端发起请求后，服务器会监听并处理进入的请求，最后给予应答，至于这个过程怎么进行，取决于具体的协议定义。

与 HTTP 有所不同， TCP 是一个底层协议，它仅描述客户端传递了信息给服务器，至于这个信息长什么样，怎么解析处理，则不在该协议的职责范畴内。

而 HTTP 协议是更高层的通信协议，一般来说都基于 TCP 来构建 (HTTP/3 是基于 UDP 构建的协议)，更高层的协议也意味着它会对传输的信息进行解析处理。

更加深入的学习网络协议并不属于本书的范畴，因此让我们从如何读取 TCP 传输的字节流开始吧。

### 监听 TCP 连接

先来创建一个全新的项目:

```shell
$ cargo new hello
     Created binary (application) `hello` project
$ cd hello
```

接下来，使用 `std::net` 模块监听进入的请求连接，IP和端口是 `127.0.0.1:7878` 。

```rust
use std::net::TcpListener;

fn main() {
    // 监听地址: 127.0.0.1:7878
    let listener = TcpListener::bind("127.0.0.1:7878").unwrap();

    for stream in listener.incoming() {
        let stream = stream.unwrap();

        println!("Connection established!");
    }
}
```

选择 `7878` 端口的原因是，`80` 和 `8080` 往往都被 HTTP 服务器霸占，因此我们需要选择一个跟已经监听的端口不冲突的。

`bind` 非常类似 `new` ，它返回一个 `TcpListener` 实例，只不过我们一般都说 "绑定到某个端口"，因此 `bind` 这个名称会更合适。

`unwrap` 的使用是因为 `bind` 返回 `Result<T,E>`，毕竟监听是有可能报错的，例如：如果要监听 `80` 端口往往需要管理员权限；监听了同样的端口，等等。

`incoming` 会返回一个迭代器，它每一次迭代都会返回一个新的连接 `steam`(客户端发起，web服务器监听接收)，因此，接下来要做的就是从 `steam` 中读取数据，然后返回处理后的结果。

细心的同学可能会注意到，代码中对 `stream` 还进行了一次 `unwrap` 处理，原因在于我们并不是在迭代一个一个连接，而是在迭代处理一个一个请求建立连接的尝试，而这种尝试可能会失败！例如，操作系统的最大连接数限制。

现在，启动服务器，然后在你的浏览器中，访问地址 `127.0.0.1:7878`，这时应该会看到一条错误信息，类似: "Connection reset"，毕竟我们的服务器目前只是接收了连接，并没有回复任何数据。

```shell
$ cargo run
   Running `target/debug/hello`
Connection established!
Connection established!
Connection established!
```

无论浏览器怎么摆烂，我们的服务器还是成功打出了信息：TCP 连接已经成功建立。

可能大家会疑问，为啥在浏览器访问一次，可能会在终端打印出多次请求建立的信息，难道不是应该一一对应吗？原因在于当 `stream` 超出作用域时，回触发 `drop` 的扫尾工作，其中包含了关闭连接。但是，浏览器可能会存在自动重试的情况，因此还会重新建立连接，最终打印了多次。

由于 `listener.incoming` 会在当前阻塞式监听，也就是 `main` 线程会被阻塞，我们最后需要通过 `ctrl + c` 来结束程序进程。

### 读取请求

连接建立后，就可以开始读取客户端传来的数据:

```rust
use std::{
    io::{prelude::*, BufReader},
    net::{TcpListener, TcpStream},
};

fn main() {
    let listener = TcpListener::bind("127.0.0.1:7878").unwrap();

    for stream in listener.incoming() {
        let stream = stream.unwrap();

        handle_connection(stream);
    }
}

fn handle_connection(mut stream: TcpStream) {
    let buf_reader = BufReader::new(&mut stream);
    let http_request: Vec<_> = buf_reader
        .lines()
        .map(|result| result.unwrap())
        .take_while(|line| !line.is_empty())
        .collect();

    println!("Request: {:#?}", http_request);
}
```

这段代码有几点值得注意:

- 引入 `std::io::prelude` 和 `std::io::BufReader` 是引入相应的特征和类型，帮助我们读取和写入数据
- `BufReader` 可以实现缓冲区读取，底层其实是基于 `std::io::Read` 实现
- 可以使用 `lines` 方法来获取一个迭代器，可以对传输的内容流进行按行迭代读取，要使用该方法，必须先引入 `std::io::BufRead`
- 最后使用 `collecto` 消费掉迭代器，最终客户端发来的请求数据被存到 `http_request` 这个动态数组中

大家可能会比较好奇，该如何判断客户端发来的 HTTP 数据是否读取完成，答案就在于客户端会在请求数据的结尾附上两个换行符，当我们检测到某一行字符串为空时，就意味着请求数据已经传输完毕，可以 `collect` 了。

来运行下试试:

```shell
$ cargo run
   Compiling hello v0.1.0 (file:///projects/hello)
    Finished dev [unoptimized + debuginfo] target(s) in 0.42s
     Running `target/debug/hello`
Request: [
    "GET / HTTP/1.1",
    "Host: 127.0.0.1:7878",
    "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:99.0) Gecko/20100101 Firefox/99.0",
    "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language: en-US,en;q=0.5",
    "Accept-Encoding: gzip, deflate, br",
    "DNT: 1",
    "Connection: keep-alive",
    "Upgrade-Insecure-Requests: 1",
    "Sec-Fetch-Dest: document",
    "Sec-Fetch-Mode: navigate",
    "Sec-Fetch-Site: none",
    "Sec-Fetch-User: ?1",
    "Cache-Control: max-age=0",
]
```

呦，还挺长的，是不是长得很像我们以前见过的 HTTP 请求 JSON，来简单分析下。

### HTTP 请求长啥样

