# 日志门面 log

就如同 slf4j 是 Java 的日志门面库，[log](https://github.com/rust-lang/log) 也是 Rust 的日志门面库( 这不是我自己编的，官方用语: logging facade )，它目前由官方积极维护，因此大家可以放心使用。

使用方式很简单，只要在 `Cargo.toml` 中引入即可：
```toml
[dependencies]
log = "0.4"
```

> 日志门面不是说排场很大的意思，而是指相应的日志 API 已成为事实上的标准，会被其它日志框架所使用。通过这种统一的门面，开发者就可以不必再拘泥于日志框架的选择，未来大不了再换一个日志框架就是

既然是门面，`log` 自然定义了一套统一的日志特征和 API，将日志的操作进行了抽象。

## Log 特征

例如，它定义了一个 `Log` 特征：
```rust
pub trait Log: Sync + Send {
    fn enabled(&self, metadata: &Metadata<'_>) -> bool;
    fn log(&self, record: &Record<'_>);
    fn flush(&self);
}
```

- `enabled` 用于判断某条带有元数据的日志是否能被记录，它对于 `log_enabled!` 宏特别有用
- `log` 会记录 `record` 所代表的日志
- `flush` 会将缓存中的日志数据刷到输出中，例如标准输出或者文件中

## 日志宏

`log` 还为我们提供了一整套标准的宏，用于方便地记录日志。看到 `trace!`、`debug!`、`info!`、`warn!`、`error!`，大家是否感觉眼熟呢？是的，它们跟上一章节提到的日志级别几乎一模一样，唯一的区别就是这里乱入了一个 `trace!`，它比 `debug!` 的日志级别还要低，记录的信息还要详细。可以说，你如果想巨细无遗地了解某个流程的所有踪迹，它就是不二之选。

```rust
use log::{info, trace, warn};

pub fn shave_the_yak(yak: &mut Yak) {
    trace!("Commencing yak shaving");

    loop {
        match find_a_razor() {
            Ok(razor) => {
                info!("Razor located: {}", razor);
                yak.shave(razor);
                break;
            }
            Err(err) => {
                warn!("Unable to locate a razor: {}, retrying", err);
            }
        }
    }
}
```

上面的例子使用 `trace!` 记录了一条可有可无的信息：准备开始剃须，然后开始寻找剃须刀，找到后就用 `info!` 记录一条可能事后也没人看的信息：找到剃须刀；没找到的话，就记录一条 `warn!` 信息，这条信息就有一定价值了，不仅告诉我们没找到的原因，还记录了发生的次数，有助于事后定位问题。

可以看出，这里使用日志级别的方式和我们上一章节所述基本相符。

除了以上常用的，`log` 还提供了 `log!` 和 `log_enabled!` 宏，后者用于确定一条消息在当前模块中，对于给定的日志级别是否能够被记录

```rust
use log::Level::Debug;
use log::{debug, log_enabled};

// 判断能否记录 Debug 消息
if log_enabled!(Debug) {
    let data = expensive_call();
     // 下面的日志记录较为昂贵，因此我们先在前面判断了是否能够记录，能，才继续这里的逻辑
    debug!("expensive debug data: {} {}", data.x, data.y);
}
if log_enabled!(target: "Global", Debug) {
   let data = expensive_call();
   debug!(target: "Global", "expensive debug data: {} {}", data.x, data.y);
}
```

而 `log!` 宏就简单的多，它是一个通用的日志记录方式，因此需要我们手动指定日志级别：
```rust
use log::{log, Level};

let data = (42, "Forty-two");
let private_data = "private";

log!(Level::Error, "Received errors: {}, {}", data.0, data.1);
log!(target: "app_events", Level::Warn, "App warning: {}, {}, {}",
    data.0, data.1, private_data);
```

## 日志输出在哪里？
我不知道有没有同学尝试运行过上面的代码，但是我知道，就算你们运行了，也看不到任何输出。

为什么？原因很简单，`log` 仅仅是日志门面库，**它并不具备完整的日志库功能！**，因此你无法在控制台中看到任何日志输出，这种情况下，说实话，远不如一个 `println!` 有用！

但是别急，让我们看看该如何让 `log` 有用起来。


## 使用具体的日志库
`log` 包这么设计，其实是有很多好处的。

### Rust 库的开发者
最直接的好处就是，如果你是一个 Rust 库开发者，那你自己或库的用户肯定都不希望这个库绑定任何具体的日志库，否则用户想使用 `log1` 来记录日志，你的库却使用了 `log2`，这就存在很多问题了！

因此，**作为库的开发者，你只要在库中使用门面库即可**，将具体的日志库交给用户去选择和绑定。
```rust
use log::{info, trace, warn};
pub fn deal_with_something() {
    // 开始处理

    // 记录一些日志
    trace!("a trace log");
    info!("a info long: {}", "abc");
    warn!("a warning log: {}, retrying", err);

    // 结束处理
}
```

### 应用开发者
如果是应用开发者，那你的应用运行起来，却看不到任何日志输出，这种场景想想都捉急。此时就需要去选择一个具体的日志库了。

目前来说，已经有了不少日志库实现，官方也[推荐了一些](https://github.com/rust-lang/log#in-executables)
，大家可以根据自己的需求来选择，不过 [env_logger](https://docs.rs/env_logger/*/env_logger/) 是一个相当不错的选择。

`log` 还提供了 [set_logger](https://docs.rs/log/0.4.8/log/fn.set_logger.html) 函数用于设置日志库，[set_max_level](https://docs.rs/log/0.4.8/log/fn.set_max_level.html) 用于设置最大日志级别，但是如果你选了具体的日志库，它往往会提供更高级的 API，无需我们手动调用这两个函数，例如下面的 `env_logger` 就是如此。

#### env_logger

修改 `Cargo.toml` , 添加以下内容:
```toml
# in Cargo.toml

[dependencies]
log = "0.4.0"
env_logger = "0.9"
```

在 `src/main.rs` 中添加如下代码：
```rust
use log::{debug, error, log_enabled, info, Level};

fn main() {
    // 注意，env_logger 必须尽可能早的初始化
    env_logger::init();

    debug!("this is a debug {}", "message");
    error!("this is printed by default");

    if log_enabled!(Level::Info) {
        let x = 3 * 4; // expensive computation
        info!("the answer was: {}", x);
    }
}
```

在运行程序时，可以通过环境变量来设定日志级别:
```shell
$ RUST_LOG=error ./main
[2017-11-09T02:12:24Z ERROR main] this is printed by default
```

我们还可以为单独一个模块指定日志级别:
```shell
$ RUST_LOG=main=info ./main
[2017-11-09T02:12:24Z ERROR main] this is printed by default
[2017-11-09T02:12:24Z INFO main] the answer was: 12
```

还能为某个模块开启所有日志级别：
```shell
$ RUST_LOG=main ./main
[2017-11-09T02:12:24Z DEBUG main] this is a debug message
[2017-11-09T02:12:24Z ERROR main] this is printed by default
[2017-11-09T02:12:24Z INFO main] the answer was: 12
```

需要注意的是，如果文件名包含 `-`，你需要将其替换成下划线来使用，原因是 Rust 的模块和包名不支持使用 `-`。
```shell
$ RUST_LOG=my_app ./my-app
[2017-11-09T02:12:24Z DEBUG my_app] this is a debug message
[2017-11-09T02:12:24Z ERROR my_app] this is printed by default
[2017-11-09T02:12:24Z INFO my_app] the answer was: 12
```

默认情况下，`env_logger` 会输出到标准错误 `stderr`，如果你想要输出到标准输出 `stdout`，可以使用 `Builder` 来改变日志对象( target ):
```rust
use std::env;
use env_logger::{Builder, Target};

let mut builder = Builder::from_default_env();
builder.target(Target::Stdout);

builder.init();
```

默认
```rust
   if cfg!(debug_assertions) {
       eprintln!("debug: {:?} -> {:?}",
              record, fields);
     }
```

### 日志库开发者
对于这类开发者而言，自然要实现自己的 `Log` 特征咯:

```rust
use log::{Record, Level, Metadata};
struct SimpleLogger;
impl log::Log for SimpleLogger {
    fn enabled(&self, metadata: &Metadata) -> bool {
        metadata.level() <= Level::Info
    }
    fn log(&self, record: &Record) {
        if self.enabled(record.metadata()) {
            println!("{} - {}", record.level(), record.args());
        }
    }
    fn flush(&self) {}
}
```

除此之外，我们还需要像 `env_logger` 一样包装下 `set_logger` 和 `set_max_level`:
```rust
use log::{SetLoggerError, LevelFilter};
static LOGGER: SimpleLogger = SimpleLogger;
pub fn init() -> Result<(), SetLoggerError> {
    log::set_logger(&LOGGER)
        .map(|()| log::set_max_level(LevelFilter::Info))
}
```


## 更多示例
关于 `log` 门面库和具体的日志库还有更多的使用方式，详情请参见锈书的[开发者工具](https://rusty.course.rs/devtools/log.html)一章。

