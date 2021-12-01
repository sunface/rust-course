# 代码风格

## 使用[tap](https://github.com/myrrlyn/tap)库来实现`point-free`编程风格
```rust
use tap::{Tap, TapFallible};

type SomeValue = String;
type SomeOtherValue = String;
type SomeError = String;

fn foo() -> Result<SomeValue, SomeError> {
    Ok("foo".into())
}

fn bar(input: &str) -> Result<SomeOtherValue, SomeError> {
    if input == "bar" {
        Ok("Success".into())
    } else {
        Err("This is a failure message".into())
    }
}

fn my_fun() -> Result<SomeOtherValue, SomeError> {
    foo()
        .tap_err(|err| println!("foo() failed with error: {}", err))
        .and_then(|foo_val| bar(&foo_val))
        .tap(|res| println!("bar() returned result: {:?}", res))
}

fn main() {
    let result = my_fun();
    println!("{:?}", result);
}
```