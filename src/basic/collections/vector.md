# 动态数组 Vector

动态数组类型用 `Vec<T>` 表示，事实上，在之前的章节，它的身影多次出现，我们一直没有细讲，只是简单的把它当作数组处理。

动态数组允许你存储多个值，这些值在内存中一个紧挨着另一个排列，因此访问其中某个元素的成本非常低。动态数组只能存储相同类型的元素，如果你想存储不同类型的元素，可以使用之前讲过的枚举类型或者特征对象。

总之，当我们想拥有一个列表，里面都是相同类型的数据时，动态数组将会非常有用。

## 创建动态数组

在 Rust 中，有多种方式可以创建动态数组。

### Vec::new

使用 `Vec::new` 创建动态数组是最 rusty 的方式，它调用了 `Vec` 中的 `new` 关联函数：

```rust
let v: Vec<i32> = Vec::new();
```

这里，`v` 被显式地声明了类型 `Vec<i32>`，这是因为 Rust 编译器无法从 `Vec::new()` 中得到任何关于类型的暗示信息，因此也无法推导出 `v` 的具体类型，但是当你向里面增加一个元素后，一切又不同了：

```rust
let mut v = Vec::new();
v.push(1);
```

此时，`v` 就无需手动声明类型，因为编译器通过 `v.push(1)`，推测出 `v` 中的元素类型是 `i32`，因此推导出 `v` 的类型是 `Vec<i32>`。

> 如果预先知道要存储的元素个数，可以使用 `Vec::with_capacity(capacity)` 创建动态数组，这样可以避免因为插入大量新数据导致频繁的内存分配和拷贝，提升性能

### vec![]

还可以使用宏 `vec!` 来创建数组，与 `Vec::new` 有所不同，前者能在创建同时给予初始化值：

```rust
let v = vec![1, 2, 3];
```

