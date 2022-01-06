# 避免递归函数栈溢出

当一个递归函数，输入值很大时，可能会造成stack overflow问题，例如对一个图，进行深度优先搜索，那么这种时候该如何解决呢？我们提供了两种方法：

1. 使用Rust编译器提供的`generator`特性，这个在目前版本还需要`nightly-rust`,该特性可以把递归函数展开为迭代器(iterator)来执行:

```rust
#![feature(generators, generator_trait)]
use std::ops::{Generator, GeneratorState};
use std::pin::Pin;

// 原递归函数
fn triangular(n: u64) -> u64 {
    if n == 0 {
        0
    } else {
        n + triangular(n - 1)
    }
}

// 新stack-safe函数，通过下面的generator进行展开，不会造成栈溢出
fn triangular_safe(n: u64) -> u64 {
    // `move |_|`是Rust编译器的generator语法
    trampoline(|n| move |_| {
        if n == 0 {
            0
        } else {
            // 使用`yield`关键字来替代递归函数名
            n + yield (n - 1)
        }
    })(n)
}

// 这是一个高阶函数
// 该函数不仅仅能处理triangular这种类型的递归函数，它可以处理一切fn(A) -> B形式的递归函数，只要满足A不包含任何可变/// 的引用.
// 这里f是一个generator函数，它是在上面的函数中通过yield关键字产生的
// 我们可以把f想象成一个可以中断的循环函数，而不是调用自身的递归函数，这个循环是由一个f调用流组成
fn trampoline<Arg, Res, Gen>(
    f: impl Fn(Arg) -> Gen
) -> impl Fn(Arg) -> Res
where
    Res: Default,
    Gen: Generator<Res, Yield = Arg, Return = Res> + Unpin,
{
    move |arg: Arg| {
        let mut stack = Vec::new();
        let mut current = f(arg);
        let mut res = Res::default();

        loop {
            match Pin::new(&mut current).resume(res) {
                GeneratorState::Yielded(arg) => {
                    stack.push(current);
                    current = f(arg);
                    res = Res::default();
                }
                GeneratorState::Complete(real_res) => {
                    match stack.pop() {
                        None => return real_res,
                        Some(top) => {
                            current = top;
                            res = real_res;
                        }
                    }
                }
            }
        }
    }
}

fn main() {
    const LARGE: u64 = 1_000_000;

    assert_eq!(triangular_safe(LARGE), LARGE * (LARGE + 1) / 2);
    println!("`triangular_safe` has not overflowed its stack.");

    println!("`triangular` will overflow its stack soon...");
    assert_eq!(triangular(LARGE), LARGE * (LARGE + 1) / 2);
}
```

上面的实现确实复杂了，但是非常安全，而且也挺高效的，我们有过一个性能测试，对于`Tarjan’s`算法，使用该方式仅仅比递归方式损失了5%的性能

2. 使用`proc macro`实现的三方包:[`decurse`](https://github.com/wishawa/decurse)

简而言之，该包是通过把递归变为异步执行(async/await)的方式来实现的，

```rust
#[decurse::decurse] // 👈 加上该行既可以避免栈溢出
fn factorial(x: u32) -> u32 {
    if x == 0 {
        1
    } else {
        x * factorial(x - 1)
    }
}
```

该方式的优点是**简单**，且无需**`nightly-rust`**，缺点是性能没有第一种高