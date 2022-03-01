# 附录 C：表达式

在[语句与表达式](https://course.rs/basic/base-type/statement-expression.html)章节中，我们对表达式有过介绍，下面对这些常用表达式进行一一说明。

### 基本表达式
```rust
let n = 3;
let s = "test";
```

### if 表达式
```rust
fn main() {
    let var1 = 10;

    let var2 = if var1 >= 10 {
        var1
    } else {
        var1 + 10
    };
    
    println!("{}", var2);
}
```

通过 `if` 表达式将值赋予 `var2`。

你还可以在循环中结合 `continue` 、`break` 来使用：
```rust
let mut v = 0;
for i in 1..10 {
    v = if i == 9 { 
        continue 
    } else { 
        i 
    }
}
println!("{}", v);
```

### if let 表达式
```rust
let o = Some(3);
let v = if let Some(x) = o {
    x
} else {
    0
};
```

### match 表达式
```rust
let o = Some(3);
let v = match o {
    Some(x) => x,
    _ => 0
};
```

### loop 表达式
```rust
let mut n = 0;
let v = loop {
    if n == 10 {
        break n
    }
    n += 1;
};
```

### 语句块 {}
```rust
let mut n = 0;
let v = {
    println!("before: {}", n);
    n += 1;
    println!("after: {}", n);
    n
};
println!("{}", v);
```
