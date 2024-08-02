# 注释和文档

好的代码会说话，好的程序员不写注释，这些都是烂大街的“编程界俚语”。但是，如果你真的遇到一个不写注释的项目或程序员，那一定会对它/他“刮目相看”。

在之前的章节我们学习了包和模块如何使用，在此章节将进一步学习如何书写文档注释，以及如何使用 `cargo doc` 生成项目的文档，最后将以一个包、模块和文档的综合性例子，来将这些知识融会贯通。

## 注释的种类

在 Rust 中，注释分为三类：

- 代码注释，用于说明某一块代码的功能，读者往往是同一个项目的协作开发者
- 文档注释，支持 `Markdown`，对项目描述、公共 API 等用户关心的功能进行介绍，同时还能提供示例代码，目标读者往往是想要了解你项目的人
- 包和模块注释，严格来说这也是文档注释中的一种，它主要用于说明当前包和模块的功能，方便用户迅速了解一个项目

通过这些注释，实现了 Rust 极其优秀的文档化支持，甚至你还能在文档注释中写测试用例，省去了单独写测试用例的环节，我直呼好家伙！

## 代码注释

显然之前的刮目相看是打了引号的，想要去掉引号，该写注释的时候，就老老实实的，不过写时需要遵循八字原则：**围绕目标，言简意赅**，记住，洋洋洒洒那是用来形容文章的，不是形容注释！

代码注释方式有两种：

#### 行注释 `//`

```rust,ignore,mdbook-runnable
fn main() {
    // 我是Sun...
    // face
    let name = "sunface";
    let age = 18; // 今年好像是18岁
}
```

如上所示，行注释可以放在某一行代码的上方，也可以放在当前代码行的后方。如果超出一行的长度，需要在新行的开头也加上 `//`。

当注释行数较多时，你还可以使用**块注释**

#### 块注释`/* ..... */`

```rust,ignore,mdbook-runnable
fn main() {
    /*
        我
        是
        S
        u
        n
        ... 哎，好长!
    */
    let name = "sunface";
    let age = "???"; // 今年其实。。。挺大了
}
```

如上所示，只需要将注释内容使用 `/* */` 进行包裹即可。

你会发现，Rust 的代码注释跟其它语言并没有区别，主要区别其实在于文档注释这一块，也是本章节内容的重点。

## 文档注释

当查看一个 `crates.io` 上的包时，往往需要通过它提供的文档来浏览相关的功能特性、使用方式，这种文档就是通过文档注释实现的。

Rust 提供了 `cargo doc` 的命令，可以用于把这些文档注释转换成 `HTML` 网页文件，最终展示给用户浏览，这样用户就知道这个包是做什么的以及该如何使用。

#### 文档行注释 `///`

本书的一大特点就是废话不多，因此我们开门见山：

````rust,ignore,mdbook-runnable
/// `add_one` 将指定值加1
///
/// # Examples
///
/// ```
/// let arg = 5;
/// let answer = my_crate::add_one(arg);
///
/// assert_eq!(6, answer);
/// ```
pub fn add_one(x: i32) -> i32 {
    x + 1
}
````

以上代码有几点需要注意：

- 文档注释需要位于 `lib` 类型的包中，例如 `src/lib.rs` 中
- 文档注释可以使用 `markdown`语法！例如 `# Examples` 的标题，以及代码块高亮
- 被注释的对象需要使用 `pub` 对外可见，记住：文档注释是给用户看的，**内部实现细节不应该被暴露出去**

咦？文档注释中的例子，为什看上去像是能运行的样子？竟然还是有 `assert_eq` 这种常用于测试目的的宏。 嗯，你的感觉没错，详细内容会在本章后面讲解，容我先卖个关子。

#### 文档块注释 `/** ... */`

与代码注释一样，文档也有块注释，当注释内容多时，使用块注释可以减少 `///` 的使用：

````rust,ignore,mdbook-runnable
/** `add_two` 将指定值加2

# Examples

```
let arg = 5;
let answer = my_crate::add_two(arg);

assert_eq!(7, answer);
```
*/
pub fn add_two(x: i32) -> i32 {
    x + 2
}
````

#### 查看文档 cargo doc

锦衣不夜行，这是中国人的传统美德。我们写了这么漂亮的文档注释，当然要看看网页中是什么效果咯。

