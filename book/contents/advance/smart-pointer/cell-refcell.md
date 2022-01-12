# Cell和RefCell
Rust的编译器之严格，可以说是举世无双。特别是在所有权方面，Rust通过严格的规则来保证所有权和借用的正确性，最终为程序的安全保驾护航。

但是严格是一把双刃剑，带来安全提升的同时，损失了灵活性，有时甚至会让用户痛苦不堪、怨声载道。因此Rust提供了`Cell`和`RefCell`用于内部可变性, 简而言之，可以在拥有不可变引用的同时修改目标数据，对于正常的代码实现来说，这个是不可能做到的(要么一个可变借用，要么多个不可变借用).

> 内部可变性的实现是因为Rust使用了`unsafe`来做到这一点，但是对于使用者来说，这些都是透明的，因为这些不安全代码都被封装到了安全的API中

## Cell
Cell和RefCell在功能上没有区别，区别在于`Cell<T>`适用于`T`实现`Copy`的情况:
```rust
use std::cell::Cell;
fn main() {
  let c = Cell::new("asdf");
  let one = c.get();
  c.set("qwer");
  let two = c.get();
  println!("{},{}", one,two);
}
```

以上代码展示了`Cell`的基本用法，有几点值得注意:

- "asdf"是`&str`类型，它实现了`Copy`特征
- `c.get`用来取值，`c.set`用来设置新值

取到值保存在`one`变量后，还能同时进行修改，这个违背了Rust的借用规则，但是由于`Cell`的存在，我们很优雅的做到了这一点，但是如果你尝试在`Cell`中存放`String`：
```rust
 let c = Cell::new(String::from("asdf"));
 ```

编译器会立刻报错，因为`String`没有实现`Copy`特征:
```console
| pub struct String {
| ----------------- doesn't satisfy `String: Copy`
|
= note: the following trait bounds were not satisfied:
        `String: Copy`
```

## RefCell
由于`Cell`类型针对的是实现了`Copy`特征的值类型，因此在实际开发中，`Cell`使用的并不多，因为我们要解决的往往是可变、不可变引用共存导致的问题，此时就需要借助于`RefCell`来达成目的。

我们可以将所有权、借用规则与这些智能指针做一个对比:

| Rust规则 | 智能指针带来的额外规则 |
|--------|-------------|
| 一个数据只有一个所有者| `Rc/Arc`让一个数据可以拥有多个所有者 |
| 要么多个不可变借用，要么一个可变借用 | `RefCell`实现编译期可变、不可变引用共存 |
| 违背规则导致**编译错误** | 违背规则导致**运行时`panic`** | 

可以看出，`Rc/Arc`和`RefCell`合在一起，解决了Rust中严苛的所有权和借用规则带来的某些场景下难使用的问题。但是它们并不是银弹，例如`RefCell`实际上并没有解决可变引用和引用可以共存的问题，只是将报错从编译期推迟到运行时，从编译器错误变成了`panic`异常:
```rust
use std::cell::RefCell;

fn main() {
    let s = RefCell::new(String::from("hello, world"));
    let s1 = s.borrow();
    let s2 = s.borrow_mut();

    println!("{},{}",s1,s2);
}
```

上面代码在编译期不会报任何错误，你可以顺利运行程序：
```console
thread 'main' panicked at 'already borrowed: BorrowMutError', src/main.rs:6:16
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace
```

但是依然会因为违背了借用规则导致了运行期`panic`，这非常像中国的天网，它也许会被罪犯蒙蔽一时，但是并不会被蒙蔽一世，任何导致安全风险的存在都将不能被容忍，法网恢恢，疏而不漏。

#### RefCell为何存在
相信肯定有读者有疑问了，这么做有任何意义吗？还不如在编译期报错，至少能提前发现问题，而且性能还更好。

存在即合理，究其根因，在于Rust编译期的**宁可错杀，绝不放过**的原则, 当编译器不能确定你的代码是否正确时，就统统会判定为错误，因此难免会导致一些误报。

而`RefCell`正是**用于你确信代码是正确的，而编译器却发生了误判时**。

