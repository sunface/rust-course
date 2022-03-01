# 疯狂字符串
字符串让人疯狂，这句话用在 Rust 中一点都不夸张，不信？那你能否清晰的说出 `String`、`str`、`&str`、`&String`、`Box<str>` 或 `Box<&str>` 的区别？

Rust 语言的类型可以大致分为两种：基本类型和标准库类型，前者是由语言特性直接提供的，而后者是在标准库中定义。即将登场的 `str` 类型就是唯一定义在语言特性中的字符串。

> 在继续之前，大家需要先了解字符串的[基本知识](https://course.rs/basic/compound-type/string-slice.html)，本文主要在于概念对比，而不是字符串讲解

## str
如上所述，`str` 是唯一定义在 Rust 语言特性中的字符串，但是也是我们几乎不会用到的字符串类型，为何？

原因在于 `str` 字符串它是 [`DST` 动态大小类型](https://course.rs/advance/custom-type.html#动态大小类型)，这意味着编译器无法在编译期知道 `str` 类型的大小，只有到了运行期才能动态获知，这对于强类型、强安全的 Rust 语言来说是不可接受的。

```rust
let string: str = "banana";
```

上面代码创建一个 `str` 类型的字符串，看起来很正常，但是编译就会报错：
```shell
error[E0277]: the size for values of type `str` cannot be known at compilation time
 --> src/main.rs:4:9
  |
4 |     let string: str = "banana";
  |         ^^^^^^ doesn't have a size known at compile-time
```

如果追求更深层的原因，我们可以总结如下：**所有的切片都是动态类型，它们都无法直接被使用，而 `str` 就是字符串切片，`[u8]` 是数组切片。**


同时还是 String 和 &str 的底层数据类型。 由于 str 是动态

`str` 类型是硬编码进可执行文件，也无法被修改，但是 `String` 则是一个可增长、可改变且具有所有权的 UTF8 编码字符串，**当 Rust 用户提到字符串时，往往指的就是 `String` 类型和 `&str` 字符串切片类型，这两个类型都是 UTF8 编码**。

除了 `String` 类型的字符串，Rust 的标准库还提供了其他类型的字符串，例如 `OsString`， `OsStr`， `CsString` 和` CsStr` 等，注意到这些名字都以 `String` 或者 `Str` 结尾了吗？它们分别对应的是具有所有权和被借用的变量。


https://pic1.zhimg.com/80/v2-177bce575bfaf289ae12d677689a26f4_1440w.png
https://pic2.zhimg.com/80/v2-697ad53cb502ccec4b2e98c40975344f_1440w.png


https://medium.com/@alisomay/strings-in-rust-28c08a2d3130