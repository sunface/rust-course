# 优化类型定义
首先，我们需要优化下类型的定义，可能一部分同学已经觉得之前的类型定义相当不错了，但是如果大家仔细观察下 `Link`:
```rust
enum Link {
    Empty,
    More(Box<Node>),
}
```

会发现，它其实跟 `Option<Box<Node>>` 非常类似。

## Option
但是为了代码可读性，我们不能直接使用这个冗长的类型，否则代码中将充斥着 `Option<Box<Node>>` 这种令人难堪的类型，为此可以使用类型别名。首先，将之前的代码使用新的 `Link` 进行修改：
```rust
use std::mem;

pub struct List {
    head: Link,
}

// 类型别名，type alias
type Link = Option<Box<Node>>;

struct Node {
    elem: i32,
    next: Link,
}

impl List {
    pub fn new() -> Self {
        List { head: None }
    }

    pub fn push(&mut self, elem: i32) {
        let new_node = Box::new(Node {
            elem: elem,
            next: mem::replace(&mut self.head, None),
        });

        self.head = Some(new_node);
    }

    pub fn pop(&mut self) -> Option<i32> {
        match mem::replace(&mut self.head, None) {
            None => None,
            Some(node) => {
                self.head = node.next;
                Some(node.elem)
            }
        }
    }
}

impl Drop for List {
    fn drop(&mut self) {
        let mut cur_link = mem::replace(&mut self.head, None);
        while let Some(mut boxed_node) = cur_link {
            cur_link = mem::replace(&mut boxed_node.next, None);
        }
    }
}
```

代码看上去稍微好了一些，但是 `Option` 的好处远不止这些。

首先，之前咱们用到了 `mem::replace` 这个让人胆战心惊但是又非常有用的函数，而 `Option` 直接提供了一个方法 `take` 用于替代它: 
```rust
pub struct List {
    head: Link,
}

type Link = Option<Box<Node>>;

struct Node {
    elem: i32,
    next: Link,
}

impl List {
    pub fn new() -> Self {
        List { head: None }
    }

    pub fn push(&mut self, elem: i32) {
        let new_node = Box::new(Node {
            elem: elem,
            next: self.head.take(),
        });

        self.head = Some(new_node);
    }

    pub fn pop(&mut self) -> Option<i32> {
        match self.head.take() {
            None => None,
            Some(node) => {
                self.head = node.next;
                Some(node.elem)
            }
        }
    }
}

impl Drop for List {
    fn drop(&mut self) {
        let mut cur_link = self.head.take();
        while let Some(mut boxed_node) = cur_link {
            cur_link = boxed_node.next.take();
        }
    }
}
```

其次，`match option { None => None, Some(x) => Some(y) }` 这段代码可以直接使用 `map` 方法代替，`map` 会对 `Some(x)` 中的值进行映射，最终返回一个新的 `Some(y)` 值。

> 我们往往将闭包作为参数传递给 map 方法，关于闭包可以参见[此章](https://course.rs/advance/functional-programing/closure.html)

```rust
pub fn pop(&mut self) -> Option<i32> {
    self.head.take().map(|node| {
        self.head = node.next;
        node.elem
    })
}
```

不错，看上去简洁了很多，下面运行下测试代码确保链表依然可以正常运行(这就是 TDD 的优点！) :
```shell
> cargo test

     Running target/debug/lists-5c71138492ad4b4a

running 2 tests
test first::test::basics ... ok
test second::test::basics ... ok

test result: ok. 2 passed; 0 failed; 0 ignored; 0 measured
```

很棒，接下来让我们来解决目前链表最大的问题：只支持 `i32` 类型的元素值。

## 泛型
为了让链表支持任何类型的元素，泛型就是绕不过去的坎，首先将所有的类型定义修改为泛型实现：
```rust
pub struct List<T> {
    head: Link<T>,
}

type Link<T> = Option<Box<Node<T>>>;

struct Node<T> {
    elem: T,
    next: Link<T>,
}

impl<T> List<T> {
    pub fn new() -> Self {
        List { head: None }
    }

    pub fn push(&mut self, elem: T) {
        let new_node = Box::new(Node {
            elem: elem,
            next: self.head.take(),
        });

        self.head = Some(new_node);
    }

    pub fn pop(&mut self) -> Option<T> {
        self.head.take().map(|node| {
            self.head = node.next;
            node.elem
        })
    }
}

impl<T> Drop for List<T> {
    fn drop(&mut self) {
        let mut cur_link = self.head.take();
        while let Some(mut boxed_node) = cur_link {
            cur_link = boxed_node.next.take();
        }
    }
}
```

大家在修改了 `List` 的定义后，别忘了将 `impl` 中的 `List` 修改为 `List<T>`，切记**泛型参数也是类型定义的一部分**。

```shell
> cargo test

     Running target/debug/lists-5c71138492ad4b4a

running 2 tests
test first::test::basics ... ok
test second::test::basics ... ok

test result: ok. 2 passed; 0 failed; 0 ignored; 0 measured
```

如上所示，截至目前，测试用例依然运行良好，尽管我们把代码修改成了更加复杂的泛型。这里有一个点特别值得注意，我们并没有修改关联函数 `new` ：
```rust
pub fn new() -> Self {
    List { head: None }
}
```

原因是 `Self` 承载了我们所有的荣耀，`List` 时，`Self` 就代表 `List`，当变成 `List<T>` 时，`Self` 也随之变化，代表 `List<T>`，可以看出使用它可以让未来的代码重构变得更加简单。

