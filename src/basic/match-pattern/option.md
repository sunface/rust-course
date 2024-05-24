# 解构 Option

在枚举那章，提到过 `Option` 枚举，它用来解决 Rust 中变量是否有值的问题，定义如下：

```rust,ignore,mdbook-runnable
enum Option<T> {
    Some(T),
    None,
}
```

简单解释就是：**一个变量要么有值：`Some(T)`, 要么为空：`None`**。

那么现在的问题就是该如何去使用这个 `Option` 枚举类型，根据我们上一节的经验，可以通过 `match` 来实现。

> 因为 `Option`，`Some`，`None` 都包含在 `prelude` 中，因此你可以直接通过名称来使用它们，而无需以 `Option::Some` 这种形式去使用，总之，千万不要因为调用路径变短了，就忘记 `Some` 和 `None` 也是 `Option` 底下的枚举成员！

## 匹配 `Option<T>`

使用 `Option<T>`，是为了从 `Some` 中取出其内部的 `T` 值以及处理没有值的情况，为了演示这一点，下面一起来编写一个函数，它获取一个 `Option<i32>`，如果其中含有一个值，将其加一；如果其中没有值，则函数返回 `None` 值：

```rust,ignore,mdbook-runnable
fn plus_one(x: Option<i32>) -> Option<i32> {
    match x {
        None => None,
        Some(i) => Some(i + 1),
    }
}

let five = Some(5);
let six = plus_one(five);
let none = plus_one(None);
```

`plus_one` 接受一个 `Option<i32>` 类型的参数，同时返回一个 `Option<i32>` 类型的值（这种形式的函数在标准库内随处所见），在该函数的内部处理中，如果传入的是一个 `None` ，则返回一个 `None` 且不做任何处理；如果传入的是一个 `Some(i32)`，则通过模式绑定，把其中的值绑定到变量 `i` 上，然后返回 `i+1` 的值，同时用 `Some` 进行包裹。

为了进一步说明，假设 `plus_one` 函数接受的参数值 x 是 `Some(5)`，来看看具体的分支匹配情况：

#### 传入参数 `Some(5)`

```rust,ignore,mdbook-runnable,ignore
None => None,
```

首先是匹配 `None` 分支，因为值 `Some(5)` 并不匹配模式 `None`，所以继续匹配下一个分支。

```rust,ignore,mdbook-runnable,ignore
Some(i) => Some(i + 1),
```

`Some(5)` 与 `Some(i)` 匹配吗？当然匹配！它们是相同的成员。`i` 绑定了 `Some` 中包含的值，因此 `i` 的值是 `5`。接着匹配分支的代码被执行，最后将 `i` 的值加一并返回一个含有值 `6` 的新 `Some`。

#### 传入参数 None

接着考虑下 `plus_one` 的第二个调用，这次传入的 `x` 是 `None`， 我们进入 `match` 并与第一个分支相比较。

```rust,ignore,mdbook-runnable,ignore
None => None,
```

匹配上了！接着程序继续执行该分支后的代码：返回表达式 `None` 的值，也就是返回一个 `None`，因为第一个分支就匹配到了，其他的分支将不再比较。
