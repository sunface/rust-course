# 使用 tracing 记录日志
严格来说，tracing 并不是一个日志库，而是一个分布式跟踪的 SDK，用于采集监控数据的。

随着微服务的流行，现在一个产品有多个系统组成是非常常见的，这种情况下，一条用户请求可能会横跨几个甚至几十个服务。此时再用传统的日志方式去跟踪这条用户请求就变得较为困难，这就是分布式追踪在现代化监控系统中这么炽手可热的原因。

关于分布式追踪，在后面的监控章节进行详细介绍，大家只要知道：分布式追踪的核心就是在请求的开始生成一个 `trace_id`，然后将该 `trace_id` 一直往后透穿，请求经过的每个服务都会使用该 `trace_id` 记录相关信息，最终将整个请求形成一个完整的链路予以记录下来。

那么后面当要查询这次请求的相关信息时，只要使用 `trace_id` 就可以获取整个请求链路的所有信息了，非常简单好用。看到这里，相信大家也明白为什么这个库的名称叫 `tracing` 了吧？

至于为何把它归到日志库的范畴呢？因为 `tracing` 支持 `log` 门面库的 API，因此，它既可以作为分布式追踪的 SDK 来使用，也可以作为日志库来使用。

> 在分布式追踪中，trace_id 都是由 SDK 自动生成和往后透穿，对于用户的使用来说是完全透明的。如果你要手动用日志的方式来实现请求链路的追踪，那么就必须考虑 trace_id 的手动生成、透传，以及不同语言之间的协议规范等问题

## 一个简单例子

开始之前，需要先将 `tracing` 添加到项目的 `Cargo.toml` 中:

```toml
[dependencies]
tracing = "0.1"
```

注意，在写作本文时，`0.2` 版本已经快要出来了，所以具体使用的版本请大家以阅读时为准。

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

### Event 事件
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

虽然 `event` 在哪里都可以使用，**但是最好只在 span 的上下文中使用**：用于代表一个时间点发生的事件，例如记录 HTTP 请求返回的状态码，从队列中获取一个对象，等等。

