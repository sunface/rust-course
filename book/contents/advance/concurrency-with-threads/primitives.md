# 并发原语和共享内存
在多线程编程中，同步性极其的重要，当你需要同时访问一个资源、控制不同线程的执行次序时，都需要使用到同步性。

在Rust中有多种方式可以实现同步性。在上一节中讲到的消息传递就是同步性的一种实现方式，我们可以通过消息传递来控制不同线程间的执行次序。还可以使用共享内存来实现同步性，例如通过锁和原子操作等并发原语来实现多个线程同时且安全地去访问一个资源。

## 该如何选择
共享内存可以说是同步的灵魂，因为消息传递的底层实际上也是通过共享内存来实现，两者的区别如下：

- 共享内存相对消息传递能节省多次内存拷贝的成本
- 共享内存的实现简洁的多
- 共享内存的锁竞争更多

消息传递适用的场景很多，我们下面列出了几个主要的使用场景:

- 需要可靠和简单的(简单不等于简洁)实现时
- 需要模拟现实世界，例如用消息去通知某个目标执行相应的操作时
- 需要一个任务处理流水线(管道)时，等等

而使用共享内存(并发原语)的场景往往就比较简单粗暴：需要极致简洁的实现以及极致的性能时。

总之，消息传递类似一个单所有权的系统：一个值同时只能有一个所有权，如果另一个线程需要该值的所有权，需要将所有权通过消息传递进行转移。而共享内存类似于一个多所有权的系统：多个线程可以同时访问同一个值。 

## 互斥锁Mutex
既然是共享内存，那并发原语自然是重中之重，先来一起看看互斥锁`Mutex`(mutual exclusion的缩写)。

`Mutex`让多个线程同时访问同一个值变成了排队访问：同一时间，只允许一个线程`A`访问该值，其它线程需要等待`A`访问完成后才能继续。如果要访问`Mutex`中的数据，线程需要先获取`mutex`中的锁，以通知`mutex`它需要访问目标资源。

#### 单线程中使用Mutex
先来看看单线程中`Mutex`该如何使用:
```rust
use std::sync::Mutex;

fn main() {
    // 使用`Mutex`结构体的关联函数创建新的互斥锁实例
    let m = Mutex::new(5);

    {
        // 获取锁，然后deref为`m`的引用
        // lock返回的是Result
        let mut num = m.lock().unwrap();
        *num = 6;
        // 锁自动被drop
    }

    println!("m = {:?}", m);
}
```

在注释中，已经大致描述了代码的功能，不过有一点需要注意：和`Box`类似，数据被`Mutex`所拥有，要访问内部的数据，需要使用方法`m.lock()`向`m`申请一个锁, 该方法会**阻塞当前线程，直到获取到锁**，因此当多个线程同时访问该数据时，只有一个线程获取到锁，其它线程只能阻塞等待，这样就保证了数据能被安全的修改！

**`m.lock()`方法也有可能报错**，例如当前正在持有锁的线程`panic`了。在这种情况下，其它线程不可能再获得锁，因此它们会获取一个错误。

这里你可能奇怪，`m.lock`明明返回一个锁，怎么就变成我们的`num`数值了？聪明的读者可能会想到智能指针，没错，因为`Mutex<T>`是一个智能指针，准确的说是`m.lock()`返回一个智能指针`MutexGuard`:

- 它实现了`Deref`特征，会被自动解引用后获得一个引用类型，该引用指向`Mutex`内部的数据
- 它还实现了`Drop`特征，在超出作用域后，自动释放锁，以便其它线程能继续获取锁

正因为智能指针的使用，使得我们无需操作如何获取数据，如果释放锁，你需要做的仅仅是做好锁的作用域管理，例如上述代码的内部花括号使用，建议读者尝试下去掉内部的花括号，然后再次尝试获取第二个锁`num1`，看看会发生什么，友情提示：不会报错，但是主线程会永远阻塞。

#### 多线程中使用Mutex
单线程中使用锁，说实话纯粹是为了演示功能，毕竟多线程才是锁的舞台。 现在，我们再来看看，如何在多线程下使用`Mutex`来访问同一个资源.

##### 无法运行的`Rc<T>`
```rust
use std::rc::Rc;
use std::sync::Mutex;
use std::thread;

fn main() {
    // 通过`Rc`实现`Mutex`的多所有权
    let counter = Rc::new(Mutex::new(0));
    let mut handles = vec![];

    for _ in 0..10 {
        let counter = Rc::clone(&counter);
        // 创建子线程，并将`Mutex`的所有权拷贝传入到子线程中
        let handle = thread::spawn(move || {
            let mut num = counter.lock().unwrap();

            *num += 1;
        });
        handles.push(handle);
    }

    // 等待所有子线程完成
    for handle in handles {
        handle.join().unwrap();
    }

    // 输出最终的计数结果
    println!("Result: {}", *counter.lock().unwrap());
}
```

