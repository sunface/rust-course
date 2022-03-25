# 断言 assertion

在编写测试函数时，断言决定了我们的测试是通过还是失败，它为结果代言。在前面，大家已经见识过 `assert_eq!` 的使用，下面一起来看看 Rust 为我们提供了哪些好用的断言。

## 断言列表

在正式开始前，来看看常用的断言有哪些:

- `assert!`, `assert_eq!`, `assert_ne!`, 它们会在所有模式下运行
- `debug_assert!`, `debug_assert_eq!`, `debug_assert_ne!`, 它们只会在 `Debug` 模式下运行

## assert_eq!

`assert_eq!` 宏可以用于判断两个表达式返回的值是否相等 :

```rust
fn main() {
    let a = 3;
    let b = 1 + 2;
    assert_eq!(a, b);
}
```

当不相等时，当前线程会直接 `panic`:

```rust
fn main() {
    let a = 3;
    let b = 1 + 3;
    assert_eq!(a, b, "我们在测试两个数之和{} + {}，这是额外的错误信息", a, b);
}
```

运行后报错如下:

```shell
$ cargo run
thread 'main' panicked at 'assertion failed: `(left == right)`
  left: `3`,
 right: `4`: 我们在测试两个数之和3 + 4，这是额外的错误信息', src/main.rs:4:5
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace
```

可以看到，错误不仅按照预期发生了，我们还成功的定制了错误信息! 这种格式化输出的方式跟 `println!` 并无区别，具体参见 [`std::fmt`](https://doc.rust-lang.org/std/fmt/index.html)。

因为涉及到相等比较( `==` )和错误信息打印，因此两个表达式的值必须实现 `PartialEq` 和 `Debug` 特征，其中所有的原生类型和大多数标准库类型都实现了这些特征，而对于你自己定义的结构体、枚举，如果想要对其进行 `assert_eq!` 断言，则需要实现 `PartialEq` 和 `Debug` 特征:

- 若希望实现个性化相等比较和错误打印，则需手动实现
- 否则可以为自定义的结构体、枚举添加 `#[derive(PartialEq, Debug)]` 注解，来[自动派生](https://course.rs/appendix/derive.html)对应的特征

**以上特征限制对于下面即将讲解的 `assert_ne!` 一样有效，** 就不再重复讲述。

## assert_ne!

`assert_ne!` 在使用和限制上与 `assert_eq!` 并无区别，唯一的区别就在于，前者判断的是两者的不相等性。

我们将之前报错的代码稍作修改：

```rust
fn main() {
    let a = 3;
    let b = 1 + 3;
    assert_ne!(a, b, "我们在测试两个数之和{} + {}，这是额外的错误信息", a, b);
}
```

由于 `a` 和 `b` 不相等，因此 `assert_ne!` 会顺利通过，不再报错。

## assert!

`assert!` 用于判断传入的布尔表达式是否为 `true`:

```rust
// 以下断言的错误信息只包含给定表达式的返回值
assert!(true);

fn some_computation() -> bool { true }

assert!(some_computation());

// 使用自定义报错信息
let x = true;
assert!(x, "x wasn't true!");

// 使用格式化的自定义报错信息
let a = 3; let b = 27;
assert!(a + b == 30, "a = {}, b = {}", a, b);
```

来看看该如何使用 `assert!` 进行单元测试 :

```rust
#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    fn can_hold(&self, other: &Rectangle) -> bool {
        self.width > other.width && self.height > other.height
    }
}


#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn larger_can_hold_smaller() {
        let larger = Rectangle {
            width: 8,
            height: 7,
        };
        let smaller = Rectangle {
            width: 5,
            height: 1,
        };

        assert!(larger.can_hold(&smaller));
    }
}
```

## `debug_assert!` 系列

`debug_assert!`, `debug_assert_eq!`, `debug_assert_ne!` 这三个在功能上与之前讲解的版本并无区别，主要区别在于，`debug_assert!` 系列只能在 `Debug` 模式下输出，例如如下代码：

```rust
fn main() {
    let a = 3;
    let b = 1 + 3;
    debug_assert_eq!(a, b, "我们在测试两个数之和{} + {}，这是额外的错误信息", a, b);
}
```

在 `Debug` 模式下运行输出错误信息：

```shell
$ cargo run
thread 'main' panicked at 'assertion failed: `(left == right)`
  left: `3`,
 right: `4`: 我们在测试两个数之和3 + 4，这是额外的错误信息', src/main.rs:4:5
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace
```

但是在 `Release` 模式下却没有任何输出:

```shell
$ cargo run --release
```

若一些断言检查会影响发布版本的性能时，大家可以使用 `debug_assert!` 来避免这种情况的发生。
