# 基准测试benchmark
几乎所有开发都知道，如果要测量程序的性能，就需要性能测试。

性能测试包含了两种：压力测试和基准测试。前者是针对接口 API，模拟大量用户去访问接口然后生成接口级别的性能数据；而后者是针对代码，可以用来测试某一段代码的运行速度，例如一个排序算法。

而本文将要介绍的就是基准测试 `benchmark`，在 Rust 中，有两种方式可以实现：

- 官方提供的 `benchmark`
- 社区实现，例如 `criterion.rs`

事实上我们更推荐后者，原因在后文会详细介绍，下面先从官方提供的工具开始。


## 官方benchmark
官方提供的测试工具，目前最大的问题就是只能在非 `stable` 下使用，原因是需要在代码中引入 `test` 特性: `#![feature(test)]`。

#### 设置 Rust 版本
因此在开始之前，我们需要先将当前仓库中的 [`Rust 版本`](https://course.rs/appendix/rust-version.html#不稳定功能)从 `stable` 切换为 `nightly`:

1. 安装 `nightly` 版本：`$ rustup install nightly`
2. 使用以下命令确认版本已经安装成功
```shell
$ rustup toolchain list 
stable-aarch64-apple-darwin (default)
nightly-aarch64-apple-darwin (override)
```
3. 进入 `adder` 项目(之前为了学习测试专门创建的项目)的根目录，然后运行 `rustup override set nightly`，将该项目使用的 `rust` 设置为 `nightly`

很简单吧，其实只要一个命令就可以切换指定项目的 Rust 版本，例如你还能在基准测试后再使用 `rustup override set stable` 切换回 `stable` 版本。

#### 使用 benchmark
当完成版本切换后，就可以开始正式编写 `benchmark` 代码了。首先，将 `src/lib.rs` 中的内容替换成如下代码：
```rust
#![feature(test)]

extern crate test;

pub fn add_two(a: i32) -> i32 {
    a + 2
}

#[cfg(test)]
mod tests {
    use super::*;
    use test::Bencher;

    #[test]
    fn it_works() {
        assert_eq!(4, add_two(2));
    }

    #[bench]
    fn bench_add_two(b: &mut Bencher) {
        b.iter(|| add_two(2));
    }
}
```

可以看出，`benchmark` 跟单元测试区别不大，最大的区别在于它是通过 `#[bench]` 标注，而单元测试是通过 `#[test]` 进行标注，这意味着 `cargo test` 将不会运行 `benchmark` 代码：
```shell
$ cargo test
running 2 tests
test tests::bench_add_two ... ok
test tests::it_works ... ok

test result: ok. 2 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

`cargo test` 直接把我们的 `benchmark` 代码当作单元测试处理了，因此没有任何性能测试的结果产生。

对此，需要使用 `cargo bench` 命令：
```shell
$ cargo bench
running 2 tests
test tests::it_works ... ignored
test tests::bench_add_two ... bench:           0 ns/iter (+/- 0)

test result: ok. 0 passed; 0 failed; 1 ignored; 1 measured; 0 filtered out; finished in 0.29s
```

看到没，一个截然不同的结果，除此之外还能看出几点:

- 单元测试 `it_works` 被忽略，并没有执行: `tests::it_works ... ignored`
- benchmark 的结果是 `0 ns/iter`，表示每次迭代( `b.iter` )耗时 `0 ns`，奇怪，怎么是 `0` 纳秒呢？别急，原因后面会讲

#### 一些使用建议
关于 `benchmark`，这里有一些使用建议值得大家关注:

- 将初始化代码移动到 `b.iter` 循环之外，否则每次循环迭代都会初始化一次，这里只应该存放需要精准测试的代码
- 让代码每次都做一样的事情，例如不要去做累加或状态更改的操作
- 最好让 `iter` 之外的代码也具有幂等性，因为它也可能被 `benchmark` 运行多次
- 循环内的代码应该尽量的短小快速，因为这样循环才能被尽可能多的执行，结果也会更加准确

#### 迷一般的性能结果
在写 `benchmark` 时，你可能会遇到一些很纳闷的棘手问题，例如以下代码:
```rust
#![feature(test)]

extern crate test;

fn fibonacci_u64(number: u64) -> u64 {
    let mut last: u64 = 1;
    let mut current: u64 = 0;
    let mut buffer: u64;
    let mut position: u64 = 1;

    return loop {
        if position == number {
            break current;
        }

        buffer = last;
        last = current;
        current = buffer + current; 
        position += 1;
    };
}
#[cfg(test)]
mod tests {
    use super::*;
    use test::Bencher;

    #[test]
    fn it_works() {
       assert_eq!(fibonacci_u64(1), 0); 
       assert_eq!(fibonacci_u64(2), 1); 
       assert_eq!(fibonacci_u64(12), 89); 
       assert_eq!(fibonacci_u64(30), 514229); 
    }

    #[bench]
    fn bench_u64(b: &mut Bencher) {
        b.iter(|| {
            for i in 100..200 {
                fibonacci_u64(i);
            }
        });
    }
}
```
通过`cargo bench`运行后，得到一个难以置信的结果：`test tests::bench_u64 ... bench: 0 ns/iter (+/- 0)`, 难道Rust已经到达量子计算机级别了？

其实，原因藏在`LLVM`中: `LLVM`认为`fibonacci_u64`函数调用的结果没有使用，同时也认为该函数没有任何副作用(造成其它的影响，例如修改外部变量、访问网络等), 因此它有理由把这个函数调用优化掉！

解决很简单，使用 Rust 标准库中的 `black_box` 函数:
```rust
 for i in 100..200 {
    test::black_box(fibonacci_u64(test::black_box(i)));
}
```

通过这个函数，我们告诉编译器，让它尽量少做优化，此时 LLVM 就不会再自作主张了:)

```shell
$ cargo bench
running 2 tests
test tests::it_works ... ignored
test tests::bench_u64 ... bench:       5,626 ns/iter (+/- 267)

test result: ok. 0 passed; 0 failed; 1 ignored; 1 measured; 0 filtered out; finished in 0.67s
```

嗯，这次结果就明显正常了。


## criterion.rs
官方 `benchmark` 有两个问题，首先就是不支持 `stable` 版本的 Rust，其次是结果有些简单，缺少更详细的统计分布。

因此社区 `benchmark` 就应运而生，其中最有名的就是 [`criterion.rs`](https://github.com/bheisler/criterion.rs)，它有几个重要特性:

- 统计分析，例如可以跟上一次运行的结果进行差异比对
- 图表，使用 [`gnuplots`](http://www.gnuplot.info) 展示详细的结果图表

首先，如果你需要图表，需要先安装 `gnuplots`，其次，我们需要引入相关的包，在 `Cargo.toml` 文件中新增 :
```toml
[dev-dependencies]
criterion = "0.3"

[[bench]]
name = "my_benchmark"
harness = false
```

接着，在项目中创建一个测试文件: `$PROJECT/benches/my_benchmark.rs`，然后加入以下内容：
```rust
use criterion::{black_box, criterion_group, criterion_main, Criterion};

fn fibonacci(n: u64) -> u64 {
    match n {
        0 => 1,
        1 => 1,
        n => fibonacci(n-1) + fibonacci(n-2),
    }
}

fn criterion_benchmark(c: &mut Criterion) {
    c.bench_function("fib 20", |b| b.iter(|| fibonacci(black_box(20))));
}

criterion_group!(benches, criterion_benchmark);
criterion_main!(benches);
```

最后，使用 `cargo bench` 运行并观察结果：
```shell
     Running target/release/deps/example-423eedc43b2b3a93
Benchmarking fib 20
Benchmarking fib 20: Warming up for 3.0000 s
Benchmarking fib 20: Collecting 100 samples in estimated 5.0658 s (188100 iterations)
Benchmarking fib 20: Analyzing
fib 20                  time:   [26.029 us 26.251 us 26.505 us]
Found 11 outliers among 99 measurements (11.11%)
  6 (6.06%) high mild
  5 (5.05%) high severe
slope  [26.029 us 26.505 us] R^2            [0.8745662 0.8728027]
mean   [26.106 us 26.561 us] std. dev.      [808.98 ns 1.4722 us]
median [25.733 us 25.988 us] med. abs. dev. [234.09 ns 544.07 ns]
```

可以看出，这个结果是明显比官方的更详尽的，如果大家希望更深入的学习它的使用，可以参见[官方文档](https://bheisler.github.io/criterion.rs/book/getting_started.html)。


