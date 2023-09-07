# Macro 宏编程

在编程世界可以说是谈“宏”色变，原因在于 C 语言中的宏是非常危险的东东，但并不是所有语言都像 C 这样，例如对于古老的语言 Lisp 来说，宏就是就是一个非常强大的好帮手。

那话说回来，在 Rust 中宏到底是好是坏呢？本章将带你揭开它的神秘面纱。

事实上，我们虽然没有见过宏，但是已经多次用过它，例如在全书的第一个例子中就用到了：`println!("你好，世界")`，这里 `println!` 就是一个最常用的宏，可以看到它和函数最大的区别是：它在调用时多了一个 `!`，除此之外还有 `vec!` 、`assert_eq!` 都是相当常用的，可以说**宏在 Rust 中无处不在**。

细心的读者可能会注意到 `println!` 后面跟着的是 `()`，而 `vec!` 后面跟着的是 `[]`，这是因为宏的参数可以使用 `()`、`[]` 以及 `{}`:

```rust
fn main() {
    println!("aaaa");
    println!["aaaa"];
    println!{"aaaa"}
}
```

虽然三种使用形式皆可，但是 Rust 内置的宏都有自己约定俗成的使用方式，例如 `vec![...]`、`assert_eq!(...)` 等。

在 Rust 中宏分为两大类：**声明式宏( _declarative macros_ )** `macro_rules!` 和三种**过程宏( _procedural macros_ )**:

- `#[derive]`，在之前多次见到的派生宏，可以为目标结构体或枚举派生指定的代码，例如 `Debug` 特征
- 类属性宏(Attribute-like macro)，用于为目标添加自定义的属性
- 类函数宏(Function-like macro)，看上去就像是函数调用

如果感觉难以理解，也不必担心，接下来我们将逐个看看它们的庐山真面目，在此之前，先来看下为何需要宏，特别是 Rust 的函数明明已经很强大了。

## 宏和函数的区别

宏和函数的区别并不少，而且对于宏擅长的领域，函数其实是有些无能为力的。

#### 元编程

从根本上来说，宏是通过一种代码来生成另一种代码，如果大家熟悉元编程，就会发现两者的共同点。

