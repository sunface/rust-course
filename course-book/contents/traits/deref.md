# Deref和引用隐式转换

`Deref` 是解引用操作符`*`的特征，比如 *v。

一般理解，`*v`操作，是`&v`的反向操作，是为了获取`&v`指针指向的堆上对象。

## 强制隐式转换

Deref最神奇、最好用的地方并不在本身`解引`这个意义上，Rust的设计者在它之上附加了一个特性：强制隐式转换，这才是它神奇之处。

这种隐式转换的规则为：

一个类型为`T`的对象`foo`，如果T: Deref<Target=U>，那么，相关`foo`的引用`&foo`在应用的时候会自动转换`&U`。

粗看这条规则，貌似有点类似于`AsRef`，而跟`解引`似乎风马牛不相及, 实际里面里面有些玄妙之处。

Rust编译器会在做`*v`操作的时候，自动先把`v`做引用归一化操作，即转换成内部通用引用的形式`&v`，整个表达式就变成 `*&v`。这里面有两种情况：

1. 把智能指针（比如在库中定义的，Box, Rc, Arc, Cow 等），去掉壳，转成内部标准形式`&v`；
2. 把多重`&` （比如：`&&&&&&&v`），简化成`&v`（通过插入足够数量的`*`进行解引）。
所以，它实际上在解引用之前做了一个引用的归一化操作。

为什么要转呢？ 因为编译器设计的能力是，只能够对 &v 这种引用进行解引用。其它形式的它不认识，所以要做引用归一化操作。

使用引用进行过渡也是为了能够防止不必要的拷贝。

下面举一些例子：
```rust
    fn foo(s: &str) {
        // borrow a string for a second
    }

    // String implements Deref<Target=str>
    let owned = "Hello".to_string();

    // therefore, this works:
    foo(&owned);
```

因为`String`实现了`Deref<Target=str>`。

```rust
    use std::rc::Rc;

    fn foo(s: &str) {
        // borrow a string for a second
    }

    // String implements Deref<Target=str>
    let owned = "Hello".to_string();
    let counted = Rc::new(owned);

    // therefore, this works:
    foo(&counted);
```

因为`Rc<T>`实现了`Deref<Target=T>`。

```rust
    fn foo(s: &[i32]) {
        // borrow a slice for a second
    }

    // Vec<T> implements Deref<Target=[T]>
    let owned = vec![1, 2, 3];

    foo(&owned);
```

因为`Vec<T>` 实现了`Deref<Target=[T]>`。

```rust
    struct Foo;

    impl Foo {
        fn foo(&self) { println!("Foo"); }
    }

    let f = &&Foo;

    f.foo();
    (&f).foo();
    (&&f).foo();
    (&&&&&&&&f).foo();
```

上面那几种函数的调用，效果是一样的。

这种`Deref`涉及的隐式转换，实际上是Rust中仅有的类型隐式转换，设计它的目的，是为了简化程序的书写，让代码不至于过于繁琐。把人从无尽的类型细节中解脱出来，让书写 Rust 代码变成一件快乐的事情。