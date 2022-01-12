# 全局变量

在一些场景，我们可能需要全局变量来简化状态共享的代码，包括全局ID，全局数据存储等等，下面我们来一一给出对应的实现方法。

## 全局唯一ID

```rust
use std::sync::atomic::{Ordering, AtomicUsize};

struct Factory{
    factory_id: usize,
}

static GLOBAL_ID_COUNTER: AtomicUsize = AtomicUsize::new(0);
// This gives large room for ids to overflow
// This code assumes that your app never would need many factories
const MAX_ID: usize = usize::MAX / 2;

fn generate_id()->usize{
    // Check overflow twice to avoid growing of GLOBAL_ID_COUNTER after overflow.
    let current_val = GLOBAL_ID_COUNTER.load(Ordering::Relaxed);
    if current_val > MAX_ID{
        panic!("Factory ids overflowed");
    }
    let next_id = GLOBAL_ID_COUNTER.fetch_add(1, Ordering::Relaxed);
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

## 从函数中返回全局变量
https://www.reddit.com/r/learnrust/comments/rqn74g/cant_a_function_return_a_reference_to_some_global/


## lazy_static
```rust
use std::{sync::{Mutex, MutexGuard}, thread};
use std::thread::sleep;
use std::time::Duration;

use lazy_static::lazy_static;
lazy_static! {
    static ref MUTEX1: Mutex<i64> = Mutex::new(0);
    static ref MUTEX2: Mutex<i64> = Mutex::new(0);
}

fn main() {
    // Spawn thread and store handles
    let mut children = vec![];
    for i_thread in 0..2 {
        children.push(thread::spawn(move || {
            for _ in 0..1 {
                // Thread 1
                if i_thread % 2 == 0 {
                    // Lock mutex1
                    // No need to specify type but yes create a dummy variable to prevent rust
                    // compiler from being lazy
                    let _guard: MutexGuard<i64> = MUTEX1.lock().unwrap();

                    // Just log
                    println!("Thread {} locked mutex1 and will try to lock the mutex2, after a nap !", i_thread);

                    // Here I sleep to let Thread 2 lock mutex2
                    sleep(Duration::from_millis(10));

                    // Lock mutex 2
                    let _guard = MUTEX2.lock().unwrap();
                // Thread 2
                } else {
                    // Lock mutex 1
                    let _guard = MUTEX2.lock().unwrap();

                    println!("Thread {} locked mutex2 and will try to lock the mutex1", i_thread);

                    // Here I freeze !
                    let _guard = MUTEX1.lock().unwrap();
                }
            }
        }));
    }

    // Wait
    for child in children {
        let _ = child.join();
    }

    println!("This is not printed");
}
```

## box::leak