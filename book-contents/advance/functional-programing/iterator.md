# 迭代器Iterator
如果你询问一个Rust资深开发：写Rust项目最需要掌握什么？相信迭代器往往就是答案之一。无论你是编程新手亦或是高手，实际上大概率都用过迭代器，虽然自己可能并没有意识到这一点:)

迭代器允许我们迭代一个连续的集合，例如数组、动态数组Vec、`HashMap`等，在此过程中，只需关心集合中的元素如何处理，而无需去关心如何开始、如何结束、按照什么样的索引去访问等问题。

## For循环与迭代器
从用途来看，迭代器跟`for`循环颇为相似，都是去遍历一个集合，但是实际上它们存在不小的差别，其中最主要的差别就是：**是否通过索引来访问集合**。

例如以下的JS代码就是一个循环:
```javascript
let arr = [1, 2, 3];
for i = 0; i < arr.length() - 1; i ++ {
    console.log(arr[i]);
}
```

在上面代码中，我们设置索引的开始点和结束点，然后再通过索引去访问元素`arr[i]`，这就是典型的循环，来对比下Rust中的`for`:
```rust
let arr = [1, 2, 3];
for v in arr {
    println!("{}",v);
}
```

首先，不得不说这两语法还挺像！与JS循环不同，`Rust`中没有使用索引，它把`arr`数组当成一个迭代器，直接去遍历其中的元素，从哪里开始，从哪里结束，都无需操心。因此严格来说，Rust中的`for`循环是编译器提供的语法糖，最终还是对迭代器中的元素进行遍历。

那又有同学要发问了，在Rust中数组是迭代器吗？因为在之前的代码中直接对数组`arr`进行了迭代，答案是`No`。那既然数组不是迭代器，为啥咱可以对它的元素进行迭代呢？

简而言之就是数组实现了`IntoIterator`特征，Rust通过`for`语法糖，自动把实现了该特征的数组类型转换为迭代器(你也可以为自己的集合类型实现此特征)，最终让我们可以直接对一个数组进行迭代，类似的还有：
```rust
for i in 1..10 {
    println!("{}", i);
}
```
直接对数值序列进行迭代，也是很常见的使用方式。

`IntoIterator`特征拥有一个`into_iter`方法，因此我们还可以显式的把数组转换成迭代器：
```rust
let arr = [1, 2, 3];
for v in arr.into_iter() {
    println!("{}", v);
}
```

迭代器是函数语言的核心特性，它赋予了Rust远超于循环的强大表达能力，我们也将在本章中一一为大家进行展现。

## 惰性初始化
在Rust中，迭代器是惰性的，意味着如果你不使用它，那么它将不会发生任何事：
```rust
let v1 = vec![1, 2, 3];

let v1_iter = v1.iter();

for val in v1_iter {
    println!("{}", val);
}
```

在`for`循环之前，我们只是简单的创建了一个迭代器`v1_iter`，此时不会发生任何迭代行为，只有在`for`循环开始后，迭代器才会开始迭代其中的元素，最后打印出来。

这种惰性初始化的方式确保了创建迭代器不会有任何额外的性能损耗，其中的元素也不会被消耗，只有到使用该迭代器的时候，一切才开始。

## next方法
对于`for`如何遍历迭代器，还有一个问题，它如何取出迭代器中的元素？

先来看一个特征:
```rust
pub trait Iterator {
    type Item;

    fn next(&mut self) -> Option<Self::Item>;

    // 省略其余有默认实现的方法
}
```