很简单，运行 `cargo doc` 可以直接生成 `HTML` 文件，放入*target/doc*目录下。

当然，为了方便，我们使用 `cargo doc --open` 命令，可以在生成文档后，自动在浏览器中打开网页，最终效果如图所示：

<img alt="" src="https://pic2.zhimg.com/80/v2-926c91d429e2933a6a3ae3233fc56b1c_1440w.png" class="center"  />

非常棒，而且非常简单，这就是 Rust 工具链的强大之处。

#### 常用文档标题

之前我们见到了在文档注释中该如何使用 `markdown`，其中包括 `# Examples` 标题。除了这个标题，还有一些常用的，你可以在项目中酌情使用：

- **Panics**：函数可能会出现的异常状况，这样调用函数的人就可以提前规避
- **Errors**：描述可能出现的错误及什么情况会导致错误，有助于调用者针对不同的错误采取不同的处理方式
- **Safety**：如果函数使用 `unsafe` 代码，那么调用者就需要注意一些使用条件，以确保 `unsafe` 代码块的正常工作

话说回来，这些标题更多的是一种惯例，如果你非要用中文标题也没问题，但是最好在团队中保持同样的风格 :)

## 包和模块级别的注释

除了函数、结构体等 Rust 项的注释，你还可以给包和模块添加注释，需要注意的是，**这些注释要添加到包、模块的最上方**！

与之前的任何注释一样，包级别的注释也分为两种：行注释 `//!` 和块注释 `/*! ... */`。

现在，为我们的包增加注释，在 `src/lib.rs` 包根的最上方，添加：

```rust,ignore,mdbook-runnable
/*! lib包是world_hello二进制包的依赖包，
 里面包含了compute等有用模块 */

pub mod compute;
```

然后再为该包根的子模块 `src/compute.rs` 添加注释：

```rust,ignore,mdbook-runnable
//! 计算一些你口算算不出来的复杂算术题


/// `add_one`将指定值加1
///
```

运行 `cargo doc --open` 查看下效果：

<img alt="" src="https://pic3.zhimg.com/80/v2-38dbea938884c159e74f777c6f49e3af_1440w.png" class="center"  />

包模块注释，可以让用户从整体的角度理解包的用途，对于用户来说是非常友好的，就和一篇文章的开头一样，总是要对文章的内容进行大致的介绍，让用户在看的时候心中有数。

至此，关于如何注释的内容，就结束了，那么注释还能用来做什么？可以玩出花来吗？答案是`Yes`.

## 文档测试(Doc Test)

相信读者之前都写过单元测试用例，其中一个很蛋疼的问题就是，随着代码的进化，单元测试用例经常会失效，过段时间后（为何是过段时间？应该这么问，有几个开发喜欢写测试用例 =,=），你发现需要连续修改不少处代码，才能让测试重新工作起来。然而，在 Rust 中，大可不必。

在之前的 `add_one` 中，我们写的示例代码非常像是一个单元测试的用例，这是偶然吗？并不是。因为 Rust 允许我们在文档注释中写单元测试用例！方法就如同之前做的：

````rust,ignore,mdbook-runnable
/// `add_one` 将指定值加1
///
/// # Examples11
///
/// ```
/// let arg = 5;
/// let answer = world_hello::compute::add_one(arg);
///
/// assert_eq!(6, answer);
/// ```
pub fn add_one(x: i32) -> i32 {
    x + 1
}
````

以上的注释不仅仅是文档，还可以作为单元测试的用例运行，使用 `cargo test` 运行测试：

```console
Doc-tests world_hello

running 2 tests
test src/compute.rs - compute::add_one (line 8) ... ok
test src/compute.rs - compute::add_two (line 22) ... ok

test result: ok. 2 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 1.00s
```

可以看到，文档中的测试用例被完美运行，而且输出中也明确提示了 `Doc-tests world_hello`，意味着这些测试的名字叫 `Doc test` 文档测试。

> 需要注意的是，你可能需要使用类如 `world_hello::compute::add_one(arg)` 的完整路径来调用函数，因为测试是在另外一个独立的线程中运行的

#### 造成 panic 的文档测试

文档测试中的用例还可以造成 `panic`：

