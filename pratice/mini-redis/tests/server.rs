use mini_redis::server;

use std::net::SocketAddr;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::{TcpListener, TcpStream};
use tokio::time::{self, Duration};

/// A basic "hello world" style test. A server instance is started in a
/// background task. A client TCP connection is then established and raw redis
/// commands are sent to the server. The response is evaluated at the byte
/// level.
#[tokio::test]
async fn key_value_get_set() {
    let addr = start_server().await;

    // Establish a connection to the server
    let mut stream = TcpStream::connect(addr).await.unwrap();

    // Get a key, data is missing
    stream
        .write_all(b"*2\r\n$3\r\nGET\r\n$5\r\nhello\r\n")
        .await
        .unwrap();

    // Read nil response
    let mut response = [0; 5];
    stream.read_exact(&mut response).await.unwrap();
    assert_eq!(b"$-1\r\n", &response);

    // Set a key
    stream
        .write_all(b"*3\r\n$3\r\nSET\r\n$5\r\nhello\r\n$5\r\nworld\r\n")
        .await
        .unwrap();

    // Read OK
    let mut response = [0; 5];
    stream.read_exact(&mut response).await.unwrap();
    assert_eq!(b"+OK\r\n", &response);

    // Get the key, data is present
    stream
        .write_all(b"*2\r\n$3\r\nGET\r\n$5\r\nhello\r\n")
        .await
        .unwrap();

    // Shutdown the write half
    stream.shutdown().await.unwrap();

    // Read "world" response
    let mut response = [0; 11];
    stream.read_exact(&mut response).await.unwrap();
    assert_eq!(b"$5\r\nworld\r\n", &response);

    // Receive `None`
    assert_eq!(0, stream.read(&mut response).await.unwrap());
}

/// Similar to the basic key-value test, however, this time timeouts will be
/// tested. This test demonstrates how to test time related behavior.
///
/// When writing tests, it is useful to remove sources of non-determinism. Time
/// is a source of non-determinism. Here, we "pause" time using the
/// `time::pause()` function. This function is available with the `test-util`
/// feature flag. This allows us to deterministically control how time appears
/// to advance to the application.
#[tokio::test]
async fn key_value_timeout() {
    tokio::time::pause();

    let addr = start_server().await;

    // Establish a connection to the server
    let mut stream = TcpStream::connect(addr).await.unwrap();

    // Set a key
    stream
        .write_all(
            b"*5\r\n$3\r\nSET\r\n$5\r\nhello\r\n$5\r\nworld\r\n\
                     +EX\r\n:1\r\n",
        )
        .await
        .unwrap();

    let mut response = [0; 5];

    // Read OK
    stream.read_exact(&mut response).await.unwrap();

    assert_eq!(b"+OK\r\n", &response);

    // Get the key, data is present
    stream
        .write_all(b"*2\r\n$3\r\nGET\r\n$5\r\nhello\r\n")
        .await
        .unwrap();

    // Read "world" response
    let mut response = [0; 11];

    stream.read_exact(&mut response).await.unwrap();

    assert_eq!(b"$5\r\nworld\r\n", &response);

    // Wait for the key to expire
    time::advance(Duration::from_secs(1)).await;

    // Get a key, data is missing
    stream
        .write_all(b"*2\r\n$3\r\nGET\r\n$5\r\nhello\r\n")
        .await
        .unwrap();

    // Read nil response
    let mut response = [0; 5];

    stream.read_exact(&mut response).await.unwrap();

    assert_eq!(b"$-1\r\n", &response);
}

