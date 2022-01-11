# 消息与锁

在多线程间有多种方式可以共享、传递数据，最常用的方式就是通过消息传递或者将锁和`Arc`联合使用，而对于前者，在编程界还有一个大名鼎鼎的`Actor线程模型`为其背书，典型的有Erlang语言，还有Go语言中很经典的一句话：

> Do not communicate by sharing memory; instead, share memory by communicating

而对于后者，则是老生常谈的解决方法：通过锁来实现在某一个时间点，只有一个线程能访问对应的资源，其它线程则需要等待该线程使用完后，才能申请使用。

## 消息通道
与Go语言内置的`chan`不同，Rust是在标准库里提供了消息通道(`channel`)，你可以将其想象成一场直播，多个主播联合起来在搞一场直播，最终内容通过通道传输给屏幕前的我们，其中主播被称之为**发送者**，观众被称之为**接收者**，显而易见的是：一个通道应该支持多个发送者和接收者。

但是，在实际使用中，我们需要使用不同的库来满足诸如：**多发送者 -> 单接收者，多发送者 -> 多接收者**等场景形式，此时一个标准库显然就不够了，不过别急，让我们先从标准库讲起。

### 多发送者，单接收者
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

#### 不阻塞的try_recv方法
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

#### 传输具有所有权的数据
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

#### 使用for进行循环接收
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

#### 使用多发送者
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

注意，上述第三点的消息顺序仅仅是因为线程创建引起的，并不代表通道中的线程是无序的，对于通道而言，先发送就先被接收，典型的`FIFO`(first in, first out)。

#### 消息顺序
### 关闭通道