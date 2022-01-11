# 引用与借用

上节中提到，如果仅仅支持通过转移所有权的方式获取一个值，那会让程序变得复杂。 Rust能否像其它编程语言一样，使用某个变量的指针或者引用呢？答案是可以。

Rust通过`借用(Borrowing)`这个概念来达成上述的目的: **获取变量的引用，称之为借用(borrowing)**。正如现实生活中，如果一个人拥有某样东西，你可以从他那里借来，当使用完毕后，也必须要物归原主.



### 引用与解引用

常规引用是一个指针类型，指向了对象存储的内存地址。在下面代码中，我们创建一个`i32`值的引用`y`，然后使用解引用运算符来解出`y`所使用的值:
```rust
fn main() {
    let x = 5;
    let y = &x;

    assert_eq!(5, x);
    assert_eq!(5, *y);
}
```

变量 `x` 存放了一个 `i32` 值 `5`。`y`是 `x` 的一个引用。可以断言 `x` 等于 `5`。然而，如果希望对 `y` 的值做出断言，必须使用 `*y` 来解出引用所指向的值（也就是 **解引用**）。一旦解引用了 `y`，就可以访问 `y` 所指向的整型值并可以与 `5` 做比较。

相反如果尝试编写 `assert_eq!(5, y);`，则会得到如下编译错误：

```text
error[E0277]: can't compare `{integer}` with `&{integer}`
 --> src/main.rs:6:5
  |
6 |     assert_eq!(5, y);
  |     ^^^^^^^^^^^^^^^^^ no implementation for `{integer} == &{integer}` // 无法比较整数类型和引用类型
  |
  = help: the trait `std::cmp::PartialEq<&{integer}>` is not implemented for
  `{integer}`
```

不允许比较整数与引用，因为它们是不同的类型。必须使用解引用运算符解出引用所指向的值。

### 不可变引用

下面的代码，我们用s1的引用作为参数传递给`calculate_length`函数，而不是把s1的所有权转移给该函数：
```rust
fn main() {
    let s1 = String::from("hello");

    let len = calculate_length(&s1);

    println!("The length of '{}' is {}.", s1, len);
}

fn calculate_length(s: &String) -> usize {
    s.len()
}
```

能注意到两点：
1. 无需像上章一样：先通过函数参数传入所有权，然后再通过函数返回来传出所有权，代码更加简洁
2. `calculate_length`的参数`s`类型从`String`变为`&String`

这里，`&`符号即是引用，它们允许你使用值，但是不获取所有权，如图所示：
<img alt="&String s pointing at String s1" src="/img/borrowing-01.svg" class="center" />

通过`&s1`语法，我们创建了一个**指向s1的引用**，但是并不拥有它。因为并不拥有这个值，当引用离开作用域后，其指向的值也不会被丢弃。

同理，函数`calculate_length`使用`&`来表明参数`s`的类型是一个引用：
```rust
fn calculate_length(s: &String) -> usize { // s 是对 String 的引用
    s.len()
} // 这里，s 离开了作用域。但因为它并不拥有引用值的所有权，
  // 所以什么也不会发生
```

人总是贪心的，可以拉女孩小手了，就想着抱抱柔软的身子(读者中的某老司机表示，这个流程完全不对)，因此光借用已经满足不了我们了，如果尝试修改借用的变量呢？
```rust
fn main() {
    let s = String::from("hello");

    change(&s);
}

fn change(some_string: &String) {
    some_string.push_str(", world");
}
```

很不幸，妹子你没抱到, 哦口误，你修改错了：
```console
error[E0596]: cannot borrow `*some_string` as mutable, as it is behind a `&` reference
 --> src/main.rs:8:5
  |
7 | fn change(some_string: &String) {
  |                        ------- help: consider changing this to be a mutable reference: `&mut String`
                           ------- 帮助：考虑将该参数类型修改为可变的引用: `&mut String`
8 |     some_string.push_str(", world");
  |     ^^^^^^^^^^^ `some_string` is a `&` reference, so the data it refers to cannot be borrowed as mutable
                     `some_string`是一个`&`类型的引用，因此它指向的数据无法进行修改
```

