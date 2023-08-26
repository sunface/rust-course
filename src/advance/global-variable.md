# 全局变量

在一些场景，我们可能需要全局变量来简化状态共享的代码，包括全局 ID，全局数据存储等等，下面一起来看看有哪些创建全局变量的方法。

首先，有一点可以肯定，全局变量的生命周期肯定是`'static`，但是不代表它需要用`static`来声明，例如常量、字符串字面值等无需使用`static`进行声明，原因是它们已经被打包到二进制可执行文件中。

下面我们从编译期初始化及运行期初始化两个类别来介绍下全局变量有哪些类型及该如何使用。

## 编译期初始化

我们大多数使用的全局变量都只需要在编译期初始化即可，例如静态配置、计数器、状态值等等。

#### 静态常量

全局常量可以在程序任何一部分使用，当然，如果它是定义在某个模块中，你需要引入对应的模块才能使用。常量，顾名思义它是不可变的，很适合用作静态配置：

```rust
const MAX_ID: usize =  usize::MAX / 2;
fn main() {
   println!("用户ID允许的最大值是{}",MAX_ID);
}
```

**常量与普通变量的区别**

- 关键字是`const`而不是`let`
- 定义常量必须指明类型（如 i32）不能省略
- 定义常量时变量的命名规则一般是全部大写
- 常量可以在任意作用域进行定义，其生命周期贯穿整个程序的生命周期。编译时编译器会尽可能将其内联到代码中，所以在不同地方对同一常量的引用并不能保证引用到相同的内存地址
- 常量的赋值只能是常量表达式/数学表达式，也就是说必须是在编译期就能计算出的值，如果需要在运行时才能得出结果的值比如函数，则不能赋值给常量表达式
- 对于变量出现重复的定义(绑定)会发生变量遮盖，后面定义的变量会遮住前面定义的变量，常量则不允许出现重复的定义

#### 静态变量

静态变量允许声明一个全局的变量，常用于全局数据统计，例如我们希望用一个变量来统计程序当前的总请求数：

```rust
static mut REQUEST_RECV: usize = 0;
fn main() {
   unsafe {
        REQUEST_RECV += 1;
        assert_eq!(REQUEST_RECV, 1);
   }
}
```

Rust 要求必须使用`unsafe`语句块才能访问和修改`static`变量，因为这种使用方式往往并不安全，其实编译器是对的，当在多线程中同时去修改时，会不可避免的遇到脏数据。

只有在同一线程内或者不在乎数据的准确性时，才应该使用全局静态变量。

和常量相同，定义静态变量的时候必须赋值为在编译期就可以计算出的值(常量表达式/数学表达式)，不能是运行时才能计算出的值(如函数)

**静态变量和常量的区别**

- 静态变量不会被内联，在整个程序中，静态变量只有一个实例，所有的引用都会指向同一个地址
- 存储在静态变量中的值必须要实现 Sync trait

#### 原子类型

想要全局计数器、状态控制等功能，又想要线程安全的实现，原子类型是非常好的办法。

```rust
use std::sync::atomic::{AtomicUsize, Ordering};
static REQUEST_RECV: AtomicUsize  = AtomicUsize::new(0);
fn main() {
    for _ in 0..100 {
        REQUEST_RECV.fetch_add(1, Ordering::Relaxed);
    }

    println!("当前用户请求数{:?}",REQUEST_RECV);
}
```

