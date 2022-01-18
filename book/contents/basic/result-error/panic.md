# panic深入剖析

在正式开始之前，先来思考一个问题：假设我们想要从文件读取数据，如果失败，你有没有好的办法通知调用者为何失败？如果成功，你有没有好的办法把读取的结果返还给调用者？

## panic!与不可恢复错误
上面的问题在真实场景会经常遇到，其实处理起来挺复杂的，让我们先做一个假设：文件读取操作发生在系统启动阶段。那么可以轻易得出一个结论，一旦文件读取失败，那么系统启动也将失败，这意味着该失败是不可恢复的错误，无论是因为文件不存在还是操作系统硬盘的问题，这些只是错误的原因不同，但是归根到底都是不可恢复的错误(梳理清楚当前场景的错误类型非常重要)。

既然是不可恢复错误，那么一旦发生，只需让程序崩溃即可。对此，Rust 为我们提供了 `panic!` 宏，当调用执行该宏时，**程序会打印出一个错误信息，展开报错点往前的函数调用堆栈，最后退出程序**。 

切记，一定是不可恢复的错误，才调用 `panic!` 处理，你总不想系统仅仅因为用户随便传入一个非法参数就崩溃吧？所以，**只有当你不知道该如何处理时，再去调用panic!**.

## 调用panic!
首先，来调用一下 `panic!`，这里使用了最简单的代码实现，实际上你在程序的任何地方都可以这样调用：
```rust
fn main() {
    panic!("crash and burn");
}
```

运行后输出:
```console
thread 'main' panicked at 'crash!!1', src/main.rs:3:5
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace
```

以上信息包含了两条重要信息：
- `main` 函数所在的线程崩溃了，发生的代码位置是 `src/main.rs` 中的第3行第5个字符(去除该行前面的空字符)
- 在使用时加上一个环境变量可以获取更详细的栈展开信息：`RUST_BACKTRACE=1 cargo run`

下面让我们针对第二点进行详细展开讲解。

## backtrace栈展开
在真实场景中，错误往往涉及到很长的调用链甚至会深入第三方库，如果没有栈展开技术，错误将难以跟踪处理，下面我们来看一个真实的崩溃例子：
```rust
fn main() {
    let v = vec![1, 2, 3];

    v[99];
}
```
上面的代码很简单，数组只有`3`个元素，我们却尝试去访问它的第`100`号元素(数组索引从`0`开始)，那自然会崩溃。

我们的读者里不乏正义之士，此时肯定要质疑，一个简单的数组越界访问，为何要直接让程序崩溃？是不是有些小题大作了？

如果有过C语言的经验，即使你越界了，问题不大，我依然尝试去访问，至于这个值是不是你想要的(`100`号内存地址也有可能有值，只不过是其它变量或者程序的！)，抱歉，不归我管，我只负责取，你要负责管理好自己的索引访问范围。上面这种情况被称为**缓冲区溢出**，并可能会导致安全漏洞，例如攻击者可以通过索引来访问到数组后面不被允许的数据。

说实话，我宁愿程序崩溃，为什么？当你取到了一个不属于你的值，这在很多时候会导致程序上的逻辑bug! 有编程经验的人都知道这种逻辑上的bug是多么难被发现和修复！因此程序直接崩溃，然后告诉我们问题发生的位置，最后我们对此进行修复，这才是最合理的软件开发流程，而不是把问题藏着掖着：
```console
thread 'main' panicked at 'index out of bounds: the len is 3 but the index is 99', src/main.rs:4:5
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace
```

