# 数据布局2: 再裸一些吧

> TL;DR 在之前部分中，将安全的指针 `&` 、`&mut` 和 `Box` 跟不安全的裸指针 `*mut` 和 `*const` 混用是 UB 的根源之一，原因是安全指针会引入额外的约束，但是裸指针并不会遵守这些约束。

一个好消息，一个坏消息。坏消息是我们又要开始写链表了，悲剧 = , = 好消息呢是之前我们已经讨论过该如何设计了，之前做的工作基本都是正确的，除了混用安全指针和不安全指针的部分。

## 布局
在新的布局中我们将只使用裸指针，然后大家就等着好消息吧！

下面是之前的"破代码" ：
```rust
pub struct List<T> {
    head: Link<T>,
    tail: *mut Node<T>, // 好人一枚
}

type Link<T> = Option<Box<Node<T>>>; // 恶魔一只

struct Node<T> {
    elem: T,
    next: Link<T>,
}
```

现在删除恶魔:
```rust
pub struct List<T> {
    head: Link<T>,
    tail: *mut Node<T>,
}

type Link<T> = *mut Node<T>; // 嘀，新的好人卡，请查收

struct Node<T> {
    elem: T,
    next: Link<T>,
}
```

请大家牢记：当使用裸指针时，`Option` 对我们是相当不友好的，所以这里不再使用。在后面还将引入 `NonNull` 类型，但是现在还无需操心。

## 基本操作
`List::new` 与之前几乎没有区别：
```rust
use ptr;

impl<T> List<T> {
    pub fn new() -> Self {
        List { head: ptr::null_mut(), tail: ptr::null_mut() }
    }
}
```

`Push` 也几乎没区...
```rust
pub fn push(&mut self, elem: T) {
    let mut new_tail = Box::new(
```

等等，我们不再使用 `Box` 了，既然如此，该怎么分配内存呢？

也许我们可以使用 `std::alloc::alloc`，但是大家想象一下拿着武士刀进厨房切菜的场景，所以，还是算了吧。

我们想要 `Box` 又不想要，这里有一个也许很野但是管用的方法:
```rust
struct Node<T> {
    elem: T,
    real_next: Option<Box<Node<T>>>,
    next: *mut Node<T>,
}
```

先创建一个 `Box` ，并使用一个裸指针指向 `Box` 中的 `Node`，然后就一直使用该裸指针直到我们处理完 `Node` 且可以销毁它之时。最后，可以将 `Box` 从 `real_next` 中 `take` 出来，并 `drop` 掉。

从上面来看，这个非常符合我们之前的简化版借用栈模型？借用 `Box`，再借用一个裸指针，然后先弹出该裸指针，再弹出 `Box`，嗯，果然很符合。

但是问题来了，这样做看上去有趣，但是你能保证这个简化版借用栈顺利的工作吗？所以，我们还是使用 [Box::into_raw](https://doc.rust-lang.org/std/boxed/struct.Box.html#method.into_raw) 函数吧！

> `pub fn into_raw(b: Box<T>) -> *mut T`
>
> 消费掉 `Box` (拿走所有权)，返回一个裸指针。该指针会被正确的对齐且不为 null
> 
> 在调用该函数后，调用者需要对之前被 Box 所管理的内存负责，特别地，调用者需要正确的清理 `T` 并释放相应的内存。最简单的方式是通过 `Box::from_raw` 函数将裸指针再转回到 `Box`，然后 `Box` 的析构器就可以自动执行清理了。
>
> 注意：这是一个关联函数，因此 `b.into_raw()` 是不正确的，我们得使用 `Box::into_raw(b)`。因此该函数不会跟内部类型的同名方法冲突。
>
> ### 示例
>
> 将裸指针转换成 `Box` 以实现自动的清理:
>
> ```rust
>
> let x = Box::new(String::from("Hello"));
> let ptr = Box::into_raw(x);
> let x = unsafe { Box::from_raw(ptr) };

太棒了，简直为我们量身定制。而且它还很符合我们试图遵循的规则： 从安全的东东开始，将其转换成裸指针，最后再将裸指针转回安全的东东以实现安全的 drop。

现在，我们就可以到处使用裸指针，也无需再注意 unsafe 的范围，反正现在都是 unsafe 了，无所谓。
```rust
pub fn push(&mut self, elem: T) {
    unsafe {
        // 一开始就将 Box 转换成裸指针
        let new_tail = Box::into_raw(Box::new(Node {
            elem: elem,
            next: ptr::null_mut(),
        }));

        if !self.tail.is_null() {
            (*self.tail).next = new_tail;
        } else {
            self.head = new_tail;
        }

        self.tail = new_tail;
    }
}
```

嘿，都说 unsafe 不应该使用，但没想到 unsafe 真的是好！现在代码整体看起来简洁多了。

继续实现 `pop`，它跟之前区别不大，但是我们不要忘了使用 `Box::from_raw` 来清理内存:
```rust
pub fn pop(&mut self) -> Option<T> {
    unsafe {
        if self.head.is_null() {
            None
        } else {
            let head = Box::from_raw(self.head);
            self.head = head.next;

            if self.head.is_null() {
                self.tail = ptr::null_mut();
            }

            Some(head.elem)
        }
    }
}
```

纪念下死去的 `take` 和 `map`，现在我们得手动检查和设置 `null` 了。

然后再实现下析构器，直接循环 `pop` 即可，怎么说，简单可爱，谁不爱呢?
```rust
impl<T> Drop for List<T> {
    fn drop(&mut self) {
        while let Some(_) = self.pop() { }
    }
}
```

现在到了检验正确性的时候:
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

测试没问题，还有一个拦路虎 `miri` 呢。
```rust
MIRIFLAGS="-Zmiri-tag-raw-pointers" cargo +nightly-2022-01-21 miri test

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

苦尽甘来，苦尽甘来啊！我们这些章节的努力没有白费，它终于成功的工作了。