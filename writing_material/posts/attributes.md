## #[derive(Default)]
```rust
#[derive(Default)]
struct NotSend(Rc<()>);

fn require_send(_: impl Send) {}

async fn bar() {}
async fn foo() {
    //Returns the "default value" for a type.
    NotSend::default();
}
```