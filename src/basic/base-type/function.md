# 函数

Rust 的函数我们在之前已经见过不少，跟其他语言几乎没有什么区别。因此本章的学习之路将轻松和愉快，骚年们，请珍惜这种愉快，下一章你将体验到不一样的 Rust。

在函数界，有一个函数只闻其名不闻其声，可以止小孩啼！在程序界只有 `hello,world!` 可以与之媲美，它就是 `add` 函数：

```rust
fn add(i: i32, j: i32) -> i32 {
   i + j
 }
```

该函数如此简单，但是又是如此的五脏俱全，声明函数的关键字 `fn`，函数名 `add()`，参数 `i` 和 `j`，参数类型和返回值类型都是 `i32`，总之一切那么的普通，但是又那么的自信，直到你看到了下面这张图：

<img alt="" src="https://pic2.zhimg.com/80/v2-54b3a6d435d2482243edc4be9ab98153_1440w.png" class="center"  />

当你看懂了这张图，其实就等于差不多完成了函数章节的学习，但是这么短的章节显然对不起读者老爷们的厚爱，所以我们来展开下。

## 函数要点

- 函数名和变量名使用[蛇形命名法(snake case)](https://course.rs/practice/naming.html)，例如 `fn add_two() -> {}`
- 函数的位置可以随便放，Rust 不关心我们在哪里定义了函数，只要有定义即可
- 每个函数参数都需要标注类型

## 函数参数

Rust 是静态类型语言，因此需要你为每一个函数参数都标识出它的具体类型，例如：

```rust
fn main() {
    another_function(5, 6.1);
}

fn another_function(x: i32, y: f32) {
    println!("The value of x is: {}", x);
    println!("The value of y is: {}", y);
}
```

`another_function` 函数有两个参数，其中 `x` 是 `i32` 类型，`y` 是 `f32` 类型，然后在该函数内部，打印出这两个值。这里去掉 `x` 或者 `y` 的任何一个的类型，都会报错：

```rust
fn main() {
    another_function(5, 6.1);
}

fn another_function(x: i32, y) {
    println!("The value of x is: {}", x);
    println!("The value of y is: {}", y);
}
```

错误如下:

```console
error: expected one of `:`, `@`, or `|`, found `)`
 --> src/main.rs:5:30
  |
5 | fn another_function(x: i32, y) {
  |                              ^ expected one of `:`, `@`, or `|` // 期待以下符号之一 `:`, `@`, or `|`
  |
  = note: anonymous parameters are removed in the 2018 edition (see RFC 1685)
    // 匿名参数在 Rust 2018 edition 中就已经移除
help: if this is a parameter name, give it a type // 如果y是一个参数名，请给予它一个类型
  |
5 | fn another_function(x: i32, y: TypeName) {
  |                             ~~~~~~~~~~~
help: if this is a type, explicitly ignore the parameter name // 如果y是一个类型，请使用_忽略参数名
  |
5 | fn another_function(x: i32, _: y) {
  |                             ~~~~
```

## 函数返回

在上一章节语句和表达式中，我们有提到，在 Rust 中函数就是表达式，因此我们可以把函数的返回值直接赋给调用者。

函数的返回值就是函数体最后一条表达式的返回值，当然我们也可以使用 `return` 提前返回，下面的函数使用最后一条表达式来返回一个值：

```rust
fn plus_five(x:i32) -> i32 {
    x + 5
}

fn main() {
    let x = plus_five(5);

    println!("The value of x is: {}", x);
}
```

`x + 5` 是一条表达式，求值后，返回一个值，因为它是函数的最后一行，因此该表达式的值也是函数的返回值。

再来看两个重点：

1. `let x = plus_five(5)`，说明我们用一个函数的返回值来初始化 `x` 变量，因此侧面说明了在 Rust 中函数也是表达式，这种写法等同于 `let x = 5 + 5;`
2. `x + 5` 没有分号，因为它是一条表达式，这个在上一节中我们也有详细介绍

再来看一段代码，同时使用 `return` 和表达式作为返回值：

```rust
fn plus_or_minus(x:i32) -> i32 {
    if x > 5 {
        return x - 5
    }

    x + 5
}

fn main() {
    let x = plus_or_minus(5);

    println!("The value of x is: {}", x);
}
```

`plus_or_minus` 函数根据传入 `x` 的大小来决定是做加法还是减法，若 `x > 5` 则通过 `return` 提前返回 `x - 5` 的值,否则返回 `x + 5` 的值。

#### Rust 中的特殊返回类型

##### 无返回值`()`

对于 Rust 新手来说，有些返回类型很难理解，而且如果你想通过百度或者谷歌去搜索，都不好查询，因为这些符号太常见了，根本难以精确搜索到。

例如单元类型 `()`，是一个零长度的元组。它没啥作用，但是可以用来表达一个函数没有返回值：

- 函数没有返回值，那么返回一个 `()`
- 通过 `;` 结尾的语句返回一个 `()`

例如下面的 `report` 函数会隐式返回一个 `()`：

```rust
use std::fmt::Debug;

fn report<T: Debug>(item: T) {
  println!("{:?}", item);

}
```

与上面的函数返回值相同，但是下面的函数显式的返回了 `()`：

```rust
fn clear(text: &mut String) -> () {
  *text = String::from("");
}
```

在实际编程中，你会经常在错误提示中看到该 `()` 的身影出没，假如你的函数需要返回一个 `u32` 值，但是如果你不幸的以 `表达式;` 的语句形式作为函数的最后一行代码，就会报错：

```rust
fn add(x:u32,y:u32) -> u32 {
    x + y;
}
```

错误如下：

```console
error[E0308]: mismatched types // 类型不匹配
 --> src/main.rs:6:24
  |
6 | fn add(x:u32,y:u32) -> u32 {
  |    ---                 ^^^ expected `u32`, found `()` // 期望返回u32,却返回()
  |    |
  |    implicitly returns `()` as its body has no tail or `return` expression
7 |     x + y;
  |          - help: consider removing this semicolon
```

还记得我们在[语句与表达式](https://course.rs/basic/base-type/statement-expression.html)中讲过的吗？只有表达式能返回值，而 `;` 结尾的是语句，在 Rust 中，一定要严格区分**表达式**和**语句**的区别，这个在其它语言中往往是被忽视的点。

##### 永不返回的发散函数 `!`

当用 `!` 作函数返回类型的时候，表示该函数永不返回( diverging functions )，特别的，这种语法往往用做会导致程序崩溃的函数：

```rust
fn dead_end() -> ! {
  panic!("你已经到了穷途末路，崩溃吧！");
}
```

下面的函数创建了一个无限循环，该循环永不跳出，因此函数也永不返回：

```rust
fn forever() -> ! {
  loop {
    //...
  };
}
```

## 课后练习

> [Rust By Practice](https://practice-zh.course.rs/basic-types/functions.html)，支持代码在线编辑和运行，并提供详细的[习题解答](https://github.com/sunface/rust-by-practice/blob/master/solutions/basic-types/functions.md)。
