# 测试栈借用
> 关于上一章节的简单总结:
>
> - Rust 通过借用栈来处理再借用
> - 只有栈顶的元素是处于 `live` 状态的( 被借用 )
> - 当访问栈顶下面的元素时，该元素会变为 `live`，而栈顶元素会被弹出( `pop` )
> - 从借用栈中弹出的元素无法再被借用
> - 借用检查器会保证我们的安全代码遵守以上规则
> - Miri 可以在一定程度上保证裸指针在运行时也遵循以上规则

作为作者同时也是读者，我想说上一章节的内容相当不好理解，下面来看一些例子，通过它们可以帮助大家更好的理解栈借用模型。

在实际项目中捕获 UB 是一件相当不容易的事，毕竟你是在编译器的盲区之外摸索和行动。

如果我们足够幸运的话，写出来的代码是可以"正常运行的“，但是一旦编译器聪明一点或者你修改了某处代码，那这些代码可能会立刻化身为一颗安静的定时炸弹。当然，如果你还是足够幸运，那程序会发生崩溃，你也就可以捕获和处理相应的错误。但是如果你不幸运呢？

那代码就算出问题了，也只是会发生一些奇怪的现象，面对这些现象你将束手无策，甚至不知道该如何处理！

Miri 为何可以一定程度上提前发现这些 UB 问题？因为它会去获取 rustc 对我们的程序最原生、且没有任何优化的视角，然后对看到的内容进行解释和跟踪。只要这个过程能够开始，那这个解决方法就相当有效，但是问题来了，该如何让这个过程开始？要知道 Miri 和 rustc 是不可能去逐行分析代码中的所有行为的，这样做的结果就是编译时间大大增加！

因此我们需要使用测试用例来让程序中可能包含 UB 的代码路径被真正执行到，当然，就算你这么做了，也不能完全依赖 Miri。既然是分析，就有可能遗漏，也可能误杀友军。

## 基本借用
在上一章节中，借用检查器似乎不喜欢以下代码:
```rust
let mut data = 10;
let ref1 = &mut data;
let ref2 = &mut *ref1;

*ref1 += 1;
*ref2 += 2;

println!("{}", data);
```

它违背了再借用的原则，大家可以用借用栈的分析方式去验证下上一章节所学的知识。

下面来看看，如果使用裸指针会怎么样:
```rust
unsafe {
    let mut data = 10;
    let ref1 = &mut data;
    let ptr2 = ref1 as *mut _;

    *ref1 += 1;
    *ptr2 += 2;

    println!("{}", data);
}
```

```shell
$ cargo run

   Compiling miri-sandbox v0.1.0
    Finished dev [unoptimized + debuginfo] target(s) in 0.71s
     Running `target\debug\miri-sandbox.exe`
13
```

嗯，编译器看起来很满意：不仅获取了预期的结果，还没有任何警告。那么再来征求下 Miri 的意见：
```shell
MIRIFLAGS="-Zmiri-tag-raw-pointers" cargo +nightly-2022-01-21 miri run

    Finished dev [unoptimized + debuginfo] target(s) in 0.00s
     Running cargo-miri.exe target\miri

error: Undefined Behavior: no item granting read access 
to tag <untagged> at alloc748 found in borrow stack.

 --> src\main.rs:9:9
  |
9 |         *ptr2 += 2;
  |         ^^^^^^^^^^ no item granting read access to tag <untagged> 
  |                    at alloc748 found in borrow stack.
  |
  = help: this indicates a potential bug in the program: 
    it performed an invalid operation, but the rules it 
    violated are still experimental
```

喔，果然出问题了。下面再来试试更复杂的 `&mut -> *mut -> &mut -> *mut` :
```rust
unsafe {
    let mut data = 10;
    let ref1 = &mut data;
    let ptr2 = ref1 as *mut _;
    let ref3 = &mut *ptr2;
    let ptr4 = ref3 as *mut _;

    // 首先访问第一个裸指针
    *ptr2 += 2;

    // 接着按照借用栈的顺序来访问
    *ptr4 += 4;
    *ref3 += 3;
    *ptr2 += 2;
    *ref1 += 1;

    println!("{}", data);
}
```

```shell
$ cargo run

22
```

