# 额外的操作

在搞定 `push`、`pop` 后，剩下的基本跟栈链表的实现没有啥区别。只有会改变链表长度的操作才会使用<ruby>尾<rt>tail</rt></ruby>指针。

当然，现在一切都是裸指针，因此我们要重写代码来使用它们，在此过程中必须要确保没有遗漏地修改所有地方。

首先，先从栈链表实现中拷贝以下代码:

```rust,ignore,mdbook-runnable
// ...

pub struct IntoIter<T>(List<T>);

pub struct Iter<'a, T> {
    next: Option<&'a Node<T>>,
}

pub struct IterMut<'a, T> {
    next: Option<&'a mut Node<T>>,
}
```

这里的 `Iter` 和 `IterMut` 并没有实现裸指针，先来修改下：

```rust,ignore,mdbook-runnable
pub struct IntoIter<T>(List<T>);

pub struct Iter<'a, T> {
    next: *mut Node<T>,
}

pub struct IterMut<'a, T> {
    next: *mut Node<T>,
}

impl<T> List<T> {
    pub fn into_iter(self) -> IntoIter<T> {
        IntoIter(self)
    }

    pub fn iter(&self) -> Iter<'_, T> {
        Iter { next: self.head }
    }

    pub fn iter_mut(&mut self) -> IterMut<'_, T> {
        IterMut { next: self.head }
    }
}
```

看起来不错!

```text
error[E0392]: parameter `'a` is never used
  --> src\fifth.rs:17:17
   |
17 | pub struct Iter<'a, T> {
   |                 ^^ unused parameter
   |
   = help: consider removing `'a`, referring to it in a field,
     or using a marker such as `PhantomData`

error[E0392]: parameter `'a` is never used
  --> src\fifth.rs:21:20
   |
21 | pub struct IterMut<'a, T> {
   |                    ^^ unused parameter
   |
   = help: consider removing `'a`, referring to it in a field,
     or using a marker such as `PhantomData`
```

咦？这里的 [PhantomData](https://doc.rust-lang.org/std/marker/struct.PhantomData.html) 是什么?

> PhantomData 是<ruby>零大小<rt>zero sized</rt></ruby>的类型
>
> 在你的类型中添加一个 `PhantomData<T>` 字段，可以告诉编译器你的类型对 `T` 进行了使用，虽然并没有。说白了，就是让编译器不再给出 `T` 未被使用的警告或者错误。
>
> 如果想要更深入的了解，可以看下 [Nomicon](https://doc.rust-lang.org/nightly/nomicon/)

大概最适用于 PhantomData 的场景就是一个结构体拥有未使用的生命周期，典型的就是在 unsafe 中使用。

总之，之前的错误是可以通过 PhantomData 来解决的，但是我想将这个秘密武器留到下一章中的双向链表，它才是真正的需要。

那现在只能破坏我们之前的豪言壮语了，灰溜溜的继续使用引用貌似也是不错的选择。能使用引用的原因是：我们可以创建一个迭代器，在其中使用安全引用，然后再丢弃迭代器。一旦迭代器被丢弃后，就可以继续使用 `push` 和 `pop` 了。

事实上，在迭代期间，我们还是需要解引用大量的裸指针，但是可以把引用看作裸指针的再借用。

偷偷的说一句：对于这个方法，我不敢保证一定能成功，先来试试吧..

```rust,ignore,mdbook-runnable
pub struct IntoIter<T>(List<T>);

pub struct Iter<'a, T> {
    next: Option<&'a Node<T>>,
}

pub struct IterMut<'a, T> {
    next: Option<&'a mut Node<T>>,
}

impl<T> List<T> {
    pub fn into_iter(self) -> IntoIter<T> {
        IntoIter(self)
    }

