# 函数

Rust的函数我们在之前已经见过不少，跟其他语言几乎没有什么区别。因此本章的学习之路将轻松和愉快，骚年们，请珍惜这种愉快，下一章你将体验到不一样的Rust。

在函数界，有一个函数只闻其名不闻其声，可以止小孩啼，在程序界只有`hello,world!`可以与之媲美，它就是`add`函数：

```rust
fn add(i: i32, j: i32) -> i32 {
   i + j
 }
```

该函数如此简单，但是又是如此的五脏俱全，声明函数的关键字`fn`,函数名`add()`,参数`i`和`j`，参数类型和返回值类型都是`i32`，总之一切那么的普通，但是又那么的自信，直到你看到了下面这张图：

<img alt="" src="/img/function-01.png" class="center"  />

当你看懂了这张图，其实就等于差不多完成了函数章节的学习。但是这么短的章节显然对不起读者老爷们的厚爱，所以我们来展开下。

函数有以下需要注意的点：
- 函数名和变量名使用[蛇形命名法(snake case)](../../style-guide/naming.md)，例如`fn add_two() -> {}`
- 函数的位置可以随便放，Rust不关心我们在哪里定义了函数，只要有定义即可
- 每个函数参数都需要标注类型

## 函数参数

Rust是强类型语言，因此需要你为每一个函数参数都标识出它的具体类型，例如：
```rust
fn main() {
    another_function(5, 6.1);
}

fn another_function(x: i32, y: f32) {
    println!("The value of x is: {}", x);
    println!("The value of y is: {}", y);
}
```

`another_function`函数有两个参数，其中`x`是`i32`类型，`y`是`f32`类型，然后在该函数内部，打印出这两个值。这里去掉`x`或者`y`的任何一个的类型，都会报错：
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
  = note: anonymous parameters are removed in the 2018 edition (see RFC 1685) // 匿名参数在Rust 2018 edition中就已经移除
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
在上一章节语句和表达式中，我们提到在Rust中，函数就是表达式，因此我们可以把函数的返回值直接赋给调用者。不像有些语言，会给返回值一个名称，在Rust中，只需要声明返回值的类型即可(在`->`之后，`{`之前})。

函数的返回值就是函数体最后一条表达式的返回值，当然我们也可以使用`return`提前返回，下面的函数使用最后一条表达式来返回一个值：
```rust
fn plus_five(x:i32) -> i32 {
    x + 5
}

fn main() {
    let x = plus_five(5);

    println!("The value of x is: {}", x);
}
```

`x + 5`是一条表达式，求值后，返回一个值，因为它是函数的最后一行，因此该表达式的值也是函数的返回值。

再来看两个重点：
1. `let x = add_five(5)`，说明我们用一个函数的返回值来初始化`x`变量，因此侧面说明了在Rust中函数也是表达式， 这种写法等同于`let x = 5 + 5;`
2. `x + 5`没有分号，因为它是一条表达式，这个在上一节中我们也有详细介绍

再来看一段代码，同时使用`return`和表达式作为返回值:
```rust
fn plus_or_substract(x:i32) -> i32 {
    if x > 5 {
        return x - 5
    }

    x + 5
}

fn main() {
    let x = plus_or_substract(5);

    println!("The value of x is: {}", x);
}
```

`plus_or_substract`函数根据传入`x`的大小来决定是做加法还是减法，若`x > 5`则通过`return`提前返回`x - 5`的值,否则返回`x + 5`的值。