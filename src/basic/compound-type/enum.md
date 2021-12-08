# 枚举


## 枚举的一些妙用

#### 归一不同类型
在实际项目中，我们有的时候会遇到用同一个函数去处理不同类型的场景，这些类型具有相似的方法，因此你可以在这个函数中用同一套代码进行处理，
但是问题是如果将这些类型传入此函数？类型该如何统一？

例如以下代码，需要在同一个函数中处理`tcp`流和`tls`流：
```rust
func new (stream: TcpStream) {
  let mut s = stream;
  if tls {
    s = negotiate_tls(stream)
  }
  
  // websocket是一个WebSocket<TcpStream>或者
  //   WebSocket<native_tls::TlsStream<TcpStream>>类型
  websocket = WebSocket::from_raw_socket(
    stream, ......)
}
```

因此，我们需要一个类型既能支持TcpStream，又能支持TlsStream，此时即可借用枚举类型来实现：
```rust
enum Websocket {
  Tcp(Websocket<TcpStream>),
  Tls(Websocket<native_tls::TlsStream<TcpStream>>),
}
```