//! Minimal blocking Redis client implementation
//!
//! Provides a blocking connect and methods for issuing the supported commands.

use bytes::Bytes;
use std::time::Duration;
use tokio::net::ToSocketAddrs;
use tokio::runtime::Runtime;

pub use crate::client::Message;

/// Established connection with a Redis server.
///
/// Backed by a single `TcpStream`, `BlockingClient` provides basic network
/// client functionality (no pooling, retrying, ...). Connections are
/// established using the [`connect`](fn@connect) function.
///
/// Requests are issued using the various methods of `Client`.
pub struct BlockingClient {
    /// The asynchronous `Client`.
    inner: crate::client::Client,

    /// A `current_thread` runtime for executing operations on the asynchronous
    /// client in a blocking manner.
    rt: Runtime,
}

/// A client that has entered pub/sub mode.
///
/// Once clients subscribe to a channel, they may only perform pub/sub related
/// commands. The `BlockingClient` type is transitioned to a
/// `BlockingSubscriber` type in order to prevent non-pub/sub methods from being
/// called.
pub struct BlockingSubscriber {
    /// The asynchronous `Subscriber`.
    inner: crate::client::Subscriber,

    /// A `current_thread` runtime for executing operations on the asynchronous
    /// `Subscriber` in a blocking manner.
    rt: Runtime,
}

/// The iterator returned by `Subscriber::into_iter`.
struct SubscriberIterator {
    /// The asynchronous `Subscriber`.
    inner: crate::client::Subscriber,

    /// A `current_thread` runtime for executing operations on the asynchronous
    /// `Subscriber` in a blocking manner.
    rt: Runtime,
}

/// Establish a connection with the Redis server located at `addr`.
///
/// `addr` may be any type that can be asynchronously converted to a
/// `SocketAddr`. This includes `SocketAddr` and strings. The `ToSocketAddrs`
/// trait is the Tokio version and not the `std` version.
///
/// # Examples
///
/// ```no_run
/// use mini_redis::blocking_client;
///
/// fn main() {
///     let client = match blocking_client::connect("localhost:6379") {
///         Ok(client) => client,
///         Err(_) => panic!("failed to establish connection"),
///     };
/// # drop(client);
/// }
/// ```
pub fn connect<T: ToSocketAddrs>(addr: T) -> crate::Result<BlockingClient> {
    let rt = tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()?;

    let inner = rt.block_on(crate::client::connect(addr))?;

    Ok(BlockingClient { inner, rt })
}

impl BlockingClient {
    /// Get the value of key.
    ///
    /// If the key does not exist the special value `None` is returned.
    ///
    /// # Examples
    ///
    /// Demonstrates basic usage.
    ///
    /// ```no_run
    /// use mini_redis::blocking_client;
    ///
    /// fn main() {
    ///     let mut client = blocking_client::connect("localhost:6379").unwrap();
    ///
    ///     let val = client.get("foo").unwrap();
    ///     println!("Got = {:?}", val);
    /// }
    /// ```
    pub fn get(&mut self, key: &str) -> crate::Result<Option<Bytes>> {
        self.rt.block_on(self.inner.get(key))
    }

    /// Set `key` to hold the given `value`.
    ///
    /// The `value` is associated with `key` until it is overwritten by the next
    /// call to `set` or it is removed.
    ///
    /// If key already holds a value, it is overwritten. Any previous time to
    /// live associated with the key is discarded on successful SET operation.
    ///
    /// # Examples
    ///
    /// Demonstrates basic usage.
    ///
    /// ```no_run
    /// use mini_redis::blocking_client;
    ///
    /// fn main() {
    ///     let mut client = blocking_client::connect("localhost:6379").unwrap();
    ///
    ///     client.set("foo", "bar".into()).unwrap();
    ///
    ///     // Getting the value immediately works
    ///     let val = client.get("foo").unwrap().unwrap();
    ///     assert_eq!(val, "bar");
    /// }
    /// ```
    pub fn set(&mut self, key: &str, value: Bytes) -> crate::Result<()> {
        self.rt.block_on(self.inner.set(key, value))
    }

