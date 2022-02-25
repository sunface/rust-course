# &'static 和 T: 'static
Rust 的难点之一就在于它有不少容易混淆的概念，例如 `&str` 、`str` 与 `String`， 再比如本文标题那两位。不过与字符串也有不同，这两位对于普通用户来说往往是无需进行区分的，但是当大家想要深入学习或使用 Rust 时，它们就会成为成功路上的拦路虎了。

与生命周期的其它章节不同，本文短小精悍，阅读过程可谓相当轻松愉快，话不多说，let's go。

`'static` 在 Rust 中是相当常见的，例如字符串字面值就具有 `'static` 生命周期:
```rust
fn main() {
  let mark_twain: &str = "Samuel Clemens";
  print_author(mark_twain);
}
fn print_author(author: &'static str) {
  println!("{}", author);
}
```

除此之外，特征对象的生命周期也是 `'static`，例如[这里](https://course.rs/fight-with-compiler/lifetime/closure-with-static.html#特征对象的生命周期)所提到的。

除了 `&'static` 的用法外，我们在另外一种场景中也可以见到 `'static` 的使用:
```rust
use std::fmt::Display;
fn main() {
    let mark_twain = "Samuel Clemens";
    print(&mark_twain);
}

fn print<T: Display + 'static>(message: &T) {
    println!("{}", message);
}
```

在这里，很明显 `'static` 是作为生命周期约束来使用了。 **那么问题来了， `&'static` 和 `T: 'static` 的用法到底有何区别？** 

## `&'static`
`&'static` 对于生命周期有着非常强的要求：一个引用必须要活得跟剩下的程序一样久，才能被标注为 `&'static`。

对于字符串字面量来说，它直接被打包到二进制文件中，永远不会被 `drop`，因此它能跟程序活得一样久，自然它的生命周期是 `'static`。

但是，**`&'static` 生命周期针对的仅仅是引用，而不是持有该引用的变量，对于变量来说，还是要遵循相应的作用域规则** :
```rust
use std::{slice::from_raw_parts, str::from_utf8_unchecked};

fn get_memory_location() -> (usize, usize) {
  // “Hello World” 是字符串字面量，因此它的生命周期是 `'static`.
  // 但持有它的变量 `string` 的生命周期就不一样了，它完全取决于变量作用域，对于该例子来说，也就是当前的函数范围
  let string = "Hello World!";
  let pointer = string.as_ptr() as usize;
  let length = string.len();
  (pointer, length)
  // `string` 在这里被 drop 释放
  // 虽然变量被释放，无法再被访问，但是数据依然还会继续存活
}

fn get_str_at_location(pointer: usize, length: usize) -> &'static str {
  // 使用原生指针需要 `unsafe{}` 语句块
  unsafe { from_utf8_unchecked(from_raw_parts(pointer as *const u8, length)) }
}

fn main() {
  let (pointer, length) = get_memory_location();
  let message = get_str_at_location(pointer, length);
  println!(
    "The {} bytes at 0x{:X} stored: {}",
    length, pointer, message
  );
  // 如果大家想知道为何处理原生指针需要 `unsafe`，可以试着反注释以下代码
  // let message = get_str_at_location(1000, 10);
}
```

上面代码有两点值得注意：
- `&'static` 的引用确实可以和程序活得一样久，因为我们通过 `get_str_at_location` 函数直接取到了对应的字符串
- 持有 `&'static` 引用的变量，它的生命周期受到作用域的限制，大家务必不要搞混了

## `T: 'static`
相比起来，我们的生命周期约束就弱得多了，它只能试图向编译器表达：如果可以的话，我想要一个可以一直存活的变量， see ? 跟 `&'static` 表达的强度完全不一样，下面用例子来说明:
```rust
use std::fmt::Display;

fn main() {
  let r1;
  let r2;
  {
    static STATIC_EXAMPLE: i32 = 42;
    r1 = &STATIC_EXAMPLE;
    let x = "&'static str";
    r2 = x;
    // r1 和 r2 持有的数据都是 'static 的，因此在花括号结束后，并不会被释放
  }
  
  println!("&'static i32: {}", r1); // -> 42
  println!("&'static str: {}", r2); // -> &'static str

  let r3: &str;

  {
    let s1 = "String".to_string();

    // s1 虽然没有 'static 生命周期，但是它依然可以满足 T: 'static 的约束
    // 充分说明这个约束是多么的弱。。
    static_bound(&s1); 

    // s1 是 String 类型，没有 'static 的生命周期，因此下面代码会报错
    r3 = &s1; 
    
    // s1 在这里被 drop
  }
  println!("{}", r3);
}

fn static_bound<T: Display + 'static>(t: &T) {
  println!("{}", t);
}
```

以上代码充分说明了两个问题：

- `'static` 生命周期的数据可以一直存活，因此 `r1` 和 `r2` 才能在语句块内部被赋值
- `T: 'static` 的约束真的很弱，`s1` 明明生命周期只在内部语句块内有效，但是该约束依然可以满足，`static_bound` 成功被调用

## 两者的区别
总之， `&'static` != `T: 'static` ，虽然它们看起来真的非常像。

为了进一步验证，我们修改下 `static_bound` 的签名 :
```rust
use std::fmt::Display;

fn main() {
    let s1 = "String".to_string();
    
    static_bound(&s1);
}

fn static_bound<T: Display>(t: &'static T) {
    println!("{}", t);
}
```

在这里，不再使用生命周期约束来限制 `T`，而直接指定 `T` 的生命周期是 `&'static` ，不出所料，代码报错了：
```console
error[E0597]: `s1` does not live long enough
 --> src/main.rs:8:18
  |
8 |     static_bound(&s1);
  |     -------------^^^-
  |     |            |
  |     |            borrowed value does not live long enough
  |     argument requires that `s1` is borrowed for `'static`
9 | }
  | - `s1` dropped here while still borrowed
```

原因很简单，`s1` 活得不够久，没有满足 `'static` 的生命周期要求。

## 使用经验
至此，相信大家对于 `'static` 和 `T: 'static` 也有了清晰的理解，那么我们应该如何使用它们呢？

作为经验之谈，可以这么来:

- 如果你需要添加 `&'static` 来让代码工作，那很可能是设计上出问题了
- 如果你希望满足和取悦编译器，那就使用 `T: 'static`，很多时候它都能解决问题

> 一个小知识，在 Rust 标准库中，有 48 处用到了 &'static ，112 处用到了 `T: 'static` ，看来取悦编译器不仅仅是菜鸟需要的，高手也经常用到 :)

