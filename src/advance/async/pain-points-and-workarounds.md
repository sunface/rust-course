# 一些疑难问题的解决办法

`async` 在 Rust 依然比较新，疑难杂症少不了，而它们往往还处于活跃开发状态，短时间内无法被解决，因此才有了本文。下面一起来看看这些问题以及相应的临时解决方案。

## 在 async 语句块中使用 ?

`async` 语句块和 `async fn` 最大的区别就是前者无法显式的声明返回值，在大多数时候这都不是问题，但是当配合 `?` 一起使用时，问题就有所不同:

```rust
async fn foo() -> Result<u8, String> {
    Ok(1)
}
async fn bar() -> Result<u8, String> {
    Ok(1)
}
pub fn main() {
    let fut = async {
        foo().await?;
        bar().await?;
        Ok(())
    };
}
```

以上代码编译后会报错:

```shell
error[E0282]: type annotations needed
  --> src/main.rs:14:9
   |
11 |     let fut = async {
   |         --- consider giving `fut` a type
...
14 |         Ok(1)
   |         ^^ cannot infer type for type parameter `E` declared on the enum `Result`
```

原因在于编译器无法推断出 `Result<T, E>` 中的 `E` 的类型， 而且编译器的提示 ```consider giving `fut` a type``` 你也别傻乎乎的相信，然后尝试半天，最后无奈放弃：目前还没有办法为 `async` 语句块指定返回类型。

既然编译器无法推断出类型，那咱就给它更多提示，可以使用 `::< ... >` 的方式来增加类型注释：

```rust
let fut = async {
    foo().await?;
    bar().await?;
    Ok::<(), String>(()) // 在这一行进行显式的类型注释
};
```

给予类型注释后此时编译器就知道 `Result<T, E>` 中的 `E` 的类型是 `String`，进而成功通过编译。

## async 函数和 Send 特征

在多线程章节我们深入讲过 `Send` 特征对于多线程间数据传递的重要性，对于 `async fn` 也是如此，它返回的 `Future` 能否在线程间传递的关键在于 `.await` 运行过程中，作用域中的变量类型是否是 `Send`。

学到这里，相信大家已经很清楚 `Rc` 无法在多线程环境使用，原因就在于它并未实现 `Send` 特征，那咱就用它来做例子:

```rust
use std::rc::Rc;

#[derive(Default)]
struct NotSend(Rc<()>);
```

事实上，未实现 `Send` 特征的变量可以出现在 `async fn` 语句块中:

```rust
async fn bar() {}
async fn foo() {
    NotSend::default();
    bar().await;
}

fn require_send(_: impl Send) {}

fn main() {
    require_send(foo());
}
```

即使上面的 `foo` 返回的 `Future` 是 `Send`， 但是在它内部短暂的使用 `NotSend` 依然是安全的，原因在于它的作用域并没有影响到 `.await`，下面来试试声明一个变量，然后让 `.await` 的调用处于变量的作用域中试试:

```rust
async fn foo() {
    let x = NotSend::default();
    bar().await;
}
```

不出所料，错误如期而至:

```shell
error: future cannot be sent between threads safely
  --> src/main.rs:17:18
   |
17 |     require_send(foo());
   |                  ^^^^^ future returned by `foo` is not `Send`
   |
   = help: within `impl futures::Future<Output = ()>`, the trait `std::marker::Send` is not implemented for `Rc<()>`
note: future is not `Send` as this value is used across an await
  --> src/main.rs:11:5
   |
10 |     let x = NotSend::default();
   |         - has type `NotSend` which is not `Send`
11 |     bar().await;
   |     ^^^^^^^^^^^ await occurs here, with `x` maybe used later
12 | }
   | - `x` is later dropped here
```

提示很清晰，`.await`在运行时处于 `x` 的作用域内。在之前章节有提到过， `.await` 有可能被执行器调度到另一个线程上运行，而 `Rc` 并没有实现 `Send`，因此编译器无情拒绝了咱们。

其中一个可能的解决方法是在 `.await` 之前就使用 `std::mem::drop` 释放掉 `Rc`，但是很可惜，截止今天，该方法依然不能解决这种问题。

