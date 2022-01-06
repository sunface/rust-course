#  autoref specialization
https://www.reddit.com/r/rust/comments/rnn32g/rust_already_has_specialization/

## 例子一
```rust
use std::fmt::Debug;
use std::fmt::Display;
struct Wrap<T>(T);

trait ViaString {
    fn foo(&self);
}
impl ViaString for &&Wrap<String> {
    fn foo(&self) {
        println!("String: {}", self.0);
    }
}

trait ViaDisplay {
    fn foo(&self);
}
impl<T: Display> ViaDisplay for &Wrap<T> {
    fn foo(&self) {
        println!("Display: {}", self.0);
    }
}

trait ViaDebug {
    fn foo(&self);
}
impl<T: Debug> ViaDebug for Wrap<T> {
    fn foo(&self) {
        println!("Debug: {:?}", self.0);
    }
}

fn main() {
    (&&&Wrap(String::from("hi"))).foo();
    (&&&Wrap(3)).foo();
    (&&&Wrap(['a', 'b'])).foo();
}
```

输出:
```console
String: hi
Display: 3
Debug: ['a', 'b']
```



## 例子二
```rust
use std::fmt::*;

trait Specialized {
    fn call(&self);
}

impl<T> Specialized for &T {
    fn call(&self) {
        println!("nothing to print");
    }
}

impl<T: Debug> Specialized for &mut &T {
    fn call(&self) {
        println!("debug print: {:?}", self);    
    }
}

impl<T: Display> Specialized for &mut &mut &T {
    fn call(&self) {
        println!("display print: {}", self);    
    }
}

struct DisplayStruct;
impl Display for DisplayStruct {
    fn fmt(&self, f: &mut Formatter<'_>) -> Result {
        write!(f, "DisplayStruct")
    }
}

struct DebugStruct;
impl Debug for DebugStruct {
    fn fmt(&self, f: &mut Formatter<'_>) -> Result {
        write!(f, "DebugStruct")
    }
}

struct NothingStruct;

fn main() {
    (&mut &mut &NothingStruct).call();
    (&mut &mut &DebugStruct).call();
    (&mut &mut &DisplayStruct).call();
}
```

输出：
```console
nothing to print
debug print: DebugStruct
display print: DisplayStruct
```