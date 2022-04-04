# 日志

## log 包
[log](https://docs.rs/crate/log/0.4.16) 提供了日志相关的实用工具。

### 在控制台打印 debug 信息
`env_logger` 通过环境变量来配置日志。[log::debug!](https://docs.rs/log/0.4.16/log/macro.debug.html) 使用起来跟 [std::fmt](https://doc.rust-lang.org/std/fmt/) 中的格式化字符串很像。

```rust
fn execute_query(query: &str) {
    log::debug!("Executing query: {}", query);
}

fn main() {
    env_logger::init();

    execute_query("DROP TABLE students");
}
```

如果大家运行代码，会发现没有任何日志输出，原因是默认的日志级别是 `error`，因此我们需要通过 `RUST_LOG` 环境变量来设置下新的日志级别：
```shell
$ RUST_LOG=debug cargo run
```

然后你将成功看到以下输出:
```shell
DEBUG:main: Executing query: DROP TABLE students
```

### 将错误日志输出到控制台
下面我们通过 [log::error!](https://docs.rs/log/0.4.16/log/macro.error.html) 将错误日志输出到标准错误 `stderr`。

```rust
fn execute_query(_query: &str) -> Result<(), &'static str> {
    Err("I'm afraid I can't do that")
}

fn main() {
    env_logger::init();

    let response = execute_query("DROP TABLE students");
    if let Err(err) = response {
        log::error!("Failed to execute query: {}", err);
    }
}
```

### 将错误输出到标准输出 stdout
默认的错误会输出到标准错误输出 `stderr`，下面我们通过自定的配置来让错误输出到标准输出 `stdout`。

```rust,editable
use env_logger::{Builder, Target};

fn main() {
    Builder::new()
        .target(Target::Stdout)
        .init();

    log::error!("This error has been printed to Stdout");
}
```

### 使用自定义 logger
下面的代码将实现一个自定义 logger `ConsoleLogger`，输出到标准输出 `stdout`。为了使用日志宏，`ConsoleLogger` 需要实现 [log::Log](https://docs.rs/log/*/log/trait.Log.html) 特征，然后使用 [log::set_logger](https://docs.rs/log/*/log/fn.set_logger.html) 来安装使用。

```rust,editable
use log::{Record, Level, Metadata, LevelFilter, SetLoggerError};

static CONSOLE_LOGGER: ConsoleLogger = ConsoleLogger;

struct ConsoleLogger;

impl log::Log for ConsoleLogger {
  fn enabled(&self, metadata: &Metadata) -> bool {
     metadata.level() <= Level::Info
    }

    fn log(&self, record: &Record) {
        if self.enabled(record.metadata()) {
            println!("Rust says: {} - {}", record.level(), record.args());
        }
    }

    fn flush(&self) {}
}

fn main() -> Result<(), SetLoggerError> {
    log::set_logger(&CONSOLE_LOGGER)?;
    log::set_max_level(LevelFilter::Info);

    log::info!("hello log");
    log::warn!("warning");
    log::error!("oops");
    Ok(())
}
```

### 输出到 Unix syslog
下面的代码将使用 [syslog](https://docs.rs/crate/syslog/6.0.1) 包将日志输出到 [Unix Syslog](https://www.gnu.org/software/libc/manual/html_node/Overview-of-Syslog.html).

```rust,editable
#[cfg(target_os = "linux")]
#[cfg(target_os = "linux")]
use syslog::{Facility, Error};

#[cfg(target_os = "linux")]
fn main() -> Result<(), Error> {
    // 初始化 logger
    syslog::init(Facility::LOG_USER,
                 log::LevelFilter::Debug,
                 // 可选的应用名称
                 Some("My app name"))?;
    log::debug!("this is a debug {}", "message");
    log::error!("this is an error!");
    Ok(())
}

#[cfg(not(target_os = "linux"))]
fn main() {
    println!("So far, only Linux systems are supported.");
}
```


## tracing
@todo