关于原子类型的讲解看[这篇文章](https://course.rs/advance/concurrency-with-threads/sync2.html)

#### 示例：全局 ID 生成器

来看看如何使用上面的内容实现一个全局 ID 生成器:

```rust
use std::sync::atomic::{Ordering, AtomicUsize};

struct Factory{
    factory_id: usize,
}

static GLOBAL_ID_COUNTER: AtomicUsize = AtomicUsize::new(0);
const MAX_ID: usize = usize::MAX / 2;

fn generate_id()->usize{
    // 检查两次溢出，否则直接加一可能导致溢出
    let current_val = GLOBAL_ID_COUNTER.load(Ordering::Relaxed);
    if current_val > MAX_ID{
        panic!("Factory ids overflowed");
    }
    GLOBAL_ID_COUNTER.fetch_add(1, Ordering::Relaxed)
    let next_id = GLOBAL_ID_COUNTER.load(Ordering::Relaxed);
    if next_id > MAX_ID{
        panic!("Factory ids overflowed");
    }
    next_id
}

impl Factory{
    fn new()->Self{
        Self{
            factory_id: generate_id()
        }
    }
}
```

## 运行期初始化

以上的静态初始化有一个致命的问题：无法用函数进行静态初始化，例如你如果想声明一个全局的`Mutex`锁：

```rust
use std::sync::Mutex;
static NAMES: Mutex<String> = Mutex::new(String::from("Sunface, Jack, Allen"));

fn main() {
    let v = NAMES.lock().unwrap();
    println!("{}",v);
}
```

运行后报错如下：

```console
error[E0015]: calls in statics are limited to constant functions, tuple structs and tuple variants
 --> src/main.rs:3:42
  |
3 | static NAMES: Mutex<String> = Mutex::new(String::from("sunface"));
```

但你又必须在声明时就对`NAMES`进行初始化，此时就陷入了两难的境地。好在天无绝人之路，我们可以使用`lazy_static`包来解决这个问题。

#### lazy_static

[`lazy_static`](https://github.com/rust-lang-nursery/lazy-static.rs)是社区提供的非常强大的宏，用于懒初始化静态变量，之前的静态变量都是在编译期初始化的，因此无法使用函数调用进行赋值，而`lazy_static`允许我们在运行期初始化静态变量！

```rust
use std::sync::Mutex;
use lazy_static::lazy_static;
lazy_static! {
    static ref NAMES: Mutex<String> = Mutex::new(String::from("Sunface, Jack, Allen"));
}

fn main() {
    let mut v = NAMES.lock().unwrap();
    v.push_str(", Myth");
    println!("{}",v);
}
```

当然，使用`lazy_static`在每次访问静态变量时，会有轻微的性能损失，因为其内部实现用了一个底层的并发原语`std::sync::Once`，在每次访问该变量时，程序都会执行一次原子指令用于确认静态变量的初始化是否完成。

`lazy_static`宏，匹配的是`static ref`，所以定义的静态变量都是不可变引用

可能有读者会问，为何需要在运行期初始化一个静态变量，除了上面的全局锁，你会遇到最常见的场景就是：**一个全局的动态配置，它在程序开始后，才加载数据进行初始化，最终可以让各个线程直接访问使用**

再来看一个使用`lazy_static`实现全局缓存的例子:

```rust
use lazy_static::lazy_static;
use std::collections::HashMap;

lazy_static! {
    static ref HASHMAP: HashMap<u32, &'static str> = {
        let mut m = HashMap::new();
        m.insert(0, "foo");
        m.insert(1, "bar");
        m.insert(2, "baz");
        m
    };
}

fn main() {
    // 首次访问`HASHMAP`的同时对其进行初始化
    println!("The entry for `0` is \"{}\".", HASHMAP.get(&0).unwrap());

    // 后续的访问仅仅获取值，再不会进行任何初始化操作
    println!("The entry for `1` is \"{}\".", HASHMAP.get(&1).unwrap());
}
```

需要注意的是，`lazy_static`直到运行到`main`中的第一行代码时，才进行初始化，非常`lazy static`。

#### Box::leak

在`Box`智能指针章节中，我们提到了`Box::leak`可以用于全局变量，例如用作运行期初始化的全局动态配置，先来看看如果不使用`lazy_static`也不使用`Box::leak`，会发生什么：

```rust
#[derive(Debug)]
struct Config {
    a: String,
    b: String,
}
static mut CONFIG: Option<&mut Config> = None;

fn main() {
    unsafe {
        CONFIG = Some(&mut Config {
            a: "A".to_string(),
            b: "B".to_string(),
        });

        println!("{:?}", CONFIG)
    }
}
```

以上代码我们声明了一个全局动态配置`CONFIG`，并且其值初始化为`None`，然后在程序开始运行后，给它赋予相应的值，运行后报错:

```console
error[E0716]: temporary value dropped while borrowed
  --> src/main.rs:10:28
   |
10 |            CONFIG = Some(&mut Config {
   |   _________-__________________^
   |  |_________|
   | ||
11 | ||             a: "A".to_string(),
12 | ||             b: "B".to_string(),
13 | ||         });
   | ||         ^-- temporary value is freed at the end of this statement
   | ||_________||
   |  |_________|assignment requires that borrow lasts for `'static`
   |            creates a temporary which is freed while still in use
```

可以看到，Rust 的借用和生命周期规则限制了我们做到这一点，因为试图将一个局部生命周期的变量赋值给全局生命周期的`CONFIG`，这明显是不安全的。

好在`Rust`为我们提供了`Box::leak`方法，它可以将一个变量从内存中泄漏(听上去怪怪的，竟然做主动内存泄漏)，然后将其变为`'static`生命周期，最终该变量将和程序活得一样久，因此可以赋值给全局静态变量`CONFIG`。

```rust
#[derive(Debug)]
struct Config {
    a: String,
    b: String
}
static mut CONFIG: Option<&mut Config> = None;

fn main() {
    let c = Box::new(Config {
        a: "A".to_string(),
        b: "B".to_string(),
    });

    unsafe {
        // 将`c`从内存中泄漏，变成`'static`生命周期
        CONFIG = Some(Box::leak(c));
        println!("{:?}", CONFIG);
    }
}
```

#### 从函数中返回全局变量

问题又来了，如果我们需要在运行期，从一个函数返回一个全局变量该如何做？例如：

```rust
#[derive(Debug)]
struct Config {
    a: String,
    b: String,
}
static mut CONFIG: Option<&mut Config> = None;