对于大型的复杂程序，也可以选择使用`RefCell`来让事情简化。例如在Rust编译器的[`ctxt结构体`](https://github.com/rust-lang/rust/blob/620d1ee5346bee10ba7ce129b2e20d6e59f0377d/src/librustc/middle/ty.rs#L803-L987)中有大量的`RefCell`类型的`map`字段, 主要的原因是：这些`map`会被分散在各个地方的代码片段所广泛使用或修改。由于这种分散在各处的使用方式，导致了管理可变和不可变成为一件非常复杂的任务(甚至不可能)，你很容易就碰到编译器抛出来的各种错误。而且`RefCell`的运行时错误在这种情况下也变得非常可爱：一旦有人做了不正确的使用，代码会`panic`，然后告诉我们哪些借用冲突了。

总之，当你确信编译器误报但不知道该如何解决时，或者你有一个引用类型，需要被四处使用和修改然后导致借用关系难以管理时，都可以优先考虑使用`RefCell`。


#### RefCell简单总结

- 与Cell用于可Copy的值不同，RefCell用于引用
- RefCell只是将借用规则从编译期推迟到程序运行期，并不能帮你绕过这个规则
- RefCell适用于编译期误报或者一个引用被在多个代码中使用、修改以至于难于管理借用关系时
- 使用`RefCell`时，违背借用规则会导致运行期的`panic`

## 选择`Cell`还是`RefCell`
根据本文的内容，我们可以大概总结下两者的区别：

- `Cell`只适用于`Copy`类型，用于提供值, 而`RefCell`用于提供引用
- `Cell`不会`panic`，而`RefCell`会

#### 性能比较
`Cell`没有额外的性能损耗，例如以下两段代码的性能其实是一致的:
```rust
// code snipet 1
let x = Cell::new(1);
let y = &x;
let z = &x;
x.set(2);
y.set(3);
z.set(4);
println!("{}", x.get());

// code snipet 2
let mut x = 1;
let y = &mut x;
let z = &mut x;
x = 2;
*y = 3;
*z = 4;
println!("{}", x;
```

虽然性能一致，但代码`1`拥有代码`2`不具有的优势：它能编译成功:)

与`Cell`的`zero cost`不同，`RefCell`其实是有一点运行期开销的，原因是它包含了一个字大小的"借用状态"指示器，该指示器在每次运行时借用时都会被修改，进而产生一点开销。


总之，当非要使用内部可变性时，首选`Cell`，只有值拷贝的方式不能满足你时，才去选择`RefCell`。


## 内部可变性
之前我们提到RefCell具有内部可变性，何为内部可变性？简单来说，对一个不可变的值进行可变借用，但这个并不符合Rust的基本借用规则：
```rust
fn main() {
    let x = 5;
    let y = &mut x;
}
```

上面的代码会报错，因为我们不能对一个不可变的值进行可变借用，这会破坏Rust的安全性保证，相反，你可以对一个可变值进行不可变借用。原因是：当值不可变时，可能会有多个不可变的引用指向它，修改其中一个为可变的，会造成可变引用与不可变引用共存的情况；而当值可变时，只会有唯一一个可变引用指向它，将其修改为不可变，那么最终依然是只有一个不可变的引用指向它。

虽然基本借用规则是Rust的基石，然而在某些场景中，一个值可以在其方法内部被修改，同时对于其它代码不可变，是很有用的:
```rust
// 定义在外部库中的特征
pub trait Messenger {
    fn send(&self, msg: String);
}

// --------------------------
// 我们的代码中的数据结构和实现
struct MsgQueue {
    msg_cache: Vec<String>,  
}

impl Messenger for MsgQueue {
    fn send(&self,msg: String) {
        self.msg_cache.push(msg)
    }
}
```

如上所示，外部库中定义了一个消息发送器特征`Messenger`，它就一个功能用于发送消息: `fn send(&self, msg: String)`，因为发送消息不需要修改自身，因此原作者在定义时，使用了`&self`的不可变借用, 这个无可厚非。

