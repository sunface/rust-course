# I/O
本章节中我们将深入学习 Tokio 中的 I/O 操作，了解它的原理以及该如何使用。

Tokio 中的 I/O 操作和 `std` 在使用方式上几无区别，最大的区别就是前者是异步的，例如 Tokio 的读写特征分别是 `AsyncRead` 和 `AsyncWrite`:

- 有部分类型按照自己的所需实现了它们: `TcpStream`，`File`，`Stdout`
- 还有数据结构也实现了它们：`Vec<u8>`、`&[u8]`，这样就可以直接使用这些数据结构作为读写器( reader / writer)

## AsyncRead 和 AsyncWrite
这两个特征为字节流的异步读写提供了便利，通常我们会使用 `AsyncReadExt` 和 `AsyncWriteExt` 提供的工具方法，这些方法都使用 `async` 声明，且需要通过 `.await` 进行调用，

#### async fn read
 `AsyncReadExt::read` 是一个异步方法可以将数据读入缓冲区( `buffer` )中，然后返回读取的字节数。
```rust
use tokio::fs::File;
use tokio::io::{self, AsyncReadExt};

#[tokio::main]
async fn main() -> io::Result<()> {
    let mut f = File::open("foo.txt").await?;
    let mut buffer = [0; 10];

    // 由于 buffer 的长度限制，当次的 `read` 调用最多可以从文件中读取 10 个字节的数据
    let n = f.read(&mut buffer[..]).await?;

    println!("The bytes: {:?}", &buffer[..n]);
    Ok(())
}
```

需要注意的是：当 `read` 返回 `Ok(0)` 时，意味着字节流( stream )已经关闭，在这之后继续调用 `read` 会立刻完成，依然获取到返回值 `Ok(0)`。 例如，字节流如果是 `TcpStream` 类型，那 `Ok(0)` 说明该**连接的读取端已经被关闭**(写入端关闭，会报其它的错误)。

#### async fn read_to_end
`AsyncReadExt::read_to_end` 方法会从字节流中读取所有的字节，直到遇到 `EOF` ：
```rust
use tokio::io::{self, AsyncReadExt};
use tokio::fs::File;

#[tokio::main]
async fn main() -> io::Result<()> {
    let mut f = File::open("foo.txt").await?;
    let mut buffer = Vec::new();

    // 读取整个文件的内容
    f.read_to_end(&mut buffer).await?;
    Ok(())
}
```

#### async fn write
`AsyncWriteExt::write` 异步方法会尝试将缓冲区的内容写入到写入器( `writer` )中，同时返回写入的字节数:
```rust
use tokio::io::{self, AsyncWriteExt};
use tokio::fs::File;

#[tokio::main]
async fn main() -> io::Result<()> {
    let mut file = File::create("foo.txt").await?;

    let n = file.write(b"some bytes").await?;

    println!("Wrote the first {} bytes of 'some bytes'.", n);
    Ok(())
}
```

上面代码很清晰，但是大家可能会疑惑 `b"some bytes"` 是什么意思。这种写法可以将一个 `&str` 字符串转变成一个字节数组：`&[u8;10]`，然后 `write` 方法又会将这个 `&[u8;10]` 的数组类型隐式强转为数组切片: `&[u8]`。

#### async fn write_all
`AsyncWriteExt::write_all` 将缓冲区的内容全部写入到写入器中：
```rust
use tokio::io::{self, AsyncWriteExt};
use tokio::fs::File;

#[tokio::main]
async fn main() -> io::Result<()> {
    let mut file = File::create("foo.txt").await?;

    file.write_all(b"some bytes").await?;
    Ok(())
}
```

