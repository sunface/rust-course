# 日志


```rust
   if cfg!(debug_assertions) {
       eprintln!("debug: {:?} -> {:?}",
              record, fields);
     }
```