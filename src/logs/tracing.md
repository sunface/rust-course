# 使用 tracing 记录日志
严格来说，tracing 并不是一个日志库，而是一个分布式跟踪的 SDK，用于采集监控数据的。

随着微服务的流行，现在一个产品有多个系统组成是非常常见的，这种情况下，一条用户请求可能会横跨几个甚至几十个服务。此时再用传统的日志方式去跟踪这条用户请求就变得较为困难，这就是分布式追踪在现代化监控系统中这么炽手可热的原因。

关于分布式追踪，在后面的监控章节进行详细介绍，大家只要知道：分布式追踪的核心就是在请求的开始生成一个 `trace_id`，然后将该 `trace_id` 一直往后透穿，请求经过的每个服务都会使用该 `trace_id` 记录相关信息，最终将整个请求形成一个完整的链路予以记录下来。

那么后面当要查询这次请求的相关信息时，只要使用 `trace_id` 就可以获取整个请求链路的所有信息了，非常简单好用。看到这里，相信大家也明白为什么这个库的名称叫 `tracing` 了吧？

至于为何把它归到日志库的范畴呢？因为 `tracing` 支持 `log` 门面库的 API，因此，它既可以作为分布式追踪的 SDK 来使用，也可以作为日志库来使用。

> 在分布式追踪中，trace_id 都是由 SDK 自动生成和往后透穿，对于用户的使用来说是完全透明的。如果你要手动用日志的方式来实现请求链路的追踪，那么就必须考虑 trace_id 的手动生成、透传，以及不同语言之间的协议规范等问题

## 一个简单例子
下面的例子中将同时使用 `log` 和 `tracing` :
```rust
use log;
use tracing_subscriber::{fmt, layer::SubscriberExt, util::SubscriberInitExt};

fn main() {
    // 只有注册 subscriber 后， 才能在控制台上看到日志输出
    tracing_subscriber::registry()
        .with(fmt::layer())
        .init();
    
    // 调用 `log` 包的 `info!`
    log::info!("Hello world");
    
    let foo = 42;
    // 调用 `tracing` 包的 `info!`
    tracing::info!(foo, "Hello from tracing");
}
```

可以看出，门面库的排场还是有的，`tracing` 在 API 上明显是使用了 `log` 的规范。

运行后，输出如下日志:
```shell
2022-04-09T14:34:28.965952Z  INFO test_tracing: Hello world    
2022-04-09T14:34:28.966011Z  INFO test_tracing: Hello from tracing foo=42
```

还可以看出，`log` 的日志格式跟 `tracing` 一模一样，结合上一章节的知识，相信聪明的同学已经明白了这是为什么。

那么 `tracing` 跟 `log` 的具体日志实现框架有何区别呢？别急，我们再来接着看。


## 异步编程中的挑战

除了分布式追踪，在异步编程中使用传统的日志也是存在一些问题的，最大的挑战就在于异步任务的执行没有确定的顺序，那么输出的日志也将没有确定的顺序并混在一起，无法按照我们想要的逻辑顺序串联起来。

**归根到底，在于日志只能针对某个时间点进行记录，缺乏上下文信息，而线程间的执行顺序又是不确定的，因此日志就有些无能为力**。而 `tracing` 为了解决这个问题，引入了 `span` 的概念( 这个概念也来自于分布式追踪 )，一个 `span` 代表了一个时间段，拥有开始和结束时间，在此期间的所有类型数据、结构化数据、文本数据都可以记录其中。

大家发现了吗？ `span` 是可以拥有上下文信息的，这样就能帮我们把信息按照所需的逻辑性串联起来了。

## 核心概念

`tracing` 中最重要的三个概念是 `span`、`event` 和 `collector`，下面我们来一一简单介绍下。

### span
相比起日志只能记录在某个时间点发生的事件，`span` 最大的意义就在于它可以记录一个过程，也就是在某一段时间内发生的事件流。既然是记录时间段，那自然有开始和结束:

```rust
use tracing::{span, Level};
fn main() {
    let span = span!(Level::TRACE, "my_span");

    // `enter` 返回一个 RAII ，当其被 drop 时，将自动结束该 span
    let enter = span.enter();
    // 这里开始进入 `my_span` 的上下文
    // 下面执行一些任务，并记录一些信息到 `my_span` 中
    // ...
} // 这里 enter 将被 drop，`my_span` 也随之结束
```

需要注意，如果是在异步编程时使用，要避免以下使用方式:
```rust
async fn my_async_function() {
    let span = info_span!("my_async_function");

    // WARNING: 该 span 直到 drop 后才结束，因此在 .await 期间，span 依然处于工作中状态
    let _enter = span.enter();

    // 在这里 span 依然在记录，但是 .await 会让出当前任务的执行权，然后运行时会去运行其它任务，此时这个 span 可能会记录其它任务的执行信息，最终记录了不正确的 trace 信息
    some_other_async_function().await

    // ...
}
```

### Event
`Event` 代表了某个时间点发生的事件，这方面它跟日志类似，但是不同的是，`Event` 还可以产生在 span 的上下文中。

```rust
use tracing::{event, span, Level};
use tracing_subscriber::{fmt, layer::SubscriberExt, util::SubscriberInitExt};

fn main() {
    tracing_subscriber::registry().with(fmt::layer()).init();
    // 在 span 的上下文之外记录一次 event 事件
    event!(Level::INFO, "something happened");

    let span = span!(Level::INFO, "my_span");
    let _guard = span.enter();

    // 在 "my_span" 的上下文中记录一次 event
    event!(Level::DEBUG, "something happened inside my_span");
}
```

```shell
2022-04-09T14:51:38.382987Z  INFO test_tracing: something happened
2022-04-09T14:51:38.383111Z DEBUG my_span: test_tracing: something happened inside my_span
```

虽然 `event` 在哪里都可以使用，但是最好只在 span 的上下文中使用：用于代表一个时间点发生的事件，例如记录 HTTP 请求返回的状态码，从队列中获取一个对象，等等。


## spans 嵌套

```rust
use tracing::{debug, info, span, Level};
use tracing_subscriber::{fmt, layer::SubscriberExt, util::SubscriberInitExt};

fn main() {
    tracing_subscriber::registry().with(fmt::layer()).init();

    let scope = span!(Level::DEBUG, "foo");
    let _enter = scope.enter();
    info!("Hello in foo scope");
    debug!("before enter bar scope");
    {
        let scope = span!(Level::DEBUG, "bar", ans = 42);
        let _enter = scope.enter();
        debug!("enter bar scope");
        info!("In bar scope");
        debug!("end bar scope");
    }
    debug!("end bar scope");
}
```