````rust,ignore,mdbook-runnable
/// # Panics
///
/// The function panics if the second argument is zero.
///
/// ```rust,ignore,mdbook-runnable
/// // panics on division by zero
/// world_hello::compute::div(10, 0);
/// ```
pub fn div(a: i32, b: i32) -> i32 {
    if b == 0 {
        panic!("Divide-by-zero error");
    }

    a / b
}
````

以上测试运行后会 `panic`：

```console
---- src/compute.rs - compute::div (line 38) stdout ----
Test executable failed (exit code 101).

stderr:
thread 'main' panicked at 'Divide-by-zero error', src/compute.rs:44:9
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace
```

如果想要通过这种测试，可以添加 `should_panic`：

````rust,ignore,mdbook-runnable
/// # Panics
///
/// The function panics if the second argument is zero.
///
/// ```rust,ignore,mdbook-runnable,should_panic
/// // panics on division by zero
/// world_hello::compute::div(10, 0);
/// ```
````

通过 `should_panic`，告诉 Rust 我们这个用例会导致 `panic`，这样测试用例就能顺利通过。

#### 保留测试，隐藏文档

在某些时候，我们希望保留文档测试的功能，但是又要将某些测试用例的内容从文档中隐藏起来：

````rust,ignore,mdbook-runnable
/// ```
/// # // 使用#开头的行会在文档中被隐藏起来，但是依然会在文档测试中运行
/// # fn try_main() -> Result<(), String> {
/// let res = world_hello::compute::try_div(10, 0)?;
/// # Ok(()) // returning from try_main
/// # }
/// # fn main() {
/// #    try_main().unwrap();
/// #
/// # }
/// ```
pub fn try_div(a: i32, b: i32) -> Result<i32, String> {
    if b == 0 {
        Err(String::from("Divide-by-zero"))
    } else {
        Ok(a / b)
    }
}
````

以上文档注释中，我们使用 `#` 将不想让用户看到的内容隐藏起来，但是又不影响测试用例的运行，最终用户将只能看到那行没有隐藏的 `let res = world_hello::compute::try_div(10, 0)?;`：

<img alt="" src="https://pic1.zhimg.com/80/v2-d1b98f5e70b7f8c8fb9aecce325dba0e_1440w.png" class="center"  />

## 文档注释中的代码跳转

Rust 在文档注释中还提供了一个非常强大的功能，那就是可以实现对外部项的链接：

#### 跳转到标准库

```rust,ignore,mdbook-runnable
/// `add_one` 返回一个[`Option`]类型
pub fn add_one(x: i32) -> Option<i32> {
    Some(x + 1)
}
```

此处的 **[`Option`]** 就是一个链接，指向了标准库中的 `Option` 枚举类型，有两种方式可以进行跳转:

- 在 IDE 中，使用 `Command + 鼠标左键`(macOS)，`CTRL + 鼠标左键`(Windows)
- 在文档中直接点击链接

再比如，还可以使用路径的方式跳转：

```rust,ignore,mdbook-runnable
use std::sync::mpsc::Receiver;

/// [`Receiver<T>`]   [`std::future`].
///
///  [`std::future::Future`] [`Self::recv()`].
pub struct AsyncReceiver<T> {
    sender: Receiver<T>,
}

impl<T> AsyncReceiver<T> {
    pub async fn recv() -> T {
        unimplemented!()
    }
}
```

#### 使用完整路径跳转到指定项

除了跳转到标准库，你还可以通过指定具体的路径跳转到自己代码或者其它库的指定项，例如在 `lib.rs` 中添加以下代码：

```rust,ignore,mdbook-runnable
pub mod a {
    /// `add_one` 返回一个[`Option`]类型
    /// 跳转到[`crate::MySpecialFormatter`]
    pub fn add_one(x: i32) -> Option<i32> {
        Some(x + 1)
    }
}

pub struct MySpecialFormatter;
```

使用 `crate::MySpecialFormatter` 这种路径就可以实现跳转到 `lib.rs` 中定义的结构体上。

#### 同名项的跳转

如果遇到同名项，可以使用标示类型的方式进行跳转：

```rust,ignore,mdbook-runnable
/// 跳转到结构体  [`Foo`](struct@Foo)
pub struct Bar;

/// 跳转到同名函数 [`Foo`](fn@Foo)
pub struct Foo {}

/// 跳转到同名宏 [`foo!`]
pub fn Foo() {}

#[macro_export]
macro_rules! foo {
  () => {}
}
```

## 文档搜索别名

