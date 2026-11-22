# 迭代器
集合类型可以通过 `Iterator` 特征进行迭代，该特征看起来比 `Drop` 要复杂点：
```rust
pub trait Iterator {
    type Item;
    fn next(&mut self) -> Option<Self::Item>;
}
```

这里的 `Item` 是[关联类型](https://beatai.org/rust-course/basic/trait/advance-trait#关联类型)，用来指代迭代器中具体的元素类型，`next` 方法返回的也是该类型。

其实上面的说法有点不够准确，原因是 `next` 方法返回的是 `Option<Self::Item>`，使用 `Option<T>` 枚举的原因是为了方便用户，不然用户需要 `has_next` 和 `get_next` 才能满足使用需求。有值时返回 `Some(T)`，无值时返回 `None`，这种 API 设计工程性更好，也更加安全，完美！

有点悲剧的是, Rust 截至目前还没有 `yield` 语句，因此我们需要自己来实现相关的逻辑。还有点需要注意，每个集合类型应该实现 3 种迭代器类型：

- `IntoIter` - `T`
- `IterMut` - `&mut T`
- `Iter` - `&T`

也许大家不认识它们，但是其实很好理解，`IntoIter` 类型迭代器的 `next` 方法会拿走被迭代值的所有权，`IterMut` 是可变借用， `Iter` 是不可变借用。事实上，类似的[命名规则](https://beatai.org/rust-course/practice/naming#一个集合上的方法如果返回迭代器需遵循命名规则iteriter_mutinto_iter-c-iter)在 Rust 中随处可见，当熟悉后，以后见到类似的命名大家就可以迅速的理解其对值的运用方式。

## IntoIter
先来看看 `IntoIter` 该怎么实现:
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
        // access fields of a tuple struct numerically
        self.0.pop()
    }
}
```

这里我们通过[元组结构体](https://beatai.org/rust-course/basic/compound-type/struct#元组结构体tuple-struct)的方式定义了 `IntoIter`，下面来测试下:
```rust
#[test]
fn into_iter() {
    let mut list = List::new();
    list.push(1); list.push(2); list.push(3);

    let mut iter = list.into_iter();
    assert_eq!(iter.next(), Some(3));
    assert_eq!(iter.next(), Some(2));
    assert_eq!(iter.next(), Some(1));
    assert_eq!(iter.next(), None);
}
```

```shell
$ cargo test

     Running target/debug/lists-5c71138492ad4b4a

running 4 tests
test first::test::basics ... ok
test second::test::basics ... ok
test second::test::into_iter ... ok
test second::test::peek ... ok

test result: ok. 4 passed; 0 failed; 0 ignored; 0 measured
```

## Iter
相对来说，`IntoIter` 是最好实现的，因为它只是简单的拿走值，不涉及到引用，也不涉及到生命周期，而 `Iter` 就有所不同了。

这里的基本逻辑是我们持有一个当前节点的指针，当生成一个值后，该指针将指向下一个节点。

```rust
pub struct Iter<T> {
    next: Option<&Node<T>>,
}

impl<T> List<T> {
    pub fn iter(&self) -> Iter<T> {
        Iter { next: self.head.map(|node| &node) }
    }
}

impl<T> Iterator for Iter<T> {
    type Item = &T;

    fn next(&mut self) -> Option<Self::Item> {
        self.next.map(|node| {
            self.next = node.next.map(|node| &node);
            &node.elem
        })
    }
}
```

```shell
$ cargo build

error[E0106]: missing lifetime specifier
  --> src/second.rs:72:18
   |
72 |     next: Option<&Node<T>>,
   |                  ^ expected lifetime parameter

error[E0106]: missing lifetime specifier
  --> src/second.rs:82:17
   |
82 |     type Item = &T;
   |                 ^ expected lifetime parameter
```

许久不见的错误又冒了出来，而且这次直指 Rust 中最难的点之一：生命周期。关于生命周期的讲解，这里就不再展开，如果大家还不熟悉，强烈建议看看[此章节](https://beatai.org/rust-course/advance/lifetime/intro)，然后再继续。

首先，先加一个生命周期试试：
```rust
pub struct Iter<'a, T> {
    next: Option<&'a Node<T>>,
}
```

```shell
$ cargo build

error[E0106]: missing lifetime specifier
  --> src/second.rs:83:22
   |
83 | impl<T> Iterator for Iter<T> {
   |                      ^^^^^^^ expected lifetime parameter

error[E0106]: missing lifetime specifier
  --> src/second.rs:84:17
   |
84 |     type Item = &T;
   |                 ^ expected lifetime parameter

error: aborting due to 2 previous errors
```

好的，现在有了更多的提示，来按照提示修改下代码:
```rust
pub struct Iter<'a, T> {
    next: Option<&'a Node<T>>,
}

