# 类型转换


Rust 是类型安全的语言，因此在 Rust 中做类型转换不是一件简单的事，这一章节我们将对 Rust 中的类型转换进行详尽讲解。

> 高能预警：本章节有些难，可以考虑学了进阶后回头再看

## `as`转换

先来看一段代码：

```rust
fn main() {
  let a: i32 = 10;
  let b: u16 = 100;

  if a < b {
    println!("Ten is less than one hundred.");
  }
}
```

能跟着这本书一直学习到这里，说明你对 Rust 已经有了一定的理解，那么一眼就能看出这段代码注定会报错，因为 `a` 和 `b` 拥有不同的类型，Rust 不允许两种不同的类型进行比较。

解决办法很简单，只要把 `b` 转换成 `i32` 类型即可，Rust 中内置了一些基本类型之间的转换，这里使用 `as` 操作符来完成： `if a < (b as i32) {...}`。那么为什么不把 `a` 转换成 `u16` 类型呢？

因为每个类型能表达的数据范围不同，如果把范围较大的类型转换成较小的类型，会造成错误，因此我们需要把范围较小的类型转换成较大的类型，来避免这些问题的发生。

> 使用类型转换需要小心，因为如果执行以下操作 `300_i32 as i8`，你将获得 `44` 这个值，而不是 `300`，因为 `i8` 类型能表达的的最大值为 `2^7 - 1`，使用以下代码可以查看 `i8` 的最大值：

```rust
let a = i8::MAX;
println!("{}",a);
```

下面列出了常用的转换形式：

```rust
fn main() {
   let a = 3.1 as i8;
   let b = 100_i8 as i32;
   let c = 'a' as u8; // 将字符'a'转换为整数，97

   println!("{},{},{}",a,b,c)
}
```

#### 内存地址转换为指针

```rust
let mut values: [i32; 2] = [1, 2];
let p1: *mut i32 = values.as_mut_ptr();
let first_address = p1 as usize; // 将p1内存地址转换为一个整数
let second_address = first_address + 4; // 4 == std::mem::size_of::<i32>()，i32类型占用4个字节，因此将内存地址 + 4
let p2 = second_address as *mut i32; // 访问该地址指向的下一个整数p2
unsafe {
    *p2 += 1;
}
assert_eq!(values[1], 3);
```

#### 强制类型转换的边角知识

1. 转换不具有传递性
   就算 `e as U1 as U2` 是合法的，也不能说明 `e as U2` 是合法的（`e` 不能直接转换成 `U2`）。

## TryInto 转换

在一些场景中，使用 `as` 关键字会有比较大的限制。如果你想要在类型转换上拥有完全的控制而不依赖内置的转换，例如处理转换错误，那么可以使用 `TryInto` ：

```rust
use std::convert::TryInto;

fn main() {
   let a: u8 = 10;
   let b: u16 = 1500;

   let b_: u8 = b.try_into().unwrap();

   if a < b_ {
     println!("Ten is less than one hundred.");
   }
}
```