在[附录 D](https://course.rs/appendix/derive.html)中讲到的 `derive` 属性，就会自动为结构体派生出相应特征所需的代码，例如 `#[derive(Debug)]`，还有熟悉的 `println!` 和 `vec!`，所有的这些宏都会展开成相应的代码，且很可能是长得多的代码。

总之，元编程可以帮我们减少所需编写的代码，也可以一定程度上减少维护的成本，虽然函数复用也有类似的作用，但是宏依然拥有自己独特的优势。

#### 可变参数

Rust 的函数签名是固定的：定义了两个参数，就必须传入两个参数，多一个少一个都不行，对于从 JS/TS 过来的同学，这一点其实是有些恼人的。

而宏就可以拥有可变数量的参数，例如可以调用一个参数的 `println!("hello")`，也可以调用两个参数的 `println!("hello {}", name)`。

#### 宏展开

由于宏会被展开成其它代码，且这个展开过程是发生在编译器对代码进行解释之前。因此，宏可以为指定的类型实现某个特征：先将宏展开成实现特征的代码后，再被编译。

而函数就做不到这一点，因为它直到运行时才能被调用，而特征需要在编译期被实现。

#### 宏的缺点

相对函数来说，由于宏是基于代码再展开成代码，因此实现相比函数来说会更加复杂，再加上宏的语法更为复杂，最终导致定义宏的代码相当地难读，也难以理解和维护。

## 声明式宏 `macro_rules!`

在 Rust 中使用最广的就是声明式宏，它们也有一些其它的称呼，例如示例宏( macros by example )、`macro_rules!` 或干脆直接称呼为**宏**。

声明式宏允许我们写出类似 `match` 的代码。`match` 表达式是一个控制结构，其接收一个表达式，然后将表达式的结果与多个模式进行匹配，一旦匹配了某个模式，则该模式相关联的代码将被执行:

```rust
match target {
    模式1 => 表达式1,
    模式2 => {
        语句1;
        语句2;
        表达式2
    },
    _ => 表达式3
}
```

而**宏也是将一个值跟对应的模式进行匹配，且该模式会与特定的代码相关联**。但是与 `match` 不同的是，**宏里的值是一段 Rust 源代码**(字面量)，模式用于跟这段源代码的结构相比较，一旦匹配，传入宏的那段源代码将被模式关联的代码所替换，最终实现宏展开。值得注意的是，**所有的这些都是在编译期发生，并没有运行期的性能损耗**。

#### 简化版的 vec!

在[动态数组 Vector 章节](https://course.rs/basic/collections/vector.html#vec)中，我们学习了使用 `vec!` 来便捷的初始化一个动态数组:

```rust
let v: Vec<u32> = vec![1, 2, 3];
```

最重要的是，通过 `vec!` 创建的动态数组支持任何元素类型，也并没有限制数组的长度，如果使用函数，我们是无法做到这一点的。

好在我们有 `macro_rules!`，来看看该如何使用它来实现 `vec!`，以下是一个简化实现：

```rust
#[macro_export]
macro_rules! vec {
    ( $( $x:expr ),* ) => {
        {
            let mut temp_vec = Vec::new();
            $(
                temp_vec.push($x);
            )*
            temp_vec
        }
    };
}
```

简化实现版本？这也太难了吧！！只能说，欢迎来到宏的世界，在这里你能见到优雅 Rust 的另一面:) 标准库中的 `vec!` 还包含了预分配内存空间的代码，如果引入进来，那大家将更难以接受。

`#[macro_export]` 注释将宏进行了导出，这样其它的包就可以将该宏引入到当前作用域中，然后才能使用。可能有同学会提问：我们在使用标准库 `vec!` 时也没有引入宏啊，那是因为 Rust 已经通过 [`std::prelude`](https://course.rs/appendix/prelude.html) 的方式为我们自动引入了。

紧接着，就使用 `macro_rules!` 进行了宏定义，需要注意的是宏的名称是 `vec`，而不是 `vec!`，后者的感叹号只在调用时才需要。

`vec` 的定义结构跟 `match` 表达式很像，但这里我们只有一个分支，其中包含一个模式 `( $( $x:expr ),* )`，跟模式相关联的代码就在 `=>` 之后。一旦模式成功匹配，那这段相关联的代码就会替换传入的源代码。

由于 `vec` 宏只有一个模式，因此它只能匹配一种源代码，其它类型的都将导致报错，而更复杂的宏往往会拥有更多的分支。

虽然宏和 `match` 都称之为模式，但是前者跟[后者](https://course.rs/basic/match-pattern/all-patterns.html)的模式规则是不同的。如果大家想要更深入的了解宏的模式，可以查看[这里](https://doc.rust-lang.org/reference/macros-by-example.html)。

#### 模式解析

而现在，我们先来简单讲解下 `( $( $x:expr ),* )` 的含义。

首先，我们使用圆括号 `()` 将整个宏模式包裹其中。紧随其后的是 `$()`，跟括号中模式相匹配的值(传入的 Rust 源代码)会被捕获，然后用于代码替换。在这里，模式 `$x:expr` 会匹配任何 Rust 表达式并给予该模式一个名称：`$x`。

`$()` 之后的逗号说明在 `$()` 所匹配的代码的后面会有一个可选的逗号分隔符，紧随逗号之后的 `*` 说明 `*` 之前的模式会被匹配零次或任意多次(类似正则表达式)。

当我们使用 `vec![1, 2, 3]` 来调用该宏时，`$x` 模式将被匹配三次，分别是 `1`、`2`、`3`。为了帮助大家巩固，我们再来一起过一下：

1. `$()` 中包含的是模式 `$x:expr`，该模式中的 `expr` 表示会匹配任何 Rust 表达式，并给予该模式一个名称 `$x`
2. 因此 `$x` 模式可以跟整数 `1` 进行匹配，也可以跟字符串 "hello" 进行匹配: `vec!["hello", "world"]`
3. `$()` 之后的逗号，意味着`1` 和 `2` 之间可以使用逗号进行分割，也意味着 `3` 既可以没有逗号，也可以有逗号：`vec![1, 2, 3,]`
4. `*` 说明之前的模式可以出现零次也可以任意次，这里出现了三次

接下来，我们再来看看与模式相关联、在 `=>` 之后的代码：

```rust
{
    {
        let mut temp_vec = Vec::new();
        $(
            temp_vec.push($x);
        )*
        temp_vec
    }
};
```

这里就比较好理解了，`$()` 中的 `temp_vec.push()` 将根据模式匹配的次数生成对应的代码，当调用 `vec![1, 2, 3]` 时，下面这段生成的代码将替代传入的源代码，也就是替代 `vec![1, 2, 3]` :

```rust
{
    let mut temp_vec = Vec::new();
    temp_vec.push(1);
    temp_vec.push(2);
    temp_vec.push(3);
    temp_vec
}
```

如果是 `let v = vec![1, 2, 3]`，那生成的代码最后返回的值 `temp_vec` 将被赋予给变量 `v`，等同于 :

```rust
let v = {
    let mut temp_vec = Vec::new();
    temp_vec.push(1);
    temp_vec.push(2);
    temp_vec.push(3);
    temp_vec
}
```

至此，我们定义了一个宏，它可以接受任意类型和数量的参数，并且理解了其语法的含义。

#### 未来将被替代的 `macro_rules`

对于 `macro_rules` 来说，它是存在一些问题的，因此，Rust 计划在未来使用新的声明式宏来替换它：工作方式类似，但是解决了目前存在的一些问题，在那之后，`macro_rules` 将变为 `deprecated` 状态。

由于绝大多数 Rust 开发者都是宏的用户而不是编写者，因此在这里我们不会对 `macro_rules` 进行更深入的学习，如果大家感兴趣，可以看看这本书 [ “The Little Book of Rust Macros”](https://veykril.github.io/tlborm/)。

## 用过程宏为属性标记生成代码

第二种常用的宏就是[_过程宏_](https://doc.rust-lang.org/reference/procedural-macros.html) ( _procedural macros_ )，从形式上来看，过程宏跟函数较为相像，但过程宏是使用源代码作为输入参数，基于代码进行一系列操作后，再输出一段全新的代码。**注意，过程宏中的 derive 宏输出的代码并不会替换之前的代码，这一点与声明宏有很大的不同！**

至于前文提到的过程宏的三种类型(自定义 `derive`、属性宏、函数宏)，它们的工作方式都是类似的。

当**创建过程宏**时，它的定义必须要放入一个独立的包中，且包的类型也是特殊的，这么做的原因相当复杂，大家只要知道这种限制在未来可能会有所改变即可。

> 事实上，根据[这个说法](https://www.reddit.com/r/rust/comments/t1oa1e/what_are_the_complex_technical_reasons_why/)，过程宏放入独立包的原因在于它必须先被编译后才能使用，如果过程宏和使用它的代码在一个包，就必须先单独对过程宏的代码进行编译，然后再对我们的代码进行编译，但悲剧的是 Rust 的编译单元是包，因此你无法做到这一点。

假设我们要创建一个 `derive` 类型的过程宏：

```rust
use proc_macro;

#[proc_macro_derive(HelloMacro)]
pub fn some_name(input: TokenStream) -> TokenStream {
}
```

用于定义过程宏的函数 `some_name` 使用 `TokenStream` 作为输入参数，并且返回的也是同一个类型。`TokenStream` 是在 `proc_macro` 包中定义的，顾名思义，它代表了一个 `Token` 序列。

在理解了过程宏的基本定义后，我们再来看看该如何创建三种类型的过程宏，首先，从大家最熟悉的 `derive` 开始。

## 自定义 `derive` 过程宏

假设我们有一个特征 `HelloMacro`，现在有两种方式让用户使用它：

- 为每个类型手动实现该特征，就像之前[特征章节](https://course.rs/basic/trait/trait.html#为类型实现特征)所做的
- 使用过程宏来统一实现该特征，这样用户只需要对类型进行标记即可：`#[derive(HelloMacro)]`

以上两种方式并没有孰优孰劣，主要在于不同的类型是否可以使用同样的默认特征实现，如果可以，那过程宏的方式可以帮我们减少很多代码实现:

```rust
use hello_macro::HelloMacro;
use hello_macro_derive::HelloMacro;

#[derive(HelloMacro)]
struct Sunfei;

#[derive(HelloMacro)]
struct Sunface;

fn main() {
    Sunfei::hello_macro();
    Sunface::hello_macro();
}
```

简单吗？简单！不过为了实现这段代码展示的功能，我们还需要创建相应的过程宏才行。 首先，创建一个新的工程用于演示：

```shell
$ cargo new hello_macro
$ cd hello_macro/
$ touch src/lib.rs
```

此时，`src` 目录下包含两个文件 `lib.rs` 和 `main.rs`，前者是 `lib` 包根，后者是二进制包根，如果大家对包根不熟悉，可以看看[这里](https://course.rs/basic/crate-module/crate.html)。

接下来，先在 `src/lib.rs` 中定义过程宏所需的 `HelloMacro` 特征和其关联函数:

```rust
pub trait HelloMacro {
    fn hello_macro();
}
```

然后在 `src/main.rs` 中编写主体代码，首先映入大家脑海的可能会是如下实现:

```rust
use hello_macro::HelloMacro;

struct Sunfei;

impl HelloMacro for Sunfei {
    fn hello_macro() {
        println!("Hello, Macro! My name is Sunfei!");
    }
}

struct Sunface;

impl HelloMacro for Sunface {
    fn hello_macro() {
        println!("Hello, Macro! My name is Sunface!");
    }
}

fn main() {
    Sunfei::hello_macro();
}
```

但是这种方式有个问题，如果想要实现不同的招呼内容，就需要为每一个类型都实现一次相应的特征，Rust 不支持反射，因此我们无法在运行时获得类型名。

使用宏，就不存在这个问题：

```rust
use hello_macro::HelloMacro;
use hello_macro_derive::HelloMacro;

#[derive(HelloMacro)]
struct Sunfei;

#[derive(HelloMacro)]
struct Sunface;

fn main() {
    Sunfei::hello_macro();
    Sunface::hello_macro();
}
```

简单明了的代码总是令人愉快，为了让代码运行起来，还需要定义下过程宏。就如前文提到的，目前只能在单独的包中定义过程宏，尽管未来这种限制会被取消，但是现在我们还得遵循这个规则。

宏所在的包名自然也有要求，必须以 `derive` 为后缀，对于 `hello_macro` 宏而言，包名就应该是 `hello_macro_derive`。在之前创建的 `hello_macro` 项目根目录下，运行如下命令，创建一个单独的 `lib` 包:

```rust
cargo new hello_macro_derive --lib
```

至此， `hello_macro` 项目的目录结构如下：

```shell
hello_macro
├── Cargo.toml
├── src
│   ├── main.rs
│   └── lib.rs
└── hello_macro_derive
    ├── Cargo.toml
    ├── src
        └── lib.rs
```

由于过程宏所在的包跟我们的项目紧密相连，因此将它放在项目之中。现在，问题又来了，该如何在项目的 `src/main.rs` 中引用 `hello_macro_derive` 包的内容？

方法有两种，第一种是将 `hello_macro_derive` 发布到 `crates.io` 或 `GitHub` 中，就像我们引用的其它依赖一样；另一种就是使用相对路径引入的本地化方式，修改 `hello_macro/Cargo.toml` 文件添加以下内容:

```toml
[dependencies]
hello_macro_derive = { path = "../hello_macro/hello_macro_derive" }
# 也可以使用下面的相对路径
# hello_macro_derive = { path = "./hello_macro_derive" }
```

此时，`hello_macro` 项目就可以成功的引用到 `hello_macro_derive` 本地包了，对于项目依赖引入的详细介绍，可以参见 [Cargo 章节](https://course.rs/cargo/dependency.html)。

另外，学习过程更好的办法是通过展开宏来阅读和调试自己写的宏，这里需要用到一个 cargo-expand 的工具，可以通过下面的命令安装
```bash
cargo install cargo-expand
```

接下来，就到了重头戏环节，一起来看看该如何定义过程宏。

#### 定义过程宏

首先，在 `hello_macro_derive/Cargo.toml` 文件中添加以下内容：

```toml
[lib]
proc-macro = true

[dependencies]
syn = "1.0"
quote = "1.0"
```

其中 `syn` 和 `quote` 依赖包都是定义过程宏所必需的，同时，还需要在 `[lib]` 中将过程宏的开关开启 : `proc-macro = true`。

其次，在 `hello_macro_derive/src/lib.rs` 中添加如下代码：

```rust
extern crate proc_macro;

use proc_macro::TokenStream;
use quote::quote;
use syn;
use syn::DeriveInput;

#[proc_macro_derive(HelloMacro)]
pub fn hello_macro_derive(input: TokenStream) -> TokenStream {
    // 基于 input 构建 AST 语法树
    let ast:DeriveInput = syn::parse(input).unwrap();

    // 构建特征实现代码
    impl_hello_macro(&ast)
}
```

这个函数的签名我们在之前已经介绍过，总之，这种形式的过程宏定义是相当通用的，下面来分析下这段代码。

首先有一点，对于绝大多数过程宏而言，这段代码往往只在 `impl_hello_macro(&ast)` 中的实现有所区别，对于其它部分基本都是一致的，例如包的引入、宏函数的签名、语法树构建等。

`proc_macro` 包是 Rust 自带的，因此无需在 `Cargo.toml` 中引入依赖，它包含了相关的编译器 `API`，可以用于读取和操作 Rust 源代码。

由于我们为 `hello_macro_derive` 函数标记了 `#[proc_macro_derive(HelloMacro)]`，当用户使用 `#[derive(HelloMacro)]` 标记了他的类型后，`hello_macro_derive` 函数就将被调用。这里的秘诀就是特征名 `HelloMacro`，它就像一座桥梁，将用户的类型和过程宏联系在一起。

`syn` 将字符串形式的 Rust 代码解析为一个 AST 树的数据结构，该数据结构可以在随后的 `impl_hello_macro` 函数中进行操作。最后，操作的结果又会被 `quote` 包转换回 Rust 代码。这些包非常关键，可以帮我们节省大量的精力，否则你需要自己去编写支持代码解析和还原的解析器，这可不是一件简单的任务！

derive过程宏只能用在struct/enum/union上，多数用在结构体上，我们先来看一下一个结构体由哪些部分组成:
```rust
// vis，可视范围             ident，标识符     generic，范型    fields: 结构体的字段
pub              struct    User            <'a, T>          {
   
// vis   ident   type
   pub   name:   &'a T,
   
}
```

其中type还可以细分，具体请阅读syn文档或源码

`syn::parse` 调用会返回一个 `DeriveInput` 结构体来代表解析后的 Rust 代码:

```rust
DeriveInput {
    // --snip--
    vis: Visibility,
    ident: Ident {
        ident: "Sunfei",
        span: #0 bytes(95..103)
    },
    generics: Generics,
    // Data是一个枚举，分别是DataStruct，DataEnum，DataUnion，这里以 DataStruct 为例
    data: Data(
        DataStruct {
            struct_token: Struct,
            fields: Fields,
            semi_token: Some(
                Semi
            )
        }
    )
}
```

以上就是源代码 `struct Sunfei;` 解析后的结果，里面有几点值得注意:

- `fields: Fields` 是一个枚举类型，FieldsNamed，FieldsUnnamed，FieldsUnnamed， 分别表示显示命名结构（如例子所示），匿名字段的结构（例如 struct A(u8);），和无字段定义的结构（例如 struct A;）
- `ident: "Sunfei"` 说明类型名称为 `Sunfei`， `ident` 是标识符 `identifier` 的简写

如果想要了解更多的信息，可以查看 [`syn` 文档](https://docs.rs/syn/1.0/syn/struct.DeriveInput.html)。

大家可能会注意到在 `hello_macro_derive` 函数中有 `unwrap` 的调用，也许会以为这是为了演示目的，没有做错误处理，实际上并不是的。由于该函数只能返回 `TokenStream` 而不是 `Result`，那么在报错时直接 `panic` 来抛出错误就成了相当好的选择。当然，这里实际上还是做了简化，在生产项目中，你应该通过 `panic!` 或 `expect` 抛出更具体的报错信息。

至此，这个函数大家应该已经基本理解了，下面来看看如何构建特征实现的代码，也是过程宏的核心目标:

```rust
fn impl_hello_macro(ast: &syn::DeriveInput) -> TokenStream {
    let name = &ast.ident;
    let gen = quote! {
        impl HelloMacro for #name {
            fn hello_macro() {
                println!("Hello, Macro! My name is {}!", stringify!(#name));
            }
        }
    };
    gen.into()
}
```

首先，将结构体的名称赋予给 `name`，也就是 `name` 中会包含一个字段，它的值是字符串 "Sunfei"。

其次，使用 `quote!` 可以定义我们想要返回的 Rust 代码。由于编译器需要的内容和 `quote!` 直接返回的不一样，因此还需要使用 `.into` 方法其转换为 `TokenStream`。

大家注意到 `#name` 的使用了吗？这也是 `quote!` 提供的功能之一，如果想要深入了解 `quote`，可以看看[官方文档](https://docs.rs/quote)。

特征的 `hell_macro()` 函数只有一个功能，就是使用 `println!` 打印一行欢迎语句。

其中 `stringify!` 是 Rust 提供的内置宏，可以将一个表达式(例如 `1 + 2`)在编译期转换成一个字符串字面值(`"1 + 2"`)，该字面量会直接打包进编译出的二进制文件中，具有 `'static` 生命周期。而 `format!` 宏会对表达式进行求值，最终结果是一个 `String` 类型。在这里使用 `stringify!` 有两个好处:

- `#name` 可能是一个表达式，我们需要它的字面值形式
- 可以减少一次 `String` 带来的内存分配

在运行之前，可以显示用 expand 展开宏，观察是否有错误或是否符合预期:
```shell
$ cargo expand
```
```rust
struct Sunfei;
impl HelloMacro for Sunfei {
    fn hello_macro() {
        {
            ::std::io::_print(
                ::core::fmt::Arguments::new_v1(
                    &["Hello, Macro! My name is ", "!\n"],
                    &[::core::fmt::ArgumentV1::new_display(&"Sunfei")],
                ),
            );
        };
    }
}
struct Sunface;
impl HelloMacro for Sunface {
    fn hello_macro() {
        {
            ::std::io::_print(
                ::core::fmt::Arguments::new_v1(
                    &["Hello, Macro! My name is ", "!\n"],
                    &[::core::fmt::ArgumentV1::new_display(&"Sunface")],
                ),
            );
        };
    }
}
fn main() {
    Sunfei::hello_macro();
    Sunface::hello_macro();
}
```

从展开的代码也能看出derive宏的特性，struct Sunfei; 和 struct Sunface; 都被保留了，也就是说最后 impl_hello_macro() 返回的token被加到结构体后面，这和类属性宏可以修改输入
的token是不一样的，input的token并不能被修改

至此，过程宏的定义、特征定义、主体代码都已经完成，运行下试试:

```shell
$ cargo run

     Running `target/debug/hello_macro`
Hello, Macro! My name is Sunfei!
Hello, Macro! My name is Sunface!
```

Bingo，虽然过程有些复杂，但是结果还是很喜人，我们终于完成了自己的第一个过程宏！

下面来实现一个更实用的例子，实现官方的#[derive(Default)]宏，废话不说直接开干:

```rust
extern crate proc_macro;
use proc_macro::TokenStream;
use quote::quote;
use syn::{self, Data};
use syn::DeriveInput;

#[proc_macro_derive(MyDefault)]
pub fn my_default(input: TokenStream) -> TokenStream {
    let ast: DeriveInput = syn::parse(input).unwrap();
    let id = ast.ident;

    let Data::Struct(s) = ast.data else{
        panic!("MyDefault derive macro must use in struct");
    };

    // 声明一个新的ast，用于动态构建字段赋值的token
    let mut field_ast = quote!();

    // 这里就是要动态添加token的地方了，需要动态完成Self的字段赋值
    for (idx,f) in s.fields.iter().enumerate() {
        let (field_id, field_ty) = (&f.ident, &f.ty);


        if field_id.is_none(){
             //没有ident表示是匿名字段，对于匿名字段，都需要添加 `#field_idx: #field_type::default(),` 这样的代码
            let field_idx  = syn::Index::from(idx);
            field_ast.extend(quote! {
                # field_idx: # field_ty::default(),
            });
        }else{
            //对于命名字段，都需要添加 `#field_name: #field_type::default(),` 这样的代码
            field_ast.extend(quote! {
                # field_id: # field_ty::default(),
            });
        }
    }

    quote! {
        impl Default for # id {
            fn default() -> Self {
                Self {
                    # field_ast
                }
            }
        }
    }.into()
}
```

然后来写使用代码:

```rust
#[derive(MyDefault)]
struct SomeData (u32,String);

#[derive(MyDefault)]
struct User {
    name: String,
    data: SomeData,
}

fn main() {
 
}
```

然后我们先展开代码看一看

```rust
struct SomeData(u32, String);
impl Default for SomeData {
    fn default() -> Self {
        Self {
            0: u32::default(),
            1: String::default(),
        }
    }
}
struct User {
    name: String,
    data: SomeData,
}
impl Default for User {
    fn default() -> Self {
        Self {
            name: String::default(),
            data: SomeData::default(),
        }
    }
}
fn main() {}
```

展开的代码符合预期，然后我们修改一下使用代码并测试结果

```rust
#[derive(MyDefault, Debug)]
struct SomeData (u32,String);

#[derive(MyDefault, Debug)]
struct User {
    name: String,
    data: SomeData,
}

fn main() {
    println!("{:?}", User::default());
}
```

执行

```shell
$ cargo run

    Running `target/debug/aaa`
User { name: "", data: SomeData(0, "") }
```



接下来，再来看看过程宏的另外两种类型跟 `derive` 类型有何区别。

## 类属性宏(Attribute-like macros)

类属性过程宏跟 `derive` 宏类似，但是前者允许我们定义自己的属性。除此之外，`derive` 只能用于结构体和枚举，而类属性宏可以用于其它类型项，例如函数。

假设我们在开发一个 `web` 框架，当用户通过 `HTTP GET` 请求访问 `/` 根路径时，使用 `index` 函数为其提供服务:

```rust
#[route(GET, "/")]
fn index() {
```

如上所示，代码功能非常清晰、简洁，这里的 `#[route]` 属性就是一个过程宏，它的定义函数大概如下：

```rust
#[proc_macro_attribute]
pub fn route(attr: TokenStream, item: TokenStream) -> TokenStream {
```

与 `derive` 宏不同，类属性宏的定义函数有两个参数：

- 第一个参数时用于说明属性包含的内容：`Get, "/"` 部分
- 第二个是属性所标注的类型项，在这里是 `fn index() {...}`，注意，函数体也被包含其中

除此之外，类属性宏跟 `derive` 宏的工作方式并无区别：创建一个包，类型是 `proc-macro`，接着实现一个函数用于生成想要的代码。

## 类函数宏(Function-like macros)

类函数宏可以让我们定义像函数那样调用的宏，从这个角度来看，它跟声明宏 `macro_rules` 较为类似。

区别在于，`macro_rules` 的定义形式与 `match` 匹配非常相像，而类函数宏的定义形式则类似于之前讲过的两种过程宏:

```rust
#[proc_macro]
pub fn sql(input: TokenStream) -> TokenStream {
```

而使用形式则类似于函数调用:

```rust
let sql = sql!(SELECT * FROM posts WHERE id=1);
```

大家可能会好奇，为何我们不使用声明宏 `macro_rules` 来定义呢？原因是这里需要对 `SQL` 语句进行解析并检查其正确性，这个复杂的过程是 `macro_rules` 难以对付的，**而过程宏相比起来就会灵活的多**。

## 补充学习资料

1. [dtolnay/proc-macro-workshop](https://github.com/dtolnay/proc-macro-workshop)，学习如何编写过程宏
2. [The Little Book of Rust Macros](https://veykril.github.io/tlborm/)，学习如何编写声明宏 `macro_rules!`
3. [syn](https://crates.io/crates/syn) 和 [quote](https://crates.io/crates/quote) ，用于编写过程宏的包，它们的文档有很多值得学习的东西
4. [Structuring, testing and debugging procedural macro crates](https://www.reddit.com/r/rust/comments/rjumsg/any_good_resources_for_learning_rust_macros/)，从测试、debug、结构化的角度来编写过程宏
5. [blog.turbo.fish](https://blog.turbo.fish)，里面的过程宏系列文章值得一读
6. [Rust 宏小册中文版](https://zjp-cn.github.io/tlborm/)，非常详细的解释了宏各种知识

## 总结

Rust 中的宏主要分为两大类：声明宏和过程宏。

声明宏目前使用 `macro_rules` 进行创建，它的形式类似于 `match` 匹配，对于用户而言，可读性和维护性都较差。由于其存在的问题和限制，在未来， `macro_rules` 会被 `deprecated`，Rust 会使用一个新的声明宏来替代它。

而过程宏的定义更像是我们平时写函数的方式，因此它更加灵活，它分为三种类型：`derive` 宏、类属性宏、类函数宏，具体在文中都有介绍。

虽然 Rust 中的宏很强大，但是它并不应该成为我们的常规武器，原因是它会影响 Rust 代码的可读性和可维护性，我相信没有几个人愿意去维护别人写的宏 ：）

因此，大家应该熟悉宏的使用场景，但是不要滥用，当你真的需要时，再回来查看本章了解实现细节，这才是最完美的使用方式。
