# 定义基本操作
这个章节我们一起来为新创建的 `List` 定义一些基本操作，首先从创建链表开始。

## New
为了将实际的代码跟类型关联在一起，我们需要使用 `impl` 语句块：
```rust
impl List {
    // TODO
}
```

下一步就是创建一个关联函数，用于构建 `List` 的新实例，该函数的作用类似于其他语言的构造函数。
```rust
impl List {
    pub fn new() -> Self {
        List { head: Link::Empty }
    }
}
```

> 学习链接: [impl、关联函数](https://course.rs/basic/method.html#关联函数)、[Self](https://course.rs/basic/trait/trait-object.html?highlight=Self#self-与-self) 


## Push
在开始实现之前，你需要先了解 [self、&self、&mut sef](https://course.rs/basic/method.html#selfself-和-mut-self) 这几个概念。

在创建链表后，下一步就是往链表中插入新的元素，由于 `push` 会改变链表，因此我们使用 `&mut self` 的方法签名:
```rust
impl List {
    pub fn push(&mut self, elem: i32) {
        // TODO
    }
}
```

根据之前的数据定义，首先需要创建一个 `Node` 来存放该元素:
```rust
pub fn push(&mut self, elem: i32) {
    let new_node = Node {
        elem: elem,
        next: ?????
    };
}
```

下一步需要让该节点指向之前的旧 `List`:
```rust
pub fn push(&mut self, elem: i32) {
    let new_node = Node {
        elem: elem,
        next: self.head,
    };
}
```

```shell
error[E0507]: cannot move out of `self.head` which is behind a mutable reference
  --> src/first.rs:23:19
   |
23 |             next: self.head,
   |                   ^^^^^^^^^ move occurs because `self.head` has type `Link`, which does not implement the `Copy` trait
```


但是，如上所示，这段代码会报错，因为试图将借用的值 `self` 中的 `head` 字段的所有权转移给 `next` ，在 Rust 中这是不被允许的。那如果我们试图将值再放回去呢？
```rust
pub fn push(&mut self, elem: i32) {
    let new_node = Box::new(Node {
        elem: elem,
        next: self.head,
    });

    self.head = Link::More(new_node);
}
```

其实在写之前，应该就预料到结果了，显然这也是不行的，虽然从我们的角度来看还挺正常的，但是 Rust 并不会接受(有多种原因，其中主要的是[Exception safety](https://doc.rust-lang.org/nightly/nomicon/exception-safety.html))。

我们需要一个办法，让 Rust 不再阻挠我们，其中一个可行的办法是使用 `clone`:
```rust
pub struct List {
    head: Link,
}

#[derive(Clone)]
enum Link {
    Empty,
    More(Box<Node>),
}

#[derive(Clone)]
struct Node {
    elem: i32,
    next: Link,
}

impl List {
    pub fn new() -> Self {
        List { head: Link::Empty }
    }

    pub fn push(&mut self, elem: i32) {
        let new_node = Node {
            elem: elem,
            next: self.head.clone(),
        };
    }
}
```

`clone` 用起来简单难，且可解万愁，但是。。。既然是链表，性能那自然是很重要的，特别是要封装成库给其他代码使用时，那性能更是重中之重。

没办法了，我们只能向大名鼎鼎的 Rust 黑客 Indiana Jones求助了:
<img src="https://rust-unofficial.github.io/too-many-lists/img/indy.gif" />

经过一番诚心祈愿，Indy 建议我们使用 `mem::replace` 秘技。这个非常有用的函数允许我们从一个借用中偷出一个值的同时再放入一个新值。
```rust
pub fn push(&mut self, elem: i32) {
    let new_node = Box::new(Node {
        elem: elem,
        next: std::mem::replace(&mut self.head, Link::Empty),
    });

    self.head = Link::More(new_node);
}
```

这里，我们从借用 `self` 中偷出了它的值 `head` 并赋予给 `next` 字段，同时将一个新值 `Link::Empty` 放入到 `head` 中，成功完成偷梁换柱。不得不说，这个做法非常刺激，但是很不幸的是，目前为止，最好的办法可能也只能是它了。

但是不管怎样，我们成功的完成了 `push` 方法，下面再来看看 `pop`。

## Pop