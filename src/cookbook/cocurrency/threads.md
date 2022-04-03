# 线程

### 生成一个临时性的线程

下面例子用到了 [crossbeam](cookbook/cocurrency/intro.md) 包，它提供了非常实用的、用于并发和并行编程的数据结构和函数。

[Scope::spawn](https://docs.rs/crossbeam/*/crossbeam/thread/struct.Scope.html#method.spawn) 会生成一个被限定了作用域的线程，该线程最大的特点就是：它会在传给 [crossbeam::scope](https://docs.rs/crossbeam/0.8.1/crossbeam/fn.scope.html) 的闭包函数返回前先行结束。得益于这个特点，子线程的创建使用就像是本地闭包函数调用，因此生成的线程内部可以使用外部环境中的变量！


```rust,editable
fn main() {
    let arr = &[1, 25, -4, 10];
    let max = find_max(arr);
    assert_eq!(max, Some(25));
}

// 将数组分成两个部分，并使用新的线程对它们进行处理
fn find_max(arr: &[i32]) -> Option<i32> {
    const THRESHOLD: usize = 2;
  
    if arr.len() <= THRESHOLD {
        return arr.iter().cloned().max();
    }

    let mid = arr.len() / 2;
    let (left, right) = arr.split_at(mid);
  
    crossbeam::scope(|s| {
        let thread_l = s.spawn(|_| find_max(left));
        let thread_r = s.spawn(|_| find_max(right));
  
        let max_l = thread_l.join().unwrap()?;
        let max_r = thread_r.join().unwrap()?;
  
        Some(max_l.max(max_r))
    }).unwrap()
}
```

### 创建并行流水线
下面我们使用 [crossbeam](https://docs.rs/crossbeam/latest/crossbeam/) 和 [crossbeam-channel](https://docs.rs/crossbeam-channel/*/crossbeam_channel/index.html) 来创建一个并行流水线：流水线的两端分别是数据源和数据下沉( sink )，在流水线中间，有两个工作线程会从源头接收数据，对数据进行并行处理，最后将数据下沉。

- 消息通道( channel )是 [crossbeam_channel::bounded](https://docs.rs/crossbeam-channel/0.5.4/crossbeam_channel/fn.bounded.html)，它只能缓存一条消息。当缓存满后，发送者继续调用 [crossbeam_channel::Sender::send] 发送消息时会阻塞，直到一个工作线程( 消费者 ) 拿走这条消息
- 消费者获取消息时先到先得的策略，因此两个工作线程只有一个能取到消息，保证消息不会被重复消费、处理
- 通过迭代器 [crossbeam_channel::Receiver::iter](https://docs.rs/crossbeam-channel/*/crossbeam_channel/struct.Receiver.html#method.iter) 读取消息会阻塞当前线程，直到新消息的到来或 channel 关闭
- channel 只有在所有的发送者或消费者关闭后，才能被关闭。而其中一个消费者 `rcv2` 处于阻塞读取状态，无比被关闭，因此我们必须要关闭所有发送者: `drop(snd1);`  `drop(snd2)` ，这样 channel 关闭后，主线程的 `rcv2` 才能从阻塞状态退出，最后整个程序结束。大家还是迷惑的话，可以看看这篇[文章](https://course.rs/practice/pitfalls/main-with-channel-blocked.html)。

```rust,editable
extern crate crossbeam;
extern crate crossbeam_channel;

use std::thread;
use std::time::Duration;
use crossbeam_channel::bounded;

fn main() {
    let (snd1, rcv1) = bounded(1);
    let (snd2, rcv2) = bounded(1);
    let n_msgs = 4;
    let n_workers = 2;

    crossbeam::scope(|s| {
        // 生产者线程
        s.spawn(|_| {
            for i in 0..n_msgs {
                snd1.send(i).unwrap();
                println!("Source sent {}", i);
            }
 
            // 关闭其中一个发送者 snd1
            // 该关闭操作对于结束最后的循环是必须的
            drop(snd1);
        });

        // 通过两个线程并行处理
        for _ in 0..n_workers {
            // 从数据源接收数据，然后发送到下沉端
            let (sendr, recvr) = (snd2.clone(), rcv1.clone());
            // 生成单独的工作线程
            s.spawn(move |_| {
            thread::sleep(Duration::from_millis(500));
                // 等待通道的关闭
                for msg in recvr.iter() {
                    println!("Worker {:?} received {}.",
                             thread::current().id(), msg);
                    sendr.send(msg * 2).unwrap();
                }
            });
        }
        // 关闭通道，如果不关闭，下沉端将永远无法结束循环
        drop(snd2);

        // 下沉端
        for msg in rcv2.iter() {
            println!("Sink received {}", msg);
        }
    }).unwrap();
}
```


### 线程间传递数据

下面我们来看看 [crossbeam-channel](https://docs.rs/crossbeam-channel/*/crossbeam_channel/index.html) 的单生产者单消费者( SPSC ) 使用场景。

```rust,editable
use std::{thread, time};
use crossbeam_channel::unbounded;

fn main() {
    // unbounded 意味着 channel 可以存储任意多的消息
    let (snd, rcv) = unbounded();
    let n_msgs = 5;
    crossbeam::scope(|s| {
        s.spawn(|_| {
            for i in 0..n_msgs {
                snd.send(i).unwrap();
                thread::sleep(time::Duration::from_millis(100));
            }
        });
    }).unwrap();
    for _ in 0..n_msgs {
        let msg = rcv.recv().unwrap();
        println!("Received {}", msg);
    }
}
```

### 维护全局可变的状态

[lazy_static]() 会创建一个全局的静态引用( static ref )，该引用使用了 `Mutex` 以支持可变性，因此我们可以在代码中对其进行修改。`Mutex` 能保证该全局状态同时只能被一个线程所访问。

```rust,editable
use error_chain::error_chain;
use lazy_static::lazy_static;
use std::sync::Mutex;

error_chain!{ }

lazy_static! {
    static ref FRUIT: Mutex<Vec<String>> = Mutex::new(Vec::new());
}

fn insert(fruit: &str) -> Result<()> {
    let mut db = FRUIT.lock().map_err(|_| "Failed to acquire MutexGuard")?;
    db.push(fruit.to_string());
    Ok(())
}

fn main() -> Result<()> {
    insert("apple")?;
    insert("orange")?;
    insert("peach")?;
    {
        let db = FRUIT.lock().map_err(|_| "Failed to acquire MutexGuard")?;

        db.iter().enumerate().for_each(|(i, item)| println!("{}: {}", i, item));
    }
    insert("grape")?;
    Ok(())
}
```

### 并行计算 iso 文件的 SHA256

下面的示例将为当前目录中的每一个 .iso 文件都计算一个 SHA256 sum。其中线程池中会初始化和 CPU 核心数一致的线程数，其中核心数是通过 [num_cpus::get](https://docs.rs/num_cpus/*/num_cpus/fn.get.html) 函数获取。

`Walkdir::new` 可以遍历当前的目录，然后调用 `execute` 来执行读操作和 SHA256 哈希计算。

```rust,editable

use walkdir::WalkDir;
use std::fs::File;
use std::io::{BufReader, Read, Error};
use std::path::Path;
use threadpool::ThreadPool;
use std::sync::mpsc::channel;
use ring::digest::{Context, Digest, SHA256};

// Verify the iso extension
fn is_iso(entry: &Path) -> bool {
    match entry.extension() {
        Some(e) if e.to_string_lossy().to_lowercase() == "iso" => true,
        _ => false,
    }
}

fn compute_digest<P: AsRef<Path>>(filepath: P) -> Result<(Digest, P), Error> {
    let mut buf_reader = BufReader::new(File::open(&filepath)?);
    let mut context = Context::new(&SHA256);
    let mut buffer = [0; 1024];

    loop {
        let count = buf_reader.read(&mut buffer)?;
        if count == 0 {
            break;
        }
        context.update(&buffer[..count]);
    }

    Ok((context.finish(), filepath))
}

fn main() -> Result<(), Error> {
    let pool = ThreadPool::new(num_cpus::get());

    let (tx, rx) = channel();

    for entry in WalkDir::new("/home/user/Downloads")
        .follow_links(true)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter(|e| !e.path().is_dir() && is_iso(e.path())) {
            let path = entry.path().to_owned();
            let tx = tx.clone();
            pool.execute(move || {
                let digest = compute_digest(path);
                tx.send(digest).expect("Could not send data!");
            });
        }

    drop(tx);
    for t in rx.iter() {
        let (sha, path) = t?;
        println!("{:?} {:?}", sha, path);
    }
    Ok(())
}
```


### 使用线程池来绘制分形

下面例子中将基于 [Julia Set]() 来绘制一个分形图片，其中使用到了线程池来做分布式计算。

<img src="https://cloud.githubusercontent.com/assets/221000/26546700/9be34e80-446b-11e7-81dc-dd9871614ea1.png" />

```rust,edtiable
# use error_chain::error_chain;
use std::sync::mpsc::{channel, RecvError};
use threadpool::ThreadPool;
use num::complex::Complex;
use image::{ImageBuffer, Pixel, Rgb};

#
# error_chain! {
#     foreign_links {
#         MpscRecv(RecvError);
#         Io(std::io::Error);
#     }
# }
#
# // Function converting intensity values to RGB
# // Based on http://www.efg2.com/Lab/ScienceAndEngineering/Spectra.htm
# fn wavelength_to_rgb(wavelength: u32) -> Rgb<u8> {
#     let wave = wavelength as f32;
#
#     let (r, g, b) = match wavelength {
#         380..=439 => ((440. - wave) / (440. - 380.), 0.0, 1.0),
#         440..=489 => (0.0, (wave - 440.) / (490. - 440.), 1.0),
#         490..=509 => (0.0, 1.0, (510. - wave) / (510. - 490.)),
#         510..=579 => ((wave - 510.) / (580. - 510.), 1.0, 0.0),
#         580..=644 => (1.0, (645. - wave) / (645. - 580.), 0.0),
#         645..=780 => (1.0, 0.0, 0.0),
#         _ => (0.0, 0.0, 0.0),
#     };
#
#     let factor = match wavelength {
#         380..=419 => 0.3 + 0.7 * (wave - 380.) / (420. - 380.),
#         701..=780 => 0.3 + 0.7 * (780. - wave) / (780. - 700.),
#         _ => 1.0,
#     };
#
#     let (r, g, b) = (normalize(r, factor), normalize(g, factor), normalize(b, factor));
#     Rgb::from_channels(r, g, b, 0)
# }
#
# // Maps Julia set distance estimation to intensity values
# fn julia(c: Complex<f32>, x: u32, y: u32, width: u32, height: u32, max_iter: u32) -> u32 {
#     let width = width as f32;
#     let height = height as f32;
#
#     let mut z = Complex {
#         // scale and translate the point to image coordinates
#         re: 3.0 * (x as f32 - 0.5 * width) / width,
#         im: 2.0 * (y as f32 - 0.5 * height) / height,
#     };
#
#     let mut i = 0;
#     for t in 0..max_iter {
#         if z.norm() >= 2.0 {
#             break;
#         }
#         z = z * z + c;
#         i = t;
#     }
#     i
# }
#
# // Normalizes color intensity values within RGB range
# fn normalize(color: f32, factor: f32) -> u8 {
#     ((color * factor).powf(0.8) * 255.) as u8
# }

fn main() -> Result<()> {
    let (width, height) = (1920, 1080);
    // 为指定宽高的输出图片分配内存
    let mut img = ImageBuffer::new(width, height);
    let iterations = 300;

    let c = Complex::new(-0.8, 0.156);

    let pool = ThreadPool::new(num_cpus::get());
    let (tx, rx) = channel();

    for y in 0..height {
        let tx = tx.clone();
        // execute 将每个像素作为单独的作业接收
        pool.execute(move || for x in 0..width {
                         let i = julia(c, x, y, width, height, iterations);
                         let pixel = wavelength_to_rgb(380 + i * 400 / iterations);
                         tx.send((x, y, pixel)).expect("Could not send data!");
                     });
    }

    for _ in 0..(width * height) {
        let (x, y, pixel) = rx.recv()?;
        // 使用数据来设置像素的颜色
        img.put_pixel(x, y, pixel);
    }
    
    // 输出图片内容到指定文件中
    let _ = img.save("output.png")?;
    Ok(())
}
```