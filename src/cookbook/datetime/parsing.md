# 解析和显示

### 检查日期和时间
通过 [DateTime](https://docs.rs/chrono/*/chrono/struct.DateTime.html) 获取当前的 UTC 时间:
- [Timelike](https://docs.rs/chrono/*/chrono/trait.Timelike.html), 时/分/秒
- [Datelike](https://docs.rs/chrono/*/chrono/trait.Datelike.html), 年/月/日

```rust,editable
use chrono::{Datelike, Timelike, Utc};

fn main() {
    let now = Utc::now();

    let (is_pm, hour) = now.hour12();
    println!(
        "The current UTC time is {:02}:{:02}:{:02} {}",
        hour,
        now.minute(),
        now.second(),
        if is_pm { "PM" } else { "AM" }
    );
    println!(
        "And there have been {} seconds since midnight",
        now.num_seconds_from_midnight()
    );

    let (is_common_era, year) = now.year_ce();
    println!(
        "The current UTC date is {}-{:02}-{:02} {:?} ({})",
        year,
        now.month(),
        now.day(),
        now.weekday(),
        if is_common_era { "CE" } else { "BCE" }
    );
    println!(
        "And the Common Era began {} days ago",
        now.num_days_from_ce()
    );
}
```

### 日期和时间戳的相互转换

```rust,editable
use chrono::{NaiveDate, NaiveDateTime};

fn main() {
    // 生成一个具体的日期时间
    let date_time: NaiveDateTime = NaiveDate::from_ymd(2017, 11, 12).and_hms(17, 33, 44);
    println!(
        "Number of seconds between 1970-01-01 00:00:00 and {} is {}.",
        // 打印日期和日期对应的时间戳
        date_time, date_time.timestamp());

    // 计算从 1970 1月1日 0:00:00 UTC 开始，10亿秒后是什么日期时间
    let date_time_after_a_billion_seconds = NaiveDateTime::from_timestamp(1_000_000_000, 0);
    println!(
        "Date after a billion seconds since 1970-01-01 00:00:00 was {}.",
        date_time_after_a_billion_seconds);
}
```

### 显示格式化的日期和时间
通过 [Utc::now](https://docs.rs/chrono/*/chrono/offset/struct.Utc.html#method.now) 可以获取当前的 UTC 时间。

```rust,editable
use chrono::{DateTime, Utc};

fn main() {
    let now: DateTime<Utc> = Utc::now();

    println!("UTC now is: {}", now);
    // 使用 RFC 2822 格式显示当前时间
    println!("UTC now in RFC 2822 is: {}", now.to_rfc2822());
    // 使用 RFC 3339 格式显示当前时间
    println!("UTC now in RFC 3339 is: {}", now.to_rfc3339());
    // 使用自定义格式显示当前时间
    println!("UTC now in a custom format is: {}", now.format("%a %b %e %T %Y"));
}
```

### 将字符串解析为 DateTime 结构体
我们可以将多种格式的日期时间字符串转换成 [DateTime](https://docs.rs/chrono/*/chrono/struct.DateTime.html) 结构体。[DateTime::parse_from_str](https://docs.rs/chrono/*/chrono/struct.DateTime.html#method.parse_from_str) 使用的转义序列可以在 [chrono::format::strftime](https://docs.rs/chrono/0.4.19/chrono/format/strftime/index.html) 找到.

只有当能唯一的标识出日期和时间时，才能创建 `DateTime`。如果要在没有时区的情况下解析日期或时间，你需要使用 [`NativeDate`](https://docs.rs/chrono/*/chrono/naive/struct.NaiveDate.html) 等函数。

```rust,editable
use chrono::{DateTime, NaiveDate, NaiveDateTime, NaiveTime};
use chrono::format::ParseError;


fn main() -> Result<(), ParseError> {
    let rfc2822 = DateTime::parse_from_rfc2822("Tue, 1 Jul 2003 10:52:37 +0200")?;
    println!("{}", rfc2822);

    let rfc3339 = DateTime::parse_from_rfc3339("1996-12-19T16:39:57-08:00")?;
    println!("{}", rfc3339);
    
    let custom = DateTime::parse_from_str("5.8.1994 8:00 am +0000", "%d.%m.%Y %H:%M %P %z")?;
    println!("{}", custom);

    let time_only = NaiveTime::parse_from_str("23:56:04", "%H:%M:%S")?;
    println!("{}", time_only);

    let date_only = NaiveDate::parse_from_str("2015-09-05", "%Y-%m-%d")?;
    println!("{}", date_only);

    let no_timezone = NaiveDateTime::parse_from_str("2015-09-05 23:56:04", "%Y-%m-%d %H:%M:%S")?;
    println!("{}", no_timezone);

    Ok(())
}
```