好的，现在成功知道问题发生的位置，但是如果我们想知道该问题之前经过了哪些调用环节，该怎么办？那就按照提示使用 `RUST_BACKTRACE=1 cargo run` 来再一次运行程序：
```console
thread 'main' panicked at 'index out of bounds: the len is 3 but the index is 99', src/main.rs:4:5
stack backtrace:
   0: rust_begin_unwind
             at /rustc/59eed8a2aac0230a8b53e89d4e99d55912ba6b35/library/std/src/panicking.rs:517:5
   1: core::panicking::panic_fmt
             at /rustc/59eed8a2aac0230a8b53e89d4e99d55912ba6b35/library/core/src/panicking.rs:101:14
   2: core::panicking::panic_bounds_check
             at /rustc/59eed8a2aac0230a8b53e89d4e99d55912ba6b35/library/core/src/panicking.rs:77:5
   3: <usize as core::slice::index::SliceIndex<[T]>>::index
             at /rustc/59eed8a2aac0230a8b53e89d4e99d55912ba6b35/library/core/src/slice/index.rs:184:10
   4: core::slice::index::<impl core::ops::index::Index<I> for [T]>::index
             at /rustc/59eed8a2aac0230a8b53e89d4e99d55912ba6b35/library/core/src/slice/index.rs:15:9
   5: <alloc::vec::Vec<T,A> as core::ops::index::Index<I>>::index
             at /rustc/59eed8a2aac0230a8b53e89d4e99d55912ba6b35/library/alloc/src/vec/mod.rs:2465:9
   6: world_hello::main
             at ./src/main.rs:4:5
   7: core::ops::function::FnOnce::call_once
             at /rustc/59eed8a2aac0230a8b53e89d4e99d55912ba6b35/library/core/src/ops/function.rs:227:5
note: Some details are omitted, run with `RUST_BACKTRACE=full` for a verbose backtrace.
```

上面的代码就是一次栈展开(也称栈回溯)，它包含了函数调用的顺序，当然按照逆序排列：最近调用的函数排在列表的最上方。因为咱们的 `main` 函数基本是最先调用的函数了，所以排在了倒数第二位，还有一个关注点，排在最顶部最后一个调用的函数是 `rust_begin_unwind`，该函数的目的就是进行栈展开，呈现这些列表信息给我们。

要获取到栈回溯信息，你还需要开启 `debug` 标志，该标志在使用 `cargo run` 或者 `cargo build` 时自动开启(这两个操作默认是 `Debug` 运行方式). 同时，栈展开信息在不同操作系统或者 Rust 版本上也所有不同。

## panic时的两种终止方式
当出现 `panic!` 时，程序提供了两种方式来处理终止流程: **栈展开** 和 **直接终止**。

其中，默认的方式就是 `栈展开`，这意味着 Rust 会回溯栈上数据和函数调用，因此也意味着更多的善后工作，好处是可以给出充分的报错信息和栈调用信息，便于事后的问题复盘。`直接终止`，顾名思义，不清理数据就直接退出程序，善后工作交与操作系统来负责。

