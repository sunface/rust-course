# 字符串

在其他语言，字符串往往是送分题，因为实在是太简单了，例如`"hello, world"`就是字符串章节的几乎全部内容了，对吧？如果你带着这样的想法来学Rust，
我保证，绝对会栽跟头，**因此这一章大家一定要重视，仔细阅读，这里有很多其它Rust书籍中没有的内容**。

首先来看段很简单的代码：
```rust
fn main() {
  let my_name = "Pascal";
  greet(my_name);
}

fn greet(name: String) {
  println!("Hello, {}!", name);
}
```

`greet`函数接受一个字符串类型的`name`参数，然后打印到终端控制台中，非常好理解，你们猜猜，这段代码能否通过编译？

```conole
error[E0308]: mismatched types
 --> src/main.rs:3:11
  |
3 |     greet(my_name);
  |           ^^^^^^^
  |           |
  |           expected struct `std::string::String`, found `&str`
  |           help: try using a conversion method: `my_name.to_string()`

error: aborting due to previous error
```

Bingo，果然报错了，编译器提示`greet`函数需要一个`String`类型的字符串，却传入了一个`&str`类型的字符串，相信读者心中现在一定有几头草泥马呼啸而过，怎么字符串也能整出这么多花活？

在讲解字符串之前，先来看看什么是切片?

## 切片(slice)

切片并不是Rust独有的概念，在Go语言中就非常流行，它允许你引用集合中一段连续的元素序列，而不是引用整个集合。

对于字符串而言，切片就是对`String`类型中某一部分的引用，它看起来像这样：
```rust
let s = String::from("hello world");

    let hello = &s[0..5];
    let world = &s[6..11];
```

`hello`没有引用整个`String s`，而是引用了`s`的一部分内容，通过`[0..5]`的方式来指定。

这就是创建切片的语法，使用方括号包括的一个序列: **[开始索引..终止索引]**，其中开始索引是切片中第一个元素的索引位置，而终止索引是最后一个元素后面的索引位置，也就是这是一个`右半开区间`。在内部，切片数据结构会保存开始的位置和切片的长度，其中长度是通过`终止索引` - `开始索引`的方式计算得来的。

对于`let world = &s[6..11];`来说，`world`是一个切片，该切片的指针指向`s`的第7个字节(索引从0开始,6是第7个字节)，且该切片的长度是`5`个字节。

<img alt="" src="/img/string-01.svg" class="center" style="width: 50%;" />

<span class="caption">图：String切片引用了另一个`String`的一部分</span>

在使用Rust的`..`区间(range)语法时，如果你想从索引0开始，可以使用如下的方式，这两个是等效的：
```rust
let s = String::from("hello");

let slice = &s[0..2];
let slice = &s[..2];
```

同样的，如果你的切片想要包含`String`的最后一个字节，则可以这样使用:
```rust
let s = String::from("hello");

let len = s.len();

let slice = &s[3..len];
let slice = &s[3..];
```

你也可以截取完整的`String`切片：
```rust
let s = String::from("hello");

let len = s.len();

let slice = &s[0..len];
let slice = &s[..];
```