```shell
MIRIFLAGS="-Zmiri-tag-raw-pointers" cargo +nightly-2022-01-21 miri run

error: Undefined Behavior: no item granting read access 
to tag <1621> at alloc748 found in borrow stack.

  --> src\main.rs:13:5
   |
13 |     *ptr4 += 4;
   |     ^^^^^^^^^^ no item granting read access to tag <1621> 
   |                at alloc748 found in borrow stack.
   |
```

不错，可以看出 miri 有能力分辨两个裸指针的使用限制：当使用第二个时，需要先让之前的失效。

再来移除乱入的那一行，让借用栈可以真正顺利的工作：
```rust
unsafe {
    let mut data = 10;
    let ref1 = &mut data;
    let ptr2 = ref1 as *mut _;
    let ref3 = &mut *ptr2;
    let ptr4 = ref3 as *mut _;

    // Access things in "borrow stack" order
    *ptr4 += 4;
    *ref3 += 3;
    *ptr2 += 2;
    *ref1 += 1;

    println!("{}", data);
}
```

```shell
$ cargo run

20

MIRIFLAGS="-Zmiri-tag-raw-pointers" cargo +nightly-2022-01-21 miri run
20
```

我现在可以负责任的说：在座的各位，都是...可以获取编程语言内存模型设计博士学位的存在，编译器？那是什么东东！简单的很。

> 旁白：那个..关于博士的一切，请不要当真，但是我依然为你们骄傲

## 测试数组
下面来干一票大的：使用指针偏移来搞乱一个数组。

```rust
unsafe {
    let mut data = [0; 10];
    let ref1_at_0 = &mut data[0];           // 获取第 1 个元素的引用
    let ptr2_at_0 = ref1_at_0 as *mut i32;  // 裸指针 ptr 指向第 1 个元素
    let ptr3_at_1 = ptr2_at_0.add(1);       // 对裸指针进行运算，指向第 2 个元素

    *ptr3_at_1 += 3;
    *ptr2_at_0 += 2;
    *ref1_at_0 += 1;

    // Should be [3, 3, 0, ...]
    println!("{:?}", &data[..]);
}
```

```shell
$ cargo run

[3, 3, 0, 0, 0, 0, 0, 0, 0, 0]
```

```shell
MIRIFLAGS="-Zmiri-tag-raw-pointers" cargo +nightly-2022-01-21 miri run

error: Undefined Behavior: no item granting read access 
to tag <1619> at alloc748+0x4 found in borrow stack.
 --> src\main.rs:8:5
  |
8 |     *ptr3_at_1 += 3;
  |     ^^^^^^^^^^^^^^^ no item granting read access to tag <1619>
  |                     at alloc748+0x4 found in borrow stack.
```

咦？我们命名按照借用栈的方式来完美使用了，为何 miri 还是提示了 UB 风险？难道是因为 `ptr -> ptr` 的过程中发生了什么奇怪的事情？如果我们只是拷贝指针，让它们都指向同一个位置呢？
```rust
unsafe {
    let mut data = [0; 10];
    let ref1_at_0 = &mut data[0];           
    let ptr2_at_0 = ref1_at_0 as *mut i32;  
    let ptr3_at_0 = ptr2_at_0;            

    *ptr3_at_0 += 3;
    *ptr2_at_0 += 2;
    *ref1_at_0 += 1;

    // Should be [6, 0, 0, ...]
    println!("{:?}", &data[..]);
}
```

```shell
$ cargo run

[6, 0, 0, 0, 0, 0, 0, 0, 0, 0]

MIRIFLAGS="-Zmiri-tag-raw-pointers" cargo +nightly-2022-01-21 miri run
[6, 0, 0, 0, 0, 0, 0, 0, 0, 0]
```

果然，顺利通过，下面我们还是让它们指向同一个位置，但是来首名为混乱的 BGM:
```rust
unsafe {
    let mut data = [0; 10];
    let ref1_at_0 = &mut data[0];            // Reference to 0th element
    let ptr2_at_0 = ref1_at_0 as *mut i32;   // Ptr to 0th element
    let ptr3_at_0 = ptr2_at_0;               // Ptr to 0th element
    let ptr4_at_0 = ptr2_at_0.add(0);        // Ptr to 0th element
    let ptr5_at_0 = ptr3_at_0.add(1).sub(1); // Ptr to 0th element


    *ptr3_at_0 += 3;
    *ptr2_at_0 += 2;
    *ptr4_at_0 += 4;
    *ptr5_at_0 += 5;
    *ptr3_at_0 += 3;
    *ptr2_at_0 += 2;
    *ref1_at_0 += 1;

    // Should be [20, 0, 0, ...]
    println!("{:?}", &data[..]);
}
```

