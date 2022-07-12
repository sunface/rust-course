# 栈上的链表
在之前的章节中，无一例外，我们创建的都是数据存储在堆上的链表，这种链表最常见也最实用：堆内存在动态分配的场景非常好用。

但是，既然是高级技巧章节，那栈链表也应该拥有一席之地。但与堆内存的简单分配相比，栈内存就没那么友好了，你们猜大名鼎鼎的 C 语言的 `alloca` 是因为什么而出名的 :)

限于章节篇幅，这里我们使用一个简单的栈分配方法：调用一个函数，获取一个新的、拥有更多空间的栈帧。说实话，该解决方法要多愚蠢有多愚蠢，但是它确实相当实用，甚至...有用。

任何时候，当我们在做一些递归的任务时，都可以将当前步骤状态的指针传递给下一个步骤。如果指针本身就是状态的一部分，那恭喜你：你在创建一个栈上分配的链表！

新的链表类型本身就是一个 Node，并且包含一个引用指向另一个 Node:
```rust
pub struct List<'a, T> {
    pub data: T,
    pub prev: Option<&'a List<'a, T>>,
}
```

该链表只有一个操作 `push`，需要注意的是，跟其它链表不同，这里的 `push` 是通过回调的方式来完成新元素推入，并将回调返回的值直接返回给 `push` 的调用者:
```rust
impl<'a, T> List<'a, T> {
    pub fn push<U>(
        prev: Option<&'a List<'a, T>>, 
        data: T, 
        callback: impl FnOnce(&List<'a, T>) -> U,
    ) -> U {
        let list = List { data, prev };
        callback(&list)
    }
}
```

搞定，提前问一句：你见过回调地狱吗？
```rust
List::push(None, 3, |list| {
    println!("{}", list.data);
    List::push(Some(list), 5, |list| {
        println!("{}", list.data);
        List::push(Some(list), 13, |list| {
            println!("{}", list.data);
        })
    })
})
```

不禁让人感叹，这段回调代码多么的美丽动人😿。

用户还可以简单地使用 `while-let` 的方式来编译遍历链表，但是为了增加一些趣味，咱们还是继续使用迭代器:
```rust
impl<'a, T> List<'a, T> {
    pub fn iter(&'a self) -> Iter<'a, T> {
        Iter { next: Some(self) }
    }
}

impl<'a, T> Iterator for Iter<'a, T> {
    type Item = &'a T;

    fn next(&mut self) -> Option<Self::Item> {
        self.next.map(|node| {
            self.next = node.prev;
            &node.data
        })
    }
}
```

测试下：
```rust
#[cfg(test)]
mod test {
    use super::List;

    #[test]
    fn elegance() {
        List::push(None, 3, |list| {
            assert_eq!(list.iter().copied().sum::<i32>(), 3);
            List::push(Some(list), 5, |list| {
                assert_eq!(list.iter().copied().sum::<i32>(), 5 + 3);
                List::push(Some(list), 13, |list| {
                    assert_eq!(list.iter().copied().sum::<i32>(), 13 + 5 + 3);
                })
            })
        })
    }
}
```
```shell
$ cargo test

running 18 tests
test fifth::test::into_iter ... ok
test fifth::test::iter ... ok
test fifth::test::iter_mut ... ok
test fifth::test::basics ... ok
test fifth::test::miri_food ... ok
test first::test::basics ... ok
test second::test::into_iter ... ok
test fourth::test::peek ... ok
test fourth::test::into_iter ... ok
test second::test::iter_mut ... ok
test fourth::test::basics ... ok
test second::test::basics ... ok
test second::test::iter ... ok
test third::test::basics ... ok
test silly1::test::walk_aboot ... ok
test silly2::test::elegance ... ok
test second::test::peek ... ok
test third::test::iter ... ok

test result: ok. 18 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out;
```

