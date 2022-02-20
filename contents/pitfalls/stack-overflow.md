# 线程类型导致的栈溢出

在 Rust 中，我们不太容易遇到栈溢出，因为默认栈还挺大的，而且大的数据往往存在堆上(动态增长)，但是一旦遇到该如何处理？先来看段代码：
```rust
#![feature(test)]
extern crate test;

#[cfg(test)]
mod tests {
    use test::Bencher;

    #[bench]
    fn it_works(b: &mut Bencher) {
        b.iter(|| { let stack = [[[0.0; 2]; 512]; 512]; });
    }
}
```

以上代码是一个测试模块，它在堆上生成了一个数组`stack`，初步看起来数组挺大的，先尝试运行下`cargo test`:
> 你很可能会遇到`#![feature(test)]`错误，因为该特性目前只存在`Rust Nightly`版本上，具体解决方法见[Rust语言圣经](https://course.rs/appendix/rust-version.html#在指定目录使用rust-nightly)

```console
running 1 test

thread 'tests::it_works' has overflowed its stack
fatal runtime error: stack overflow
```

Bang，很不幸，遇到了百年一遇的栈溢出错误，再来试试`cargo bench`，竟然通过了测试，这是什么原因？为何`cargo test`和`cargo bench`拥有完全不同的行为？这就要从 Rust 的栈原理讲起。

首先看看`stack`数组，它的大小是`8 × 2 × 512 × 512 = 4 MiB`，嗯，很大，崩溃也正常(读者说，正常，只是作者你不太正常。。).

其次，`cargo test`和`cargo bench`，前者运行在一个新创建的线程上，而后者运行在**main线程上**.

最后，`main`线程由于是老大，所以资源比较多，拥有令其它兄弟艳羡不已的`8MB`栈大小，而其它新线程只有区区`2MB`栈大小(取决于操作系统,`linux`是`2MB`,其它的可能更小)，再对比我们的`stack`大小，不崩溃就奇怪了。

因此，你现在明白，为何`cargo test`不能运行，而`cargo bench`却可以欢快运行。

如果实在想要增大栈的默认大小，以通过该测试，你可以这样运行:`RUST_MIN_STACK=8388608 cargo test`,结果如下：
```console
running 1 test
test tests::it_works ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```
Bingo, 成功了,最后再补充点测试的背景知识:

> `cargo test`为何使用新线程？因为它需要并行的运行测试用例，与之相反，`cargo bench`只需要顺序的执行，因此main线程足矣