#[tokio::test]
async fn pub_sub() {
    let addr = start_server().await;

    let mut publisher = TcpStream::connect(addr).await.unwrap();

    // Publish a message, there are no subscribers yet so the server will
    // return `0`.
    publisher
        .write_all(b"*3\r\n$7\r\nPUBLISH\r\n$5\r\nhello\r\n$5\r\nworld\r\n")
        .await
        .unwrap();

    let mut response = [0; 4];
    publisher.read_exact(&mut response).await.unwrap();
    assert_eq!(b":0\r\n", &response);

    // Create a subscriber. This subscriber will only subscribe to the `hello`
    // channel.
    let mut sub1 = TcpStream::connect(addr).await.unwrap();
    sub1.write_all(b"*2\r\n$9\r\nSUBSCRIBE\r\n$5\r\nhello\r\n")
        .await
        .unwrap();

    // Read the subscribe response
    let mut response = [0; 34];
    sub1.read_exact(&mut response).await.unwrap();
    assert_eq!(
        &b"*3\r\n$9\r\nsubscribe\r\n$5\r\nhello\r\n:1\r\n"[..],
        &response[..]
    );

    // Publish a message, there now is a subscriber
    publisher
        .write_all(b"*3\r\n$7\r\nPUBLISH\r\n$5\r\nhello\r\n$5\r\nworld\r\n")
        .await
        .unwrap();

    let mut response = [0; 4];
    publisher.read_exact(&mut response).await.unwrap();
    assert_eq!(b":1\r\n", &response);

    // The first subscriber received the message
    let mut response = [0; 39];
    sub1.read_exact(&mut response).await.unwrap();
    assert_eq!(
        &b"*3\r\n$7\r\nmessage\r\n$5\r\nhello\r\n$5\r\nworld\r\n"[..],
        &response[..]
    );

    // Create a second subscriber
    //
    // This subscriber will be subscribed to both `hello` and `foo`
    let mut sub2 = TcpStream::connect(addr).await.unwrap();
    sub2.write_all(b"*3\r\n$9\r\nSUBSCRIBE\r\n$5\r\nhello\r\n$3\r\nfoo\r\n")
        .await
        .unwrap();

    // Read the subscribe response
    let mut response = [0; 34];
    sub2.read_exact(&mut response).await.unwrap();
    assert_eq!(
        &b"*3\r\n$9\r\nsubscribe\r\n$5\r\nhello\r\n:1\r\n"[..],
        &response[..]
    );
    let mut response = [0; 32];
    sub2.read_exact(&mut response).await.unwrap();
    assert_eq!(
        &b"*3\r\n$9\r\nsubscribe\r\n$3\r\nfoo\r\n:2\r\n"[..],
        &response[..]
    );

    // Publish another message on `hello`, there are two subscribers
    publisher
        .write_all(b"*3\r\n$7\r\nPUBLISH\r\n$5\r\nhello\r\n$5\r\njazzy\r\n")
        .await
        .unwrap();

    let mut response = [0; 4];
    publisher.read_exact(&mut response).await.unwrap();
    assert_eq!(b":2\r\n", &response);

    // Publish a message on `foo`, there is only one subscriber
    publisher
        .write_all(b"*3\r\n$7\r\nPUBLISH\r\n$3\r\nfoo\r\n$3\r\nbar\r\n")
        .await
        .unwrap();

    let mut response = [0; 4];
    publisher.read_exact(&mut response).await.unwrap();
    assert_eq!(b":1\r\n", &response);

    // The first subscriber received the message
    let mut response = [0; 39];
    sub1.read_exact(&mut response).await.unwrap();
    assert_eq!(
        &b"*3\r\n$7\r\nmessage\r\n$5\r\nhello\r\n$5\r\njazzy\r\n"[..],
        &response[..]
    );

    // The second subscriber received the message
    let mut response = [0; 39];
    sub2.read_exact(&mut response).await.unwrap();
    assert_eq!(
        &b"*3\r\n$7\r\nmessage\r\n$5\r\nhello\r\n$5\r\njazzy\r\n"[..],
        &response[..]
    );

    // The first subscriber **did not** receive the second message
    let mut response = [0; 1];
    time::timeout(Duration::from_millis(100), sub1.read(&mut response))
        .await
        .unwrap_err();

    // The second subscriber **did** receive the message
    let mut response = [0; 35];
    sub2.read_exact(&mut response).await.unwrap();
    assert_eq!(
        &b"*3\r\n$7\r\nmessage\r\n$3\r\nfoo\r\n$3\r\nbar\r\n"[..],
        &response[..]
    );
}

