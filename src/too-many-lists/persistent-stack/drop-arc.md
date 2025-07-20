# Drop、Arc 及完整代码

## Drop
与之前链表存在的问题相似，新的链表也有递归的问题。下面是之前的解决方法:
```rust
impl<T> Drop for List<T> {
    fn drop(&mut self) {
        let mut cur_link = self.head.take();
        while let Some(mut boxed_node) = cur_link {
            cur_link = boxed_node.next.take();
        }
    }
}
```

但是 `boxed_node.next.take()` 的方式在新的链表中无法使用，因为我们没办法去修改 `Rc` 持有的值。

考虑一下相关的逻辑，可以发现，如果当前的节点仅被当前链表所引用(Rc 的引用计数为 1)，那该节点是可以安全 `drop` 的: 
```rust
impl<T> Drop for List<T> {
    fn drop(&mut self) {
        let mut head = self.head.take();
        while let Some(node) = head {
            if let Ok(mut node) = Rc::try_unwrap(node) {
                head = node.next.take();
            } else {
                break;
            }
        }
    }
}
```

这里有一个没见过的方法 `Rc::try_unwrap` ，该方法会判断当前的 `Rc` 是否只有一个强引用，若是，则返回 `Rc` 持有的值，否则返回一个错误。

可以看出，我们会一直 drop 到第一个被其它链表所引用的节点：
```shell
list1 -> A ---+
              |
              v
list2 ------> B -> C -> D
              ^
              |
list3 -> X ---+
```

例如如果要 drop `List2`，那会从头节点开始一直 drop 到 `B` 节点时停止，剩余的 `B -> C -> D` 三个节点由于引用计数不为 1 (同时被多个链表引用) ，因此不会被 drop。


测试下新的代码:
```shell
$ cargo test

   Compiling lists v0.1.0 (/Users/ABeingessner/dev/too-many-lists/lists)
    Finished dev [unoptimized + debuginfo] target(s) in 1.10s
     Running /Users/ABeingessner/dev/too-many-lists/lists/target/debug/deps/lists-86544f1d97438f1f

running 8 tests
test first::test::basics ... ok
test second::test::basics ... ok
test second::test::into_iter ... ok
test second::test::iter ... ok
test second::test::iter_mut ... ok
test second::test::peek ... ok
test third::test::basics ... ok
test third::test::iter ... ok

test result: ok. 8 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

完美通过，下面再来考虑一个问题，如果我们的链表要在多线程环境使用该怎么办？

## Arc
不可变链表的一个很大的好处就在于多线程访问时自带安全性，毕竟共享可变性是多线程危险的源泉，最好也是最简单的解决办法就是直接干掉可变性。

但是 `Rc<T>` 本身并不是线程安全的，原因在之前的章节也有讲：它内部的引用计数器并不是线程安全的，通俗来讲，计数器没有加锁也没有实现原子性。

再结合之前章节学过的内容，绝大部分同学应该都能想到, `Arc<T>` 就是我们的最终答案。

那么还有一个问题，我们怎么知道一个类型是不是类型安全？会不会在多线程误用了非线程安全的类型呢？这就是 Rust 安全性的另一个强大之处：Rust 通过提供 `Send` 和 `Sync` 两个特征来保证线程安全。

> 关于 `Send` 和 `Sync` 的详细介绍，请参见[此章节](https://course.rs/advance/concurrency-with-threads/send-sync.html)

## 完整代码
又到了喜闻乐见的环节，新链表的代码相比之前反而还更简单了，不可变就是香！

```rust
use std::rc::Rc;

pub struct List<T> {
    head: Link<T>,
}

type Link<T> = Option<Rc<Node<T>>>;

struct Node<T> {
    elem: T,
    next: Link<T>,
}

impl<T> List<T> {
    pub fn new() -> Self {
        List { head: None }
    }

    pub fn prepend(&self, elem: T) -> List<T> {
        List { head: Some(Rc::new(Node {
            elem: elem,
            next: self.head.clone(),
        }))}
    }

    pub fn tail(&self) -> List<T> {
        List { head: self.head.as_ref().and_then(|node| node.next.clone()) }
    }

    pub fn head(&self) -> Option<&T> {
        self.head.as_ref().map(|node| &node.elem)
    }

    pub fn iter(&self) -> Iter<'_, T> {
        Iter { next: self.head.as_deref() }
    }
}

impl<T> Drop for List<T> {
    fn drop(&mut self) {
        let mut head = self.head.take();
        while let Some(node) = head {
            if let Ok(mut node) = Rc::try_unwrap(node) {
                head = node.next.take();
            } else {
                break;
            }
        }
    }
}

pub struct Iter<'a, T> {
    next: Option<&'a Node<T>>,
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

#[cfg(test)]
mod test {
    use super::List;

    #[test]
    fn basics() {
        let list = List::new();
        assert_eq!(list.head(), None);

        let list = list.prepend(1).prepend(2).prepend(3);
        assert_eq!(list.head(), Some(&3));

        let list = list.tail();
        assert_eq!(list.head(), Some(&2));

        let list = list.tail();
        assert_eq!(list.head(), Some(&1));

        let list = list.tail();
        assert_eq!(list.head(), None);

        // Make sure empty tail works
        let list = list.tail();
        assert_eq!(list.head(), None);
    }

    #[test]
    fn iter() {
        let list = List::new().prepend(1).prepend(2).prepend(3);

        let mut iter = list.iter();
        assert_eq!(iter.next(), Some(&3));
        assert_eq!(iter.next(), Some(&2));
        assert_eq!(iter.next(), Some(&1));
    }
}
```
