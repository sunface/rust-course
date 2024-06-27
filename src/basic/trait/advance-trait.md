# 深入了解特征

特征之于 Rust 更甚于接口之于其他语言，因此特征在 Rust 中很重要也相对较为复杂，我们决定把特征分为两篇进行介绍，[第一篇](https://course.rs/basic/trait/trait.html)在之前已经讲过，现在就是第二篇：关于特征的进阶篇，会讲述一些不常用到但是你该了解的特性。

## 关联类型

在方法一章中，我们讲到了[关联函数](https://course.rs/basic/method#关联函数)，但是实际上关联类型和关联函数并没有任何交集，虽然它们的名字有一半的交集。

关联类型是在特征定义的语句块中，申明一个自定义类型，这样就可以在特征的方法签名中使用该类型：

```rust,ignore,mdbook-runnable
pub trait Iterator {
    type Item;

    fn next(&mut self) -> Option<Self::Item>;
}
```

以上是标准库中的迭代器特征 `Iterator`，它有一个 `Item` 关联类型，用于替代遍历的值的类型。

同时，`next` 方法也返回了一个 `Item` 类型，不过使用 `Option` 枚举进行了包裹，假如迭代器中的值是 `i32` 类型，那么调用 `next` 方法就将获取一个 `Option<i32>` 的值。

还记得 `Self` 吧？在之前的章节[提到过](https://course.rs/basic/trait/trait-object#self-与-self)， **`Self` 用来指代当前调用者的具体类型，那么 `Self::Item` 就用来指代该类型实现中定义的 `Item` 类型**：

```rust,ignore,mdbook-runnable
impl Iterator for Counter {
    type Item = u32;

    fn next(&mut self) -> Option<Self::Item> {
        // --snip--
    }
}

fn main() {
    let c = Counter{..}
    c.next()
}
```

在上述代码中，我们为 `Counter` 类型实现了 `Iterator` 特征，变量 `c` 是特征 `Iterator` 的实例，也是 `next` 方法的调用者。 结合之前的黑体内容可以得出：对于 `next` 方法而言，`Self` 是调用者 `c` 的具体类型： `Counter`，而 `Self::Item` 是 `Counter` 中定义的 `Item` 类型: `u32`。

聪明的读者之所以聪明，是因为你们喜欢联想和举一反三，同时你们也喜欢提问：为何不用泛型，例如如下代码：

```rust,ignore,mdbook-runnable
pub trait Iterator<Item> {
    fn next(&mut self) -> Option<Item>;
}
```

答案其实很简单，为了代码的可读性，当你使用了泛型后，你需要在所有地方都写 `Iterator<Item>`，而使用了关联类型，你只需要写 `Iterator`，当类型定义复杂时，这种写法可以极大的增加可读性：

```rust,ignore,mdbook-runnable
pub trait CacheableItem: Clone + Default + fmt::Debug + Decodable + Encodable {
  type Address: AsRef<[u8]> + Clone + fmt::Debug + Eq + Hash;
  fn is_null(&self) -> bool;
}
```

例如上面的代码，`Address` 的写法自然远比 `AsRef<[u8]> + Clone + fmt::Debug + Eq + Hash` 要简单的多，而且含义清晰。

再例如，如果使用泛型，你将得到以下的代码：

```rust,ignore,mdbook-runnable
trait Container<A,B> {
    fn contains(&self,a: A,b: B) -> bool;
}

fn difference<A,B,C>(container: &C) -> i32
  where
    C : Container<A,B> {...}
```

可以看到，由于使用了泛型，导致函数头部也必须增加泛型的声明，而使用关联类型，将得到可读性好得多的代码：

```rust,ignore,mdbook-runnable
trait Container{
    type A;
    type B;
    fn contains(&self, a: &Self::A, b: &Self::B) -> bool;
}

fn difference<C: Container>(container: &C) {}
```

## 默认泛型类型参数

当使用泛型类型参数时，可以为其指定一个默认的具体类型，例如标准库中的 `std::ops::Add` 特征：

```rust,ignore,mdbook-runnable
trait Add<RHS=Self> {
    type Output;

    fn add(self, rhs: RHS) -> Self::Output;
}
```

它有一个泛型参数 `RHS`，但是与我们以往的用法不同，这里它给 `RHS` 一个默认值，也就是当用户不指定 `RHS` 时，默认使用两个同样类型的值进行相加，然后返回一个关联类型 `Output`。

可能上面那段不太好理解，下面我们用代码来举例：

```rust,ignore,mdbook-runnable
use std::ops::Add;

#[derive(Debug, PartialEq)]
struct Point {
    x: i32,
    y: i32,
}

impl Add for Point {
    type Output = Point;

    fn add(self, other: Point) -> Point {
        Point {
            x: self.x + other.x,
            y: self.y + other.y,
        }
    }
}

fn main() {
    assert_eq!(Point { x: 1, y: 0 } + Point { x: 2, y: 3 },
               Point { x: 3, y: 3 });
}
```

上面的代码主要干了一件事，就是为 `Point` 结构体提供 `+` 的能力，这就是**运算符重载**，不过 Rust 并不支持创建自定义运算符，你也无法为所有运算符进行重载，目前来说，只有定义在 `std::ops` 中的运算符才能进行重载。

跟 `+` 对应的特征是 `std::ops::Add`，我们在之前也看过它的定义 `trait Add<RHS=Self>`，但是上面的例子中并没有为 `Point` 实现 `Add<RHS>` 特征，而是实现了 `Add` 特征（没有默认泛型类型参数），这意味着我们使用了 `RHS` 的默认类型，也就是 `Self`。换句话说，我们这里定义的是两个相同的 `Point` 类型相加，因此无需指定 `RHS`。

与上面的例子相反，下面的例子，我们来创建两个不同类型的相加：

```rust,ignore,mdbook-runnable
use std::ops::Add;

struct Millimeters(u32);
struct Meters(u32);

impl Add<Meters> for Millimeters {
    type Output = Millimeters;

    fn add(self, other: Meters) -> Millimeters {
        Millimeters(self.0 + (other.0 * 1000))
    }
}
```

这里，是进行 `Millimeters + Meters` 两种数据类型的 `+` 操作，因此此时不能再使用默认的 `RHS`，否则就会变成 `Millimeters + Millimeters` 的形式。使用 `Add<Meters>` 可以将 `RHS` 指定为 `Meters`，那么 `fn add(self, rhs: RHS)` 自然而言的变成了 `Millimeters` 和 `Meters` 的相加。

默认类型参数主要用于两个方面：

1. 减少实现的样板代码
2. 扩展类型但是无需大幅修改现有的代码

之前的例子就是第一点，虽然效果也就那样。在 `+` 左右两边都是同样类型时，只需要 `impl Add` 即可，否则你需要 `impl Add<SOME_TYPE>`，嗯，会多写几个字:)

对于第二点，也很好理解，如果你在一个复杂类型的基础上，新引入一个泛型参数，可能需要修改很多地方，但是如果新引入的泛型参数有了默认类型，情况就会好很多，添加泛型参数后，使用这个类型的代码需要逐个在类型提示部分添加泛型参数，就很麻烦；但是有了默认参数（且默认参数取之前的实现里假设的值的情况下）之后，原有的使用这个类型的代码就不需要做改动了。

归根到底，默认泛型参数，是有用的，但是大多数情况下，咱们确实用不到，当需要用到时，大家再回头来查阅本章即可，**手上有剑，心中不慌**。

## 调用同名的方法

不同特征拥有同名的方法是很正常的事情，你没有任何办法阻止这一点；甚至除了特征上的同名方法外，在你的类型上，也有同名方法：

```rust,ignore,mdbook-runnable
trait Pilot {
    fn fly(&self);
}

trait Wizard {
    fn fly(&self);
}

struct Human;

impl Pilot for Human {
    fn fly(&self) {
        println!("This is your captain speaking.");
    }
}

impl Wizard for Human {
    fn fly(&self) {
        println!("Up!");
    }
}

impl Human {
    fn fly(&self) {
        println!("*waving arms furiously*");
    }
}
```

这里，不仅仅两个特征 `Pilot` 和 `Wizard` 有 `fly` 方法，就连实现那两个特征的 `Human` 单元结构体，也拥有一个同名方法 `fly` (这世界怎么了，非要这么卷吗？程序员何苦难为程序员，哎)。

既然代码已经不可更改，那下面我们来讲讲该如何调用这些 `fly` 方法。

#### 优先调用类型上的方法

当调用 `Human` 实例的 `fly` 时，编译器默认调用该类型中定义的方法：

```rust,ignore,mdbook-runnable
fn main() {
    let person = Human;
    person.fly();
}
```

这段代码会打印 `*waving arms furiously*`，说明直接调用了类型上定义的方法。

#### 调用特征上的方法

为了能够调用两个特征的方法，需要使用显式调用的语法：

```rust,ignore,mdbook-runnable
fn main() {
    let person = Human;
    Pilot::fly(&person); // 调用Pilot特征上的方法
    Wizard::fly(&person); // 调用Wizard特征上的方法
    person.fly(); // 调用Human类型自身的方法
}
```

运行后依次输出：

```console
This is your captain speaking.
Up!
*waving arms furiously*
```

因为 `fly` 方法的参数是 `self`，当显式调用时，编译器就可以根据调用的类型( `self` 的类型)决定具体调用哪个方法。

这个时候问题又来了，如果方法没有 `self` 参数呢？稍等，估计有读者会问：还有方法没有 `self` 参数？看到这个疑问，作者的眼泪不禁流了下来，大明湖畔的[关联函数](https://course.rs/basic/method.html#关联函数)，你还记得嘛？

但是成年人的世界，就算再伤心，事还得做，咱们继续：

```rust,ignore,mdbook-runnable
trait Animal {
    fn baby_name() -> String;
}

struct Dog;

impl Dog {
    fn baby_name() -> String {
        String::from("Spot")
    }
}

impl Animal for Dog {
    fn baby_name() -> String {
        String::from("puppy")
    }
}

fn main() {
    println!("A baby dog is called a {}", Dog::baby_name());
}
```

就像人类妈妈会给自己的宝宝起爱称一样，狗妈妈也会。狗妈妈称呼自己的宝宝为**Spot**，其它动物称呼狗宝宝为**puppy**，这个时候假如有动物不知道该如何称呼狗宝宝，它需要查询一下。

`Dog::baby_name()` 的调用方式显然不行，因为这只是狗妈妈对宝宝的爱称，可能你会想到通过下面的方式查询其他动物对狗狗的称呼：

```rust,ignore,mdbook-runnable
fn main() {
    println!("A baby dog is called a {}", Animal::baby_name());
}
```

铛铛，无情报错了：

```rust,ignore,mdbook-runnable
error[E0283]: type annotations needed // 需要类型注释
  --> src/main.rs:20:43
   |
20 |     println!("A baby dog is called a {}", Animal::baby_name());
   |                                           ^^^^^^^^^^^^^^^^^ cannot infer type // 无法推断类型
   |
   = note: cannot satisfy `_: Animal`
```

因为单纯从 `Animal::baby_name()` 上，编译器无法得到任何有效的信息：实现 `Animal` 特征的类型可能有很多，你究竟是想获取哪个动物宝宝的名称？狗宝宝？猪宝宝？还是熊宝宝？

此时，就需要使用**完全限定语法**。

##### 完全限定语法

完全限定语法是调用函数最为明确的方式：

```rust,ignore,mdbook-runnable
fn main() {
    println!("A baby dog is called a {}", <Dog as Animal>::baby_name());
}
```

在尖括号中，通过 `as` 关键字，我们向 Rust 编译器提供了类型注解，也就是 `Animal` 就是 `Dog`，而不是其他动物，因此最终会调用 `impl Animal for Dog` 中的方法，获取到其它动物对狗宝宝的称呼：**puppy**。

言归正题，完全限定语法定义为：

```rust,ignore,mdbook-runnable
<Type as Trait>::function(receiver_if_method, next_arg, ...);
```

上面定义中，第一个参数是方法接收器 `receiver` （三种 `self`），只有方法才拥有，例如关联函数就没有 `receiver`。

完全限定语法可以用于任何函数或方法调用，那么我们为何很少用到这个语法？原因是 Rust 编译器能根据上下文自动推导出调用的路径，因此大多数时候，我们都无需使用完全限定语法。只有当存在多个同名函数或方法，且 Rust 无法区分出你想调用的目标函数时，该用法才能真正有用武之地。

## 特征定义中的特征约束

有时，我们会需要让某个特征 A 能使用另一个特征 B 的功能(另一种形式的特征约束)，这种情况下，不仅仅要为类型实现特征 A，还要为类型实现特征 B 才行，这就是 `supertrait` (实在不知道该如何翻译，有大佬指导下嘛？)

例如有一个特征 `OutlinePrint`，它有一个方法，能够对当前的实现类型进行格式化输出：

```rust,ignore,mdbook-runnable
use std::fmt::Display;

trait OutlinePrint: Display {
    fn outline_print(&self) {
        let output = self.to_string();
        let len = output.len();
        println!("{}", "*".repeat(len + 4));
        println!("*{}*", " ".repeat(len + 2));
        println!("* {} *", output);
        println!("*{}*", " ".repeat(len + 2));
        println!("{}", "*".repeat(len + 4));
    }
}
```

等等，这里有一个眼熟的语法: `OutlinePrint: Display`，感觉很像之前讲过的**特征约束**，只不过用在了特征定义中而不是函数的参数中，是的，在某种意义上来说，这和特征约束非常类似，都用来说明一个特征需要实现另一个特征，这里就是：如果你想要实现 `OutlinePrint` 特征，首先你需要实现 `Display` 特征。

想象一下，假如没有这个特征约束，那么 `self.to_string` 还能够调用吗（ `to_string` 方法会为实现 `Display` 特征的类型自动实现）？编译器肯定是不愿意的，会报错说当前作用域中找不到用于 `&Self` 类型的方法 `to_string` ：

```rust,ignore,mdbook-runnable
struct Point {
    x: i32,
    y: i32,
}

impl OutlinePrint for Point {}
```

因为 `Point` 没有实现 `Display` 特征，会得到下面的报错：

```console
error[E0277]: the trait bound `Point: std::fmt::Display` is not satisfied
  --> src/main.rs:20:6
   |
20 | impl OutlinePrint for Point {}
   |      ^^^^^^^^^^^^ `Point` cannot be formatted with the default formatter;
try using `:?` instead if you are using a format string
   |
   = help: the trait `std::fmt::Display` is not implemented for `Point`
```

既然我们有求于编译器，那只能选择满足它咯：

```rust,ignore,mdbook-runnable
use std::fmt;

impl fmt::Display for Point {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "({}, {})", self.x, self.y)
    }
}
```

上面代码为 `Point` 实现了 `Display` 特征，那么 `to_string` 方法也将自动实现：最终获得字符串是通过这里的 `fmt` 方法获得的。

## 在外部类型上实现外部特征(newtype)

在[特征](https://course.rs/basic/trait/trait#特征定义与实现的位置孤儿规则)章节中，有提到孤儿规则，简单来说，就是特征或者类型必需至少有一个是本地的，才能在此类型上定义特征。

这里提供一个办法来绕过孤儿规则，那就是使用**newtype 模式**，简而言之：就是为一个[元组结构体](https://course.rs/basic/compound-type/struct#元组结构体tuple-struct)创建新类型。该元组结构体封装有一个字段，该字段就是希望实现特征的具体类型。

该封装类型是本地的，因此我们可以为此类型实现外部的特征。

`newtype` 不仅仅能实现以上的功能，而且它在运行时没有任何性能损耗，因为在编译期，该类型会被自动忽略。

下面来看一个例子，我们有一个动态数组类型： `Vec<T>`，它定义在标准库中，还有一个特征 `Display`，它也定义在标准库中，如果没有 `newtype`，我们是无法为 `Vec<T>` 实现 `Display` 的：

```console
error[E0117]: only traits defined in the current crate can be implemented for arbitrary types
--> src/main.rs:5:1
|
5 | impl<T> std::fmt::Display for Vec<T> {
| ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^------
| |                             |
| |                             Vec is not defined in the current crate
| impl doesn't use only types from inside the current crate
|
= note: define and implement a trait or new type instead
```

编译器给了我们提示： `define and implement a trait or new type instead`，重新定义一个特征，或者使用 `new type`，前者当然不可行，那么来试试后者：

```rust,ignore,mdbook-runnable
use std::fmt;

struct Wrapper(Vec<String>);

impl fmt::Display for Wrapper {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "[{}]", self.0.join(", "))
    }
}

fn main() {
    let w = Wrapper(vec![String::from("hello"), String::from("world")]);
    println!("w = {}", w);
}
```

其中，`struct Wrapper(Vec<String>)` 就是一个元组结构体，它定义了一个新类型 `Wrapper`，代码很简单，相信大家也很容易看懂。

既然 `new type` 有这么多好处，它有没有不好的地方呢？答案是肯定的。注意到我们怎么访问里面的数组吗？`self.0.join(", ")`，是的，很啰嗦，因为需要先从 `Wrapper` 中取出数组: `self.0`，然后才能执行 `join` 方法。

类似的，任何数组上的方法，你都无法直接调用，需要先用 `self.0` 取出数组，然后再进行调用。

当然，解决办法还是有的，要不怎么说 Rust 是极其强大灵活的编程语言！Rust 提供了一个特征叫 [`Deref`](https://course.rs/advance/smart-pointer/deref.html)，实现该特征后，可以自动做一层类似类型转换的操作，可以将 `Wrapper` 变成 `Vec<String>` 来使用。这样就会像直接使用数组那样去使用 `Wrapper`，而无需为每一个操作都添加上 `self.0`。

同时，如果不想 `Wrapper` 暴露底层数组的所有方法，我们还可以为 `Wrapper` 去重载这些方法，实现隐藏的目的。

## 课后练习

> [Rust By Practice](https://practice-zh.course.rs/generics-traits/advanced-traits.html)，支持代码在线编辑和运行，并提供详细的[习题解答](https://github.com/sunface/rust-by-practice/blob/master/solutions/generics-traits/advanced-trait.md)。
