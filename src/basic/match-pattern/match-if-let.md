# match 和 if let

在 Rust 中，模式匹配最常用的就是 `match` 和 `if let`，本章节将对两者及相关的概念进行详尽介绍。

先来看一个关于 `match` 的简单例子：

```rust
enum Direction {
    East,
    West,
    North,
    South,
}

fn main() {
    let dire = Direction::South;
    match dire {
        Direction::East => println!("East"),
        Direction::North | Direction::South => {
            println!("South or North");
        },
        _ => println!("West"),
    };
}
```

这里我们想去匹配 `dire` 对应的枚举类型，因此在 `match` 中用三个匹配分支来完全覆盖枚举变量 `Direction` 的所有成员类型，有以下几点值得注意：

- `match` 的匹配必须要穷举出所有可能，因此这里用 `_` 来代表未列出的所有可能性
- `match` 的每一个分支都必须是一个表达式，且所有分支的表达式最终返回值的类型必须相同
- **X | Y**，类似逻辑运算符 `或`，代表该分支可以匹配 `X` 也可以匹配 `Y`，只要满足一个即可

其实 `match` 跟其他语言中的 `switch` 非常像，`_` 类似于 `switch` 中的 `default`。

## `match` 匹配

首先来看看 `match` 的通用形式：

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

该形式清晰的说明了何为模式，何为模式匹配：将模式与 `target` 进行匹配，即为模式匹配，而模式匹配不仅仅局限于 `match`，后面我们会详细阐述。

`match` 允许我们将一个值与一系列的模式相比较，并根据相匹配的模式执行对应的代码，下面让我们来一一详解，先看一个例子：

```rust
enum Coin {
    Penny,
    Nickel,
    Dime,
    Quarter,
}

fn value_in_cents(coin: Coin) -> u8 {
    match coin {
        Coin::Penny =>  {
            println!("Lucky penny!");
            1
        },
        Coin::Nickel => 5,
        Coin::Dime => 10,
        Coin::Quarter => 25,
    }
}
```

`value_in_cents` 函数根据匹配到的硬币，返回对应的美分数值。`match` 后紧跟着的是一个表达式，跟 `if` 很像，但是 `if` 后的表达式必须是一个布尔值，而 `match` 后的表达式返回值可以是任意类型，只要能跟后面的分支中的模式匹配起来即可，这里的 `coin` 是枚举 `Coin` 类型。

接下来是 `match` 的分支。一个分支有两个部分：**一个模式和针对该模式的处理代码**。第一个分支的模式是 `Coin::Penny`，其后的 `=>` 运算符将模式和将要运行的代码分开。这里的代码就仅仅是表达式 `1`，不同分支之间使用逗号分隔。

当 `match` 表达式执行时，它将目标值 `coin` 按顺序依次与每一个分支的模式相比较，如果模式匹配了这个值，那么模式之后的代码将被执行。如果模式并不匹配这个值，将继续执行下一个分支。

每个分支相关联的代码是一个表达式，而表达式的结果值将作为整个 `match` 表达式的返回值。如果分支有多行代码，那么需要用 `{}` 包裹，同时最后一行代码需要是一个表达式。

#### 使用 `match` 表达式赋值

还有一点很重要，`match` 本身也是一个表达式，因此可以用它来赋值：

```rust
enum IpAddr {
   Ipv4,
   Ipv6
}

fn main() {
    // let d_panic = Direction::South;
    let ip1 = IpAddr::Ipv6;
    let ip_str = match ip1 {
        IpAddr::Ipv4 => "127.0.0.1",
        _ => "::1",
    };

    println!("{}", ip_str);
}
```

因为这里匹配到 `_` 分支，所以将 `"::1"` 赋值给了 `ip_str`。

#### 模式绑定

模式匹配的另外一个重要功能是从模式中取出绑定的值，例如：

```rust
#[derive(Debug)]
enum UsState {
    Alabama,
    Alaska,
    // --snip--
}

enum Coin {
    Penny,
    Nickel,
    Dime,
    Quarter(UsState), // 25美分硬币
}
```

