# 一些收尾工作以及最终代码
在之前的章节中，我们完成了 Bad 单链表栈的数据定义和基本操作，下面一起来写一些测试代码。


## 单元测试
> 关于如何编写测试，请参见[自动化测试章节](https://course.rs/test/write-tests.html)

首先，单元测试代码要放在待测试的目标代码旁边，也就是同一个文件中:
```rust
// in first.rs
#[cfg(test)]
mod test {
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
        assert_eq!(list.pop(), Some(3));
        assert_eq!(list.pop(), Some(2));

        // Push some more just to make sure nothing's corrupted
        list.push(4);
        list.push(5);

        // Check normal removal
        assert_eq!(list.pop(), Some(5));
        assert_eq!(list.pop(), Some(4));

        // Check exhaustion
        assert_eq!(list.pop(), Some(1));
        assert_eq!(list.pop(), None);
    }
}
```

在 `src/first.rs` 中添加以上测试模块，然后使用 `cargo test` 运行相关的测试用例：
```shell
> cargo test

error[E0433]: failed to resolve: use of undeclared type or module `List`
  --> src/first.rs:43:24
   |
43 |         let mut list = List::new();
   |                        ^^^^ use of undeclared type or module `List`

```

Ooops! 报错了，从错误内容来看，是因为我们在一个不同的模块 `test` 中，引入了 `first` 模块中的代码，由于前者是后者的子模块，因此可以使用以下方式引入 `first` 模块中的 `List` 定义:
```rust
#[cfg(test)]
mod test {
    use super::List;
    // 其它代码保持不变
}
```

大家可以再次尝试使用 `cargo test` 运行测试用例，具体的结果就不再展开，关于结果的解读，请参看文章开头的链接。

## Drop
现在还有一个问题，我们是否需要手动来清理释放我们的链表？答案是 No，因为 Rust 为我们提供了 `Drop` 特征，若变量实现了该特征，则在它离开作用域时将自动调用解构函数以实现资源清理释放工作，最妙的是，这一切都发生在编译期，因此没有多余的性能开销。

> 关于 Drop 特征的详细介绍，请参见[智能指针 - Drop](https://course.rs/advance/smart-pointer/drop.html)

事实上，我们无需手动为自定义类型实现 `Drop` 特征，原因是 Rust 自动为几乎所有类型都实现了 `Drop`，例如我们自定义的结构体，只要结构体的所有字段都实现了 `Drop`，那结构体也会自动实现 `Drop` !

但是，有的时候这种自动实现可能不够优秀，例如考虑以下链表:
```shell
list -> A -> B -> C
```

当 `List` 被自动 `drop` 后，接着会去尝试 `Drop` A，然后是 `B`，最后是 `C`。这个时候，其中一部分读者可能会紧张起来，因此这其实是一段递归代码，可能会直接撑爆我们的 stack 栈。

例如以下的测试代码会试图创建一个很长的链表，然后会导致栈溢出错误:
```rust
```rust, ignore
#[test]
fn long_list() {
    let mut list = List::new();
    for i in 0..100000 {
        list.push(i);
    }
    drop(list);
}
```


```shell
thread 'first::test::long_list' has overflowed its stack
```

可能另一部分同学会想 "这显然是[尾递归](https://zh.wikipedia.org/wiki/尾调用)，一个靠谱的编程语言是不会让尾递归撑爆我们的 stack"。然后，这个想法并不正确，下面让我们尝试模拟编译器来看看 `Drop` 会如何实现:
```rust
impl Drop for List {
    fn drop(&mut self) {
        // NOTE: 在 Rust 代码中，我们不能显式的调用 `drop` 方法，只能调用 std::mem::drop 函数
        // 这里只是在模拟编译器!
        self.head.drop(); // 尾递归 - good!
    }
}

impl Drop for Link {
    fn drop(&mut self) {
        match *self {
            Link::Empty => {} // Done!
            Link::More(ref mut boxed_node) => {
                boxed_node.drop(); // 尾递归 - good!
            }
        }
    }
}

impl Drop for Box<Node> {
    fn drop(&mut self) {
        self.ptr.drop(); // 糟糕，这里不是尾递归!
        deallocate(self.ptr); // 不是尾递归的原因是在 `drop` 后，还有额外的操作
    }
}

impl Drop for Node {
    fn drop(&mut self) {
        self.next.drop();
    }
}
```

从上面的代码和注释可以看出为 `Box<Node>` 实现的 `drop` 方法中，在 `self.ptr.drop` 后调用的 `deallocate` 会导致非尾递归的情况发生。

因此我们需要手动为 `List` 实现 `Drop` 特征:
```rust
impl Drop for List {
    fn drop(&mut self) {
        let mut cur_link = mem::replace(&mut self.head, Link::Empty);
        while let Link::More(mut boxed_node) = cur_link {
            cur_link = mem::replace(&mut boxed_node.next, Link::Empty);
            // boxed_node 在这里超出作用域并被 drop,
            // 由于它的 `next` 字段拥有的 `Node` 被设置为 Link::Empty,
            // 因此这里并不会有无边界的递归发生
        }
    }
}
```

测试下上面的实现以及之前的长链表例子:
```shell
> cargo test

     Running target/debug/lists-5c71138492ad4b4a

running 2 tests
test first::test::basics ... ok
test first::test::long_list ... ok

test result: ok. 2 passed; 0 failed; 0 ignored; 0 measured
```

完美！

<span style="float:left"><img src="https://rust-unofficial.github.io/too-many-lists/img/profbee.gif" /></span>

#### 提前优化的好处!

事实上，我们在这里做了提前优化，否则可以使用 `while let Some(_) = self.pop() { }`, 这种实现显然更加简单. 那么问题来了：它们的区别是什么，有哪些性能上的好处？特别是在链表不仅仅支持 `i32` 时。

<details>
  <summary>点击这里展开答案</summary>

`self.pop()` 的会返回 `Option<i32>`, 而我们之前的实现仅仅对智能指针 `Box<Node>` 进行操作。前者会对值进行拷贝，而后者仅仅使用的是指针类型。

当链表中包含的值是其他较大的类型时，那这个拷贝的开销将变得非常高昂。
</details>

## 最终代码
```rust
use std::mem;

pub struct List {
    head: Link,
}

enum Link {
    Empty,
    More(Box<Node>),
}

struct Node {
    elem: i32,
    next: Link,
}

impl List {
    pub fn new() -> Self {
        List { head: Link::Empty }
    }

    pub fn push(&mut self, elem: i32) {
        let new_node = Box::new(Node {
            elem: elem,
            next: mem::replace(&mut self.head, Link::Empty),
        });

        self.head = Link::More(new_node);
    }

    pub fn pop(&mut self) -> Option<i32> {
        match mem::replace(&mut self.head, Link::Empty) {
            Link::Empty => None,
            Link::More(node) => {
                self.head = node.next;
                Some(node.elem)
            }
        }
    }
}

impl Drop for List {
    fn drop(&mut self) {
        let mut cur_link = mem::replace(&mut self.head, Link::Empty);

        while let Link::More(mut boxed_node) = cur_link {
            cur_link = mem::replace(&mut boxed_node.next, Link::Empty);
        }
    }
}

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
        assert_eq!(list.pop(), Some(3));
        assert_eq!(list.pop(), Some(2));

        // Push some more just to make sure nothing's corrupted
        list.push(4);
        list.push(5);

        // Check normal removal
        assert_eq!(list.pop(), Some(5));
        assert_eq!(list.pop(), Some(4));

        // Check exhaustion
        assert_eq!(list.pop(), Some(1));
        assert_eq!(list.pop(), None);
    }
}
```

从代码行数也可以看出，我们实现的肯定不是一个精致的链表：总共只有 80 行代码，其中一半还是测试！

但是万事开头难，既然开了一个好头，那接下来我们一鼓作气，继续看看更精致的链表长什么样。