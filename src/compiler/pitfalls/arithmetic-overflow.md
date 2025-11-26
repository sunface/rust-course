# 算术溢出导致的 panic

在 Rust 中，溢出后的数值被截断是很正常的:

```rust
let x: u16 = 65535;
let v = x as u8;
println!("{}", v)
```

最终程序会输出`255`, 因此大家可能会猜测算术溢出在 Rust 中也会只导致截断。但是实际上，如果在 debug 模式下运行，算术溢出会引发 panic:

```rust
#[allow(arithmetic_overflow)] // 阻止编译器在编译时发现问题
fn main() {
    let x: u8 = 10;
    let v = x + u8::MAX;
    println!("{}", v)
}
```

而在 release 模式下为了最大化性能，编译器不会插入算术溢出检查，所以不会导致 panic，而是变成[二补数](https://stackoverflow.com/a/60238510/19171888)。

如何理解这种拧巴的行为？为了处理算术溢出，Rust 的基本运算实则以下关联函数：

- `wrapping_xxx`：正常时返回数值，溢出时回到值域的另一端（`MAX+1=MIN`, `MIN-1=MAX`）
- `check_xxx`：正常时返回`Some(x)`，溢出时返回`None`
- `unchecked_xxx`：正常时返回数值，溢出时 UB，不安全
- `saturating_xxx`：正常时返回数值，溢出时定在值域边缘（`MAX+1=MAX`, `MIN-1=MIN`）
- `overflowing_xxx`：正常时返回`(x, false)`，溢出时返回`(wrapped(x), true)`
- `strict_xxx`：正常时返回数值，溢出时 panic

特别地，除以`0`在任何情况下都会被检查。

运算符的默认行为在 debug 模式下是`strict_xxx`，release 模式下是`wrapping`。想在 release 模式下也默认到`strict_xxx`，可以在`Cargo.toml`加上：

```toml
[profile.release]
overflow-checks = true
```

也许你会觉得本章内容其实算不上什么陷阱，但是在实际项目快速迭代中，越是不起眼的地方越是容易出错：

```rust
fn main() {
    let v = production_rate_per_hour(5);
    println!("{}", v);
}

pub fn production_rate_per_hour(speed: u8) -> f64 {
    let cph: u8 = 221;
    match speed {
        1..=4 => (speed * cph) as f64,
        5..=8 => (speed * cph) as f64 * 0.9,
        9..=10 => (speed * cph) as f64 * 0.77,
        _ => 0 as f64,
    }
}

pub fn working_items_per_minute(speed: u8) -> u32 {
    (production_rate_per_hour(speed) / 60 as f64) as u32
}
```

上述代码在 debug 模式下`speed * cph`就会直接 panic:

```console
thread 'main' panicked at 'attempt to multiply with overflow', src/main.rs:10:18
```

release 模式下则输出`72.9`。

是不是还藏的挺隐蔽的？因此大家在 Rust 中做数学运算时，要多留一个心眼，免得上了生产才发现问题。或者直接打开`overflow-checks`直接 panic。
