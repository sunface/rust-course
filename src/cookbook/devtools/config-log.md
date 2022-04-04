# 配置日志

### 为每个模块开启独立的日志级别
下面代码创建了模块 `foo` 和嵌套模块 `foo::bar`，并通过 [RUST_LOG](https://docs.rs/env_logger/*/env_logger/#enabling-logging) 环境变量对各自的日志级别进行了控制。

```rust,editable
mod foo {
    mod bar {
        pub fn run() {
            log::warn!("[bar] warn");
            log::info!("[bar] info");
            log::debug!("[bar] debug");
        }
    }

    pub fn run() {
        log::warn!("[foo] warn");
        log::info!("[foo] info");
        log::debug!("[foo] debug");
        bar::run();
    }
}

fn main() {
    env_logger::init();
    log::warn!("[root] warn");
    log::info!("[root] info");
    log::debug!("[root] debug");
    foo::run();
}
```

要让环境变量生效，首先需要通过 `env_logger::init()` 开启相关的支持。然后通过以下命令来运行程序:
```shell
RUST_LOG="warn,test::foo=info,test::foo::bar=debug" ./test
```

此时的默认日志级别被设置为 `warn`，但我们还将 `foo` 模块级别设置为 `info`, `foo::bar` 模块日志级别设置为 `debug`。

```bash
WARN:test: [root] warn
WARN:test::foo: [foo] warn
INFO:test::foo: [foo] info
WARN:test::foo::bar: [bar] warn
INFO:test::foo::bar: [bar] info
DEBUG:test::foo::bar: [bar] debug
```

### 使用自定义环境变量来设置日志

[Builder](https://docs.rs/env_logger/*/env_logger/struct.Builder.html) 将对日志进行配置，以下代码使用 `MY_APP_LOG` 来替代 `RUST_LOG` 环境变量:

```rust,editable
use std::env;
use env_logger::Builder;

fn main() {
    Builder::new()
        .parse(&env::var("MY_APP_LOG").unwrap_or_default())
        .init();

    log::info!("informational message");
    log::warn!("warning message");
    log::error!("this is an error {}", "message");
}
```

### 在日志中包含时间戳

```rust,editable
use std::io::Write;
use chrono::Local;
use env_logger::Builder;
use log::LevelFilter;

fn main() {
    Builder::new()
        .format(|buf, record| {
            writeln!(buf,
                "{} [{}] - {}",
                Local::now().format("%Y-%m-%dT%H:%M:%S"),
                record.level(),
                record.args()
            )
        })
        .filter(None, LevelFilter::Info)
        .init();

    log::warn!("warn");
    log::info!("info");
    log::debug!("debug");
}
```

以下是 `stderr` 的输出:
```shell
2022-03-22T21:57:06 [WARN] - warn
2022-03-22T21:57:06 [INFO] - info
```

### 将日志输出到指定文件
[log4rs](https://docs.rs/log4rs/) 可以帮我们将日志输出指定的位置，它可以使用外部 YAML 文件或 `builder` 的方式进行配置。

```rust,editable
# use error_chain::error_chain;

use log::LevelFilter;
use log4rs::append::file::FileAppender;
use log4rs::encode::pattern::PatternEncoder;
use log4rs::config::{Appender, Config, Root};

#error_chain! {
#    foreign_links {
#        Io(std::io::Error);
#        LogConfig(log4rs::config::Errors);
#        SetLogger(log::SetLoggerError);
#    }
#}

fn main() -> Result<()> {
    // 创建日志配置，并指定输出的位置
    let logfile = FileAppender::builder()
        // 编码模式的详情参见: https://docs.rs/log4rs/1.0.0/log4rs/encode/pattern/index.html
        .encoder(Box::new(PatternEncoder::new("{l} - {m}\n")))
        .build("log/output.log")?;

    let config = Config::builder()
        .appender(Appender::builder().build("logfile", Box::new(logfile)))
        .build(Root::builder()
                   .appender("logfile")
                   .build(LevelFilter::Info))?;

    log4rs::init_config(config)?;

    log::info!("Hello, world!");

    Ok(())
}

```