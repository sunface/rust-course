## unknown `into` behavior

```rust
 let s: Box<dyn Error + Send + Sync> = "connection reset by peer".into();
 ```

this works because:
```rust
impl From<&'_ str> for Box<dyn Error>
```