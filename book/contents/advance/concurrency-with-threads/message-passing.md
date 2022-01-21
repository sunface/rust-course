# 线程间的消息传递
在多线程间有多种方式可以共享、传递数据，最常用的方式就是通过消息传递或者将锁和`Arc`联合使用，而对于前者，在编程界还有一个大名鼎鼎的`Actor线程模型`为其背书，典型的有Erlang语言，还有Go语言中很经典的一句话：

> Do not communicate by sharing memory; instead, share memory by communicating

而对于后者，我们将在下一节中进行讲述。

## 消息通道
与Go语言内置的`chan`不同，Rust是在标准库里提供了消息通道(`channel`)，你可以将其想象成一场直播，多个主播联合起来在搞一场直播，最终内容通过通道传输给屏幕前的我们，其中主播被称之为**发送者**，观众被称之为**接收者**，显而易见的是：一个通道应该支持多个发送者和接收者。

但是，在实际使用中，我们需要使用不同的库来满足诸如：**多发送者 -> 单接收者，多发送者 -> 多接收者**等场景形式，此时一个标准库显然就不够了，不过别急，让我们先从标准库讲起。

## 多发送者，单接收者
标准库提供了通道`std::sync::mpsc`，其中`mpsc`是*multiple producer, single consumer*的缩写，代表了该通道支持多个发送者，但是只支持唯一的接收者。 当然，支持多个发送者也意味着支持单个发送者，我们先来看看单发送者、单接收者的简单例子:
```rust
use std::sync::mpsc;
use std::thread;

fn main() {
    // 创建一个消息通道, 返回一个元组：(发送者，接收者)
    let (tx, rx) = mpsc::channel();

    // 创建线程，并发送消息
    thread::spawn(move || {
        // 发送一个数字1, send方法返回Result<T,E>，通过unwrap进行快速错误处理
        tx.send(1).unwrap();
        
        // 下面代码将报错，因为编译器自动推导出通道传递的值是i32类型，那么Option<i32>类型将产生不匹配错误
        // tx.send(Some(1)).unwrap()
    });

    // 在主线程中接收子线程发送的消息并输出
    println!("receive {}", rx.recv().unwrap());
}
```

以上代码并不复杂，但仍有几点需要注意：

- `tx`,`rx`对应发送者和接收者，它们的类型由编译器自动推导: `tx.send(1)`发送了整数，因此它们分别是`mpsc::Sender<i32>`和`mpsc::Receiver<i32>`类型，需要注意，由于内部是泛型实现，一旦类型被推导确定，该通道就只能传递对应类型的值, 例如此例中非`i32`类型的值将导致编译错误
- 接收消息的操作`rx.recv()`会阻塞当前线程，直到读取到值，或者通道被关闭
- 需要使用`move`将`tx`的所有权转移到子线程的闭包中

在注释中提到`send`方法返回一个`Result<T,E>`，说明它有可能返回一个错误，例如接收者被`drop`导致了发送的值不会被任何人接收，此时继续发送毫无意义，因此返回一个错误最为合适，在代码中我们仅仅使用`unwrap`进行了快速处理，但在实际项目中你需要对错误进行进一步的处理。

同样的，对于`recv`方法来说，当发送者关闭时，它也会接收到一个错误，用于说明不会再有任何值被发送过来。

## 不阻塞的try_recv方法
除了上述`recv`方法，还可以使用`try_recv`尝试接收一次消息，该方法并**不会阻塞线程**，当通道中没有消息时，它会立刻返回一个错误：
```rust
use std::sync::mpsc;
use std::thread;

fn main() {
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        tx.send(1).unwrap();
    });

    println!("receive {:?}", rx.try_recv());
}
```

由于子线程的创建需要时间，因此`println!`和`try_recv`方法会先执行，而此时子线程的**消息还未被发出**。`try_recv`会尝试立即读取一次消息，因为消息没有发出，此次读取最终会报错，且主线程运行结束(可悲的是，相对于主线程中的代码，子线程的创建速度实在是过慢，直到主线程结束，都无法完成子线程的初始化。。):
```console
receive Err(Empty)
```

