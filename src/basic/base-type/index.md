# 基本类型

基本数据类型在Rust中是最最常见的数据类型，基本类型意味着它们往往是一个最小化原子类型，无法解构为其它类型(一般意义上来说)，基本类型由以下组成：

- 数值类型: 有符号整数 (`i8`, `i16`, `i32`, `i64`, `isize`)、 无符号整数 (`u8`, `u16`, `u32`, `u64`, `usize`) 、浮点数 (`f32`, `f64`)、以及有理数、复数
- 字符串：字符串字面量、字符串切片&str和堆分配字符串String
- 布尔类型： `true`和`false`
- 字符类型: 表示单个Unicode字符，存储为4个字节
- 元类型: 即`()`，其唯一的值也是`()`


## 类型推导与标注

与python、js等动态语言不同，Rust是一门静态类型语言，也就是编译器必须在编译期知道我们所有变量的数据类型，但这不意味着你需要为你的每个变量指定类型，因为**Rust编译器很聪明，它可以根据变量的值和使用方式来自动推导出变量的类型**，同时编译器也不够聪明，在某些情况下，它无法推导出变量类型，需要我们手动去给予一个类型标注，关于这一点在[Rust语言初印象](../first-try/hello-world.md#Rust语言初印象)中有过展示.

再比如以下代码(引用自Rust官方编程那本书):

```rust
let guess = "42".parse().expect("Not a number!");
```

如果这里不添加类型标注，则编译器会报错：
```console
$ cargo build
   Compiling no_type_annotations v0.1.0 (file:///projects/no_type_annotations)
error[E0282]: type annotations needed
 --> src/main.rs:2:9
  |
2 |     let guess = "42".parse().expect("Not a number!");
  |         ^^^^^ consider giving `guess` a type
```

意味着，我们需要提供给编译器更多的信息，例如给`guess`变量一个显示的类型标注: `let guess:i32 = ...` 或者`"42".parse::<i32>()`.

