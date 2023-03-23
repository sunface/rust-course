# 基本数据布局( Layout )
发现一件尴尬的事情，之前介绍了这么多，但是竟然没有介绍链表是什么...亡羊补牢未为晚也，链表就是一系列存储在堆上的连续数据，大家是不是发现这个定义跟动态数据 `Vector` 非常相似，那么区别在于什么呢？

区别就在于链表中的每一个元素都指向下一个元素，最终形成 - 顾名思义的链表: `A1 -> A2 -> A3 -> Null`。 而数组中的元素只是连续排列，并不存在前一个元素指向后一个元素的情况，而是每个元素通过下标索引来访问。

既然函数式语言的程序员最常使用链表，那么我们来看看他们给出的定义长什么样:

```rust
List a = Empty | Elem a (List a)
```

mu...看上去非常像一个数学定义，我们可以这样阅读它， 列表 a 要么是空，要么是一个元素后面再跟着一个列表。非常递归也不咋好懂的定义，果然，这很函数式语言。

下面我们再来使用 Rust 的方式对链表进行下定义，为了简单性，这先不使用泛型:
```rust
// in first.rs

pub enum List {
    Empty,
    Elem(i32, List),
}
```

喔，看上去人模狗样，来，运行下看看：
```shell
$ cargo run
error[E0072]: recursive type `List` has infinite size
 --> src/first.rs:1:1
  |
1 | pub enum List {
  | ^^^^^^^^^^^^^ recursive type has infinite size
2 |     Empty,
3 |     Elem(i32, List),
  |               ---- recursive without indirection
help: insert some indirection (e.g., a `Box`, `Rc`, or `&`) to make `List` representable
  |
3 |     Elem(i32, Box<List>),
```