如上，`try_recv`返回了一个错误，错误内容是`Empty`，代表通道并没有消息。如果你尝试把`println!`复制一些行，就会发现一个有趣的输出：
```console
···
receive Err(Empty)
receive Ok(1)
receive Err(Disconnected)
···
```

如上，当子线程创建成功且发送消息后，主线程会接收到`Ok(1)`的消息内容，紧接着子线程结束，发送者也随着被`drop`，此时接收者又会报错，但是这次错误原因有所不同：`Disconnected`代表发送者已经被关闭。

## 传输具有所有权的数据
使用通道来传输数据，一样要遵循Rust的所有权规则：

- 若值的类型实现了`Copy`特征，则直接复制一份该值，然后传输过去，例如之前的`i32`类型
- 若值没有实现`Copy`，则它的所有权会被转移给接收端，在发送端继续使用该值将报错

一起来看看第二种情况:
```rust
use std::sync::mpsc;
use std::thread;

fn main() {
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        let s = String::from("我，飞走咯!");
        tx.send(s).unwrap();
        println!("val is {}", s);
    });

    let received = rx.recv().unwrap();
    println!("Got: {}", received);
}
```

以上代码中，`String`底层的字符串是存储在堆上，被没有实现`Copy`特征，当它被发送后，会将所有权从发送端的`s`转移给接收端的`received`，之后`s`将无法被使用:
```console
error[E0382]: borrow of moved value: `s`
  --> src/main.rs:10:31
   |
8  |         let s = String::from("我，飞走咯!");
   |             - move occurs because `s` has type `String`, which does not implement the `Copy` trait // 所有权被转移，由于`String`没有实现`Copy`特征
9  |         tx.send(s).unwrap();
   |                 - value moved here // 所有权被转移走
10 |         println!("val is {}", s);
   |                               ^ value borrowed here after move // 所有权被转移后，依然对s进行了借用
```

各种细节不禁令人感叹：Rust还是安全！假如没有所有权的保护，`String`字符串将被两个线程同时持有，任何一个线程对字符串内容的修改都会导致另外一个线程持有的字符串被改变，除非你故意这么设计，否则这就是不安全的隐患。

## 使用for进行循环接收
下面来看看如何连续接收通道中的值:
```rust
use std::sync::mpsc;
use std::thread;
use std::time::Duration;

fn main() {
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        let vals = vec![
            String::from("hi"),
            String::from("from"),
            String::from("the"),
            String::from("thread"),
        ];

        for val in vals {
            tx.send(val).unwrap();
            thread::sleep(Duration::from_secs(1));
        }
    });

    for received in rx {
        println!("Got: {}", received);
    }
}
```

在上面代码中，主线程和子线程是并发运行的，子线程在不停的**发送消息 -> 休眠1秒**，与此同时，主线程使用`for`循环**阻塞**的从`rx`**迭代器**中接收消息，当子线程运行完成时，发送者`tx`会随之被`drop`，此时`for`循环将被终止，最终`main`线程成功结束。

### 使用多发送者
由于子线程会拿走发送者的所有权，因此我们必须对发送者进行克隆，然后让每个线程拿走它的一份拷贝:
```rust
use std::sync::mpsc;
use std::thread;

fn main() {
    let (tx, rx) = mpsc::channel();
    let tx1 = tx.clone();
    thread::spawn(move || {
        tx.send(String::from("hi from raw tx")).unwrap();
    });

    thread::spawn(move || {
        tx1.send(String::from("hi from cloned tx")).unwrap();
    });
    
    for received in rx {
        println!("Got: {}", received);
    }
}
```

代码并无太大区别，就多了一个对发送者的克隆`let tx1 = tx.clone();`，然后一个子线程拿走`tx`的所有权，另一个子线程拿走`tx1`的所有权，皆大欢喜。

但是有几点需要注意:

- 需要所有的发送者都被`drop`掉后，接收者`rx`才会收到错误，进而跳出`for`循环，最终结束主线程
- 这里虽然用了`clone`但是并不会影响性能，因为它并不在热点代码路径中，仅仅会被执行一次
- 由于两个子线程谁创建完成是未知的，因此哪条消息先发送也是未知的，最终主线程的输出顺序也不确定