其中 `Coin::Quarter` 成员还存放了一个值：美国的某个州（因为在 1999 年到 2008 年间，美国在 25 美分(Quarter)硬币的背后为 50 个州印刷了不同的标记，其它硬币都没有这样的设计）。

接下来，我们希望在模式匹配中，获取到 25 美分硬币上刻印的州的名称：

```rust
fn value_in_cents(coin: Coin) -> u8 {
    match coin {
        Coin::Penny => 1,
        Coin::Nickel => 5,
        Coin::Dime => 10,
        Coin::Quarter(state) => {
            println!("State quarter from {:?}!", state);
            25
        },
    }
}
```

上面代码中，在匹配 `Coin::Quarter(state)` 模式时，我们把它内部存储的值绑定到了 `state` 变量上，因此 `state` 变量就是对应的 `UsState` 枚举类型。

例如有一个印了阿拉斯加州标记的 25 分硬币：`Coin::Quarter(UsState::Alaska))`, 它在匹配时，`state` 变量将被绑定 `UsState::Alaska` 的枚举值。

再来看一个更复杂的例子：

```rust
enum Action {
    Say(String),
    MoveTo(i32, i32),
    ChangeColorRGB(u16, u16, u16),
}

fn main() {
    let actions = [
        Action::Say("Hello Rust".to_string()),
        Action::MoveTo(1,2),
        Action::ChangeColorRGB(255,255,0),
    ];
    for action in actions {
        match action {
            Action::Say(s) => {
                println!("{}", s);
            },
            Action::MoveTo(x, y) => {
                println!("point from (0, 0) move to ({}, {})", x, y);
            },
            Action::ChangeColorRGB(r, g, _) => {
                println!("change color into '(r:{}, g:{}, b:0)', 'b' has been ignored",
                    r, g,
                );
            }
        }
    }
}
```

运行后输出：

```console
$ cargo run
   Compiling world_hello v0.1.0 (/Users/sunfei/development/rust/world_hello)
    Finished dev [unoptimized + debuginfo] target(s) in 0.16s
     Running `target/debug/world_hello`
Hello Rust
point from (0, 0) move to (1, 2)
change color into '(r:255, g:255, b:0)', 'b' has been ignored
```

#### 穷尽匹配

在文章的开头，我们简单总结过 `match` 的匹配必须穷尽所有情况，下面来举例说明，例如：

```rust
enum Direction {
    East,
    West,
    North,
    South,
}

fn main() {
    let dire = Direction::South;
    match dire {
        Direction::East => println!("East"),
        Direction::North | Direction::South => {
            println!("South or North");
        },
    };
}
```

我们没有处理 `Direction::West` 的情况，因此会报错：

```console
error[E0004]: non-exhaustive patterns: `West` not covered // 非穷尽匹配，`West` 没有被覆盖
  --> src/main.rs:10:11
   |
1  | / enum Direction {
2  | |     East,
3  | |     West,
   | |     ---- not covered
4  | |     North,
5  | |     South,
6  | | }
   | |_- `Direction` defined here
...
10 |       match dire {
   |             ^^^^ pattern `West` not covered // 模式 `West` 没有被覆盖
   |
   = help: ensure that all possible cases are being handled, possibly by adding wildcards or more match arms
   = note: the matched value is of type `Direction`
```

不禁想感叹，Rust 的编译器**真强大**，忍不住想爆粗口了，sorry，如果你以后进一步深入使用 Rust 也会像我这样感叹的。Rust 编译器清晰地知道 `match` 中有哪些分支没有被覆盖, 这种行为能强制我们处理所有的可能性，有效避免传说中价值**十亿美金**的 `null` 陷阱。

#### `_` 通配符

当我们不想在匹配的时候列出所有值的时候，可以使用 Rust 提供的一个特殊**模式**，例如，`u8` 可以拥有 0 到 255 的有效的值，但是我们只关心 `1、3、5 和 7` 这几个值，不想列出其它的 `0、2、4、6、8、9 一直到 255` 的值。那么, 我们不必一个一个列出所有值, 因为可以使用特殊的模式 `_` 替代：