由于子线程需要通过`move`拿走锁的所有权，因此我们需要使用多所有权来实现每个线程都拿到数据的独立所有权，恰好智能指针[`Rc<T>`](../smart-pointer/rc-arc.md)可以做到(**上面代码会报错**！具体往下看，别跳过-, -)。

以上代码实现了在多线程中计数的功能，由于多个线程都需要去修改该计数器，因此我们需要使用锁来保证同一时间只有一个线程可以修改计数器，否则会导致脏数据：想想一下A线程和B线程同时拿到计数器，获取了当前值`1`, 并且同时对其进行了修改，最后值变成`2`，而正确的值是`3`，因为两个线程各自加1。

可能有人会说，有那么巧的事情吗？事实上，对于人类来说，因为行为速度较慢，因为没有那么多巧合，所以人总会存在巧合心理。但是对于计算机而言，每秒可以轻松运行上亿次，在这种频次下，一切巧合几乎都将必然发生，因此千万不要有侥幸心理。

> 如果事情有变坏的可能，不管这种可能性有多小，它都会发生！ - 极其适用于计算机领域的墨菲定律

事实上，上面的代码会报错:
```console
error[E0277]: `Rc<Mutex<i32>>` cannot be sent between threads safely 
                // `Rc`无法在线程中安全的传输
   --> src/main.rs:11:22
    |
11  |           let handle = thread::spawn(move || {
    |  ______________________^^^^^^^^^^^^^_-
    | |                      |
    | |                      `Rc<Mutex<i32>>` cannot be sent between threads safely
12  | |             let mut num = counter.lock().unwrap();
13  | |
14  | |             *num += 1;
15  | |         });
    | |_________- within this `[closure@src/main.rs:11:36: 15:10]`
    |
    = help: within `[closure@src/main.rs:11:36: 15:10]`, the trait `Send` is not implemented for `Rc<Mutex<i32>>`
     // `Rc`没有实现`Send`特征
    = note: required because it appears within the type `[closure@src/main.rs:11:36: 15:10]`
```

上面提到了一个关键点：`Rc<T>`无法在线程中传输，是因为它没有实现`Send`特征(在下一节将详细介绍)，而该特征可以确保数据在线程中安全的传输。

##### 多线程安全的Arc<T>
好在，我们有`Arc<T>`，因为它的[内部计数器](../smart-pointer/rc-arc.md#多线程无力的rc)是多线程安全的，因此可以在多线程环境中使用:
```rust
use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let counter = Arc::new(Mutex::new(0));
    let mut handles = vec![];

    for _ in 0..10 {
        let counter = Arc::clone(&counter);
        let handle = thread::spawn(move || {
            let mut num = counter.lock().unwrap();

            *num += 1;
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }

    println!("Result: {}", *counter.lock().unwrap());
}
```

以上代码可以顺利运行:
```console
Result: 10
```

#### 内部可变性
在之前章节，我们提到过[内部可变性](../smart-pointer/cell-refcell.md#内部可变性)，其中`Rc<T>`和`RefCell<T>`的结合，可以实现单线程的内部可变性。

现在我们又有了新的武器，由于`Mutex<T>`可以支持修改内部数据，因此结合`Arc<T>`一起使用，可以实现多线程的内部可变性。

简单总结下：`Rc<T>/RefCell<T>`用于单线程可变性， `Arc<T>/Mutext<T>`用于多线程可变性。


#### Mutex<T>的局限性
Mutexes have a reputation for being difficult to use because you have to remember two rules:

You must attempt to acquire the lock before using the data.
When you’re done with the data that the mutex guards, you must unlock the data so other threads can acquire the lock.

Management of mutexes can be incredibly tricky to get right, which is why so many people are enthusiastic about channels. However, thanks to Rust’s type system and ownership rules, you can’t get locking and unlocking wrong.

Another detail to note is that Rust can’t protect you from all kinds of logic errors when you use Mutex<T>. Recall in Chapter 15 that using Rc<T> came with the risk of creating reference cycles, where two Rc<T> values refer to each other, causing memory leaks. Similarly, Mutex<T> comes with the risk of creating deadlocks. These occur when an operation needs to lock two resources and two threads have each acquired one of the locks, causing them to wait for each other forever. If you’re interested in deadlocks, try creating a Rust program that has a deadlock; then research deadlock mitigation strategies for mutexes in any language and have a go at implementing them in Rust. The standard library API documentation for Mutex<T> and MutexGuard offers useful information.
#### Mutex和Arc

## RwLock

## Atomic

## Condvar