impl<'a, T> List<T> {
    pub fn iter(&'a self) -> Iter<'a, T> {
        Iter { next: self.head.map(|node| &'a node) }
    }
}

impl<'a, T> Iterator for Iter<'a, T> {
    type Item = &'a T;
    fn next(&'a mut self) -> Option<Self::Item> {
        self.next.map(|node| {
            self.next = node.next.map(|node| &'a node);
            &'a node.elem
        })
    }
}
```

```shell
$ cargo build

error: expected `:`, found `node`
  --> src/second.rs:77:47
   |
77 |         Iter { next: self.head.map(|node| &'a node) }
   |         ---- while parsing this struct        ^^^^ expected `:`

error: expected `:`, found `node`
  --> src/second.rs:85:50
   |
85 |             self.next = node.next.map(|node| &'a node);
   |                                                  ^^^^ expected `:`

error[E0063]: missing field `next` in initializer of `second::Iter<'_, _>`
  --> src/second.rs:77:9
   |
77 |         Iter { next: self.head.map(|node| &'a node) }
   |         ^^^^ missing `next`
```

怎么回事。。感觉错误犹如雨后春笋般冒了出来，Rust 是不是被我们搞坏了 :(

现在看来，我们的生命周期是用错了，聪明的同学可能已经看出了端倪，那么再修改下试试；
```rust
pub struct Iter<'a, T> {
    next: Option<&'a Node<T>>,
}

// 这里无需生命周期，因为 List 没有使用生命周期的关联项
impl<T> List<T> {
    // 这里我们为 `iter` 声明一个生命周期 'a , 此时 `&self` 需要至少和 `Iter` 活得一样久
    pub fn iter<'a>(&'a self) -> Iter<'a, T> {
        Iter { next: self.head.map(|node| &node) }
    }
}

// 这里声明生命周期是因为下面的关联类型 Item 需要
impl<'a, T> Iterator for Iter<'a, T> {
    type Item = &'a T;

    // 这里无需更改，因为上面已经处理了.
    // Self 依然是这么棒
    fn next(&mut self) -> Option<Self::Item> {
        self.next.map(|node| {
            self.next = node.next.map(|node| &node);
            &node.elem
        })
    }
}
```

现在，我们也许可以自信的编译下试试了：
```shell
$ cargo build

error[E0308]: mismatched types
  --> src/second.rs:77:22
   |
77 |         Iter { next: self.head.map(|node| &node) }
   |                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^ expected struct `second::Node`, found struct `std::boxed::Box`
   |
   = note: expected type `std::option::Option<&second::Node<T>>`
              found type `std::option::Option<&std::boxed::Box<second::Node<T>>>`

error[E0308]: mismatched types
  --> src/second.rs:85:25
   |
85 |             self.next = node.next.map(|node| &node);
   |                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^ expected struct `second::Node`, found struct `std::boxed::Box`
   |
   = note: expected type `std::option::Option<&'a second::Node<T>>`
              found type `std::option::Option<&std::boxed::Box<second::Node<T>>>`
```

(╯°□°)╯︵ ┻━┻

这么看，生命周期的问题解决了，但是又引入了新的错误。原因在于，我们希望存储 `&Node` 但是获取的却是 `&Box<Node>`。嗯，小问题，解引用搞定：
```rust
impl<T> List<T> {
    pub fn iter<'a>(&'a self) -> Iter<'a, T> {
        Iter { next: self.head.map(|node| &*node) }
    }
}

impl<'a, T> Iterator for Iter<'a, T> {
    type Item = &'a T;
    fn next(&mut self) -> Option<Self::Item> {
        self.next.map(|node| {
            self.next = node.next.map(|node| &*node);
            &node.elem
        })
    }
}
```

```shell
$ cargo build

   Compiling lists v0.1.0 (/Users/ABeingessner/dev/temp/lists)
error[E0515]: cannot return reference to local data `*node`
  --> src/second.rs:77:43
   |
77 |         Iter { next: self.head.map(|node| &*node) }
   |                                           ^^^^^^ returns a reference to data owned by the current function

error[E0507]: cannot move out of borrowed content
  --> src/second.rs:77:22
   |
77 |         Iter { next: self.head.map(|node| &*node) }
   |                      ^^^^^^^^^ cannot move out of borrowed content

error[E0515]: cannot return reference to local data `*node`
  --> src/second.rs:85:46
   |
85 |             self.next = node.next.map(|node| &*node);
   |                                              ^^^^^^ returns a reference to data owned by the current function

error[E0507]: cannot move out of borrowed content
  --> src/second.rs:85:25
   |
85 |             self.next = node.next.map(|node| &*node);
   |                         ^^^^^^^^^ cannot move out of borrowed content
```

又怎么了! (ﾉಥ益ಥ）ﾉ﻿ ┻━┻

大家还记得之前章节的内容吗？原因是这里我们忘记了 `as_ref` ，然后值的所有权被转移到了 `map` 中，结果我们在内部引用了一个局部值，造成一个悬垂引用：
```rust
pub struct Iter<'a, T> {
    next: Option<&'a Node<T>>,
}

impl<T> List<T> {
    pub fn iter<'a>(&'a self) -> Iter<'a, T> {
        Iter { next: self.head.as_ref().map(|node| &*node) }
    }
}

