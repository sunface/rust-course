# 构建单线程 Web 服务器

在开始之前先来简单回顾下构建所需的网络协议: HTTP 和 TCP。这两种协议都是请求-应答模式的网络协议，意味着在客户端发起请求后，服务器会监听并处理进入的请求，最后给予应答，至于这个过程怎么进行，取决于具体的协议定义。

与 HTTP 有所不同， TCP 是一个底层协议，它仅描述客户端传递了信息给服务器，至于这个信息长什么样，怎么解析处理，则不在该协议的职责范畴内。

而 HTTP 协议是更高层的通信协议，一般来说都基于 TCP 来构建 (HTTP/3 是基于 UDP 构建的协议)，更高层的协议也意味着它会对传输的信息进行解析处理。

更加深入的学习网络协议并不属于本书的范畴，因此让我们从如何读取 TCP 传输的字节流开始吧。

## 监听 TCP 连接

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

`incoming` 会返回一个迭代器，它每一次迭代都会返回一个新的连接 `steam`(客户端发起，web服务器监听接收)，因此，接下来要做的就是从 `stream` 中读取数据，然后返回处理后的结果。

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

## 读取请求

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

## HTTP 请求长啥样

刚才的文本挺长的，但其实符合以下的格式:

```text
Method Request-URI HTTP-Version
headers CRLF
message-body
```

- 第一行 Method 是请求的方法，例如 `GET`、`POST` 等，Request-URI 是该请求希望访问的目标资源路径，例如 `/`、`/hello/world` 等
- 类似 JSON 格式的数据都是 HTTP 请求报头 headers，例如 `"Host: 127.0.0.1:7878"`
- 至于 message-body 是消息体， 它包含了用户请求携带的具体数据，例如更改用户名的请求，就要提交新的用户名数据，至于刚才的 `GET` 请求，它是没有 message-body 的

大家可以尝试换一个浏览器再访问一次，看看不同的浏览器请求携带的 headers 是否不同。

## 请求应答

目前为止，都是在服务器端的操作，浏览器的请求依然还会报错，是时候给予相应的请求应答了，HTTP 格式类似:

```text
HTTP-Version Status-Code Reason-Phrase CRLF
headers CRLF
message-body
```

应答的格式与请求相差不大，其中 Status-Code 是最重要的，它用于告诉客户端，当前的请求是否成功，若失败，大概是什么原因，它就是著名的 HTTP 状态码，常用的有 `200`: 请求成功，`404` 目标不存在，等等。

为了帮助大家更直观的感受下应答格式第一行长什么样，下面给出一个示例:

```text
HTTP/1.1 200 OK\r\n\r\n
```

下面将该应答发送回客户端:

```rust
fn handle_connection(mut stream: TcpStream) {
    let buf_reader = BufReader::new(&mut stream);
    let http_request: Vec<_> = buf_reader
        .lines()
        .map(|result| result.unwrap())
        .take_while(|line| !line.is_empty())
        .collect();

    let response = "HTTP/1.1 200 OK\r\n\r\n";

    stream.write_all(response.as_bytes()).unwrap();
}
```

由于 `write_all` 方法接受 `&[u8]` 类型作为参数，这里需要用 `as_bytes` 将字符串转换为字节数组。

重新启动服务器，然后再观察下浏览器中的输出，这次应该不再有报错，而是一个空白页面，因为没有返回任何具体的数据( message-body )，上面只是一条最简单的符合 HTTP 格式的数据。

## 返回 HTML 页面

空白页面显然会让人不知所措，那就返回一个简单的 HTML 页面，给用户打给招呼。

在项目的根目录下创建 `hello.html` 文件并写入如下内容：

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

看得出来，这是一个非常简单的 HTML5 网页文档，基本上没人读不懂吧 ：）

