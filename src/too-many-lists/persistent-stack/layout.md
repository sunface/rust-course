# 数据布局和基本操作
对于新的链表来说，最重要的就是我们可以免费的操控列表的尾部( tail )。

## 数据布局
例如以下是一个不太常见的持久化列表布局:
```shell
list1 = A -> B -> C -> D
list2 = tail(list1) = B -> C -> D
list3 = push(list2, X) = X -> B -> C -> D
```

如果上面的不够清晰，我们还可以从内存角度来看：
```shell
list1 -> A ---+
              |
              v
list2 ------> B -> C -> D
              ^
              |
list3 -> X ---+
```

这里大家可能会看出一些端倪：节点 `B` 被多个链表所共享，这造成了我们无法通过 `Box` 的方式来实现，因为如果使用 `Box`，还存在一个问题，谁来负责清理释放？如果 drop `list2`，那 `B` 节点会被清理释放吗？

函数式语言或者说其它绝大多数语言，并不存在这个问题，因为 GC 垃圾回收解千愁，但是 Rust 并没有。

好在标准库为我们提供了引用计数的数据结构: `Rc / Arc`，引用计数可以被认为是一种简单的 GC，对于很多场景来说，引用计数的数据吞吐量要远小于垃圾回收，而且引用计数还存在循环引用的风险！但... 我们有其它选择吗？ :(

不过使用 Rc 意味着我们的数据将无法被改变，因为它不具备内部可变性，关于 Rc/Arc 的详细介绍请看[这里](https://course.rs/advance/smart-pointer/rc-arc.html)。

下面，简单的将我们的数据结构通过 `Rc` 来实现：
```rust
// in third.rs
use std::rc::Rc;

pub struct List<T> {
    head: Link<T>,
}

type Link<T> = Option<Rc<Node<T>>>;

struct Node<T> {
    elem: T,
    next: Link<T>,
}
```

需要注意的是, `Rc` 在 Rust 中并不是一等公民，它没有被包含在 `std::prelude` 中，因此我们必须手动引入 `use std::rc::Rc` (混得好失败 - , -)

## 基本操作
首先，对于 List 的构造器，可以直接复制粘贴:
```rust
impl<T> List<T> {
    pub fn new() -> Self {
        List { head: None }
    }
}
```

而之前的 `push` 和 `pop` 已无任何意义，因为新链表是不可变的，但我们可以使用功能相似的 `prepend` 和 `tail` 来返回新的链表。

```rust
pub fn prepend(&self, elem: T) -> List<T> {
    List { head: Some(Rc::new(Node {
        elem: elem,
        next: self.head.clone(),
    }))}
}
```

大家可能会大惊失色，什么，你竟然用了 `clone`，不是号称高性能链表实现吗？别急，这里其实只是 `Rc::clone`，对于该方法而言，`clone` 仅仅是增加引用计数，并不是复制底层的数据。虽然 `Rc` 的性能要比 `Box` 的引用方式低一点，但是它依然是多所有权前提下最好的解决方式或者说之一。

还有一点值得注意， `head` 是 `Option<Rc<Node<T>>>` 类型，那么为何不先匹配出内部的 `Rc<Node<T>>`，然后再 clone 呢？原因是 `Option` 也提供了相应的 API，它的功能跟我们的需求是一致的。

运行下试试：
```shell
$ cargo build

warning: field is never used: `elem`
  --> src/third.rs:10:5
   |
10 |     elem: T,
   |     ^^^^^^^
   |
   = note: #[warn(dead_code)] on by default

warning: field is never used: `next`
  --> src/third.rs:11:5
   |
11 |     next: Link<T>,
   |     ^^^^^^^^^^^^^
```

胆战心惊的编译通过(胆战心惊? 日常基本操作，请坐下!)。

继续来实现 `tail`，该方法会将现有链表的首个元素移除，并返回剩余的链表:
```rust
pub fn tail(&self) -> List<T> {
    List { head: self.head.as_ref().map(|node| node.next.clone()) }
}
```

```shell
$ cargo build

error[E0308]: mismatched types
  --> src/third.rs:27:22
   |
27 |         List { head: self.head.as_ref().map(|node| node.next.clone()) }
   |                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ expected struct `std::rc::Rc`, found enum `std::option::Option`
   |
   = note: expected type `std::option::Option<std::rc::Rc<_>>`
              found type `std::option::Option<std::option::Option<std::rc::Rc<_>>>`
```

看起来这里的 `map` 多套了一层 `Option`，可以用 `and_then` 替代：
```rust
pub fn tail(&self) -> List<T> {
    List { head: self.head.as_ref().and_then(|node| node.next.clone()) }
}
```

顺利通过编译，很棒！最后就是实现 `head` 方法，它返回首个元素的引用，跟之前链表的 `peek` 方法一样:
```rust
pub fn head(&self) -> Option<&T> {
    self.head.as_ref().map(|node| &node.elem )
}
```

好了，至此，新链表的基本操作都已经实现，最后让我们写几个测试用例来看看它们是骡子还是马：
```rust
#[cfg(test)]
mod test {
    use super::List;

    #[test]
    fn basics() {
        let list = List::new();
        assert_eq!(list.head(), None);

        let list = list.prepend(1).prepend(2).prepend(3);
        assert_eq!(list.head(), Some(&3));

        let list = list.tail();
        assert_eq!(list.head(), Some(&2));

        let list = list.tail();
        assert_eq!(list.head(), Some(&1));

        let list = list.tail();
        assert_eq!(list.head(), None);

        // Make sure empty tail works
        let list = list.tail();
        assert_eq!(list.head(), None);

    }
}
```

```shell
$ cargo test

     Running target/debug/lists-5c71138492ad4b4a

running 5 tests
test first::test::basics ... ok
test second::test::into_iter ... ok
test second::test::basics ... ok
test second::test::iter ... ok
test third::test::basics ... ok

test result: ok. 5 passed; 0 failed; 0 ignored; 0 measured
```

哦对了... 我们好像忘了一个重要特性：对链表的迭代。

```rust
pub struct Iter<'a, T> {
    next: Option<&'a Node<T>>,
}

impl<T> List<T> {
    pub fn iter(&self) -> Iter<'_, T> {
        Iter { next: self.head.as_deref() }
    }
}

impl<'a, T> Iterator for Iter<'a, T> {
    type Item = &'a T;

    fn next(&mut self) -> Option<Self::Item> {
        self.next.map(|node| {
            self.next = node.next.as_deref();
            &node.elem
        })
    }
}
```

```rust
#[test]
fn iter() {
    let list = List::new().prepend(1).prepend(2).prepend(3);

    let mut iter = list.iter();
    assert_eq!(iter.next(), Some(&3));
    assert_eq!(iter.next(), Some(&2));
    assert_eq!(iter.next(), Some(&1));
}
```

```shell
$ cargo test

     Running target/debug/lists-5c71138492ad4b4a

running 7 tests
test first::test::basics ... ok
test second::test::basics ... ok
test second::test::iter ... ok
test second::test::into_iter ... ok
test second::test::peek ... ok
test third::test::basics ... ok
test third::test::iter ... ok

test result: ok. 6 passed; 0 failed; 0 ignored; 0 measured
```

细心的同学可能会觉得我在凑字数，这不跟之前的链表迭代实现一样一样的嘛？恭喜你答对了 ：）

最后，给大家留个作业，你可以尝试下看能不能实现 `IntoIter` 和 `IterMut`，如果实现不了请不要打我，冤有头债有主，都是 `Rc` 惹的祸 :(