```shell
$ cargo run
[20, 0, 0, 0, 0, 0, 0, 0, 0, 0]

MIRIFLAGS="-Zmiri-tag-raw-pointers" cargo +nightly-2022-01-21 miri run
[20, 0, 0, 0, 0, 0, 0, 0, 0, 0]
```

可以看出，`miri` 对于这种裸指针派生是相当纵容的：当它们都共享同一个借用时(borrowing, 也可以用 miri 的称呼： tag)。

> 当代码足够简单时，编译器是有可能介入跟踪所有派生的裸指针，并尽可能去优化它们的。但是这套规则比引用的那套脆弱得多！

那么问题来了：真正的问题到底是什么？

对于部分数据结构，Rust 允许对其中的字段进行独立借用，例如一个结构体，它的多个字段可以被分开借用，来试试这里的数组可不可以。

```rust
unsafe {
    let mut data = [0; 10];
    let ref1_at_0 = &mut data[0];           // Reference to 0th element
    let ref2_at_1 = &mut data[1];           // Reference to 1th element
    let ptr3_at_0 = ref1_at_0 as *mut i32;  // Ptr to 0th element
    let ptr4_at_1 = ref2_at_1 as *mut i32;   // Ptr to 1th element

    *ptr4_at_1 += 4;
    *ptr3_at_0 += 3;
    *ref2_at_1 += 2;
    *ref1_at_0 += 1;

    // Should be [3, 3, 0, ...]
    println!("{:?}", &data[..]);
}
```

```shell
error[E0499]: cannot borrow `data[_]` as mutable more than once at a time
 --> src\main.rs:5:21
  |
4 |     let ref1_at_0 = &mut data[0];           // Reference to 0th element
  |                     ------------ first mutable borrow occurs here
5 |     let ref2_at_1 = &mut data[1];           // Reference to 1th element
  |                     ^^^^^^^^^^^^ second mutable borrow occurs here
6 |     let ptr3_at_0 = ref1_at_0 as *mut i32;  // Ptr to 0th element
  |                     --------- first borrow later used here
  |
  = help: consider using `.split_at_mut(position)` or similar method 
    to obtain two mutable non-overlapping sub-slices
```

显然..不行，Rust 不允许我们对数组的不同元素进行单独的借用，注意到提示了吗？可以使用 `.split_at_mut(position)` 来将一个数组分成多个部分:
```rust
unsafe {
    let mut data = [0; 10];

    let slice1 = &mut data[..];
    let (slice2_at_0, slice3_at_1) = slice1.split_at_mut(1); 
    
    let ref4_at_0 = &mut slice2_at_0[0];    // Reference to 0th element
    let ref5_at_1 = &mut slice3_at_1[0];    // Reference to 1th element
    let ptr6_at_0 = ref4_at_0 as *mut i32;  // Ptr to 0th element
    let ptr7_at_1 = ref5_at_1 as *mut i32;  // Ptr to 1th element

    *ptr7_at_1 += 7;
    *ptr6_at_0 += 6;
    *ref5_at_1 += 5;
    *ref4_at_0 += 4;

    // Should be [10, 12, 0, ...]
    println!("{:?}", &data[..]);
}
```

```shell
$ cargo run
[10, 12, 0, 0, 0, 0, 0, 0, 0, 0]

MIRIFLAGS="-Zmiri-tag-raw-pointers" cargo +nightly-2022-01-21 miri run
[10, 12, 0, 0, 0, 0, 0, 0, 0, 0]
```

将数组切分成两个部分后，代码就成功了，如果我们将一个切片转换成指针呢？那指针是否还拥有访问整个切片的权限？

