# Peek
`push` 和 `pop` 的防不胜防的编译报错着实让人出了些冷汗，下面来看看轻松的，至少在之前的链表中是很轻松的 :)

```rust
pub fn peek_front(&self) -> Option<&T> {
    self.head.as_ref().map(|node| {
        &node.elem
    })
}
```

额...好像被人发现我是复制黏贴的了，赶紧换一个:
```rust
pub fn peek_front(&self) -> Option<&T> {
    self.head.as_ref().map(|node| {
        // BORROW!!!!
        &node.borrow().elem
    })
}
```

```shell
$ cargo build

error[E0515]: cannot return value referencing temporary value
  --> src/fourth.rs:66:13
   |
66 |             &node.borrow().elem
   |             ^   ----------^^^^^
   |             |   |
   |             |   temporary value created here
   |             |
   |             returns a value referencing data owned by the current function
```

从报错可以看出，原因是我们引用了局部的变量并试图在函数中返回。为了解释这个问题，先来看看 `borrow` 的定义:
```rust
fn borrow<'a>(&'a self) -> Ref<'a, T>
fn borrow_mut<'a>(&'a self) -> RefMut<'a, T>
```

这里返回的并不是 `&T` 或 `&mut T`，而是一个 [`Ref`](https://doc.rust-lang.org/std/cell/struct.Ref.html) 和 [`RefMut`](https://doc.rust-lang.org/std/cell/struct.RefMut.html)，那么它们是什么？说白了，它们就是在借用到的引用外包裹了一层。而且 `Ref` 和 `RefMut` 分别实现了 `Deref` 和 `DerefMut`，在绝大多数场景中，我们都可以像使用 `&T` 一样去使用它们。


只能说是成是败都赖萧何，恰恰就因为这一层包裹，导致生命周期改变了，也就是 `Ref` 以及内部引用的生命周期不再和 `RefCell` 相同，而 `Ref` 的生命周期是map所包含的闭包，因此就造成了局部引用的问题。

事实上，这是必须的，如果内部的引用和外部的 `Ref` 生命周期不一致，那该如何管理？当 `Ref` 因超出作用域被 `drop` 时，内部的引用怎么办？

现在该怎么办？我们只想要一个引用，现在却多了一个 `Ref` 拦路虎。等等，如果我们不返回 `&T` 而是返回 `Ref` 呢？
```rust
use std::cell::{Ref, RefCell};

pub fn peek_front(&self) -> Option<Ref<T>> {
    self.head.as_ref().map(|node| {
        node.borrow()
    })
}
```

```shell
$ cargo build

error[E0308]: mismatched types
  --> src/fourth.rs:64:9
   |
64 | /         self.head.as_ref().map(|node| {
65 | |             node.borrow()
66 | |         })
   | |__________^ expected type parameter, found struct `fourth::Node`
   |
   = note: expected type `std::option::Option<std::cell::Ref<'_, T>>`
              found type `std::option::Option<std::cell::Ref<'_, fourth::Node<T>>>`
```

嗯，类型不匹配了，要返回的是 `Ref<T>` 但是获取的却是 `Ref<Node<T>>`，那么现在看上去有两个选择：

- 抛弃这条路，换一条重新开始
- 一条路走到死，最终通过更复杂的实现来解决

但是，仔细想想，这两个选择都不是我们想要的，那没办法了，只能继续深挖，看看有没有其它解决办法。啊哦，还真发现了一只野兽：
```rust
map<U, F>(orig: Ref<'b, T>, f: F) -> Ref<'b, U>
    where F: FnOnce(&T) -> &U,
          U: ?Sized
```

就像在 `Result` 和 `Option` 上使用 `map` 一样，我们还能在 `Ref` 上使用 `map`:
```rust
pub fn peek_front(&self) -> Option<Ref<T>> {
    self.head.as_ref().map(|node| {
        Ref::map(node.borrow(), |node| &node.elem)
    })
}
```

```shell
$ cargo build
```

Gooood! 本章节的编译错误可以说是多个链表中最难解决的之一，依然被我们成功搞定了！


下面来写下测试用例，需要注意的是 `Ref` 不能被直接比较，因此我们需要先利用 `Deref` 解引用出其中的值，再进行比较。

```rust
#[test]
fn peek() {
    let mut list = List::new();
    assert!(list.peek_front().is_none());
    list.push_front(1); list.push_front(2); list.push_front(3);

    assert_eq!(&*list.peek_front().unwrap(), &3);
}
```

```shell
$ cargo test

     Running target/debug/lists-5c71138492ad4b4a

running 10 tests
test first::test::basics ... ok
test fourth::test::basics ... ok
test second::test::basics ... ok
test fourth::test::peek ... ok
test second::test::iter_mut ... ok
test second::test::into_iter ... ok
test third::test::basics ... ok
test second::test::peek ... ok
test second::test::iter ... ok
test third::test::iter ... ok

test result: ok. 10 passed; 0 failed; 0 ignored; 0 measured
```

终于可以把文章开头的冷汗擦拭干净了，忘掉这个章节吧，让我来养你...哦不对，让我们开始一段真正轻松的章节。