呦，该特征竟然和迭代器iterator同名，难不成。。。没错，它们就是有一腿。**迭代器之所以成为迭代器，就是因为实现了`Iterator`特征**，要实现该特征，最主要的就是实现其中的`next`方法，该方法控制如何从集合中取值，最终返回值的类型是[关联类型](https://course.rs/basic/trait/advance-trait#关联类型)`Item`.

因此，之前问题的答案已经很明显：`for`循环通过不停调用迭代器上的`next`方法，来获取迭代器中的元素。

既然`for`可以调用`next`方法，是不是意味着我们也可以？来试试:
```rust
fn main() {
    let arr = [1, 2, 3];
    let mut arr_iter = arr.into_iter();

    assert_eq!(arr_iter.next(), Some(1));
    assert_eq!(arr_iter.next(), Some(2));
    assert_eq!(arr_iter.next(), Some(3));
    assert_eq!(arr_iter.next(), None);
}
```

果不其然，将`arr`转换成迭代器后，通过调用其上的`next`方法，我们获取了`arr`中的元素, 有两点需要注意:

- `next`方法返回的是`Option`类型，当有值时返回`Some(i32)`,无值时返回`None`
- 遍历是按照迭代器中元素的排列顺序依次进行的，因此我们严格按照数组中元素的顺序取出了`Some(1)`,`Some(2)`,`Some(3)`
- 手动迭代必须将迭代器声明为`mut`可变，因为调用`next`会改变迭代器其中的状态数据(当前遍历的位置等)，而`for`循环去迭代则无需标注`mut`，因为它会帮我们自动完成

总之，`next`方法对**迭代器的遍历是消耗性的**，每次消耗它一个元素，最终迭代器中将没有任何元素, 只能返回`None`.

#### 例子：模拟实现for循环
因为for循环是迭代器的语法糖，因此我们完全可以通过迭代器来模拟实现它：
```rust
let values = vec![1, 2, 3];

{
    let result = match IntoIterator::into_iter(values) {
        mut iter => loop {
            match iter.next() {
                Some(x) => { println!("{}", x); },
                None => break,
            }
        },
    };
    result
}
```

`IntoIterator::into_iter`是使用[完全限定](https://course.rs/basic/trait/advance-trait.html#完全限定语法)的方式去调用`into_iter`方法，这种调用方式跟`values.into_iter()`是等价的。

同时我们使用了`loop`循环配合`next`方法来遍历迭代器中的元素，当迭代器返回`None`时，跳出循环。

## IntoIterator特征
其实有一个细节，由于`Vec`动态数组实现了`IntoIterator`特征，因此可以通过`into_iter`将其转换为迭代器，那如果本身就是一个迭代器，该怎么办？实际上，迭代器自身也实现了`IntoIterator`，标准库早就帮我们考虑好了:
```rust
impl<I: Iterator> IntoIterator for I {
    // ...
}
```

最终你完全可以写出这样的奇怪代码：
```rust
fn main() {
    let values = vec![1, 2, 3];

    for v in values.into_iter().into_iter().into_iter() {
        println!("{}",v)
    }
}
```

#### into_iter, iter, iter_mut
在之前的代码中，我们统一使用了`into_iter`的方式将数组转化为迭代器，除此之外，还有`iter`和`iter_mut`，聪明的读者应该大概能猜到这三者的区别：

- `into_iter`会夺走所有权
- `iter`是借用
- `iter_mut`是可变借用

其实如果以后见多识广了，你会发现这种问题一眼就能看穿，`into_`之类的，都是拿走所有权，`_mut`之类的都是可变借用，剩下的就是不可变借用。

使用一段代码来解释下:
```rust
fn main() {
    let values = vec![1, 2, 3];

    for v in values.into_iter() {
        println!("{}", v)
    }

    // 下面的代码将报错，因为values的所有权在上面`for`循环中已经被转移走
    // println!("{:?}",values);

    let values = vec![1, 2, 3];
    let _values_iter = values.iter();

    // 不会报错，因为values_iter是借用了values中的元素
    println!("{:?}", values);

    let mut values = vec![1, 2, 3];
    // 对values中的元素进行可变借用
    let mut values_iter_mut = values.iter_mut();

    // 取出第一个元素，并修改为0
    if let Some(v) = values_iter_mut.next() {
        *v = 0;
    }

    // 输出[0, 2, 3]
    println!("{:?}", values);
}
```
具体解释在代码注释中，就不再赘述,不过有两点需要注意的是：

- `.iter()`方法实现的迭代器，调用`next`方法返回的类型是`Some(&T)`
- `.iter_mut()`方法实现的迭代器，调用`next`方法返回的类型是`Some(&mut T)`, 因此在`if let Some(v) = values_iter_mut.next()`中，`v`的类型是`&mut i32`，最终我们可以通过`*v = 0`的方式修改其值

#### Iterator和IntoIterator的区别
这两个其实还蛮容易搞混的，但我们只需要记住，`Iterator`就是迭代器特征，只有实现了它才能称为迭代器，才能调用`next`。

而`IntoIterator`强调的是某一个类型如果实现了该特征，它可以通过`into_iter`，`iter`等方法变成一个迭代器.

## 消费者与适配器
消费者是迭代器上的方法，它会消费掉迭代器中的元素，然后返回其它类型的值，这些消费者都有一个共同的特点：在它们的定义中，都依赖`next`方法来消费元素，因此这也是为什么迭代器要实现`Iterator`特征，而该特征必须要实现`next`方法的原因。

#### 消费者适配器
只要迭代器上的某个方法`A`在其内部调用了`next`方法，那么`A`就被称为**消费性适配器**: 因为`next`方法会消耗掉迭代器上的元素，可以推出方法`A`的调用也会消耗掉迭代器上的元素。

其中一个例子是`sum`方法，它会拿走迭代器的所有权，然后通过不断调用`next`方法对里面的元素进行求和:
```rust
fn main() {
    let v1 = vec![1, 2, 3];

    let v1_iter = v1.iter();

    let total: i32 = v1_iter.sum();

    assert_eq!(total, 6);
    
    // v1_iter是借用了v1，因此v1可以照常使用
    println!("{:?}",v1);

    // 以下代码会报错，因为`sum`拿到了迭代器`v1_iter`的所有权
    // println!("{:?}",v1_iter);
}
```

如代码注释中所说明的：在使用`sum`方法后，我们将无法再使用`v1_iter`，因为`sum`拿走了该迭代器的所有权:
```rust
fn sum<S>(self) -> S
    where
        Self: Sized,
        S: Sum<Self::Item>,
    {
        Sum::sum(self)
    }

```

从`sum`源码中也可以清晰看出，`self`类型的方法参数拿走了所有权。

#### 迭代器适配器
既然消费者适配器是消费掉迭代器，然后返回一个值。那么迭代器适配器，顾名思义，会返回一个新的迭代器，这是实现链式方法调用的关键:`v.iter().map().filter()...`。

与消费者适配器不同，迭代器适配器是惰性的，意味着你**需要一个消费者适配器来收尾，最终将迭代器转换成一个具体的值**：
```rust
let v1: Vec<i32> = vec![1, 2, 3];

v1.iter().map(|x| x + 1);
```

运行后输出:
```console
warning: unused `Map` that must be used
 --> src/main.rs:4:5
  |
4 |     v1.iter().map(|x| x + 1);
  |     ^^^^^^^^^^^^^^^^^^^^^^^^^
  |
  = note: `#[warn(unused_must_use)]` on by default
  = note: iterators are lazy and do nothing unless consumed // 迭代器map是惰性的，这里不产生任何效果
```

如上述中文注释所说，这里的`map`方法是一个迭代者适配器，它是惰性的，不产生任何行为，因此我们还需要一个消费者适配器进行收尾:
```rust
let v1: Vec<i32> = vec![1, 2, 3];

let v2: Vec<_> = v1.iter().map(|x| x + 1).collect();

assert_eq!(v2, vec![2, 3, 4]);
```

#### collect
上面代码中，使用了`collect`方法，该方法就是一个消费者适配器，使用它可以将一个迭代器中的元素收集到指定类型中，这里我们为`v2`标注了`Vec<_>`类型，就是为了告诉`collect`：请把迭代器中的元素消费掉，然后把值收集成`Vec<_>`类型，至于为何使用`_`，因为编译器会帮我们自动推导。

为何`collect`在消费时要指定类型？是因为该方法其实很强大，可以收集成多种不同的集合类型，`Vec<T>`仅仅是其中之一，因此我们必须显式的告诉编译器我们想要收集成的集合类型。

还有一点值得注意,`map`会对迭代器中的每一个值进行一系列操作，然后把该值转换成另外一个新值， 该操作是通过闭包`|x| x + 1`来完成: 最终迭代器中的每个值都增加了`1`，从`[1, 2, 3]`变为`[2, 3, 4]`.

再来看看如何使用`collect`收集成`HashMap`集合：
```rust
use std::collections::HashMap;
fn main() {
    let names = ["sunface", "sunfei"];
    let ages = [18, 18];
    let folks: HashMap<_, _> = names.into_iter().zip(ages.into_iter()).collect();

    println!("{:?}",folks);
}
```

`zip`是一个迭代器适配器，它的作用就是将两个迭代器的内容压缩到一起，形成`Iterator<Item=(ValueFromA, ValueFromB)>` 这样的新的迭代器,在此处就是形如`[(name1, age1), (name2, age2)]`的迭代器。

然后再通过`collect`将新迭代器中`(K, V)`形式的值收集成`HashMap<K, V>`，同样的，这里必须显式声明类型，然后`HashMap`内部的`KV`类型可以交给编译器去推导，最终编译器会推导出`HashMap<&str, i32>`，完全正确！

#### 闭包作为适配器参数
之前的`map`方法中，我们使用闭包来作为迭代器适配器的参数，它最大的好处不仅在于就地实现迭代器中元素的处理，还在于可以捕获环境值:
```rust
struct Shoe {
    size: u32,
    style: String,
}

fn shoes_in_size(shoes: Vec<Shoe>, shoe_size: u32) -> Vec<Shoe> {
    shoes.into_iter().filter(|s| s.size == shoe_size).collect()
}
```

`filter`是迭代器适配器，用于对迭代器中的每个值进行过滤。 它使用闭包作为参数，该闭包的参数`s`是来自迭代器中的值，然后使用`s`跟外部环境中的`shoe_size`进行比较，若相等，则在迭代器中保留`s`值，若不相等，则从迭代器中剔除`s`值，最终通过`collect`收集为`Vec<Shoe>`类型.

## 实现Iterator特征
之前的内容我们一直基于数组来创建迭代器，实际上，不仅仅是数组，基于其它集合类型一样可以创建迭代器，例如`HashMap`。 你也可以创建自己的迭代器 - 只要为自定义类型实现`Iterator`特征即可。

首先，创建一个计数器：
```rust
struct Counter {
    count: u32,
}

impl Counter {
    fn new() -> Counter {
        Counter { count: 0 }
    }
}
```

我们为计数器`Counter`实现了一个关联函数`new`，用于创建新的计数器实例。下面们继续为计数器实现`Iterator`特征：
```rust
impl Iterator for Counter {
    type Item = u32;

    fn next(&mut self) -> Option<Self::Item> {
        if self.count < 5 {
            self.count += 1;
            Some(self.count)
        } else {
            None
        }
    }
}
```

首先，将该特征的关联类型设置为`u32`，由于我们的计数器保存的`count`字段就是`u32`类型， 因此在`next`方法中，最后返回的是实际上是`Option<u32>`类型.

每次调用`next`方法，都会让计数器的值加一，然后返回最新的计数值，一旦计数大于5，就返回`None`。

最后，使用我们新建的`Counter`进行迭代：
```rust
 let mut counter = Counter::new();

assert_eq!(counter.next(), Some(1));
assert_eq!(counter.next(), Some(2));
assert_eq!(counter.next(), Some(3));
assert_eq!(counter.next(), Some(4));
assert_eq!(counter.next(), Some(5));
assert_eq!(counter.next(), None);
```

#### 实现Iterator特征的其它方法
可以看出，实现自己的迭代器非常简单，但是`Iterator`特征中，不仅仅是只有`next`一个方法，那为什么我们只需要实现它呢？因为其它方法都具有[默认实现](https://course.rs/basic/trait/trait.html#默认实现)，无需像`next`这样手动去实现，而且这些默认实现的方法其实都是基于`next`方法实现的。

下面的代码演示了部分方法的使用：
```rust
let sum: u32 = Counter::new()
    .zip(Counter::new().skip(1))
    .map(|(a, b)| a * b)
    .filter(|x| x % 3 == 0)
    .sum();
assert_eq!(18, sum);
```

其中`zip`, `map`, `filter`是迭代器适配器：

- `zip`把两个迭代器合并成一个迭代器，新迭代器中，每个元素都是一个元组，由之前两个迭代器的元素组成。例如将**形如**`[1, 2, 3]`和`[4, 5, 6]`的迭代器合并后，新的迭代器形如`[(1, 4),(2, 5),(3, 6)]`
- `map`是将迭代器中的值经过映射后，转换成新的值
- `filter`对迭代器中的元素进行过滤，若闭包返回`true`则保留元素，反之剔除

而`sum`是消费者适配器，对迭代器中的所有元素求和，最终返回一个`u32`值`18`。

##### enumerate
在之前的流程控制章节，针对`for`循环，我们提供了一种方法可以获取迭代时的索引:
```rust
let v = vec![1u64, 2, 3, 4, 5, 6];
for (i,v) in v.iter().enumerate() {
    println!("第{}个值是{}",i,v)
}
```

相信当时，很多读者还是很迷茫的，不知道为什么要这么复杂才能获取到索引，学习本章节后，相信你有了全新的理解，首先`v.iter()`创建迭代器，其次
调用`Iterator`特征上的方法`enumerate`，该方法产生一个新的迭代器，其中每个元素均是元组`(索引，值)`。

因为`enumerate`是迭代器适配器，因此我们可以对它返回的迭代器调用其它`Iterator`特征方法：
```rust
let v = vec![1u64, 2, 3, 4, 5, 6];
let val = v.iter()
    .enumerate()
    // 每两个元素剔除一个
    // [1, 3, 5]
    .filter(|&(idx, _)| idx % 2 == 0)
    .map(|(idx, val)| val)
    // 累加 1+3+5 = 9
    .fold(0u64, |sum, acm| sum + acm);

println!("{}", val);
```

## 迭代器的性能

## 学习其它方法
迭代器用的好不好，就在于你是否掌握了它的常用方法，且能活学活用，因此多多看看[标准库](https://doc.rust-lang.org/std/iter/trait.Iterator.html)是有好处的，只有知道有什么方法，在需要的时候你才能知道该用什么，就和算法学习一样。

同时，本书在后续章节还提供了对迭代器常用方法的[深入讲解](https://course.rs/std/iterator)，方便大家学习和查阅。