部分读者此时可能会有一些大胆的想法：咦？我能否修改 Node 中的值？大胆但貌似可行，不妨来试试。
```rust
pub struct List<'a, T> {
    pub data: T,
    pub prev: Option<&'a mut List<'a, T>>,
}

pub struct Iter<'a, T> {
    next: Option<&'a List<'a, T>>,
}

impl<'a, T> List<'a, T> {
    pub fn push<U>(
        prev: Option<&'a mut List<'a, T>>, 
        data: T, 
        callback: impl FnOnce(&mut List<'a, T>) -> U,
    ) -> U {
        let mut list = List { data, prev };
        callback(&mut list)
    }

    pub fn iter(&'a self) -> Iter<'a, T> {
        Iter { next: Some(self) }
    }
}

impl<'a, T> Iterator for Iter<'a, T> {
    type Item = &'a T;

    fn next(&mut self) -> Option<Self::Item> {
        self.next.map(|node| {
            self.next = node.prev.as_ref().map(|prev| &**prev);
            &node.data
        })
    }
}
```

```shell
$ cargo test

error[E0521]: borrowed data escapes outside of closure
  --> src\silly2.rs:47:32
   |
46 |  List::push(Some(list), 13, |list| {
   |                              ----
   |                              |
   |              `list` declared here, outside of the closure body
   |              `list` is a reference that is only valid in the closure body
47 |      assert_eq!(list.iter().copied().sum::<i32>(), 13 + 5 + 3);
   |                 ^^^^^^^^^^^ `list` escapes the closure body here

error[E0521]: borrowed data escapes outside of closure
  --> src\silly2.rs:45:28
   |
44 |  List::push(Some(list), 5, |list| {
   |                             ----
   |                             |
   |              `list` declared here, outside of the closure body
   |              `list` is a reference that is only valid in the closure body
45 |      assert_eq!(list.iter().copied().sum::<i32>(), 5 + 3);
   |                 ^^^^^^^^^^^ `list` escapes the closure body here


<ad infinitum>
```

嗯，没想到是浓眉大眼的迭代器背叛了我们，为了验证到底是哪里出了问题，我们来修改下测试:
```rust
#[test]
fn elegance() {
    List::push(None, 3, |list| {
        assert_eq!(list.data, 3);
        List::push(Some(list), 5, |list| {
            assert_eq!(list.data, 5);
            List::push(Some(list), 13, |list| {
                assert_eq!(list.data, 13);
            })
        })
    })
}
```

```shell
$ cargo test

error[E0521]: borrowed data escapes outside of closure
  --> src\silly2.rs:46:17
   |
44 |   List::push(Some(list), 5, |list| {
   |                              ----
   |                              |
   |              `list` declared here, outside of the closure body
   |              `list` is a reference that is only valid in the closure body
45 |       assert_eq!(list.data, 5);
46 | /     List::push(Some(list), 13, |list| {
47 | |         assert_eq!(list.data, 13);
48 | |     })
   | |______^ `list` escapes the closure body here

error[E0521]: borrowed data escapes outside of closure
  --> src\silly2.rs:44:13
   |
42 |   List::push(None, 3, |list| {
   |                        ----
   |                        |
   |              `list` declared here, outside of the closure body
   |              `list` is a reference that is only valid in the closure body
43 |       assert_eq!(list.data, 3);
44 | /     List::push(Some(list), 5, |list| {
45 | |         assert_eq!(list.data, 5);
46 | |         List::push(Some(list), 13, |list| {
47 | |             assert_eq!(list.data, 13);
48 | |         })
49 | |     })
   | |______________^ `list` escapes the closure body here
```

