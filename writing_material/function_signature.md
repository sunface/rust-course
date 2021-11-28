## 函数的入参是一个async function
因为我们使用了trait bound，所以不能用`Fn() -> impl Future<Output=Result<Return, sql::Error>>`的方式.

```rust
use core::future::Future;

pub async fn on_tran<F, Fut>(f: F) -> usize 
    where F: Fn() -> Fut, Fut: Future<Output=usize> {
    f().await
}


#[tokio::main]
async fn main() {
    let foo = || {
        async {
            8 as usize
        }
    };
    
    println!("{}", on_tran(foo).await);
}
```
