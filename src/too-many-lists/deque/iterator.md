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
    fn next(&mut self) -> Option<T> {
        self.0.pop_front()
    }
}
```

但是关于双向链表，有一个有趣的事实，它不仅可以从前向后迭代，还能反过来。前面实现的是传统的从前到后，那问题来了，反过来该如何实现呢？

答案是: `DoubleEndedIterator`，它继承自 `Iterator`( 通过 [`supertrait`](https://course.rs/basic/trait/advance-trait.html?highlight=supertrait#特征定义中的特征约束) )，因此意味着要实现该特征，首先需要实现 `Iterator`。

这样只要为 `DoubleEndedIterator` 实现 `next_back` 方法，就可以支持双向迭代了: `Iterator` 的 `next` 方法从前往后，而 `next_back` 从后向前。

```rust
impl<T> DoubleEndedIterator for IntoIter<T> {
    fn next_back(&mut self) -> Option<T> {
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
cargo test

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
> cargo build
```

