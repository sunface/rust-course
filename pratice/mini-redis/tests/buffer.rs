use mini_redis::{buffer, client, server};
use std::net::SocketAddr;
use tokio::net::TcpListener;
use tokio::task::JoinHandle;

/// A basic "hello world" style test. A server instance is started in a
/// background task. A client instance is then established and used to intialize
/// the buffer. Set and get commands are sent to the server. The response is
/// then evaluated.
#[tokio::test]
async fn pool_key_value_get_set() {
    let (addr, _) = start_server().await;

    let client = client::connect(addr).await.unwrap();
    let mut client = buffer(client);

    client.set("hello", "world".into()).await.unwrap();

    let value = client.get("hello").await.unwrap().unwrap();
    assert_eq!(b"world", &value[..])
}

async fn start_server() -> (SocketAddr, JoinHandle<()>) {
    let listener = TcpListener::bind("127.0.0.1:0").await.unwrap();
    let addr = listener.local_addr().unwrap();

    let handle = tokio::spawn(async move { server::run(listener, tokio::signal::ctrl_c()).await });

    (addr, handle)
}
