# 日常开发三方库精选

对计算机、编程、架构的理解决定一个程序员的上限，而工具则决定了他的下限，三尺森寒利剑在手，问世间谁敢一战。

本文就分门别类的精心挑选了一些非常适合日常开发使用的三方库，同时针对优缺点、社区活跃等进行了评价，同一个类别的库，按照**推荐度优先级降序排列**，希望大家能喜欢。

> 本文节选自[Fancy Rust](https://fancy.rs), 一个Rust酷库推荐项目, 里面精选了各个领域的好项目，无论是学习还是工作使用，都能助你一臂之力。

## 目录
- 日常开发常用的Rust库: 
  - [Web/HTTP](#webhttp),  [SQL客户端](#SQL客户端), [NoSql客户端](#NoSql客户端)， [网络通信协议](#网络通信协议), [异步网络编程](#异步网络编程)
  - [服务发现](#服务发现), [消息队列](#消息队列), [搜索引擎](#搜索引擎)
  - [编解码](#编解码), [Email](#Email), [常用正则模版](#常用正则模版)
  - [日志监控](#日志监控), [代码Debug](#代码Debug), [性能优化](#性能优化)
- [精选中文学习资料](#精选中文学习资料)
- [精选Rust开源项目](#精选Rust开源项目)

## 日常开发常用Rust库
### Web/HTTP
* HTTP客户端
  * [reqwest](https://github.com/seanmonstar/reqwest)  一个简单又强大的HTTP客户端，`reqwest`是目前使用最多的HTTP库 

* Web框架
  * [axum](https://github.com/tokio-rs/axum)  基于Tokio和Hyper打造，模块化设计较好，目前口碑很好，值得使用Ergonomic and modular web framework built with Tokio, Tower, and Hyper
  * [Rocket](https://github.com/SergioBenitez/Rocket)  功能强大，API简单的Web框架，但是主要开发者目前因为个人原因无法进行后续开发，未来存在不确定性
  * [actix-web](https://github.com/actix/actix-web)  性能极高的Web框架，就是团队内部有些问题，未来存在一定的不确定性
  * 总体来说，上述三个web框架都有很深的用户基础，其实都可以选用，如果让我推荐，顺序如下: `axum` > `Rocket` > `actix-web`。 不过如果你不需要多么完善的web功能，只需要一个性能极高的http库，那么`actix-web`是非常好的选择，它的性能非常非常非常高！

### 日志监控
* 日志
[[crates.io](https://crates.io/keywords/log)] [[github](https://github.com/search?q=rust+log)]
  * [tokio-rs/tracing](https://github.com/tokio-rs/tracing)  强大的日志框架，同时还支持OpenTelemetry格式，无缝打通未来的监控
  * [rust-lang/log](https://github.com/rust-lang/log)  官方日志库，事实上的API标准, 但是三方库未必遵循
  * [estk/log4rs](https://github.com/estk/log4rs)  模仿JAVA `logback`和`log4j`实现的日志库, 可配置性较强
  * 在其它文章中，也许会推荐slog，但是我们不推荐，一个是因为近半年未更新，一个是`slog`自己也推荐使用`tracing`。
* 监控
  * [OpenTelemetry](https://github.com/open-telemetry/opentelemetry-rust)  `OpenTelemetry`是现在非常火的可观测性解决方案，提供了协议、API、SDK等核心工具，用于收集监控数据，最后将这些metrics/logs/traces数据写入到`prometheus`, `jaeger`等监控平台中。最主要是，它后台很硬，后面有各大公司作为背书，未来非常看好！
  * [vectordotdev/vector](https://github.com/vectordotdev/vector)  一个性能很高的数据采集agent，采集本地的日志、监控等数据，发送到远程的kafka、jaeger等数据下沉端，它最大的优点就是能从多种数据源(包括Opentelemetry)收集数据，然后推送到多个数据处理或者存储等下沉端。

### SQL客户端
* 通用
  * [launchbadge/sqlx](https://github.com/launchbadge/sqlx) 异步实现、高性能、纯Rust代码的SQL库，支持`PostgreSQL`, `MySQL`, `SQLite`,和 `MSSQL`.

* ORM
  * [rbatis/rbatis](https://github.com/rbatis/rbatis)  国内团队开发的ORM，异步、性能高、简单易上手
  * [diesel-rs/diesel](https://github.com/diesel-rs/diesel)  安全、扩展性强的Rust ORM库，支持`Mysql`、`Postgre`、`SqlLite`


* Mysql
  * [blackbeam/rust-mysql-simple](https://github.com/blackbeam/rust-mysql-simple)  纯Rust实现的Mysql驱动,提供连接池
  * [blackbeam/mysql_async](https://github.com/blackbeam/mysql_async)  基于Tokio实现的异步Mysql驱动
  * 上面两个都是一个团队出品，前者文档更全、star更多，建议使用前者


* Postgre
  * [sfackler/rust-postgres](https://github.com/sfackler/rust-postgres) 纯Rust实现的Postgre客户端

* Sqlite
  * [rusqlite](https://github.com/rusqlite/rusqlite) 用于[Sqlite3](https://www.sqlite.org/index.html)的Rust客户端

### NoSql客户端

* Redis
  * [mitsuhiko/redis-rs](https://github.com/mitsuhiko/redis-rs) 虽然最近更新不太活跃，但是它依然是最好的redis客户端，说实话，我期待更好的，可能这也是Rust生态的未来可期之处吧

* Canssandra
  * [krojew/cdrs-tokio](https://github.com/krojew/cdrs-tokio) [[cdrs-tokio](https://crates.io/crates/cdrs-tokio)] 生产可用的Cassandra客户端，异步、纯Rust实现，就是个人项目 + star较少，未来不确定会不会不维护
  * [scylla-rust-driver](https://github.com/scylladb/scylla-rust-driver)  ScyllaDB提供的官方库，支持cql协议，由于背靠大山，未来非常可期


* MongoDB
  * [mongodb/mongo-rust-driver](https://github.com/mongodb/mongo-rust-driver) 官方MongoDB客户端，闭着眼睛选就对了

### 分布式
#### 服务发现
- [luncj/etcd-rs](https://github.com/luncj/etcd-rs) 异步实现的Rust etcd客户端，优点是有一定的文档、作者较为活跃,意味着你提问题他可能会回答，不过，如果你不放心，还是考虑使用HTTP的方式访问ETCD

#### 消息队列
* Kafka
  * [fede1024/rust-rdkafka](https://github.com/fede1024/rust-rdkafka)  Rust Kafka客户端，基于C版本的Kafka库[librdkafka]实现，文档较全、功能较为全面
  * [kafka-rust/kafka-rust](https://github.com/kafka-rust/kafka-rust)  相比上一个库，它算是纯Rust实现，文档还行，支持Kafka0.8.2及以后的版本，但是对于部分0.9版本的特性还不支持。同时有一个问题：最初的作者不维护了，转给了现在的作者，但是感觉好像也不是很活跃
* Nats
  * [nats-io/nats.rs](https://github.com/nats-io/nats.rs) Nats官方提供的客户端

### 网络、通信协议
* Websocket
  * [snapview/tokio-tungstenite](https://github.com/snapview/tokio-tungstenite) 更适合Web应用使用的生产级Websocket库，它是异步非阻塞的，基于下面的`tungstenite-rs`库和tokio实现
  * [rust-websocket](https://github.com/websockets-rs/rust-websocket)  老牌Websocket库，提供了客户端和服务器端实现，但是。。。很久没更新了
  * [snapview/tungstenite-rs](https://github.com/snapview/tungstenite-rs) 轻量级的Websocket流实现，该库更偏底层，例如，你可以用来构建其它网络库
* gRPC
  * [hyperium/tonic](https://github.com/hyperium/tonic) 纯Rust实现的gRPC客户端和服务器端，支持async/await异步调用，文档和示例较为清晰
  * [tikv/grpc-rs](https://github.com/tikv/grpc-rs) 国产开源之光Tidb团队出品的gRPC框架, 基于C的代码实现, 就是最近好像不是很活跃
  * 其实这两个实现都很优秀，把`tonic`放在第一位，主要是因为它是纯Rust实现，同时社区也更为活跃，但是并不代表它比`tikv`的更好！
* QUIC
  * [cloudflare/quiche](https://github.com/cloudflare/quiche) 大名鼎鼎`cloudflare`提供的QUIC实现，据说在公司内部重度使用，有了大规模生产级别的验证，非常值得信任，同时该库还实现了HTTP/3
  * [quinn-rs/quinn](https://github.com/quinn-rs/quinn) 提供异步API调用，纯Rust实现，同时提供了几个有用的网络库
* MQTT
  * [bytebeamio/rumqtt](https://github.com/bytebeamio/rumqtt)  MQTT3.1.1/5协议库，同时实现了客户端与服务器端broker
  * [ntex-rs/ntex-mqtt](https://github.com/ntex-rs/ntex-mqtt)  客户端与服务端框架，支持MQTT3.1.1与5协议
  * [eclipse/paho.mqtt.rust](https://github.com/eclipse/paho.mqtt.rust)  老牌MQTT框架，对MQTT支持较全, 其它各语言的实现也有

### 异步网络编程

* [tokio-rs/tokio](https://github.com/tokio-rs/tokio) 最火的异步网络库，除了复杂上手难度高一些外，没有其它大的问题。同时tokio团队提供了多个非常优秀的Rust库，整个生态欣欣向荣，用户认可度很高
* [async-std](https://async.rs/) 跟标准库API很像的异步网络库，相对简单易用，但是貌似开发有些停滞，还有就是功能上不够完善。但是对于普通用户来说，这个库非常值得一试，它在功能和简单易用上取得了很好的平衡
* [actix](https://github.com/actix/actix) 基于Actor模型的异步网络库，但这个库的开发貌似已经停滞，他们团队一直在专注于`actix-web`的开发
* [mio](https://github.com/tokio-rs/mio) 严格来说，MIO与之前三个不是同一个用途的，MIO = Meta IO，是一个底层IO库，往往用于构建其它网络库，当然如果你对应用网络性能有非常极限的要求， 可以考虑它，因为它的层次比较低，所带来的抽象负担小，所以性能损耗小
* 如果你要开发生产级别的项目，我推荐使用`tokio`，稳定可靠，功能丰富，控制粒度细；自己的学习项目或者没有那么严肃的开源项目，我推荐`async-std`，简单好用，值得学习；当你确切知道需要Actor网络模型时，就用`actix`


### 搜索引擎

* ElasticSearch客户端
  * [elastic/elasticsearch](https://github.com/elastic/elasticsearch-rs) 官方es客户端，目前第三方的基本都处于停滞状态，所以不管好坏，用呗

* Rust搜索引擎
  * [Tantivy](https://github.com/quickwit-inc/tantivy) Tantivy是Rust实现的本地搜索库，功能对标`lucene`，如果你不需要分布式，那么引入tantivy作为自己本地Rust服务的一个搜索，是相当不错的选择，该库作者一直很活跃，而且最近还创立了搜索引擎公司，感觉大有作为. 该库的优点在于纯Rust实现，性能高(lucene的2-3倍)，资源占用低(对比java自然不是一个数量级)，社区活跃。

* Rust搜索平台
  * [quickwit](https://github.com/quickwit-inc/quickwit) 对标ElasticSearch，一个通用目的的分布式搜索平台，目前还在起步阶段(0.2版本)，未来非常可期，目前还不建议使用
  * [MeiliSearch](https://github.com/meilisearch/MeiliSearch) 虽然也是一个搜索平台，但是并不是通用目的的，`MeiliSearch`目标是为终端用户提供边输入边提示的即刻搜索功能，因此是一个轻量级搜索平台，不适用于数据量大时的搜索目的。总之，如果你需要在网页端或者APP为用户提供一个搜索条，然后支持输入容错、前缀搜索时，就可以使用它。
  * 
### 代码Debug
* GDB
  * [gdbgui](https://github.com/cs01/gdbgui)  提供浏览器支持的gdb debug工具，支持C，C++，Rust和Go.
* LLDB
  * [CodeLLDB](https://marketplace.visualstudio.com/items?itemName=vadimcn.vscode-lldb) — 专门为VSCode设计的LLDB Debug扩展

### 性能优化
* [bheisler/criterion.rs](https://github.com/bheisler/criterion.rs) 比官方提供的benchmark库更好，目前已经成为事实上标准的性能测试工具
* [Bytehound](https://github.com/koute/bytehound) Linux下的内存分析工具，可以用来分析：内存泄漏、内存分配、调用栈追踪，甚至它还有一个浏览器UI! 懂的人都懂，性能测试工具的UI服务是多么稀缺和珍贵！
* [llogiq/flame](https://github.com/llogiq/flame) 专为Rust打造的火焰图分析工具，可以告诉你程序在哪些代码上花费的时间过多，非常适合用于代码性能瓶颈的分析。与`perf`不同，`flame`库允许你自己定义想要测试的代码片段，只需要在代码前后加上相应的指令即可，非常好用
* [sharkdp/hyperfine](https://github.com/sharkdp/hyperfine) 一个命令行benchmark工具，支持任意shell命令，支持缓存清除、预热、多次运行统计分析等，尽量保证结果的准确性


### 编解码
* [Serde](https://github.com/serde-rs/serde) 一个超高性能的通用序列化/反序列化框架，可以跟多种协议的库联合使用，实现统一编解码格式
* CSV
  * [BurntSushi/rust-csv](https://github.com/BurntSushi/rust-csv) 高性能CSV读写库，支持[Serde](https://github.com/serde-rs/serde)
* JSON
  * [serde-rs/json](https://github.com/serde-rs/json) 快到上天的JSON库，也是Rust事实上的标准JSON库，你也可以使用它的大哥[serde](https://github.com/serde-rs/serde)，一个更通用的序列化/反序列化库
* MsgPack
  * [3Hren/msgpack-rust](https://github.com/3Hren/msgpack-rust) 纯Rust实现的MessagePack编解码协议
* ProtocolBuffers
  * [tokio-rs/prost](https://github.com/tokio-rs/prost) tokio出品，基本都属精品，此库也不例外，简单易用，文档详细
  * [stepancheg/rust-protobuf](https://github.com/stepancheg/rust-protobuf) 纯Rust实现
* TOML
  * [alexcrichton/toml-rs](https://github.com/alexcrichton/toml-rs) TOML编码/解码，可以配合`serde`使用
* XML
  * [tafia/quick-xml](https://github.com/tafia/quick-xml) 高性能XML库，可以配合`serde`使用，文档较为详细
* YAML
  * [dtolnay/serde-yaml](https://github.com/dtolnay/serde-yaml) 使用`serde`编解码`YAML`格式的数据

### Email
* [lettre/lettre](https://github.com/lettre/lettre) — Rust SMTP库

### 常用正则模版



