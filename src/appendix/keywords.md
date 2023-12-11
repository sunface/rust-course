## 附录 A：关键字

下面的列表包含 Rust 中正在使用或者以后会用到的关键字。因此，这些关键字不能被用作标识符（除了[原生标识符](#原生标识符)），包括函数、变量、参数、结构体字段、模块、包、常量、宏、静态值、属性、类型、特征或生命周期。

### 目前正在使用的关键字

如下关键字目前有对应其描述的功能。

- `as` - 强制类型转换，或`use` 和 `extern crate`包和模块引入语句中的重命名
- `async` - 返回一个 Future 而不是阻塞当前线程
- `await` - 暂停执行直到 Future 的结果就绪
- `break` - 立刻退出循环
- `const` - 定义常量或原生常量指针（constant raw pointer）
- `continue` - 继续进入下一次循环迭代
- `crate` - 链接外部包
- `dyn` - 动态分发特征对象
- `else` - 作为 `if` 和 `if let` 控制流结构的 fallback
- `enum` - 定义一个枚举类型
- `extern` - 链接一个外部包,或者一个宏变量(该变量定义在另外一个包中)
- `false` - 布尔值 `false`
- `fn` - 定义一个函数或 **函数指针类型** (_function pointer type_)
- `for` - 遍历一个迭代器或实现一个 trait 或者指定一个更高级的生命周期
- `if` - 基于条件表达式的结果来执行相应的分支
- `impl` - 为结构体或者特征实现具体功能
- `in` - `for` 循环语法的一部分
- `let` - 绑定一个变量
- `loop` - 无条件循环
- `match` - 模式匹配
- `mod` - 定义一个模块
- `move` - 使闭包获取其所捕获项的所有权
- `mut` - 在引用、裸指针或模式绑定中使用，表明变量是可变的
- `pub` - 表示结构体字段、`impl` 块或模块的公共可见性
- `ref` - 通过引用绑定
- `return` - 从函数中返回
- `Self` - 实现特征类型的类型别名
- `self` - 表示方法本身或当前模块
- `static` - 表示全局变量或在整个程序执行期间保持其生命周期
- `struct` - 定义一个结构体
- `super` - 表示当前模块的父模块
- `trait` - 定义一个特征
- `true` - 布尔值 `true`
- `type` - 定义一个类型别名或关联类型
- `unsafe` - 表示不安全的代码、函数、特征或实现
- `use` - 在当前代码范围内(模块或者花括号对)引入外部的包、模块等
- `where` - 表示一个约束类型的从句
- `while` - 基于一个表达式的结果判断是否继续循环

### 保留做将来使用的关键字

如下关键字没有任何功能，不过由 Rust 保留以备将来的应用。

- `abstract`
- `become`
- `box`
- `do`
- `final`
- `macro`
- `override`
- `priv`
- `try`
- `typeof`
- `unsized`
- `virtual`
- `yield`

### 原生标识符

原生标识符（Raw identifiers）允许你使用通常不能使用的关键字，其带有 `r#` 前缀。

例如，`match` 是关键字。如果尝试编译如下使用 `match` 作为名字的函数：

```rust,ignore,does_not_compile
fn match(needle: &str, haystack: &str) -> bool {
    haystack.contains(needle)
}
```

会得到这个错误：

```text
error: expected identifier, found keyword `match`
 --> src/main.rs:4:4
  |
4 | fn match(needle: &str, haystack: &str) -> bool {
  |    ^^^^^ expected identifier, found keyword
```

该错误表示你不能将关键字 `match` 用作函数标识符。你可以使用原生标识符将 `match` 作为函数名称使用：

<span class="filename">文件名: src/main.rs</span>

```rust
fn r#match(needle: &str, haystack: &str) -> bool {
    haystack.contains(needle)
}

fn main() {
    assert!(r#match("foo", "foobar"));
}
```

此代码编译没有任何错误。注意 `r#` 前缀需同时用于函数名定义和 `main` 函数中的调用。

原生标识符允许使用你选择的任何单词作为标识符，即使该单词恰好是保留关键字。 此外，原生标识符允许你使用其它 Rust 版本编写的库。比如，`try` 在 Rust 2015 edition 中不是关键字，却在 Rust 2018 edition 是关键字。所以如果用 2015 edition 编写的库中带有 `try` 函数，在 2018 edition 中调用时就需要使用原始标识符语法，在这里是 `r#try`。