```rust
unsafe {
    let mut data = [0; 10];

    let slice1_all = &mut data[..];         // Slice for the entire array
    let ptr2_all = slice1_all.as_mut_ptr(); // Pointer for the entire array
    
    let ptr3_at_0 = ptr2_all;               // Pointer to 0th elem (the same)
    let ptr4_at_1 = ptr2_all.add(1);        // Pointer to 1th elem
    let ref5_at_0 = &mut *ptr3_at_0;        // Reference to 0th elem
    let ref6_at_1 = &mut *ptr4_at_1;        // Reference to 1th elem

    *ref6_at_1 += 6;
    *ref5_at_0 += 5;
    *ptr4_at_1 += 4;
    *ptr3_at_0 += 3;

    // 在循环中修改所有元素( 仅仅为了有趣 )
    // (可以使用任何裸指针，它们共享同一个借用!)
    for idx in 0..10 {
        *ptr2_all.add(idx) += idx;
    }

    // 同样为了有趣，再实现下安全版本的循环
    for (idx, elem_ref) in slice1_all.iter_mut().enumerate() {
        *elem_ref += idx; 
    }

    // Should be [8, 12, 4, 6, 8, 10, 12, 14, 16, 18]
    println!("{:?}", &data[..]);
}
```

```shell
$ cargo run
[8, 12, 4, 6, 8, 10, 12, 14, 16, 18]

MIRIFLAGS="-Zmiri-tag-raw-pointers" cargo +nightly-2022-01-21 miri run
[8, 12, 4, 6, 8, 10, 12, 14, 16, 18]
```

## 测试不可变引用
在之前的例子中，我们使用的都是可变引用，而 Rust 中还有不可变引用。那么它将如何工作呢？

我们已经见过裸指针可以被简单的拷贝只要它们共享同一个借用，那不可变引用是不是也可以这么做？

注意，下面的 `println` 会自动对待打印的目标值进行 `ref/deref` 等操作，因此为了保证测试的正确性，我们将其放入一个函数中。

```rust
fn opaque_read(val: &i32) {
    println!("{}", val);
}

unsafe {
    let mut data = 10;
    let mref1 = &mut data;
    let sref2 = &mref1;
    let sref3 = sref2;
    let sref4 = &*sref2;

    // Random hash of shared reference reads
    opaque_read(sref3);
    opaque_read(sref2);
    opaque_read(sref4);
    opaque_read(sref2);
    opaque_read(sref3);

    *mref1 += 1;

    opaque_read(&data);
}
```

```shell
$ cargo run

warning: unnecessary `unsafe` block
 --> src\main.rs:6:1
  |
6 | unsafe {
  | ^^^^^^ unnecessary `unsafe` block
  |
  = note: `#[warn(unused_unsafe)]` on by default

warning: `miri-sandbox` (bin "miri-sandbox") generated 1 warning

10
10
10
10
10
11
```

虽然这里没有使用裸指针，但是可以看到对于不可变引用而言，上面的使用方式不存在任何问题。下面来增加一些裸指针：
```rust
fn opaque_read(val: &i32) {
    println!("{}", val);
}

unsafe {
    let mut data = 10;
    let mref1 = &mut data;
    let ptr2 = mref1 as *mut i32;
    let sref3 = &*mref1;
    let ptr4 = sref3 as *mut i32;

    *ptr4 += 4;
    opaque_read(sref3);
    *ptr2 += 2;
    *mref1 += 1;

    opaque_read(&data);
}
```

```shell
$ cargo run

error[E0606]: casting `&i32` as `*mut i32` is invalid
  --> src/main.rs:11:20
   |
11 |         let ptr4 = sref3 as *mut i32;
   |                    ^^^^^^^^^^^^^^^^^             ^^^^^^^^^^^^^^^^^
```


可以看出，我们无法将一个不可变的引用转换成可变的裸指针，只能曲线救国了：
```rust
let ptr4 = sref3 as *const i32 as *mut i32;
```

如上，先将不可变引用转换成不可变的裸指针，然后再转换成可变的裸指针。

```shell
$ cargo run

14
17
```

编译器又一次满意了，再来看看 miri :
```shell
MIRIFLAGS="-Zmiri-tag-raw-pointers" cargo +nightly-2022-01-21 miri run

error: Undefined Behavior: no item granting write access to 
tag <1621> at alloc742 found in borrow stack.
  --> src\main.rs:13:5
   |
13 |     *ptr4 += 4;
   |     ^^^^^^^^^^ no item granting write access to tag <1621>
   |                at alloc742 found in borrow stack.
