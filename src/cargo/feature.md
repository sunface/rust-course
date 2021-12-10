# 条件编译、条件依赖


## 通过featre来实现不同的derive
比如有一个类型，我们希望在不同包引用它的时候，派生引用不同的特征，可以这么做：

在`Cargo.toml`中定义新的`feature`:
```toml
[features]
sqlx = []
```

在类型定义处：
```rust
#[cfg_attr(feature = "sqlx", derive(sqlx::Type)]
#[derive(Debug, PartialEq, Deserialize, Serialize, strum_macros::EnumString)]
pub enum Role {Owner,Admin,User,}
```

在希望派生`sqlx`的包：
```toml
your_shared_crate = { version = "0.0.1", features = ["sqlx"] }
```