fn init() -> Option<&'static mut Config> {
    Some(&mut Config {
        a: "A".to_string(),
        b: "B".to_string(),
    })
}


fn main() {
    unsafe {
        CONFIG = init();

        println!("{:?}", CONFIG)
    }
}
```

报错这里就不展示了，跟之前大同小异，还是生命周期引起的，那么该如何解决呢？依然可以用`Box::leak`:

```rust
#[derive(Debug)]
struct Config {
    a: String,
    b: String,
}
static mut CONFIG: Option<&mut Config> = None;

fn init() -> Option<&'static mut Config> {
    let c = Box::new(Config {
        a: "A".to_string(),
        b: "B".to_string(),
    });

    Some(Box::leak(c))
}


fn main() {
    unsafe {
        CONFIG = init();

        println!("{:?}", CONFIG)
    }
}
```

## 标准库中的 OnceCell

在 `Rust` 标准库中提供 `lazy::OnceCell` 和 `lazy::SyncOnceCell` 两种 `Cell`，前者用于单线程，后者用于多线程，它们用来存储堆上的信息，并且具有最多只能赋值一次的特性。 如实现一个多线程的日志组件 `Logger`：

```rust
#![feature(once_cell)]

use std::{lazy::SyncOnceCell, thread};

fn main() {
    // 子线程中调用
    let handle = thread::spawn(|| {
        let logger = Logger::global();
        logger.log("thread message".to_string());
    });

    // 主线程调用
    let logger = Logger::global();
    logger.log("some message".to_string());

    let logger2 = Logger::global();
    logger2.log("other message".to_string());

    handle.join().unwrap();
}

#[derive(Debug)]
struct Logger;

static LOGGER: SyncOnceCell<Logger> = SyncOnceCell::new();

impl Logger {
    fn global() -> &'static Logger {
        // 获取或初始化 Logger
        LOGGER.get_or_init(|| {
            println!("Logger is being created..."); // 初始化打印
            Logger
        })
    }

    fn log(&self, message: String) {
        println!("{}", message)
    }
}
```

以上代码我们声明了一个 `global()` 关联函数，并在其内部调用 `get_or_init` 进行初始化 `Logger`，之后在不同线程上多次调用 `Logger::global()` 获取其实例：

```console
Logger is being created...
some message
other message
thread message
```

可以看到，`Logger is being created...` 在多个线程中使用也只被打印了一次。

特别注意，目前 `OnceCell` 和 `SyncOnceCell` API 暂未稳定，需启用特性 `#![feature(once_cell)]`。

## 总结

在 Rust 中有很多方式可以创建一个全局变量，本章也只是介绍了其中一部分，更多的还等待大家自己去挖掘学习(当然，未来可能本章节会不断完善，最后变成一个巨无霸- , -)。

简单来说，全局变量可以分为两种：

- 编译期初始化的全局变量，`const`创建常量，`static`创建静态变量，`Atomic`创建原子类型
- 运行期初始化的全局变量，`lazy_static`用于懒初始化，`Box::leak`利用内存泄漏将一个变量的生命周期变为`'static`
