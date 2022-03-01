# PhantomData（幽灵数据）

在编写非安全代码时，我们常常遇见这种情况：类型或生命周期逻辑上与一个结构体关联起来了，但是却不属于结构体的任何一个成员。这种情况对于生命周期尤为常见。比如，`&'a [T]`的`Iter`大概是这么定义的：

``` Rust
struct Iter<'a, T: 'a> {
    ptr: *const T,
    end: *const T,
}
```

但是，因为`'a`没有在结构体内被使用，它是无界的。由于一些历史原因，无界生命周期和类型禁止出现在结构体定义中。所以我们必须想办法在结构体内用到这些类型，这也是正确的变性检查和drop检查的必要条件。

我们使用一个特殊的标志类型`PhantomData`做到这一点。`PhantomData`不消耗存储空间，它只是模拟了某种类型的数据，以方便静态分析。这么做比显式地告诉类型系统你需要的变性更不容易出错，而且还能提供drop检查需要的信息。

`Iter`逻辑上包含一系列`&'a T`，所以我们用`PhantomData`这样去模拟它：

``` Rust
use std::marker;

struct Iter<'a, T: 'a> {
    ptr: *const T,
    end: *const T,
    _marker: marker::PhantomData<&'a T>,
}
```

就是这样，生命周期变得有界了，你的迭代器对于`'a`和`T`也可变了。一切尽如人意。

另一个重要的例子是`Vec`，它差不多是这么定义的：

``` Rust
struct Vec<T> {
    data: *const T, // *const是可变的！
    len: usize,
    cap: usize,
}
```

和之前的例子不同，这个定义已经满足我们的各种要求了。`Vec`的每一个泛型参数都被至少一个成员使用过了。非常完美！

你高兴的太早了。

Drop检查器会判断`Vec<T>`并不拥有T类型的值，然后它认为无需担心Vec在析构函数里能不能安全地销毁T，再然后它会允许人们创建不安全的Vec析构函数。

为了让drop检查器知道我们确实拥有T类型的值，也就是需要在销毁Vec的时候同时销毁T，我们需要添加一个额外的PhantomData：

``` Rust
use std::marker:

struct Vec<T> {
    data: *const T, // *const是可变的！
    len: usize,
    cap: usize,
    _marker: marker::PhantomData<T>,
}
```

让裸指针拥有数据是一个很普遍的设计，以至于标准库为它自己创造了一个叫`Unique<T>`的组件，它可以：

- 封装一个`*const T`处理变性
- 包含一个PhantomData<T>
- 自动实现`Send`/`Sync`，模拟和包含T时一样的行为
- 将指针标记为`NonZero`以便空指针优化

## `PhantomData`模式表

下表展示了各种牛X闪闪的`PhantomData`用法：

| Phantom 类型 | `'a` | `'T` |
|----|----|----|
|`PhantomData<T>`|-|协变（可触发drop检查）|
|`PhantomData<&'a T>`|协变|协变|
|`PhantomData<&'a mut T>`|协变|不变|
|`PhantomData<*const T>`|-|协变|
|`PhantomData<*mut T>`|-|不变|
|`PhantomData<fn(T)>`|-|逆变(*)|
|`PhantomData<fn() -> T>`|-|协变|
|`PhantomData<fn(T) -> T>`|-|不变|
|`PhantomData<Cell<&'a ()>>`|不变|-|

(*)如果发生变性的冲突，这个是不变的