不知道有多少同学还记得语句块 `{ ... }` 在 Rust 中其实具有非常重要的作用(特别是相比其它大多数语言来说时)：可以将变量声明在语句块内，当语句块结束时，变量会自动被 Drop，这个规则可以帮助我们解决很多借用冲突问题，特别是在 `NLL` 出来之前。

```rust
async fn foo() {
    {
        let x = NotSend::default();
    }
    bar().await;
}
```

是不是很简单？最终我们还是通过 Drop 的方式解决了这个问题，当然，还是期待未来 `std::mem::drop` 也能派上用场。

## 递归使用 async fn

在内部实现中，`async fn` 被编译成一个状态机，这会导致递归使用 `async fn` 变得较为复杂， 因为编译后的状态机还需要包含自身。

```rust
// foo函数:
async fn foo() {
    step_one().await;
    step_two().await;
}
// 会被编译成类似下面的类型：
enum Foo {
    First(StepOne),
    Second(StepTwo),
}

// 因此 recursive 函数
async fn recursive() {
    recursive().await;
    recursive().await;
}

// 会生成类似以下的类型
enum Recursive {
    First(Recursive),
    Second(Recursive),
}
```

这是典型的[动态大小类型](https://course.rs/advance/into-types/sized.html#动态大小类型-dst)，它的大小会无限增长，因此编译器会直接报错:

```shell
error[E0733]: recursion in an `async fn` requires boxing
 --> src/lib.rs:1:22
  |
1 | async fn recursive() {
  |                      ^ an `async fn` cannot invoke itself directly
  |
  = note: a recursive `async fn` must be rewritten to return a boxed future.
```

如果认真学过之前的章节，大家应该知道只要将其使用 `Box` 放到堆上而不是栈上，就可以解决，在这里还是要称赞下 Rust 的编译器，给出的提示总是这么精确 ```recursion in an `async fn` requires boxing```。

就算是使用 `Box`，这里也大有讲究。如果我们试图使用 `Box::pin` 这种方式去包裹是不行的，因为编译器自身的限制限制了我们(刚夸过它。。。)。为了解决这种问题，我们只能将 `recursive` 转变成一个正常的函数，该函数返回一个使用 `Box` 包裹的 `async` 语句块：

```rust
use futures::future::{BoxFuture, FutureExt};

fn recursive() -> BoxFuture<'static, ()> {
    async move {
        recursive().await;
        recursive().await;
    }.boxed()
}
```

## 在特征中使用 async

在目前版本中，我们还无法在特征中定义 `async fn` 函数，不过大家也不用担心，目前已经有计划在未来移除这个限制了。

```rust
trait Test {
    async fn test();
}
```

运行后报错:

```shell
error[E0706]: functions in traits cannot be declared `async`
 --> src/main.rs:5:5
  |
5 |     async fn test();
  |     -----^^^^^^^^^^^
  |     |
  |     `async` because of this
  |
  = note: `async` trait functions are not currently supported
  = note: consider using the `async-trait` crate: https://crates.io/crates/async-trait
```

好在编译器给出了提示，让我们使用 [`async-trait`](https://github.com/dtolnay/async-trait) 解决这个问题:

```rust
use async_trait::async_trait;

#[async_trait]
trait Advertisement {
    async fn run(&self);
}

struct Modal;

#[async_trait]
impl Advertisement for Modal {
    async fn run(&self) {
        self.render_fullscreen().await;
        for _ in 0..4u16 {
            remind_user_to_join_mailing_list().await;
        }
        self.hide_for_now().await;
    }
}

struct AutoplayingVideo {
    media_url: String,
}

#[async_trait]
impl Advertisement for AutoplayingVideo {
    async fn run(&self) {
        let stream = connect(&self.media_url).await;
        stream.play().await;

        // 用视频说服用户加入我们的邮件列表
        Modal.run().await;
    }
}
```

不过使用该包并不是免费的，每一次特征中的 `async` 函数被调用时，都会产生一次堆内存分配。对于大多数场景，这个性能开销都可以接受，但是当函数一秒调用几十万、几百万次时，就得小心这块儿代码的性能了！