原因在于我们的链表不小心依赖了<ruby>型变<rt>variance</rt></ruby>。型变是一个[相当复杂的概念](https://doc.rust-lang.org/nomicon/subtyping.html)，下面来简单了解下。

每一个节点( Node )都包含一个引用，该引用指向另一个节点， 且这两个节点是同一个类型。如果从最里面的节点角度来看，那所有外部的节点都在使用和它一样的生命周期，但这个显然是不对的：链表中的每一个节点都会比它指向的节点活得更久，因为它们的作用域是嵌套存在的。

那之前的不可变引用版本为何可以正常工作呢？原因是在大多数时候，编译器都能自己判断：虽然某些东东活得太久了，但是这是安全的。当我们把一个 List 塞入另一个时，编译器会迅速将生命周期进行收缩以满足新的 List 的需求，**这种生命周期收缩就是一种型变**。

如果大家还是觉得不太理解，我们来考虑下其它拥有继承特性的编程语言。在该语言中，当你将一个 `Cat` 传递给需要 `Animal` 的地方时( `Animal` 是 `Cat` 的父类型)，型变就发生了。从字面来说，将一只猫传给需要动物的地方，也是合适的，毕竟猫确实是动物的一种。

总之，可以看出无论是从大的生命周期收缩为小的生命周期，还是从 `Cat` 到 `Animal`，型变的典型特征就是：范围在减小，毕竟子类型的功能肯定是比父类型多的。

既然有型变，为何可变引用的版本会报错呢？其实在于型变不总是安全的，假如之前的代码可以编译，那我们可以写出<ruby>释放后再使用<rt>use-after-free</rt></ruby> 的代码:
```rust
List::push(None, 3, |list| {
    List::push(Some(list), 5, |list| {
        List::push(Some(list), 13, |list| {
            // 哈哈，好爽，由于所有的生命周期都是相同的，因此编译器允许我重写父节点，并让它持有一个可变指针指向我自己。
            // 我将创建所有的 use-after-free !
            *list.prev.as_mut().unwrap().prev = Some(list);
        })
    })
})
```

一旦引入可变性，型变就会造成这样的隐患：意外修改了不该被修改的代码，但这些代码的调用者还在期待着和往常一样的结果！例如以下例子：
```rust
let mut my_kitty = Cat;                  // Make a Cat (long lifetime)
let animal: &mut Animal = &mut my_kitty; // Forget it's a Cat (shorten lifetime)
*animal = Dog;                           // Write a Dog (short lifetime)
my_kitty.meow();                         // Meowing Dog! (Use After Free)
```

我们将长生命周期的猫转换成短生命周期的动物，可变的！然后通过短生命周期的动物将指针重新指向一只狗。此时我们想去撸软萌猫的时候，就听到：`旺旺...呜嗷嗷嗷`，对，你没听错，不仅没有了猫叫，甚至于狗还没叫完，就可能在某个地方又被修改成狼了。

因此，**虽然你可以修改可变引用的生命周期，但是一旦开始嵌套，它们就将失去型变，变成`不变( invariant )`**。此时，就再也无法对生命周期进行收缩了。

具体来说: `&mut &'big mut T` 无法被转换成 `&mut &'small mut T`，这里 `'big` 代表比 `'small` 更大的生命周期。或者用更正式的说法：`&'a mut T` 对于 `'a` 来说是协变( `covariant` )的，但是对于 `T` 是不变的( `invariant` )。

---

说了这么多高深的理论，那么该如何改变链表的数据呢？答案就是：使用老本行 - 内部可变性。

下面让我们回滚到之前的不可变版本，然后使用 `Cell` 来替代 `&mut`。
```rust
#[test]
fn cell() {
    use std::cell::Cell;

    List::push(None, Cell::new(3), |list| {
        List::push(Some(list), Cell::new(5), |list| {
            List::push(Some(list), Cell::new(13), |list| {
                // Multiply every value in the list by 10
                for val in list.iter() {
                    val.set(val.get() * 10)
                }

                let mut vals = list.iter();
                assert_eq!(vals.next().unwrap().get(), 130);
                assert_eq!(vals.next().unwrap().get(), 50);
                assert_eq!(vals.next().unwrap().get(), 30);
                assert_eq!(vals.next(), None);
                assert_eq!(vals.next(), None);
            })
        })
    })
}
```

```shell
$ cargo test

running 19 tests
test fifth::test::into_iter ... ok
test fifth::test::basics ... ok
test fifth::test::iter_mut ... ok
test fifth::test::iter ... ok
test fourth::test::basics ... ok
test fourth::test::into_iter ... ok
test second::test::into_iter ... ok
test first::test::basics ... ok
test fourth::test::peek ... ok
test second::test::basics ... ok
test fifth::test::miri_food ... ok
test silly2::test::cell ... ok
test third::test::iter ... ok
test second::test::iter_mut ... ok
test second::test::peek ... ok
test silly1::test::walk_aboot ... ok
test silly2::test::elegance ... ok
test third::test::basics ... ok
test second::test::iter ... ok

test result: ok. 19 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out;
```

简简单单搞定，虽然之前我们嫌弃内部可变性，但是在这里：真香！