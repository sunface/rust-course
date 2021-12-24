use crate::client::Client;
use crate::Result;

use bytes::Bytes;
use tokio::sync::mpsc::{channel, Receiver, Sender};
use tokio::sync::oneshot;

/// Create a new client request buffer
///
/// The `Client` performs Redis commands directly on the TCP connection. Only a
/// single request may be in-flight at a given time and operations require
/// mutable access to the `Client` handle. This prevents using a single Redis
/// connection from multiple Tokio tasks.
///
/// The strategy for dealing with this class of problem is to spawn a dedicated
/// Tokio task to manage the Redis connection and using "message passing" to
/// operate on the connection. Commands are pushed into a channel. The
/// connection task pops commands off of the channel and applies them to the
/// Redis connection. When the response is received, it is forwarded to the
/// original requester.
///
/// The returned `Buffer` handle may be cloned before passing the new handle to
/// separate tasks.
pub fn buffer(client: Client) -> Buffer {
    // Setting the message limit to a hard coded value of 32. in a real-app, the
    // buffer size should be configurable, but we don't need to do that here.
    let (tx, rx) = channel(32);

    // Spawn a task to process requests for the connection.
    tokio::spawn(async move { run(client, rx).await });

    // Return the `Buffer` handle.
    Buffer { tx }
}

// Enum used to message pass the requested command from the `Buffer` handle
#[derive(Debug)]
enum Command {
    Get(String),
    Set(String, Bytes),
}

// Message type sent over the channel to the connection task.
//
// `Command` is the command to forward to the connection.
//
// `oneshot::Sender` is a channel type that sends a **single** value. It is used
// here to send the response received from the connection back to the original
// requester.
type Message = (Command, oneshot::Sender<Result<Option<Bytes>>>);

/// Receive commands sent through the channel and forward them to client. The
/// response is returned back to the caller via a `oneshot`.
async fn run(mut client: Client, mut rx: Receiver<Message>) {
    // Repeatedly pop messages from the channel. A return value of `None`
    // indicates that all `Buffer` handles have dropped and there will never be
    // another message sent on the channel.
    while let Some((cmd, tx)) = rx.recv().await {
        // The command is forwarded to the connection
        let response = match cmd {
            Command::Get(key) => client.get(&key).await,
            Command::Set(key, value) => client.set(&key, value).await.map(|_| None),
        };

        // Send the response back to the caller.
        //
        // Failing to send the message indicates the `rx` half dropped
        // before receiving the message. This is a normal runtime event.
        let _ = tx.send(response);
    }
}

#[derive(Clone)]
pub struct Buffer {
    tx: Sender<Message>,
}

impl Buffer {
    /// Get the value of a key.
    ///
    /// Same as `Client::get` but requests are **buffered** until the associated
    /// connection has the ability to send the request.
    pub async fn get(&mut self, key: &str) -> Result<Option<Bytes>> {
        // Initialize a new `Get` command to send via the channel.
        let get = Command::Get(key.into());

        // Initialize a new oneshot to be used to receive the response back from the connection.
        let (tx, rx) = oneshot::channel();

        // Send the request
        self.tx.send((get, tx)).await?;

        // Await the response
        match rx.await {
            Ok(res) => res,
            Err(err) => Err(err.into()),
        }
    }

    /// Set `key` to hold the given `value`.
    ///
    /// Same as `Client::set` but requests are **buffered** until the associated
    /// connection has the ability to send the request
    pub async fn set(&mut self, key: &str, value: Bytes) -> Result<()> {
        // Initialize a new `Set` command to send via the channel.
        let set = Command::Set(key.into(), value);

        // Initialize a new oneshot to be used to receive the response back from the connection.
        let (tx, rx) = oneshot::channel();

        // Send the request
        self.tx.send((set, tx)).await?;

        // Await the response
        match rx.await {
            Ok(res) => res.map(|_| ()),
            Err(err) => Err(err.into()),
        }
    }
}