对于绝大多数用户，使用默认选择是最好的，但是当你关心最终编译出的二进制可执行文件大小时，那么可以尝试去使用直接终止的方式（栈展开方式需要使用debug模式编译，生成的可执行文件较大），例如下面的配置修改 `Cargo.toml` 文件，实现在[`release`](../first-try/cargo.md#手动编译和运行项目)模式下遇到 `panic` 直接终止：
```rust
[profile.release]
panic = 'abort'
```

## 线程`panic`后，程序会否终止？
长话短说，如果是 `main` 线程，则程序会终止，如果是其它子线程，该线程会终止，但是不会影响 `main` 线程。因此，尽量不要在 `main` 线程中做太多任务，将这些任务交由子线程去做，就算子线程 `panic` 也不会导致整个程序的结束。

具体解析见[panic原理剖析](#panic原理剖析)

## 何时该使用panic!

下面让我们大概罗列下何时适合使用 `panic`，也许经过之前的学习，你已经能够对 `panic` 的使用有了自己的看法，但是我们还是会罗列一些常见的用法来加深你的理解。

先来一点背景知识，在前面章节我们粗略讲过 `Result<T,E>` 这个枚举类型，它是用来表示函数的返回结果：
```rust
enum Result<T, E> {
    Ok(T),
    Err(E),
}
```
当没有错误发生时，函数返回一个用 `Result` 类型包裹的值 `Ok(T)`，当错误时，返回一个 `Err(E)`。对于 `Result` 返回我们有很多处理方法，最简单粗暴的就是 `unwrap` 和 `expect`，这两个函数非常类似，我们以 `unwrap` 举例：
```rust
use std::net::IpAddr;
let home: IpAddr = "127.0.0.1".parse().unwrap();
```

上面的 `parse` 方法试图将字符串 `"127.0.0.1" `解析为一个IP地址类型 `IpAddr`，它返回一个 `Result<IpAddr,E>` 类型，如果解析成功，则把 `Ok(IpAddr)` 中的值赋给 `home`，如果失败，则不处理 `Err(E)`，而是直接 `panic`。

因此 `unwrap` 简而言之：成功则返回值，失败则 `panic`，总之不进行任何错误处理。

#### 示例、原型、测试
这几个场景下，需要快速地搭建代码，错误处理会拖慢编码的速度，也不是特别有必要，因此通过`unwrap`、`expect`等方法来处理是最快的。

同时，当我们回头准备做错误处理时，可以全局搜索这些方法，不遗漏地进行替换。

#### 你确切的知道你的程序是正确时，可以使用panic
因为 `panic` 的触发方式比错误处理要简单，因此可以让代码更清晰，可读性也更加好，当我们的代码注定是正确时，你可以用 `unrawp` 等方法直接进行处理，反正也不可能`panic`：
```rust
use std::net::IpAddr;
let home: IpAddr = "127.0.0.1".parse().unwrap();
```

例如上面的例子，`"127.0.0.1"` 就是 `ip` 地址，因此我们知道 `parse` 方法一定会成功，那么就可以直接用 `unwrap` 方法进行处理。

当然，如果该字符串是来自于用户输入，那在实际项目中，就必须用错误处理的方式，而不是 `unwrap`，否则你的程序一天要崩溃几十万次吧！

#### 可能导致全局有害状态时
有害状态大概分为几类：
- 非预期的错误
- 后续代码的运行会受到显著影响
- 内存安全的问题

当错误预期会出现时，返回一个错误较为合适，例如解析器接收到格式错误的数据，HTTP请求接收到错误的参数甚至该请求内的任何错误(不会导致整个程序有问题，只影响该此请求)。 **因为错误是可预期的，因此也是可以处理的**。

当启动时某个流程发生了错误，对后续代码的运行造成了影响，那么就应该使用 `panic`，而不是处理错误后继续运行，当然你可以通过重试的方式来继续。

上面提到过，数组访问越界，就要 `panic` 的原因，这个就是属于内存安全的范畴，一旦内存访问不安全，那么我们就无法保证自己的程序会怎么运行下去，也无法保证逻辑和数据的正确性。


## panic原理剖析

本来不想写这块儿内容，因为真的难写，但是转念一想，既然号称圣经，那么本书就得与众不同，避重就轻显然不是该有的态度。

当调用 `panic!` 宏时，它会
1. 格式化 `panic` 信息，然后使用该信息作为参数，调用 `std::panic::panic_any()` 函数
2. `panic_any` 会检查应用是否使用了 `panic hook`，如果使用了，该 `hook` 函数就会被调用
3. 当 `hook` 函数返回后，当前的线程就开始进行栈展开：从 `panic_any` 开始，如果寄存器或者栈因为某些原因信息错乱了，那很可能该展开会发生异常，最终线程会直接停止，展开也无法继续进行（这一段从hook开始读不懂了，首先不知道hook是干嘛用的，第四句不知道想表达啥。。。）
4. 展开的过程是一帧一帧的去回溯整个栈，每个帧的数据都会随之被丢弃，但是在展开过程中，你可能会遇到被用户标记为 `catching` 的帧(通过 `std::panic::catch_unwind()` 函数标记)，此时用户提供的 `catch` 函数会被调用，展开也随之停止：当然，如果 `catch` 选择在内部调用 `std::panic::resume_unwind()` 函数，则展开还会继续。

还有一种情况，在展开过程中，如果展开本身 `panic` 了，那展开线程会终止，展开也随之停止。

一旦线程展开被终止或者完成，最终的输出结果是取决于哪个线程 `panic：对于 `main` 线程，操作系统提供的终止功能 `core::intrinsics::abort()` 会被调用，最终结束当前的 `panic` 进程；如果是其它子线程，那么子线程就会简单的终止，同时信息会在稍后通过 `std::thread::join()` 进行收集。

