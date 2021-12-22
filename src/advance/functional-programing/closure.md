# 闭包closure

关于闭包这个词语由来已久，自上世纪60年代就由`Scheme`语言引进，之后，被广泛用于函数式编程语言中，进入21世纪后，各种现代化的编程语言也都不约而同的把闭包作为核心特性纳入到语言设计中来。那么到底何为闭包？

闭包是**一种匿名函数，它可以赋值给变量也可以作为参数传递给其它函数，不同于函数的是，它允许捕获调用者作用域中的值**，例如：
```rust
fn main() {
   let x = 1;
   let sum = |y| x + y;

    assert_eq!(3, sum(2));
}
```

上面的代码展示了非常简单的闭包`sum`，它拥有一个入参`y`，同时捕获了作用域中的`x`的值，因此调用`sum(2)`意味着将2(参数`y`)跟1（`x`）进行相加,最终返回它们的和:`3`。

可以看到`sum`非常符合闭包的定义：可以赋值给变量，允许捕获调用者作用域中的值。

## 使用闭包来简化代码

#### 传统函数实现
想象一下，我们要进行健身，用代码怎么实现(写代码什么鬼，健身难道不应该去健身房嘛？答曰：健身太累了，还是虚拟健身好，点到为止)？这里是我的想法：
```rust
use std::thread;
use std::time::Duration;

// 开始健身，好累，我得发出声音：muuuu...
fn muuuuu(intensity: u32) -> u32 {
    println!("muuuu.....");
    thread::sleep(Duration::from_secs(2));
    intensity
}

fn workout(intensity: u32, random_number: u32) {
    if intensity < 25 {
        println!(
            "今天活力满满, 先做 {} 个俯卧撑!",
            muuuuu(intensity)
        );
        println!(
            "旁边有妹子在看，俯卧撑太low, 再来 {} 组卧推!",
            muuuuu(intensity)
        );
    } else {
        if random_number == 3 {
            println!("昨天练过度了，今天还是休息下吧！");
        } else {
            println!(
                "昨天练过度了，今天干干有氧, 跑步 {} 分钟!",
                muuuuu(intensity)
            );
        }
    }
}

fn main() {
    // 强度
    let intensity = 10;
    // 随机值用来决定某个选择
    let random_number = 7;

    // 开始健身
    workout(intensity, random_number);
}
```

可以看到，在健身时我们根据想要的强度来调整具体的动作，然后调用`muuuuu`函数来开始健身。这个程序本身很简单，没啥好说的，但是假如未来不用`muuuu`函数了，是不是得把所有`muuuu`都替换成，比如说`woooo`? 如果`muuuu`出现了几十次，那意味着我们要修改几十处地方。

#### 函数变量实现
一个可行的办法是，把函数赋值给一个变量，然后通过变量调用:
```rust
fn workout(intensity: u32, random_number: u32) {
    let action = muuuuu;
    if intensity < 25 {
        println!(
            "今天活力满满, 先做 {} 个俯卧撑!",
            action(intensity)
        );
        println!(
            "旁边有妹子在看，俯卧撑太low, 再来 {} 组卧推!",
            action(intensity)
        );
    } else {
        if random_number == 3 {
            println!("昨天练过度了，今天还是休息下吧！");
        } else {
            println!(
                "昨天练过度了，今天干干有氧, 跑步 {} 分钟!",
                action(intensity)
            );
        }
    }
}
```


经过上面修改后，所有的调用都通过`action`来完成，若未来声(动)音(作)变了，只要修改为`let action = woooo`即可。

但是问题又来了,若`intensity`也变了怎么办？例如变成`action(intensity + 1)`，那你又得哐哐哐修改几十处调用。

该怎么办？没太好的办法了，只能祭出大杀器：闭包。

#### 闭包实现

上面提到`intensity`要是变化怎么办，简单，使用闭包来捕获它，这是我们的拿手好戏:
```rust
fn workout(intensity: u32, random_number: u32) {
    let action = || {
        println!("muuuu.....");
        thread::sleep(Duration::from_secs(2));
        intensity
    };

    if intensity < 25 {
        println!(
            "今天活力满满, 先做 {} 个俯卧撑!",
            action()
        );
        println!(
            "旁边有妹子在看，俯卧撑太low, 再来 {} 组卧推!",
            action()
        );
    } else {
        if random_number == 3 {
            println!("昨天练过度了，今天还是休息下吧！");
        } else {
            println!(
                "昨天练过度了，今天干干有氧, 跑步 {} 分钟!",
                action()
            );
        }
    }
}

fn main() {
    // 动作次数
    let intensity = 10;
    // 随机值用来决定某个选择
    let random_number = 7;

    // 开始健身
    workout(intensity, random_number);
}
```

在上面代码中，无论你要修改什么，只要修改闭包`action`的实现即可，其它地方只负责调用，完美解决了我们的问题！

Rust闭包在形式上借鉴了`Smalltalk`和`Ruby`语言，与函数最大的不同就是它的参数是通过`|parm1|`的形式进行声明，如果是多个参数就`|param1, param2,...|`, 下面给出闭包的形式定义：
```rust
|param1, param2,...| {
    语句1;
    语句2;
    返回表达式
}
```

如果只有一个返回表达式的话，定义可以简化为：
```rust
|param1| 返回表达式
```