帅不过 3 秒的玩意儿～～ 好在这个问题，我们在[之前的章节](https://course.rs/advance/smart-pointer/box.html#将动态大小类型变为-sized-固定大小类型)中就讲过了，简而言之，当前的类型是[不定长](https://course.rs/advance/into-types/sized.html)的，对于 Rust 编译器而言，所有栈上的类型都必须在编译期有固定的长度，一个简单的解决方案就是使用 `Box` 将值封装到堆上，然后使用栈上的定长指针来指向堆上不定长的值。

实际上，如果大家有仔细看编译错误的话，它还给出了我们提示: `Elem(i32, Box<List>)`，和我们之前的结论一致，下面来试试：
```rust
pub enum List {
    Empty,
    Elem(i32, Box<List>),
}
```

```shell
$ cargo build

   Finished dev [unoptimized + debuginfo] target(s) in 0.22s
```

万能的编译器再一次拯救了我们，这次的代码成功完成了编译。但是这依然是不咋滴的 `List` 定义，有几个原因。

首先，考虑一个拥有两个元素的 `List`:
```shell
[] = Stack
() = Heap

[Elem A, ptr] -> (Elem B, ptr) -> (Empty, *junk*)
```

这里有两个问题:

- 最后一个节点分配在了堆上，但是它看上去根本不像一个 `Node`
- 第一个 `Node` 是存储在栈上的，结果一家子不能整整齐齐的待在堆上了

这两点看上去好像有点矛盾：你希望所有节点在堆上，但是又觉得最后一个节点不应该在堆上。那再来考虑另一种布局( Layout )方式：
```shell
[ptr] -> (Elem A, ptr) -> (Elem B, *null*)
```

在这种布局下，我们无条件的在堆上创建所有节点，最大的区别就是这里不再有 `junk`。那么什么是 `junk`？为了理解这个概念，先来看看枚举类型的内存布局( Layout )长什么样:
```rust
enum Foo {
   D1(u8),
   D2(u16),
   D3(u32),
   D4(u64)
}
```

大家觉得 `Foo::D1(99)` 占用多少内存空间？是 `u8` 对应的 1 个字节吗？答案是 8 个字节( 为了好理解，这里不考虑 enum tag 所占用的额外空间 )，因为枚举有一个特点，枚举成员占用的内存空间大小跟最大的成员对齐，在这个例子中，所有的成员都会跟 `u64` 进行对齐。

在理解了这点后，再回到我们的 `List` 定义。这里最大的问题就是尽管 `List::Empty` 是空的节点，但是它依然得消耗和其它节点一样的内存空间。

与其让一个节点不进行内存分配，不如让它一直进行内存分配，无论是否有内容，因为后者会保证节点内存布局的一致性。这种一致性对于 `push` 和 `pop` 节点来说可能没有什么影响，但是对于链表的分割和合并而言，就有意义了。

下面，我们对之前两种不同布局的 List 进行下分割:
```shell
layout 1:

[Elem A, ptr] -> (Elem B, ptr) -> (Elem C, ptr) -> (Empty *junk*)

split off C:

[Elem A, ptr] -> (Elem B, ptr) -> (Empty *junk*)
[Elem C, ptr] -> (Empty *junk*)
```

```shell
layout 2:

[ptr] -> (Elem A, ptr) -> (Elem B, ptr) -> (Elem C, *null*)

split off C:

[ptr] -> (Elem A, ptr) -> (Elem B, *null*)
[ptr] -> (Elem C, *null*)
```

可以看出，在布局 1 中，需要将 `C` 节点从堆上拷贝到栈中，而布局 2 则无需此过程。而且从分割后的布局清晰度而言，2 也要优于 1。

现在，我们应该都相信布局 1 更糟糕了，而且不幸的是，我们之前的实现就是布局 1， 那么该如何实现新的布局呢 ？也许，我们可以实现类似如下的 `List` :
```rust
pub enum List {
    Empty,
    ElemThenEmpty(i32),
    ElemThenNotEmpty(i32, Box<List>),
}
```

但是，你们有没有觉得更糟糕了...有些不忍直视的感觉。这让我们的代码复杂度大幅提升，例如你现在得实现一个完全不合法的状态: `ElemThenNotEmpty(0, Box(Empty))`，而且这种实现依然有之前的不一致性的问题。

之前我们提到过枚举成员的内存空间占用和 enum tag 问题，实际上我们可以创建一个特例：
```rust
enum Foo {
    A,
    B(ContainsANonNullPtr),
}
```

在这里 `null` 指针的优化就开始介入了，它会消除枚举成员 `A` 占用的额外空间，原因在于编译器可以直接将 `A` 优化成 `0`，而 `B` 则不行，因为它包含了非 `null` 指针。这样一来，编译器就无需给 `A` 打 tag 进行识别了，而是直接通过 `0` 就能识别出这是 `A` 成员，非 `0` 的自然就是 `B` 成员。

事实上，编译器还会对枚举做一些其他优化，但是 `null` 指针优化是其中最重要的一条。

所以我们应该怎么避免多余的 `junk`，保持内存分配的一致性，还能保持 `null` 指针优化呢？枚举可以让我们声明一个类型用于表达多个不同的值，而结构体可以声明一个类型同时包含多个值，只要将这两个类型结合在一起，就能实现之前的目标: 枚举类型用于表示 `List`，结构体类型用于表示 `Node`.

```rust
struct Node {
    elem: i32,
    next: List,
}

pub enum List {
    Empty,
    More(Box<Node>),
}
```

让我们看看新的定义是否符合之前的目标：

- `List` 的尾部不会再分配多余的 junk 值，通过!
- `List` 枚举的形式可以享受 `null` 指针优化，完美！
- 所有的元素都拥有统一的内存分配，Good!

很好，我们准确构建了之前想要的内存布局，并且证明了最初的内存布局问题多多，编译下试试：
```shell
error[E0446]: private type `Node` in public interface
 --> src/first.rs:8:10
  |
1 | struct Node {
  | ----------- `Node` declared as private
...
8 |     More(Box<Node>),
  |          ^^^^^^^^^ can't leak private type
```

在英文书中，这里是一个 warning ，但是在笔者使用的最新版中(Rust 1.59)，该 warning 已经变成一个错误。主要原因在于 `pub enum` 会要求它的所有成员必须是 `pub`，但是由于 `Node` 没有声明为 `pub`，因此产生了冲突。

这里最简单的解决方法就是将 `Node` 结构体和它的所有字段都标记为 `pub` :
```rust
pub struct Node {
    pub elem: i32,
    pub next: List,
}
```

但是从编程的角度而言，我们还是希望让实现细节只保留在内部，而不是对外公开，因此以下代码相对会更加适合：
```rust
pub struct List {
    head: Link,
}

enum Link {
    Empty,
    More(Box<Node>),
}

struct Node {
    elem: i32,
    next: Link,
}
```

从代码层面看，貌似多了一层封装，但是实际上 `List` 只有一个字段，因此结构体的大小跟字段大小是相等的，没错，传说中的零开销抽象！

至此，一个令人满意的数据布局就已经设计完成，下面一起来看看该如何使用这些数据。


