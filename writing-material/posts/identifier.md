## Raw identifiers
Rust因为版本更迭原因，可能会新增一些`关键字`,这些新增关键字可能会导致旧的函数名调用不再通过编译，例如在Rust Edition 2015中，引入了新的关键字`try`.

运行以下代码:
```rust
extern crate foo;

fn main() {
    foo::try();
}
```

将获得下面的错误
```rust
error: expected identifier, found keyword `try`
 --> src/main.rs:4:4
  |
4 | foo::try();
  |      ^^^ expected identifier, found keyword
```

可以用Raw identifier来解决:
```rust
extern crate foo;

fn main() {
    foo::r#try();
}
```