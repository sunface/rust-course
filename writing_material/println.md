一些关于println的技巧

## 打印对象地址
```rust
    let v= vec![1,2,3];
    println!("{:p}",v.as_ptr())
```