    /// Set `key` to hold the given `value`. The value expires after `expiration`
    ///
    /// The `value` is associated with `key` until one of the following:
    /// - it expires.
    /// - it is overwritten by the next call to `set`.
    /// - it is removed.
    ///
    /// If key already holds a value, it is overwritten. Any previous time to
    /// live associated with the key is discarded on a successful SET operation.
    ///
    /// # Examples
    ///
    /// Demonstrates basic usage. This example is not **guaranteed** to always
    /// work as it relies on time based logic and assumes the client and server
    /// stay relatively synchronized in time. The real world tends to not be so
    /// favorable.
    ///
    /// ```no_run
    /// use mini_redis::blocking_client;
    /// use std::thread;
    /// use std::time::Duration;
    ///
    /// fn main() {
    ///     let ttl = Duration::from_millis(500);
    ///     let mut client = blocking_client::connect("localhost:6379").unwrap();
    ///
    ///     client.set_expires("foo", "bar".into(), ttl).unwrap();
    ///
    ///     // Getting the value immediately works
    ///     let val = client.get("foo").unwrap().unwrap();
    ///     assert_eq!(val, "bar");
    ///
    ///     // Wait for the TTL to expire
    ///     thread::sleep(ttl);
    ///
    ///     let val = client.get("foo").unwrap();
    ///     assert!(val.is_some());
    /// }
    /// ```
    pub fn set_expires(
        &mut self,
        key: &str,
        value: Bytes,
        expiration: Duration,
    ) -> crate::Result<()> {
        self.rt
            .block_on(self.inner.set_expires(key, value, expiration))
    }

    /// Posts `message` to the given `channel`.
    ///
    /// Returns the number of subscribers currently listening on the channel.
    /// There is no guarantee that these subscribers receive the message as they
    /// may disconnect at any time.
    ///
    /// # Examples
    ///
    /// Demonstrates basic usage.
    ///
    /// ```no_run
    /// use mini_redis::blocking_client;
    ///
    /// fn main() {
    ///     let mut client = blocking_client::connect("localhost:6379").unwrap();
    ///
    ///     let val = client.publish("foo", "bar".into()).unwrap();
    ///     println!("Got = {:?}", val);
    /// }
    /// ```
    pub fn publish(&mut self, channel: &str, message: Bytes) -> crate::Result<u64> {
        self.rt.block_on(self.inner.publish(channel, message))
    }

    /// Subscribes the client to the specified channels.
    ///
    /// Once a client issues a subscribe command, it may no longer issue any
    /// non-pub/sub commands. The function consumes `self` and returns a
    /// `BlockingSubscriber`.
    ///
    /// The `BlockingSubscriber` value is used to receive messages as well as
    /// manage the list of channels the client is subscribed to.
    pub fn subscribe(self, channels: Vec<String>) -> crate::Result<BlockingSubscriber> {
        let subscriber = self.rt.block_on(self.inner.subscribe(channels))?;
        Ok(BlockingSubscriber {
            inner: subscriber,
            rt: self.rt,
        })
    }
}

impl BlockingSubscriber {
    /// Returns the set of channels currently subscribed to.
    pub fn get_subscribed(&self) -> &[String] {
        self.inner.get_subscribed()
    }

    /// Receive the next message published on a subscribed channel, waiting if
    /// necessary.
    ///
    /// `None` indicates the subscription has been terminated.
    pub fn next_message(&mut self) -> crate::Result<Option<Message>> {
        self.rt.block_on(self.inner.next_message())
    }

    /// Convert the subscriber into an `Iterator` yielding new messages published
    /// on subscribed channels.
    pub fn into_iter(self) -> impl Iterator<Item = crate::Result<Message>> {
        SubscriberIterator {
            inner: self.inner,
            rt: self.rt,
        }
    }

    /// Subscribe to a list of new channels
    pub fn subscribe(&mut self, channels: &[String]) -> crate::Result<()> {
        self.rt.block_on(self.inner.subscribe(channels))
    }

    /// Unsubscribe to a list of new channels
    pub fn unsubscribe(&mut self, channels: &[String]) -> crate::Result<()> {
        self.rt.block_on(self.inner.unsubscribe(channels))
    }
}

impl Iterator for SubscriberIterator {
    type Item = crate::Result<Message>;

    fn next(&mut self) -> Option<crate::Result<Message>> {
        self.rt.block_on(self.inner.next_message()).transpose()
    }
}
