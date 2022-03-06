# 无处不在的迭代器

Rust 的迭代器无处不在，直至你在它上面栽了跟头，经过深入调查才发现：哦，原来是迭代器的锅。不信的话，看看这个报错你能想到是迭代器的问题吗: `borrow of moved value: words`.

## 报错的代码

以下的代码非常简单，用来统计文本中字词的数量，并打印出来：

```rust
fn main() {
    let s = "hello world";
    let mut words = s.split(" ");
    let n = words.count();
    println!("{:?}",words);
}
```

四行代码，行云流水，一气呵成，且看成效：

```console
error[E0382]: borrow of moved value: `words`
   --> src/main.rs:5:21
    |
3   |     let mut words = s.split(" ");
    |         --------- move occurs because `words` has type `std::str::Split<'_, &str>`, which does not implement the `Copy` trait
4   |     let n = words.count();
    |                   ------- `words` moved due to this method call
5   |     println!("{:?}",words);
    |                     ^^^^^ value borrowed here after move
```

世事难料，我以为只有的生命周期、闭包才容易背叛革命，没想到一个你浓眉大眼的`count`方法也背叛革命。从报错来看，是因为`count`方法拿走了`words`的所有权，来看看签名：

```rust
fn count(self) -> usize
```

从签名来看，编译器的报错是正确的，但是为什么？为什么一个简单的标准库`count`方法就敢拿走所有权？

## 迭代器回顾

在[迭代器](../advance/functional-programing/iterator.md#消费者与适配器)章节中，我们曾经学习过两个概念：迭代器适配器和消费者适配器，前者用于对迭代器中的元素进行操作，最终生成一个新的迭代器，例如`map`、`filter`等方法；而后者用于消费掉迭代器，最终产生一个结果，例如`collect`方法, 一个典型的示例如下：

```rust
let v1: Vec<i32> = vec![1, 2, 3];

let v2: Vec<_> = v1.iter().map(|x| x + 1).collect();

assert_eq!(v2, vec![2, 3, 4]);
```

在其中，我们还提到一个细节，消费者适配器会拿走迭代器的所有权，那么这个是否与我们最开始碰到的问题有关系？

## 深入调查

要解释这个问题，必须要找到`words`是消费者适配器的证据，因此我们需要深入源码进行查看。

其实。。也不需要多深，只要进入`words`的源码，就能看出它属于`Iterator`特征，那说明`split`方法产生了一个迭代器？再来看看：

```rust
pub fn split<'a, P>(&'a self, pat: P) -> Split<'a, P>
where
    P: Pattern<'a>,
//An iterator over substrings of this string slice, separated by characters matched by a pattern.
```

还真是，从代码注释来看，`Split`就是一个迭代器类型，用来迭代被分隔符隔开的子字符串集合。

真相大白了，`split`产生一个迭代器，而`count`方法是一个消费者适配器，用于消耗掉前者产生的迭代器，最终生成字词统计的结果。

本身问题不复杂，但是在**解决方法上，可能还有点在各位客官的意料之外**，且看下文。

## 最 rusty 的解决方法

你可能会想用`collect`来解决这个问题，先收集成一个集合，然后进行统计。当然此方法完全可行，但是很不`rusty`(很符合 rust 规范、潮流的意思)，以下给出最`rusty`的解决方案：

```rust
let words = s.split(",");
let n = words.clone().count();
```

在继续之前，我得先找一个地方藏好，因为俺有一个感觉，烂西红柿正在铺天盖地的呼啸而来，伴随而来的是读者的正义呵斥：
**你管`clone`叫最好、最`rusty`的解决方法？？**

大家且听我慢慢道来，事实上，在 Rust 中`clone`不总是性能低下的代名词，因为`clone`的行为完全取决于它的具体实现。

#### 迭代器的`clone`代价

对于迭代器而言，它其实并不需要持有数据才能进行迭代，事实上它包含一个引用，该引用指向了保存在堆上的数据，而迭代器自身的结构是保存在栈上。

因此对迭代器的`clone`仅仅是复制了一份栈上的简单结构，性能非常高效，例如:

```rust
pub struct Split<'a, T: 'a, P>
where
    P: FnMut(&T) -> bool,
{
    // Used for `SplitWhitespace` and `SplitAsciiWhitespace` `as_str` methods
    pub(crate) v: &'a [T],
    pred: P,
    // Used for `SplitAsciiWhitespace` `as_str` method
    pub(crate) finished: bool,
}

impl<T, P> Clone for Split<'_, T, P>
where
    P: Clone + FnMut(&T) -> bool,
{
    fn clone(&self) -> Self {
        Split { v: self.v, pred: self.pred.clone(), finished: self.finished }
    }
}
```

以上代码实现了对`Split`迭代器的克隆，可以看出，底层的的数组`self.v`并没有被克隆而是简单的复制了一个引用，依然指向了底层的数组`&[T]`，因此这个克隆非常高效。

## 总结

看起来是无效借用导致的错误，实际上是迭代器被消费了导致的问题，这说明 Rust 编译器虽然会告诉你错误原因，但是这个原因不总是根本原因。我们需要一双慧眼和勤劳的手，来挖掘出这个宝藏，最后为己所用。

同时，克隆在 Rust 中也并不总是**bad guy**的代名词，有的时候我们可以大胆去使用，当然前提是了解你的代码场景和具体的`clone`实现，这样你也能像文中那样作出非常`rusty`的选择。

