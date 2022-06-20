# 基本操作

> 本章节的代码中有一个隐藏的 bug，因为它藏身于 unsafe 中，因此不会导致报错，我们会在后续章节解决这个问题，所以，请不要在生产环境使用此处的代码

在开始之前，大家需要先了解 unsafe 的[相关知识](https://course.rs/advance/unsafe/intro.html)。那么，言归正传，该如何构建一个链表？在之前我们是这么做的：
```rust
impl<T> List<T> {
    pub fn new() -> Self {
        List { head: None, tail: None }
    }
}
```

但是我们不再在 `tail` 中使用 `Option`:
```shell
$ cargo build

error[E0308]: mismatched types
  --> src/fifth.rs:15:34
   |
15 |         List { head: None, tail: None }
   |                                  ^^^^ expected *-ptr, found 
   |                                       enum `std::option::Option`
   |
   = note: expected type `*mut fifth::Node<T>`
              found type `std::option::Option<_>`
```

我们是可以使用 `Option` 包裹一层，但是 `*mut` 裸指针之所以裸，是因为它狂，它可以是 `null` ! 因此 `Option` 就变得没有意义:
```rust
use std::ptr;

// defns...

impl<T> List<T> {
    pub fn new() -> Self {
        List { head: None, tail: ptr::null_mut() }
    }
}
```

如上所示，通过 `std::ptr::null_mut` 函数可以获取一个 `null`，当然，还可以使用 `0 as *mut _`，但是...已经这么不安全了，好歹我们要留一点代码可读性上的尊严吧 = , =

好了，现在是时候去重新实现 `push` ，之前获取的是 `Option<&mut Node<T>>` 成为我们的拦路虎，这次来看看如果是获取 `*mut Node<T>` 还会不会有类似的问题。

首先，该如何将一个普通的引用变成裸指针？答案是：强制转换 Coercions。

```rust
let raw_tail: *mut _ = &mut *new_tail;
```

来看看 `push` 的实现:
```rust
pub fn push(&mut self, elem: T) {
    let mut new_tail = Box::new(Node {
        elem: elem,
        next: None,
    });

    let raw_tail: *mut _ = &mut *new_tail;

    // .is_null 会检查是否为 null, 在功能上等价于 `None` 的检查
    if !self.tail.is_null() {
        // 如果 old tail 存在，那将其指向新的 tail
        self.tail.next = Some(new_tail);
    } else {
        // 否则让 head 指向新的 tail
        self.head = Some(new_tail);
    }

    self.tail = raw_tail;
}
```

```shell
$ cargo build

error[E0609]: no field `next` on type `*mut fifth::Node<T>`
  --> src/fifth.rs:31:23
   |
31 |             self.tail.next = Some(new_tail);
   |             ----------^^^^
   |             |
   |             help: `self.tail` is a raw pointer; 
   |             try dereferencing it: `(*self.tail).next`
```

当使用裸指针时，一些 Rust 提供的便利条件也将不复存在，例如由于不安全性的存在，裸指针需要我们手动去解引用( deref ):
```rust
*self.tail.next = Some(new_tail);
```

```shell
$ cargo build

error[E0609]: no field `next` on type `*mut fifth::Node<T>`
  --> src/fifth.rs:31:23
   |
31 |             *self.tail.next = Some(new_tail);
   |             -----------^^^^
   |             |
   |             help: `self.tail` is a raw pointer; 
   |             try dereferencing it: `(*self.tail).next`
```

哦哦，运算符的优先级问题:
```rust
(*self.tail).next = Some(new_tail);
```

```shell
$ cargo build

error[E0133]: dereference of raw pointer is unsafe and requires 
              unsafe function or block

  --> src/fifth.rs:31:13
   |
31 |             (*self.tail).next = Some(new_tail);
   |             ^^^^^^^^^^^^^^^^^ dereference of raw pointer
   |
   = note: raw pointers may be NULL, dangling or unaligned; 
     they can violate aliasing rules and cause data races: 
     all of these are undefined behavior
```

哎...太难了，错误一个连一个，好在编译器给出了提示：由于我们在进行不安全的操作，因此需要使用 `unsafe` 语句块。那么问题来了，是将某几行代码包在 `unsafe` 中还是将整个函数包在 `unsafe` 中呢？如果大家不知道哪个是正确答案的话，证明[之前的章节](https://course.rs/advance/unsafe/intro.html#控制-unsafe-的使用边界)还是没有仔细学，请回去再看一下，巩固巩固:) 

```rust
pub fn push(&mut self, elem: T) {
    let mut new_tail = Box::new(Node {
        elem: elem,
        next: None,
    });

    let raw_tail: *mut _ = &mut *new_tail;

    if !self.tail.is_null() {
        // 你好编译器，我知道我在做危险的事情，我向你保证：就算犯错了，也和你没有关系，都是我这个不优秀的程序员的责任
        unsafe {
            (*self.tail).next = Some(new_tail);
        }
    } else {
        self.head = Some(new_tail);
    }

    self.tail = raw_tail;
}
```

```shell
$ cargo build
warning: field is never used: `elem`
  --> src/fifth.rs:11:5
   |
11 |     elem: T,
   |     ^^^^^^^
   |
   = note: #[warn(dead_code)] on by default
```

细心的同学可能会发现:不是所有的裸指针代码都有 unsafe 的身影。原因在于：**创建原生指针是安全的行为，而解引用原生指针才是不安全的行为**

呼，长出了一口气，终于成功实现了 `push` ，下面来看看 `pop`:
```rust
pub fn pop(&mut self) -> Option<T> {
    self.head.take().map(|head| {
        let head = *head;
        self.head = head.next;

        if self.head.is_none() {
            self.tail = ptr::null_mut();
        }

        head.elem
    })
}
```

测试下:
```rust
#[cfg(test)]
mod test {
    use super::List;
    #[test]
    fn basics() {
        let mut list = List::new();

        // Check empty list behaves right
        assert_eq!(list.pop(), None);

        // Populate list
        list.push(1);
        list.push(2);
        list.push(3);

        // Check normal removal
        assert_eq!(list.pop(), Some(1));
        assert_eq!(list.pop(), Some(2));

        // Push some more just to make sure nothing's corrupted
        list.push(4);
        list.push(5);

        // Check normal removal
        assert_eq!(list.pop(), Some(3));
        assert_eq!(list.pop(), Some(4));

        // Check exhaustion
        assert_eq!(list.pop(), Some(5));
        assert_eq!(list.pop(), None);

        // Check the exhaustion case fixed the pointer right
        list.push(6);
        list.push(7);

        // Check normal removal
        assert_eq!(list.pop(), Some(6));
        assert_eq!(list.pop(), Some(7));
        assert_eq!(list.pop(), None);
    }
}
```

摊牌了，我们偷懒了，这些测试就是从之前的栈链表赋值过来的，但是依然做了些改变，例如在末尾增加了几个步骤以确保在 `pop` 中不会发生尾指针损坏( tail-pointer corruption  )的情况。

```shell
$ cargo test

running 12 tests
test fifth::test::basics ... ok
test first::test::basics ... ok
test fourth::test::basics ... ok
test fourth::test::peek ... ok
test second::test::basics ... ok
test fourth::test::into_iter ... ok
test second::test::into_iter ... ok
test second::test::iter ... ok
test second::test::iter_mut ... ok
test second::test::peek ... ok
test third::test::basics ... ok
test third::test::iter ... ok

test result: ok. 12 passed; 0 failed; 0 ignored; 0 measured
```