正如变量默认不可变一样，引用指向的值默认也是不可变的，没事，来一起看看如果解决这个问题。

### 可变引用

只需要一个小调整，既可以修复上面代码的错误：
```rust
fn main() {
    let mut s = String::from("hello");

    change(&mut s);
}

fn change(some_string: &mut String) {
    some_string.push_str(", world");
}
```

首先，声明`s`是可变类型，其次创建一个可变的引用`&mut s`和接受可变引用的函数`some_string: &mut String`。

##### 可变引用同时只能存在一个

不过可变引用并不是随心所欲、想用就用的，它有一个很大的限制：同一作用域，特定数据只能有一个可变引用:
```rust
let mut s = String::from("hello");

let r1 = &mut s;
let r2 = &mut s;

println!("{}, {}", r1, r2);
```

以上代码会报错：
```console
error[E0499]: cannot borrow `s` as mutable more than once at a time 同一时间无法对`s`进行两次可变借用
 --> src/main.rs:5:14
  |
4 |     let r1 = &mut s;
  |              ------ first mutable borrow occurs here 首个可变引用在这里借用
5 |     let r2 = &mut s;
  |              ^^^^^^ second mutable borrow occurs here 第二个可变引用在这里借用
6 |     
7 |     println!("{}, {}", r1, r2);
  |                        -- first borrow later used here 第一个借用在这里使用
  ```

这段代码出错的原因在于，第一个可变借用`r1`必须要持续到最后一次使用的位置`println!`，在`r1`创建和最后一次使用之间，我们又尝试创建第二个引用`r2`。

对于新手来说，这个特性绝对是一大拦路虎，也是新人们谈之色变的编译器`borrow checker`特性之一，不过各行各业都一样，限制往往是出于安全的考虑，Rust也一样。

这种限制的好处就是使Rust在编译期就避免数据竞争，数据竞争可由以下行为造成：
- 两个或更多的指针同时访问同一数据
- 至少有一个指针被用来写入数据
- 没有同步数据访问的机制

数据竞争会导致未定义行为，难以在运行时追踪，并且难以诊断和修复。而Rust避免了这种情况的发生，因为它甚至不会编译存在数据竞争的代码！

很多时候，大括号可以帮我们解决一些编译不通过的问题，通过手动限制变量的作用域：
```rust
let mut s = String::from("hello");

{
    let r1 = &mut s;

} // r1 在这里离开了作用域，所以我们完全可以创建一个新的引用

let r2 = &mut s;
```

##### 可变引用与不可变引用不能同时存在

下面的代码会导致一个错误：
```rust
let mut s = String::from("hello");

let r1 = &s; // 没问题
let r2 = &s; // 没问题
let r3 = &mut s; // 大问题

println!("{}, {}, and {}", r1, r2, r3);
```

错误如下：
```console
error[E0502]: cannot borrow `s` as mutable because it is also borrowed as immutable 无法借用可变`s`因为它已经被借用了不可变
 --> src/main.rs:6:14
  |
4 |     let r1 = &s; // 没问题
  |              -- immutable borrow occurs here 不可变借用发生在这里
5 |     let r2 = &s; // 没问题
6 |     let r3 = &mut s; // 大问题
  |              ^^^^^^ mutable borrow occurs here 可变借用发生在这里
7 |     
8 |     println!("{}, {}, and {}", r1, r2, r3);
  |                                -- immutable borrow later used here 不可变借用在这里使用
```

其实这个也很好理解，借用了不可变的用户，肯定不希望他借用的东西，被另外一个人莫名其妙改变了。多个不可变借用被允许是因为没有人会去试图修改数据，然后导致别人的数据被污染。

> 注意，引用的作用域s从创建开始，一直持续到它最后一次使用的地方，这个跟变量的作用域有所不同，变量的作用域从创建持续到某一个花括号`}`

