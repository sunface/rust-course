# 枚举

枚举(enum 或 enumeration)允许你通过列举可能的成员来定义一个**枚举类型**，例如扑克牌花色：

```rust
enum PokerSuit {
  Clubs,
  Spades,
  Diamonds,
  Hearts,
}
```

如果在此之前你没有在其它语言中使用过枚举，那么可能需要花费一些时间来理解这些概念，一旦上手，就会发现枚举的强大，甚至对它爱不释手，枚举虽好，可不要滥用哦。

再回到之前创建的 `PokerSuit`，扑克总共有四种花色，而这里我们枚举出所有的可能值，这也正是 `枚举` 名称的由来。

任何一张扑克，它的花色肯定会落在四种花色中，而且也只会落在其中一个花色上，这种特性非常适合枚举的使用，因为**枚举值**只可能是其中某一个成员。抽象来看，四种花色尽管是不同的花色，但是它们都是扑克花色这个概念，因此当某个函数处理扑克花色时，可以把它们当作相同的类型进行传参。

细心的读者应该注意到，我们对之前的 `枚举类型` 和 `枚举值` 进行了重点标注，这是因为对于新人来说容易混淆相应的概念，总而言之：
**枚举类型是一个类型，它会包含所有可能的枚举成员，而枚举值是该类型中的具体某个成员的实例。**

## 枚举值

现在来创建 `PokerSuit` 枚举类型的两个成员实例：

```rust
let heart = PokerSuit::Hearts;
let diamond = PokerSuit::Diamonds;
```

我们通过 `::` 操作符来访问 `PokerSuit` 下的具体成员，从代码可以清晰看出，`heart` 和 `diamond` 都是 `PokerSuit` 枚举类型的，接着可以定义一个函数来使用它们：

```rust
fn main() {
    let heart = PokerSuit::Hearts;
    let diamond = PokerSuit::Diamonds;

    print_suit(heart);
    print_suit(diamond);
}

fn print_suit(card: PokerSuit) {
    // 需要在定义 enum PokerSuit 的上面添加上 #[derive(Debug)]，否则会报 card 没有实现 Debug
    println!("{:?}",card);
}
```

`print_suit` 函数的参数类型是 `PokerSuit`，因此我们可以把 `heart` 和 `diamond` 传给它，虽然 `heart` 是基于 `PokerSuit` 下的 `Hearts` 成员实例化的，但是它是货真价实的 `PokerSuit` 枚举类型。

接下来，我们想让扑克牌变得更加实用，那么需要给每张牌赋予一个值：`A`(1)-`K`(13)，这样再加上花色，就是一张真实的扑克牌了，例如红心 A。

目前来说，枚举值还不能带有值，因此先用结构体来实现：

```rust
enum PokerSuit {
    Clubs,
    Spades,
    Diamonds,
    Hearts,
}

struct PokerCard {
    suit: PokerSuit,
    value: u8
}

fn main() {
   let c1 = PokerCard {
       suit: PokerSuit::Clubs,
       value: 1,
   };
   let c2 = PokerCard {
       suit: PokerSuit::Diamonds,
       value: 12,
   };
}
```

这段代码很好的完成了它的使命，通过结构体 `PokerCard` 来代表一张牌，结构体的 `suit` 字段表示牌的花色，类型是 `PokerSuit` 枚举类型，`value` 字段代表扑克牌的数值。

可以吗？可以！好吗？说实话，不咋地，因为还有简洁得多的方式来实现：

```rust
enum PokerCard {
    Clubs(u8),
    Spades(u8),
    Diamonds(u8),
    Hearts(u8),
}

fn main() {
   let c1 = PokerCard::Spades(5);
   let c2 = PokerCard::Diamonds(13);
}
```

直接将数据信息关联到枚举成员上，省去近一半的代码，这种实现是不是更优雅？

不仅如此，同一个枚举类型下的不同成员还能持有不同的数据类型，例如让某些花色打印 `1-13` 的字样，另外的花色打印上 `A-K` 的字样：

```rust
enum PokerCard {
    Clubs(u8),
    Spades(u8),
    Diamonds(char),
    Hearts(char),
}

fn main() {
   let c1 = PokerCard::Spades(5);
   let c2 = PokerCard::Diamonds('A');
}
```