impl<'a, T> Iterator for Iter<'a, T> {
    type Item = &'a T;

    fn next(&mut self) -> Option<Self::Item> {
        self.next.map(|node| {
            self.next = node.next.as_ref().map(|node| &*node);
            &node.elem
        })
    }
}
```

```shell
$ cargo build

   Compiling lists v0.1.0 (/Users/ABeingessner/dev/temp/lists)
error[E0308]: mismatched types
  --> src/second.rs:77:22
   |
77 |         Iter { next: self.head.as_ref().map(|node| &*node) }
   |                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ expected struct `second::Node`, found struct `std::boxed::Box`
   |
   = note: expected type `std::option::Option<&second::Node<T>>`
              found type `std::option::Option<&std::boxed::Box<second::Node<T>>>`

error[E0308]: mismatched types
  --> src/second.rs:85:25
   |
85 |             self.next = node.next.as_ref().map(|node| &*node);
   |                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ expected struct `second::Node`, found struct `std::boxed::Box`
   |
   = note: expected type `std::option::Option<&'a second::Node<T>>`
              found type `std::option::Option<&std::boxed::Box<second::Node<T>>>`
```

😭

错误的原因是，`as_ref` 增加了一层间接引用，需要被移除，这里使用另外一种方式来实现:
```rust
pub struct Iter<'a, T> {
    next: Option<&'a Node<T>>,
}

impl<T> List<T> {
    pub fn iter<'a>(&'a self) -> Iter<'a, T> {
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

```shell
$ cargo build
```

🎉 🎉 🎉

`as_deref` 和 `as_deref_mut` 函数在 Rust 1.40 版本中正式稳定下来。在那之前，你只能在 `stable` 版本中使用 `map(|node| &**node)` 和 `map(|node| &mut**node)` 的方式来替代。

大家可能会觉得 `&**` 的形式看上去有些烂，没错，确实如此。但是就像一瓶好酒一样，Rust 也随着时间的推进变得越来越好，因此现在我们已经无需再这么做了。事实上，Rust 很擅长隐式地做类似的转换，或者可以称之为 [`Deref`](https://beatai.org/rust-course/advance/smart-pointer/deref)。

但是 `Deref` 在这里并不能很好的完成自己的任务，原因是在闭包中使用 `Option<&T>` 而不是 `&T` 对于它来说有些过于复杂了，因此我们需要显式地去帮助它完成任务。好在根据我的经验来看，这种情况还是相当少见的。

事实上，还可以使用另一种方式来实现：
```rust
self.next = node.next.as_ref().map::<&Node<T>, _>(|node| &node);
```

这种类型暗示的方式可以使用的原因在于 `map` 是一个泛型函数:
```rust
pub fn map<U, F>(self, f: F) -> Option<U>
```

turbofish 形式的符号 `::<>` 可以告诉编译器我们希望用哪个具体的类型来替代泛型类型，在这种情况里，`::<&Node<T>, _>` 意味着: 它应该返回一个 `&Node<T>`。这种方式可以让编译器知道它需要对 `&node` 应用 `deref`，这样我们就不用手动的添加 `**` 来进行解引用。

好了，既然编译通过，那就写个测试来看看运行结果:
```rust
#[test]
fn iter() {
    let mut list = List::new();
    list.push(1); list.push(2); list.push(3);

    let mut iter = list.iter();
    assert_eq!(iter.next(), Some(&3));
    assert_eq!(iter.next(), Some(&2));
    assert_eq!(iter.next(), Some(&1));
}
```

```shell
$ cargo test

     Running target/debug/lists-5c71138492ad4b4a

running 5 tests
test first::test::basics ... ok
test second::test::basics ... ok
test second::test::into_iter ... ok
test second::test::iter ... ok
test second::test::peek ... ok

test result: ok. 4 passed; 0 failed; 0 ignored; 0 measured
```

最后，还有一点值得注意，之前的代码事实上可以应用[生命周期消除原则](https://beatai.org/rust-course/basic/lifetime#生命周期消除):
```rust
impl<T> List<T> {
    pub fn iter<'a>(&'a self) -> Iter<'a, T> {
        Iter { next: self.head.as_deref() }
    }
}
```

这段代码跟以下代码是等价的:
```rust
impl<T> List<T> {
    pub fn iter(&self) -> Iter<T> {
        Iter { next: self.head.as_deref() }
    }
}
```

当然，如果你就喜欢生命周期那种自由、飘逸的 feeling，还可以使用 Rust 2018 引入的“显式生命周期消除"语法 `'_`：
```rust
impl<T> List<T> {
    pub fn iter(&self) -> Iter<'_, T> {
        Iter { next: self.head.as_deref() }
    }
}
```