## 消息顺序
上述第三点的消息顺序仅仅是因为线程创建引起的，并不代表通道中的线程是无序的，对于通道而言，消息的发送顺序和接收顺序是一直的，满足`FIFO`原则(先进先出)。

由于篇幅有限，具体的代码这里就不再给出，感兴趣的读者可以自己验证下。


## 同步和异步通道
Rust标准库的`mpsc`通道其实分为两种类型：同步和异步。

#### 异步通道
之前我们使用的都是异步通道：无论接收者是否正在接收消息，消息发送者在发送消息时都不会阻塞:
```rust
use std::sync::mpsc;
use std::thread;
use std::time::Duration;
fn main() {
    let (tx, rx)= mpsc::channel();

    let handle = thread::spawn(move || {
        println!("发送之前");
        tx.send(1).unwrap();
        println!("发送之后");
    });

    println!("睡眠之前");
    thread::sleep(Duration::from_secs(3));
    println!("睡眠之后");

    println!("收到值 {}", rx.recv().unwrap());
    handle.join().unwrap();
}
```

运行后输出如下:
```console
睡眠之前
发送之前
发送之后
//···睡眠3秒
睡眠之后
收到值 1
```

主线程因为睡眠阻塞了3秒，因此并没有进行消息接收，而子线程却在此期间轻松完成了消息的发送。等主线程睡眠结束后，才姗姗来迟的从通道中接收了子线程老早之前发送的消息。

从输出还可以看出，`发送之前`和`发送之后`是连续输出的，没有受到接收端主线程的任何影响，因此通过`mpsc::channel`创建的通道是异步通道。

#### 同步通道
与异步通道相反，同步通道**发送消息是阻塞的，只有在消息被接收后才解除阻塞**例如：
```rust
use std::sync::mpsc;
use std::thread;
use std::time::Duration;
fn main() {
    let (tx, rx)= mpsc::sync_channel(0);

    let handle = thread::spawn(move || {
        println!("发送之前");
        tx.send(1).unwrap();
        println!("发送之后");
    });

    println!("睡眠之前");
    thread::sleep(Duration::from_secs(3));
    println!("睡眠之后");

    println!("receive {}", rx.recv().unwrap());
    handle.join().unwrap();
}
```

运行后输出如下：
```console
睡眠之前
发送之前
//···睡眠3秒
睡眠之后
收到值 1
发送之后
```

可以看出，主线程由于睡眠被阻塞导致无法接收消息，因此子线程的发送也一直被阻塞，直到主线程结束睡眠并成功接收消息后，发送才成功：**发送之后**的输出是在**收到值 1**之后，说明**只有接收消息彻底成功后，发送消息才算完成**。


#### 消息缓存
细心的读者可能已经发现在创建同步通道时，我们传递了一个参数`0`: `mpsc::sync_channel(0);`，这是什么意思呢？

答案不急给出，先将`0`改成`1`，然后再运行试试:
```console
睡眠之前
发送之前
发送之后
睡眠之后
receive 1
```

纳尼。。竟然得到了和异步通道一样的效果：根本没有等待主线程的接收开始，消息发送就立即完成了！ 难道同步通道变成了异步通道？ 别急，将子线程中的代码修改下试试：
```rust
println!("首次发送之前");
tx.send(1).unwrap();
println!("首次发送之后");
tx.send(1).unwrap();
println!("再次发送之后");
```

在子线程中，我们又多发了一条消息，此时输出如下：
```console
睡眠之前
首次发送之前
首次发送之后
//···睡眠3秒
睡眠之后
receive 1
再次发送之后
```

Bingo，更奇怪的事出现了，第一条消息瞬间发送完成，没有阻塞，而发送第二条消息时却符合同步通道的特点：阻塞了，直到主线程接收后，才发送完成。