回想一下，遇到这种不同类型的情况，再用我们之前的结构体实现方式，可行吗？也许可行，但是会复杂很多。

再来看一个来自标准库中的例子：

```rust
struct Ipv4Addr {
    // --snip--
}

struct Ipv6Addr {
    // --snip--
}

enum IpAddr {
    V4(Ipv4Addr),
    V6(Ipv6Addr),
}
```

这个例子跟我们之前的扑克牌很像，只不过枚举成员包含的类型更复杂了，变成了结构体：分别通过 `Ipv4Addr` 和 `Ipv6Addr` 来定义两种不同的 IP 数据。

从这些例子可以看出，**任何类型的数据都可以放入枚举成员中**：例如字符串、数值、结构体甚至另一个枚举。

增加一些挑战？先看以下代码：

```rust
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(i32, i32, i32),
}

fn main() {
    let m1 = Message::Quit;
    let m2 = Message::Move{x:1,y:1};
    let m3 = Message::ChangeColor(255,255,0);
}
```

该枚举类型代表一条消息，它包含四个不同的成员：

- `Quit` 没有任何关联数据
- `Move` 包含一个匿名结构体
- `Write` 包含一个 `String` 字符串
- `ChangeColor` 包含三个 `i32`

当然，我们也可以用结构体的方式来定义这些消息：

```rust
struct QuitMessage; // 单元结构体
struct MoveMessage {
    x: i32,
    y: i32,
}
struct WriteMessage(String); // 元组结构体
struct ChangeColorMessage(i32, i32, i32); // 元组结构体
```

由于每个结构体都有自己的类型，因此我们无法在需要同一类型的地方进行使用，例如某个函数它的功能是接受消息并进行发送，那么用枚举的方式，就可以接收不同的消息，但是用结构体，该函数无法接受 4 个不同的结构体作为参数。

而且从代码规范角度来看，枚举的实现更简洁，代码内聚性更强，不像结构体的实现，分散在各个地方。

## 同一化类型

最后，再用一个实际项目中的简化片段，来结束枚举类型的语法学习。

例如我们有一个 WEB 服务，需要接受用户的长连接，假设连接有两种：`TcpStream` 和 `TlsStream`，但是我们希望对这两个连接的处理流程相同，也就是用同一个函数来处理这两个连接，代码如下：

```rust
fn new (stream: TcpStream) {
  let mut s = stream;
  if tls {
    s = negotiate_tls(stream)
  }

  // websocket是一个WebSocket<TcpStream>或者
  //   WebSocket<native_tls::TlsStream<TcpStream>>类型
  websocket = WebSocket::from_raw_socket(
    s, ......)
}
```

此时，枚举类型就能帮上大忙：

```rust
enum Websocket {
  Tcp(Websocket<TcpStream>),
  Tls(Websocket<native_tls::TlsStream<TcpStream>>),
}
```

## Option 枚举用于处理空值

在其它编程语言中，往往都有一个 `null` 关键字，该关键字用于表明一个变量当前的值为空（不是零值，例如整型的零值是 0），也就是不存在值。当你对这些 `null` 进行操作时，例如调用一个方法，就会直接抛出 **null 异常**，导致程序的崩溃，因此我们在编程时需要格外的小心去处理这些 `null` 空值。

> Tony Hoare， `null` 的发明者，曾经说过一段非常有名的话：
>
> 我称之为我十亿美元的错误。当时，我在使用一个面向对象语言设计第一个综合性的面向引用的类型系统。我的目标是通过编译器的自动检查来保证所有引用的使用都应该是绝对安全的。不过在设计过程中，我未能抵抗住诱惑，引入了空引用的概念，因为它非常容易实现。就是因为这个决策，引发了无数错误、漏洞和系统崩溃，在之后的四十多年中造成了数十亿美元的苦痛和伤害。

尽管如此，空值的表达依然非常有意义，因为空值表示当前时刻变量的值是缺失的。有鉴于此，Rust 吸取了众多教训，决定抛弃 `null`，而改为使用 `Option` 枚举变量来表述这种结果。

`Option` 枚举包含两个成员，一个成员表示含有值：`Some(T)`, 另一个表示没有值：`None`，定义如下：

```rust
enum Option<T> {
    Some(T),
    None,
}
```

其中 `T` 是泛型参数，`Some(T)`表示该枚举成员的数据类型是 `T`，换句话说，`Some` 可以包含任何类型的数据。

