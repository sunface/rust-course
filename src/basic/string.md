# 字符串

在其他语言，字符串往往是送分题，因为实在是太简单了，例如`"hello, world"`就是字符串章节的几乎全部内容了，对吧？如果你带着这样的想法来学Rust，
我保证，绝对会栽跟头，**因此这一章大家一定要重视，仔细阅读，这里有很多其它Rust书籍中没有的内容**。

首先来看段很简单的代码：
```rust
fn main() {
  let my_name = "Pascal";
  greet(my_name);
}

fn greet(name: String) {
  println!("Hello, {}!", name);
}
```

`greet`函数接受一个字符串类型的`name`参数，然后打印到终端控制台中，非常好理解，你们猜猜，这段代码能否通过编译？

```conole
error[E0308]: mismatched types
 --> src/main.rs:3:11
  |
3 |     greet(my_name);
  |           ^^^^^^^
  |           |
  |           expected struct `std::string::String`, found `&str`
  |           help: try using a conversion method: `my_name.to_string()`

error: aborting due to previous error
```

Bingo，果然报错了，编译器提示`greet`函数需要一个`String`类型的字符串，却传入了一个`&str`类型的字符串，相信读者心中现在一定有几头草泥马呼啸而过，怎么字符串也能整出这么多花活？

接下来，让我们逐点分析讲解。

## 什么是字符串?

顾名思义，字符串是由字符组成的连续集合，但是在上一节中我们提到过，**Rust中的字符是Unicode类型，因此每个字符占据4个字节内存空间，但是在字符串中不一样，字符串是UTF8编码，也就是字符所占的字节数是变长的(2-4)**，这样有助于大幅降低字符串所占用的内存空间.

Rust在语言级别，只有一中字符串类型：`str`，它通常是以引用类型(更准确的说法是[借用](../../core/borrowing.md)，这个概念在后面会讲)出现`&str`，


## String底层剖析

https://rustwiki.org/zh-CN/book/ch04-01-what-is-ownership.html#变量与数据交互的方式一移动

> 为何`String`长度和容量会不一致？
> 之前提到过`String`是一个可修改、可增长的字符串，因此它是可变的，但是不可能在每次改变，我们都重新生成一次堆上的内存空间，这种成本太高了，因此