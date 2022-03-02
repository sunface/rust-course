# 变量绑定与解构

鉴于本书的目标读者（别慌，来到这里就说明你就是目标读者）已经熟练掌握其它任意一门编程语言，因此这里就不再对何为变量进行赘述，让我们开门见山来谈谈，为何 Rust 选择了手动设定变量的可变性。

## 为何要手动设置变量的可变性？

在其它大多数语言中，变量一旦创建，要么是可变的，要么是不可变的（ClosureScript），前者为编程提供了灵活性，后者为编程提供了安全性，而 Rust 比较野，选择了两者我都要，既要灵活性又要安全性。

能想要学习 Rust，说明我们的读者都是相当有水平的程序员了，你们应该能理解**一切选择皆是权衡**，那么两者都要的权衡是什么呢？这就是 Rust 开发团队为我们做出的贡献，两者都要意味着 Rust 语言底层代码的实现复杂度大幅提升，因此 Respect to The Rust Team!

除了以上两个优点，还有一个很大的优点，那就是运行性能上的提升，因为将本身无需改变的变量声明为不可变在运行期会避免一些多余的 `runtime` 检查。

## 变量命名

在命名方面，和其它语言没有区别，不过当给变量命名时，需要遵循 [Rust 命名规范](https://course.rs/practice/naming.html)。

> Rust 语言有一些**关键字**（_keywords_），和其他语言一样，这些关键字都是被保留给 Rust 语言使用的，因此，它们不能被用作变量或函数的名称。在 [附录 A](../appendix/keywords) 中可找到关键字列表。

## 变量绑定

在其它语言中，我们用 `var a = "hello world"` 的方式给 `a` 赋值，也就是把等式右边的 `"hello world"` 字符串赋值给变量 `a` ，而在 Rust 中，我们这样写： `let a = "hello world"` ，同时给这个过程起了另一个名字：**变量绑定**。

为何不用赋值而用绑定呢(其实你也可以称之为赋值，但是绑定的含义更清晰准确)？这里就涉及 Rust 最核心的原则——**所有权**，简单来讲，任何内存对象都是有主人的，而且一般情况下完全属于它的主人，绑定就是把这个对象绑定给一个变量，让这个变量成为它的主人(聪明的读者应该能猜到，在这种情况下，该对象之前的主人就会丧失对该对象的所有权)，像极了我们的现实世界，不是吗？

至于为何要采用所有权这种复杂的东东，先别急，等时机合适，我们会为你详细道来。

## 变量可变性

Rust 的变量在默认情况下是**不可变的**。在上文提到过，这是 Rust 团队为我们精心设计的语言特性之一，这样可以让我们编写更安全、更高性能的代码。当然你可以通过 `mut` 关键字让变量变为**可变的**，以实现更加灵活的设计。

当变量不可变时，这意味着一旦一个值绑定到一个变量 `a` 后，就不能再更改 `a` 的值了。为了说明，在我们的工程目录下使用 `cargo new variables` 来创建一个名为 _variables_ 的新项目。

然后在新建的 _variables_ 目录下，打开 _src/main.rs_ 并将代码替换为下面还未能通过编译的代码：

```rust
fn main() {
    let x = 5;
    println!("The value of x is: {}", x);
    x = 6;
    println!("The value of x is: {}", x);
}
```

保存文件，并使用 `cargo run` 运行程序，你将会收到一条错误消息，输出如下所示：

```console
$ cargo run
   Compiling variables v0.1.0 (file:///projects/variables)
error[E0384]: cannot assign twice to immutable variable `x`
 --> src/main.rs:4:5
  |
2 |     let x = 5;
  |         -
  |         |
  |         first assignment to `x`
  |         help: consider making this binding mutable: `mut x`
3 |     println!("The value of x is: {}", x);
4 |     x = 6;
  |     ^^^^^ cannot assign twice to immutable variable

error: aborting due to previous error
```

具体的错误原因是 `cannot assign twice to immutable variable x`（对不可变的变量无法进行二次再赋值），因为我们尝试给不可变的 `x` 变量赋予了第二个值。

这种错误是为了避免无法预期的错误发生在我们的变量上：一个变量往往被多处代码所使用，其中一部分代码假定该变量的值永远不会改变，而另外一部分代码却无情的改变了这个值，在实际开发过程中，这个错误是很难被发现的，特别是在多线程编程中。

这种规则让我们的代码变得非常清晰，只有你想让你的变量改变时，它才能改变，这样就不会造成心智上的负担，也给别人阅读代码带来便利。

但是可变性也非常重要，否则我们就要像 ClosureScript 那样，每次要改变，就要重新生成一个对象，在拥有大量对象的场景，性能会变得非常低下，内存拷贝的成本异常的高。

在 Rust 中，可变性很简单，只要在变量名前加一个 `mut` 即可, 而且这种显式的声明方式还会给后来人传达这样的信息：嗯，这个变量在后面代码部分会发生改变。

为了让变量声明为可变,将 _src/main.rs_ 改为以下内容：

```rust
fn main() {
    let mut x = 5;
    println!("The value of x is: {}", x);
    x = 6;
    println!("The value of x is: {}", x);
}
```

运行程序将得到下面结果：

```console
$ cargo run
   Compiling variables v0.1.0 (file:///projects/variables)
    Finished dev [unoptimized + debuginfo] target(s) in 0.30s
     Running `target/debug/variables`
The value of x is: 5
The value of x is: 6
```

选择可变还是不可变，更多的还是取决于你的使用场景，例如不可变可以带来安全性，但是丧失了灵活性和性能(如果你要改变，就要重新创建一个新的变量，这里涉及到内存对象的再分配)。而可变变量最大的好处就是使用上的灵活性和性能上的提升。

例如，在使用大型数据结构或者热点代码路径(被大量频繁调用)的情形下，在同一内存位置更新实例可能比复制并返回新分配的实例要更快。使用较小的数据结构时，通常创建新的实例并以更具函数式的风格来编写程序，可能会更容易理解，所以值得以较低的性能开销来确保代码清晰。

### 变量解构

`let` 表达式不仅仅用于变量的绑定，还能进行复杂变量的解构：从一个相对复杂的变量中，匹配出该变量的一部分内容：

```rust
fn main() {
    let (a, mut b): (bool,bool) = (true, false);
    // a = true,不可变; b = false，可变
    println!("a = {:?}, b = {:?}", a, b);

    b = true;
    assert_eq!(a, b);
}
```

### 解构式赋值

在 [Rust 1.59](https://course.rs/appendix/rust-versions/1.59.html) 版本后，我们可以在赋值语句的左式中使用元组、切片和结构体模式了。

```rust
struct Struct {
    e: i32
}

fn main() {
    let (a, b, c, d, e);

    (a, b) = (1, 2);
    [c, .., d, _] = [1, 2, 3, 4, 5];
    Struct { e, .. } = Struct { e: 5 };

    assert_eq!([1, 2, 1, 4, 5], [a, b, c, d, e]);
}
```

这种使用方式跟之前的 `let` 保持了一致性，但是 `let` 会重新绑定，而这里仅仅是对之前绑定的变量进行再赋值。

需要注意的是，使用 `+=` 的赋值语句还不支持解构式赋值。

### 变量和常量之间的差异

变量的值不能更改可能让你想起其他另一个很多语言都有的编程概念：**常量**(_constant_)。与不可变变量一样，常量也是绑定到一个常量名且不允许更改的值，但是常量和变量之间存在一些差异：

- 常量不允许使用 `mut`。**常量不仅仅默认不可变，而且自始至终不可变**，因为常量在编译完成后，已经确定它的值。
- 常量使用 `const` 关键字而不是 `let` 关键字来声明，并且值的类型**必须**标注。

我们将在下一节[数据类型](./base-type/index.md)中介绍，因此现在暂时无需关心细节。

下面是一个常量声明的例子，其常量名为 `MAX_POINTS`，值设置为 `100,000`。（Rust 常量的命名约定是全部字母都使用大写，并使用下划线分隔单词，另外对数字字面量可插入下划线以提高可读性）：

```rust
const MAX_POINTS: u32 = 100_000;
```

常量可以在任意作用域内声明，包括全局作用域，在声明的作用域内，常量在程序运行的整个过程中都有效。对于需要在多处代码共享一个不可变的值时非常有用，例如游戏中允许玩家赚取的最大点数或光速。

> 在实际使用中，最好将程序中用到的硬编码值都声明为常量，对于代码后续的维护有莫大的帮助。如果将来需要更改硬编码的值，你也只需要在代码中更改一处即可。

### 变量遮蔽(shadowing)

Rust 允许声明相同的变量名，在后面声明的变量会遮蔽掉前面声明的，如下所示：

```rust
fn main() {
    let x = 5;
    // 在main函数的作用域内对之前的x进行遮蔽
    let x = x + 1;

    {
        // 在当前的花括号作用域内，对之前的x进行遮蔽
        let x = x * 2;
        println!("The value of x in the inner scope is: {}", x);
    }

    println!("The value of x is: {}", x);
}
```

这个程序首先将数值 `5` 绑定到 `x`，然后通过重复使用 `let x =` 来遮蔽之前的 `x`，并取原来的值加上 `1`，所以 `x` 的值变成了 `6`。第三个 `let` 语句同样遮蔽前面的 `x`，取之前的值并乘上 `2`，得到的 `x` 最终值为 `12`。当运行此程序，将输出以下内容：

```console
$ cargo run
   Compiling variables v0.1.0 (file:///projects/variables)
   ...
The value of x in the inner scope is: 12
The value of x is: 6
```

这和 `mut` 变量的使用是不同的，第二个 `let` 生成了完全不同的新变量，两个变量只是恰好拥有同样的名称，涉及一次内存对象的再分配
，而 `mut` 声明的变量，可以修改同一个内存地址上的值，并不会发生内存对象的再分配，性能要更好。

变量遮蔽的用处在于，如果你在某个作用域内无需再使用之前的变量（在被遮蔽后，无法再访问到之前的同名变量），就可以重复的使用变量名字，而不用绞尽脑汁去想更多的名字。

例如，假设有一个程序要统计一个空格字符串的空格数量：

```rust
// 字符串类型
let spaces = "   ";
// usize数值类型
let spaces = spaces.len();
```

这种结构是允许的，因为第一个 `spaces` 变量是一个字符串类型，第二个 `spaces` 变量是一个全新的变量且和第一个具有相同的变量名，且是一个数值类型。所以变量遮蔽可以帮我们节省些脑细胞，不用去想如 `spaces_str` 和 `spaces_num` 此类的变量名；相反我们可以重复使用更简单的 `spaces` 变量名。如果你不用 `let` :

```rust,
let mut spaces = "   ";
spaces = spaces.len();
```

运行一下，你就会发现编译器报错：

```console
$ cargo run
   Compiling variables v0.1.0 (file:///projects/variables)
error[E0308]: mismatched types
 --> src/main.rs:3:14
  |
3 |     spaces = spaces.len();
  |              ^^^^^^^^^^^^ expected `&str`, found `usize`

error: aborting due to previous error
```

显然，Rust 对类型的要求很严格，不允许将整数类型 `usize` 赋值给字符串类型。`usize` 是一种 CPU 相关的整数类型，在[数值类型](./base-type/numbers#整数类型)中有详细介绍。

万事开头难，到目前为止，都进展很顺利，那下面开始，咱们正式进入 Rust 的类型世界，看看有哪些挑战在前面等着大家。
