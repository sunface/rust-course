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

`clone` 用起来简单，且可解万愁，但是。。。既然是链表，性能那自然是很重要的，特别是要封装成库给其他代码使用时，那性能更是重中之重。

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
`push` 是插入元素，那 `pop` 自然就是推出一个元素，因此也需要使用 `&mut self`，除此之外，推出的元素需要被返回，这样调用者就可以获取该元素:
```rust
pub fn pop(&mut self) -> Option<i32> {
    // TODO
}
```

我们还需要一个办法来根据 `Link` 是否有值进行不同的处理，这个可以使用 `match` 来进行模式匹配：
```rust
pub fn pop(&mut self) -> Option<i32> {
    match self.head {
        Link::Empty => {
            // TODO
        }
        Link::More(node) => {
            // TODO
        }
    };
}
```

目前的代码显然会报错，因为函数的返回值是 `Option<T>` 枚举，而目前的返回值是 [`()`](https://course.rs/basic/base-type/function.html#无返回值)。当然，我们可以返回一个`Option<T>` 的枚举成员 `None`，但是一个更好的做法是使用 `unimplemented!()`，该宏可以明确地说明目前的代码还没有实现，一旦代码执行到 `unimplemented!()` 的位置，就会发生一个 `panic`。

```rust
pub fn pop(&mut self) -> Option<i32> {
    match self.head {
        Link::Empty => {
            // TODO
        }
        Link::More(node) => {
            // TODO
        }
    };
    unimplemented!()
}
```
`panics` 是一种[发散函数](https://course.rs/basic/base-type/function.html?search=#永不返回的函数)，该函数永不返回任何值，因此可以用于需要返回任何类型的地方。这句话很不好理解，但是从上面的代码中可以看出 `unimplemented!()` 是永不返回的函数，但是它却可以用于一个返回 `Option<i32>` 的函数中来替代返回值。

以上代码果不其然又报错了:
```shell
> cargo build

error[E0507]: cannot move out of borrowed content
  --> src/first.rs:28:15
   |
28 |         match self.head {
   |               ^^^^^^^^^
   |               |
   |               cannot move out of borrowed content
   |               help: consider borrowing here: `&self.head`
...
32 |             Link::More(node) => {
   |                        ---- data moved here
   |
note: move occurs because `node` has type `std::boxed::Box<first::Node>`, which does not implement the `Copy` trait
```

好在编译器偷偷提示了我们使用借用来替代所有权转移： `&self.head`。修改后，如下：
```rust
pub fn pop(&mut self) -> Option<i32> {
    match &self.head {
        Link::Empty => {
            // TODO
        }
        Link::More(node) => {
            // TODO
        }
    };
    unimplemented!()
}
```

是时候填写相应的逻辑了:
```rust
pub fn pop(&mut self) -> Option<i32> {
    let result;
    match &self.head {
        Link::Empty => {
            result = None;
        }
        Link::More(node) => {
            result = Some(node.elem);
            self.head = node.next;
        }
    };
    result
}
```

当链表为 `Empty` 时，返回一个 `None`，表示我们没有 `pop` 到任何元素；若不为空，则返回第一个元素，并将 `head` 指向下一个节点 `node.next`。但是这段代码又报错了：
```shell
error[E0507]: cannot move out of `node.next` which is behind a shared reference
  --> src/first.rs:37:29
   |
37 |                 self.head = node.next;
   |                             ^^^^^^^^^ move occurs because `node.next` has type `Link`, which does not implement the `Copy` trait
```


原因是试图转移 `node` 的所有权，但只有它的引用。回头仔细看看代码，会发现这里的关键是我们希望移除一些东西，这意味着需要通过值的方式获取链表的 head。看来只能故技重施了：
```rust
pub fn pop(&mut self) -> Option<i32> {
    let result;
    match std::mem::replace(&mut self.head, Link::Empty) {
        Link::Empty => {
            result = None;
        }
        Link::More(node) => {
            result = Some(node.elem);
            self.head = node.next;
        }
    };
    result
}
```

我们将 `self.head` 的值偷出来，然后再将 `Link::Empty` 填回到 `self.head` 中。此时用于 `match` 匹配的就是一个拥有所有权的值类型，而不是之前的引用类型。

事实上，上面的代码有些啰嗦，我们可以直接在 `match` 的两个分支中通过表达式进行返回:
```rust
pub fn pop(&mut self) -> Option<i32> {
    match std::mem::replace(&mut self.head, Link::Empty) {
        Link::Empty => None,
        Link::More(node) => {
            self.head = node.next;
            Some(node.elem)
        }
    }
}
```

这样修改后，代码就更加简洁，可读性也更好了，至此链表的基本操作已经完成，下面让我们写一个测试代码来测试下它的功能和正确性。