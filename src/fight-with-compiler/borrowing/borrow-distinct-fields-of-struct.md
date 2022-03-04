# 智能指针引起的重复借用错误

本文将彻底解决一个困扰广大 Rust 用户已久的常见错误： 当智能指针和结构体一起使用时导致的借用错误: `cannot borrow`mut_s` as mutable because it is also borrowed as immutable`.

相信看过[<<对抗 Rust 编译检查系列>>](https://course.rs/fight-with-compiler/intro.html)的读者都知道结构体中的不同字段可以独立借用吧？

## 结构体中的字段借用

不知道也没关系，我们这里再简单回顾一下:

```rust
struct Test {
    a : u32,
    b : u32
}

impl Test {
    fn increase(&mut self) {
        let mut a = &mut self.a;
        let mut b = &mut self.b;
        *b += 1;
        *a += 1;
    }
}
```

这段代码看上去像是重复借用了`&mut self`,违反了 Rust 的借用规则，实际上在聪明的 Rust 编译器面前，这都不是事。它能发现我们其实借用了目标结构体的不同字段，因此完全可以将其借用权分离开来。

因此，虽然我们不能同时对整个结构体进行多次可变借用，但是我们可以分别对结构体中的不同字段进行可变借用，当然，一个字段至多也只能存在一个可变借用，这个最基本的所有权规则还是不能违反的。变量`a`引用结构体字段`a`，变量`b`引用结构体字段`b`，从底层来说，这种方式也不会造成两个可变引用指向了同一块内存。

## RefCell

如果你还不知道 RefCell，可以看看[这篇文章](https://course.rs/advance/smart-pointer/cell-refcell.html)，当然不看也行，简而言之，RefCell 能够实现：

- 将借用规则从编译期推迟到运行期，但是并不会饶过借用规则，当不符合时，程序直接`panic`
- 实现内部可变性：简单来说，对一个不可变的值进行可变借用，然后修改内部的值

## 被 RefCell 包裹的结构体

既然了解了结构体的借用规则和`RefCell`, 我们来看一段结合了两者的代码：

```rust
use std::cell::RefCell;
use std::io::Write;

struct Data {
    string: String,
}

struct S {
    data: Data,
    writer: Vec<u8>,
}

fn write(s: RefCell<S>) {
    let mut mut_s = s.borrow_mut();
    let str = &mut_s.data.string;
    mut_s.writer.write(str.as_bytes());
}
```

以上代码从`s`中可变借用出结构体`S`，随后又对结构体中的两个字段进行了分别借用，按照之前的规则这段代码应该顺利通过编译：

```console
error[E0502]: cannot borrow `mut_s` as mutable because it is also borrowed as immutable
  --> src/main.rs:16:5
   |
15 |     let str = &mut_s.data.string;
   |                ----- immutable borrow occurs here
16 |     mut_s.writer.write(str.as_bytes());
   |     ^^^^^              --- immutable borrow later used here
   |     |
   |     mutable borrow occurs here
```

只能说，还好它报错了，否则本篇文章已经可以结束。。。错误很简单，首先对结构体`S`的`data`字段进行了不可变借用，其次又对`writer`字段进行了可变借用，这个符合之前的规则：对结构体不同字段分开借用，为何报错了？

## 深入分析

第一感觉，问题是出在`borrow_mut`方法返回的类型上，先来看看:

```rust
pub fn borrow_mut(&self) -> RefMut<'_, T>
```

可以看出，该方法并没有直接返回我们的结构体，而是一个`RefMut`类型，而要使用该类型，需要经过编译器为我们做一次隐式的`Deref`转换，编译器展开后的代码大概如下:

```rust
use std::cell::RefMut;
use std::ops::{Deref, DerefMut};

fn write(s: RefCell<S>) {
    let mut mut_s: RefMut<S> = s.borrow_mut();
    let str = &Deref::deref(&mut_s).data.string;
    DerefMut::deref_mut(&mut mut_s).writer.write(str.as_bytes());
}
```

可以看出，对结构体字段的调用，实际上经过一层函数，一层函数！？我相信你应该想起了什么，是的，在[上一篇文章](https://course.rs/fight-with-compiler/borrowing/ref-exist-in-out-fn.html)中讲过类似的问题， 大意就是**编译器对于函数往往只会分析签名，并不关心内部到底如何使用结构体**。

而上面的`&Deref::deref(&mut_s)`和`DerefMut::deref_mut(&mut mut_s)`函数，签名全部使用的是结构体，并不是结构体中的某一个字段，因此对于编译器来说，该结构体明显是被重复借用了！

## 解决方法

因此要解决这个问题，我们得把之前的展开形式中的`Deref::deref`消除掉，这样没有了函数签名，编译器也将不再懒政。

既然两次`Deref::deref`调用都是对智能指针的自动`Deref`，那么可以提前手动的把它`Deref`了，只做一次！

```rust
fn write(s: RefCell<S>) {
    let mut mut_s = s.borrow_mut();
    let mut tmp = &mut *mut_s; // Here
    let str = &tmp.data.string;
    tmp.writer.write(str.as_bytes());
}
```

以上代码通过`*`对`mut_s`进行了解引用，获得结构体，然后又对结构体进行了可变借用`&mut`，最终赋予`tmp`变量，那么该变量就持有了我们的结构体的可变引用，而不再是持有一个智能指针。

此后对`tmp`的使用就回归到文章开头的那段代码：分别借用结构体的不同字段，成功通过编译！

#### 展开代码

我们再来模拟编译器对正确的代码进行一次展开:

```rust
use std::cell::RefMut;
use std::ops::DerefMut;

fn write(s: RefCell<S>) {
    let mut mut_s: RefMut<S> = s.borrow_mut();
    let tmp: &mut S = DerefMut::deref_mut(&mut mut_s);
    let str = &tmp.data.string;
    tmp.writer.write(str.as_bytes());
}
```

可以看出，此时对结构体的使用不再有`DerefMut::deref`的身影，我们成功消除了函数边界对编译器的影响！

## 不仅仅是 RefCell

事实上，除了 RefCell 外，还有不少会导致这种问题的智能指针，当然原理都是互通的，我们这里就不再进行一一深入讲解，只简单列举下：

- `Box`
- `MutexGuard`(来源于 Mutex)
- `PeekMut`(来源于 BinaryHeap)
- `RwLockWriteGuard`(来源于 RwLock)
- `String`
- `Vec`
- `Pin`

## 一个练习

下面再来一个练习巩固一下，强烈建议大家按照文章的思路进行分析和解决：

```rust
use std::rc::Rc;
use std::cell::RefCell;

pub struct Foo {
    pub foo1: Vec<bool>,
    pub foo2: Vec<i32>,
}
fn main() {
    let foo_cell = Rc::new(RefCell::new(Foo {
        foo1: vec![true, false],
        foo2: vec![1, 2]

    }));

    let borrow = foo_cell.borrow_mut();
    let foo1 = &borrow.foo1;
    // 下面代码会报错,因为`foo1`和`foo2`发生了重复借用
    borrow.foo2.iter_mut().enumerate().for_each(|(idx, foo2)| {
        if foo1[idx] {
            *foo2 *= -1;
        }
    });
}
```

## 总结

当结构体的引用穿越函数边界时，我们要格外小心，因为编译器只会对函数签名进行检查，并不关心内部到底用了结构体的哪个字段，当签名都使用了结构体时，会立即报错。

而智能指针由于隐式解引用`Deref`的存在，导致了两次`Deref`时都让结构体穿越了函数边界`Deref::deref`，结果造成了重复借用的错误。

解决办法就是提前对智能指针进行手动解引用，然后对内部的值进行借用后，再行使用。