但是问题来了，我们要在自己的代码中使用该特征实现一个异步消息队列，出于性能的考虑，消息先写到本地缓存(内存)中，然后批量发送出去，因此在`send`方法中，需要将消息先行插入到本地缓存`msg_cache`中。但是问题来了，该`send`方法的签名是`&self`，因此上述代码会报错:
```console
error[E0596]: cannot borrow `self.sent_messages` as mutable, as it is behind a `&` reference
  --> src/main.rs:11:9
   |
2  |     fn send(&self, msg: String);
   |             ----- help: consider changing that to be a mutable reference: `&mut self`
...
11 |         self.sent_messages.push(msg)
   |         ^^^^^^^^^^^^^^^^^^ `self` is a `&` reference, so the data it refers to cannot be borrowed as mutable
```

在报错的同时，编译器大聪明还善意的给出了提示：将`&self`修改为`&mut self`，但是。。。我们实现的特征是定义在外部库中，因此该签名根本不能修改。值此危急关头，`RefCell`闪亮登场:
```rust
use std::cell::RefCell;
pub trait Messenger {
    fn send(&self, msg: String);
}

pub struct MsgQueue {
    msg_cache: RefCell<Vec<String>>,  
}

impl Messenger for MsgQueue {
    fn send(&self,msg: String) {
        self.msg_cache.borrow_mut().push(msg)
    }
}

fn main() {
    let mq = MsgQueue{msg_cache: RefCell::new(Vec::new())};
    mq.send("hello, world".to_string());
}
```

这个MQ功能很弱，但是并不妨碍我们演示内部可变性的核心用法：通过包裹一层`RefCell`，成功的让`&self`中的`msg_cache`成为一个可变值，然后实现对其的修改。

##  Rc + RefCell组合使用
在Rust中，一个常见的组合就是`Rc`和`RefCell`在一起使用，前者可以实现一个数据拥有多个所有者，后者可以实现数据的可变性:
```rust
use std::cell::RefCell;
use std::rc::Rc;
fn main() {
    let s = Rc::new(RefCell::new("我很善变，还拥有多个主人".to_string()));

    let s1 = s.clone();
    let s2 = s.clone();
    // let mut s2 = .borrow_mut();
    s2.borrow_mut().push_str(", on yeah!");

    println!("{:?}\n{:?}\n{:?}", s, s1, s2);
}

```

上面代码中，我们使用`RefCell<String>`包裹一个字符串,同时通过`Rc`创建了它的三个所有者：`s`,`s1`和`s2`，并且通过其中一个所有者`s2`对字符串内容进行了修改。

由于`Rc`的所有者们共享同一个底层的数据，因此当一个所有者修改了数据时，会导致全部所有者持有的数据都发生了变化。

程序的运行结果也在预料之中：
```console
RefCell { value: "我很善变，还拥有多个主人, on yeah!" }
RefCell { value: "我很善变，还拥有多个主人, on yeah!" }
RefCell { value: "我很善变，还拥有多个主人, on yeah!" }
```


#### 性能损耗
相信这两者组合在一起使用时，很多人会好奇到底性能如何，下面我们来简单分析下。

首先给出一个大概的结论，这两者结合在一起使用的性能其实非常高，大致相当于没有线程安全版本的C++ `std::shared_ptr`指针, 事实上，`C++`这个指针的主要开销也在于原子性这个并发原语上，毕竟线程安全在哪个语言中开销都不小。

#### 内存损耗
两者结合的数据结构类似:
```rust
struct Wrapper<T> {
    // Rc
    strong_count: usize,
    weak_count: usize,

    // Refcell
    borrow_count: isize,

    // 包裹的数据
    item: T,
}
```

从上面可以看出，从对内存的影响来看，仅仅多分配了三个`usize/isize`，并没有其它额外的负担。

#### CPU损耗
从CPU来看，损耗如下：

- 对`Rc<T>`解引用是免费的(编译期), 但是*带来的间接取值并不免费
- 克隆`Rc<T>`需要将当前的引用计数跟`0`和`usize::Max`进行一次比较，然后将计数值加1
- 释放(drop)`Rc<T>`将计数值减1， 然后跟`0`进行一次比较
- 对`RefCell`进行不可变借用，将`isize`类型的借用计数加1，然后跟`0`进行比较
- 对`RefCell`的不可变借用进行释放，将`isize`减1
- 对`RefCell`的可变借用大致流程跟上面差不多，但是是先跟`0`比较，然后再减1
- 对`RefCell`的可变借用进行释放，将`isize`加1