`Option<T>` 枚举是如此有用以至于它被包含在了 [`prelude`](https://course.rs/appendix/prelude.html)（prelude 属于 Rust 标准库，Rust 会将最常用的类型、函数等提前引入其中，省得我们再手动引入）之中，你不需要将其显式引入作用域。另外，它的成员 `Some` 和 `None` 也是如此，无需使用 `Option::` 前缀就可直接使用 `Some` 和 `None`。总之，不能因为 `Some(T)` 和 `None` 中没有 `Option::` 的身影，就否认它们是 `Option` 下的卧龙凤雏。

再来看以下代码：

```rust
let some_number = Some(5);
let some_string = Some("a string");

let absent_number: Option<i32> = None;
```

如果使用 `None` 而不是 `Some`，需要告诉 Rust `Option<T>` 是什么类型的，因为编译器只通过 `None` 值无法推断出 `Some` 成员保存的值的类型。

当有一个 `Some` 值时，我们就知道存在一个值，而这个值保存在 `Some` 中。当有个 `None` 值时，在某种意义上，它跟空值具有相同的意义：并没有一个有效的值。那么，`Option<T>` 为什么就比空值要好呢？

简而言之，因为 `Option<T>` 和 `T`（这里 `T` 可以是任何类型）是不同的类型，例如，这段代码不能编译，因为它尝试将 `Option<i8>`(`Option<T>`) 与 `i8`(`T`) 相加：

```rust
let x: i8 = 5;
let y: Option<i8> = Some(5);

let sum = x + y;
```

如果运行这些代码，将得到类似这样的错误信息：

```text
error[E0277]: the trait bound `i8: std::ops::Add<std::option::Option<i8>>` is
not satisfied
 -->
  |
5 |     let sum = x + y;
  |                 ^ no implementation for `i8 + std::option::Option<i8>`
  |
```

很好！事实上，错误信息意味着 Rust 不知道该如何将 `Option<i8>` 与 `i8` 相加，因为它们的类型不同。当在 Rust 中拥有一个像 `i8` 这样类型的值时，编译器确保它总是有一个有效的值，我们可以放心使用而无需做空值检查。只有当使用 `Option<i8>`（或者任何用到的类型）的时候才需要担心可能没有值，而编译器会确保我们在使用值之前处理了为空的情况。

换句话说，在对 `Option<T>` 进行 `T` 的运算之前必须将其转换为 `T`。通常这能帮助我们捕获到空值最常见的问题之一：期望某值不为空但实际上为空的情况。

不再担心会错误的使用一个空值，会让你对代码更加有信心。为了拥有一个可能为空的值，你必须要显式的将其放入对应类型的 `Option<T>` 中。接着，当使用这个值时，必须明确的处理值为空的情况。只要一个值不是 `Option<T>` 类型，你就 **可以** 安全的认定它的值不为空。这是 Rust 的一个经过深思熟虑的设计决策，来限制空值的泛滥以增加 Rust 代码的安全性。

那么当有一个 `Option<T>` 的值时，如何从 `Some` 成员中取出 `T` 的值来使用它呢？`Option<T>` 枚举拥有大量用于各种情况的方法：你可以查看[它的文档](https://doc.rust-lang.org/std/option/enum.Option.html)。熟悉 `Option<T>` 的方法将对你的 Rust 之旅非常有用。

总的来说，为了使用 `Option<T>` 值，需要编写处理每个成员的代码。你想要一些代码只当拥有 `Some(T)` 值时运行，允许这些代码使用其中的 `T`。也希望一些代码在值为 `None` 时运行，这些代码并没有一个可用的 `T` 值。`match` 表达式就是这么一个处理枚举的控制流结构：它会根据枚举的成员运行不同的代码，这些代码可以使用匹配到的值中的数据。

这里先简单看一下 `match` 的大致模样，在[模式匹配](https://course.rs/basic/match-pattern/intro.html)中，我们会详细讲解：

```rust
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

`plus_one` 通过 `match` 来处理不同 `Option` 的情况。


## 课后练习

> [Rust By Practice](https://practice-zh.course.rs/compound-types/enum.html)，支持代码在线编辑和运行，并提供详细的[习题解答](https://github.com/sunface/rust-by-practice/blob/master/solutions/compound-types/enum.md)。
