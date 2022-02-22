# 流程控制

80后应该都对学校的小混混记忆犹新，在那个时代，小混混们往往都认为自己是地下王者，管控着地下事务的流程，在我看来，他们就像代码中的流程控制一样，无处不在，很显眼，但是又让人懒得重视。

言归正传，Rust程序是从上而下顺序执行的，在此过程中，我们可以通过循环、分支等流程控制方式，更好的实现相应的功能。

## 使用if来做分支控制
> if else无处不在 - `鲁迅说`

但凡你能找到一门编程语言没有 `if else`，那么一定更要反馈给鲁迅，反正不是我说的:) 总之，只要你拥有其它语言的编程经验，就一定会有以下认知：`if else` **表达式**根据条件执行不同的代码分支：
```rust
if condition == true {
    // A...
} else {
    // B...
}
```

该代码读作：若 `condition` 的值为 `true`，则执行 `A` 代码，否则执行 `B` 代码。

先看下面代码：
```rust
fn main() {
    let condition = true;
    let number = if condition {
        5
    } else {
        6
    };

    println!("The value of number is: {}", number);
}
```

以上代码有以下几点要注意：

- **`if` 语句块是表达式**，这里我们使用 `if` 表达式的返回值来给 `number` 进行赋值：`number` 的值是 `5`
- 用 `if` 来赋值时，要保证每个分支返回的类型一样(事实上，这种说法不完全准确，见[这里](../appendix/expressions.md#if表达式))，此处返回的 `5` 和 `6` 就是同一个类型，如果返回类型不一致就会报错

```console
error[E0308]: if and else have incompatible types
 --> src/main.rs:4:18
  |
4 |       let number = if condition {
  |  __________________^
5 | |         5
6 | |     } else {
7 | |         "six"
8 | |     };
  | |_____^ expected integer, found &str // 期望整数类型，但却发现&str字符串切片
  |
  = note: expected type `{integer}`
             found type `&str`
```

#### 使用else if来处理多重条件
可以将 `else if` 与 `if`、`else` 组合在一起实现更复杂的条件分支判断：
```rust
fn main() {
    let n = 6;

    if n % 4 == 0 {
        println!("number is divisible by 4");
    } else if n % 3 == 0 {
        println!("number is divisible by 3");
    } else if n % 2 == 0 {
        println!("number is divisible by 2");
    } else {
        println!("number is not divisible by 4, 3, or 2");
    }
}
```
程序执行时，会按照自上至下的顺序执行每一个分支判断，一旦成功，则跳出 `if` 语句块，最终本程序会匹配执行 `else if n % 3 == 0` 的分支，输出 `"number is divisible by 3"`。

有一点要注意，就算有多个分支能匹配，也只有第一个匹配的分支会被执行！

如果代码中有大量的 `else if ` 会让代码变得极其丑陋，不过不用担心，下一章的 `match` 专门用以解决多分支模式匹配的问题。

## 循环控制

循环无处不在，上到数钱，下到数年，你能想象的很多场景都存在循环，因此它也是流程控制中最重要的组成部分之一。

在 Rust 语言中有三种循环方式：`for`、`while` 和 `loop`，其中 `for` 循环是 Rust 循环王冠上的明珠。

#### for循环

`for` 循环是 Rust 的大杀器：
```rust
fn main() {
    for i in 1..=5 {
        println!("{}",i);
    }
}
```

以上代码循环输出一个从 1 到 5 的序列，简单粗暴，核心就在于 `for` 和 `in` 的联动，语义表达如下：

```rust
for 元素 in 集合 {
  // 使用元素干一些你懂我不懂的事情
}
```
这个语法跟 JavaScript 还蛮像，应该挺好理解。

注意，使用 `for` 时我们往往使用集合的引用形式，除非你不想在后面的代码中继续使用该集合（比如我们这里使用了 `container` 的引用）。如果不使用引用的话，所有权会被转移（move）到 `for` 语句块中，后面就无法再使用这个集合了)：
```rust
for item in &container {
  // ...
}
```

> 对于实现了 `copy` 特征的数组(例如 [i32; 10] )而言， `for item in arr` 并不会把 `arr` 的所有权转移，而是直接对其进行了拷贝，因此循环之后仍然可以使用 `arr` 。


如果想在循环中，**修改该元素**，可以使用 `mut` 关键字：
```rust
for item in &mut collection {
  // ...
}
```

总结如下：

 使用方法 | 等价使用方式 | 所有权
---------|--------|--------
`for item in collection` | `for item in IntoIterator::into_iter(collection)` | 转移所有权
`for item in &collection` | `for item in collection.iter()` | 不可变借用
`for item in &mut collection` | `for item in collection.iter_mut()` | 可变借用

如果想在循环中**获取元素的索引**：
```rust
fn main() {
    let a = [4,3,2,1];
    // `.iter()` 方法把 `a` 数组变成一个迭代器
    for (i,v) in a.iter().enumerate() {
        println!("第{}个元素是{}",i+1,v);
    }
}
```

有同学可能会想到，如果我们想用 `for` 循环控制某个过程执行 10 次，但是又不想单独声明一个变量来控制这个流程，该怎么写？
```rust
for _ in 0..10 {
  // ...
}
```
可以用 `_` 来替代 `i` 用于 `for` 循环中，在 Rust 中 `_` 的含义是忽略该值或者类型的意思，如果不使用 `_`，那么编译器会给你一个 `变量未使用的` 的警告。

**两种循环方式优劣对比**

以下代码，使用了两种循环方式：
```rust
// 第一种
let collection = [1, 2, 3, 4, 5];
for i in 0..collection.len() {
  let item = collection[i];
  // ...
}

// 第二种
for item in collection {

}
```

第一种方式是循环索引，然后通过索引下标去访问集合，第二种方式是直接循环集合中的元素，优劣如下：

- **性能**：第一种使用方式中 `collection[index]` 的索引访问，会因为边界检查(Bounds Checking)导致运行时的性能损耗 —— Rust会检查并确认 `index` 是否落在集合内，但是第二种直接迭代的方式就不会触发这种检查，因为编译器会在编译时就完成分析并证明这种访问是合法的
- **安全**：第一种方式里对 `collection` 的索引访问是非连续的，存在一定可能性在两次访问之间，`collection` 发生了变化，导致脏数据产生。而第二种直接迭代的方式是连续访问，因此不存在这种风险（这里是因为所有权吗？是的话可能要强调一下）

由于 `for` 循环无需任何条件限制，也不需要通过索引来访问，因此是最安全也是最常用的，通过与下面的 `while` 的对比，我们能看到为什么 `for` 会更加安全。

#### `continue`
使用 `continue` 可以跳过当前当次的循环，开始下次的循环：
```rust
 for i in 1..4 {
     if i == 2 {
         continue;
     }
     println!("{}",i);
 }
```
上面代码对 1 到 3 的序列进行迭代，且跳过值为 2 时的循环，输出如下：
```console
1
3
```
#### `break`
使用 `break` 可以直接跳出当前整个循环：
```rust
 for i in 1..4 {
     if i == 2 {
         break;
     }
     println!("{}",i);
 }
```
上面代码对 1 到 3 的序列进行迭代，在遇到值为 2 时的跳出整个循环，后面的循环不在执行，输出如下：
```console
1
```

#### while循环

如果你需要一个条件来循环，当该条件为 `true` 时，继续循环，条件为 `false`，跳出循环，那么 `while` 就非常适用：
```rust
fn main() {
    let mut n = 0;

    while n <= 5  {
        println!("{}!", n);

        n = n + 1;
    }

    println!("我出来了！");
}
```

该 `while` 循环，只有当 `n` 小于等于 `5` 时，才执行，否则就立刻跳出循环，因此在上述代码中，它会先从 `0` 开始，满足条件，进行循环，然后是 `1`，满足条件，进行循环，最终到 `6` 的时候，大于 5，不满足条件，跳出 `while` 循环，执行 `我出来了` 的打印，然后程序结束：
```console
0!
1!
2!
3!
4!
5!
我出来了！
```

当然，你也可以用其它方式组合实现，例如 `loop`（无条件循环，将在下面介绍） + `if` + `break`：
```rust
fn main() {
    let mut n = 0;

    loop {
        if n > 5 {
            break
        }
        println!("{}",n);
        n+=1;
    }

    println!("我出来了！");
}
```
可以看出，在这种循环场景下，`while` 要简洁的多。

**while vs for**

我们也能用 `while` 来实现 `for` 的功能：
```rust
fn main() {
    let a = [10, 20, 30, 40, 50];
    let mut index = 0;

    while index < 5 {
        println!("the value is: {}", a[index]);

        index = index + 1;
    }
}
```
这里，代码对数组中的元素进行计数。它从索引 `0` 开始，并接着循环直到遇到数组的最后一个索引（这时，`index < 5` 不再为真）。运行这段代码会打印出数组中的每一个元素：
```console
the value is: 10
the value is: 20
the value is: 30
the value is: 40
the value is: 50
```

数组中的所有五个元素都如期被打印出来。尽管 `index` 在某一时刻会到达值 5，不过循环在其尝试从数组获取第六个值（会越界）之前就停止了。

但这个过程很容易出错；如果索引长度不正确会导致程序 ***panic***。这也使程序更慢，因为编译器增加了运行时代码来对每次循环的每个元素进行条件检查。

`for`循环代码如下：
```rust
fn main() {
    let a = [10, 20, 30, 40, 50];

    for element in a.iter() {
        println!("the value is: {}", element);
    }
}
```

可以看出，`for` 并不会使用索引去访问数组，因此更安全也更简洁，同时避免 `运行时的边界检查`，性能更高。


#### loop循环
对于循环而言，`loop` 循环毋庸置疑，是适用面最高的，它可以适用于所有循环场景（虽然能用，但是在很多场景下， `for` 和 `while` 才是最优选择），因为 `loop` 就是一个简单的无限循环，你可以在内部实现逻辑通过 `break` 关键字来控制循环何时结束。

使用 `loop` 循环一定要打起精神，否则你会写出下面的跑满你一个 CPU 核心的疯子代码：
```rust,ignore
fn main() {
    loop {
        println!("again!");
    }
}
```

该循环会不停的在终端打印输出，直到你使用 `Ctrl-C` 结束程序：
```console
again!
again!
again!
again!
^Cagain!
```

**注意**，不要轻易尝试上述代码，如果你电脑配置不行，可能会死机！！！

因此，当使用 `loop` 时，必不可少的伙伴是 `break` 关键字，它能让循环在满足某个条件时跳出：
```rust
fn main() {
    let mut counter = 0;

    let result = loop {
        counter += 1;

        if counter == 10 {
            break counter * 2;
        }
    };

    println!("The result is {}", result);
}
```
以上代码当 `counter` 递增到 `10` 时，就会通过 `break` 返回一个 `counter * 2` 的值，最后赋给 `result` 并打印出来。

这里有几点值得注意：

- **break 可以单独使用，也可以带一个返回值**，有些类似 `return`
- **loop 是一个表达式**，因此可以返回一个值

