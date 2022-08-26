# 线程同步：锁、Condvar 和信号量

在多线程编程中，同步性极其的重要，当你需要同时访问一个资源、控制不同线程的执行次序时，都需要使用到同步性。

在 Rust 中有多种方式可以实现同步性。在上一节中讲到的消息传递就是同步性的一种实现方式，例如我们可以通过消息传递来控制不同线程间的执行次序。还可以使用共享内存来实现同步性，例如通过锁和原子操作等并发原语来实现多个线程同时且安全地去访问一个资源。

## 该如何选择

共享内存可以说是同步的灵魂，因为消息传递的底层实际上也是通过共享内存来实现，两者的区别如下：

- 共享内存相对消息传递能节省多次内存拷贝的成本
- 共享内存的实现简洁的多
- 共享内存的锁竞争更多

消息传递适用的场景很多，我们下面列出了几个主要的使用场景:

- 需要可靠和简单的(简单不等于简洁)实现时
- 需要模拟现实世界，例如用消息去通知某个目标执行相应的操作时
- 需要一个任务处理流水线(管道)时，等等

而使用共享内存(并发原语)的场景往往就比较简单粗暴：需要简洁的实现以及更高的性能时。

总之，消息传递类似一个单所有权的系统：一个值同时只能有一个所有者，如果另一个线程需要该值的所有权，需要将所有权通过消息传递进行转移。而共享内存类似于一个多所有权的系统：多个线程可以同时访问同一个值。

## 互斥锁 Mutex

既然是共享内存，那并发原语自然是重中之重，先来一起看看皇冠上的明珠: 互斥锁`Mutex`(mutual exclusion 的缩写)。

`Mutex`让多个线程并发的访问同一个值变成了排队访问：同一时间，只允许一个线程`A`访问该值，其它线程需要等待`A`访问完成后才能继续。

#### 单线程中使用 Mutex

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

在注释中，已经大致描述了代码的功能，不过有一点需要注意：和`Box`类似，数据被`Mutex`所拥有，要访问内部的数据，需要使用方法`m.lock()`向`m`申请一个锁, 该方法会**阻塞当前线程，直到获取到锁**，因此当多个线程同时访问该数据时，只有一个线程能获取到锁，其它线程只能阻塞着等待，这样就保证了数据能被安全的修改！

**`m.lock()`方法也有可能报错**，例如当前正在持有锁的线程`panic`了。在这种情况下，其它线程不可能再获得锁，因此`lock`方法会返回一个错误。

这里你可能奇怪，`m.lock`明明返回一个锁，怎么就变成我们的`num`数值了？聪明的读者可能会想到智能指针，没错，因为`Mutex<T>`是一个智能指针，准确的说是`m.lock()`返回一个智能指针`MutexGuard<T>`:

- 它实现了`Deref`特征，会被自动解引用后获得一个引用类型，该引用指向`Mutex`内部的数据
- 它还实现了`Drop`特征，在超出作用域后，自动释放锁，以便其它线程能继续获取锁

正因为智能指针的使用，使得我们无需任何操作就能获取其中的数据。 如果释放锁，你需要做的仅仅是做好锁的作用域管理，例如上述代码的内部花括号使用，建议读者尝试下去掉内部的花括号，然后再次尝试获取第二个锁`num1`，看看会发生什么，友情提示：不会报错，但是主线程会永远阻塞，因为不幸发生了死锁。

```rust
use std::sync::Mutex;

fn main() {
    let m = Mutex::new(5);

    let mut num = m.lock().unwrap();
    *num = 6;
    // 锁还没有被 drop 就尝试申请下一个锁，导致主线程阻塞
    // drop(num); // 手动 drop num ，可以让 num1 申请到下个锁
    let mut num1 = m.lock().unwrap();
    *num1 = 7;
    // drop(num1); // 手动 drop num1 ，观察打印结果的不同

    println!("m = {:?}", m);
}
```

#### 多线程中使用 Mutex

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

