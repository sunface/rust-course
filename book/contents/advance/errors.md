# 错误处理
在之前的[返回值和错误章节](https://course.rs/basic/result-error/intro.html)中，我们学习了几个重要的概念，例如 `Result` 用于返回结果处理，`?` 用于错误的传播，若大家对此还较为模糊，强烈建议回头温习下。

在本章节中一起来看看如何对 `Result` ( `Option` ) 做进一步的处理，以及如何定义自己的错误类型。

## 组合器
在设计模式中，有一个组合器模式，相信有 Java 背景的同学对此并不陌生。

> 将对象组合成树形结构以表示“部分整体”的层次结构。组合模式使得用户对单个对象和组合对象的使用具有一致性。–GoF <<设计模式>>

与组合起模式有所不同，在 Rust 中，组合器更多的是用于对返回结果的类型进行变换：例如使用 `ok_or` 将一个 `Option` 类型转换成 `Result` 类型。

下面我们来看看一些常见的组合器。

#### or() 和 and()
跟布尔关系的与/或很像，这两个方法会对两个表达式做逻辑组合，最终返回 `Option` / `Result`。

- `or()`，表达式按照顺序求值，若任何一个表达式的结果是 `Some` 或 `Ok`，则该值会立刻返回
- `and()`，若两个表达式的结果都是 `Some` 或 `Ok`，则**第二个表达式中的值被返回**。若任何一个的结果是 `None` 或 `Err` ，则立刻返回。

实际上，只要将布尔表达式的 `true` / `false`，替换成 `Some` / `None` 或 `Ok` / `Err` 就很好理解了。

```rust
fn main() {
  let s1 = Some("some1");
  let s2 = Some("some2");
  let n: Option<&str> = None;

  let o1: Result<&str, &str> = Ok("ok1");
  let o2: Result<&str, &str> = Ok("ok2");
  let e1: Result<&str, &str> = Err("error1");
  let e2: Result<&str, &str> = Err("error2");

  assert_eq!(s1.or(s2), s1); // Some1 or Some2 = Some1
  assert_eq!(s1.or(n), s1);  // Some or None = Some
  assert_eq!(n.or(s1), s1);  // None or Some = Some
  assert_eq!(n.or(n), n);    // None1 or None2 = None2

  assert_eq!(o1.or(o2), o1); // Ok1 or Ok2 = Ok1
  assert_eq!(o1.or(e1), o1); // Ok or Err = Ok
  assert_eq!(e1.or(o1), o1); // Err or Ok = Ok
  assert_eq!(e1.or(e2), e2); // Err1 or Err2 = Err2

  assert_eq!(s1.and(s2), s2); // Some1 and Some2 = Some2
  assert_eq!(s1.and(n), n);   // Some and None = None
  assert_eq!(n.and(s1), n);   // None and Some = None
  assert_eq!(n.and(n), n);    // None1 and None2 = None1

  assert_eq!(o1.and(o2), o2); // Ok1 and Ok2 = Ok2
  assert_eq!(o1.and(e1), e1); // Ok and Err = Err
  assert_eq!(e1.and(o1), e1); // Err and Ok = Err
  assert_eq!(e1.and(e2), e1); // Err1 and Err2 = Err1
}
```

除了 `or` 和 `and` 之外，Rust 还为我们提供了 `xor` ，但是它只能应用在 `Option` 上，其实想想也是这个理，如果能应用在 `Result` 上，那你又该如何对一个值和错误进行异或操作？

#### or_else() 和 and_then()
它们跟 `or()` 和 `and()` 类似，唯一的区别在于，它们的第二个表达式是一个闭包。

```rust
fn main() {
    // or_else with Option
    let s1 = Some("some1");
    let s2 = Some("some2");
    let fn_some = || Some("some2"); // 类似于: let fn_some = || -> Option<&str> { Some("some2") };

    let n: Option<&str> = None;
    let fn_none = || None;

    assert_eq!(s1.or_else(fn_some), s1);  // Some1 or_else Some2 = Some1
    assert_eq!(s1.or_else(fn_none), s1);  // Some or_else None = Some
    assert_eq!(n.or_else(fn_some), s2);   // None or_else Some = Some
    assert_eq!(n.or_else(fn_none), None); // None1 or_else None2 = None2

    // or_else with Result
    let o1: Result<&str, &str> = Ok("ok1");
    let o2: Result<&str, &str> = Ok("ok2");
    let fn_ok = |_| Ok("ok2"); // 类似于: let fn_ok = |_| -> Result<&str, &str> { Ok("ok2") };

    let e1: Result<&str, &str> = Err("error1");
    let e2: Result<&str, &str> = Err("error2");
    let fn_err = |_| Err("error2");

    assert_eq!(o1.or_else(fn_ok), o1);  // Ok1 or_else Ok2 = Ok1
    assert_eq!(o1.or_else(fn_err), o1); // Ok or_else Err = Ok
    assert_eq!(e1.or_else(fn_ok), o2);  // Err or_else Ok = Ok
    assert_eq!(e1.or_else(fn_err), e2); // Err1 or_else Err2 = Err2
}
```

```rust
fn main() {
    // and_then with Option
    let s1 = Some("some1");
    let s2 = Some("some2");
    let fn_some = |_| Some("some2"); // 类似于: let fn_some = |_| -> Option<&str> { Some("some2") };

    let n: Option<&str> = None;
    let fn_none = |_| None;

    assert_eq!(s1.and_then(fn_some), s2); // Some1 and_then Some2 = Some2
    assert_eq!(s1.and_then(fn_none), n);  // Some and_then None = None
    assert_eq!(n.and_then(fn_some), n);   // None and_then Some = None
    assert_eq!(n.and_then(fn_none), n);   // None1 and_then None2 = None1

    // and_then with Result
    let o1: Result<&str, &str> = Ok("ok1");
    let o2: Result<&str, &str> = Ok("ok2");
    let fn_ok = |_| Ok("ok2"); // 类似于: let fn_ok = |_| -> Result<&str, &str> { Ok("ok2") };

    let e1: Result<&str, &str> = Err("error1");
    let e2: Result<&str, &str> = Err("error2");
    let fn_err = |_| Err("error2");

    assert_eq!(o1.and_then(fn_ok), o2);  // Ok1 and_then Ok2 = Ok2
    assert_eq!(o1.and_then(fn_err), e2); // Ok and_then Err = Err
    assert_eq!(e1.and_then(fn_ok), e1);  // Err and_then Ok = Err
    assert_eq!(e1.and_then(fn_err), e1); // Err1 and_then Err2 = Err1
}
```

#### filter
`filter` 用于对 `Option` 进行过滤：
```rust
fn main() {
    let s1 = Some(3);
    let s2 = Some(6);
    let n = None;

    let fn_is_even = |x: &i8| x % 2 == 0;

    assert_eq!(s1.filter(fn_is_even), n);  // Some(3) -> 3 is not even -> None
    assert_eq!(s2.filter(fn_is_even), s2); // Some(6) -> 6 is even -> Some(6)
    assert_eq!(n.filter(fn_is_even), n);   // None -> no value -> None
}
```

#### map() 和 map_err()
`map` 可以将 `Some` 或 `Ok` 中的值映射为另一个：
```rust
fn main() {
    let s1 = Some("abcde");
    let s2 = Some(5);

    let n1: Option<&str> = None;
    let n2: Option<usize> = None;

    let o1: Result<&str, &str> = Ok("abcde");
    let o2: Result<usize, &str> = Ok(5);

    let e1: Result<&str, &str> = Err("abcde");
    let e2: Result<usize, &str> = Err("abcde");

    let fn_character_count = |s: &str| s.chars().count();

    assert_eq!(s1.map(fn_character_count), s2); // Some1 map = Some2
    assert_eq!(n1.map(fn_character_count), n2); // None1 map = None2

    assert_eq!(o1.map(fn_character_count), o2); // Ok1 map = Ok2
    assert_eq!(e1.map(fn_character_count), e2); // Err1 map = Err2
}
```

但是如果你想要将 `Err` 中的值进行改变， `map` 就无能为力了，此时我们需要用 `map_err`：
```rust
fn main() {
    let o1: Result<&str, &str> = Ok("abcde");
    let o2: Result<&str, isize> = Ok("abcde");

    let e1: Result<&str, &str> = Err("404");
    let e2: Result<&str, isize> = Err(404);

    let fn_character_count = |s: &str| -> isize { s.parse().unwrap() }; // 该函数返回一个 isize

    assert_eq!(o1.map_err(fn_character_count), o2); // Ok1 map = Ok2
    assert_eq!(e1.map_err(fn_character_count), e2); // Err1 map = Err2
}
```

通过对 `o1` 的操作可以看出，与 `map` 面对 `Err` 时的短小类似， `map_err` 面对 `Ok` 时也是相当无力的。

#### map_or() 和 map_or_else()
`map_or` 在 `map` 的基础上提供了一个默认值:
```rust
fn main() {
    const V_DEFAULT: u32 = 1;

    let s: Result<u32, ()> = Ok(10);
    let n: Option<u32> = None;
    let fn_closure = |v: u32| v + 2;

    assert_eq!(s.map_or(V_DEFAULT, fn_closure), 12);
    assert_eq!(n.map_or(V_DEFAULT, fn_closure), V_DEFAULT);
}
```

如上所示，当处理 `None` 的时候，`V_DEFAULT` 作为默认值被直接返回。

`map_or_else` 与 `map_or` 类似，但是它是通过一个闭包来提供默认值:
```rust
fn main() {
    let s = Some(10);
    let n: Option<i8> = None;

    let fn_closure = |v: i8| v + 2;
    let fn_default = || 1; 

    assert_eq!(s.map_or_else(fn_default, fn_closure), 12);
    assert_eq!(n.map_or_else(fn_default, fn_closure), 1);

    let o = Ok(10);
    let e = Err(5);
    let fn_default_for_result = |v: i8| v + 1; // 闭包可以对 Err 中的值进行处理，并返回一个新值

    assert_eq!(o.map_or_else(fn_default_for_result, fn_closure), 12);
    assert_eq!(e.map_or_else(fn_default_for_result, fn_closure), 6);
}
```

#### ok_or() and ok_or_else()
这两兄弟可以将 `Option` 类型转换为 `Result` 类型。其中 `ok_or` 接收一个默认的 `Err` 参数:
```rust
fn main() {
    const ERR_DEFAULT: &str = "error message";

    let s = Some("abcde");
    let n: Option<&str> = None;

    let o: Result<&str, &str> = Ok("abcde");
    let e: Result<&str, &str> = Err(ERR_DEFAULT);

    assert_eq!(s.ok_or(ERR_DEFAULT), o); // Some(T) -> Ok(T)
    assert_eq!(n.ok_or(ERR_DEFAULT), e); // None -> Err(default)
}
```

而 `ok_or_else` 接收一个闭包作为 `Err` 参数:
```rust
fn main() {
    let s = Some("abcde");
    let n: Option<&str> = None;
    let fn_err_message = || "error message";

    let o: Result<&str, &str> = Ok("abcde");
    let e: Result<&str, &str> = Err("error message");

    assert_eq!(s.ok_or_else(fn_err_message), o); // Some(T) -> Ok(T)
    assert_eq!(n.ok_or_else(fn_err_message), e); // None -> Err(default)
}
```

以上列出的只是常用的一部分，强烈建议大家看看标准库中有哪些可用的 API，在实际项目中，这些 API 将会非常有用: [Option](https://doc.rust-lang.org/stable/std/option/enum.Option.html) 和 [Result](https://doc.rust-lang.org/stable/std/result/enum.Result.html)。

## 自定义错误类型
虽然标准库定义了大量的错误类型，但是一个严谨的项目，光使用这些错误类型往往是不够的，例如我们可能会为暴露给用户的错误定义相应的类型。

为了帮助我们更好的定义错误，Rust 在标准库中提供了一些可复用的特征，例如 `std::error::Erro` 特征：
```rust
use std::fmt::{Debug, Display};

pub trait Error: Debug + Display {
    fn source(&self) -> Option<&(Error + 'static)> { ... }
}
```

当自定义类型实现该特征后，该类型就可以作为 `Err` 来使用，下面一起来看看。

> 实际上，自定义错误类型只需要实现 `Debug` 和 `Display` 特征即可，`source` 方法是可选的，而 `Debug` 特征往往也无需手动实现，可以直接通过 `derive` 来派生

#### 最简单的错误
```rust
use std::fmt;

// AppError 是自定义错误类型，它可以是当前包中定义的任何类型，在这里为了简化，我们使用了单元结构体作为例子。
// 为 AppError 自动派生 Debug 特征
#[derive(Debug)]
struct AppError;

// 为 AppError 实现 std::fmt::Display 特征
impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "An Error Occurred, Please Try Again!") // user-facing output
    }
}

// 一个示例函数用于产生 AppError 错误
fn produce_error() -> Result<(), AppError> {
    Err(AppError)
}

fn main(){
    match produce_error() {
        Err(e) => eprintln!("{}", e), 
        _ => println!("No error"),
    }

    eprintln!("{:?}", produce_error()); // Err({ file: src/main.rs, line: 17 })
}
```

上面的例子很简单，我们定义了一个错误类型，当为它派生了 `Debug` 特征，同时手动实现了 `Display` 特征后，该错误类型就可以作为 `Err`来使用了。

事实上，实现 `Debug` 和 `Display` 特征并不是作为 `Err` 使用的必要条件，大家可以把这两个特征实现和相应使用去除，然后看看代码会否报错。既然如此，我们为何要为自定义类型实现这两个特征呢？原因有二:

- 错误得打印输出后，才能有实际用处，而打印输出就需要实现这两个特征
- 可以将自定义错误转换成 `Box<dyn std::error:Error>` 特征对象，在后面的**归一化不同错误类型**部分，我们会详细介绍

#### 更详尽的错误
上一个例子中定义的错误非常简单，我们无法从错误中得到更多的信息，现在再来定义一个具有错误码和信息的错误:
```rust
use std::fmt;

struct AppError {
    code: usize,
    message: String,
}

// 根据错误码显示不同的错误信息
impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        let err_msg = match self.code {
            404 => "Sorry, Can not find the Page!",
            _ => "Sorry, something is wrong! Please Try Again!",
        };

        write!(f, "{}", err_msg)
    }
}

impl fmt::Debug for AppError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(
            f,
            "AppError {{ code: {}, message: {} }}",
            self.code, self.message
        )
    }
}

fn produce_error() -> Result<(), AppError> {
    Err(AppError {
        code: 404,
        message: String::from("Page not found"),
    })
}

fn main() {
    match produce_error() {
        Err(e) => eprintln!("{}", e), // 抱歉，未找到指定的页面!
        _ => println!("No error"),
    }

    eprintln!("{:?}", produce_error()); // Err(AppError { code: 404, message: Page not found })

    eprintln!("{:#?}", produce_error());
    // Err(
    //     AppError { code: 404, message: Page not found }
    // )
}
```

在本例中，我们除了增加了错误码和消息外，还手动实现了 `Debug` 特征，原因在于，我们希望能自定义 `Debug` 的输出内容，而不是使用派生后系统提供的默认输出形式。

#### 错误转换 `From` 特征
标准库、三方库、本地库，各有各的精彩，各也有各的错误。那么问题就来了，我们该如何将其它的错误类型转换成自定义的错误类型？总不能神鬼牛魔，同台共舞吧。。

好在 Rust 为我们提供了 `std::convert::From` 特征:
```rust
pub trait From<T>: Sized {
  fn from(_: T) -> Self;
}
```

> 事实上，该特征在之前的 [`?` 操作符](https://course.rs/basic/result-error/result.html#传播界的大明星-)章节中就有所介绍。
> 
> 大家都使用过 `String::from` 函数吧？它可以通过 `&str` 来创建一个 `String`，其实该函数就是 `From` 特征提供的

下面一起来看看如何为自定义类型实现 `From` 特征:
```rust
use std::fs::File;
use std::io;

#[derive(Debug)]
struct AppError {
    kind: String,    // 错误类型
    message: String, // 错误信息
}

// 为 AppError 实现 std::convert::From 特征，由于 From 包含在 std::prelude 中，因此可以直接简化引入。
// 实现 From<io::Error> 意味着我们可以将 io::Error 错误转换成自定义的 AppError 错误
impl From<io::Error> for AppError {
    fn from(error: io::Error) -> Self {
        AppError {
            kind: String::from("io"),
            message: error.to_string(),
        }
    }
}

fn main() -> Result<(), AppError> {
    let _file = File::open("nonexistent_file.txt")?; 

    Ok(())
}

// --------------- 上述代码运行后输出 ---------------
Error: AppError { kind: "io", message: "No such file or directory (os error 2)" }
```

上面的代码中除了实现 `From` 外，还有一点特别重要，那就是 `?` 可以将错误进行隐式的强制转换：`File::open` 返回的是 `std::io::Error`， 我们并没有进行任何显式的转换，它就能自动变成 `AppError` ，这就是 `?` 的强大之处！

上面的例子只有一个标准库错误，再来看看多个不同的错误转换成 `AppError` 的实现：
```rust
use std::fs::File;
use std::io::{self, Read};
use std::num;

#[derive(Debug)]
struct AppError {
    kind: String,
    message: String,
}

impl From<io::Error> for AppError {
    fn from(error: io::Error) -> Self {
        AppError {
            kind: String::from("io"),
            message: error.to_string(),
        }
    }
}

impl From<num::ParseIntError> for AppError {
    fn from(error: num::ParseIntError) -> Self {
        AppError {
            kind: String::from("parse"),
            message: error.to_string(),
        }
    }
}

fn main() -> Result<(), AppError> {
    let mut file = File::open("hello_world.txt")?;

    let mut content = String::new();
    file.read_to_string(&mut content)?; 

    let _number: usize;
    _number = content.parse()?; 

    Ok(())
}


// --------------- 上述代码运行后的可能输出 ---------------

// 01. 若 hello_world.txt 文件不存在
Error: AppError { kind: "io", message: "No such file or directory (os error 2)" }

// 02. 若用户没有相关的权限访问 hello_world.txt
Error: AppError { kind: "io", message: "Permission denied (os error 13)" }

// 03. 若 hello_world.txt 包含有非数字的内容，例如 Hello, world!
Error: AppError { kind: "parse", message: "invalid digit found in string" }
```

## 归一化不同的错误类型
至此，关于 Rust 的错误处理大家已经了若指掌了，下面再来看看一些实战中的问题。

在实际项目中，我们往往会为不同的错误定义不同的类型，这样做非常好，但是如果你要在一个函数中返回不同的错误呢？例如：

```rust
use std::fs::read_to_string;

fn main() -> Result<(), std::io::Error> {
  let html = render()?;
  println!("{}", html);
  Ok(())
}

fn render() -> Result<String, std::io::Error> {
  let file = std::env::var("MARKDOWN")?;
  let source = read_to_string(file)?;
  Ok(source)
}
```

上面的代码会报错，原因在于 `render` 函数中的两个 `?` 返回的实际上是不同的错误：`env::var()` 返回的是 `std::env::VarError`，而 `read_to_string` 返回的是 `std::io::Error`。

为了满足 `render` 函数的签名，我们就需要将 `env::VarError` 和 `io::Error` 归一化为同一种错误类型。要实现这个目的有两种方式:

- 使用特征对象 `Box<dyn Error>`
- 自定义错误类型
- 使用 `thiserror`
  
下面依次来看看相关的解决方式。

#### Box<dyn Error>
大家还记得我们之前提到的 `std::error::Error` 特征吧，当时有说：自定义类型实现 `Debug + Display` 特征的主要原因就是为了能转换成 `Error` 的特征对象，而特征对象恰恰是在同一个地方使用不同类型的关键:

```rust
use std::fs::read_to_string;
use std::error::Error;
fn main() -> Result<(), Box<dyn Error>> {
  let html = render()?;
  println!("{}", html);
  Ok(())
}

fn render() -> Result<String, Box<dyn Error>> {
  let file = std::env::var("MARKDOWN")?;
  let source = read_to_string(file)?;
  Ok(source)
}
```

这个方法很简单，在绝大多数场景中，性能也非常够用，但是有一个问题：`Result` 实际上不会限制错误的类型，也就是一个类型就算不实现 `Error` 特征，它依然可以在 `Result<T,E>` 中作为 `E` 来使用，此时这种特征对象的解决方案就无能为力了。

#### 自定义错误类型
与特征对象相比，自定义错误类型麻烦归麻烦，但是它非常灵活，因此也不具有上面的类似限制:
```rust
use std::fs::read_to_string;

fn main() -> Result<(), MyError> {
  let html = render()?;
  println!("{}", html);
  Ok(())
}

fn render() -> Result<String, MyError> {
  let file = std::env::var("MARKDOWN")?;
  let source = read_to_string(file)?;
  Ok(source)
}

#[derive(Debug)]
enum MyError {
  EnvironmentVariableNotFound,
  IOError(std::io::Error),
}

impl From<std::env::VarError> for MyError {
  fn from(_: std::env::VarError) -> Self {
    Self::EnvironmentVariableNotFound
  }
}

impl From<std::io::Error> for MyError {
  fn from(value: std::io::Error) -> Self {
    Self::IOError(value)
  }
}

impl std::error::Error for MyError {}

impl std::fmt::Display for MyError {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    match self {
      MyError::EnvironmentVariableNotFound => write!(f, "Environment variable not found"),
      MyError::IOError(err) => write!(f, "IO Error: {}", err.to_string()),
    }
  }
}
```

上面代码中有一行值得注意：`impl std::error::Error for MyError {}` ，只有为自定义错误类型实现 `Error` 特征后，才能转换成相应的特征对象。

不得不说，真是啰嗦啊。因此在能用特征对象的时候，建议大家还是使用特征对象，无论如何，代码可读性还是很重要的！

上面的第二种方式灵活归灵活，啰嗦也是真啰嗦，好在 Rust 的社区为我们提供了 `thiserror` 解决方案，下面一起来看看该如何简化 Rust 中的错误处理。

## 简化错误处理
对于开发者而言，错误处理是代码中打交道最多的部分之一，因此选择一把趁手的武器也很重要，它可以帮助我们节省大量的时间和精力，好钢应该用在代码逻辑而不是冗长的错误处理上。

#### thiserror
[`thiserror`](https://github.com/dtolnay/thiserror)可以帮助我们简化上面的第二种解决方案：
```rust
use std::fs::read_to_string;

fn main() -> Result<(), MyError> {
  let html = render()?;
  println!("{}", html);
  Ok(())
}

fn render() -> Result<String, MyError> {
  let file = std::env::var("MARKDOWN")?;
  let source = read_to_string(file)?;
  Ok(source)
}

#[derive(thiserror::Error, Debug)]
enum MyError {
  #[error("Environment variable not found")]
  EnvironmentVariableNotFound(#[from] std::env::VarError),
  #[error(transparent)]
  IOError(#[from] std::io::Error),
}
```

如上所示，只要简单谢谢注释，就可以实现错误处理了，惊不惊喜？

#### error-chain
[`error-chain`](https://github.com/rust-lang-deprecated/error-chain) 也是简单好用的库，可惜不再维护了，但是我觉得它依然可以在合适的地方大放光彩，值得大家去了解下。

```rust
use std::fs::read_to_string;

error_chain::error_chain! {
  foreign_links {
    EnvironmentVariableNotFound(::std::env::VarError);
    IOError(::std::io::Error);
  }
}

fn main() -> Result<()> {
  let html = render()?;
  println!("{}", html);
  Ok(())
}

fn render() -> Result<String> {
  let file = std::env::var("MARKDOWN")?;
  let source = read_to_string(file)?;
  Ok(source)
}
```

喏，简单吧？使用 `error-chain` 的宏你可以获得：`Error` 结构体，错误类型 `ErrorKind` 枚举 以及一个自定义的 `Result` 类型。


#### anyhow
[`anyhow`](https://github.com/dtolnay/anyhow) 和 `thiserror` 是同一个作者开发的，这里是作者关于 `anyhow` 和 `thiserror` 的原话：

> 如果你想要设计自己的错误类型，同时给调用者提供具体的信息时，就使用 `thiserror`，例如当你在开发一个三方库代码时。如果你只想要简单，就使用 `anyhow`，例如在自己的应用服务中。

本章的篇幅已经过长，因此就不具体介绍 `anyhow` 该如何使用，官方提供的例子已经足够详尽，这里就留给大家自己探索了 :)

## 总结
Rust 一个为人津津乐道的点就是强大、易用的错误处理，对于新手来说，这个机制可能会有些复杂，但是一旦体会到了其中的好处，你将跟我一样沉醉其中不能自拔。
