# function-method.md

## 函数返回

SPECIAL RETURN TYPES IN RUST

If you are new to the language, some return types are difficult to interpret. These are also especially difficult to search for because they are made from symbols rather than words.

Known as the unit type, () formally is a zero-length tuple. It is used to express that a function returns no value. Functions that appear to have no return type return (), and expressions that are terminated with a semicolon (;) return (). For example, the report() function in the following code block returns the unit type implicitly:
```rust
use std::fmt::Debug;
 
fn report<T: Debug>(item: T) {
  println!("{:?}", item);
 
}
```

And this example returns the unit type explicitly:

```rust
fn clear(text: &mut String) -> () {
  *text = String::from("");
}
```

The unit type often occurs in error messages. It’s common to forget that the last expression of a function shouldn’t end with a semicolon.

The exclamation symbol, !, is known as the “Never” type. Never indicates that a function never returns, especially when it is guaranteed to crash. For example, take this code:

```rust
fn dead_end() -> ! {
  panic!("you have reached a dead end");
}
```

The following example creates an infinite loop that prevents the function from returning:

```rust
fn forever() -> ! {
  loop {
    //...
  };
}
```

As with the unit type, Never sometimes occurs within error messages. The Rust compiler complains about mismatched types when you forget to add a break in your loop block if you’ve indicated that the function returns a non-Never type.