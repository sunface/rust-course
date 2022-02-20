# 闭包上奇怪的生命周期

Rust 一道独特的靓丽风景就是生命周期，也是反复折磨新手的最大黑手，就连老手，可能一不注意就会遇到一些生命周期上的陷阱，例如闭包上使用引用。

## 一段简单的代码
先来看一段简单的代码:
```rust
fn fn_elision(x: &i32) -> &i32 { x } 
let closure_slision = |x: &i32| -> &i32 { x };
```

乍一看，这段代码比古天乐还平平无奇，能有什么问题呢？来，走两圈试试：
```console
error: lifetime may not live long enough 
  --> src/main.rs:39:39
   |
39 |     let closure = |x: &i32| -> &i32 { x }; // fails
   |                       -        -      ^ returning this value requires that `'1` must outlive `'2`
   |                       |        |
   |                       |        let's call the lifetime of this reference `'2`
   |                       let's call the lifetime of this reference `'1`
```

咦？竟然报错了，明明两个一模一样功能的函数，一个正常编译，一个却报错，错误原因是编译器无法推测返回的引用和传入的引用谁活得更久！

真的是非常奇怪的错误，学过[Rust生命周期](https://course.rs/advance/lifetime/basic.html)的读者应该都记得这样一条生命周期消除规则: **如果函数参数中只有一个引用类型，那该引用的生命周期会被自动分配给所有的返回引用**。我们当前的情况完美符合，`fn_elision`函数的顺利编译通过，就充分说明了问题。

那为何闭包就出问题了？

## 一段复杂的代码
为了验证闭包无法应用生命周期消除规则，再来看一个复杂一些的例子:
```rust
use std::marker::PhantomData;

trait Parser<'a>: Sized + Copy {
    fn parse(&self, tail: &'a str) -> &'a str {
        tail
    }
    fn wrap(self) -> Wrapper<'a, Self> {
        Wrapper {
            parser: self,
            marker: PhantomData,
        }
    }
}

#[derive(Copy, Clone)]
struct T<'x> {
    int: &'x i32,
}

impl<'a, 'x> Parser<'a> for T<'x> {}

struct Wrapper<'a, P>
where
    P: Parser<'a>,
{
    parser: P,
    marker: PhantomData<&'a ()>,
}

fn main() {
    // Error.
    let closure_wrap = |parser: T| parser.wrap();

    // No error.
    fn parser_wrap(parser: T<'_>) -> Wrapper<'_, T<'_>> {
        parser.wrap()
    }
}
```

该例子之所以这么复杂，纯粹是为了证明闭包上生命周期会失效，读者大大轻拍:) 编译后，不出所料的报错了：
```console
error: lifetime may not live long enough
  --> src/main.rs:32:36
   |
32 |     let closure_wrap = |parser: T| parser.wrap();
   |                         ------   - ^^^^^^^^^^^^^ returning this value requires that `'1` must outlive `'2`
   |                         |        |
   |                         |        return type of closure is Wrapper<'_, T<'2>>
   |                         has type `T<'1>`
```

## 深入调查
一模一样的报错，说明在这种情况下，生命周期的消除规则也没有生效，看来事情确实不简单，我眉头一皱，决定深入调查，最后还真翻到了一些讨论，经过整理后，大概分享给大家。

首先给出一个结论：**这个问题，可能很难被解决，建议大家遇到后，还是老老实实用正常的函数，不要秀闭包了**。

对于函数的生命周期而言，它的消除规则之所以能生效是因为它的生命周期完全体现在签名的引用类型上，在函数体中无需任何体现:
```rust
fn fn_elision(x: &i32) -> &i32 {..}
```
因此编译器可以做各种编译优化，也很容易根据参数和返回值进行生命周期的分析，最终得出消除规则。

可是闭包，并没有函数那么简单，它的生命周期分散在参数和闭包函数体中(主要是它没有确切的返回值签名)：
```rust
let closure_slision = |x: &i32| -> &i32 { x };
```

编译器就必须深入到闭包函数体中，去分析和推测生命周期，复杂度因此极具提升：试想一下，编译器该如何从复杂的上下文中分析出参数引用的生命周期和闭包体中生命周期的关系？

由于上述原因(当然，实际情况复杂的多)， Rust 语言开发者其实目前是有意为之，针对函数和闭包实现了两种不同的生命周期消除规则。

## 总结
虽然我言之凿凿，闭包的生命周期无法解决，但是未来谁又知道呢。最大的可能性就是之前开头那种简单的场景，可以被自动识别和消除。

总之，如果有这种需求，还是像古天乐一样做一个平平无奇的男人，老老实实使用函数吧。