    pub fn iter(&self) -> Iter<'_, T> {
        unsafe {
            Iter { next: self.head.as_ref() }
        }
    }

    pub fn iter_mut(&mut self) -> IterMut<'_, T> {
        unsafe {
            IterMut { next: self.head.as_mut() }
        }
    }
}
```

为了存储引用，这里使用 `Option` 来包裹，并通过 [`ptr::as_ref`](https://doc.rust-lang.org/std/primitive.pointer.html#method.as_ref-1) 和 [`ptr::as_mut`](https://doc.rust-lang.org/std/primitive.pointer.html#method.as_mut) 来将裸指针转换成引用。

通常，我会尽量避免使用 `as_ref` 这类方法，因为它们在做一些不可思议的转换！但是上面却是极少数可以使用的场景之一。

这两个方法的使用往往会伴随很多警告，其中最有趣的是：

> 你必须要遵循混叠(Aliasing)的规则，原因是返回的生命周期 `'a` 只是任意选择的，并不能代表数据真实的生命周期。特别的，在这段生命周期的过程中，指针指向的内存区域绝不能被其它指针所访问。

好消息是，我们貌似不存在这个问题，因为混叠是我们一直在讨论和避免的问题。除此之外，还有一个恶魔：

```rust,ignore,mdbook-runnable
pub unsafe fn as_mut<'a>(self) -> Option<&'a mut T>
```