同样，此处的 `v` 也无需标注类型，编译器只需检查它内部的元素即可自动推导出 `v` 的类型是 `Vec<i32>` （Rust 中，整数默认类型是 `i32`，在[数值类型](https://course.rs/basic/base-type/numbers.html#整数类型)中有详细介绍）。

## 更新 Vector

向数组尾部添加元素，可以使用 `push` 方法：

```rust
let mut v = Vec::new();
v.push(1);
```

与其它类型一样，必须将 `v` 声明为 `mut` 后，才能进行修改。

## Vector 与其元素共存亡

跟结构体一样，`Vector` 类型在超出作用域范围后，会被自动删除：

```rust
{
    let v = vec![1, 2, 3];

    // ...
} // <- v超出作用域并在此处被删除
```

当 `Vector` 被删除后，它内部存储的所有内容也会随之被删除。目前来看，这种解决方案简单直白，但是当 `Vector` 中的元素被引用后，事情可能会没那么简单。

## 从 Vector 中读取元素

读取指定位置的元素有两种方式可选：

- 通过下标索引访问。
- 使用 `get` 方法。

```rust
let v = vec![1, 2, 3, 4, 5];

let third: &i32 = &v[2];
println!("第三个元素是 {}", third);

match v.get(2) {
    Some(third) => println!("第三个元素是 {third}"),
    None => println!("去你的第三个元素，根本没有！"),
}
```

和其它语言一样，集合类型的索引下标都是从 `0` 开始，`&v[2]` 表示借用 `v` 中的第三个元素，最终会获得该元素的引用。而 `v.get(2)` 也是访问第三个元素，但是有所不同的是，它返回了 `Option<&T>`，因此还需要额外的 `match` 来匹配解构出具体的值。

> 细心的同学会注意到这里使用了两种格式化输出的方式，其中第一种我们在之前已经见过，而第二种是后续新版本中引入的写法，也是更推荐的用法，具体介绍请参见[格式化输出章节](https://course.rs/basic/formatted-output.html)。


### 下标索引与 `.get` 的区别

这两种方式都能成功的读取到指定的数组元素，既然如此为什么会存在两种方法？何况 `.get` 还会增加使用复杂度，这就涉及到数组越界的问题了，让我们通过示例说明：

```rust
let v = vec![1, 2, 3, 4, 5];

let does_not_exist = &v[100];
let does_not_exist = v.get(100);
```

运行以上代码，`&v[100]` 的访问方式会导致程序无情报错退出，因为发生了数组越界访问。 但是 `v.get` 就不会，它在内部做了处理，有值的时候返回 `Some(T)`，无值的时候返回 `None`，因此 `v.get` 的使用方式非常安全。

既然如此，为何不统一使用 `v.get` 的形式？因为实在是有些啰嗦，Rust 语言的设计者和使用者在审美这方面还是相当统一的：简洁即正义，何况性能上也会有轻微的损耗。

既然有两个选择，肯定就有如何选择的问题，答案很简单，当你确保索引不会越界的时候，就用索引访问，否则用 `.get`。例如，访问第几个数组元素并不取决于我们，而是取决于用户的输入时，用 `.get` 会非常适合，天知道那些可爱的用户会输入一个什么样的数字进来！

## 同时借用多个数组元素

既然涉及到借用数组元素，那么很可能会遇到同时借用多个数组元素的情况，还记得在[所有权和借用](https://course.rs/basic/ownership/borrowing.html#借用规则总结)章节咱们讲过的借用规则嘛？如果记得，就来看看下面的代码 :)

```rust
let mut v = vec![1, 2, 3, 4, 5];

let first = &v[0];

v.push(6);

println!("The first element is: {first}");
```

先不运行，来推断下结果，首先 `first = &v[0]` 进行了不可变借用，`v.push` 进行了可变借用，如果 `first` 在 `v.push` 之后不再使用，那么该段代码可以成功编译（原因见[引用的作用域](https://course.rs/basic/ownership/borrowing.html#可变引用与不可变引用不能同时存在)）。

可是上面的代码中，`first` 这个不可变借用在可变借用 `v.push` 后被使用了，那么妥妥的，编译器就会报错：

```console
$ cargo run
Compiling collections v0.1.0 (file:///projects/collections)
error[E0502]: cannot borrow `v` as mutable because it is also borrowed as immutable 无法对v进行可变借用，因此之前已经进行了不可变借用
--> src/main.rs:6:5
|
4 |     let first = &v[0];
|                  - immutable borrow occurs here // 不可变借用发生在此处
5 |
6 |     v.push(6);
|     ^^^^^^^^^ mutable borrow occurs here // 可变借用发生在此处
7 |
8 |     println!("The first element is: {}", first);
|                                          ----- immutable borrow later used here // 不可变借用在这里被使用

For more information about this error, try `rustc --explain E0502`.
error: could not compile `collections` due to previous error
```

其实，按理来说，这两个引用不应该互相影响的：一个是查询元素，一个是在数组尾部插入元素，完全不相干的操作，为何编译器要这么严格呢？

原因在于：数组的大小是可变的，当旧数组的大小不够用时，Rust 会重新分配一块更大的内存空间，然后把旧数组拷贝过来。这种情况下，之前的引用显然会指向一块无效的内存，这非常 rusty —— 对用户进行严格的教育。

其实想想，**在长大之后，我们感激人生路上遇到过的严师益友，正是因为他们，我们才在正确的道路上不断前行，虽然在那个时候，并不能理解他们**，而 Rust 就如那个良师益友，它不断的在纠正我们不好的编程习惯，直到某一天，你发现自己能写出一次性通过的漂亮代码时，就能明白它的良苦用心。

> 若读者想要更深入的了解 `Vec<T>`，可以看看[Rustonomicon](https://nomicon.purewhite.io/vec/vec.html)，其中从零手撸一个动态数组，非常适合深入学习。

## 迭代遍历 Vector 中的元素

如果想要依次访问数组中的元素，可以使用迭代的方式去遍历数组，这种方式比用下标的方式去遍历数组更安全也更高效（每次下标访问都会触发数组边界检查）：

```rust
let v = vec![1, 2, 3];
for i in &v {
    println!("{i}");
}
```

也可以在迭代过程中，修改 `Vector` 中的元素：

```rust
let mut v = vec![1, 2, 3];
for i in &mut v {
    *i += 10
}
```

## 存储不同类型的元素

在本节开头，有讲到数组的元素必须类型相同，但是也提到了解决方案：那就是通过使用枚举类型和特征对象来实现不同类型元素的存储。先来看看通过枚举如何实现：

```rust
#[derive(Debug)]
enum IpAddr {
    V4(String),
    V6(String)
}
fn main() {
    let v = vec![
        IpAddr::V4("127.0.0.1".to_string()),
        IpAddr::V6("::1".to_string())
    ];

    for ip in v {
        show_addr(ip)
    }
}

fn show_addr(ip: IpAddr) {
    println!("{:?}",ip);
}
```

数组 `v` 中存储了两种不同的 `ip` 地址，但是这两种都属于 `IpAddr` 枚举类型的成员，因此可以存储在数组中。

再来看看特征对象的实现：

```rust
trait IpAddr {
    fn display(&self);
}

struct V4(String);
impl IpAddr for V4 {
    fn display(&self) {
        println!("ipv4: {:?}",self.0)
    }
}
struct V6(String);
impl IpAddr for V6 {
    fn display(&self) {
        println!("ipv6: {:?}",self.0)
    }
}

fn main() {
    let v: Vec<Box<dyn IpAddr>> = vec![
        Box::new(V4("127.0.0.1".to_string())),
        Box::new(V6("::1".to_string())),
    ];

    for ip in v {
        ip.display();
    }
}
```

比枚举实现要稍微复杂一些，我们为 `V4` 和 `V6` 都实现了特征 `IpAddr`，然后将它俩的实例用 `Box::new` 包裹后，存在了数组 `v` 中，需要注意的是，这里必须手动地指定类型：`Vec<Box<dyn IpAddr>>`，表示数组 `v` 存储的是特征 `IpAddr` 的对象，这样就实现了在数组中存储不同的类型。

在实际使用场景中，**特征对象数组要比枚举数组常见很多**，主要原因在于[特征对象](https://course.rs/basic/trait/trait-object.html)非常灵活，而编译器对枚举的限制较多，且无法动态增加类型。

最后，如果你想要了解 `Vector` 更多的用法，请参见本书的标准库解析章节：[`Vector`常用方法](https://course.rs/std/vector.html)


## Vector 的排序

在 rust 里，实现了两种排序算法，分别为稳定的排序 `sort` 和 `sort_by`，以及非稳定排序 `sort_unstable` 和 `sort_unstable_by`。

当然，这个所谓的 `非稳定` 并不是指排序算法本身不稳定，而是指在排序过程中对相等元素的处理方式。在 `稳定` 排序算法里，对相等的元素，不会对其进行重新排序。而在 `不稳定` 的算法里则不保证这点。

总体而言，`非稳定` 排序的算法的速度会由于 `稳定` 排序算法，同时，`稳定` 排序还会额外分配原数组一半的空间。

### 整数数组的排序

以下是对整数列进行排序的例子。

```rust
fn main() {
    let mut vec = vec![1, 5, 10, 2, 15];    
    vec.sort_unstable();    
    assert_eq!(vec, vec![1, 2, 5, 10, 15]);
}
```

### 浮点数数组的排序

我们尝试使用上面的方法来对浮点数进行排序：

```rust
fn main() {
    let mut vec = vec![1.0, 5.6, 10.3, 2.0, 15f32];    
    vec.sort_unstable();    
    assert_eq!(vec, vec![1.0, 2.0, 5.6, 10.3, 15f32]);
}
```

结果，居然报错了，

```
error[E0277]: the trait bound `f32: Ord` is not satisfied
    --> src/main.rs:29:13
     |
29   |         vec.sort_unstable();
     |             ^^^^^^^^^^^^^ the trait `Ord` is not implemented for `f32`
     |
     = help: the following other types implement trait `Ord`:
               i128
               i16
               i32
               i64
               i8
               isize
               u128
               u16
             and 4 others
note: required by a bound in `core::slice::<impl [T]>::sort_unstable`
    --> /home/keijack/.rustup/toolchains/stable-x86_64-unknown-linux-gnu/lib/rustlib/src/rust/library/core/src/slice/mod.rs:2635:12
     |
2635 |         T: Ord,
     |            ^^^ required by this bound in `core::slice::<impl [T]>::sort_unstable`

For more information about this error, try `rustc --explain E0277`.
```

原来，在浮点数当中，存在一个 `NAN` 的值，这个值无法与其他的浮点数进行对比，因此，浮点数类型并没有实现全数值可比较 `Ord` 的特性，而是实现了部分可比较的特性 `PartialOrd`。

如此，如果我们确定在我们的浮点数数组当中，不包含 `NAN` 值，那么我们可以使用 `partial_cmp` 来作为大小判断的依据。

```rust
fn main() {
    let mut vec = vec![1.0, 5.6, 10.3, 2.0, 15f32];    
    vec.sort_unstable_by(|a, b| a.partial_cmp(b).unwrap());    
    assert_eq!(vec, vec![1.0, 2.0, 5.6, 10.3, 15f32]);
}
```

OK，现在可以正确执行了。

### 对结构体数组进行排序

有了上述浮点数排序的经验，我们推而广之，那么对结构是否也可以使用这种自定义对比函数的方式来进行呢？马上来试一下：

```rust
#[derive(Debug)]
struct Person {
    name: String,
    age: u32,
}

impl Person {
    fn new(name: String, age: u32) -> Person {
        Person { name, age }
    }
}

fn main() {
    let mut people = vec![
        Person::new("Zoe".to_string(), 25),
        Person::new("Al".to_string(), 60),
        Person::new("John".to_string(), 1),
    ];
    // 定义一个按照年龄倒序排序的对比函数
    people.sort_unstable_by(|a, b| b.age.cmp(&a.age));

    println!("{:?}", people);
}
```

执行后输出：

```
[Person { name: "Al", age: 60 }, Person { name: "Zoe", age: 25 }, Person { name: "John", age: 1 }]
```

结果正确。

从上面我们学习过程当中，排序需要我们实现 `Ord` 特性，那么如果我们把我们的结构体实现了该特性，是否就不需要我们自定义对比函数了呢？

是，但不完全是，实现 `Ord` 需要我们实现 `Ord`、`Eq`、`PartialEq`、`PartialOrd` 这些属性。好消息是，你可以 `derive` 这些属性：

```rust
#[derive(Debug, Ord, Eq, PartialEq, PartialOrd)]
struct Person {
    name: String,
    age: u32,
}

impl Person {
    fn new(name: String, age: u32) -> Person {
        Person { name, age }
    }
}

fn main() {
    let mut people = vec![
        Person::new("Zoe".to_string(), 25),
        Person::new("Al".to_string(), 60),
        Person::new("Al".to_string(), 30),
        Person::new("John".to_string(), 1),
        Person::new("John".to_string(), 25),
    ];

    people.sort_unstable();

    println!("{:?}", people);
}
```

执行输出

```
[Person { age: 1, name: "John" }, Person { age: 25, name: "John" }, Person { age: 25, name: "Zoe" }, Person { age: 30, name: "Al" }, Person { age: 60, name: "Al" }]
```

需要 `derive` `Ord` 相关特性，需要确保你的结构体中所有的属性均实现了 `Ord` 相关特性，否则会发生编译错误。`derive` 的默认实现会依据属性的顺序依次进行比较，如上述例子中，当 `Person` 的 `name` 值相同，则会使用 `age` 进行比较。


## 课后练习

> [Rust By Practice](https://zh.practice.rs/collections/vector.html)，支持代码在线编辑和运行，并提供详细的[习题解答](https://github.com/sunface/rust-by-practice/blob/master/solutions/collections/Vector.md)。