### Collector 收集器
当 `Span` 或 `Event` 发生时，它们会被实现了 `Collect` 特征的收集器所记录或聚合。这个过程是通过通知的方式实现的：当 `Event` 发生或者 `Span` 开始/结束时，会调用 `Collect` 特征的[相应方法](https://tracing-rs.netlify.app/tracing/trait.collect#tymethod.event)通知 Collector。

#### tracing-subscriber
我们前面提到只有使用了 [`tracing-subscriber`](https://docs.rs/tracing-subscriber/) 后，日志才能输出到控制台中。

之前大家可能还不理解，现在应该明白了，它是一个 Collector，可以将记录的日志收集后，再输出到控制台中。

## 使用方法

### `span!` 宏
`span!` 宏可以用于创建一个 `Span` 结构体，然后通过调用结构体的 `enter` 方法来开始，再通过超出作用域时的 `drop` 来结束。

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

### #[instrument]
如果想要将某个函数的整个函数体都设置为 span 的范围，最简单的方法就是为函数标记上 `#[instrument]`，此时 tracing 会自动为函数创建一个 span，span 名跟函数名相同，在输出的信息中还会自动带上函数参数。

```rust
use tracing::{info, instrument};
use tracing_subscriber::{fmt, layer::SubscriberExt, util::SubscriberInitExt};

#[instrument]
fn foo(ans: i32) {
    info!("in foo");
}

fn main() {
    tracing_subscriber::registry().with(fmt::layer()).init();
    foo(42);
}
```

```shell
2022-04-10T02:44:12.885556Z  INFO foo{ans=42}: test_tracing: in foo
```

关于 `#[instrument]` 详细说明，请参见[官方文档](https://tracing-rs.netlify.app/tracing/attr.instrument.html)。

### in_scope
对于没有内置 tracing 支持或者无法使用 `#instrument` 的函数，例如外部库的函数，我们可以使用 `Span` 结构体的 `in_scope` 方法，它可以将同步代码包裹在一个 span 中：
```rust
use tracing::info_span;

let json = info_span!("json.parse").in_scope(|| serde_json::from_slice(&buf))?;
```

### 在 async 中使用 span 
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

我们建议使用以下方式，简单又有效:
```rust
use tracing::{info, instrument};
use tokio::{io::AsyncWriteExt, net::TcpStream};
use std::io;

#[instrument]
async fn write(stream: &mut TcpStream) -> io::Result<usize> {
    let result = stream.write(b"hello world\n").await;
    info!("wrote to stream; success={:?}", result.is_ok());
    result
}
```

那有同学可能要问了，是不是我们无法在异步代码中使用 `span.enter` 了，答案是：是也不是。

是，你无法直接使用 `span.enter` 语法了，原因上面也说过，但是可以通过下面的方式来曲线使用：
```rust
use tracing::Instrument;

let my_future = async {
    // ...
};

my_future
    .instrument(tracing::info_span!("my_future"))
    .await
```


### spans 嵌套
`tracing` 的 span 不仅仅是上面展示的基本用法，它们还可以进行嵌套！
```rust
use tracing::{debug, info, span, Level};
use tracing_subscriber::{fmt, layer::SubscriberExt, util::SubscriberInitExt};

fn main() {
    tracing_subscriber::registry().with(fmt::layer()).init();

    let scope = span!(Level::DEBUG, "foo");
    let _enter = scope.enter();
    info!("Hello in foo scope");
    debug!("before entering bar scope"); 
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

```shell
INFO foo: log_test: Hello in foo scope
DEBUG foo: log_test: before entering bar scope
DEBUG foo:bar{ans=42}: log_test: enter bar scope
INFO foo:bar{ans=42}: log_test: In bar scope
DEBUG foo:bar{ans=42}: log_test: end bar scope
DEBUG foo: log_test: end bar scope
```

在上面的日志中，`foo:bar` 不仅包含了 `foo` 和 `bar` span 名，还显示了它们之间的嵌套关系。


## 对宏进行配置

### 日志级别和目标
`span!` 和 `event!` 宏都需要设定相应的日志级别，而且它们支持可选的 `target` 或 `parent` 参数( 只能二者选其一 )，该参数用于描述事件发生的位置，如果父 span 没有设置，`target` 参数也没有提供，那这个位置默认分别是当前的 span 和 当前的模块。

```rust
use tracing::{debug, info, span, Level,event};
use tracing_subscriber::{fmt, layer::SubscriberExt, util::SubscriberInitExt};

fn main() {
    tracing_subscriber::registry().with(fmt::layer()).init();

    let s = span!(Level::TRACE, "my span");
    // 没进入 span，因此输出日志将不回带上 span 的信息
    event!(target: "app_events", Level::INFO, "something has happened 1!");

    // 进入 span ( 开始 )
    let _enter = s.enter();
    // 没有设置 target 和 parent
    // 这里的对象位置分别是当前的 span 名和模块名
    event!(Level::INFO, "something has happened 2!");
    // 设置了 target
    // 这里的对象位置分别是当前的 span 名和 target
    event!(target: "app_events",Level::INFO, "something has happened 3!");

    let span = span!(Level::TRACE, "my span 1");
    // 这里就更为复杂一些，留给大家作为思考题
    event!(parent: &span, Level::INFO, "something has happened 4!");
}
```

### 记录字段
我们可以通过语法 `field_name = field_value` 来输出结构化的日志

```rust
// 记录一个事件，带有两个字段:
//  - "answer", 值是 42
//  - "question", 值是 "life, the universe and everything"
event!(Level::INFO, answer = 42, question = "life, the universe, and everything");

// 日志输出 -> INFO test_tracing: answer=42 question="life, the universe, and everything"
```

#### 捕获环境变量
还可以捕获环境中的变量:

```rust
let user = "ferris";

// 下面的简写方式
span!(Level::TRACE, "login", user);
// 等价于:
span!(Level::TRACE, "login", user = user);
```

```rust
use tracing::{info, span, Level};
use tracing_subscriber::{fmt, layer::SubscriberExt, util::SubscriberInitExt};

fn main() {
    tracing_subscriber::registry().with(fmt::layer()).init();

    let user = "ferris";
    let s = span!(Level::TRACE, "login", user);
    let _enter = s.enter();

    info!(welcome="hello", user);
    // 下面一行将报错，原因是这种写法是格式化字符串的方式，必须使用 info!("hello {}", user)
    // info!("hello", user);
}

// 日志输出 -> INFO login{user="ferris"}: test_tracing: welcome="hello" user="ferris"
```

#### 字段名的多种形式
字段名还可以包含 `.` :
```rust
let user = "ferris";
let email = "ferris@rust-lang.org";
event!(Level::TRACE, user, user.email = email);

// 还可以使用结构体
let user = User {
    name: "ferris",
    email: "ferris@rust-lang.org",
};

// 直接访问结构体字段，无需赋值即可使用
span!(Level::TRACE, "login", user.name, user.email);

// 字段名还可以使用字符串
event!(Level::TRACE, "guid:x-request-id" = "abcdef", "type" = "request");

// 日志输出 -> 
// TRACE test_tracing: user="ferris" user.email="ferris@rust-lang.org"
// TRACE test_tracing: user.name="ferris" user.email="ferris@rust-lang.org"
// TRACE test_tracing: guid:x-request-id="abcdef" type="request"
```

#### ?
`?` 符号用于说明该字段将使用 `fmt::Debug` 来格式化。

```rust
 #[derive(Debug)]
struct MyStruct {
    field: &'static str,
}

let my_struct = MyStruct {
    field: "Hello world!",
};

// `my_struct` 将使用 Debug 的形式输出
event!(Level::TRACE, greeting = ?my_struct);
// 等价于:
event!(Level::TRACE, greeting = tracing::field::debug(&my_struct));

// 下面代码将报错, my_struct 没有实现 Display
// event!(Level::TRACE, greeting = my_struct);

// 日志输出 -> TRACE test_tracing: greeting=MyStruct { field: "Hello world!" }
```

#### %
`%` 说明字段将用 `fmt::Display` 来格式化。

```rust
// `my_struct.field` 将使用 `fmt::Display` 的格式化形式输出
event!(Level::TRACE, greeting = %my_struct.field);
// 等价于:
event!(Level::TRACE, greeting = tracing::field::display(&my_struct.field));

// 作为对比，大家可以看下 Debug 和正常的字段输出长什么样
event!(Level::TRACE, greeting = ?my_struct.field);
event!(Level::TRACE, greeting = my_struct.field);

// 下面代码将报错, my_struct 没有实现 Display
// event!(Level::TRACE, greeting = %my_struct);
```

```shell
2022-04-10T03:49:00.834330Z TRACE test_tracing: greeting=Hello world!
2022-04-10T03:49:00.834410Z TRACE test_tracing: greeting=Hello world!
2022-04-10T03:49:00.834422Z TRACE test_tracing: greeting="Hello world!"
2022-04-10T03:49:00.834433Z TRACE test_tracing: greeting="Hello world!"
```

#### Empty
字段还能标记为 `Empty`，用于说明该字段目前没有任何值，但是可以在后面进行记录。

```rust
use tracing::{trace_span, field};

let span = trace_span!("my_span", greeting = "hello world", parting = field::Empty);

// ...

// 现在，为 parting 记录一个值
span.record("parting", &"goodbye world!");
```

#### 格式化字符串
除了以字段的方式记录信息，我们还可以使用格式化字符串的方式( 同 `println!` 、`format!` )。

> 注意，当字段跟格式化的方式混用时，必须把格式化放在最后，如下所示

```rust
let question = "the ultimate question of life, the universe, and everything";
let answer = 42;
event!(
    Level::DEBUG,
    question.answer = answer,
    question.tricky = true,
    "the answer to {} is {}.", question, answer
);

// 日志输出 -> DEBUG test_tracing: the answer to the ultimate question of life, the universe, and everything is 42. question.answer=42 question.tricky=true
```

### 文件输出
截至目前，我们上面的日志都是输出到控制台中。

针对文件输出，`tracing` 提供了一个专门的库 [tracing-appender](https://github.com/tokio-rs/tracing/tree/master/tracing-appender)，大家可以查看官方文档了解更多。


## 一个综合例子

最后，再来看一个综合的例子，使用了 [color-eyre](https://github.com/yaahc/color-eyre) 和 文件输出，前者用于为输出的日志加上更易读的颜色。

```rust
use color_eyre::{eyre::eyre, Result};
use tracing::{error, info, instrument};
use tracing_appender::{non_blocking, rolling};
use tracing_error::ErrorLayer;
use tracing_subscriber::{
    filter::EnvFilter, fmt, layer::SubscriberExt, util::SubscriberInitExt, Registry,
};

#[instrument]
fn return_err() -> Result<()> {
    Err(eyre!("Something went wrong"))
}

#[instrument]
fn call_return_err() {
    info!("going to log error");
    if let Err(err) = return_err() {
        // 推荐大家运行下，看看这里的输出效果
        error!(?err, "error");
    }
}

fn main() -> Result<()> {
    let env_filter = EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info"));
    // 输出到控制台中
    let formatting_layer = fmt::layer().pretty().with_writer(std::io::stderr);
    
    // 输出到文件中
    let file_appender = rolling::never("logs", "app.log");
    let (non_blocking_appender, _guard) = non_blocking(file_appender);
    let file_layer = fmt::layer()
        .with_ansi(false)
        .with_writer(non_blocking_appender);
        
    // 注册
    Registry::default()
        .with(env_filter)
        // ErrorLayer 可以让 color-eyre 获取到 span 的信息
        .with(ErrorLayer::default())
        .with(formatting_layer)
        .with(file_layer)
        .init();
    
    // 安裝 color-eyre 的 panic 处理句柄 
    color_eyre::install()?;

    call_return_err();

    Ok(())
}
```

## 总结 & 推荐
至此，`tracing` 的介绍就已结束，相信大家都看得出，它比上个章节的 `log` 及兄弟们要更加复杂一些，一方面是因为它能更好的支持异步编程环境，另一方面就是它还是一个分布式追踪的库，对于后者，我们将在后续的监控章节进行讲解。

如果你让我推荐使用哪个，那我的建议是:

- 对于简单的工程，例如用于 POC（ Proof of Concepts ） 目的，使用 `log` 即可
- 对于需要认真对待，例如生产级或优秀的开源项目，建议使用 tracing 的方式，一举解决日志和监控的后顾之忧