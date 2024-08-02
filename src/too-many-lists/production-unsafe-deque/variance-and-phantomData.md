# Variance and PhantomData

如果现在不做，等以后再修，会很麻烦，所以我们现在要做的是硬核布局。

建造 Rust collections 时，有这五个可怕的难题：

1. [Variance](https://doc.rust-lang.org/nightly/nomicon/subtyping.html)
2. [Drop Check](https://doc.rust-lang.org/nightly/nomicon/dropck.html)
3. [NonNull Optimizations](https://doc.rust-lang.org/nightly/std/ptr/struct.NonNull.html)
4. [The isize::MAX Allocation Rule](https://doc.rust-lang.org/nightly/nomicon/vec/vec-alloc.html)
5. [Zero-Sized Types](https://doc.rust-lang.org/nightly/nomicon/vec/vec-zsts.html)

幸好，后面 2 个对我们来说都不是问题。

我们可以把第三个问题变成我们的问题，但这带来的麻烦比它的价值更多。

第二个问题是我以前一直坚持认为非常重要的，std 也会乱用它，但默认值是安全的，而且你需要非常努力才能注意到默认值的限制，所以不用担心这个问题。

所以只剩下了 Variance(型变)。

Rust 有子类型了。通常，`&'big T` 是 `&'small T` 的子类型。因为如果某些代码需要在程序的某个特定区域存活的引用，那么通常完全可以给它一个存在*时间更长的*引用。直觉上这是正确的，对吧？

为什么这很重要？想象一下，一些代码采用两个具有相同类型的值：

```rust,ignore,mdbook-runnable
fn take_two<T>(_val1: T, _val2: T) { }
```

这是一些非常无聊的代码，并且我们期望它能够很好地与 T=&u32 一起使用，对吧？

```rust,ignore,mdbook-runnable
fn two_refs<'big: 'small, 'small>(
    big: &'big u32,
    small: &'small u32,
) {
    take_two(big, small);
}

fn take_two<T>(_val1: T, _val2: T) { }
```

是的，编译得很好！

现在让我们找点乐子，把它包起来：`std::cell::Cell`

```rust,ignore,mdbook-runnable
use std::cell::Cell;

fn two_refs<'big: 'small, 'small>(
    // NOTE: these two lines changed
    big: Cell<&'big u32>,
    small: Cell<&'small u32>,
) {
    take_two(big, small);
}

fn take_two<T>(_val1: T, _val2: T) { }
error[E0623]: lifetime mismatch
 --> src/main.rs:7:19
  |
4 |     big: Cell<&'big u32>,
  |               ---------
5 |     small: Cell<&'small u32>,
  |                 ----------- these two types are declared with different lifetimes...
6 | ) {
7 |     take_two(big, small);
  |                   ^^^^^ ...but data from `small` flows into `big` here
```

哼？？？我们没有碰过生命周期，为什么编译器现在生气了！？

啊，好吧，生命周期的“子类型”必须非常简单，所以如果你将引用包装在任何东西中，它就会被破坏，看看 Vec：

```rust,ignore,mdbook-runnable
fn two_refs<'big: 'small, 'small>(
    big: Vec<&'big u32>,
    small: Vec<&'small u32>,
) {
    take_two(big, small);
}

fn take_two<T>(_val1: T, _val2: T) { }
    Finished dev [unoptimized + debuginfo] target(s) in 1.07s
     Running `target/debug/playground`
```

看到它没有编译成功 ——等等???Vec 是魔术??????

是的。这种魔力就是 ✨*Variance*✨。

如果您想要所有细节，请阅读 [nomicon 关于子类型的章节](https://doc.rust-lang.org/nightly/nomicon/subtyping.html)，但基本上子类型*并不总是*安全的。特别是，当涉及可变引用时，它就更不安全了，。因为你可能会使用诸如`mem::swap`的东西，突然哎呀，悬空指针！

可变引用是 _invariant(不变的)_，这意味着它们会阻止对泛型参数子类型化。因此，为了安全起见， `&mut T` 在 T 上是不变的，并且 `Cell<T>` 在 T 上也是不变的（因为内部可变性），因为 `&Cell<T>` 本质上就像 `&mut T`。

几乎所有不是 _invariant_ 的东西都是 _covariant(协变的)_ ，这意味着子类型可以正常工作（也有 _contravariant(逆变的)_ 的类型使子类型倒退，但它们真的很少见，没有人喜欢它们，所以我不会再提到它们）。

集合通常包含指向其数据的可变指针，因此你可能希望它们也是不变的，但事实上，它们并不需要不变！由于 Rust 的所有权系统，`Vec<T>` 在语义上等同于 `T`，这意味着它可以安全地保持*covariant(协变的)* ！

不幸的的是，下面的定义是 _invariant(不变的)_:

```rust,ignore,mdbook-runnable
pub struct LinkedList<T> {
    front: Link<T>,
    back: Link<T>,
    len: usize,
}

type Link<T> = *mut Node<T>;

struct Node<T> {
    front: Link<T>,
    back: Link<T>,
    elem: T,
}
```

所以我们的类型定义中哪里惹 Rust 编译器不高兴了? `*mut`！

Rust 中的裸指针其实就是让你可以做任何事情，但它们只有一个安全特性：因为大多数人都不知道 Rust 中还有 _Variance(型变)_ 和子类型，而错误地使用 _covariant(协变的)_ 会非常危险，所以 `*mut T` 是*invariant(不变的)*，因为它很有可能被 "作为" `&mut T` 使用。

作为一个花了大量时间在 Rust 中编写集合的人，这让我感到厌烦。这就是为什么我在制作 [std::ptr::NonNull](https://doc.rust-lang.org/std/ptr/struct.NonNull.html), 时添加了这个小魔法：

> 与 *mut T 不同，NonNull<T> 在 T 上是 *covariant(协变的)*。这使得使用 NonNull<T> 构建*covariant(协变的)*类型成为可能，但如果在不应该是 *covariant(协变的)\* 的地方中使用，则会带来不健全的风险。

这是一个围绕着 `*mut T` 构建的类型。真的是魔法吗？让我们来看一下：

```rust,ignore,mdbook-runnable
pub struct NonNull<T> {
    pointer: *const T,
}


impl<T> NonNull<T> {
    pub unsafe fn new_unchecked(ptr: *mut T) -> Self {
        // SAFETY: the caller must guarantee that `ptr` is non-null.
        unsafe { NonNull { pointer: ptr as *const T } }
    }
}
```

不，这里没有魔法！NonNull 只是滥用了 *const T 是 *covariant(协变的)\* 这一事实，并将其存储起来。这就是 Rust 中集合的协变方式！这可真是惨不忍睹！所以我为你做了这个 Good Pointer Type ！不客气好好享受子类型吧

解决你所有问题的办法就是使用 NonNull，然后如果你想再次使用可空指针，就使用 Option<NonNull<T>>。我们真的要这么做吗？

是的！这很糟糕，但我们要做的是生产级的链表，所以我们要吃尽千辛万苦（我们可以直接使用裸\*const T，然后在任何地方都进行转换，但我真的想看看这样做有多痛苦......为了人体工程学科学）。

下面就是我们最终的类型定义：

```rust,ignore,mdbook-runnable
use std::ptr::NonNull;

// !!!This changed!!!
pub struct LinkedList<T> {
    front: Link<T>,
    back: Link<T>,
    len: usize,
}

type Link<T> = Option<NonNull<Node<T>>>;

struct Node<T> {
    front: Link<T>,
    back: Link<T>,
    elem: T,
}
```

...等等，不，最后一件事。每当你使用裸指针时，你都应该添加一个 Ghost 来保护你的指针：

```rust,ignore,mdbook-runnable
use std::marker::PhantomData;

pub struct LinkedList<T> {
    front: Link<T>,
    back: Link<T>,
    len: usize,
    /// We semantically store values of T by-value.
    _boo: PhantomData<T>,
}
```

在这种情况下，我认为我们*实际上*不需要 [PhantomData](https://doc.rust-lang.org/std/marker/struct.PhantomData.html)，但每当你使用 NonNull（或一般的裸指针）时，为了安全起见，你都应该始终添加它，并向编译器和其他人清楚地表明你的想法，你在做什么。

PhantomData 是我们给编译器提供一个额外的 "示例 "字段的方法，这个字段在概念上存在于你的类型中，但由于各种原因（间接、类型擦除......）并不存在。在本例中，我们使用 NonNull 是因为我们声称我们的类型 "好像 "存储了一个值 T，所以我们添加了一个 PhantomData 来明确这一点。

...好吧，我们现在已经完成了布局！进入实际的基本功能！
