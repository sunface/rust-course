## Arc和Mutex结合实现多线程数据修改和汇总
```rust
use std::sync::{Arc,Mutex};
use std::thread;
use std::time::Duration;

struct JobStatus {
    jobs_completed: u32,
}

fn main() {
    let status = Arc::new(Mutex::new(JobStatus { jobs_completed: 0 }));
    let status_shared = Arc::clone(&status);
    thread::spawn(move || {
        for _ in 0..10 {
            thread::sleep(Duration::from_millis(250));
            let mut s = status_shared.lock().unwrap();
            s.jobs_completed += 1;
        }
    });

    while status.lock().unwrap().jobs_completed < 10 {
        println!("waiting... ");
        thread::sleep(Duration::from_millis(500));
    }
}
```

## 多个线程同时无锁的对一个数组进行修改
https://www.reddit.com/r/rust/comments/rtutr0/lockless_threads_for_mutable_operations/