Rust的编译器一直在优化，早期的时候，引用的作用域跟变量作用域是一致的，这对日常使用带来了很大的困扰，你必须非常小心的去安排可变、不可变变量的借用，免得无法通过编译，例如以下代码：
```rust
fn main() {
   let mut s = String::from("hello");

    let r1 = &s; 
    let r2 = &s; 
    println!("{} and {}", r1, r2);
    // 新编译器中，r1,r2作用域在这里结束

    let r3 = &mut s; 
    println!("{}", r3);
} // 老编译器中，r1、r2、r3作用域在这里结束
  // 新编译器中，r3作用域在这里结束
```

在老的编译器中（Rust 1.31前），将会报错，因为`r1`和`r2`的作用域在花括号`}`处结束，那么`r3`的借用就会触发**无法同时借用可变和不可变**的规则。

但是在新的编译器中，该代码将顺利通过，因为**引用作用域的结束位置从花括号变成最后一次使用的位置**,因此`r1`借用和`r2`借用在`println!`后，就结束了，此时`r3`可以顺利借用到可变引用。

#### NLL

对于这种编译器优化行为，Rust专门起了一个名字 - Non-Lexical Lifetimes(NLL)，专门用于找到某个引用在作用域(`}`)结束前就不再被使用的代码位置。

虽然这种借用错误有的时候会让我们很郁闷，但是你只要想想这是Rust提前帮你发现了潜在的bug，其实就开心了，虽然减慢了开发速度，但是从长期来看，大幅减少了后续开发和运维成本.


### 悬垂引用（Dangling References）

所谓悬垂指针是其指向的内存可能已经被分配给其它持有者。相比之下，在 Rust 中编译器确保引用永远也不会变成悬垂状态：当你拥有一些数据的引用，编译器确保数据不会在其引用之前离开作用域。

让我们尝试创建一个悬垂引用，Rust会抛出一个编译时错误：

```rust
fn main() {
    let reference_to_nothing = dangle();
}

fn dangle() -> &String {
    let s = String::from("hello");

    &s
}
```

这里是错误：

```text
error[E0106]: missing lifetime specifier
 --> src/main.rs:5:16
  |
5 | fn dangle() -> &String {
  |                ^ expected named lifetime parameter
  |
  = help: this function's return type contains a borrowed value, but there is no value for it to be borrowed from
help: consider using the `'static` lifetime
  |
5 | fn dangle() -> &'static String {
  |                ~~~~~~~~

```

错误信息引用了一个我们还未介绍的功能：生命周期（lifetimes）。[该章](../../advance/lifetime.md)会详细介绍生命周期。不过，如果你不理会生命周期部分，错误信息中确实包含了为什么这段代码有问题的关键信息：

```text
this function's return type contains a borrowed value, but there is no value for it to be borrowed from.
该函数返回了一个借用的值，但是已经找不到它所借用值的来源
```

仔细看看 `dangle` 代码的每一步到底发生了什么：


```rust
fn dangle() -> &String { // dangle 返回一个字符串的引用

    let s = String::from("hello"); // s 是一个新字符串

    &s // 返回字符串 s 的引用
} // 这里 s 离开作用域并被丢弃。其内存被释放。
  // 危险！
```

因为 `s` 是在 `dangle` 函数内创建的，当 `dangle` 的代码执行完毕后，`s` 将被释放, 但是此时我们又尝试去返回它的引用。这意味着这个引用会指向一个无效的 `String`，这可不对！

其中一个很好的解决方法是直接返回 `String`：

```rust
fn no_dangle() -> String {
    let s = String::from("hello");

    s
}
```

这样就没有任何错误了，最终`String`的**所有权被转移给外面的调用者**。


## 借用规则总结

总的来说，借用规则如下：
- 同一时刻，你只能拥有要么一个可变引用, 要么任意多个不可变引用
- 引用必须总是有效的