```

果然，miri 提示了，原因是当我们使用不可变引用时，就相当于承诺不会去修改其中的值，那 miri 发现了这种修改行为，自然会给予相应的提示。

对此，可以用一句话来简单总结：**在借用栈中，一个不可变引用，它上面的所有引用( 在它之后被推入借用栈的引用 )都只能拥有只读的权限。**

但是我们可以这样做:
```rust
fn opaque_read(val: &i32) {
    println!("{}", val);
}

unsafe {
    let mut data = 10;
    let mref1 = &mut data;
    let ptr2 = mref1 as *mut i32;
    let sref3 = &*mref1;
    let ptr4 = sref3 as *const i32 as *mut i32;

    opaque_read(&*ptr4);
    opaque_read(sref3);
    *ptr2 += 2;
    *mref1 += 1;

    opaque_read(&data);
}
```

可以看到，我们其实可以创建一个可变的裸指针，只要不去使用写操作，而是只使用读操作。

```shell
$ cargo run

10
10
13

MIRIFLAGS="-Zmiri-tag-raw-pointers" cargo +nightly-2022-01-21 miri run
10
10
13
```

再来检查下不可变的引用是否可以像平时一样正常弹出:
```rust
fn opaque_read(val: &i32) {
    println!("{}", val);
}

unsafe {
    let mut data = 10;
    let mref1 = &mut data;
    let ptr2 = mref1 as *mut i32;
    let sref3 = &*mref1;

    *ptr2 += 2;
    opaque_read(sref3); // Read in the wrong order?
    *mref1 += 1;

    opaque_read(&data);
}
```

```shell
$ cargo run

12
13

MIRIFLAGS="-Zmiri-tag-raw-pointers" cargo +nightly-2022-01-21 miri run

error: Undefined Behavior: trying to reborrow for SharedReadOnly 
at alloc742, but parent tag <1620> does not have an appropriate 
item in the borrow stack

  --> src\main.rs:13:17
   |
13 |     opaque_read(sref3); // Read in the wrong order?
   |                 ^^^^^ trying to reborrow for SharedReadOnly 
   |                       at alloc742, but parent tag <1620> 
   |                       does not have an appropriate item 
   |                       in the borrow stack
   |
```

细心的同学可能会发现，我们这次获得了一个相当具体的 miri 提示，而不是之前的某个 tag 。真是令人感动...毕竟这种错误信息会更有帮助。

## 测试内部可变性
还记得之前我们试图用 `RefCell` + `Rc` 去实现的那个糟糕的链表吗？这两个组合在一起就可以实现内部可变性。与 `RefCell` 类似的还有 [`Cell`](https://course.rs/advance/smart-pointer/cell-refcell.html#cell):
```rust
use std::cell::Cell;

unsafe {
    let mut data = Cell::new(10);
    let mref1 = &mut data;
    let ptr2 = mref1 as *mut Cell<i32>;
    let sref3 = &*mref1;

    sref3.set(sref3.get() + 3);
    (*ptr2).set((*ptr2).get() + 2);
    mref1.set(mref1.get() + 1);

    println!("{}", data.get());
}
```

地狱一般的代码，就等着 miri 来优化你吧。

```shell
$ cargo run

16

MIRIFLAGS="-Zmiri-tag-raw-pointers" cargo +nightly-2022-01-21 miri run
16
```

等等，竟然没有任何问题，我们需要深入调查下原因:
```rust
pub struct Cell<T: ?Sized> {
    value: UnsafeCell<T>,
}
```

以上是标准库中的 `Cell` 源码，可以看到里面有一个 `UnsafeCell`，通过名字都能猜到，这个数据结构相当的不安全，在[标准库](https://doc.rust-lang.org/std/cell/struct.UnsafeCell.html)中有以下描述:

> Rust 中用于内部可变性的核心原语( primitive )。
> 
> 如果你拥有一个引用 `&T`，那一般情况下, Rust编译器会基于 `&T` 指向不可变的数据这一事实来进行相关的优化。通过别名或者将 `&T` 强制转换成 `&mut T` 是一种 UB 行为。
> 
> 而 `UnsafeCell<T>` 移除了 `&T` 的不可变保证：一个不可变引用 `&UnsafeCell<T>` 指向一个可以改变的数据。，这就是内部可变性。

感觉像是魔法，那下面就用该魔法让 miri happy 下:
```rust
use std::cell::UnsafeCell;

