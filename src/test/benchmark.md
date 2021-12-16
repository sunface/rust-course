# 性能测试


## benchmark迷一般的性能结果
代码如下
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

解决很简单，使用Rust标准库中的[`black_box`](https://doc.rust-lang.org/std/hint/fn.black_box.html)函数:
```rust
for i in 100..200 {
    black_box(fibonacci_u64(black_box(i)));
}
```

通过这个函数，告诉编译器，尽量少的做优化，此时LLVM就不会再自作主张了:)