其实，一切的关键就在于`1`上，该值可以用来指定同步通道的消息缓存条数，当你设定为`N`时，发送者就可以无阻塞的往通道中发送`N`条消息，当消息缓冲队列满了后，新的消息发送将被阻塞(如果没有接收者消费缓冲队列中的消息，那么第`N+1`条消息就将触发发送阻塞)。

问题又来了，异步通道创建时完全没有这个缓冲值参数`mpsc::channel()`，它的缓冲值怎么设置呢？ 额。。。都异步了，都可以无限发送了，都有摩托车了，还要自行车做啥子哦？事实上异步通道的缓冲上限取决于你的内存大小，不要撑爆就行。

因此，使用异步消息虽然能非常高效且不会造成发送线程的阻塞，但是存在消息未及时消费，最终内存过大的问题。在实际项目中，可以考虑使用一个带缓冲值的同步通道来避免这种风险。



## 关闭通道
之前我们数次提到了通道关闭，并且提到了当通道关闭后，发送消息或接收消息将会报错。那么如何关闭通道呢？ 很简单：**所有发送者被`drop`或者所有接收者被`drop`后，通道会自动关闭**。

神奇的是，这件事是在编译期实现的，完全没有运行期性能损耗！只能说Rust的`Drop`特征YYDS!

## 传输多种类型的数据
之前提到过，一个消息通道只能传输一种类型的数据，如果你想要传输多种类型的数据，可以为每个类型创建一个通道，你也可以使用枚举类型来实现：
```rust
use std::sync::mpsc::{self, Receiver, Sender};

enum Fruit {
    Apple(u8),
    Orange(String)
}

fn main() {
    let (tx, rx): (Sender<Fruit>, Receiver<Fruit>) = mpsc::channel();

    tx.send(Fruit::Orange("sweet".to_string())).unwrap();
    tx.send(Fruit::Apple(2)).unwrap();

    for _ in 0..2 {
        match rx.recv().unwrap() {
            Fruit::Apple(count) => println!("received {} apples", count),
            Fruit::Orange(flavor) => println!("received {} oranges", flavor),
        }
    }
}
```

如上所示，枚举类型还能让我们带上想要传输的数据，但是有一点需要注意，Rust会按照枚举中占用内存最大的那个成员进行内存对齐，这意味着就算你传输的是枚举中占用内存最小的成员，它占用的内存依然和最大的成员相同, 因此会造成内存上的浪费。

## 新手容易遇到的坑
`mpsc`虽然相当简洁明了，但是在使用起来还是可能存在坑：
```rust
use std::sync::mpsc;
fn main() {

    use std::thread;
    
    let (send, recv) = mpsc::channel();
    let num_threads = 3;
    for i in 0..num_threads {
        let thread_send = send.clone();
        thread::spawn(move || {
            thread_send.send(i).unwrap();
            println!("thread {:?} finished", i);
        });
    }
    
    // 在这里drop send...
    
    for x in recv {
        println!("Got: {}", x);
    }
    println!("finished iterating");
}
```
以上代码看起来非常正常，但是运行后主线程会一直阻塞，最后一行打印输出也不会被执行，原因在于： 子线程拿走的是复制后的`send`的所有权，这些拷贝会在子线程结束后被`drop`，因此无需担心，但是`send`本身却直到`main`函数的结束才会被`drop`。

之前提到，通道关闭的两个条件：发送者全部`drop`或接收者被`drop`，要结束`for`循环显然是要求发送者全部`drop`，但是由于`send`自身没有被`drop`，会导致该循环永远无法结束，最终主线程会一直阻塞。

解决办法很简单，`drop`掉`send`即可：在代码中的注释下面添加一行`drop(send);`。

## mpmc、更好的性能
如果你需要mpmc(多发送者，多接收者)或者需要更高的性能，可以考虑第三方库:

- [**crossbeam-channel**](https://github.com/crossbeam-rs/crossbeam/tree/master/crossbeam-channel), 老牌强库，功能较全，性能较强，之前是独立的库，但是后面合并到了`crossbeam`主仓库中
- [**flume**](https://github.com/zesterer/flume), 官方给出的性能数据要比crossbeam更好些，但是貌似最近没怎么更新