由于子线程需要通过`move`拿走锁的所有权，因此我们需要使用多所有权来保证每个线程都拿到数据的独立所有权，恰好智能指针[`Rc<T>`](https://course.rs/advance/smart-pointer/rc-arc.html)可以做到(**上面代码会报错**！具体往下看，别跳过-, -)。

以上代码实现了在多线程中计数的功能，由于多个线程都需要去修改该计数器，因此我们需要使用锁来保证同一时间只有一个线程可以修改计数器，否则会导致脏数据：想象一下 A 线程和 B 线程同时拿到计数器，获取了当前值`1`, 并且同时对其进行了修改，最后值变成`2`，你会不会在风中凌乱？毕竟正确的值是`3`，因为两个线程各自加 1。

可能有人会说，有那么巧的事情吗？事实上，对于人类来说，因为干啥啥慢，并没有那么多巧合，所以人总会存在巧合心理。但是对于计算机而言，每秒可以轻松运行上亿次，在这种频次下，一切巧合几乎都将必然发生，因此千万不要有任何侥幸心理。

> 如果事情有变坏的可能，不管这种可能性有多小，它都会发生！ - 在计算机领域歪打正着的墨菲定律

事实上，上面的代码会报错:

```console
error[E0277]: `Rc<Mutex<i32>>` cannot be sent between threads safely
                // `Rc`无法在线程中安全的传输
   --> src/main.rs:11:22
    |
13  |           let handle = thread::spawn(move || {
    |  ______________________^^^^^^^^^^^^^_-
    | |                      |
    | |                      `Rc<Mutex<i32>>` cannot be sent between threads safely
14  | |             let mut num = counter.lock().unwrap();
15  | |
16  | |             *num += 1;
17  | |         });
    | |_________- within this `[closure@src/main.rs:11:36: 15:10]`
    |
    = help: within `[closure@src/main.rs:11:36: 15:10]`, the trait `Send` is not implemented for `Rc<Mutex<i32>>`
     // `Rc`没有实现`Send`特征
    = note: required because it appears within the type `[closure@src/main.rs:11:36: 15:10]`
```

错误中提到了一个关键点：`Rc<T>`无法在线程中传输，因为它没有实现`Send`特征(在下一节将详细介绍)，而该特征可以确保数据在线程中安全的传输。

##### 多线程安全的 `Arc<T>`

好在，我们有`Arc<T>`，得益于它的[内部计数器](https://course.rs/advance/smart-pointer/rc-arc.html#多线程无力的rc)是多线程安全的，因此可以在多线程环境中使用:

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

在之前章节，我们提到过[内部可变性](https://course.rs/advance/smart-pointer/cell-refcell.html#内部可变性)，其中`Rc<T>`和`RefCell<T>`的结合，可以实现单线程的内部可变性。

现在我们又有了新的武器，由于`Mutex<T>`可以支持修改内部数据，当结合`Arc<T>`一起使用时，可以实现多线程的内部可变性。

简单总结下：`Rc<T>/RefCell<T>`用于单线程内部可变性， `Arc<T>/Mutex<T>`用于多线程内部可变性。

#### 需要小心使用的 Mutex

如果有其它语言的编程经验，就知道互斥锁这家伙不好对付，想要正确使用，你得牢记在心：

- 在使用数据前必须先获取锁
- 在数据使用完成后，必须**及时**的释放锁，比如文章开头的例子，使用内部语句块的目的就是为了及时的释放锁

这两点看起来不起眼，但要正确的使用，其实是相当不简单的，对于其它语言，忘记释放锁是经常发生的，虽然 Rust 通过智能指针的`drop`机制帮助我们避免了这一点，但是由于不及时释放锁导致的性能问题也是常见的。

正因为这种困难性，导致很多用户都热衷于使用消息传递的方式来实现同步，例如 Go 语言直接把`channel`内置在语言特性中，甚至还有无锁的语言，例如`erlang`，完全使用`Actor`模型，依赖消息传递来完成共享和同步。幸好 Rust 的类型系统、所有权机制、智能指针等可以很好的帮助我们减轻使用锁时的负担。

另一个值的注意的是在使用`Mutex<T>`时，Rust 无法帮我们避免所有的逻辑错误，例如在之前章节，我们提到过使用`Rc<T>`可能会导致[循环引用的问题](https://course.rs/advance/circle-self-ref/circle-reference.html)。类似的，`Mutex<T>`也存在使用上的风险，例如创建死锁(deadlock)：当一个操作试图锁住两个资源，然后两个线程各自获取其中一个锁，并试图获取另一个锁时，就会造成死锁。

## 死锁

在 Rust 中有多种方式可以创建死锁，了解这些方式有助于你提前规避可能的风险，一起来看看。

#### 单线程死锁

这种死锁比较容易规避，但是当代码复杂后还是有可能遇到：

```rust
use std::sync::Mutex;

fn main() {
    let data = Mutex::new(0);
    let d1 = data.lock();
    let d2 = data.lock();
} // d1锁在此处释放
```

非常简单，只要你在另一个锁还未被释放时去申请新的锁，就会触发，当代码复杂后，这种情况可能就没有那么显眼。

#### 多线程死锁

当我们拥有两个锁，且两个线程各自使用了其中一个锁，然后试图去访问另一个锁时，就可能发生死锁：

```rust
use std::{sync::Mutex, thread};

use lazy_static::lazy_static;
lazy_static! {
    static ref COUNTER1: Mutex<i32> = Mutex::new(0);
    static ref COUNTER2: Mutex<i32> = Mutex::new(0);
}

fn main() {
    let handle1 = thread::spawn(move || {
        let mut num1 = COUNTER1.lock().unwrap();
        *num1 += 1;

        println!("第一个线程获取了锁1");

        println!("第一个线程开始等待了锁2");
        let mut num2 = COUNTER2.lock().unwrap();
        *num2 += 1;

        println!("第一个线程获取了锁2");
    });

    let handle2 = thread::spawn(move || {
        let mut num2 = COUNTER2.lock().unwrap();
        *num2 += 1;

        println!("第二个线程获取了锁2");

        println!("第二个线程开始等待了锁1");
        let mut num1 = COUNTER1.lock().unwrap();
        *num1 += 1;

        println!("第二个线程获取了锁1");
    });

    // 主线程等待这两个线程执行完在结束
    let _ = handle1.join();
    let _ = handle2.join();

    println!("死锁没有发生");
}
```
需要知道的是，这段代码并`不会100%发生死锁`，因为我们并`不知道线程什么时候执行`，有可能线程1完全执行完毕后线程2才开始执行，这种情况下不会发生死锁

运行这段代码，如果你看到了类似如下的输出，则证明发生了死锁
```
第一个线程获取了锁1
第二个线程获取了锁2
第二个线程开始等待了锁1
第一个线程开始等待了锁2
```

#### try_lock

与`lock`方法不同，`try_lock`会**尝试**去获取一次锁，如果无法获取会返回一个错误，因此**不会发生阻塞**:

```rust
use std::{sync::Mutex, thread};

use lazy_static::lazy_static;
lazy_static! {
    static ref COUNTER1: Mutex<i32> = Mutex::new(0);
    static ref COUNTER2: Mutex<i32> = Mutex::new(0);
}

fn main() {
    let handle1 = thread::spawn(move || {
        let mut num1 = COUNTER1.lock().unwrap();
        *num1 += 1;

        println!("第一个线程获取了锁1");

        println!("第一个线程开始等待了锁2");
        let num2 = COUNTER2.try_lock(); // lock 换成 try_lock
        println!("第一个线程获取锁2的结果是: {:?}", num2);
    });

    let handle2 = thread::spawn(move || {
        let mut num2 = COUNTER2.lock().unwrap();
        *num2 += 1;

        println!("第二个线程获取了锁2");

        println!("第二个线程开始等待了锁1");
        let num1 = COUNTER1.try_lock(); // lock 换成 try_lock
        println!("第二个线程获取锁1的结果是: {:?}", num1);
    });

    // 主线程等待这两个线程执行完在结束
    let _ = handle1.join();
    let _ = handle2.join();

    println!("死锁没有发生");
}
```

为了演示`try_lock`的作用，我们特定使用了之前必定会死锁的代码，并且将`lock`替换成`try_lock`，与之前的结果不同，这段代码无论如何将不会再有死锁发生：

```console
第一个线程获取了锁1
第一个线程开始等待了锁2
第一个线程获取锁2的结果是: Err("WouldBlock")
第二个线程获取了锁2
第二个线程开始等待了锁1
第二个线程获取锁1的结果是: Ok(1)
死锁没有发生
```

如上所示，当`try_lock`失败时，会报出一个错误:`Err("WouldBlock")`，接着线程中的剩余代码会继续执行，不会被阻塞。

> 一个有趣的命名规则：在 Rust 标准库中，使用`try_xxx`都会尝试进行一次操作，如果无法完成，就立即返回，不会发生阻塞。例如消息传递章节中的`try_recv`以及本章节中的`try_lock`

## 读写锁 RwLock

`Mutex`会对每次读写都进行加锁，但某些时候，我们需要大量的并发读，`Mutex`就无法满足需求了，此时就可以使用`RwLock`:

```rust
use std::sync::RwLock;

fn main() {
    let lock = RwLock::new(5);

    // 同一时间允许多个读
    {
        let r1 = lock.read().unwrap();
        let r2 = lock.read().unwrap();
        assert_eq!(*r1, 5);
        assert_eq!(*r2, 5);
    } // 读锁在此处被drop

    // 同一时间只允许一个写
    {
        let mut w = lock.write().unwrap();
        *w += 1;
        assert_eq!(*w, 6);

        // 以下代码会panic，因为读和写不允许同时存在
        // 写锁w直到该语句块结束才被释放，因此下面的读锁依然处于`w`的作用域中
        // let r1 = lock.read();
        // println!("{:?}",r1);
    }// 写锁在此处被drop
}
```

`RwLock`在使用上和`Mutex`区别不大，需要注意的是，当读写同时发生时，程序会直接`panic`(本例是单线程，实际上多个线程中也是如此)，因为会发生死锁：

```console
thread 'main' panicked at 'rwlock read lock would result in deadlock', /rustc/efec545293b9263be9edfb283a7aa66350b3acbf/library/std/src/sys/unix/rwlock.rs:49:13
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace
```

好在我们可以使用`try_write`和`try_read`来尝试进行一次写/读，若失败则返回错误:

```console
Err("WouldBlock")
```

简单总结下`RwLock`:

1. 同时允许多个读，但最多只能有一个写
2. 读和写不能同时存在
3. 读可以使用`read`、`try_read`，写`write`、`try_write`, 在实际项目中，`try_xxx`会安全的多

## Mutex 还是 RwLock

首先简单性上`Mutex`完胜，因为使用`RwLock`你得操心几个问题：

- 读和写不能同时发生，如果使用`try_xxx`解决，就必须做大量的错误处理和失败重试机制
- 当读多写少时，写操作可能会因为一直无法获得锁导致连续多次失败([writer starvation](https://stackoverflow.com/questions/2190090/how-to-prevent-writer-starvation-in-a-read-write-lock-in-pthreads))
- RwLock 其实是操作系统提供的，实现原理要比`Mutex`复杂的多，因此单就锁的性能而言，比不上原生实现的`Mutex`

再来简单总结下两者的使用场景：

- 追求高并发读取时，使用`RwLock`，因为`Mutex`一次只允许一个线程去读取
- 如果要保证写操作的成功性，使用`Mutex`
- 不知道哪个合适，统一使用`Mutex`

需要注意的是，`RwLock`虽然看上去貌似提供了高并发读取的能力，但这个不能说明它的性能比`Mutex`高，事实上`Mutex`性能要好不少，后者**唯一的问题也仅仅在于不能并发读取**。

一个常见的、错误的使用`RwLock`的场景就是使用`HashMap`进行简单读写，因为`HashMap`的读和写都非常快，`RwLock`的复杂实现和相对低的性能反而会导致整体性能的降低，因此一般来说更适合使用`Mutex`。

总之，如果你要使用`RwLock`要确保满足以下两个条件：**并发读，且需要对读到的资源进行"长时间"的操作**，`HashMap`也许满足了并发读的需求，但是往往并不能满足后者："长时间"的操作。

> benchmark 永远是你在迷茫时最好的朋友！

## 三方库提供的锁实现

标准库在设计时总会存在取舍，因为往往性能并不是最好的，如果你追求性能，可以使用三方库提供的并发原语:

- [parking_lot](https://crates.io/crates/parking_lot), 功能更完善、稳定，社区较为活跃，star 较多，更新较为活跃
- [spin](https://crates.io/crates/spin), 在多数场景中性能比`parking_lot`高一点，最近没怎么更新

如果不是追求特别极致的性能，建议选择前者。

## 用条件变量(Condvar)控制线程的同步

`Mutex`用于解决资源安全访问的问题，但是我们还需要一个手段来解决资源访问顺序的问题。而 Rust 考虑到了这一点，为我们提供了条件变量(Condition Variables)，它经常和`Mutex`一起使用，可以让线程挂起，直到某个条件发生后再继续执行，其实`Condvar`我们在之前的多线程章节就已经见到过，现在再来看一个不同的例子：

```rust
use std::sync::{Arc,Mutex,Condvar};
use std::thread::{spawn,sleep};
use std::time::Duration;

fn main() {
    let flag = Arc::new(Mutex::new(false));
    let cond = Arc::new(Condvar::new());
    let cflag = flag.clone();
    let ccond = cond.clone();

    let hdl = spawn(move || {
        let mut m = { *cflag.lock().unwrap() };
        let mut counter = 0;

        while counter < 3 {
            while !m {
                m = *ccond.wait(cflag.lock().unwrap()).unwrap();
            }

            {
                m = false;
                *cflag.lock().unwrap() = false;
            }

            counter += 1;
            println!("inner counter: {}", counter);
        }
    });

    let mut counter = 0;
    loop {
        sleep(Duration::from_millis(1000));
        *flag.lock().unwrap() = true;
        counter += 1;
        if counter > 3 {
            break;
        }
        println!("outside counter: {}", counter);
        cond.notify_one();
    }
    hdl.join().unwrap();
    println!("{:?}", flag);
}
```

例子中通过主线程来触发子线程实现交替打印输出：

```console
outside counter: 1
inner counter: 1
outside counter: 2
inner counter: 2
outside counter: 3
inner counter: 3
Mutex { data: true, poisoned: false, .. }
```

例子2，`生产者消费者`模型

我们有一个生产者线程(铁匠)，他生产(打造)一件装备后，通知消费者线程(玩家)消费(购买)  
消费者线程(玩家)消费(购买)后，通知生产者线程(铁匠)继续生产(打造)，直到生产者线程退出

```rust
use std::{
    sync::{Arc, Condvar, Mutex},
    thread,
};

fn main() {
    // 条件变量，它可以让一个线程进入等待(锁)，直至被其他线程唤醒
    let cond = Arc::new(Condvar::new());
    let cond_clone = cond.clone();

    // 互斥锁和条件变量组合使用时，一般用于条件判断依据
    let mutex_lock = Arc::new(Mutex::new(false));
    let mutex_lock_clone = mutex_lock.clone();

    let mut total_count = 10;

    thread::spawn(move || loop {
        // 这里利用作用域获取了锁(MutexGuard<T>)的值后直接让它释放
        let mut lock = { *mutex_lock_clone.lock().unwrap() };

        // 如果 lock == false 表示铁匠(生产者)还没有打造出装备，因此进入等待，等待铁匠(生产者)打造装备
        while lock == false {
            // 这里进入等待前一定要释放 lock，否则你拿着锁进入等待，其他线程就无法获得锁了
            // 这就是为什么上面要用作用域释放 lock 的原因
            lock = *cond_clone.wait(mutex_lock_clone.lock().unwrap()).unwrap(); // 进入等待
        }

        // 如果 lock == true 表示铁匠(生产者)已经打造出了一件装备，因此我们就可以购买(消费)了
        println!("玩家(消费者)，购买了一件装备");

        // 这里用用作用域包起来的原因，也是为了释放 lock
        // 因为如果你拿着锁去唤醒铁匠(生产者)线程，它也肯定无法获得锁
        {
            // 消费完后，把 lock 的值改成 false
            *mutex_lock_clone.lock().unwrap() = false;
        }

        // 唤醒生产者线程(其实这里是唤醒一个等待中的线程，只不过此时只有一个线程在等待，就是我们的生产者线程)
        cond_clone.notify_one();
    });

    while total_count > 0 {
        // 这里利用作用域获取了锁(MutexGuard<T>)的值后直接让它释放
        let mut lock = { *mutex_lock.lock().unwrap() };

        // 如果 lock == true 表示已经打造了一件装备，因此暂停生产，等待玩家(消费者)购买(消费)
        while lock == true {
            // 这里进入等待前一定要释放 lock，否则你拿着锁进入等待，其他线程就无法获得锁了
            // 这就是为什么上面要用作用域释放 lock 的原因
            lock = *cond.wait(mutex_lock.lock().unwrap()).unwrap(); // 进入等待
        }

        // 否则如果 lock == false 表示还没有打造装备，因此需要打造一件装备
        total_count -= 1;
        println!(
            "铁匠(生产者)，打造了一件装备，剩余材料总数: {}",
            total_count
        );

        // 这里用用作用域包起来的原因，也是为了释放 lock
        // 因为如果你拿着锁去唤醒玩家(消费者)线程，它也肯定无法获得锁
        {
            // 打造完后，把 lock 的值改成 true
            *mutex_lock.lock().unwrap() = true;
        }

        // 唤醒消费者线程(其实这里是唤醒一个等待中的线程，只不过此时只有一个线程在等待，就是我们的消费者线程)
        cond.notify_one();
    }
}
```

运行这段代码

```console
铁匠(生产者)，打造了一件装备，剩余材料总数: 9
玩家(消费者)，购买了一件装备
铁匠(生产者)，打造了一件装备，剩余材料总数: 8
玩家(消费者)，购买了一件装备
铁匠(生产者)，打造了一件装备，剩余材料总数: 7
玩家(消费者)，购买了一件装备
铁匠(生产者)，打造了一件装备，剩余材料总数: 6
玩家(消费者)，购买了一件装备
铁匠(生产者)，打造了一件装备，剩余材料总数: 5
玩家(消费者)，购买了一件装备
铁匠(生产者)，打造了一件装备，剩余材料总数: 4
玩家(消费者)，购买了一件装备
铁匠(生产者)，打造了一件装备，剩余材料总数: 3
玩家(消费者)，购买了一件装备
铁匠(生产者)，打造了一件装备，剩余材料总数: 2
玩家(消费者)，购买了一件装备
铁匠(生产者)，打造了一件装备，剩余材料总数: 1
玩家(消费者)，购买了一件装备
铁匠(生产者)，打造了一件装备，剩余材料总数: 0
玩家(消费者)，购买了一件装备
```

## 信号量 Semaphore

在多线程中，另一个重要的概念就是信号量，使用它可以让我们精准的控制当前正在运行的任务最大数量。想象一下，当一个新游戏刚开服时(有些较火的老游戏也会，比如`wow`)，往往会控制游戏内玩家的同时在线数，一旦超过某个临界值，就开始进行排队进服。而在实际使用中，也有很多时候，我们需要通过信号量来控制最大并发数，防止服务器资源被撑爆。

本来 Rust 在标准库中有提供一个[信号量实现](https://doc.rust-lang.org/1.8.0/std/sync/struct.Semaphore.html), 但是由于各种原因这个库现在已经不再推荐使用了，因此我们推荐使用`tokio`中提供的`Semaphore`实现: [`tokio::sync::Semaphore`](https://github.com/tokio-rs/tokio/blob/master/tokio/src/sync/semaphore.rs)。

```rust
use std::sync::Arc;
use tokio::sync::Semaphore;

#[tokio::main]
async fn main() {
    let semaphore = Arc::new(Semaphore::new(3));
    let mut join_handles = Vec::new();

    for _ in 0..5 {
        let permit = semaphore.clone().acquire_owned().await.unwrap();
        join_handles.push(tokio::spawn(async move {
            //
            // 在这里执行任务...
            //
            drop(permit);
        }));
    }

    for handle in join_handles {
        handle.await.unwrap();
    }
}
```

上面代码创建了一个容量为 3 的信号量，当正在执行的任务超过 3 时，剩下的任务需要等待正在执行任务完成并减少信号量后到 3 以内时，才能继续执行。

这里的关键其实说白了就在于：信号量的申请和归还，使用前需要申请信号量，如果容量满了，就需要等待；使用后需要释放信号量，以便其它等待者可以继续。

## 总结

在很多时候，消息传递都是非常好用的手段，它可以让我们的数据在任务流水线上不断流转，实现起来非常优雅。

但是它并不能优雅的解决所有问题，因为我们面临的真实世界是非常复杂的，无法用某一种银弹统一解决。当面临消息传递不太适用的场景时，或者需要更好的性能和简洁性时，我们往往需要用锁来解决这些问题，因为锁允许多个线程同时访问同一个资源，简单粗暴。

除了锁之外，其实还有一种并发原语可以帮助我们解决并发访问数据的问题，那就是原子类型 Atomic，在下一章节中，我们会对其进行深入讲解。

