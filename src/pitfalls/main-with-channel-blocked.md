# 线程间传递消息导致主线程无法结束
本篇陷阱较短，主要解决新手在多线程间传递消息时可能会遇到的一个问题：主线程会一直阻塞，无法结束。

Rust 标准库中提供了一个消息通道，非常好用，也相当简单明了，但是但是在使用起来还是可能存在坑：
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
    
    for x in recv {
        println!("Got: {}", x);
    }
    println!("finished iterating");
}
```

以上代码看起来非常正常，运行下试试:
```console
thread 0 finished
thread 1 finished
Got: 0
Got: 1
thread 2 finished
Got: 2
```

奇怪，主线程竟然卡死了，最后一行` println!("finished iterating");`一直没有被输出。

其实，上面的描述有问题，主线程并不是卡死，而是`for`循环并没有结束，至于`for`循环不结束的原因是消息通道没有被关闭。

回忆一下 Rust 消息通道关闭的两个条件：所有发送者全部被`drop`或接收者被`drop`，由于`for`循环还在使用接收者，因为后者条件无法被满足，那么只能发送者全部被`drop`，才能让例子中的消息通道关闭。

来分析下代码，每一个子线程都从`send`获取了一个拷贝，然后该拷贝在子线程结束时自动被`drop`，看上去没问题啊。等等，好像`send`本身并没有被`drop`，因为`send`要等到`main`函数结束才会被`drop`，那么代码就陷入了一个尴尬的境地：`main`函数要结束需要`for`循环结束，`for`循环结束需要`send`被`drop`，而`send`要被`drop`需要`main`函数结束。。。

破局点只有一个，那就是主动`drop`掉`send`，这个简单，使用`std::mem::drop`函数即可，得益于`prelude`，我们只需要使用`drop`:
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
    
    drop(send);
    for x in recv { 
        println!("Got: {}", x);
    }
    println!("finished iterating");
}
```

此时再运行，主线程将顺利结束。

## 总结
本文总结了一个新手在使用消息通道时常见的错误，那就是忘记处理创建通道时得到的发送者，最后由于该发送者的存活导致通道无法被关闭，最终主线程阻塞，造成程序错误。
