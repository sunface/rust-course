# 基本类型

当一门语言不谈类型时，你得小心，这大概率是动态语言(别拍我，我承认是废话)。但是把类型大张旗鼓的用多个章节去讲的，Rust 是其中之一。

Rust 每个值都有其确切的数据类型，总的来说可以分为两类：基本类型和复合类型。 基本类型意味着它们往往是一个最小化原子类型，无法解构为其它类型(一般意义上来说)，由以下组成：

- 数值类型: 有符号整数 (`i8`, `i16`, `i32`, `i64`, `isize`)、 无符号整数 (`u8`, `u16`, `u32`, `u64`, `usize`) 、浮点数 (`f32`, `f64`)、以及有理数、复数
- 字符串：字符串字面量和字符串切片 `&str`
- 布尔类型： `true`和`false`
- 字符类型: 表示单个 Unicode 字符，存储为 4 个字节
- 单元类型: 即 `()` ，其唯一的值也是 `()`

## 类型推导与标注

与 Python、Javascript 等动态语言不同，Rust 是一门静态类型语言，也就是编译器必须在编译期知道我们所有变量的类型，但这不意味着你需要为每个变量指定类型，因为 **Rust 编译器很聪明，它可以根据变量的值和上下文中的使用方式来自动推导出变量的类型**，同时编译器也不够聪明，在某些情况下，它无法推导出变量类型，需要手动去给予一个类型标注，关于这一点在 [Rust 语言初印象](https://course.rs/first-try/hello-world.html#rust-语言初印象)中有过展示。

来看段代码：

```rust
let guess = "42".parse().expect("Not a number!");
```

先忽略 `.parse().expect..` 部分，这段代码的目的是将字符串 `"42"` 进行解析，而编译器在这里无法推导出我们想要的类型：整数？浮点数？字符串？因此编译器会报错：

```console
$ cargo build
   Compiling no_type_annotations v0.1.0 (file:///projects/no_type_annotations)
error[E0282]: type annotations needed
 --> src/main.rs:2:9
  |
2 |     let guess = "42".parse().expect("Not a number!");
  |         ^^^^^ consider giving `guess` a type
```

因此我们需要提供给编译器更多的信息，例如给 `guess` 变量一个**显式的类型标注**：`let guess: i32 = ...` 或者 `"42".parse::<i32>()`。