>在对字符串使用切片语法时需要格外小心，切片的索引必须落在字符之间的边界位置，也就是UTF8字符的边界，例如中文在UT8中占用三个字节,下面的代码就会崩溃:
>```rust
>  let s = "中国人";
>  let a = &s[0..2];
>  println!("{}",a);
>```
>因为我们只取`s`字符串的前两个字节，但是一个中文占用三个字节，因此没有落在边界处，也就是连`中`字都取不完整，此时程序会直接崩溃退出，如果改成`&a[0..3]`，则可以正常通过编译.
> 因此，当你需要对字符串做切片索引操作时，需要格外小心这一点, 关于该如何操作utf8字符串，参见[这里](#操作UTF8字符串)

字符串切片的类型标示是`&str`，因此我们可以这样申明一个函数，输入`String`类型，返回它的切片: `fn first_word(s: &String) -> &str `.

有了切片就可以写出这样的安全代码：
```rust
fn main() {
    let mut s = String::from("hello world");

    let word = first_word(&s);

    s.clear(); // error!

    println!("the first word is: {}", word);
}
```
编译器报错如下：
```console
error[E0502]: cannot borrow `s` as mutable because it is also borrowed as immutable
  --> src/main.rs:18:5
   |
16 |     let word = first_word(&s);
   |                           -- immutable borrow occurs here
17 | 
18 |     s.clear(); // error!
   |     ^^^^^^^^^ mutable borrow occurs here
19 | 
20 |     println!("the first word is: {}", word);
   |                                       ---- immutable borrow later used here
```

回忆一下借用的规则：当我们已经有了可变借用时，就无法再拥有不可变的借用。因为`clear`需要清空改变`String`，因此它需要一个可变借用，而之后的`println!`又使用了不可变借用，因此编译无法通过。

从上述代码可以看出，Rust不仅让我们的`api`更加容易使用，而且也在编译器就位我们消除了大量错误！

#### 其它切片
因为切片是对集合的部分引用，因此不仅仅字符串有切片，其它集合类型也有，例如数组:
```rust
let a = [1, 2, 3, 4, 5];

let slice = &a[1..3];

assert_eq!(slice, &[2, 3]);
```
该数组切片的类型是`&[i32]`，数组切片和字符串切片的工作方式是一样的，例如持有一个引用指向原始数组的某个元素和长度。对于集合类型，我们在[这一章](../../advance/collection.md)中有详细的介绍。


## 字符串字面量是切片

之前提到过字符串字面量,但是没有提到它的类型：
```rust
let s = "Hello, world!";
```

实际上，`s`的类型时`&str`，因此你也可以这样声明：
```rust
let s: &str = "Hello, world!";
```
该切片指向了程序可执行文件中的某个点，这也是为什么字符串字面量是不可变的，因为`&str`时一个不可变引用。

了解完切片，可以进入本节的正题了。

## 什么是字符串?

顾名思义，字符串是由字符组成的连续集合，但是在上一节中我们提到过，**Rust中的字符是Unicode类型，因此每个字符占据4个字节内存空间，但是在字符串中不一样，字符串是UTF8编码，也就是字符所占的字节数是变长的(1-4)**，这样有助于大幅降低字符串所占用的内存空间.

Rust在语言级别，只有一种字符串类型：`str`，它通常是以引用类型出现`&str`，也就是上文提到的字符串切片。虽然语言级别只有上述的`str`类型，但是在标准库里，还有多种不同用途的字符串类型，其中使用最广的即是`String`类型。

`str`类型是硬编码进可执行文件，也无法被修改，但是`String`则是一个可增长、可改变且具有所有权的UTF8编码字符串，**当Rust用户提到字符串时，往往指的就是`String`类型和`&str`字符串切片类型，这两个类型都是UTF8编码**.

除了`String`类型的字符串，Rust的标准库还提供了其他类型的字符串，例如`OsString`,`OsStr`,`CsString`和`CsStr`等，注意到这些名字都以`String`或者`Str`结尾了吗？它们分别对应的是具有所有权和被借用的变量。

#### 操作字符串

由于String是可变字符串，因此我们可以对它进行创建、增删操作，下面的代码汇总了相关的操作方式：
```rust
fn main() {
    // 创建一个空String
    let mut s = String::new();
    // 将&str类型的"hello,world"添加到中
    s.push_str("hello,world");
    // 将字符'!'推入s中
    s.push('!');
    // 最后s的内容是"hello,world!"
    assert_eq!(s,"hello,world!");

    // 从现有的&str切片创建String类型
    let mut s = "hello,world".to_string();
    // 将字符'!'推入s中
    s.push('!');
    // 最后s的内容是"hello,world!"
    assert_eq!(s,"hello,world!");

    // 从现有的&str切片创建String类型
    // String与&str都是UTF8编码，因此支持中文
    let mut s = String::from("你好,世界");
    // 将字符'!'推入s中
    s.push('!');
    // 最后s的内容是"hello,world!"
    assert_eq!(s,"你好,世界!");

    let s1 = String::from("Hello,");
    let s2 = String::from("world!");
    // 在下句中，s1的所有权被转移走了，因此后面不能再使用s1
    let s3 = s1 + &s2; // note s1 has been moved here and can no longer be used
    assert_eq!(s3,"hello,world!");
    // 下面的语句如果去掉注释，就会报错
    // println!("{}",s1);
}
```

在上面代码中，有一处需要解释的地方，就是使用`+`来对字符串进行相加操作， 这里之所以使用`s1 + &s2`的形式，是因为`+`使用了`add`方法，该方法的定义类似:
```rust
fn add(self, s: &str) -> String {
```

因为该方法涉及到更复杂的特征功能，因此我们这里简单说明下，`self`是`String`类型的字符串`s1`,该函数说明，只能将&str类型的字符串切片添加到String类型的`s1`上，然后返回一个新的`String`类型，所以`let s3 = s1 + &s2;`就很好解释了，将`String`类型的`s1`与`&str`类型的`s2`进行相加，最终得到`String`类型的s3.

由此可推，以下代码也是合法的：
```rust
  let s1 = String::from("tic");
  let s2 = String::from("tac");
  let s3 = String::from("toe");

  // String = String + &str + &str + &str + &str
  let s = s1 + "-" + &s2 + "-" + &s3;
```

`String` + `&str`返回一个`String`，然后再继续跟一个`&str`进行`+`操作，返回一个`String`类型，不断循环，最终生成一个`s`，也是`String`类型。

在上面代码中，我们做了一个有些难以理解的`&String`操作，下面来展开讲讲。

## String与&str的转换

在之前的代码中，已经见到好几种从`&str`类型生成`String`类型的操作：
- `String::from("hello,world")`
- `"hello,world".to_string()`

那么如何将`String`类型转为`&str`类型呢？答案很简单，取引用即可：
```rust
fn main() {
    let s = String::from("hello,world!");
    say_hello(&s);
    say_hello(&s[..]);
    say_hello(s.as_str());
}

fn say_hello(s: &str) {
    println!("{}",s);
}
```

实际上这种灵活用法是因为`deref`强制转换，具体我们会在[Deref特征](../../traits/deref.md)进行详细讲解。

## 字符串索引

在其它语言中，使用索引的方式访问字符串的某个字符或者子串是很正常的行为，但是在Rust中就会报错:
```rust
   let s1 = String::from("hello");
   let h = s1[0];
```

该代码会产生如下错误：
```console
3 |     let h = s1[0];
  |             ^^^^^ `String` cannot be indexed by `{integer}`
  |
  = help: the trait `Index<{integer}>` is not implemented for `String`
```

#### 深入字符串内部
字符串的底层的数据存储格式实际上是[u8]，一个字节数组。对于`let hello = String::from("Hola");`这行代码来说，`hello`的长度是`4`个字节，因为`"hola"`中的每个字母在UTF8编码中仅占用1个字节，但是对于下面的代码呢?
```rust
let hello = String::from("中国人");
```
如果问你该字符串多长，你可能会说`3`，但是实际上是`9`个字节的长度，因为每个汉字在UTF8中的长度是`3`个字节，因此这种情况下对`hello`进行索引
访问`&hello[0]`没有任何意义，因为你取不到`中`这个字符，而是取到了这个字符三个字节中的第一个字节，这是一个非常奇怪而且难以理解的返回值。

#### 字符串的不同表现形式
现在看一下用梵文写的字符串`“नमस्ते”`, 它底层的字节数组如下形式：
```rust
[224, 164, 168, 224, 164, 174, 224, 164, 184, 224, 165, 141, 224, 164, 164,
224, 165, 135]
```
长度是18个字节，这也是计算机最终存储该字符串的形式。如果从字符的形式去看，则是：
```rust
['न', 'म', 'स', '्', 'त', 'े']
```
但是这种形势下，第四和六两个字母根本就不存在，没有任何意义，接着再从字母串的形式去看：
```rust
["न", "म", "स्", "ते"]
```

所以，可以看出来Rust提供了不同的字符串展现方式，这样程序可以挑选自己想要的方式去使用，而无需去管字符串从人类语言角度看长什么样。

还有一个原因导致了Rust不允许去索引字符：因为索引操作，我们总是期望它的性能表现是O(1)，然后对于`String`类型来说，无法保证这一点，因为Rust可能需要从0开始去遍历字符串来定位合法的字符。

## 字符串切片
前文提到过，字符串切片是非常危险的操作，因为切片的索引是通过字节来进行，但是字符串是UTF8编码，因此你无法保证索引的字节刚好落在字符的边界上，例如：
```rust
let hello = "中国人";

let s = &hello[0..2];
```
运行上面的程序，会直接造成崩溃：
```console
thread 'main' panicked at 'byte index 2 is not a char boundary; it is inside '中' (bytes 0..3) of `中国人`', src/main.rs:4:14
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace
```
这里提示的很清楚，我们索引的字节落在了`中`字符的内部，这种返回没有任何意义。

因此在通过索引区间来访问字符串时，需要格外的小心，一不注意，就会导致你程序的崩溃！

## 操作UTF8字符串
前文提到了几中使用UTF8字符串的方式，下面来一一说明。

#### 字符
如果你想要以Unicode字符的方式遍历字符串，最好的办法是使用`chars`方法，例如：
```rust
for c in "中国人".chars() {
    println!("{}", c);
}
```
输出如下
```console
中
国
人
```

#### 字节
这种方式是返回字符串的底层字节数组表现形式：
```rust
for b in "中国人".bytes() {
    println!("{}", b);
}
```
输出如下：
```console
228
184
173
229
155
189
228
186
186
```

#### 获取子串
想要准确的从UTF8字符串中获取子串是较为复杂的事情，例如想要从`holla中国人नमस्ते`这种变长的字符串中取出某一个子串，使用标准库你是做不到的，
你需要在`crates.io`上搜索`utf8`来寻找想要的功能。

可以考虑尝试下这个库:[utf8 slice](https://crates.io/crates/utf8_slice).

## String底层剖析
@todo