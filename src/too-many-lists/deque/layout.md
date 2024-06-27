# 数据布局和构建

聪明的读者应该已经想到了：让 `Rc` 可变，就需要使用 `RefCell` 的配合。关于 `RefCell` 的一切，在之前的章节都有介绍，还不熟悉的同学请移步[这里](https://course.rs/advance/smart-pointer/cell-refcell.html)。

好了，绝世神兵在手，接下来...我们将见识一个绝世啰嗦的数据结构...如果你来自 GC 语言，那很可能就没有见识过这种阵仗。

## 数据布局

双向链表意味着每一个节点将同时指向前一个和下一个节点，因此我们的数据结构可能会变成这样：

```rust,ignore,mdbook-runnable
use std::rc::Rc;
use std::cell::RefCell;

pub struct List<T> {
    head: Link<T>,
    tail: Link<T>,
}

type Link<T> = Option<Rc<RefCell<Node<T>>>>;

struct Node<T> {
    elem: T,
    next: Link<T>,
    prev: Link<T>,
}
```

耳听忐忑，心怀忐忑，尝试编译下，竟然顺利通过了，thanks god! 接下来再来看看该如何使用它。

## 构建

如果按照之前的构建方式来构建新的数据结构，会有点笨拙，因此我们先尝试将其拆分:

```rust,ignore,mdbook-runnable
impl<T> Node<T> {
    fn new(elem: T) -> Rc<RefCell<Self>> {
        Rc::new(RefCell::new(Node {
            elem: elem,
            prev: None,
            next: None,
        }))
    }
}

impl<T> List<T> {
    pub fn new() -> Self {
        List { head: None, tail: None }
    }
}
```

```rust,ignore,mdbook-runnable
> cargo build

**一大堆 DEAD CODE 警告，但是好歹可以成功编译**
```

## Push

很好，再来向链表的头部推入一个元素。由于双向链表的数据结构和操作逻辑明显更加复杂，因此相比单向链表的单行实现，双向链表的 `push` 操作也要复杂的多。

除此之外，我们还需要处理一些关于空链表的边界问题：对于绝大部分操作而言，可能只需要使用 `head` 或 `tail` 指针，但是对于空链表，则需要同时使用它们。

一个验证方法 `methods` 是否有效的办法就是看它是否能保持不变性, 每个节点都应该有两个指针指向它: 中间的节点被它前后的节点所指向，而头部的节点除了被它后面的节点所指向外，还会被链表本身所指向，尾部的节点亦是如此。

```rust,ignore,mdbook-runnable
pub fn push_front(&mut self, elem: T) {
    let new_head = Node::new(elem);
    match self.head.take() {
        Some(old_head) => {
            // 非空链表，将新的节点跟老的头部相链接
            old_head.prev = Some(new_head.clone());
            new_head.next = Some(old_head);
            self.head = Some(new_head);
        }
        None => {
            // 空链表，需要设置 tail 和 head
            self.tail = Some(new_head.clone());
            self.head = Some(new_head);
        }
    }
}
```

```rust,ignore,mdbook-runnable
> cargo build

error[E0609]: no field `prev` on type `std::rc::Rc<std::cell::RefCell<fourth::Node<T>>>`
  --> src/fourth.rs:39:26
   |
39 |                 old_head.prev = Some(new_head.clone()); // +1 new_head
   |                          ^^^^ unknown field

error[E0609]: no field `next` on type `std::rc::Rc<std::cell::RefCell<fourth::Node<T>>>`
  --> src/fourth.rs:40:26
   |
40 |                 new_head.next = Some(old_head);         // +1 old_head
   |                          ^^^^ unknown field
```

虽然有报错，但是一切尽在掌握，今天真是万事顺利啊！

从报错来看，我们无法直接去访问 `prev` 和 `next`，回想一下 `RefCell` 的使用方式，修改代码如下:

```rust,ignore,mdbook-runnable
pub fn push_front(&mut self, elem: T) {
    let new_head = Node::new(elem);
    match self.head.take() {
        Some(old_head) => {
            old_head.borrow_mut().prev = Some(new_head.clone());
            new_head.borrow_mut().next = Some(old_head);
            self.head = Some(new_head);
        }
        None => {
            self.tail = Some(new_head.clone());
            self.head = Some(new_head);
        }
    }
}
```

```shell
$ cargo build

warning: field is never used: `elem`
  --> src/fourth.rs:12:5
   |
12 |     elem: T,
   |     ^^^^^^^
   |
   = note: #[warn(dead_code)] on by default
```

嘿，我又可以了！既然状态神勇，那就趁热打铁，再来看看 `pop`。

## Pop

如果说 `new` 和 `push` 是在构建链表，那 `pop` 显然就是一个破坏者。

何为完美的破坏？按照构建的过程逆着来一遍就是完美的！

```rust,ignore,mdbook-runnable
pub fn pop_front(&mut self) -> Option<T> {
    self.head.take().map(|old_head| {
        match old_head.borrow_mut().next.take() {
            Some(new_head) => {
                // 非空链表
                new_head.borrow_mut().prev.take();
                self.head = Some(new_head);
            }
            None => {
                // 空链表
                self.tail.take();
            }
        }
        old_head.elem
    })
}
```

```shell
$ cargo build

error[E0609]: no field `elem` on type `std::rc::Rc<std::cell::RefCell<fourth::Node<T>>>`
  --> src/fourth.rs:64:22
   |
64 |             old_head.elem
   |                      ^^^^ unknown field
```

哎，怎么就不长记性呢，又是 `RefCell` 惹的祸:

```rust,ignore,mdbook-runnable
pub fn pop_front(&mut self) -> Option<T> {
    self.head.take().map(|old_head| {
        match old_head.borrow_mut().next.take() {
            Some(new_head) => {
                new_head.borrow_mut().prev.take();
                self.head = Some(new_head);
            }
            None => {
                self.tail.take();
            }
        }
        old_head.borrow_mut().elem
    })
}
```

```shell
$ cargo build

error[E0507]: cannot move out of borrowed content
  --> src/fourth.rs:64:13
   |
64 |             old_head.borrow_mut().elem
   |             ^^^^^^^^^^^^^^^^^^^^^^^^^^ cannot move out of borrowed content
```

额... 我凌乱了，看上去 `Box` 是罪魁祸首，`borrow_mut` 只能返回一个 `&mut Node<T>`，因此无法拿走其所有权。

我们需要一个方法来拿走 `RefCell<T>` 的所有权，然后返回给我们一个 `T`， 翻一翻[文档](https://doc.rust-lang.org/std/cell/struct.RefCell.html)，可以发现下面这段内容:

> `fn into_inner(self) -> T`

> 消费掉 RefCell 并返回内部的值

喔，看上去好有安全感的方法:

```rust,ignore,mdbook-runnable
old_head.into_inner().elem
```

```shell
$ cargo build

error[E0507]: cannot move out of an `Rc`
  --> src/fourth.rs:64:13
   |
64 |             old_head.into_inner().elem
   |             ^^^^^^^^ cannot move out of an `Rc`
```

...看走眼了，没想到你浓眉大眼也会耍花枪。 `into_inner` 想要拿走 `RecCell` 的所有权，但是还有一个 `Rc` 不愿意，因为 `Rc<T>` 只能让我们获取内部值的不可变引用。

大家还记得我们之前实现 `Drop` 时用过的方法吗？在这里一样适用：

```rust,ignore,mdbook-runnable
Rc::try_unwrap(old_head).unwrap().into_inner().elem
```

`Rc::try_unwrap` 返回一个 `Result`，由于我们不关心 `Err` 的情况( 如果代码合理，这里不会是 `Err` )，直接使用 `unwrap` 即可。

```shell
$ cargo build

error[E0599]: no method named `unwrap` found for type `std::result::Result<std::cell::RefCell<fourth::Node<T>>, std::rc::Rc<std::cell::RefCell<fourth::Node<T>>>>` in the current scope
  --> src/fourth.rs:64:38
   |
64 |             Rc::try_unwrap(old_head).unwrap().into_inner().elem
   |                                      ^^^^^^
   |
   = note: the method `unwrap` exists but the following trait bounds were not satisfied:
           `std::rc::Rc<std::cell::RefCell<fourth::Node<T>>> : std::fmt::Debug`
```

额，`unwrap` 要求目标类型是实现了 `Debug` 的，这样才能在报错时提供 `debug` 输出，而 `RefCell<T>` 要实现 `Debug` 需要它内部的 `T` 实现 `Debug`，而我们的 `Node` 并没有实现。

当然，我们可以选择为 `Node` 实现，也可以这么做：

```rust,ignore,mdbook-runnable
Rc::try_unwrap(old_head).ok().unwrap().into_inner().elem
```

```shell
$ cargo build
```

终于成功的运行了，下面依然是惯例 - 写几个测试用例 :

```rust,ignore,mdbook-runnable
#[cfg(test)]
mod test {
    use super::List;

    #[test]
    fn basics() {
        let mut list = List::new();

        // Check empty list behaves right
        assert_eq!(list.pop_front(), None);

        // Populate list
        list.push_front(1);
        list.push_front(2);
        list.push_front(3);

        // Check normal removal
        assert_eq!(list.pop_front(), Some(3));
        assert_eq!(list.pop_front(), Some(2));

        // Push some more just to make sure nothing's corrupted
        list.push_front(4);
        list.push_front(5);

        // Check normal removal
        assert_eq!(list.pop_front(), Some(5));
        assert_eq!(list.pop_front(), Some(4));

        // Check exhaustion
        assert_eq!(list.pop_front(), Some(1));
        assert_eq!(list.pop_front(), None);
    }
}
```

```shell
$ cargo test

     Running target/debug/lists-5c71138492ad4b4a

running 9 tests
test first::test::basics ... ok
test fourth::test::basics ... ok
test second::test::iter_mut ... ok
test second::test::basics ... ok
test fifth::test::iter_mut ... ok
test third::test::basics ... ok
test second::test::iter ... ok
test third::test::iter ... ok
test second::test::into_iter ... ok

test result: ok. 9 passed; 0 failed; 0 ignored; 0 measured
```

## Drop

在[循环引用章节]()，我们介绍过 `Rc` 最怕的就是引用形成循环，而双向链表恰恰如此。因此，当使用默认的实现来 `drop` 我们的链表时，两个节点会将各自的引用计数减少到 1， 然后就不会继续减少，最终造成内存泄漏。

所以，这里最好的实现就是将每个节点 `pop` 出去，直到获得 `None`:

```rust,ignore,mdbook-runnable
impl<T> Drop for List<T> {
    fn drop(&mut self) {
        while self.pop_front().is_some() {}
    }
}
```

细心的读者可能已经注意到，我们还未实现在链表尾部 `push` 和 `pop` 的操作，但由于所需的实现跟之前差别不大，因此我们会在后面直接给出，下面先来看看更有趣的。