```rust
let some_u8_value = 0u8;
match some_u8_value {
    1 => println!("one"),
    3 => println!("three"),
    5 => println!("five"),
    7 => println!("seven"),
    _ => (),
}
```

通过将 `_` 其放置于其他分支后，`_` 将会匹配所有遗漏的值。`()` 表示返回**单元类型**与所有分支返回值的类型相同，所以当匹配到 `_` 后，什么也不会发生。

然后，在某些场景下，我们其实只关心**某一个值是否存在**，此时 `match` 就显得过于啰嗦。

## `if let` 匹配

有时会遇到只有一个模式的值需要被处理，其它值直接忽略的场景，如果用 `match` 来处理就要写成下面这样：

```rust
    let v = Some(3u8);
    match v {
        Some(3) => println!("three"),
        _ => (),
    }
```

我们只想要对 `Some(3)` 模式进行匹配, 不想处理任何其他 `Some<u8>` 值或 `None` 值。但是为了满足 `match` 表达式（穷尽性）的要求，写代码时必须在处理完这唯一的成员后加上 `_ => ()`，这样会增加不少无用的代码。

杀鸡焉用牛刀，可以用 `if let` 的方式来实现：

```rust
if let Some(3) = v {
    println!("three");
}
```

这两种匹配对于新手来说，可能有些难以抉择，但是只要记住一点就好：**当你只要匹配一个条件，且忽略其他条件时就用 `if let` ，否则都用 `match`**。

## matches!宏

Rust 标准库中提供了一个非常实用的宏：`matches!`，它可以将一个表达式跟模式进行匹配，然后返回匹配的结果 `true` or `false`。

例如，有一个动态数组，里面存有以下枚举：

```rust
enum MyEnum {
    Foo,
    Bar
}

fn main() {
    let v = vec![MyEnum::Foo,MyEnum::Bar,MyEnum::Foo];
}
```

现在如果想对 `v` 进行过滤，只保留类型是 `MyEnum::Foo` 的元素，你可能想这么写：

```rust
v.iter().filter(|x| x == MyEnum::Foo);
```

但是，实际上这行代码会报错，因为你无法将 `x` 直接跟一个枚举成员进行比较。好在，你可以使用 `match` 来完成，但是会导致代码更为啰嗦，是否有更简洁的方式？答案是使用 `matches!`：

```rust
v.iter().filter(|x| matches!(x, MyEnum::Foo));
```

很简单也很简洁，再来看看更多的例子：

```rust
let foo = 'f';
assert!(matches!(foo, 'A'..='Z' | 'a'..='z'));

let bar = Some(4);
assert!(matches!(bar, Some(x) if x > 2));
```

## 变量覆盖

无论是 `match` 还是 `if let`，他们都可以在模式匹配时覆盖掉老的值，绑定新的值:

```rust
fn main() {
   let age = Some(30);
   println!("在匹配前，age是{:?}",age);
   if let Some(age) = age {
       println!("匹配出来的age是{}",age);
   }

   println!("在匹配后，age是{:?}",age);
}
```

`cargo run `运行后输出如下：

```console
在匹配前，age是Some(30)
匹配出来的age是30
在匹配后，age是Some(30)
```

可以看出在 `if let` 中，`=` 右边 `Some(i32)` 类型的 `age` 被左边 `i32` 类型的新 `age` 覆盖了，该覆盖一直持续到 `if let` 语句块的结束。因此第三个 `println!` 输出的 `age` 依然是 `Some(i32)` 类型。

对于 `match` 类型也是如此:

```rust
fn main() {
   let age = Some(30);
   println!("在匹配前，age是{:?}",age);
   match age {
       Some(age) =>  println!("匹配出来的age是{}",age),
       _ => ()
   }
   println!("在匹配后，age是{:?}",age);
}
```

需要注意的是，**`match` 中的变量覆盖其实不是那么的容易看出**，因此要小心！


## 课后练习

> [Rust By Practice](https://zh.practice.rs/pattern-match/match-iflet.html)，支持代码在线编辑和运行，并提供详细的[习题解答](https://github.com/sunface/rust-by-practice)。