大家注意到这个凭空出现的 `'a` 吗？这里 `self` 是一个值类型，按照生命周期的规则，`'a` 无根之木，它就是[无界生命周期](https://course.rs/advance/lifetime/advance.html#无界生命周期)。

兄弟们，我很紧张，但是该继续的还是得继续，让我们从栈链表中再复制一些代码过来：

```rust,ignore,mdbook-runnable
impl<T> Iterator for IntoIter<T> {
    type Item = T;
    fn next(&mut self) -> Option<Self::Item> {
        self.0.pop()
    }
}

impl<'a, T> Iterator for Iter<'a, T> {
    type Item = &'a T;

    fn next(&mut self) -> Option<Self::Item> {
        unsafe {
            self.next.map(|node| {
                self.next = node.next.as_ref();
                &node.elem
            })
        }
    }
}

impl<'a, T> Iterator for IterMut<'a, T> {
    type Item = &'a mut T;

    fn next(&mut self) -> Option<Self::Item> {
        unsafe {
            self.next.take().map(|node| {
                self.next = node.next.as_mut();
                &mut node.elem
            })
        }
    }
}
```

验证下测试用例：

```rust,ignore,mdbook-runnable
cargo test

running 15 tests
test fifth::test::basics ... ok
test fifth::test::into_iter ... ok
test fifth::test::iter ... ok
test fifth::test::iter_mut ... ok
test first::test::basics ... ok
test fourth::test::basics ... ok
test fourth::test::into_iter ... ok
test fourth::test::peek ... ok
test second::test::basics ... ok
test second::test::into_iter ... ok
test second::test::iter ... ok
test second::test::iter_mut ... ok
test second::test::peek ... ok
test third::test::iter ... ok
test third::test::basics ... ok

test result: ok. 15 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out;
```

还有 miri:

```text
MIRIFLAGS="-Zmiri-tag-raw-pointers" cargo +nightly-2022-01-21 miri test

running 15 tests
test fifth::test::basics ... ok
test fifth::test::into_iter ... ok
test fifth::test::iter ... ok
test fifth::test::iter_mut ... ok
test first::test::basics ... ok
test fourth::test::basics ... ok
test fourth::test::into_iter ... ok
test fourth::test::peek ... ok
test second::test::basics ... ok
test second::test::into_iter ... ok
test second::test::iter ... ok
test second::test::iter_mut ... ok
test second::test::peek ... ok
test third::test::basics ... ok
test third::test::iter ... ok

test result: ok. 15 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

嗯，还有 `peek` 和 `peek_mut` 的实现：

```rust,ignore,mdbook-runnable
pub fn peek(&self) -> Option<&T> {
    unsafe {
        self.head.as_ref()
    }
}

pub fn peek_mut(&mut self) -> Option<&mut T> {
    unsafe {
        self.head.as_mut()
    }
}
```

实现这么简单，运行起来肯定没问题：

```text
$ cargo build
error[E0308]: mismatched types
  --> src\fifth.rs:66:13
   |
25 | impl<T> List<T> {
   |      - this type parameter
...
64 |     pub fn peek(&self) -> Option<&T> {
   |                           ---------- expected `Option<&T>`
   |                                      because of return type
65 |         unsafe {
66 |             self.head.as_ref()
   |             ^^^^^^^^^^^^^^^^^^ expected type parameter `T`,
   |                                found struct `fifth::Node`
   |
   = note: expected enum `Option<&T>`
              found enum `Option<&fifth::Node<T>>`
```

哦，这个简单，map 以下就可以了:

```rust,ignore,mdbook-runnable
pub fn peek(&self) -> Option<&T> {
    unsafe {
        self.head.as_ref().map(|node| &node.elem)
    }
}

pub fn peek_mut(&mut self) -> Option<&mut T> {
    unsafe {
        self.head.as_mut().map(|node| &mut node.elem)
    }
}
```

我感觉有很多错误正在赶来的路上，因此大家需要提高警惕，要么先写一个测试吧：把我们的 API 都混合在一起，让 miri 来享用 - miri food!

```rust,ignore,mdbook-runnable
#[test]
fn miri_food() {
    let mut list = List::new();

    list.push(1);
    list.push(2);
    list.push(3);

    assert!(list.pop() == Some(1));
    list.push(4);
    assert!(list.pop() == Some(2));
    list.push(5);

    assert!(list.peek() == Some(&3));
    list.push(6);
    list.peek_mut().map(|x| *x *= 10);
    assert!(list.peek() == Some(&30));
    assert!(list.pop() == Some(30));

    for elem in list.iter_mut() {
        *elem *= 100;
    }

    let mut iter = list.iter();
    assert_eq!(iter.next(), Some(&400));
    assert_eq!(iter.next(), Some(&500));
    assert_eq!(iter.next(), Some(&600));
    assert_eq!(iter.next(), None);
    assert_eq!(iter.next(), None);

    assert!(list.pop() == Some(400));
    list.peek_mut().map(|x| *x *= 10);
    assert!(list.peek() == Some(&5000));
    list.push(7);

    // Drop it on the ground and let the dtor exercise itself
}
```

```text
cargo test

running 16 tests
test fifth::test::basics ... ok
test fifth::test::into_iter ... ok
test fifth::test::iter ... ok
test fifth::test::iter_mut ... ok
test fifth::test::miri_food ... ok
test first::test::basics ... ok
test fourth::test::basics ... ok
test fourth::test::into_iter ... ok
test fourth::test::peek ... ok
test second::test::into_iter ... ok
test second::test::basics ... ok
test second::test::iter_mut ... ok
test second::test::peek ... ok
test third::test::iter ... ok
test second::test::iter ... ok
test third::test::basics ... ok

test result: ok. 16 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out



MIRIFLAGS="-Zmiri-tag-raw-pointers" cargo +nightly-2022-01-21 miri test

running 16 tests
test fifth::test::basics ... ok
test fifth::test::into_iter ... ok
test fifth::test::iter ... ok
test fifth::test::iter_mut ... ok
test fifth::test::miri_food ... ok
test first::test::basics ... ok
test fourth::test::basics ... ok
test fourth::test::into_iter ... ok
test fourth::test::peek ... ok
test second::test::into_iter ... ok
test second::test::basics ... ok
test second::test::iter_mut ... ok
test second::test::peek ... ok
test third::test::iter ... ok
test second::test::iter ... ok
test third::test::basics ... ok

test result: ok. 16 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

完美。