#[tokio::test]
async fn manage_subscription() {
    let addr = start_server().await;

    let mut publisher = TcpStream::connect(addr).await.unwrap();

    // Create a subscriber
    let mut sub = TcpStream::connect(addr).await.unwrap();
    sub.write_all(b"*2\r\n$9\r\nSUBSCRIBE\r\n$5\r\nhello\r\n")
        .await
        .unwrap();

    // Read the subscribe response
    let mut response = [0; 34];
    sub.read_exact(&mut response).await.unwrap();
    assert_eq!(
        &b"*3\r\n$9\r\nsubscribe\r\n$5\r\nhello\r\n:1\r\n"[..],
        &response[..]
    );

    // Update subscription to add `foo`
    sub.write_all(b"*2\r\n$9\r\nSUBSCRIBE\r\n$3\r\nfoo\r\n")
        .await
        .unwrap();

    let mut response = [0; 32];
    sub.read_exact(&mut response).await.unwrap();
    assert_eq!(
        &b"*3\r\n$9\r\nsubscribe\r\n$3\r\nfoo\r\n:2\r\n"[..],
        &response[..]
    );

    // Update subscription to remove `hello`
    sub.write_all(b"*2\r\n$11\r\nUNSUBSCRIBE\r\n$5\r\nhello\r\n")
        .await
        .unwrap();

    let mut response = [0; 37];
    sub.read_exact(&mut response).await.unwrap();
    assert_eq!(
        &b"*3\r\n$11\r\nunsubscribe\r\n$5\r\nhello\r\n:1\r\n"[..],
        &response[..]
    );

    // Publish a message to `hello` and then a message to `foo`
    publisher
        .write_all(b"*3\r\n$7\r\nPUBLISH\r\n$5\r\nhello\r\n$5\r\nworld\r\n")
        .await
        .unwrap();
    let mut response = [0; 4];
    publisher.read_exact(&mut response).await.unwrap();
    assert_eq!(b":0\r\n", &response);

    publisher
        .write_all(b"*3\r\n$7\r\nPUBLISH\r\n$3\r\nfoo\r\n$3\r\nbar\r\n")
        .await
        .unwrap();
    let mut response = [0; 4];
    publisher.read_exact(&mut response).await.unwrap();
    assert_eq!(b":1\r\n", &response);

    // Receive the message
    // The second subscriber **did** receive the message
    let mut response = [0; 35];
    sub.read_exact(&mut response).await.unwrap();
    assert_eq!(
        &b"*3\r\n$7\r\nmessage\r\n$3\r\nfoo\r\n$3\r\nbar\r\n"[..],
        &response[..]
    );

    // No more messages
    let mut response = [0; 1];
    time::timeout(Duration::from_millis(100), sub.read(&mut response))
        .await
        .unwrap_err();

    // Unsubscribe from all channels
    sub.write_all(b"*1\r\n$11\r\nunsubscribe\r\n")
        .await
        .unwrap();

    let mut response = [0; 35];
    sub.read_exact(&mut response).await.unwrap();
    assert_eq!(
        &b"*3\r\n$11\r\nunsubscribe\r\n$3\r\nfoo\r\n:0\r\n"[..],
        &response[..]
    );
}

// In this case we test that server Responds with an Error message if a client
// sends an unknown command
#[tokio::test]
async fn send_error_unknown_command() {
    let addr = start_server().await;

    // Establish a connection to the server
    let mut stream = TcpStream::connect(addr).await.unwrap();

    // Get a key, data is missing
    stream
        .write_all(b"*2\r\n$3\r\nFOO\r\n$5\r\nhello\r\n")
        .await
        .unwrap();

    let mut response = [0; 28];

    stream.read_exact(&mut response).await.unwrap();

    assert_eq!(b"-ERR unknown command \'foo\'\r\n", &response);
}

// In this case we test that server Responds with an Error message if a client
// sends an GET or SET command after a SUBSCRIBE
#[tokio::test]
async fn send_error_get_set_after_subscribe() {
    let addr = start_server().await;

    let mut stream = TcpStream::connect(addr).await.unwrap();

    // send SUBSCRIBE command
    stream
        .write_all(b"*2\r\n$9\r\nsubscribe\r\n$5\r\nhello\r\n")
        .await
        .unwrap();

    let mut response = [0; 34];

    stream.read_exact(&mut response).await.unwrap();

    assert_eq!(
        &b"*3\r\n$9\r\nsubscribe\r\n$5\r\nhello\r\n:1\r\n"[..],
        &response[..]
    );

    stream
        .write_all(b"*3\r\n$3\r\nSET\r\n$5\r\nhello\r\n$5\r\nworld\r\n")
        .await
        .unwrap();

    let mut response = [0; 28];

    stream.read_exact(&mut response).await.unwrap();
    assert_eq!(b"-ERR unknown command \'set\'\r\n", &response);

    stream
        .write_all(b"*2\r\n$3\r\nGET\r\n$5\r\nhello\r\n")
        .await
        .unwrap();

    let mut response = [0; 28];

    stream.read_exact(&mut response).await.unwrap();
    assert_eq!(b"-ERR unknown command \'get\'\r\n", &response);
}

async fn start_server() -> SocketAddr {
    let listener = TcpListener::bind("127.0.0.1:0").await.unwrap();
    let addr = listener.local_addr().unwrap();

    tokio::spawn(async move { server::run(listener, tokio::signal::ctrl_c()).await });

    addr
}