上例中还有两点值得注意:
- **闭包中最后一行表达式返回的值，就是闭包执行后的返回值**，因此`action()`调用返回了`intensity`的值`10`
- `let action = ||...`只是把闭包赋值给变量`action`，并不是把闭包执行后的结果赋值给`action`，因此这里`action`就相当于闭包函数，可以跟函数一样进行调用：`action()`

## 闭包的类型推导
Rust是静态语言，因此所有的变量都具有类型，但是得益于编译器的强大类型推导能力，在很多时候我们并不需要显式的去声明类型，但是显然函数并不在此列，必须手动为函数的所有参数和返回值指定类型，原因在于函数往往会作为API提供给你的用户，因此你的用户必须在使用时知道传入参数的类型和返回值类型。

与函数相反，闭包并不会作为API对外提供，因此它可以享受编译器的类型推导能力，无需标注参数和返回值的类型。

为了增加代码可读性，有时候我们会显式的给类型进行标注，出于同样的目的，也可以给闭包标注类型：
```rust
let sum = |x: i32, y: i32| -> i32 {
    x + y
}
```

与之相比，不标注类型的闭包声明会更简洁些: `let sum = |x, y| x + y`, 需要注意的是，针对`sum`闭包，如果你不在后续代码中使用它，编译器会提示你为`x,y`添加类型标注，因为它缺乏必要的上下文：
```rust
let sum  = |x, y| x + y;
let v = sum(1,2);
```

这里我们用使用了`sum`，同时把`1`传给了`x`，`2`传给了`y`，因此编译器才可以推导出`x,y`的类型为`i32`。

下面展示了同一个功能的函数和闭包实现形式:
```rust
fn  add_one_v1   (x: u32) -> u32 { x + 1 }
let add_one_v2 = |x: u32| -> u32 { x + 1 };
let add_one_v3 = |x|             { x + 1 };
let add_one_v4 = |x|               x + 1  ;
```

可以看出第一行的函数和后面的闭包其实在形式上是非常接近的，同时三种不同的闭包也展示了三种不同的使用方式：省略参数、返回值和花括号对。

虽然类型推导很好用，但是它不是泛型，**当编译器推导出一种类型后，它就会一直使用该类型**:
```rust
let example_closure = |x| x;

let s = example_closure(String::from("hello"));
let n = example_closure(5);
```

首先，在`s`中，编译器为`x`推导出类型`String`，但是紧接着`n`试图用`5`这个整型去调用闭包，跟编译器之前推导的`String`类型不符，因此报错：
```console
error[E0308]: mismatched types
 --> src/main.rs:5:29
  |
5 |     let n = example_closure(5);
  |                             ^
  |                             |
  |                             expected struct `String`, found integer // 期待String类型，却发现一个整数
  |                             help: try using a conversion method: `5.to_string()`
```

## 结构体中的闭包
假设我们要实现一个简易缓存，功能是获取一个值，然后将其缓存起来，那么可以这样设计：
- 一个闭包用于获取值
- 一个变量，用于存储该值

可以使用结构体来代表缓存对象，最终设计如下：
```rust
struct Cacher<T>
where
    T: Fn(u32) -> u32,
{
    query: T,
    value: Option<u32>,
}
```

等等，我都跟着这本教程学完Rust基础了，为何还有我不认识的东东？`Fn(u32) -> u32`是什么鬼？别急，先回答你第一个问题：骚年，too young too naive，你以为Rust的语法特性就基础入门那一些嘛？太年轻了！如果是长征，你才刚到赤水河.

其实，可以看的出这一长串是`T`的特征约束，再结合之前的已知信息：`query`是一个闭包，大概可以推测出，`Fn(u32) -> u32`是一个特征，用来表示`T`是一个闭包类型？Bingo，恭喜你，答对了！

那为什么不用具体的类型来标注`query`呢？原因很简单，每一个闭包实例都有独属于自己的类型，甚至于两个签名一模一样的闭包，它们的类型都是不同的，因此你无法用一个统一的类型来标注`query`闭包。

而标准库提供的`Fn`系列特征，再结合特征约束，就很好的解决了这个问题. `T: Fn(u32) -> u32`意味着`query`的类型是`T`，该类型必须实现了相应的闭包特征`Fn(u32) -> u32`。从特征的角度来看它长得非常反直觉，但是如果从闭包的角度来看又极其符合直觉，不得不佩服Rust团队的鬼才设计。。。

特征`Fn(u32) -> u32`从表面来看，就对闭包形式进行了显而易见的限制：**该闭包拥有一个`u32`类型的参数，同时返回一个`u32`类型的值**.

> 需要注意的是，其实Fn特征不仅仅适用于闭包，还适用于函数，因此上面的`query`字段除了使用闭包作为值外，还能使用一个具名的函数来作为它的值

接着，为缓存实现方法:
```rust
impl<T> Cacher<T>
where
    T: Fn(u32) -> u32,
{
    fn new(query: T) -> Cacher<T> {
        Cacher {
            query,
            value: None,
        }
    }

    fn value(&mut self, arg: u32) -> u32 {
        match self.value {
            Some(v) => v,
            None => {
                let v = (self.query)(arg);
                self.value = Some(v);
                v
            }
        }
    }
}
```

## 闭包的生命周期
