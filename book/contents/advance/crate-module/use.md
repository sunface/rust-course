# 使用 use 及受限可见性
如果代码中，通篇都是 `crate::front_of_house::hosting::add_to_waitlist` 这样的函数调用形式，我不知道有谁会喜欢，也许靠代码行数赚工资的人会很喜欢，但是强迫症肯定受不了，悲伤的是程序员大多都有强迫症。。。

因此我们需要一个办法来简化这种使用方式，在 Rust 中，可以使用 `use` 关键字把路径提前引入到当前作用域中，随后的调用就可以省略该路径，极大地简化了代码。

## 基本引入方式
在 Rust 中，引入模块中的项有两种方式：[绝对路径和相对路径](./module.md#用路径引用模块)，这两者在前面章节都有讲过，就不再赘述，先来看看使用绝对路径的引入方式。

#### 绝对路径引入模块
```rust
mod front_of_house {
    pub mod hosting {
        pub fn add_to_waitlist() {}
    }
}

use crate::front_of_house::hosting;

pub fn eat_at_restaurant() {
    hosting::add_to_waitlist();
    hosting::add_to_waitlist();
    hosting::add_to_waitlist();
}
```

这里，我们使用 `use` 和绝对路径的方式，将 `hosting` 模块引入到当前作用域中，然后只需通过 `hosting::add_to_waitlist` 的方式，即可调用目标模块中的函数，相比 `crate::front_of_house::hosting::add_to_waitlist()` 的方式要简单的多，那么还能更简单吗？

#### 相对路径引入模块中的函数
在下面代码中，我们不仅要使用相对路径进行引入，而且与上面引入 `hosting` 模块不同，直接引入该模块中的 `add_to_waitlist` 函数：
```rust
mod front_of_house {
    pub mod hosting {
        pub fn add_to_waitlist() {}
    }
}

use front_of_house::hosting::add_to_waitlist;

pub fn eat_at_restaurant() {
    add_to_waitlist();
    add_to_waitlist();
    add_to_waitlist();
}
```

很明显，三兄弟又变得更短了，不过，怎么觉得这句话怪怪的。。

#### 引入模块还是函数
从使用简洁性来说，引入函数自然是更甚一筹，但是在某些时候，引入模块会更好：

- 需要引入同一个模块的多个函数
- 作用域中存在同名函数

在以上两种情况中，使用 `use front_of_house::hosting` 引入模块要比 `use front_of_house::hosting::add_to_waitlist;` 引入函数更好。

例如，如果想使用 `HashMap`，那么直接引入该结构体是比引入模块更好的选择，因为在 `collections` 模块中，我们只需要使用一个 `HashMap` 结构体：
```rust
use std::collections::HashMap;

fn main() {
    let mut map = HashMap::new();
    map.insert(1, 2);
}
```

其实严格来说，对于引用方式并没有需要遵守的惯例，主要还是取决于你的喜好，不过我们建议：**优先使用最细粒度(引入函数、结构体等)的引用方式，如果引起了某种麻烦(例如前面两种情况)，再使用引入模块的方式**。

## 避免同名引用
根据上一章节的内容，我们只要保证同一个模块中不存在同名项就行，模块之间、包之间的同名，谁管得着谁啊，话虽如此，一起看看，如果遇到同名的情况该如何处理。

#### 模块::函数
```rust
use std::fmt;
use std::io;

fn function1() -> fmt::Result {
    // --snip--
}

fn function2() -> io::Result<()> {
    // --snip--
}
```

上面的例子给出了很好的解决方案，使用模块引入的方式，具体的 `Result` 通过 `模块::Result` 的方式进行调用。

可以看出，避免同名冲突的关键，就是使用**父模块的方式来调用**，除此之外，还可以给予引入的项起一个别名。

#### `as` 别名引用
对于同名冲突问题，还可以使用 `as` 关键字来解决，它可以赋予引入项一个全新的名称：
```rust
use std::fmt::Result;
use std::io::Result as IoResult;

fn function1() -> Result {
    // --snip--
}

fn function2() -> IoResult<()> {
    // --snip--
}
```

如上所示，首先通过 `use std::io::Result` 将 `Result` 引入到作用域，然后使用 `as` 给予它一个全新的名称 `IoResult`，这样就不会再产生冲突：

- `Result` 代表 `std::fmt::Result`
- `IoResult` 代表 `std:io::Result`

## 引入项再导出
当外部的模块项 `A` 被引入到当前模块中时，它的可见性自动被设置为私有的，如果你允许其它外部代码引入我们模块中的 `A`，那么可以对它进行再导出：
```rust
mod front_of_house {
    pub mod hosting {
        pub fn add_to_waitlist() {}
    }
}

pub use crate::front_of_house::hosting;

pub fn eat_at_restaurant() {
    hosting::add_to_waitlist();
    hosting::add_to_waitlist();
    hosting::add_to_waitlist();
}
```

如上，使用 `pub use` 即可实现。这里 `use` 代表引入 `hosting` 模块到当前作用域，`pub` 表示将该引入的内容再度设置为可见。

当你希望将内部的实现细节隐藏起来或者按照某个目的组织代码时，可以使用 `pub use` 再导出，例如统一使用一个模块来提供对外的 API，那该模块就可以引入其它模块中的 API，然后进行再导出，最终对于用户来说，所有的 API 都是由一个模块统一提供的。

## 使用三方包
之前我们一直在引入标准库模块或者自定义模块，现在来引入下三方包中的模块，关于如何引入外部依赖，我们在[Cargo入门](../../first-try/cargo.md#package配置段落)中就有讲，这里直接给出操作步骤：

1. 修改 Cargo.toml 文件，在 `[dependencies]` 区域添加一行：`rand = "0.8.3"`
2. 此时，如果你用的是 `VSCode` 和 `rust-analyzer` 插件，该插件会自动拉取该库，你可能需要等它完成后，再进行下一步(VSCODE左下角有提示)

好了，此时，`rand` 包已经被我们添加到依赖中，下一步就是在代码中使用：
```rust
use rand::Rng;

fn main() {
    let secret_number = rand::thread_rng().gen_range(1..101);
}
```

这里使用 `use` 引入了三方包 `rand` 中的 `Rng` 特征，因为我们需要调用的 `gen_range` 方法定义在该特征中。

#### crates.io，lib.rs
Rust 社区已经为我们贡献了大量高质量的三方包，你可以在 `crates.io` 或者 `lib.rs` 中检索和使用，从目前来说查找包更推荐 `lib.rs`，搜索功能更强大，内容展示也更加合理，但是下载依赖包还是得用`crates.io`。

你可以在网站上搜索 `rand` 包，看看它的文档使用方式是否和我们之前引入方式相一致：在网上找到想要的包，然后将你想要的包和版本信息写入到 `Cargo.toml` 中。

## 使用 `{}` 简化引入方式
对于以下一行一行的引入方式：
```rust
use std::collections::HashMap;
use std::collections::BTreeMap;
use std::collections::HashSet;

use std::cmp::Ordering;
use std::io;
```

可以使用 `{}` 来一起引入进来，在大型项目中，使用这种方式来引入，可以减少大量 `use` 的使用：
```rust
use std::collections::{HashMap,BTreeMap,HashSet};
use std::{cmp::Ordering, io};
```

对于下面的同时引入模块和模块中的项：
```rust
use std::io;
use std::io::Write;
```

可以使用 `{}` 的方式进行简化:
```rust
use std::io::{self, Write};
```

#### self

上面使用到了模块章节提到的 `self` 关键字，用来替代模块自身，结合上一节中的 `self`，可以得出它在模块中的两个用途：

- `use self::xxx`，表示加载当前模块中的 `xxx`。此时 `self` 可省略
- `use xxx::{self, yyy}`，表示，加载当前路径下模块 `xxx` 本身，以及模块 `xxx` 下的 `yyy`

## 使用`*`引入模块下的所有项
对于之前一行一行引入 `std::collections` 的方式，我们还可以使用
```rust
use std::collections::*;
```

以上这种方式来引入 `std::collections` 模块下的所有公共项，这些公共项自然包含了 `HashMap`，`HashSet` 等想手动引入的集合类型。

当使用 `*` 来引入的时候要格外小心，因为你很难知道到底哪些被引入到了当前作用域中，有哪些会和你自己程序中的名称相冲突：
```rust
use std::collections::*;

struct HashMap;
fn main() {
   let mut v =  HashMap::new();
   v.insert("a", 1);
}
```

以上代码中，`std::collection::HashMap` 被 `*` 引入到当前作用域，但是由于存在另一个同名的结构体，因此 `HashMap::new` 根本不存在，因为对于编译器来说，本地同名类型的优先级更高。

在实际项目中，这种引用方式往往用于快速写测试代码，它可以把所有东西一次性引入到 `tests` 模块中。

## 受限的可见性
在上一节中，我们学习了[可见性](./module.md#代码可见性)这个概念，这也是模块体系中最为核心的概念，控制了模块中哪些内容可以被外部看见，但是在实际使用时，光被外面看到还不行，我们还想控制哪些人能看，这就是 Rust 提供的受限可见性。

例如，在 Rust 中，包是一个模块树，我们可以通过 `pub(crate) item;` 这种方式来实现：`item` 虽然是对外可见的，但是只在当前包内可见，外部包无法引用到该 `item`。

所以，如果我们想要让某一项可以在整个包中都可以被使用，那么有两种办法：

- 在包根中定义一个非 `pub` 类型的 `X`(父模块的项对子模块都是可见的，因此包根中的项对模块树上的所有模块都可见)
- 在子模块中定义一个 `pub` 类型的 `Y`，同时通过 `use` 将其引入到包根

```rust
mod a {
    pub mod b {
        pub fn c() {
            println!("{:?}",crate::X);
        }

        #[derive(Debug)]
        pub struct Y;
    }
}

#[derive(Debug)]
struct X;
use a::b::Y;
fn d() {
    println!("{:?}",Y);
}
```

以上代码充分说明了之前两种办法的使用方式，但是有时我们会遇到这两种方法都不太好用的时候。例如希望对于某些特定的模块可见，但是对于其他模块又不可见：
```rust
// 目标：`a` 导出 `I`、`bar` and `foo`，其他的不导出
pub mod a {
    pub const I: i32 = 3;

    fn semisecret(x: i32) -> i32 {
        use self::b::c::J;
        x + J
    }

    pub fn bar(z: i32) -> i32 {
        semisecret(I) * z
    }
    pub fn foo(y: i32) -> i32 {
        semisecret(I) + y
    }

    mod b {
        mod c {
            const J: i32 = 4;
        }
    }
}
```

这段代码会报错，因为与父模块中的项对子模块可见相反，子模块中的项对父模块是不可见的。这里 `semisecret` 方法中，`a` -> `b` -> `c` 形成了父子模块链，那 `c` 中的 `J` 自然对 `a` 模块不可见。

如果使用之前的可见性方式，那么想保持 `J` 私有，同时让 `a` 继续使用 `semisecret` 函数的办法是将该函数移动到 `c` 模块中，然后用 `pub use` 将 `semisecret` 函数进行再导出：
```rust
pub mod a {
    pub const I: i32 = 3;

    use self::b::semisecret;

    pub fn bar(z: i32) -> i32 {
        semisecret(I) * z
    }
    pub fn foo(y: i32) -> i32 {
        semisecret(I) + y
    }

    mod b {
        pub use self::c::semisecret;
        mod c {
            const J: i32 = 4;
            pub fn semisecret(x: i32) -> i32 {
                x + J
            }
        }
    }
}
```

这段代码说实话问题不大，但是有些破坏了我们之前的逻辑，如果想保持代码逻辑，同时又只让 `J` 在 `a` 内可见该怎么办？

```rust
pub mod a {
    pub const I: i32 = 3;

    fn semisecret(x: i32) -> i32 {
        use self::b::c::J;
        x + J
    }

    pub fn bar(z: i32) -> i32 {
        semisecret(I) * z
    }
    pub fn foo(y: i32) -> i32 {
        semisecret(I) + y
    }

    mod b {
        pub(in crate::a) mod c {
            pub(in crate::a) const J: i32 = 4;
        }
    }
}
```

通过 `pub(in crate::a)` 的方式，我们指定了模块 `c` 和常量 `J` 的可见范围都只是 `a` 模块中，`a` 之外的模块是完全访问不到它们的。

#### 限制可见性语法
`pub(crate)` 或 `pub(in crate::a)` 就是限制可见性语法，前者是限制在整个包内可见，后者是通过绝对路径，限制在包内的某个模块内可见，总结一下：

- `pub` 意味着可见性无任何限制
- `pub(crate)` 表示在当前包可见
- `pub(self)` 在当前模块可见
- `pub(super)` 在父模块可见
- `pub(in <path>)` 表示在某个路径代表的模块中可见，其中 `path` 必须是父模块或者祖先模块


#### 一个综合例子
```rust
// 一个名为 `my_mod` 的模块
mod my_mod {
    // 模块中的项默认具有私有的可见性
    fn private_function() {
        println!("called `my_mod::private_function()`");
    }

    // 使用 `pub` 修饰语来改变默认可见性。
    pub fn function() {
        println!("called `my_mod::function()`");
    }

    // 在同一模块中，项可以访问其它项，即使它是私有的。
    pub fn indirect_access() {
        print!("called `my_mod::indirect_access()`, that\n> ");
        private_function();
    }

    // 模块也可以嵌套
    pub mod nested {
        pub fn function() {
            println!("called `my_mod::nested::function()`");
        }

        #[allow(dead_code)]
        fn private_function() {
            println!("called `my_mod::nested::private_function()`");
        }

        // 使用 `pub(in path)` 语法定义的函数只在给定的路径中可见。
        // `path` 必须是父模块（parent module）或祖先模块（ancestor module）
        pub(in crate::my_mod) fn public_function_in_my_mod() {
            print!("called `my_mod::nested::public_function_in_my_mod()`, that\n > ");
            public_function_in_nested()
        }

        // 使用 `pub(self)` 语法定义的函数则只在当前模块中可见。
        pub(self) fn public_function_in_nested() {
            println!("called `my_mod::nested::public_function_in_nested");
        }

        // 使用 `pub(super)` 语法定义的函数只在父模块中可见。
        pub(super) fn public_function_in_super_mod() {
            println!("called my_mod::nested::public_function_in_super_mod");
        }
    }

    pub fn call_public_function_in_my_mod() {
        print!("called `my_mod::call_public_funcion_in_my_mod()`, that\n> ");
        nested::public_function_in_my_mod();
        print!("> ");
        nested::public_function_in_super_mod();
    }

    // `pub(crate)` 使得函数只在当前包中可见
    pub(crate) fn public_function_in_crate() {
        println!("called `my_mod::public_function_in_crate()");
    }

    // 嵌套模块的可见性遵循相同的规则
    mod private_nested {
        #[allow(dead_code)]
        pub fn function() {
            println!("called `my_mod::private_nested::function()`");
        }
    }
}

fn function() {
    println!("called `function()`");
}

fn main() {
    // 模块机制消除了相同名字的项之间的歧义。
    function();
    my_mod::function();

    // 公有项，包括嵌套模块内的，都可以在父模块外部访问。
    my_mod::indirect_access();
    my_mod::nested::function();
    my_mod::call_public_function_in_my_mod();

    // pub(crate) 项可以在同一个 crate 中的任何地方访问
    my_mod::public_function_in_crate();

    // pub(in path) 项只能在指定的模块中访问
    // 报错！函数 `public_function_in_my_mod` 是私有的
    //my_mod::nested::public_function_in_my_mod();
    // 试一试 ^ 取消该行的注释

    // 模块的私有项不能直接访问，即便它是嵌套在公有模块内部的

    // 报错！`private_function` 是私有的
    //my_mod::private_function();
    // 试一试 ^ 取消此行注释

    // 报错！`private_function` 是私有的
    //my_mod::nested::private_function();
    // 试一试 ^ 取消此行的注释

    // 报错！ `private_nested` 是私有的
    //my_mod::private_nested::function();
    // 试一试 ^ 取消此行的注释
}
```

