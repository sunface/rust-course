# 数据布局
那么单向链表的队列长什么样？对于栈来说，我们向一端推入( push )元素，然后再从同一端弹出( pop )。对于栈和队列而言，唯一的区别在于队列从末端弹出。

栈的实现类似于下图：
```shell
input list:
[Some(ptr)] -> (A, Some(ptr)) -> (B, None)

stack push X:
[Some(ptr)] -> (X, Some(ptr)) -> (A, Some(ptr)) -> (B, None)

stack pop:
[Some(ptr)] -> (A, Some(ptr)) -> (B, None)
```

由于队列是首端进，末端出，因此我们需要决定将 `push` 和 `pop` 中的哪个放到末端去操作，如果将 `push` 放在末端操作:
```shell
input list:
[Some(ptr)] -> (A, Some(ptr)) -> (B, None)

flipped push X:
[Some(ptr)] -> (A, Some(ptr)) -> (B, Some(ptr)) -> (X, None)
```

而如果将 `pop` 放在末端:
```shell
input list:
[Some(ptr)] -> (A, Some(ptr)) -> (B, Some(ptr)) -> (X, None)

flipped pop:
[Some(ptr)] -> (A, Some(ptr)) -> (B, None)
```

但是这样实现有一个很糟糕的地方：两个操作都需要遍历整个链表后才能完成。队列要求 `push` 和 `pop` 操作需要高效，但是遍历整个链表才能完成的操作怎么看都谈不上高效！

其中一个解决办法就是保存一个指针指向末端:
```rust
use std::mem;

pub struct List<T> {
    head: Link<T>,
    tail: Link<T>, // NEW!
}

type Link<T> = Option<Box<Node<T>>>;

struct Node<T> {
    elem: T,
    next: Link<T>,
}

impl<T> List<T> {
    pub fn new() -> Self {
        List { head: None, tail: None }
    }

    pub fn push(&mut self, elem: T) {
        let new_tail = Box::new(Node {
            elem: elem,
            // 在尾端推入一个新节点时，新节点的下一个节点永远是 None
            next: None,
        });

        // 让 tail 指向新的节点，并返回之前的 old tail
        let old_tail = mem::replace(&mut self.tail, Some(new_tail));

        match old_tail {
            Some(mut old_tail) => {
                // 若 old tail 存在，则让该节点指向新的节点
                old_tail.next = Some(new_tail);
            }
            None => {
                // 否则，将 head 指向新的节点
                self.head = Some(new_tail);
            }
        }
    }
}
```

在之前的各种链表锤炼下，我们对于相关代码应该相当熟悉了，因此可以适当提提速 - 在写的过程中，事实上我碰到了很多错误，这些错误就不再一一列举。

但是如果你担心不再能看到错误，那就纯属多余了:
```shell
$ cargo build

error[E0382]: use of moved value: `new_tail`
  --> src/fifth.rs:38:38
   |
26 |         let new_tail = Box::new(Node {
   |             -------- move occurs because `new_tail` has type `std::boxed::Box<fifth::Node<T>>`, which does not implement the `Copy` trait
...
33 |         let old_tail = mem::replace(&mut self.tail, Some(new_tail));
   |                                                          -------- value moved here
...
38 |                 old_tail.next = Some(new_tail);
   |                                      ^^^^^^^^ value used here after move
```

新鲜出炉的错误，接好！`Box` 并没有实现 `Copy` 特征，因此我们不能在两个地方进行赋值。好在，可以使用没有所有权的引用类型:
```rust
pub struct List<T> {
    head: Link<T>,
    tail: Option<&mut Node<T>>, // NEW!
}

type Link<T> = Option<Box<Node<T>>>;

struct Node<T> {
    elem: T,
    next: Link<T>,
}

impl<T> List<T> {
    pub fn new() -> Self {
        List { head: None, tail: None }
    }

    pub fn push(&mut self, elem: T) {
        let new_tail = Box::new(Node {
            elem: elem,
            next: None,
        });

        let new_tail = match self.tail.take() {
            Some(old_tail) => {
                old_tail.next = Some(new_tail);
                old_tail.next.as_deref_mut()
            }
            None => {
                self.head = Some(new_tail);
                self.head.as_deref_mut()
            }
        };

        self.tail = new_tail;
    }
}
```

```shell
$ cargo build

error[E0106]: missing lifetime specifier
 --> src/fifth.rs:3:18
  |
3 |     tail: Option<&mut Node<T>>, // NEW!
  |                  ^ expected lifetime parameter
```

好吧，结构体中的引用类型需要显式的标注生命周期，先加一个 `'a` 吧:
```rust
pub struct List<'a, T> {
    head: Link<T>,
    tail: Option<&'a mut Node<T>>, // NEW!
}

type Link<T> = Option<Box<Node<T>>>;

struct Node<T> {
    elem: T,
    next: Link<T>,
}

impl<'a, T> List<'a, T> {
    pub fn new() -> Self {
        List { head: None, tail: None }
    }

    pub fn push(&mut self, elem: T) {
        let new_tail = Box::new(Node {
            elem: elem,
            next: None,
        });

        let new_tail = match self.tail.take() {
            Some(old_tail) => {
                old_tail.next = Some(new_tail);
                old_tail.next.as_deref_mut()
            }
            None => {
                self.head = Some(new_tail);
                self.head.as_deref_mut()
            }
        };

        self.tail = new_tail;
    }
}
```

