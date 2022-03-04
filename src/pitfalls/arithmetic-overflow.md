# 算术溢出导致的 panic

在 Rust 中，溢出后的数值被截断是很正常的:

```rust
let x: u16 = 65535;
let v = x as u8;
println!("{}", v)
```

最终程序会输出`255`, 因此大家可能会下意识地就觉得算数操作在 Rust 中只会导致结果的不正确，并不会导致异常。但是实际上，如果是因为算术操作符导致的溢出，就会让整个程序 panic:

```rust
fn main() {
    let x: u8 = 10;

    let v = x + u8::MAX;
    println!("{}", v)
}
```

输出结果如下:

```console
thread 'main' panicked at 'attempt to add with overflow', src/main.rs:5:13
```

那么当我们确实有这种需求时，该如何做呢？可以使用 Rust 提供的`checked_xxx`系列方法：

```rust
fn main() {
    let x: u8 = 10;

    let v = x.checked_add(u8::MAX).unwrap_or(0);
    println!("{}", v)
}
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

上述代码中，`speed * cph`就会直接 panic:

```console
thread 'main' panicked at 'attempt to multiply with overflow', src/main.rs:10:18
```

是不是还藏的挺隐蔽的？因此大家在 Rust 中做数学运算时，要多留一个心眼，免得上了生产才发现问题所在。或者，你也可以做好单元测试:)