fn opaque_read(val: &i32) {
    println!("{}", val);
}

unsafe {
    let mut data = UnsafeCell::new(10);
    let mref1 = &mut data;              // Mutable ref to the *outside*
    let ptr2 = mref1.get();             // Get a raw pointer to the insides
    let sref3 = &*mref1;                // Get a shared ref to the *outside*

    *ptr2 += 2;                         // Mutate with the raw pointer
    opaque_read(&*sref3.get());         // Read from the shared ref
    *sref3.get() += 3;                  // Write through the shared ref
    *mref1.get() += 1;                  // Mutate with the mutable ref

    println!("{}", *data.get());
}
```

```shell
$ cargo run

12
16

MIRIFLAGS="-Zmiri-tag-raw-pointers" cargo +nightly-2022-01-21 miri run
12
16
```

这段代码非常成功！但是等等..这里的代码顺序有问题：我们首先获取了内部的裸指针 `ptr2`，然后获取了一个不可变引用 `sref3`，接着我们使用了裸指针，然后是 `sref3`，这不就是标准的借用栈错误典范吗？既然如此，为何 miri 没有给出提示？

现在有两个解释:

- Miri 并不完美，它依然会有所遗漏，也会误判
- 我们的简化模型貌似过于简化了

大家选择哪个？..我不管，反正我选择第二个。不过，虽然我们的借用栈过于简单，但是依然是亲孩子嘛，最后再基于它来实现一个真正正确的版本:
```rust
use std::cell::UnsafeCell;

fn opaque_read(val: &i32) {
    println!("{}", val);
}

unsafe {
    let mut data = UnsafeCell::new(10);
    let mref1 = &mut data;
    // These two are swapped so the borrows are *definitely* totally stacked
    let sref2 = &*mref1;
    // Derive the ptr from the shared ref to be super safe!
    let ptr3 = sref2.get();             

    *ptr3 += 3;
    opaque_read(&*sref2.get());
    *sref2.get() += 2;
    *mref1.get() += 1;

    println!("{}", *data.get());
}
```

```shell
$ cargo run

13
16

MIRIFLAGS="-Zmiri-tag-raw-pointers" cargo +nightly-2022-01-21 miri run
13
16
```

## 测试 Box
大家还记得为何我们讲了这么长的两章借用栈吗？原因就在于 `Box` 和裸指针混合使用时出了问题。

`Box` 在某种程度上类似 `&mut`，因为对于它指向的内存区域，它拥有唯一的所有权。

```rust
unsafe {
    let mut data = Box::new(10);
    let ptr1 = (&mut *data) as *mut i32;

    *data += 10;
    *ptr1 += 1;

    // Should be 21
    println!("{}", data);
}
```

```shell
$ cargo run

21

MIRIFLAGS="-Zmiri-tag-raw-pointers" cargo +nightly-2022-01-21 miri run

error: Undefined Behavior: no item granting read access 
       to tag <1707> at alloc763 found in borrow stack.

 --> src\main.rs:7:5
  |
7 |     *ptr1 += 1;
  |     ^^^^^^^^^^ no item granting read access to tag <1707> 
  |                at alloc763 found in borrow stack.
  |
```

现在到现在为止，大家一眼就能看出来这种代码不符合借用栈的规则。当然, miri 也讨厌这一点，因此我们来改正下。

```rust
unsafe {
    let mut data = Box::new(10);
    let ptr1 = (&mut *data) as *mut i32;

    *ptr1 += 1;
    *data += 10;

    // Should be 21
    println!("{}", data);
}
```

```shell
$ cargo run

21

MIRIFLAGS="-Zmiri-tag-raw-pointers" cargo +nightly-2022-01-21 miri run
21
```

在经过这么长的旅程后，我们终于完成了借用栈的学习，兄弟们我已经累趴了，你们呢？

但是，话说回来，该如何使用 `Box` 来解决栈借用的问题？当然，我们可以像之前的测试例子一样写一些玩具代码，但是在实际链表中中，将 `Box` 存储在某个地方，然后长时间持有一个裸指针才是经常遇到的。

等等，你说链表？天呐，我都忘记了我们还在学习链表，那接下来，继续实现之前未完成的链表吧。
