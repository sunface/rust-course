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

