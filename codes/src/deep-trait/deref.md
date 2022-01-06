# Deref

下面的代码会报错
```rust
use std::ops::Index;
use std::rc::Rc;

struct MyType<T> { bytes: T }

// Wow such clean much wow
impl<T: Index<I>, I> Index<I> for MyType<T> {
    type Output = T::Output;

    fn index(&self, index: I) -> &Self::Output {
        &self.bytes[index]
    }
}

fn main() {
    let rc1 = Rc::new([1, 2, 3]);
    rc1[0]; // OK

    let rc2 = MyType { bytes: Rc::new([1, 2, 3]) };
    rc2[0]; // error[E0608]: cannot index into a value of type `MyType<Rc<[{integer}; 3]>>`
           // WHY???!?!!?!?!?!?
}
```

报错的原因是`Rc`自身没有实现`Index<usize>`，因此需要先通过`Deref`转为内部的数据类型，再进行索引。

首先`let rc1 = Rc::new([1, 2, 3]);`能行，是因为`Rc`能通过`Deref`转为`&[]`类型，因此`Deref`后，等同于直接对内部的数组切片取索引.

而` let rc2 = MyType { bytes: Rc::new([1, 2, 3]) };`不行，是因为`Rc::new([1,2,3])`实际上是泛型类型`T`，编译器并不知道T有没有实现`Deref`，因此也不能对`Rc::new([1,2,3])`进行索引。

简而言之，只有作为表达式才能自动进行`Deref`(`rc1`)，作为泛型类型时，不能自动进行`Deref`(`rc2`)。


你也可以为自己的类型实现`Deref`:
```rust
use std::ops::Deref;
use std::rc::Rc;

struct MyType<T> { bytes: T }

impl<T> Deref for MyType<T> {
    type Target = T;

    fn deref(&self) -> &T {
        &self.bytes
    }
}

fn main() {
    let rc = Rc::new([1, 2, 3]);
    rc[0]; // OK

    let rc = MyType { bytes: Rc::new([1, 2, 3]) };
    rc[0];
}
```
但是这不符合官方推荐的使用方式，因为官方明确推荐`Deref`适用于智能指针，其它类型要小心使用。