# 解析数据帧
现在，鉴于大家已经掌握了 Tokio 的基本 I/O 用法，我们可以开始实现 `mini-redis` 的帧 `frame`。通过帧可以将字节流转换成帧组成的流。每个帧就是一个数据单元，例如客户端发送的一次请求就是一个帧。
```rust
use bytes::Bytes;

enum Frame {
    Simple(String),
    Error(String),
    Integer(u64),
    Bulk(Bytes),
    Null,
    Array(Vec<Frame>),
}
```

可以看到帧除了数据之外，并不具备任何语义。命令解析和实现会在更高的层次进行(相比帧解析层）。我们再来通过 HTTP 的帧来帮大家加深下相关的理解：
```rust
enum HttpFrame {
    RequestHead {
        method: Method,
        uri: Uri,
        version: Version,
        headers: HeaderMap,
    },
    ResponseHead {
        status: StatusCode,
        version: Version,
        headers: HeaderMap,
    },
    BodyChunk {
        chunk: Bytes,
    },
}
```

为了实现 `mini-redis` 的帧，我们需要一个 `Connection` 结构体，里面包含了一个 `TcpStream` 以及对帧进行读写的方法:
```rust
use tokio::net::TcpStream;
use mini_redis::{Frame, Result};

struct Connection {
    stream: TcpStream,
    // ... 这里定义其它字段
}

impl Connection {
    /// 从连接读取一个帧
    /// 
    /// 如果遇到EOF，则返回 None
    pub async fn read_frame(&mut self)
        -> Result<Option<Frame>>
    {
      // 具体实现
    }

    /// 将帧写入到连接中
    pub async fn write_frame(&mut self, frame: &Frame)
        -> Result<()>
    {
        // 具体实现
    }
}
```

关于Redis协议的说明，可以看看[官方文档](https://redis.io/topics/protocol)，`Connection` 代码的完整实现见[这里](https://github.com/tokio-rs/mini-redis/blob/tutorial/src/connection.rs).

## 缓冲读取(Buffered Reads)
`read_frame` 方法会等到一个完整的帧都读取完毕后才返回，与之相比，它底层调用的`TcpStream::read` 只会返回任意多的数据(填满传入的缓冲区 buffer )，它可能返回帧的一部分、一个帧、多个帧，总之这种读取行为是不确定的。

当 `read_frame` 的底层调用 `TcpStream::read` 读取到部分帧时，会将数据先缓冲起来，接着继续等待并读取数据。如果读到多个帧，那第一个帧会被返回，然后剩下的数据依然被缓冲起来，等待下一次 `read_frame` 被调用。

为了实现这种功能，我们需要为 `Connection` 增加一个读取缓冲区。数据首先从 `socket` 中读取到缓冲区中，接着这些数据会被解析为帧，当一个帧被解析后，该帧对应的数据会从缓冲区被移除。

这里使用 [`BytesMut`](https://docs.rs/bytes/1/bytes/struct.BytesMut.html) 作为缓冲区类型，它是 [`Bytes`](https://docs.rs/bytes/1/bytes/struct.Bytes.html) 的可变版本。

```rust
use bytes::BytesMut;
use tokio::net::TcpStream;

pub struct Connection {
    stream: TcpStream,
    buffer: BytesMut,
}

impl Connection {
    pub fn new(stream: TcpStream) -> Connection {
        Connection {
            stream,
            // 分配一个缓冲区，具有4kb的缓冲长度
            buffer: BytesMut::with_capacity(4096),
        }
    }
}
```

接下来，实现 `read_frame` 方法:
```rust
use tokio::io::AsyncReadExt;
use bytes::Buf;
use mini_redis::Result;

pub async fn read_frame(&mut self)
    -> Result<Option<Frame>>
{
    loop {
        // 尝试从缓冲区的数据中解析出一个数据帧，
        // 只有当数据足够被解析时，才返回对应的帧
        if let Some(frame) = self.parse_frame()? {
            return Ok(Some(frame));
        }

        // 如果缓冲区中的数据还不足以被解析为一个数据帧，
        // 那么我们需要从 socket 中读取更多的数据
        //
        // 读取成功时，会返回读取到的字节数，0 代表着读到了数据流的末尾
        if 0 == self.stream.read_buf(&mut self.buffer).await? {
            // 代码能执行到这里，说明了对端关闭了连接，
            // 需要看看缓冲区是否还有数据，若没有数据，说明所有数据成功被处理，
            // 若还有数据，说明对端在发送帧的过程中断开了连接，导致只发送了部分数据
            if self.buffer.is_empty() {
                return Ok(None);
            } else {
                return Err("connection reset by peer".into());
            }
        }
    }
}
```

`read_frame` 内部使用循环的方式读取数据，直到一个完整的帧被读取到时，才会返回。当然，当远程的对端关闭了连接后，也会返回。

#### `Buf` 特征
在上面的 `read_frame` 方法中，我们使用了 `read_buf` 来读取 socket 中的数据，该方法的参数是来自 [`bytes`](https://docs.rs/bytes/) 包的 `BufMut`。

可以先来考虑下该如何使用 `read()` 和 `Vec<u8>` 来实现同样的功能 :
```rust
use tokio::net::TcpStream;

pub struct Connection {
    stream: TcpStream,
    buffer: Vec<u8>,
    cursor: usize,
}

impl Connection {
    pub fn new(stream: TcpStream) -> Connection {
        Connection {
            stream,
            // 4kb 大小的缓冲区
            buffer: vec![0; 4096],
            cursor: 0,
        }
    }
}
```

下面是相应的 `read_frame` 方法:
```rust
use mini_redis::{Frame, Result};

pub async fn read_frame(&mut self)
    -> Result<Option<Frame>>
{
    loop {
        if let Some(frame) = self.parse_frame()? {
            return Ok(Some(frame));
        }

        // 确保缓冲区长度足够
        if self.buffer.len() == self.cursor {
            // 若不够，需要增加缓冲区长度
            self.buffer.resize(self.cursor * 2, 0);
        }

        // 从游标位置开始将数据读入缓冲区
        let n = self.stream.read(
            &mut self.buffer[self.cursor..]).await?;

        if 0 == n {
            if self.cursor == 0 {
                return Ok(None);
            } else {
                return Err("connection reset by peer".into());
            }
        } else {
            // 更新游标位置
            self.cursor += n;
        }
    }
}
```

在这段代码中，我们使用了非常重要的技术：通过游标( cursor )跟踪已经读取的数据，并将下次读取的数据写入到游标之后的缓冲区中，只有这样才不会让新读取的数据将之前读取的数据覆盖掉。

一旦缓冲区满了，还需要增加缓冲区的长度，这样才能继续写入数据。还有一点值得注意，在 `parse_frame` 方法的内部实现中，也需要通过游标来解析数据: `self.buffer[..self.cursor]`，通过这种方式，我们可以准确获取到目前已经读取的全部数据。

在网络编程中，通过字节数组和游标的方式读取数据是非常普遍的，因此 `bytes` 包提供了一个 `Buf` 特征，如果一个类型可以被读取数据，那么该类型需要实现 `Buf` 特征。与之对应，当一个类型可以被写入数据时，它需要实现 `BufMut` 。

当 `T: BufMut` ( 特征约束，说明类型 `T` 实现了 `BufMut` 特征 ) 被传给 `read_buf()` 方法时，缓冲区 `T` 的内部游标会自动进行更新。正因为如此，在使用了 `BufMut` 版本的 `read_frame` 中，我们并不需要管理自己的游标。

除了游标之外，`Vec<u8>` 的使用也值得关注，该缓冲区在使用时必须要被初始化: `vec![0; 4096]`，该初始化会创建一个 4096 字节长度的数组，然后将数组的每个元素都填充上 0 。当缓冲区长度不足时，新创建的缓冲区数组依然会使用 0 被重新填充一遍。 事实上，这种初始化过程会存在一定的性能开销。

与 `Vec<u8>` 相反， `BytesMut` 和 `BufMut` 就没有这个问题，它们无需被初始化，而且 `BytesMut` 还会阻止我们读取未初始化的内存。

## 帧解析
在理解了该如何读取数据后， 再来看看该如何通过两个部分解析出一个帧：

- 确保有一个完整的帧已经被写入了缓冲区，找到该帧的最后一个字节所在的位置
- 解析帧

```rust
use mini_redis::{Frame, Result};
use mini_redis::frame::Error::Incomplete;
use bytes::Buf;
use std::io::Cursor;

fn parse_frame(&mut self)
    -> Result<Option<Frame>>
{
    // 创建 `T: Buf` 类型
    let mut buf = Cursor::new(&self.buffer[..]);

    // 检查是否读取了足够解析出一个帧的数据
    match Frame::check(&mut buf) {
        Ok(_) => {
            // 获取组成该帧的字节数
            let len = buf.position() as usize;

            // 在解析开始之前，重置内部的游标位置
            buf.set_position(0);

            // 解析帧
            let frame = Frame::parse(&mut buf)?;

            // 解析完成，将缓冲区该帧的数据移除
            self.buffer.advance(len);

            // 返回解析出的帧
            Ok(Some(frame))
        }
        // 缓冲区的数据不足以解析出一个完整的帧
        Err(Incomplete) => Ok(None),
        // 遇到一个错误
        Err(e) => Err(e.into()),
    }
}
```

完整的 `Frame::check` 函数实现在[这里](https://github.com/tokio-rs/mini-redis/blob/tutorial/src/frame.rs#L63-L100)，感兴趣的同学可以看看，在这里我们不会对它进行完整的介绍。

值得一提的是, `Frame::check` 使用了 `Buf` 的字节迭代风格的 API。例如，为了解析一个帧，首先需要检查它的第一个字节，该字节用于说明帧的类型。这种首字节检查是通过 `Buf::get_u8` 函数完成的，该函数会获取游标所在位置的字节，然后将游标位置向右移动一个字节。

## 缓冲写入(Buffered writes)
关于帧操作的另一个 API 是 `write_frame(frame)` 函数，它会将一个完整的帧写入到 socket 中。 每一次写入，都会触发一次或数次系统调用，当程序中有大量的连接和写入时，系统调用的开销将变得非常高昂，具体可以看看 SyllaDB 团队写过的一篇[性能调优文章](https://www.scylladb.com/2022/01/12/async-rust-in-practice-performance-pitfalls-profiling/)。

为了降低系统调用的次数，我们需要使用一个写入缓冲区，当写入一个帧时，首先会写入该缓冲区，然后等缓冲区数据足够多时，再集中将其中的数据写入到 socket 中，这样就将多次系统调用优化减少到一次。

还有，缓冲区也不总是能提升性能。 例如，考虑一个 `bulk` 帧(多个帧放在一起组成一个bulk，通过批量发送提升效率)，该帧的特点就是：由于由多个帧组合而成，因此帧体数据可能会很大。所以我们不能将其帧体数据写入到缓冲区中，因为数据较大时，先写入缓冲区再写入 socket 会有较大的性能开销(实际上缓冲区就是为了批量写入，既然 bulk 已经是批量了，因此不使用缓冲区也很正常)。


为了实现缓冲写，我们将使用 [`BufWriter`](https://docs.rs/tokio/1/tokio/io/struct.BufWriter.html) 结构体。该结构体实现了 `AsyncWrite` 特征，当 `write` 方法被调用时，不会直接写入到 socket 中，而是先写入到缓冲区中。当缓冲区被填满时，其中的内容会自动刷到(写入到)内部的 socket 中，然后再将缓冲区清空。当然，其中还存在某些优化，通过这些优化可以绕过缓冲区直接访问 socket。

由于篇幅有限，我们不会实现完整的 `write_frame` 函数，想要看完整代码可以访问[这里](https://github.com/tokio-rs/mini-redis/blob/tutorial/src/connection.rs#L159-L184)。

首先，更新下 `Connection` 的结构体:
```rust
use tokio::io::BufWriter;
use tokio::net::TcpStream;
use bytes::BytesMut;

pub struct Connection {
    stream: BufWriter<TcpStream>,
    buffer: BytesMut,
}

impl Connection {
    pub fn new(stream: TcpStream) -> Connection {
        Connection {
            stream: BufWriter::new(stream),
            buffer: BytesMut::with_capacity(4096),
        }
    }
}
```

接着来实现 `write_frame` 函数:
```rust
use tokio::io::{self, AsyncWriteExt};
use mini_redis::Frame;

async fn write_frame(&mut self, frame: &Frame)
    -> io::Result<()>
{
    match frame {
        Frame::Simple(val) => {
            self.stream.write_u8(b'+').await?;
            self.stream.write_all(val.as_bytes()).await?;
            self.stream.write_all(b"\r\n").await?;
        }
        Frame::Error(val) => {
            self.stream.write_u8(b'-').await?;
            self.stream.write_all(val.as_bytes()).await?;
            self.stream.write_all(b"\r\n").await?;
        }
        Frame::Integer(val) => {
            self.stream.write_u8(b':').await?;
            self.write_decimal(*val).await?;
        }
        Frame::Null => {
            self.stream.write_all(b"$-1\r\n").await?;
        }
        Frame::Bulk(val) => {
            let len = val.len();

            self.stream.write_u8(b'$').await?;
            self.write_decimal(len as u64).await?;
            self.stream.write_all(val).await?;
            self.stream.write_all(b"\r\n").await?;
        }
        Frame::Array(_val) => unimplemented!(),
    }

    self.stream.flush().await;

    Ok(())
}
```

这里使用的方法由 `AsyncWriteExt` 提供，它们在 `TcpStream` 中也有对应的函数。但是在没有缓冲区的情况下最好避免使用这种逐字节的写入方式！不然，每写入几个字节就会触发一次系统调用，写完整个数据帧可能需要几十次系统调用，可以说是丧心病狂！

- `write_u8` 写入一个字节
- `write_all` 写入所有数据
- `write_decimal`由 mini-redis 提供

在函数结束前，我们还额外的调用了一次 `self.stream.flush().await`，原因是缓冲区可能还存在数据，因此需要手动刷一次数据：`flush` 的调用会将缓冲区中剩余的数据立刻写入到 socket 中。

当然，当帧比较小的时候，每写一次帧就 flush 一次的模式性能开销会比较大，此时我们可以选择在 `Connection` 中实现 `flush` 函数，然后将等帧积累多个后，再一次性在 `Connection` 中进行 flush。当然，对于我们的例子来说，简洁性是非常重要的，因此选了将 `flush` 放入到 `write_frame` 中。