以上只是部分方法，实际上还有一些实用的方法由于篇幅有限无法列出，大家可以通过 [API 文档](https://docs.rs/tokio/latest/tokio/io/index.html) 查看完整的列表。

## 实用函数
另外，和标准库一样， `tokio::io` 模块包含了多个实用的函数或API，可以用于处理标准输入/输出/错误等。

例如，`tokio::io::copy` 异步的将读取器( `reader` )中的内容拷贝到写入器( `writer` )中。
```rust
use tokio::fs::File;
use tokio::io;

#[tokio::main]
async fn main() -> io::Result<()> {
    let mut reader: &[u8] = b"hello";
    let mut file = File::create("foo.txt").await?;

    io::copy(&mut reader, &mut file).await?;
    Ok(())
}
```

还记得我们之前提到的字节数组 `&[u8]` 实现了 `AsyncRead` 吗？正因为这个原因，所以这里可以直接将 `&u8` 用作读取器。

## 回声服务( Echo )
就如同写代码必写 `hello, world`，实现 web 服务器，往往会选择实现一个回声服务。该服务会将用户的输入内容直接返回给用户，就像回声壁一样。

具体来说，就是从用户建立的 TCP 连接的 socket 中读取到数据，然后立刻将同样的数据写回到该 socket 中。因此客户端会收到和自己发送的数据一模一样的回复。

下面我们将使用两种稍有不同的方法实现该回声服务。

#### 使用 `io::copy()`
先来创建一个新的 bin 文件，用于运行我们的回声服务：
```console
touch src/bin/echo-server-copy.rs
```

然后可以通过以下命令运行它(跟上一章节的方式相同)：
```console
cargo run --bin echo-server-copy
```

至于客户端，可以简单的使用 `telnet` 的方式来连接，或者也可以使用 `tokio::net::TcpStream`，它的[文档示例](https://docs.rs/tokio/1/tokio/net/struct.TcpStream.html#examples)非常适合大家进行参考。

先来实现一下基本的服务器框架：通过 loop 循环接收 TCP 连接，然后为每一条连接创建一个单独的任务去处理。

```rust
use tokio::io;
use tokio::net::TcpListener;

#[tokio::main]
async fn main() -> io::Result<()> {
    let listener = TcpListener::bind("127.0.0.1:6142").await?;

    loop {
        let (mut socket, _) = listener.accept().await?;

        tokio::spawn(async move {
            // 在这里拷贝数据
        });
    }
}
```

下面，来看看重头戏 `io::copy` ，它有两个参数：一个读取器，一个写入器，然后将读取器中的数据直接拷贝到写入器中，类似的实现代码如下：
```rust
io::copy(&mut socket, &mut socket).await
```

这段代码相信大家一眼就能看出问题，由于我们的读取器和写入器都是同一个 socket，因此需要对其进行两次可变借用，这明显违背了 Rust 的借用规则。

##### 分离读写器
显然，使用同一个 socket 是不行的，为了实现目标功能，必须将 `socket` 分离成一个读取器和写入器。

任何一个读写器( reader + writer )都可以使用 `io::split` 方法进行分离，最终返回一个读取器和写入器，这两者可以独自的使用，例如可以放入不同的任务中。

例如，我们的回声客户端可以这样实现，以实现同时并发读写：
```rust
use tokio::io::{self, AsyncReadExt, AsyncWriteExt};
use tokio::net::TcpStream;

#[tokio::main]
async fn main() -> io::Result<()> {
    let socket = TcpStream::connect("127.0.0.1:6142").await?;
    let (mut rd, mut wr) = io::split(socket);

    // 创建异步任务，在后台写入数据
    tokio::spawn(async move {
        wr.write_all(b"hello\r\n").await?;
        wr.write_all(b"world\r\n").await?;

        // 有时，我们需要给予 Rust 一些类型暗示，它才能正确的推导出类型
        Ok::<_, io::Error>(())
    });

    let mut buf = vec![0; 128];

    loop {
        let n = rd.read(&mut buf).await?;

        if n == 0 {
            break;
        }

        println!("GOT {:?}", &buf[..n]);
    }

    Ok(())
}
```

实际上，`io::split` 可以用于任何同时实现了 `AsyncRead` 和 `AsyncWrite` 的值，它的内部使用了 `Arc` 和 `Mutex` 来实现相应的功能。如果大家觉得这种实现有些重，可以使用 Tokio 提供的 `TcpStream`，它提供了两种方式进行分离:

- [`TcpStream::split`](https://docs.rs/tokio/1.15.0/tokio/net/struct.TcpStream.html#method.split)会获取字节流的引用，然后将其分离成一个读取器和写入器。但由于使用了引用的方式，它们俩必须和 `split` 在同一个任务中。 优点就是，这种实现没有性能开销，因为无需 `Arc` 和 `Mutex`。
- [`TcpStream::into_split`](https://docs.rs/tokio/1.15.0/tokio/net/struct.TcpStream.html#method.into_split)还提供了一种分离实现，分离出来的结果可以在任务间移动，内部是通过 `Arc` 实现


再来分析下我们的使用场景，由于 `io::copy()` 调用时所在的任务和 `split` 所在的任务是同一个，因此可以使用性能最高的 `TcpStream::split`:
```rust
tokio::spawn(async move {
    let (mut rd, mut wr) = socket.split();
    
    if io::copy(&mut rd, &mut wr).await.is_err() {
        eprintln!("failed to copy");
    }
});
```

使用 `io::copy` 实现的完整代码见[此处](https://github.com/tokio-rs/website/blob/master/tutorial-code/io/src/echo-server-copy.rs)。

#### 手动拷贝
程序员往往拥有一颗手动干翻一切的心，因此如果你不想用 `io::copy` 来简单实现，还可以自己手动去拷贝数据:
```rust
use tokio::io::{self, AsyncReadExt, AsyncWriteExt};
use tokio::net::TcpListener;

#[tokio::main]
async fn main() -> io::Result<()> {
    let listener = TcpListener::bind("127.0.0.1:6142").await?;

    loop {
        let (mut socket, _) = listener.accept().await?;

        tokio::spawn(async move {
            let mut buf = vec![0; 1024];

            loop {
                match socket.read(&mut buf).await {
                    // 返回值 `Ok(0)` 说明对端已经关闭
                    Ok(0) => return,
                    Ok(n) => {
                        // Copy the data back to socket
                        // 将数据拷贝回 socket 中
                        if socket.write_all(&buf[..n]).await.is_err() {
                            // 非预期错误，由于我们这里无需再做什么，因此直接停止处理
                            return;
                        }
                    }
                    Err(_) => {
                      // 非预期错误，由于我们无需再做什么，因此直接停止处理
                        return;
                    }
                }
            }
        });
    }
}
```

建议这段代码放入一个和之前 `io::copy` 不同的文件中 `src/bin/echo-server.rs` ， 然后使用 `cargo run --bin echo-server` 运行。

下面一起来看看这段代码有哪些值得注意的地方。首先，由于使用了 `write_all` 和 `read` 方法，需要先将对应的特征引入到当前作用域内:
```rust
use tokio::io::{self, AsyncReadExt, AsyncWriteExt};
```

##### 在堆上分配缓冲区
在上面代码中，我们需要将数据从 `socket` 中读取到一个缓冲区 `buffer` 中：
```rust
let mut buf = vec![0; 1024];
```

可以看到，此处的缓冲区是一个 `Vec` 动态数组，它的数据是存储在堆上，而不是栈上(若改成 `let mut buf = [0; 1024];`，则存储在栈上)。

在之前，我们提到过一个数据如果想在 `.await` 调用过程中存在，那它必须存储在当前任务内。在我们的代码中，`buf` 会在 `.await` 调用过程中被使用，因此它必须要存储在任务内。

若该缓冲区数组创建在栈上，那每条连接所对应的任务的内部数据结构看上去可能如下所示：
```rust
struct Task {
    task: enum {
        AwaitingRead {
            socket: TcpStream,
            buf: [BufferType],
        },
        AwaitingWriteAll {
            socket: TcpStream,
            buf: [BufferType],
        }

    }
}
```

可以看到，栈数组要被使用，就必须存储在相应的结构体内，其中两个结构体分别持有了不同的栈数组 `[BufferType]`，这种方式会导致任务结构变得很大。特别地，我们选择缓冲区长度往往会使用分页长度(page size)，因此使用栈数组会导致任务的内存大小变得很奇怪甚至糟糕：`$page-size + 一些额外的字节`。

当然，编译器会帮助我们做一些优化。例如，会进一步优化 `async` 语句块的布局，而不是像上面一样简单的使用 `enum`。在实践中，变量也不会在枚举成员间移动。

但是再怎么优化，任务的结构体至少也会跟其中的栈数组一样大，因此通常情况下，使用堆上的缓冲区会高效实用的多。

> 当任务因为调度在线程间移动时，存储在栈上的数据需要进行保存和恢复，过大的栈上变量会带来不小的数据拷贝开销
> 因此，存储大量数据的变量最好放到堆上
##### 处理EOF
当 TCP 连接的读取端关闭后，再调用 `read` 方法会返回 `Ok(0)`。此时，再继续下去已经没有意义，因此我们需要退出循环。忘记在 EOF 时退出读取循环，是网络编程中一个常见的 bug :
```rust
loop {
    match socket.read(&mut buf).await {
        Ok(0) => return,
        // ... 其余错误处理
    }
}
```

大家不妨深入思考下，如果没有退出循环会怎么样？之前我们提到过，一旦读取端关闭后，那后面的 `read` 调用就会立即返回 `Ok(0)`，而不会阻塞等待，因此这种无阻塞循环会最终导致 CPU 立刻跑到 100% ，并将一直持续下去，直到程序关闭。