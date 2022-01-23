# Traits

Trait 是一系列方法的集合。

数据类型可以实现 trait。为此需要帮数据类型定义好构成 trait 的方法。 
例如，`String` 类型实现了 `From<&str>` trait。它赋予我们能力写出 `String::from("hello")`。

如此一来，trait 就有点类似于 Java 的接口和 C++ 的抽象类。

另外一些常见的 Rust trait 包括：
- `Clone` （`clone` 方法）
- `Display` (实现通过 `{}` 进行格式化显示)
- `Debug` (实现通过 `{:?}` 进行格式化显示 )

因为 trait 标明了数据类型之间的共有行为，所以它在编写泛型时非常有用。

## 更多信息

- [Traits](https://doc.rust-lang.org/book/ch10-02-traits.html)
