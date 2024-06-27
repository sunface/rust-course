# 常见属性标记

## 强制内存对齐

```rust,ignore,mdbook-runnable
#[repr(align(64))]
struct CachePadded(AtomicU64);
```

A data of alignment X is stored in memory at address multiple of X

https://doc.rust-lang.org/reference/attributes.html