Rust 文档支持搜索功能，我们可以为自己的类型定义几个别名，以实现更好的搜索展现，当别名命中时，搜索结果会被放在第一位：

```rust,ignore,mdbook-runnable
#[doc(alias = "x")]
#[doc(alias = "big")]
pub struct BigX;

#[doc(alias("y", "big"))]
pub struct BigY;
```

结果如下图所示：
<img alt="" src="https://pic1.zhimg.com/80/v2-1ab5b19d2bd06f3d83204d062b399bcd_1440w.png" class="center"  />

## 一个综合例子

这个例子我们将重点应用几个知识点：

- 文档注释
- 一个项目可以包含两个包：二进制可执行包和 `lib` 包（库包），它们的包根分别是 `src/main.rs` 和 `src/lib.rs`
- 在二进制包中引用 `lib` 包
- 使用 `pub use` 再导出 API，并观察文档

首先，使用 `cargo new art` 创建一个 Package `art`：

```console
Created binary (application) `art` package
```

系统提示我们创建了一个二进制 `Package`，根据[之前章节](https://course.rs/basic/crate-module/crate.html)学过的内容，可以知道该 `Package` 包含一个同名的二进制包：包名为 `art`，包根为 `src/main.rs`，该包可以编译成二进制然后运行。

现在，在 `src` 目录下创建一个 `lib.rs` 文件，同样，根据之前学习的知识，创建该文件等于又创建了一个库类型的包，包名也是 `art`，包根为 `src/lib.rs`，该包是是库类型的，因此往往作为依赖库被引入。

将以下内容添加到 `src/lib.rs` 中：

````rust,ignore,mdbook-runnable
//! # Art
//!
//!  未来的艺术建模库，现在的调色库

pub use self::kinds::PrimaryColor;
pub use self::kinds::SecondaryColor;
pub use self::utils::mix;

pub mod kinds {
    //! 定义颜色的类型

    /// 主色
    pub enum PrimaryColor {
        Red,
        Yellow,
        Blue,
    }

    /// 副色
    #[derive(Debug,PartialEq)]
    pub enum SecondaryColor {
        Orange,
        Green,
        Purple,
    }
}

pub mod utils {
    //! 实用工具，目前只实现了调色板
    use crate::kinds::*;

    /// 将两种主色调成副色
    /// ```rust,ignore,mdbook-runnable
    /// use art::utils::mix;
    /// use art::kinds::{PrimaryColor,SecondaryColor};
    /// assert!(matches!(mix(PrimaryColor::Yellow, PrimaryColor::Blue), SecondaryColor::Green));
    /// ```
    pub fn mix(c1: PrimaryColor, c2: PrimaryColor) -> SecondaryColor {
        SecondaryColor::Green
    }
}
````

在库包的包根 `src/lib.rs` 下，我们又定义了几个子模块，同时将子模块中的三个项通过 `pub use` 进行了再导出。

接着，将下面内容添加到 `src/main.rs` 中：

```rust,ignore,mdbook-runnable
use art::kinds::PrimaryColor;
use art::utils::mix;

fn main() {
    let blue = PrimaryColor::Blue;
    let yellow = PrimaryColor::Yellow;
    println!("{:?}",mix(blue, yellow));
}
```

在二进制可执行包的包根 `src/main.rs` 下，我们引入了库包 `art` 中的模块项，同时使用 `main` 函数作为程序的入口，该二进制包可以使用 `cargo run` 运行：

```console
Green
```

至此，库包完美提供了用于调色的 API，二进制包引入这些 API 完美的实现了调色并打印输出。

最后，再来看看文档长啥样：

<img alt="" src="https://pic1.zhimg.com/80/v2-e9ef7351458fd01020b35990c3daf222_1440w.png" class="center"  />

## 总结

在 Rust 中，注释分为三个主要类型：代码注释、文档注释、包和模块注释，每个注释类型都拥有两种形式：行注释和块注释，熟练掌握包模块和注释的知识，非常有助于我们创建工程性更强的项目。

如果读者看到这里对于包模块还是有些模糊，强烈建议回头看看相关的章节以及本章节的最后一个综合例子。

## 课后练习

> [Rust By Practice](https://practice-zh.course.rs/comments-docs.html)，支持代码在线编辑和运行，并提供详细的习题解答。（本节暂无习题解答）
