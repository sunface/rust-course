# 时间计算和转换

### 测量某段代码的耗时
测量从 [time::Instant::now](https://doc.rust-lang.org/std/time/struct.Instant.html#method.now) 开始所经过的时间 [time::Instant::elapsed](https://doc.rust-lang.org/std/time/struct.Instant.html#method.elapsed).

```rust,editable
use std::time::{Duration, Instant};

fn main() {
    let start = Instant::now();
    expensive_function();
    let duration = start.elapsed();

    println!("Time elapsed in expensive_function() is: {:?}", duration);
}
```

### 对日期和时间进行计算
使用 [DateTime::checked_add_signed](https://docs.rs/chrono/*/chrono/struct.Date.html#method.checked_add_signed) 计算和显示从现在开始两周后的日期和时间，然后再计算一天前的日期 [DateTime::checked_sub_signed](https://docs.rs/chrono/*/chrono/struct.Date.html#method.checked_sub_signed)。

[DateTime::format](https://docs.rs/chrono/*/chrono/struct.DateTime.html#method.format) 所支持的转义序列可以在 [chrono::format::strftime](https://docs.rs/chrono/*/chrono/format/strftime/index.html) 找到.

```rust,editable
use chrono::{DateTime, Duration, Utc};

fn day_earlier(date_time: DateTime<Utc>) -> Option<DateTime<Utc>> {
    date_time.checked_sub_signed(Duration::days(1))
}

fn main() {
    let now = Utc::now();
    println!("{}", now);

    let almost_three_weeks_from_now = now.checked_add_signed(Duration::weeks(2))
            .and_then(|in_2weeks| in_2weeks.checked_add_signed(Duration::weeks(1)))
            .and_then(day_earlier);

    match almost_three_weeks_from_now {
        Some(x) => println!("{}", x),
        None => eprintln!("Almost three weeks from now overflows!"),
    }

    match now.checked_add_signed(Duration::max_value()) {
        Some(x) => println!("{}", x),
        None => eprintln!("We can't use chrono to tell the time for the Solar System to complete more than one full orbit around the galactic center."),
    }
}
```

### 将本地时间转换成其它时区
使用 [offset::Local::now](https://docs.rs/chrono/*/chrono/offset/struct.Local.html#method.now) 获取本地时间并进行显示，接着，使用 [DateTime::from_utc](https://docs.rs/chrono/*/chrono/struct.DateTime.html#method.from_utc) 将它转换成 UTC 标准时间。最后，再使用 [offset::FixedOffset](https://docs.rs/chrono/*/chrono/offset/struct.FixedOffset.html) 将 UTC 时间转换成 UTC+8 和 UTC-2 的时间。

```rust,editable
use chrono::{DateTime, FixedOffset, Local, Utc};

fn main() {
    let local_time = Local::now();
    let utc_time = DateTime::<Utc>::from_utc(local_time.naive_utc(), Utc);
    let china_timezone = FixedOffset::east(8 * 3600);
    let rio_timezone = FixedOffset::west(2 * 3600);
    println!("Local time now is {}", local_time);
    println!("UTC time now is {}", utc_time);
    println!(
        "Time in Hong Kong now is {}",
        utc_time.with_timezone(&china_timezone)
    );
    println!("Time in Rio de Janeiro now is {}", utc_time.with_timezone(&rio_timezone));
}
```