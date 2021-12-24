# mini-redis

`mini-redis` is an incomplete, idiomatic implementation of a
[Redis](https://redis.io) client and server built with
[Tokio](https://tokio.rs).

The intent of this project is to provide a larger example of writing a Tokio
application.

**Disclaimer** Please don't use mini-redis in production. This project is
intended to be a learning resource, and omits various parts of the Redis
protocol because implementing them would not introduce any new concepts. We will
not add new features because you need them in your project — use one of the
fully featured alternatives instead.

## Why Redis

The primary goal of this project is teaching Tokio. Doing this requires a
project with a wide range of features with a focus on implementation simplicity.
Redis, an in-memory database, provides a wide range of features and uses a
simple wire protocol. The wide range of features allows demonstrating many Tokio
patterns in a "real world" context.

The Redis wire protocol documentation can be found [here](https://redis.io/topics/protocol).

The set of commands Redis provides can be found
[here](https://redis.io/commands).


## Running

The repository provides a server, client library, and some client executables
for interacting with the server.

Start the server:

```
RUST_LOG=debug cargo run --bin mini-redis-server
```

The [`tracing`](https://github.com/tokio-rs/tracing) crate is used to provide structured logs.
You can substitute `debug` with the desired [log level][level].

[level]: https://docs.rs/tracing-subscriber/latest/tracing_subscriber/filter/struct.EnvFilter.html#directives

Then, in a different terminal window, the various client [examples](examples)
can be executed. For example:

```
cargo run --example hello_world
```

Additionally, a CLI client is provided to run arbitrary commands from the
terminal. With the server running, the following works:

```
cargo run --bin mini-redis-cli set foo bar

cargo run --bin mini-redis-cli get foo
```

## Supported commands

`mini-redis` currently supports the following commands.

* [GET](https://redis.io/commands/get)
* [SET](https://redis.io/commands/set)
* [PUBLISH](https://redis.io/commands/publish)
* [SUBSCRIBE](https://redis.io/commands/subscribe)

The Redis wire protocol specification can be found
[here](https://redis.io/topics/protocol).

There is no support for persistence yet.

## Tokio patterns

The project demonstrates a number of useful patterns, including:

### TCP server

[`server.rs`](src/server.rs) starts a TCP server that accepts connections,
and spawns a new task per connection. It gracefully handles `accept` errors.

### Client library

[`client.rs`](src/client.rs) shows how to model an asynchronous client. The
various capabilities are exposed as `async` methods.

### State shared across sockets

The server maintains a [`Db`] instance that is accessible from all connected
connections. The [`Db`] instance manages the key-value state as well as pub/sub
capabilities.

[`Db`]: src/db.rs

### Framing

[`connection.rs`](src/connection.rs) and [`frame.rs`](src/frame.rs) show how to
idiomatically implement a wire protocol. The protocol is modeled using an
intermediate representation, the `Frame` structure. `Connection` takes a
`TcpStream` and exposes an API that sends and receives `Frame` values.

### Graceful shutdown

The server implements graceful shutdown. [`tokio::signal`] is used to listen for
a SIGINT. Once the signal is received, shutdown begins. The server stops
accepting new connections. Existing connections are notified to shutdown
gracefully. In-flight work is completed, and the connection is closed.

[`tokio::signal`]: https://docs.rs/tokio/*/tokio/signal/

### Concurrent connection limiting

The server uses a [`Semaphore`] limits the maximum number of concurrent
connections. Once the limit is reached, the server stops accepting new
connections until an existing one terminates.

[`Semaphore`]: https://docs.rs/tokio/*/tokio/sync/struct.Semaphore.html

### Pub/Sub

The server implements non-trivial pub/sub capability. The client may subscribe
to multiple channels and update its subscription at any time. The server
implements this using one [broadcast channel][broadcast] per channel and a
[`StreamMap`] per connection. Clients are able to send subscription commands to
the server to update the active subscriptions.

[broadcast]: https://docs.rs/tokio/*/tokio/sync/broadcast/index.html
[`StreamMap`]: https://docs.rs/tokio/*/tokio/stream/struct.StreamMap.html

### Using a `std::sync::Mutex` in an async application

The server uses a `std::sync::Mutex` and **not** a Tokio mutex to synchronize
access to shared state. See [`db.rs`](src/db.rs) for more details.

### Testing asynchronous code that relies on time

In [`tests/server.rs`](tests/server.rs), there are tests for key expiration.
These tests depend on time passing. In order to make the tests deterministic,
time is mocked out using Tokio's testing utilities.

## Contributing

Contributions to `mini-redis` are welcome. Keep in mind, the goal of the project
is **not** to reach feature parity with real Redis, but to demonstrate
asynchronous Rust patterns with Tokio.

Commands or other features should only be added if doing so is useful to
demonstrate a new pattern.

Contributions should come with extensive comments targetted to new Tokio users.

Contributions that only focus on clarifying and improving comments are very
welcome.

## License

This project is licensed under the [MIT license](LICENSE).

### Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted
for inclusion in `mini-redis` by you, shall be licensed as MIT, without any
additional terms or conditions.
