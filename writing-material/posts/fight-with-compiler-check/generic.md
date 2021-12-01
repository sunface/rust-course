## the type parameter `T` is not constrained by the impl trait

```rust
use std::default::Default;

trait Maker {
    type Item;

    fn make(&mut self) -> Self::Item;
}

struct Foo<T> {
    a: T,
}

struct Bar;

impl<T> Maker for Bar
    where T: Default  {
    type Item = Foo<T>;

    fn make(&mut self) -> Foo<T> {
        Foo {
            a: <T as Default>::default(),
        }
    }
}
```

上面的代码会导致以下编译错误:
```bash
tests/lang.rs:1000:10: 1000:11 error: the type parameter `T` is not constrained by the impl trait, self type, or predicates [E0207]
tests/lang.rs:1000     impl<T> Maker for Bar
```

可以使用[幽灵数据]()来初步解决

```rust
use std::marker::PhantomData;
struct Bar<T> {
    _m: PhantomData<T>
}

impl<T> Maker for Bar<T>
    where T: Default  {
    type Item = Foo<T>;

    fn make(&mut self) -> Foo<T> {
        Foo {
            a: <T as Default>::default(),
        }
    }
}
```

关于这个问题，主要是因为在`impl`代码块中，关联类型是由`Self`和所有输入类型参数一同决定的，也就是说`关联类型`中出现的泛型参数，必须在`impl`中有所定义，要么为`Maker`增加泛型变量，要么为`Bar`增加。

如果你想要让Self拥有多种可能的类型，就得使用外部输入的类型参数，而不是关联类型：
```rust
use std::default::Default;

trait Maker<Item> {
    fn make(&mut self) -> Item;
}

struct Foo<T> {
    a: T,
}

struct Bar;

impl<T> Maker<Foo<T>> for Bar
    where T: Default  
{

    fn make(&mut self) -> Foo<T> {
        Foo {
            a: <T as Default>::default(),
        }
    }
}
```

类似的例子还有这个：https://www.reddit.com/r/rust/comments/r61l29/generic_impl_doesnt_work_while_generic_function/