```rust
use std::{
    fs,
    io::{prelude::*, BufReader},
    net::{TcpListener, TcpStream},
};
// --snip--

fn handle_connection(mut stream: TcpStream) {
    let buf_reader = BufReader::new(&mut stream);
    let http_request: Vec<_> = buf_reader
        .lines()
        .map(|result| result.unwrap())
        .take_while(|line| !line.is_empty())
        .collect();

    let status_line = "HTTP/1.1 200 OK";
    let contents = fs::read_to_string("hello.html").unwrap();
    let length = contents.len();

    let response =
        format!("{status_line}\r\nContent-Length: {length}\r\n\r\n{contents}");

    stream.write_all(response.as_bytes()).unwrap();
}
```

新修改的代码中，读取了新增 HTML 的内容，并按照 HTTP 格式，将内容传回给客户端。

具体的运行验证就不再赘述，我们再来看看如何增加一些验证和选择性回复。

> 用这么奇怪的格式返回应答数据，原因只有一个，我们在模拟实现真正的 http web 服务器框架。事实上，写逻辑代码时，只需使用现成的 web 框架( 例如 [`rocket`](https://rocket.rs) )去启动 web 服务即可，解析请求数据和返回应答数据都已经被封装在 API 中，非常简单易用


## 验证请求和选择性应答

用户想要获取他的个人信息，你给他 say hi，用户想要查看他的某篇文章内容，你给他 say hi, 好吧用户想要骂你，你还是给它 say hi。

是的，这种服务态度我们很欣赏，但是这种服务质量属实令人堪忧。因此我们要针对用户的不同请求给出相应的不同回复，让场景模拟更加真实。

```rust
fn handle_connection(mut stream: TcpStream) {
    let buf_reader = BufReader::new(&mut stream);
    let request_line = buf_reader.lines().next().unwrap().unwrap();

    if request_line == "GET / HTTP/1.1" {
        let status_line = "HTTP/1.1 200 OK";
        let contents = fs::read_to_string("hello.html").unwrap();
        let length = contents.len();

        let response = format!(
            "{status_line}\r\nContent-Length: {length}\r\n\r\n{contents}"
        );

        stream.write_all(response.as_bytes()).unwrap();
    } else {
        // some other request
    }
}
```

注意迭代器方法 `next` 的使用，原因在于我们只需要读取第一行，判断具体的 HTTP METHOD 是什么。

接着判断了用户是否请求了 `/` 根路径，如果是，返回之前的 `hello.html` 页面；如果不是...尚未实现。

重新运行服务器，如果你继续访问 `127.0.0.1:7878` ，那么看到的依然是 `hello.html` 页面，因为默认访问根路径，但是一旦换一个路径访问，例如 `127.0.0.1:7878/something-else`，那你将继续看到之前看过多次的连接错误。

下面来完善下，当用户访问根路径之外的页面时，给他展示一个友好的 404 页面( 相比直接报错 )。

```rust
    // --snip--
    } else {
        let status_line = "HTTP/1.1 404 NOT FOUND";
        let contents = fs::read_to_string("404.html").unwrap();
        let length = contents.len();

        let response = format!(
            "{status_line}\r\nContent-Length: {length}\r\n\r\n{contents}"
        );

        stream.write_all(response.as_bytes()).unwrap();
    }
```

哦对了，别忘了在根路径下创建 `404.html`并填入下面内容:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>你好!</title>
  </head>
  <body>
    <h1>很抱歉!</h1>
    <p>由于运维删库跑路，我们的数据全部丢失，总监也已经准备跑路，88</p>
  </body>
</html>
```

最后，上面的代码其实有很多重复，可以提取出来进行简单重构:

```rust
// --snip--

fn handle_connection(mut stream: TcpStream) {
    // --snip--

    let (status_line, filename) = if request_line == "GET / HTTP/1.1" {
        ("HTTP/1.1 200 OK", "hello.html")
    } else {
        ("HTTP/1.1 404 NOT FOUND", "404.html")
    };

    let contents = fs::read_to_string(filename).unwrap();
    let length = contents.len();

    let response =
        format!("{status_line}\r\nContent-Length: {length}\r\n\r\n{contents}");

    stream.write_all(response.as_bytes()).unwrap();
}
```

至此，单线程版本的服务器已经完成，但是说实话，没啥用，总不能让你的用户排队等待访问吧，那也太糟糕了...

