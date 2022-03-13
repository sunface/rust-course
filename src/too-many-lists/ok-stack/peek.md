# Peek 函数
在之前章节中，我们定义了 `push`、`pop` 等基础操作，下面一起添加几个进阶操作，让我们的链表有用起来。


首先实现的就是 `peek` 函数，它会返回链表的表头元素的引用:
```rust
pub fn peek(&self) -> Option<&T> {
    self.head.map(|node| {
        &node.elem
    })
}
```

```shell
> cargo build

error[E0515]: cannot return reference to local data `node.elem`
  --> src/second.rs:37:13
   |
37 |             &node.elem
   |             ^^^^^^^^^^ returns a reference to data owned by the current function

error[E0507]: cannot move out of borrowed content
  --> src/second.rs:36:9
   |
36 |         self.head.map(|node| {
   |         ^^^^^^^^^ cannot move out of borrowed content
```

哎，Rust 大爷，您又哪里不满意了。不过问题倒是也很明显: `map` 方法是通过 `self` 获取的值，我们相当于把内部值的引用返回给函数外面的调用者。

一个比较好的解决办法就是让 `map` 作用在引用上，而不是直接作用在 `self.head` 上，为此我们可以使用 `Option` 的 `as_ref` 方法：
```rust
impl<T> Option<T> {
    pub fn as_ref(&self) -> Option<&T>;
}
```

该方法将一个 `Option<T>` 变成了 `Option<&T>`，然后再调用 `map` 就会对引用进行处理了：
```rust
pub fn peek(&self) -> Option<&T> {
    self.head.as_ref().map(|node| {
        &node.elem
    })
}
```

```shell
cargo build

    Finished dev [unoptimized + debuginfo] target(s) in 0.32s
```

当然，我们还可以通过类似的方式获取一个可变引用:
```rust
pub fn peek_mut(&mut self) -> Option<&mut T> {
    self.head.as_mut().map(|node| {
        &mut node.elem
    })
}
```

至此 `peek` 已经完成，为了测试它的功能，我们还需要编写一个测试用例:
```rust
#[test]
fn peek() {
    let mut list = List::new();
    assert_eq!(list.peek(), None);
    assert_eq!(list.peek_mut(), None);
    list.push(1); list.push(2); list.push(3);

    assert_eq!(list.peek(), Some(&3));
    assert_eq!(list.peek_mut(), Some(&mut 3));
    list.peek_mut().map(|&mut value| {
        value = 42
    });

    assert_eq!(list.peek(), Some(&42));
    assert_eq!(list.pop(), Some(42));
}
```

```shell
> cargo test

error[E0384]: cannot assign twice to immutable variable `value`
   --> src/second.rs:100:13
    |
99  |         list.peek_mut().map(|&mut value| {
    |                                   -----
    |                                   |
    |                                   first assignment to `value`
    |                                   help: make this binding mutable: `mut value`
100 |             value = 42
    |             ^^^^^^^^^^ cannot assign twice to immutable variable          ^~~~~
```

天呐，错误源源不断，这次编译器抱怨说 `value` 是不可变的，但是我们明明使用 `&mut value`，发生了什么？难道说在闭包中通过这种方式申明的可变性实际上没有效果？

实际上 `&mut value` 是一个模式匹配，它用 `&mut value` 模式去匹配一个可变的引用，此时匹配出来的 `value` 显然是一个值，而不是可变引用，因为只有完整的形式才是可变引用！

因此我们没必要画蛇添足，这里直接使用 `|value|` 来匹配可变引用即可，那么此时匹配出来的 `value` 就是一个可变引用。

```rust
#[test]
fn peek() {
    let mut list = List::new();
    assert_eq!(list.peek(), None);
    assert_eq!(list.peek_mut(), None);
    list.push(1); list.push(2); list.push(3);

    assert_eq!(list.peek(), Some(&3));
    assert_eq!(list.peek_mut(), Some(&mut 3));

    list.peek_mut().map(|value| {
        *value = 42
    });

    assert_eq!(list.peek(), Some(&42));
    assert_eq!(list.pop(), Some(42));
}
```

这次我们直接匹配出来可变引用 `value`，然后对其修改即可。

```shell
cargo test

     Running target/debug/lists-5c71138492ad4b4a

running 3 tests
test first::test::basics ... ok
test second::test::basics ... ok
test second::test::peek ... ok

test result: ok. 3 passed; 0 failed; 0 ignored; 0 measured
```