上面代码中引入了 `std::convert::TryInto` 特征，但是却没有使用它，可能有些同学会为此困惑，主要原因在于**如果你要使用一个特征的方法，那么你需要引入该特征到当前的作用域中**，我们在上面用到了 `try_into` 方法，因此需要引入对应的特征。但是 Rust 又提供了一个非常便利的办法，把最常用的标准库中的特征通过[`std::prelude`](https://course.rs/appendix/prelude.html)模块提前引入到当前作用域中，其中包括了 `std::convert::TryInto`，你可以尝试删除第一行的代码 `use ...`，看看是否会报错。

`try_into` 会尝试进行一次转换，并返回一个 `Result`，此时就可以对其进行相应的错误处理。由于我们的例子只是为了快速测试，因此使用了 `unwrap` 方法，该方法在发现错误时，会直接调用 `panic` 导致程序的崩溃退出，在实际项目中，请不要这么使用，具体见[panic](https://course.rs/basic/result-error/panic.html#调用-panic)部分。

最主要的是 `try_into` 转换会捕获大类型向小类型转换时导致的溢出错误：

```rust
fn main() {
    let b: i16 = 1500;

    let b_: u8 = match b.try_into() {
        Ok(b1) => b1,
        Err(e) => {
            println!("{:?}", e.to_string());
            0
        }
    };
}
```

运行后输出如下 `"out of range integral type conversion attempted"`，在这里我们程序捕获了错误，编译器告诉我们类型范围超出的转换是不被允许的，因为我们试图把 `1500_i16` 转换为 `u8` 类型，后者明显不足以承载这么大的值。

## 通用类型转换

虽然 `as` 和 `TryInto` 很强大，但是只能应用在数值类型上，可是 Rust 有如此多的类型，想要为这些类型实现转换，我们需要另谋出路，先来看看在一个笨办法，将一个结构体转换为另外一个结构体：

```rust
struct Foo {
    x: u32,
    y: u16,
}

struct Bar {
    a: u32,
    b: u16,
}

fn reinterpret(foo: Foo) -> Bar {
    let Foo { x, y } = foo;
    Bar { a: x, b: y }
}
```

简单粗暴，但是从另外一个角度来看，也挺啰嗦的，好在 Rust 为我们提供了更通用的方式来完成这个目的。

#### 强制类型转换

在某些情况下，类型是可以进行隐式强制转换的，虽然这些转换弱化了 Rust 的类型系统，但是它们的存在是为了让 Rust 在大多数场景可以工作(说白了，帮助用户省事)，而不是报各种类型上的编译错误。

首先，在匹配特征时，不会做任何强制转换(除了方法)。一个类型 `T` 可以强制转换为 `U`，不代表 `impl T` 可以强制转换为 `impl U`，例如下面的代码就无法通过编译检查：

```rust
trait Trait {}

fn foo<X: Trait>(t: X) {}

impl<'a> Trait for &'a i32 {}

fn main() {
    let t: &mut i32 = &mut 0;
    foo(t);
}
```

报错如下：

```console
error[E0277]: the trait bound `&mut i32: Trait` is not satisfied
--> src/main.rs:9:9
|
9 |     foo(t);
|         ^ the trait `Trait` is not implemented for `&mut i32`
|
= help: the following implementations were found:
        <&'a i32 as Trait>
= note: `Trait` is implemented for `&i32`, but not for `&mut i32`
```

`&i32` 实现了特征 `Trait`， `&mut i32` 可以转换为 `&i32`，但是 `&mut i32` 依然无法作为 `Trait` 来使用。<!-- 这一段没读懂，代码中的例子好像和上面的文字描述关系不大 -->

#### 点操作符

方法调用的点操作符看起来简单，实际上非常不简单，它在调用时，会发生很多魔法般的类型转换，例如：自动引用、自动解引用，强制类型转换直到类型能匹配等。

假设有一个方法 `foo`，它有一个接收器(接收器就是 `self`、`&self`、`&mut self` 参数)。如果调用 `value.foo()`，编译器在调用 `foo` 之前，需要决定到底使用哪个 `Self` 类型来调用。现在假设 `value` 拥有类型 `T`。

再进一步，我们使用[完全限定语法](https://course.rs/basic/trait/advance-trait.html#完全限定语法)来进行准确的函数调用:

1. 首先，编译器检查它是否可以直接调用 `T::foo(value)`，称之为**值方法调用**
2. 如果上一步调用无法完成(例如方法类型错误或者特征没有针对 `Self` 进行实现，上文提到过特征不能进行强制转换)，那么编译器会尝试增加自动引用，例如会尝试以下调用： `<&T>::foo(value)` 和 `<&mut T>::foo(value)`，称之为**引用方法调用**
3. 若上面两个方法依然不工作，编译器会试着解引用 `T` ，然后再进行尝试。这里使用了 `Deref` 特征 —— 若 `T: Deref<Target = U>` (`T` 可以被解引用为 `U`)，那么编译器会使用 `U` 类型进行尝试，称之为**解引用方法调用**
4. 若 `T` 不能被解引用，且 `T` 是一个定长类型(在编译器类型长度是已知的)，那么编译器也会尝试将 `T` 从定长类型转为不定长类型，例如将 `[i32; 2]` 转为 `[i32]`
5. 若还是不行，那...没有那了，最后编译器大喊一声：汝欺我甚，不干了！

下面我们来用一个例子来解释上面的方法查找算法:

```rust
let array: Rc<Box<[T; 3]>> = ...;
let first_entry = array[0];
```

`array` 数组的底层数据隐藏在了重重封锁之后，那么编译器如何使用 `array[0]` 这种数组原生访问语法通过重重封锁，准确的访问到数组中的第一个元素？

1. 首先， `array[0]` 只是[`Index`](https://doc.rust-lang.org/std/ops/trait.Index.html)特征的语法糖：编译器会将 `array[0]` 转换为 `array.index(0)` 调用，当然在调用之前，编译器会先检查 `array` 是否实现了 `Index` 特征。
2. 接着，编译器检查 `Rc<Box<[T; 3]>>` 是否有实现 `Index` 特征，结果是否，不仅如此，`&Rc<Box<[T; 3]>>` 与 `&mut Rc<Box<[T; 3]>>` 也没有实现。
3. 上面的都不能工作，编译器开始对 `Rc<Box<[T; 3]>>` 进行解引用，把它转变成 `Box<[T; 3]>`
4. 此时继续对 `Box<[T; 3]>` 进行上面的操作 ：`Box<[T; 3]>`， `&Box<[T; 3]>`，和 `&mut Box<[T; 3]>` 都没有实现 `Index` 特征，所以编译器开始对 `Box<[T; 3]>` 进行解引用，然后我们得到了 `[T; 3]`
5. `[T; 3]` 以及它的各种引用都没有实现 `Index` 索引(是不是很反直觉:D，在直觉中，数组都可以通过索引访问，实际上只有数组切片才可以!)，它也不能再进行解引用，因此编译器只能祭出最后的大杀器：将定长转为不定长，因此 `[T; 3]` 被转换成 `[T]`，也就是数组切片，它实现了 `Index` 特征，因此最终我们可以通过 `index` 方法访问到对应的元素。

过程看起来很复杂，但是也还好，挺好理解，如果你现在不能彻底理解，也不要紧，等以后对 Rust 理解更深了，同时需要深入理解类型转换时，再来细细品读本章。

再来看看以下更复杂的例子：

```rust
fn do_stuff<T: Clone>(value: &T) {
    let cloned = value.clone();
}
```

上面例子中 `cloned` 的类型是什么？首先编译器检查能不能进行**值方法调用**， `value` 的类型是 `&T`，同时 `clone` 方法的签名也是 `&T` ： `fn clone(&T) -> T`，因此可以进行值方法调用，再加上编译器知道了 `T` 实现了 `Clone`，因此 `cloned` 的类型是 `T`。

如果 `T: Clone` 的特征约束被移除呢？

```rust
fn do_stuff<T>(value: &T) {
    let cloned = value.clone();
}
```

首先，从直觉上来说，该方法会报错，因为 `T` 没有实现 `Clone` 特征，但是真实情况是什么呢？

我们先来推导一番。 首先通过值方法调用就不再可行，因为 `T` 没有实现 `Clone` 特征，也就无法调用 `T` 的 `clone` 方法。接着编译器尝试**引用方法调用**，此时 `T` 变成 `&T`，在这种情况下， `clone` 方法的签名如下： `fn clone(&&T) -> &T`，接着我们现在对 `value` 进行了引用。 编译器发现 `&T` 实现了 `Clone` 类型(所有的引用类型都可以被复制，因为其实就是复制一份地址)，因此可以推出 `cloned` 也是 `&T` 类型。

最终，我们复制出一份引用指针，这很合理，因为值类型 `T` 没有实现 `Clone`，只能去复制一个指针了。

下面的例子也是自动引用生效的地方：

```rust
#[derive(Clone)]
struct Container<T>(Arc<T>);

fn clone_containers<T>(foo: &Container<i32>, bar: &Container<T>) {
    let foo_cloned = foo.clone();
    let bar_cloned = bar.clone();
}
```

推断下上面的 `foo_cloned` 和 `bar_cloned` 是什么类型？提示: 关键在 `Container` 的泛型参数，一个是 `i32` 的具体类型，一个是泛型类型，其中 `i32` 实现了 `Clone`，但是 `T` 并没有。

首先要复习一下复杂类型派生 `Clone` 的规则：一个复杂类型能否派生 `Clone`，需要它内部的所有子类型都能进行 `Clone`。因此 `Container<T>(Arc<T>)` 是否实现 `Clone` 的关键在于 `T` 类型是否实现了 `Clone` 特征。

上面代码中，`Container<i32>` 实现了 `Clone` 特征，因此编译器可以直接进行值方法调用，此时相当于直接调用 `foo.clone`，其中 `clone` 的函数签名是 `fn clone(&T) -> T`，由此可以看出 `foo_cloned` 的类型是 `Container<i32>`。

然而，`bar_cloned` 的类型却是 `&Container<T>`，这个不合理啊，明明我们为 `Container<T>` 派生了 `Clone` 特征，因此它也应该是 `Container<T>` 类型才对。万事皆有因，我们先来看下 `derive` 宏最终生成的代码大概是啥样的：

```rust
impl<T> Clone for Container<T> where T: Clone {
    fn clone(&self) -> Self {
        Self(Arc::clone(&self.0))
    }
}
```

从上面代码可以看出，派生 `Clone` 能实现的根本是 `T` 实现了[`Clone`特征](https://doc.rust-lang.org/std/clone/trait.Clone.html#derivable)：`where T: Clone`， 因此 `Container<T>` 就没有实现 `Clone` 特征。

编译器接着会去尝试引用方法调用，此时 `&Container<T>` 引用实现了 `Clone`，最终可以得出 `bar_cloned` 的类型是 `&Container<T>`。

当然，也可以为 `Container<T>` 手动实现 `Clone` 特征：

```rust
impl<T> Clone for Container<T> {
    fn clone(&self) -> Self {
        Self(Arc::clone(&self.0))
    }
}
```

此时，编译器首次尝试值方法调用即可通过，因此 `bar_cloned` 的类型变成 `Container<T>`。

这一块儿内容真的挺复杂，每一个坚持看完的读者都是真正的勇士，我也是：为了写好这块儿内容，作者足足花了 **4** 个小时！

#### 变形记(Transmutes)

前方危险，敬请绕行！

类型系统，你让开！我要自己转换这些类型，不成功便成仁！虽然本书大多是关于安全的内容，我还是希望你能仔细考虑避免使用本章讲到的内容。这是你在 Rust 中所能做到的真真正正、彻彻底底、最最可怕的非安全行为，在这里，所有的保护机制都形同虚设。

先让你看看深渊长什么样，开开眼，然后你再决定是否深入： `mem::transmute<T, U>` 将类型 `T` 直接转成类型 `U`，唯一的要求就是，这两个类型占用同样大小的字节数！我的天，这也算限制？这简直就是无底线的转换好吧？看看会导致什么问题：

1. 首先也是最重要的，转换后创建一个任意类型的实例会造成无法想象的混乱，而且根本无法预测。不要把 `3` 转换成 `bool` 类型，就算你根本不会去使用该 `bool` 类型，也不要去这样转换
2. 变形后会有一个重载的返回类型，即使你没有指定返回类型，为了满足类型推导的需求，依然会产生千奇百怪的类型
3. 将 `&` 变形为 `&mut` 是未定义的行为
   - 这种转换永远都是未定义的
   - 不，你不能这么做
   - 不要多想，你没有那种幸运
4. 变形为一个未指定生命周期的引用会导致[无界生命周期](https://course.rs/advance/lifetime/advance.html)
5. 在复合类型之间互相变换时，你需要保证它们的排列布局是一模一样的！一旦不一样，那么字段就会得到不可预期的值，这也是未定义的行为，至于你会不会因此愤怒， **WHO CARES** ，你都用了变形了，老兄！

对于第 5 条，你该如何知道内存的排列布局是一样的呢？对于 `repr(C)` 类型和 `repr(transparent)` 类型来说，它们的布局是有着精确定义的。但是对于你自己的"普通却自信"的 Rust 类型 `repr(Rust)` 来说，它可不是有着精确定义的。甚至同一个泛型类型的不同实例都可以有不同的内存布局。 `Vec<i32>` 和 `Vec<u32>` 它们的字段可能有着相同的顺序，也可能没有。对于数据排列布局来说，**什么能保证，什么不能保证**目前还在 Rust 开发组的[工作任务](https://rust-lang.github.io/unsafe-code-guidelines/layout.html)中呢。

你以为你之前凝视的是深渊吗？不，你凝视的只是深渊的大门。 `mem::transmute_copy<T, U>` 才是真正的深渊，它比之前的还要更加危险和不安全。它从 `T` 类型中拷贝出 `U` 类型所需的字节数，然后转换成 `U`。 `mem::transmute` 尚有大小检查，能保证两个数据的内存大小一致，现在这哥们干脆连这个也丢了，只不过 `U` 的尺寸若是比 `T` 大，会是一个未定义行为。

当然，你也可以通过裸指针转换和 `unions` (todo!)获得所有的这些功能，但是你将无法获得任何编译提示或者检查。裸指针转换和 `unions` 也不是魔法，无法逃避上面说的规则。

`transmute` 虽然危险，但作为一本工具书，知识当然要全面，下面列举两个有用的 `transmute` 应用场景 :)。

- 将裸指针变成函数指针：

```rust
fn foo() -> i32 {
    0
}

let pointer = foo as *const ();
let function = unsafe { 
    // 将裸指针转换为函数指针
    std::mem::transmute::<*const (), fn() -> i32>(pointer) 
};
assert_eq!(function(), 0);
```

- 延长生命周期，或者缩短一个静态生命周期寿命：

```rust
struct R<'a>(&'a i32);

// 将 'b 生命周期延长至 'static 生命周期
unsafe fn extend_lifetime<'b>(r: R<'b>) -> R<'static> {
    std::mem::transmute::<R<'b>, R<'static>>(r)
}

// 将 'static 生命周期缩短至 'c 生命周期
unsafe fn shorten_invariant_lifetime<'b, 'c>(r: &'b mut R<'static>) -> &'b mut R<'c> {
    std::mem::transmute::<&'b mut R<'static>, &'b mut R<'c>>(r)
}
```

以上例子非常先进！但是是非常不安全的 Rust 行为！

## 课后练习
> Rust By Practice，支持代码在线编辑和运行，并提供详细的习题解答。
> - [as](https://zh.practice.rs/type-conversions/as.html)
>    - [习题解答](https://github.com/sunface/rust-by-practice/blob/master/solutions/type-conversions/as.md)
> - [From/Into](https://zh.practice.rs/type-conversions/from-into.html)
>    - [习题解答](https://github.com/sunface/rust-by-practice/blob/master/solutions/type-conversions/from-into.md)
> - [其它转换](https://zh.practice.rs/type-conversions/others.html)
>    - [习题解答](https://github.com/sunface/rust-by-practice/blob/master/solutions/type-conversions/others.md)