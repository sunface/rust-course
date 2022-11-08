# 全模式列表

在本书中我们已领略过许多不同类型模式的例子，本节的目标就是把这些模式语法都罗列出来，方便大家检索查阅（模式匹配在我们的开发中会经常用到）。

### 匹配字面值

```rust
let x = 1;

match x {
    1 => println!("one"),
    2 => println!("two"),
    3 => println!("three"),
    _ => println!("anything"),
}
```

这段代码会打印 `one` 因为 `x` 的值是 1，如果希望代码获得特定的具体值，那么这种语法很有用。

### 匹配命名变量

在 [match](https://course.rs/match-if-let.html#变量覆盖) 中，我们有讲过变量覆盖的问题，这个在**匹配命名变量**时会遇到：

```rust
fn main() {
    let x = Some(5);
    let y = 10;

    match x {
        Some(50) => println!("Got 50"),
        Some(y) => println!("Matched, y = {:?}", y),
        _ => println!("Default case, x = {:?}", x),
    }

    println!("at the end: x = {:?}, y = {:?}", x, y);
}
```

让我们看看当 `match` 语句运行的时候发生了什么。第一个匹配分支的模式并不匹配 `x` 中定义的值，所以代码继续执行。

第二个匹配分支中的模式引入了一个新变量 `y`，它会匹配任何 `Some` 中的值。因为这里的 `y` 在 `match` 表达式的作用域中，而不是之前 `main` 作用域中，所以这是一个新变量，不是开头声明为值 10 的那个 `y`。这个新的 `y` 绑定会匹配任何 `Some` 中的值，在这里是 `x` 中的值。因此这个 `y` 绑定了 `x` 中 `Some` 内部的值。这个值是 5，所以这个分支的表达式将会执行并打印出 `Matched，y = 5`。

如果 `x` 的值是 `None` 而不是 `Some(5)`，头两个分支的模式不会匹配，所以会匹配模式 `_`。这个分支的模式中没有引入变量 `x`，所以此时表达式中的 `x` 会是外部没有被覆盖的 `x`，也就是 `None`。

一旦 `match` 表达式执行完毕，其作用域也就结束了，同理内部 `y` 的作用域也结束了。最后的 `println!` 会打印 `at the end: x = Some(5), y = 10`。

如果你不想引入变量覆盖，那么需要使用匹配守卫(match guard)的方式，稍后在[匹配守卫提供的额外条件](#匹配守卫提供的额外条件)中会讲解。

### 单分支多模式

在 `match` 表达式中，可以使用 `|` 语法匹配多个模式，它代表 **或**的意思。例如，如下代码将 `x` 的值与匹配分支相比较，第一个分支有 **或** 选项，意味着如果 `x` 的值匹配此分支的任何一个模式，它就会运行：

```rust
let x = 1;

match x {
    1 | 2 => println!("one or two"),
    3 => println!("three"),
    _ => println!("anything"),
}
```

上面的代码会打印 `one or two`。

### 通过序列 `..=` 匹配值的范围

在[数值类型](https://course.rs/basic/base-type/numbers.html#序列range)中我们有讲到一个序列语法，该语法不仅可以用于循环中，还能用于匹配模式。

`..=` 语法允许你匹配一个闭区间序列内的值。在如下代码中，当模式匹配任何在此序列内的值时，该分支会执行：

```rust
let x = 5;

match x {
    1..=5 => println!("one through five"),
    _ => println!("something else"),
}
```

如果 `x` 是 1、2、3、4 或 5，第一个分支就会匹配。这相比使用 `|` 运算符表达相同的意思更为方便；相比 `1..=5`，使用 `|` 则不得不指定 `1 | 2 | 3 | 4 | 5` 这五个值，而使用 `..=` 指定序列就简短的多，比如希望匹配比如从 1 到 1000 的数字的时候！

序列只允许用于数字或字符类型，原因是：它们可以连续，同时编译器在编译期可以检查该序列是否为空，字符和数字值是 Rust 中仅有的可以用于判断是否为空的类型。

如下是一个使用字符类型序列的例子：

```rust
let x = 'c';

match x {
    'a'..='j' => println!("early ASCII letter"),
    'k'..='z' => println!("late ASCII letter"),
    _ => println!("something else"),
}
```

Rust 知道 `'c'` 位于第一个模式的序列内，所以会打印出 `early ASCII letter`。

### 解构并分解值

也可以使用模式来解构结构体、枚举、元组和引用。

#### 解构结构体

下面代码展示了如何用 `let` 解构一个带有两个字段 `x` 和 `y` 的结构体 `Point`：

```rust
struct Point {
    x: i32,
    y: i32,
}

fn main() {
    let p = Point { x: 0, y: 7 };

    let Point { x: a, y: b } = p;
    assert_eq!(0, a);
    assert_eq!(7, b);
}
```

这段代码创建了变量 `a` 和 `b` 来匹配结构体 `p` 中的 `x` 和 `y` 字段，这个例子展示了**模式中的变量名不必与结构体中的字段名一致**。不过通常希望变量名与字段名一致以便于理解变量来自于哪些字段。

因为变量名匹配字段名是常见的，同时因为 `let Point { x: x, y: y } = p;` 中 `x` 和 `y` 重复了，所以对于匹配结构体字段的模式存在简写：只需列出结构体字段的名称，则模式创建的变量会有相同的名称。下例与上例有着相同行为的代码，不过 `let` 模式创建的变量为 `x` 和 `y` 而不是 `a` 和 `b`：

```rust
struct Point {
    x: i32,
    y: i32,
}

fn main() {
    let p = Point { x: 0, y: 7 };

    let Point { x, y } = p;
    assert_eq!(0, x);
    assert_eq!(7, y);
}
```

这段代码创建了变量 `x` 和 `y`，与结构体 `p` 中的 `x` 和 `y` 字段相匹配。其结果是变量 `x` 和 `y` 包含结构体 `p` 中的值。

也可以使用字面值作为结构体模式的一部分进行解构，而不是为所有的字段创建变量。这允许我们测试一些字段为特定值的同时创建其他字段的变量。

下文展示了固定某个字段的匹配方式：

```rust
# struct Point {
#     x: i32,
#     y: i32,
# }
#
fn main() {
    let p = Point { x: 0, y: 7 };

    match p {
        Point { x, y: 0 } => println!("On the x axis at {}", x),
        Point { x: 0, y } => println!("On the y axis at {}", y),
        Point { x, y } => println!("On neither axis: ({}, {})", x, y),
    }
}
```

首先是 `match` 第一个分支，指定匹配 `y` 为 `0` 的 `Point`；
然后第二个分支在第一个分支之后，匹配 `y` 不为 `0`，`x` 为 `0` 的 `Point`;
最后一个分支匹配 `x` 不为 `0`，`y` 也不为 `0` 的 `Point`。

在这个例子中，值 `p` 因为其 `x` 包含 0 而匹配第二个分支，因此会打印出 `On the y axis at 7`。

#### 解构枚举

下面代码以 `Message` 枚举为例，编写一个 `match` 使用模式解构每一个内部值：

```rust
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(i32, i32, i32),
}

fn main() {
    let msg = Message::ChangeColor(0, 160, 255);

    match msg {
        Message::Quit => {
            println!("The Quit variant has no data to destructure.")
        }
        Message::Move { x, y } => {
            println!(
                "Move in the x direction {} and in the y direction {}",
                x,
                y
            );
        }
        Message::Write(text) => println!("Text message: {}", text),
        Message::ChangeColor(r, g, b) => {
            println!(
                "Change the color to red {}, green {}, and blue {}",
                r,
                g,
                b
            )
        }
    }
}
```

这里老生常谈一句话，模式匹配一样要类型相同，因此匹配 `Message::Move{1,2}` 这样的枚举值，就必须要用 `Message::Move{x,y}` 这样的同类型模式才行。

这段代码会打印出 `Change the color to red 0, green 160, and blue 255`。尝试改变 `msg` 的值来观察其他分支代码的运行。

对于像 `Message::Quit` 这样没有任何数据的枚举成员，不能进一步解构其值。只能匹配其字面值 `Message::Quit`，因此模式中没有任何变量。

对于另外两个枚举成员，就用相同类型的模式去匹配出对应的值即可。

#### 解构嵌套的结构体和枚举

目前为止，所有的例子都只匹配了深度为一级的结构体或枚举。 `match` 也可以匹配嵌套的项！

例如使用下面的代码来同时支持 RGB 和 HSV 色彩模式：

```rust
enum Color {
   Rgb(i32, i32, i32),
   Hsv(i32, i32, i32),
}

enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(Color),
}

fn main() {
    let msg = Message::ChangeColor(Color::Hsv(0, 160, 255));

    match msg {
        Message::ChangeColor(Color::Rgb(r, g, b)) => {
            println!(
                "Change the color to red {}, green {}, and blue {}",
                r,
                g,
                b
            )
        }
        Message::ChangeColor(Color::Hsv(h, s, v)) => {
            println!(
                "Change the color to hue {}, saturation {}, and value {}",
                h,
                s,
                v
            )
        }
        _ => ()
    }
}
```

`match` 第一个分支的模式匹配一个 `Message::ChangeColor` 枚举成员，该枚举成员又包含了一个 `Color::Rgb` 的枚举成员，最终绑定了 3 个内部的 `i32` 值。第二个，就交给亲爱的读者来思考完成。

#### 解构结构体和元组

我们甚至可以用复杂的方式来混合、匹配和嵌套解构模式。如下是一个复杂结构体的例子，其中结构体和元组嵌套在元组中，并将所有的原始类型解构出来：

```rust
struct Point {
     x: i32,
     y: i32,
 }

let ((feet, inches), Point {x, y}) = ((3, 10), Point { x: 3, y: -10 });
```

这种将复杂类型分解匹配的方式，可以让我们单独得到感兴趣的某个值。

### 忽略模式中的值

有时忽略模式中的一些值是很有用的，比如在 `match` 中的最后一个分支使用 `_` 模式匹配所有剩余的值。 你也可以在另一个模式中使用 `_` 模式，使用一个以下划线开始的名称，或者使用 `..` 忽略所剩部分的值。

#### 使用 `_` 忽略整个值

虽然 `_` 模式作为 `match` 表达式最后的分支特别有用，但是它的作用还不限于此。例如可以将其用于函数参数中：

```rust
fn foo(_: i32, y: i32) {
    println!("This code only uses the y parameter: {}", y);
}

fn main() {
    foo(3, 4);
}
```

这段代码会完全忽略作为第一个参数传递的值 `3`，并会打印出 `This code only uses the y parameter: 4`。

大部分情况当你不再需要特定函数参数时，最好修改签名不再包含无用的参数。在一些情况下忽略函数参数会变得特别有用，比如实现特征时，当你需要特定类型签名但是函数实现并不需要某个参数时。此时编译器就**不会警告说存在未使用的函数参数**，就跟使用命名参数一样。

#### 使用嵌套的 `_` 忽略部分值

可以在一个模式内部使用 `_` 忽略部分值：

```rust
let mut setting_value = Some(5);
let new_setting_value = Some(10);

match (setting_value, new_setting_value) {
    (Some(_), Some(_)) => {
        println!("Can't overwrite an existing customized value");
    }
    _ => {
        setting_value = new_setting_value;
    }
}

println!("setting is {:?}", setting_value);
```

这段代码会打印出 `Can't overwrite an existing customized value` 接着是 `setting is Some(5)`。

第一个匹配分支，我们不关心里面的值，只关心元组中两个元素的类型，因此对于 `Some` 中的值，直接进行忽略。
剩下的形如 `(Some(_),None)`，`(None, Some(_))`, `(None,None)` 形式，都由第二个分支 `_` 进行分配。

还可以在一个模式中的多处使用下划线来忽略特定值，如下所示，这里忽略了一个五元元组中的第二和第四个值：

```rust
let numbers = (2, 4, 8, 16, 32);

match numbers {
    (first, _, third, _, fifth) => {
        println!("Some numbers: {}, {}, {}", first, third, fifth)
    },
}
```

老生常谈：模式匹配一定要类型相同，因此匹配 `numbers` 元组的模式，也必须有五个值（元组中元素的数量也属于元组类型的一部分）。

这会打印出 `Some numbers: 2, 8, 32`, 值 4 和 16 会被忽略。

#### 使用下划线开头忽略未使用的变量

如果你创建了一个变量却不在任何地方使用它，Rust 通常会给你一个警告，因为这可能会是个 BUG。但是有时创建一个不会被使用的变量是有用的，比如你正在设计原型或刚刚开始一个项目。这时你希望告诉 Rust 不要警告未使用的变量，为此可以用下划线作为变量名的开头：

```rust
fn main() {
    let _x = 5;
    let y = 10;
}
```

这里得到了警告说未使用变量 `y`，至于 `x` 则没有警告。

注意, 只使用 `_` 和使用以下划线开头的名称有些微妙的不同：比如 **`_x` 仍会将值绑定到变量，而 `_` 则完全不会绑定**。

```rust
let s = Some(String::from("Hello!"));

if let Some(_s) = s {
    println!("found a string");
}

println!("{:?}", s);
```

`s` 是一个拥有所有权的动态字符串，在上面代码中，我们会得到一个错误，因为 `s` 的值会被转移给 `_s`，在 `println!` 中再次使用 `s` 会报错：

```console
error[E0382]: borrow of partially moved value: `s`
 --> src/main.rs:8:22
  |
4 |     if let Some(_s) = s {
  |                 -- value partially moved here
...
8 |     println!("{:?}", s);
  |                      ^ value borrowed here after partial move
```

只使用下划线本身，则并不会绑定值，因为 `s` 没有被移动进 `_`：

```rust
let s = Some(String::from("Hello!"));

if let Some(_) = s {
    println!("found a string");
}

println!("{:?}", s);
```

#### 用 `..` 忽略剩余值

对于有多个部分的值，可以使用 `..` 语法来只使用部分值而忽略其它值，这样也不用再为每一个被忽略的值都单独列出下划线。`..` 模式会忽略模式中剩余的任何没有显式匹配的值部分。

```rust
struct Point {
    x: i32,
    y: i32,
    z: i32,
}

let origin = Point { x: 0, y: 0, z: 0 };

match origin {
    Point { x, .. } => println!("x is {}", x),
}
```

这里列出了 `x` 值，接着使用了 `..` 模式来忽略其它字段，这样的写法要比一一列出其它字段，然后用 `_` 忽略简洁的多。

还可以用 `..` 来忽略元组中间的某些值：

```rust
fn main() {
    let numbers = (2, 4, 8, 16, 32);

    match numbers {
        (first, .., last) => {
            println!("Some numbers: {}, {}", first, last);
        },
    }
}
```

这里用 `first` 和 `last` 来匹配第一个和最后一个值。`..` 将匹配并忽略中间的所有值。

然而使用 `..` 必须是无歧义的。如果期望匹配和忽略的值是不明确的，Rust 会报错。下面代码展示了一个带有歧义的 `..` 例子，因此不能编译：

```rust
fn main() {
    let numbers = (2, 4, 8, 16, 32);

    match numbers {
        (.., second, ..) => {
            println!("Some numbers: {}", second)
        },
    }
}
```

如果编译上面的例子，会得到下面的错误：

```text
error: `..` can only be used once per tuple pattern // 每个元组模式只能使用一个 `..`
 --> src/main.rs:5:22
  |
5 |         (.., second, ..) => {
  |          --          ^^ can only be used once per tuple pattern
  |          |
  |          previously used here // 上一次使用在这里

error: could not compile `world_hello` due to previous error              ^^
```

Rust 无法判断，`second` 应该匹配 `numbers` 中的第几个元素，因此这里使用两个 `..` 模式，是有很大歧义的！

### 匹配守卫提供的额外条件

**匹配守卫**（_match guard_）是一个位于 `match` 分支模式之后的额外 `if` 条件，它能为分支模式提供更进一步的匹配条件。

这个条件可以使用模式中创建的变量：

```rust
let num = Some(4);

match num {
    Some(x) if x < 5 => println!("less than five: {}", x),
    Some(x) => println!("{}", x),
    None => (),
}
```

这个例子会打印出 `less than five: 4`。当 `num` 与模式中第一个分支匹配时，`Some(4)` 可以与 `Some(x)` 匹配，接着匹配守卫检查 `x` 值是否小于 5，因为 4 小于 5，所以第一个分支被选择。

相反如果 `num` 为 `Some(10)`，因为 10 不小于 5 ，所以第一个分支的匹配守卫为假。接着 Rust 会前往第二个分支，因为这里没有匹配守卫所以会匹配任何 `Some` 成员。

模式中无法提供类如 `if x < 5` 的表达能力，我们可以通过匹配守卫的方式来实现。

在之前，我们提到可以使用匹配守卫来解决模式中变量覆盖的问题，那里 `match` 表达式的模式中新建了一个变量而不是使用 `match` 之外的同名变量。内部变量覆盖了外部变量，意味着此时不能够使用外部变量的值，下面代码展示了如何使用匹配守卫修复这个问题。

```rust
fn main() {
    let x = Some(5);
    let y = 10;

    match x {
        Some(50) => println!("Got 50"),
        Some(n) if n == y => println!("Matched, n = {}", n),
        _ => println!("Default case, x = {:?}", x),
    }

    println!("at the end: x = {:?}, y = {}", x, y);
}
```

现在这会打印出 `Default case, x = Some(5)`。现在第二个匹配分支中的模式不会引入一个覆盖外部 `y` 的新变量 `y`，这意味着可以在匹配守卫中使用外部的 `y`。相比指定会覆盖外部 `y` 的模式 `Some(y)`，这里指定为 `Some(n)`。此新建的变量 `n` 并没有覆盖任何值，因为 `match` 外部没有变量 `n`。

匹配守卫 `if n == y` 并不是一个模式所以没有引入新变量。这个 `y` **正是** 外部的 `y` 而不是新的覆盖变量 `y`，这样就可以通过比较 `n` 和 `y` 来表达寻找一个与外部 `y` 相同的值的概念了。

也可以在匹配守卫中使用 **或** 运算符 `|` 来指定多个模式，**同时匹配守卫的条件会作用于所有的模式**。下面代码展示了匹配守卫与 `|` 的优先级。这个例子中看起来好像 `if y` 只作用于 `6`，但实际上匹配守卫 `if y` 作用于 `4`、`5` **和** `6` ，在满足 `x` 属于 `4 | 5 | 6` 后才会判断 `y` 是否为 `true`：

```rust
let x = 4;
let y = false;

match x {
    4 | 5 | 6 if y => println!("yes"),
    _ => println!("no"),
}
```

这个匹配条件表明此分支只匹配 `x` 值为 `4`、`5` 或 `6` **同时** `y` 为 `true` 的情况。

虽然在第一个分支中，`x` 匹配了模式 `4` ，但是对于匹配守卫 `if y` 来说，因为 `y` 是 `false`，因此该守卫条件的值永远是 `false`，也意味着第一个分支永远无法被匹配。

下面的文字图解释了匹配守卫作用于多个模式时的优先级规则，第一张是正确的：

```text
(4 | 5 | 6) if y => ...
```

而第二张图是错误的

```text
4 | 5 | (6 if y) => ...
```

可以通过运行代码时的情况看出这一点：如果匹配守卫只作用于由 `|` 运算符指定的值列表的最后一个值，这个分支就会匹配且程序会打印出 `yes`。

## @绑定

`@`（读作 at）运算符允许为一个字段绑定另外一个变量。下面例子中，我们希望测试 `Message::Hello` 的 `id` 字段是否位于 `3..=7` 范围内，同时也希望能将其值绑定到 `id_variable` 变量中以便此分支中相关的代码可以使用它。我们可以将 `id_variable` 命名为 `id`，与字段同名，不过出于示例的目的这里选择了不同的名称。

```rust
enum Message {
    Hello { id: i32 },
}

let msg = Message::Hello { id: 5 };

match msg {
    Message::Hello { id: id_variable @ 3..=7 } => {
        println!("Found an id in range: {}", id_variable)
    },
    Message::Hello { id: 10..=12 } => {
        println!("Found an id in another range")
    },
    Message::Hello { id } => {
        println!("Found some other id: {}", id)
    },
}
```

上例会打印出 `Found an id in range: 5`。通过在 `3..=7` 之前指定 `id_variable @`，我们捕获了任何匹配此范围的值并同时将该值绑定到变量 `id_variable` 上。

第二个分支只在模式中指定了一个范围，`id` 字段的值可以是 `10、11 或 12`，不过这个模式的代码并不知情也不能使用 `id` 字段中的值，因为没有将 `id` 值保存进一个变量。

最后一个分支指定了一个没有范围的变量，此时确实拥有可以用于分支代码的变量 `id`，因为这里使用了结构体字段简写语法。不过此分支中没有像头两个分支那样对 `id` 字段的值进行测试：任何值都会匹配此分支。

当你既想要限定分支范围，又想要使用分支的变量时，就可以用 `@` 来绑定到一个新的变量上，实现想要的功能。

#### @前绑定后解构(Rust 1.56 新增)

使用 `@` 还可以在绑定新变量的同时，对目标进行解构：

```rust
#[derive(Debug)]
struct Point {
    x: i32,
    y: i32,
}

fn main() {
    // 绑定新变量 `p`，同时对 `Point` 进行解构
    let p @ Point {x: px, y: py } = Point {x: 10, y: 23};
    println!("x: {}, y: {}", px, py);
    println!("{:?}", p);


    let point = Point {x: 10, y: 5};
    if let p @ Point {x: 10, y} = point {
        println!("x is 10 and y is {} in {:?}", y, p);
    } else {
        println!("x was not 10 :(");
    }
}
```

#### @新特性(Rust 1.53 新增)

考虑下面一段代码:

```rust
fn main() {
    match 1 {
        num @ 1 | 2 => {
            println!("{}", num);
        }
        _ => {}
    }
}
```

编译不通过，是因为 `num` 没有绑定到所有的模式上，只绑定了模式 `1`，你可能会试图通过这个方式来解决：

```rust
num @ (1 | 2)
```

但是，如果你用的是 Rust 1.53 之前的版本，那这种写法会报错，因为编译器不支持。

至此，模式匹配的内容已经全部完结，复杂但是详尽，想要一次性全部记住属实不易，因此读者可以先留一个印象，等未来需要时，再来翻阅寻找具体的模式实现方式。


## 课后练习

> [Rust By Practice](https://zh.practice.rs/pattern-match/patterns.html)，支持代码在线编辑和运行，并提供详细的[习题解答](https://github.com/sunface/rust-by-practice/blob/master/solutions/pattern-match/patterns.md)。
