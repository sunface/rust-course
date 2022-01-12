# 线程同步：并发原语和共享内存(下)



## 原子类型atomic
`Mutex`用起来简单，但是无法并发读，`RwLock`可以并发读，但是复杂且性能不够，那么有没有一种全能性选手呢？ 欢迎我们的`Atomic`闪亮登场。

从Rust1.34版本后，就正式支持原子类型。原子指的是一系列不可被CPU上下文交换的机器指令，这些指令组合在一起就形成了原子操作。在多核CPU下，都某个CPU核心开始运行原子操作时，会先暂停其它CPU内核对内存的操作，以保证原子操作不会被其它CPU内核所干扰。

由于原子操作是通过指令提供的支持，因此它的性能相比锁和消息传递会好很多。相比较于锁而言，原子类型不需要开发者处理加锁和释放锁的问题，同时支持修改，读取等操作，还具备较高的并发性能，几乎所有的语言都支持原子类型。

可以看出原子类型是无锁类型，但是无锁不代表无需等待，因为原子类型内部使用了`CAS`循环，当大量的冲突发生时，该等待还是得[等待](./thread.md#多线程的开销)！但是总归比锁要好。

#### 使用原子类型作为全局变量
原子类型的一个常用场景，就是作为全局变量来使用:
```rust
use std::thread::{self, JoinHandle};
use std::sync::atomic::{Ordering, AtomicU64};
 
const N_TIMES: u64 = 100000;
const N_THREADS: usize = 10;
 
static R: AtomicU64 = AtomicU64::new(0);
 
fn reset() {
    R.store(0, Ordering::Relaxed);
}
 
fn add_n_times(n: u64) -> JoinHandle<()> {
    thread::spawn(move || {
        for _ in 0..n {
            R.fetch_add(1, Ordering::Relaxed);
        }
    })
}
 
fn main() {
    loop {
        reset();
 
        let mut threads = Vec::with_capacity(N_THREADS);
 
        for _ in 0..N_THREADS {
            threads.push(add_n_times(N_TIMES));
        }
 
        for thread in threads {
            thread.join().unwrap();
        }
 
        assert_eq!(N_TIMES * N_THREADS as u64, R.load(Ordering::Relaxed));
    }
}
```

以上代码启动了数个线程，每个线程都在疯狂对全局变量进行加1操作, 最后将它与线程数 * 加1操作数进行比较，如果发生了因为多个线程同时修改导致了脏数据，那么这两个必将不相等。好在，它没有让我们失望，不仅快速的完成了任务，而且保证了100%的并发安全性。

在多线程环境中要使用`Atomic`需要配合`Arc`：
```rust
use std::sync::Arc;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::{hint, thread};

fn main() {
    let spinlock = Arc::new(AtomicUsize::new(1));

    let spinlock_clone = Arc::clone(&spinlock);
    let thread = thread::spawn(move|| {
        spinlock_clone.store(0, Ordering::SeqCst);
    });

    // 等待其它线程释放锁
    while spinlock.load(Ordering::SeqCst) != 0 {
        hint::spin_loop();
    }

    if let Err(panic) = thread.join() {
        println!("Thread had an error: {:?}", panic);
    }
}
```


#### 能替代锁吗
那么原子类型既然这么全能，它可以替代锁吗？答案是不行：

- `std::sync::atomic`包中仅提供了数值类型的原子操作：`AtomicBool`, `AtomicIsize`, `AtomicUsize`, `AtomicI8`, `AtomicU16`等，而锁可以应用于各种类型
- 在有些情况下，必须使用锁来配合，例如下面的`Condvar`

## 用条件(Condvar)控制线程的同步
条件变量(Condition Variables)经常和`Mutex`一起使用，可以让线程挂起，直到某个条件发生后再继续执行，其实`Condvar`我们在之前的多线程章节就已经见到过，现在再来看一个不同的例子：
```rust
use std::sync::{Arc, Mutex, Condvar};
use std::thread;

fn main() {

    let pair = Arc::new((Mutex::new(false), Condvar::new()));
    let pair2 = pair.clone();

    // 创建一个新线程
    thread::spawn(move|| {
        let &(ref lock, ref cvar) = &*pair2;
        let mut started = lock.lock().unwrap();
        *started = true;
        cvar.notify_one();
        println!("notify main thread");
    });

    // 等待新线程先运行
    let &(ref lock, ref cvar) = &*pair;
    let mut started = lock.lock().unwrap();
    while !*started {
        println!("before wait");
        started = cvar.wait(started).unwrap();
        println!("after wait");
    }
}
```

上述代码流程如下：

1. `main`线程首先进入`while`循环，并释放了锁`started`，然后开始挂起等待子线程的通知
2. 子线程获取到锁，并将其修改为true, 然后调用条件的方法来通知主线程继续执行：`cvar.notify_one`


