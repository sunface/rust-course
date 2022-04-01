# ANSI 终端

[ansi_term](https://crates.io/crates/ansi_term) 包可以帮我们控制终端上的输出样式，例如使用颜色文字、控制输出格式等，当然，前提是在 ANSI 终端上。

`ansi_term` 中有两个主要数据结构：[ANSIString](https://docs.rs/ansi_term/0.12.1/ansi_term/type.ANSIString.html) 和 [Style](https://docs.rs/ansi_term/0.12.1/ansi_term/struct.Style.html)。

`Style` 用于控制样式：颜色、加粗、闪烁等，而前者是一个带有样式的字符串。

## 颜色字体

```rust,editable
use ansi_term::Colour;

fn main() {
    println!("This is {} in color, {} in color and {} in color",
             Colour::Red.paint("red"),
             Colour::Blue.paint("blue"),
             Colour::Green.paint("green"));
}
```

## 加粗字体

比颜色复杂的样式构建需要使用 `Style` 结构体:
```rust,editable
use ansi_term::Style;

fn main() {
    println!("{} and this is not",
             Style::new().bold().paint("This is Bold"));
}
```

## 加粗和颜色

`Colour` 实现了很多跟 `Style` 类似的函数，因此可以实现链式调用。

```rust,editable
use ansi_term::Colour;
use ansi_term::Style;

fn main(){
    println!("{}, {} and {}",
             Colour::Yellow.paint("This is colored"),
             Style::new().bold().paint("this is bold"),
             // Colour 也可以使用 bold 方法进行加粗
             Colour::Yellow.bold().paint("this is bold and colored"));
}
```

