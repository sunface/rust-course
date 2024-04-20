# 元组

元组是由多种类型组合到一起形成的，因此它是复合类型，元组的长度是固定的，元组中元素的顺序也是固定的。

可以通过以下语法创建一个元组：

```rust
fn main() {
    let tup: (i32, f64, u8) = (500, 6.4, 1);
}
```

变量 `tup` 被绑定了一个元组值 `(500, 6.4, 1)`，该元组的类型是 `(i32, f64, u8)`，看到没？元组是用括号将多个类型组合到一起，简单吧？

可以使用模式匹配或者 `.` 操作符来获取元组中的值。

### 用模式匹配解构元组

```rust
fn main() {
    let tup = (500, 6.4, 1);

    let (x, y, z) = tup;

    println!("The value of y is: {}", y);
}
```

上述代码首先创建一个元组，然后将其绑定到 `tup` 上，接着使用 `let (x, y, z) = tup;` 来完成一次模式匹配，因为元组是 `(n1, n2, n3)` 形式的，因此我们用一模一样的 `(x, y, z)` 形式来进行匹配，元组中对应的值会绑定到变量 `x`， `y`， `z`上。这就是解构：用同样的形式把一个复杂对象中的值匹配出来。

### 用 `.` 来访问元组

模式匹配可以让我们一次性把元组中的值全部或者部分获取出来，如果只想要访问某个特定元素，那模式匹配就略显繁琐，对此，Rust 提供了 `.` 的访问方式：

```rust
fn main() {
    let x: (i32, f64, u8) = (500, 6.4, 1);

    let five_hundred = x.0;

    let six_point_four = x.1;

    let one = x.2;
}
```

和其它语言的数组、字符串一样，元组的索引从 0 开始。

### 元组的使用示例

元组在函数返回值场景很常用，例如下面的代码，可以使用元组返回多个值：

```rust
fn main() {
    let s1 = String::from("hello");

    let (s2, len) = calculate_length(s1);

    println!("The length of '{}' is {}.", s2, len);
}

fn calculate_length(s: String) -> (String, usize) {
    let length = s.len(); // len() 返回字符串的长度

    (s, length)
}
```

`calculate_length` 函数接收 `s1` 字符串的所有权，然后计算字符串的长度，接着把字符串所有权和字符串长度再返回给 `s2` 和 `len` 变量。

在其他语言中，可以用结构体来声明一个三维空间中的点，例如 `Point(10, 20, 30)`，虽然使用 Rust 元组也可以做到：`(10, 20, 30)`，但是这样写有个非常重大的缺陷：

**不具备任何清晰的含义**，在下一章节中，会提到一种与元组类似的结构体，`元组结构体`，可以解决这个问题。



## 课后练习

> [Rust By Practice](https://practice-zh.course.rs/compound-types/tuple.html)，支持代码在线编辑和运行，并提供详细的[习题解答](https://github.com/sunface/rust-by-practice/blob/master/solutions/compound-types/tuple.md)。