# 五种兵器

古龙有一部小说，名为"七种兵器"，其中每一种都精妙绝伦，令人闻风丧胆，而 `unsafe` 也有五种兵器，它们可以让你拥有其它代码无法实现的能力，同时它们也像七种兵器一样令人闻风丧胆，下面一起来看看庐山真面目。

## 解引用裸指针

裸指针(raw pointer，又称原生指针) 在功能上跟引用类似，同时它也需要显式地注明可变性。但是又和引用有所不同，裸指针长这样: `*const T` 和 `*mut T`，它们分别代表了不可变和可变。

大家在之前学过 `*` 操作符，知道它可以用于解引用，但是在裸指针 `*const T` 中，这里的 `*` 只是类型名称的一部分，并没有解引用的含义。

至此，我们已经学过三种类似指针的概念：引用、智能指针和裸指针。与前两者不同，裸指针：

- 可以绕过 Rust 的借用规则，可以同时拥有一个数据的可变、不可变指针，甚至还能拥有多个可变的指针
- 并不能保证指向合法的内存
- 可以是 `null`
- 没有实现任何自动的回收 (drop)

总之，裸指针跟 C 指针是非常像的，使用它需要以牺牲安全性为前提，但我们获得了更好的性能，也可以跟其它语言或硬件打交道。

#### 基于引用创建裸指针

下面的代码**基于值的引用**同时创建了可变和不可变的裸指针：

```rust
let mut num = 5;

let r1 = &num as *const i32;
let r2 = &mut num as *mut i32;
```

