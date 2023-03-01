# 优雅关闭和资源清理






## 上一章节的遗留问题

在上一章节的末尾，我们提到将 `let` 替换为 `while let` 后，多线程的优势将荡然无存，原因藏的很隐蔽：

1. `Mutex` 结构体没有提供显式的 `unlock`，要依赖作用域结束后的 `drop` 来自动释放 
2. `let job = receiver.lock().unwrap().recv().unwrap();` 在这行代码中，由于使用了 `let`，右边的任何临时变量会在 `let` 语句结束后立即被 `drop`，因此锁会自动释放
3. 然而 `while let` (还包括 `if let` 和 `match`) 直到最后一个花括号后，才触发 `drop`

```rust
impl Worker {
    fn new(id: usize, receiver: Arc<Mutex<mpsc::Receiver<Job>>>) -> Worker {
        let thread = thread::spawn(move || {
            while let Ok(job) = receiver.lock().unwrap().recv() {
                println!("Worker {id} got a job; executing.");

                job();
            }
        });

        Worker { id, thread }
    }
}
```

根据之前的分析，上面的代码直到 `job()` 任务执行结束后，才会释放锁，去执行另一个请求，最终造成请求排队。