```shell
$ cargo build

error[E0495]: cannot infer an appropriate lifetime for autoref due to conflicting requirements
  --> src/fifth.rs:35:27
   |
35 |                 self.head.as_deref_mut()
   |                           ^^^^^^^^^^^^
   |
note: first, the lifetime cannot outlive the anonymous lifetime #1 defined on the method body at 18:5...
  --> src/fifth.rs:18:5
   |
18 | /     pub fn push(&mut self, elem: T) {
19 | |         let new_tail = Box::new(Node {
20 | |             elem: elem,
21 | |             // When you push onto the tail, your next is always None
...  |
39 | |         self.tail = new_tail;
40 | |     }
   | |_____^
note: ...so that reference does not outlive borrowed content
  --> src/fifth.rs:35:17
   |
35 |                 self.head.as_deref_mut()
   |                 ^^^^^^^^^
note: but, the lifetime must be valid for the lifetime 'a as defined on the impl at 13:6...
  --> src/fifth.rs:13:6
   |
13 | impl<'a, T> List<'a, T> {
   |      ^^
   = note: ...so that the expression is assignable:
           expected std::option::Option<&'a mut fifth::Node<T>>
              found std::option::Option<&mut fifth::Node<T>>
```

好长... Rust 为啥这么难... 但是，这里有一句重点:

> the lifetime must be valid for the lifetime 'a as defined on the impl

意思是说生命周期至少要和 `'a` 一样长，是不是因为编译器为 `self` 推导的生命周期不够长呢？我们试着来手动标注下:
```rust
pub fn push(&'a mut self, elem: T) {
```

当当当当，成功通过编译:
```shell
$ cargo build

warning: field is never used: `elem`
 --> src/fifth.rs:9:5
  |
9 |     elem: T,
  |     ^^^^^^^
  |
  = note: #[warn(dead_code)] on by default
```

这个错误可以称之为错误之王，但是我们依然成功的解决了它，太棒了！再来实现下 `pop`:
```rust
pub fn pop(&'a mut self) -> Option<T> {
    self.head.take().map(|head| {
        let head = *head;
        self.head = head.next;

        if self.head.is_none() {
            self.tail = None;
        }

        head.elem
    })
}
```

看起来不错，写几个测试用例溜一溜:
```rust
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
    }
}
```
```shell
$ cargo test

error[E0499]: cannot borrow `list` as mutable more than once at a time
  --> src/fifth.rs:68:9
   |
65 |         assert_eq!(list.pop(), None);
   |                    ---- first mutable borrow occurs here
...
68 |         list.push(1);
   |         ^^^^
   |         |
   |         second mutable borrow occurs here
   |         first borrow later used here

error[E0499]: cannot borrow `list` as mutable more than once at a time
  --> src/fifth.rs:69:9
   |
65 |         assert_eq!(list.pop(), None);
   |                    ---- first mutable borrow occurs here
...
69 |         list.push(2);
   |         ^^^^
   |         |
   |         second mutable borrow occurs here
   |         first borrow later used here

error[E0499]: cannot borrow `list` as mutable more than once at a time
  --> src/fifth.rs:70:9
   |
65 |         assert_eq!(list.pop(), None);
   |                    ---- first mutable borrow occurs here
...
70 |         list.push(3);
   |         ^^^^
   |         |
   |         second mutable borrow occurs here
   |         first borrow later used here


....

** WAY MORE LINES OF ERRORS **

....

error: aborting due to 11 previous errors
```

🙀🙀🙀，震惊！但编译器真的没错，因为都是我们刚才那个标记惹的祸。

我们为 `self` 标记了 `'a`，意味着在 `'a` 结束前，无法再去使用 `self`，大家可以自己推断下 `'a` 的生命周期是多长。

那么该怎么办？回到老路 `RefCell` 上？显然不可能，那只能祭出大杀器：裸指针。

> 事实上，上文的问题主要是自引用引起的，感兴趣的同学可以查看[这里](https://beatai.org/rust-course/advance/circle-self-ref/intro)深入阅读。

```rust
pub struct List<T> {
    head: Link<T>,
    tail: *mut Node<T>, // DANGER DANGER
}

type Link<T> = Option<Box<Node<T>>>;

struct Node<T> {
    elem: T,
    next: Link<T>,
}
```

如上所示，当使用裸指针后， `head` 和 `tail` 就不会形成自引用的问题，也不再违反 Rust 严苛的借用规则。

> 注意！当前的实现依然是有严重问题的，在后面我们会修复

果然，编程的最高境界就是回归本质：使用 C 语言的东东。