`as` 可以用于强制类型转换，在[之前章节](https://course.rs/basic/converse.html)中有讲解。在这里，我们将引用 `&num / &mut num` 强转为相应的裸指针 `*const i32 / *mut i32`。

细心的同学可能会发现，在这段代码中并没有 `unsafe` 的身影，原因在于：**创建裸指针是安全的行为，而解引用裸指针才是不安全的行为** :

```rust
fn main() {
    let mut num = 5;

    let r1 = &num as *const i32;

    unsafe {
        println!("r1 is: {}", *r1);
    }
}
```

#### 基于内存地址创建裸指针

在上面例子中，我们基于现有的引用来创建裸指针，这种行为是很安全的。但是接下来的方式就不安全了：

```rust
let address = 0x012345usize;
let r = address as *const i32;
```

这里基于一个内存地址来创建裸指针，可以想像，这种行为是相当危险的。试图使用任意的内存地址往往是一种未定义的行为(undefined behavior)，因为该内存地址有可能存在值，也有可能没有，就算有值，也大概率不是你需要的值。

同时编译器也有可能会优化这段代码，会造成没有任何内存访问发生，甚至程序还可能发生段错误(segmentation fault)。**总之，你几乎没有好的理由像上面这样实现代码，虽然它是可行的**。

如果真的要使用内存地址，也是类似下面的用法，先取地址，再使用，而不是凭空捏造一个地址：

```rust
use std::{slice::from_raw_parts, str::from_utf8_unchecked};

// 获取字符串的内存地址和长度
fn get_memory_location() -> (usize, usize) {
  let string = "Hello World!";
  let pointer = string.as_ptr() as usize;
  let length = string.len();
  (pointer, length)
}

// 在指定的内存地址读取字符串
fn get_str_at_location(pointer: usize, length: usize) -> &'static str {
  unsafe { from_utf8_unchecked(from_raw_parts(pointer as *const u8, length)) }
}

fn main() {
  let (pointer, length) = get_memory_location();
  let message = get_str_at_location(pointer, length);
  println!(
    "The {} bytes at 0x{:X} stored: {}",
    length, pointer, message
  );
  // 如果大家想知道为何处理裸指针需要 `unsafe`，可以试着反注释以下代码
  // let message = get_str_at_location(1000, 10);
}
```

以上代码同时还演示了访问非法内存地址会发生什么，大家可以试着去反注释这段代码试试。

#### 使用 \* 解引用

```rust
let a = 1;
let b: *const i32 = &a as *const i32;
let c: *const i32 = &a;
unsafe {
    println!("{}", *c);
}
```

使用 `*` 可以对裸指针进行解引用，由于该指针的内存安全性并没有任何保证，因此我们需要使用 `unsafe` 来包裹解引用的逻辑(切记，`unsafe` 语句块的范围一定要尽可能的小，具体原因在上一章节有讲)。

以上代码另一个值得注意的点就是：除了使用 `as` 来显式的转换，我们还使用了隐式的转换方式 `let c: *const i32 = &a;`。在实际使用中，我们建议使用 `as` 来转换，因为这种显式的方式更有助于提醒用户：你在使用的指针是裸指针，需要小心。

#### 基于智能指针创建裸指针

还有一种创建裸指针的方式，那就是基于智能指针来创建:

```rust
let a: Box<i32> = Box::new(10);
// 需要先解引用a
let b: *const i32 = &*a;
// 使用 into_raw 来创建
let c: *const i32 = Box::into_raw(a);
```

#### 小结

像之前代码演示的那样，使用裸指针可以让我们创建两个可变指针都指向同一个数据，如果使用安全的 Rust，你是无法做到这一点的，违背了借用规则，编译器会对我们进行无情的阻止。因此裸指针可以绕过借用规则，但是由此带来的数据竞争问题，就需要大家自己来处理了，总之，需要小心！

既然这么危险，为何还要使用裸指针？除了之前提到的性能等原因，还有一个重要用途就是跟 `C` 语言的代码进行交互( FFI )，在讲解 FFI 之前，先来看看如何调用 unsafe 函数或方法。

## 调用 unsafe 函数或方法

`unsafe` 函数从外表上来看跟普通函数并无区别，唯一的区别就是它需要使用 `unsafe fn` 来进行定义。这种定义方式是为了告诉调用者：当调用此函数时，你需要注意它的相关需求，因为 Rust 无法担保调用者在使用该函数时能满足它所需的一切需求。

强制调用者加上 `unsafe` 语句块，就可以让他清晰的认识到，正在调用一个不安全的函数，需要小心看看文档，看看函数有哪些特别的要求需要被满足。

```rust
unsafe fn dangerous() {}
fn main() {
    dangerous();
}
```

如果试图像上面这样调用，编译器就会报错：

```shell
error[E0133]: call to unsafe function is unsafe and requires unsafe function or block
 --> src/main.rs:3:5
  |
3 |     dangerous();
  |     ^^^^^^^^^^^ call to unsafe function
```

按照报错提示，加上 `unsafe` 语句块后，就能顺利执行了:

```rust
unsafe {
    dangerous();
}
```

道理很简单，但一定要牢记在心：**使用 unsafe 声明的函数时，一定要看看相关的文档，确定自己没有遗漏什么**。

还有，`unsafe` 无需俄罗斯套娃，在 `unsafe` 函数体中使用 `unsafe` 语句块是多余的行为。

## 用安全抽象包裹 unsafe 代码

一个函数包含了 `unsafe` 代码不代表我们需要将整个函数都定义为 `unsafe fn`。事实上，在标准库中有大量的安全函数，它们内部都包含了 `unsafe` 代码块，下面我们一起来看看一个很好用的标准库函数：`split_at_mut`。

大家可以想象一下这个场景：需要将一个数组分成两个切片，且每一个切片都要求是可变的。类似需求在安全 Rust 中是很难实现的，因为要对同一个数组做两个可变借用：

```rust
fn split_at_mut(slice: &mut [i32], mid: usize) -> (&mut [i32], &mut [i32]) {
    let len = slice.len();

    assert!(mid <= len);

    (&mut slice[..mid], &mut slice[mid..])
}

fn main() {
    let mut v = vec![1, 2, 3, 4, 5, 6];

    let r = &mut v[..];

    let (a, b) = r.split_at_mut(3);

    assert_eq!(a, &mut [1, 2, 3]);
    assert_eq!(b, &mut [4, 5, 6]);
}
```

上面代码一眼看过去就知道会报错，因为我们试图在自定义的 `split_at_mut` 函数中，可变借用 `slice` 两次：

```shell
error[E0499]: cannot borrow `*slice` as mutable more than once at a time
 --> src/main.rs:6:30
  |
1 | fn split_at_mut(slice: &mut [i32], mid: usize) -> (&mut [i32], &mut [i32]) {
  |                        - let's call the lifetime of this reference `'1`
...
6 |     (&mut slice[..mid], &mut slice[mid..])
  |     -------------------------^^^^^--------
  |     |     |                  |
  |     |     |                  second mutable borrow occurs here
  |     |     first mutable borrow occurs here
  |     returning this value requires that `*slice` is borrowed for `'1`
```

对于 Rust 的借用检查器来说，它无法理解我们是分别借用了同一个切片的两个不同部分，但事实上，这种行为是没任何问题的，毕竟两个借用没有任何重叠之处。总之，不太聪明的 Rust 编译器阻碍了我们用这种简单且安全的方式去实现，那只能剑走偏锋，试试 `unsafe` 了。

```rust
use std::slice;

fn split_at_mut(slice: &mut [i32], mid: usize) -> (&mut [i32], &mut [i32]) {
    let len = slice.len();
    let ptr = slice.as_mut_ptr();

    assert!(mid <= len);

    unsafe {
        (
            slice::from_raw_parts_mut(ptr, mid),
            slice::from_raw_parts_mut(ptr.add(mid), len - mid),
        )
    }
}
```

相比安全实现，这段代码就显得没那么好理解了，甚至于我们还需要像 C 语言那样，通过指针地址的偏移去控制数组的分割。

- `as_mut_ptr` 会返回指向 `slice` 首地址的裸指针 `*mut i32`
- `slice::from_raw_parts_mut` 函数通过指针和长度来创建一个新的切片，简单来说，该切片的初始地址是 `ptr`，长度为 `mid`
- `ptr.add(mid)` 可以获取第二个切片的初始地址，由于切片中的元素是 `i32` 类型，每个元素都占用了 4 个字节的内存大小，因此我们不能简单的用 `ptr + mid` 来作为初始地址，而应该使用 `ptr + 4 * mid`，但是这种使用方式并不安全，因此 `.add` 方法是最佳选择

由于 `slice::from_raw_parts_mut` 使用裸指针作为参数，因此它是一个 `unsafe fn`，我们在使用它时，就必须用 `unsafe` 语句块进行包裹，类似的，`.add` 方法也是如此(还是那句话，不要将无关的代码包含在 `unsafe` 语句块中)。

部分同学可能会有疑问，那这段代码我们怎么保证 `unsafe` 中使用的裸指针 `ptr` 和 `ptr.add(mid)` 是合法的呢？秘诀就在于 `assert!(mid <= len);` ，通过这个断言，我们保证了裸指针一定指向了 `slice` 切片中的某个元素，而不是一个莫名其妙的内存地址。

再回到我们的主题：**虽然 split_at_mut 使用了 `unsafe`，但我们无需将其声明为 `unsafe fn`**，这种情况下就是使用安全的抽象包裹 `unsafe` 代码，这里的 `unsafe` 使用是非常安全的，因为我们从合法数据中创建了的合法指针。

与之对比，下面的代码就非常危险了:

```rust
use std::slice;

let address = 0x01234usize;
let r = address as *mut i32;

let slice: &[i32] = unsafe { slice::from_raw_parts_mut(r, 10000) };
println!("{:?}",slice);
```

这段代码从一个任意的内存地址，创建了一个 10000 长度的 `i32` 切片，我们无法保证切片中的元素都是合法的 `i32` 值，这种访问就是一种未定义行为(UB = undefined behavior)。

```shell
zsh: segmentation fault
```

不出所料，运行后看到了一个段错误。

## FFI

`FFI`（Foreign Function Interface）可以用来与其它语言进行交互，但是并不是所有语言都这么称呼，例如 Java 称之为 `JNI（Java Native Interface）`。

`FFI` 之所以存在是由于现实中很多代码库都是由不同语言编写的，如果我们需要使用某个库，但是它是由其它语言编写的，那么往往只有两个选择：

- 对该库进行重写或者移植
- 使用 `FFI`

前者相当不错，但是在很多时候，并没有那么多时间去重写，因此 `FFI` 就成了最佳选择。回到 Rust 语言上，由于这门语言依然很年轻，一些生态是缺失的，我们在写一些不是那么大众的项目时，可能会同时遇到没有相应的 Rust 库可用的尴尬境况，此时通过 `FFI` 去调用 C 语言的库就成了相当棒的选择。

还有在将 C/C++ 的代码重构为 Rust 时，先将相关代码引入到 Rust 项目中，然后逐步重构，也是不错的(为什么用不错来形容？因为重构一个有一定规模的 C/C++ 项目远没有想象中美好，因此最好的选择还是对于新项目使用 Rust 实现，老项目。。就让它先运行着吧)。

当然，除了 `FFI` 还有一个办法可以解决跨语言调用的问题，那就是将其作为一个独立的服务，然后使用网络调用的方式去访问，HTTP，gRPC 都可以。

言归正传，之前我们提到 `unsafe` 的另一个重要目的就是对 `FFI` 提供支持，它的全称是 `Foreign Function Interface`，顾名思义，通过 `FFI` , 我们的 Rust 代码可以跟其它语言的外部代码进行交互。

下面的例子演示了如何调用 C 标准库中的 `abs` 函数：

```rust
extern "C" {
    fn abs(input: i32) -> i32;
}

fn main() {
    unsafe {
        println!("Absolute value of -3 according to C: {}", abs(-3));
    }
}
```

C 语言的代码定义在了 `extern` 代码块中， 而 `extern` 必须使用 `unsafe` 才能进行进行调用，原因在于其它语言的代码并不会强制执行 Rust 的规则，因此 Rust 无法对这些代码进行检查，最终还是要靠开发者自己来保证代码的正确性和程序的安全性。

#### ABI

在 `exetrn "C"` 代码块中，我们列出了想要调用的外部函数的签名。其中 `"C"` 定义了外部函数所使用的**应用二进制接口**`ABI` (Application Binary Interface)：`ABI` 定义了如何在汇编层面来调用该函数。在所有 `ABI` 中，C 语言的是最常见的。

#### 在其它语言中调用 Rust 函数

在 Rust 中调用其它语言的函数是让 Rust 利用其他语言的生态，那反过来可以吗？其他语言可以利用 Rust 的生态不？答案是肯定的。

我们可以使用 `extern` 来创建一个接口，其它语言可以通过该接口来调用相关的 Rust 函数。但是此处的语法与之前有所不同，之前用的是语句块，而这里是在函数定义时加上 `extern` 关键字，当然，别忘了指定相应的 `ABI`：

```rust
#[no_mangle]
pub extern "C" fn call_from_c() {
    println!("Just called a Rust function from C!");
}
```

上面的代码可以让 `call_from_c` 函数被 `C` 语言的代码调用，当然，前提是将其编译成一个共享库，然后链接到 C 语言中。

这里还有一个比较奇怪的注解 `#[no_mangle]`，它用于告诉 Rust 编译器：不要乱改函数的名称。 `Mangling` 的定义是：当 Rust 因为编译需要去修改函数的名称，例如为了让名称包含更多的信息，这样其它的编译部分就能从该名称获取相应的信息，这种修改会导致函数名变得相当不可读。

因此，为了让 Rust 函数能顺利被其它语言调用，我们必须要禁止掉该功能。

## 访问或修改一个可变的静态变量

这部分我们在之前的[全局变量章节](https://course.rs/advance/global-variable.html#静态变量)中有过详细介绍，这里就不再赘述，大家可以前往此章节阅读。

## 实现 unsafe 特征

说实话，`unsafe` 的特征确实不多见，如果大家还记得的话，我们在之前的 [Send 和 Sync](https://course.rs/advance/concurrency-with-threads/send-sync.html#为裸指针实现sync) 章节中实现过 `unsafe` 特征 `Send`。

之所以会有 `unsafe` 的特征，是因为该特征至少有一个方法包含有编译器无法验证的内容。`unsafe` 特征的声明很简单：

```rust
unsafe trait Foo {
    // 方法列表
}

unsafe impl Foo for i32 {
    // 实现相应的方法
}

fn main() {}
```

通过 `unsafe impl` 的使用，我们告诉编译器：相应的正确性由我们自己来保证。

再回到刚提到的 `Send` 特征，若我们的类型中的所有字段都实现了 `Send` 特征，那该类型也会自动实现 `Send`。但是如果我们想要为某个类型手动实现 `Send` ，例如为裸指针，那么就必须使用 `unsafe`，相关的代码在之前的链接中也有，大家可以移步查看。

总之，`Send` 特征标记为 `unsafe` 是因为 Rust 无法验证我们的类型是否能在线程间安全的传递，因此就需要通过 `unsafe` 来告诉编译器，它无需操心，剩下的交给我们自己来处理。

## 访问 union 中的字段

截止目前，我们还没有介绍过 `union` ，原因很简单，它主要用于跟 `C` 代码进行交互。

访问 `union` 的字段是不安全的，因为 Rust 无法保证当前存储在 `union` 实例中的数据类型。

```rust
#[repr(C)]
union MyUnion {
    f1: u32,
    f2: f32,
}
```

上从可以看出，`union` 的使用方式跟结构体确实很相似，但是前者的所有字段都共享同一个存储空间，意味着往 `union` 的某个字段写入值，会导致其它字段的值会被覆盖。

关于 `union` 的更多信息，可以在[这里查看](https://doc.rust-lang.org/reference/items/unions.html)。

## 一些实用工具(库)

由于 `unsafe` 和 `FFI` 在 Rust 的使用场景中是相当常见的(例如相对于 Go 的 `unsafe` 来说)，因此社区已经开发出了相当一部分实用的工具，可以改善相应的开发体验。

#### rust-bindgen 和 cbindgen

对于 `FFI` 调用来说，保证接口的正确性是非常重要的，这两个库可以帮我们自动生成相应的接口，其中 [`rust-bindgen`](https://github.com/rust-lang/rust-bindgen) 用于在 Rust 中访问 C 代码，而 [`cbindgen`](https://github.com/eqrion/cbindgen/)则反之。

下面以 `rust-bindgen` 为例，来看看如何自动生成调用 C 的代码，首先下面是 C 代码:

```c
typedef struct Doggo {
    int many;
    char wow;
} Doggo;

void eleven_out_of_ten_majestic_af(Doggo* pupper);
```

下面是自动生成的可以调用上面代码的 Rust 代码：

```rust
/* automatically generated by rust-bindgen 0.99.9 */

#[repr(C)]
pub struct Doggo {
    pub many: ::std::os::raw::c_int,
    pub wow: ::std::os::raw::c_char,
}

extern "C" {
    pub fn eleven_out_of_ten_majestic_af(pupper: *mut Doggo);
}
```

#### cxx

如果需要跟 C++ 代码交互，非常推荐使用 [`cxx`](https://github.com/dtolnay/cxx)，它提供了双向的调用，最大的优点就是安全：是的，你无需通过 `unsafe` 来使用它！

#### Miri

[`miri`](https://github.com/rust-lang/miri) 可以生成 Rust 的中间层表示 MIR，对于编译器来说，我们的 Rust 代码首先会被编译为 MIR ，然后再提交给 LLVM 进行处理。

可以通过 `rustup component add miri` 来安装它，并通过 `cargo miri` 来使用，同时还可以使用 `cargo miri test` 来运行测试代码。

`miri` 可以帮助我们检查常见的未定义行为(UB = Undefined Behavior)，以下列出了一部分:

- 内存越界检查和内存释放后再使用(use-after-free)
- 使用未初始化的数据
- 数据竞争
- 内存对齐问题

但是需要注意的是，它只能帮助识别被执行代码路径的风险，那些未被执行到的代码是没办法被识别的。

#### Clippy

官方的 [`clippy`](https://github.com/rust-lang/rust-clippy) 检查器提供了有限的 `unsafe` 支持，虽然不多，但是至少有一定帮助。例如 `missing_safety_docs` 检查可以帮助我们检查哪些 `unsafe` 函数遗漏了文档。

需要注意的是： Rust 编译器并不会默认开启所有检查，大家可以调用 `rustc -W help` 来看看最新的信息。

#### Prusti

[`prusti`](https://viperproject.github.io/prusti-dev/user-guide/) 需要大家自己来构建一个证明，然后通过它证明代码中的不变量是正确被使用的，当你在安全代码中使用不安全的不变量时，就会非常有用。具体的使用文档见[这里](https://viperproject.github.io/prusti-dev/user-guide/)。

#### 模糊测试(fuzz testing)

在 [Rust Fuzz Book](https://rust-fuzz.github.io/book/) 中列出了一些 Rust 可以使用的模糊测试方法。

同时，我们还可以使用 [`rutenspitz`](https://github.com/jakubadamw/rutenspitz) 这个过程宏来测试有状态的代码，例如数据结构。

## 总结

至此，`unsafe` 的五种兵器已介绍完毕，大家是否意犹未尽？我想说的是，就算意犹未尽，也没有其它兵器了。

就像上一章中所提到的，`unsafe` 只应该用于这五种场景，其它场景，你应该坚决的使用安全的代码，否则就会像 `actix-web` 的前作者一样，被很多人议论，甚至被喷。。。

总之，能不使用 `unsafe` 一定不要使用，就算使用也要控制好边界，让范围尽可能的小，就像本章的例子一样，只有真的需要 `unsafe` 的代码，才应该包含其中, 而不是将无关代码也纳入进来。

## 进一步学习

1. [Unsafe Rust: How and when (not) to use it](https://blog.logrocket.com/unsafe-rust-how-and-when-not-to-use-it/)

