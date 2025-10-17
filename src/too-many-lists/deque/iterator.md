# 迭代器
坏男孩最令人头疼，而链表实现中，迭代器就是这样的坏男孩，所以我们放在最后来处理。

## IntoIter
由于是转移所有权，因此 `IntoIter` 一直都是最好实现的:
```rust
pub struct IntoIter<T>(List<T>);

impl<T> List<T> {
    pub fn into_iter(self) -> IntoIter<T> {
        IntoIter(self)
    }
}

impl<T> Iterator for IntoIter<T> {
    type Item = T;
    fn next(&mut self) -> Option<Self::Item> {
        self.0.pop_front()
    }
}
```

但是关于双向链表，有一个有趣的事实，它不仅可以从前向后迭代，还能反过来。前面实现的是传统的从前到后，那问题来了，反过来该如何实现呢？

答案是: `DoubleEndedIterator`，它继承自 `Iterator`( 通过 [`supertrait`](https://course.rs/basic/trait/advance-trait.html?highlight=supertrait#特征定义中的特征约束) )，因此意味着要实现该特征，首先需要实现 `Iterator`。

这样只要为 `DoubleEndedIterator` 实现 `next_back` 方法，就可以支持双向迭代了: `Iterator` 的 `next` 方法从前往后，而 `next_back` 从后向前。

```rust
impl<T> DoubleEndedIterator for IntoIter<T> {
    fn next_back(&mut self) -> Option<Self::Item> {
        self.0.pop_back()
    }
}
```

测试下:
```rust
#[test]
fn into_iter() {
    let mut list = List::new();
    list.push_front(1); list.push_front(2); list.push_front(3);

    let mut iter = list.into_iter();
    assert_eq!(iter.next(), Some(3));
    assert_eq!(iter.next_back(), Some(1));
    assert_eq!(iter.next(), Some(2));
    assert_eq!(iter.next_back(), None);
    assert_eq!(iter.next(), None);
}
```

```shell
$ cargo test

     Running target/debug/lists-5c71138492ad4b4a

running 11 tests
test fourth::test::basics ... ok
test fourth::test::peek ... ok
test fourth::test::into_iter ... ok
test first::test::basics ... ok
test second::test::basics ... ok
test second::test::iter ... ok
test second::test::iter_mut ... ok
test third::test::iter ... ok
test third::test::basics ... ok
test second::test::into_iter ... ok
test second::test::peek ... ok

test result: ok. 11 passed; 0 failed; 0 ignored; 0 measured
```

## Iter
这里又要用到糟糕的 `Ref`:
```rust
pub struct Iter<'a, T>(Option<Ref<'a, Node<T>>>);

impl<T> List<T> {
    pub fn iter(&self) -> Iter<T> {
        Iter(self.head.as_ref().map(|head| head.borrow()))
    }
}
```

```shell
$ cargo build
```

迄今为止一切运行正常，接下来的 `next` 实现起来会有些麻烦:
```rust
impl<'a, T> Iterator for Iter<'a, T> {
    type Item = Ref<'a, T>;
    fn next(&mut self) -> Option<Self::Item> {
        self.0.take().map(|node_ref| {
            self.0 = node_ref.next.as_ref().map(|head| head.borrow());
            Ref::map(node_ref, |node| &node.elem)
        })
    }
}
```

```shell
$ cargo build

error[E0521]: borrowed data escapes outside of closure
   --> src/fourth.rs:155:13
    |
153 |     fn next(&mut self) -> Option<Self::Item> {
    |             --------- `self` is declared here, outside of the closure body
154 |         self.0.take().map(|node_ref| {
155 |             self.0 = node_ref.next.as_ref().map(|head| head.borrow());
    |             ^^^^^^   -------- borrow is only valid in the closure body
    |             |
    |             reference to `node_ref` escapes the closure body here

error[E0505]: cannot move out of `node_ref` because it is borrowed
   --> src/fourth.rs:156:22
    |
153 |     fn next(&mut self) -> Option<Self::Item> {
    |             --------- lifetime `'1` appears in the type of `self`
154 |         self.0.take().map(|node_ref| {
155 |             self.0 = node_ref.next.as_ref().map(|head| head.borrow());
    |             ------   -------- borrow of `node_ref` occurs here
    |             |
    |             assignment requires that `node_ref` is borrowed for `'1`
156 |             Ref::map(node_ref, |node| &node.elem)
    |                      ^^^^^^^^ move out of `node_ref` occurs here
```

果然，膝盖又中了一箭。

`node_ref` 活得不够久，跟一般的引用不同，Rust 不允许我们这样分割 `Ref`，从 `head.borrow()` 中取出的 `Ref` 只允许跟 `node_ref` 活得一样久。


而我们想要的函数是存在的:
```rust
pub fn map_split<U, V, F>(orig: Ref<'b, T>, f: F) -> (Ref<'b, U>, Ref<'b, V>) where
    F: FnOnce(&T) -> (&U, &V),
    U: ?Sized,
    V: ?Sized,
```

喔，这个函数定义的泛型直接晃瞎了我的眼睛。。
```rust
fn next(&mut self) -> Option<Self::Item> {
    self.0.take().map(|node_ref| {
        let (next, elem) = Ref::map_split(node_ref, |node| {
            (&node.next, &node.elem)
        });

        self.0 = next.as_ref().map(|head| head.borrow());

        elem
    })
}
```

```shell
$ cargo build

   Compiling lists v0.1.0 (/Users/ABeingessner/dev/temp/lists)
error[E0521]: borrowed data escapes outside of closure
   --> src/fourth.rs:159:13
    |
153 |     fn next(&mut self) -> Option<Self::Item> {
    |             --------- `self` is declared here, outside of the closure body
...
159 |             self.0 = next.as_ref().map(|head| head.borrow());
    |             ^^^^^^   ---- borrow is only valid in the closure body
    |             |
    |             reference to `next` escapes the closure body here
```

额，借用的内容只允许在闭包体中使用，看起来我们还是得用 `Ref::map` 来解决问题:
```rust
fn next(&mut self) -> Option<Self::Item> {
    self.0.take().map(|node_ref| {
        let (next, elem) = Ref::map_split(node_ref, |node| {
            (&node.next, &node.elem)
        });

        self.0 = if next.is_some() {
            Some(Ref::map(next, |next| &**next.as_ref().unwrap()))
        } else {
            None
        };

        elem
    })
}
```

```shell
error[E0308]: mismatched types
   --> src/fourth.rs:162:22
    |
162 |                 Some(Ref::map(next, |next| &**next.as_ref().unwrap()))
    |                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ expected struct `fourth::Node`, found struct `std::cell::RefCell`
    |
    = note: expected type `std::cell::Ref<'_, fourth::Node<_>>`
               found type `std::cell::Ref<'_, std::cell::RefCell<fourth::Node<_>>>`
```

晕, 多了一个 `RefCell` ，随着我们的对链表的逐步深入，`RefCell` 的代码嵌套变成了不可忽视的问题。

看起来我们已经无能为力了，只能试着去摆脱 `RefCell` 了。`Rc` 怎么样？我们完全可以对 `Rc` 进行完整的克隆:
```rust
pub struct Iter<T>(Option<Rc<Node<T>>>);

impl<T> List<T> {
    pub fn iter(&self) -> Iter<T> {
        Iter(self.head.as_ref().map(|head| head.clone()))
    }
}

impl<T> Iterator for Iter<T> {
    type Item =
```

等等，那现在返回的是什么？`&T` 还是 `Ref<T>` ?

两者都不是，现在我们的 `Iter` 已经没有生命周期了：无论是 `&T` 还是 `Ref<T>` 都需要我们在 `next` 之前声明好生命周期。但是我们试图从 `Rc` 中取出来的值其实是迭代器的引用。

也可以通过对 `Rc` 进行 map 获取到 `Rc<T>`？但是标准库并没有给我们提供相应的功能，第三方倒是有[一个](https://crates.io/crates/owning_ref)。

但是，即使这么做了，还有一个更大的坑在等着：一个会造成迭代器不合法的可怕幽灵。事实上，之前我们对于迭代器不合法是免疫的，但是一旦迭代器产生 `Rc`，那它们就不再会借用链表。这意味着人们可以在持有指向链表内部的指针时，还可以进行 `push` 和 `pop` 操作。

严格来说，`push` 问题不大，因为链表两端的增长不会对我们正在关注的某个子链表造成影响。

但是 `pop` 就是另一个故事了，如果在我们关注的子链表之外 `pop`, 那问题不大。但是如果是 `pop` 一个正在引用的子链表中的节点呢？那一切就完了，特别是，如果大家还试图去 unwrap `try_unwrap` 返回的 `Result` ，会直接造成整个程序的 `panic`。

仔细想一想，好像也不错，程序一切正常，除非去 `pop` 我们正在引用的节点，最美的是，就算遇到这种情况，程序也会直接崩溃，提示我们错误的发生。

其实我们大部分的努力都是为了实现隐藏的细节和优雅的 API，典型的二八原则，八成时间花在二成的细节上。但是如果不关心这些细节，可以接受自己的平凡的话，那把节点简单的到处传递就行。

总之，可以看出，内部可变性非常适合写一个安全性的应用程序，但是如果是安全性高的库，那内部可变性就有些捉襟见肘了。

最终，我选择了放弃，不再实现 `Iter` 和 `IterMut`，也许努力下，可以实现，但是。。。不愉快，算了。