其实这些细节不必过于关注，只要知道`CPU`消耗也非常低，甚至编译器还会对此进行进一步优化！


#### CPU缓存Miss
唯一需要担心的可能就是这种组合数据结构对于`CPU`缓存是否亲和，这个我们无法证明，只能提出来存在这个可能性，最终的性能影响还需要在实际场景中进行测试

总之，分析这两者组合的性能还挺复杂的，大概总结下:

- 从表面来看，它们带来的内存和CPU损耗都不大
- 但是由于`Rc`额外的引入了一次间接取值(*)，在少数场景下可能会造成性能上的显著损失
- CPU缓存可能也不够亲和

## 通过`Cell::from_mut`解决借用冲突
在Rust1.37版本中新增了两个非常实用的方法:

- Cell::from_mut, 该方法将`&mut T`转为`&Cell<T>`
- Cell::as_slice_of_cells，该方法将`&Cell<[T]>`转为`&[Cell<T>]`

这里我们不做深入的介绍，但是来看看如何使用这两个方法来解决一个常见的借用冲突问题：
```rust
fn is_even(i: i32) -> bool {
    i % 2 == 0
}

fn retain_even(nums: &mut Vec<i32>) {
    let mut i = 0;
    for num in nums.iter().filter(|&num| is_even(*num)) {
        nums[i] = *num;
        i += 1;
    }
    nums.truncate(i);
}
```
以上代码会报错：
```console
error[E0502]: cannot borrow `*nums` as mutable because it is also borrowed as immutable
 --> src/main.rs:8:9
  |
7 |     for num in nums.iter().filter(|&num| is_even(*num)) {
  |                ----------------------------------------
  |                |
  |                immutable borrow occurs here
  |                immutable borrow later used here
8 |         nums[i] = *num;
  |         ^^^^ mutable borrow occurs here
```

很明显，因为同时借用了不可变与可变引用，你可以通过索引的方式来绕过:
```rust
fn retain_even(nums: &mut Vec<i32>) {
    let mut i = 0;
    for j in 0..nums.len() {
        if is_even(nums[j]) {
            nums[i] = nums[j];
            i += 1;
        }
    }
    nums.truncate(i);
}
```

但是这样就违背我们的初衷了，而且迭代器会让代码更加简洁，还有其它的办法吗？

这时就可以使用`Cell`新增的这两个方法:
```rust
use std::cell::Cell;

fn retain_even(nums: &mut Vec<i32>) {
    let slice: &[Cell<i32>] = Cell::from_mut(&mut nums[..])
        .as_slice_of_cells();

    let mut i = 0;
    for num in slice.iter().filter(|num| is_even(num.get())) {
        slice[i].set(num.get());
        i += 1;
    }

    nums.truncate(i);
}
```

此时代码将不会报错，因为`Cell`上的`set`方法获取的是不可变引用`pub fn set(&self, val: T) {`.

当然，以上代码的本质还是对`Cell`的运用，只不过这两个方法可以很方便的帮我们把`&mut T`类型转换成`&[Cell<T>]`类型。


## 总结
`Cell`和`RefCell`都为我们带来了内部可见性这个重要特性，同时还将借用规则的检查从编译期推迟到运行期，但是这个检查并不能被绕过，该来早晚还是会来，`RefCell在运行期的报错会造成`panic`

`RefCell`适用于编译器误报或者一个引用被在多个代码中使用、修改以至于难于管理借用关系时，还有就是需要内部可变性时。

从性能上看，`RefCell`由于是非线程安全的，因此无需保证原子性，性能虽然有一点损耗，但是依然非常好，而`Cell`则完全不存在任何额外的性能损耗。

`Rc`跟`RefCell`结合使用可以实现多个所有者共享同一份数据，非常好用，但是潜在的性能损耗也要考虑进去，建议对于热点代码使用时，做好`benchmark`.

