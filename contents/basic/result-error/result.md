# 可恢复的错误Result
还记得上一节中，提到的关于文件读取的思考题吧？当时我们解决了读取文件时遇到不可恢复错误该怎么处理的问题，现在来看看，读取过程中，正常返回和遇到可以恢复的错误时该如何处理。

假设，我们有一台消息服务器，每个用户都通过 websocket 连接到该服务器来接收和发送消息，该过程就涉及到 socket 文件的读写，那么此时，如果一个用户的读写发生了错误，显然不能直接 `panic`，否则服务器会直接崩溃，所有用户都会断开连接，因此我们需要一种更温和的错误处理方式：`Result<T, E>`。

之前章节有提到过，`Result<T, E>` 是一个枚举类型，定义如下：
```rust
enum Result<T, E> {
    Ok(T),
    Err(E),
}
```
泛型参数 `T` 代表成功时存入的正确值的类型，存放方式是 `Ok(T)`，`E` 代表错误是存入的错误值，存放方式是 `Err(E)`，枯燥的讲解永远不及代码生动准确，因此先来看下打开文件的例子：
```rust
use std::fs::File;

fn main() {
    let f = File::open("hello.txt");
}
```
以上 `File::open` 返回一个 `Result` 类型，那么问题来了：

> #### 如何获知变量类型或者函数的返回类型
> 
> 有几种常用的方式，此处更推荐第二种方法：
> 
> - 第一种是查询标准库或者三方库文档，搜索 `File`，然后找到它的 `open` 方法
> - 在 [Rust IDE](../../first-try/editor.md) 章节，我们推荐了 `VSCode` IDE 和 `rust-analyzer` 插件，如果你成功安装的话，那么就可以在 `VSCode` 中很方便的通过代码跳转的方式查看代码，同时 `rust-analyzer` 插件还会对代码中的类型进行标注，非常方便好用！
> - 你还可以尝试故意标记一个错误的类型，然后让编译器告诉你：
```rust
let f: u32 = File::open("hello.txt");
```
错误提示如下：
```console
error[E0308]: mismatched types
 --> src/main.rs:4:18
  |
4 |     let f: u32 = File::open("hello.txt");
  |                  ^^^^^^^^^^^^^^^^^^^^^^^ expected u32, found enum
`std::result::Result`
  |
  = note: expected type `u32`
             found type `std::result::Result<std::fs::File, std::io::Error>`
```

上面代码，故意将 `f` 类型标记成整形，编译器立刻不乐意了，你是在忽悠我吗？打开文件操作返回一个整形？来，大哥来告诉你返回什么：`std::result::Result<std::fs::File, std::io::Error>`，我的天呐，怎么这么长的类型！

别慌，其实很简单，首先 `Result` 本身是定义在 `std::result` 中的，但是因为 `Result` 很常用，所以就被包含在了 [`prelude`](../../appendix/prelude.md) 中（将常用的东东提前引入到当前作用域内），因此无需手动引入 `std::result::Result`，那么返回类型可以简化为 `Result<std::fs::File,std::io::Error>`，你看看是不是很像标准的 `Result<T, E>` 枚举定义？只不过 `T` 被替换成了具体的类型 `std::fs::File`，是一个文件句柄类型，`E` 被替换成 `std::io::Error`，是一个 IO 错误类型.

这个返回值类型说明 `File::open` 调用如果成功则返回一个可以进行读写的文件句柄，如果失败，则返回一个 IO 错误：文件不存在或者没有访问文件的权限等。总之 `File::open` 需要一个方式告知调用者是成功还是失败，并同时返回具体的文件句柄(成功)或错误信息(失败)，万幸的是，这些信息可以通过 `Result` 枚举提供：
```rust
use std::fs::File;

fn main() {
    let f = File::open("hello.txt");

    let f = match f {
        Ok(file) => file,
        Err(error) => {
            panic!("Problem opening the file: {:?}", error)
        },
    };
}
```

代码很清晰，对打开文件后的 `Result<T, E>` 类型进行匹配取值，如果是成功，则将 `Ok(file)` 中存放的的文件句柄 `file` 赋值给 `f`，如果失败，则将 `Err(error)` 中存放的错误信息 `error` 使用 `panic` 抛出来，进而结束程序，这非常符合上文提到过的 `panic` 使用场景。


好吧，也没有那么合理 :)

## 对返回的错误进行处理
直接 `panic` 还是过于粗暴，因为实际上 IO 的错误有很多种，我们需要对部分错误进行特殊处理，而不是所有错误都直接崩溃：
```rust
use std::fs::File;
use std::io::ErrorKind;

fn main() {
    let f = File::open("hello.txt");

    let f = match f {
        Ok(file) => file,
        Err(error) => match error.kind() {
            ErrorKind::NotFound => match File::create("hello.txt") {
                Ok(fc) => fc,
                Err(e) => panic!("Problem creating the file: {:?}", e),
            },
            other_error => panic!("Problem opening the file: {:?}", other_error),
        },
    };
}
```

上面代码在匹配出 `error` 后，又对 `error` 进行了详细的匹配解析，最终结果：

- 如果是文件不存在错误 `ErrorKind::NotFound`，就创建文件，这里创建文件`File::create` 也是返回 `Result`，因此继续用 `match` 对其结果进行处理：创建成功，将新的文件句柄赋值给 `f`，如果失败，则 `panic`
- 剩下的错误，一律 `panic`

虽然很清晰，但是代码还是有些啰嗦，我们会在[简化错误处理](../../advance/errors.md)一章重点讲述如何写出更优雅的错误。

## 失败就 panic: unwrap 和 expect
上一节中，已经看到过这两兄弟的简单介绍，这里再来回顾下。

在不需要处理错误的场景，例如写原型、示例时，我们不想使用 `match` 去匹配 `Result<T, E> ` 以获取其中的 `T` 值，因为 `match` 的穷尽匹配特性，你总要去处理下 `Err` 分支。那么有没有办法简化这个过程？有，答案就是 `unwrap` 和 `expect`。

它们的作用就是，如果返回成功，就将 `Ok(T)` 中的值取出来，如果失败，就直接 `panic`，真的勇士绝不多BB，直接崩溃。

```rust
use std::fs::File;

fn main() {
    let f = File::open("hello.txt").unwrap();
}
```

如果调用这段代码时 *hello.txt* 文件不存在，那么 `unwrap` 就将直接 `panic`：

```console
thread 'main' panicked at 'called `Result::unwrap()` on an `Err` value: Os { code: 2, kind: NotFound, message: "No such file or directory" }', src/main.rs:4:37
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace
```

`expect` 跟 `unwrap` 很像，也是遇到错误直接 `panic`, 但是会带上自定义的错误提示信息，相当于重载了错误打印的函数：
```rust
use std::fs::File;

fn main() {
    let f = File::open("hello.txt").expect("Failed to open hello.txt");
}
```
报错如下：

```console
thread 'main' panicked at 'Failed to open hello.txt: Os { code: 2, kind: NotFound, message: "No such file or directory" }', src/main.rs:4:37
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace
```

可以看出，`expect` 相比 `unwrap` 能提供更精确的错误信息，在有些场景也会更加实用。

## 传播错误
咱们的程序几乎不太可能只有 `A->B` 形式的函数调用，一个设计良好的程序，一个功能涉及十几层的函数调用都有可能。而错误处理也往往不是哪里调用出错，就在哪里处理，实际应用中，大概率会把错误层层上传然后交给调用链的上游函数进行处理，错误传播将极为常见。

例如以下函数从文件中读取用户名，然后将结果进行返回：
```rust
use std::fs::File;
use std::io::{self, Read};

fn read_username_from_file() -> Result<String, io::Error> {
    // 打开文件，f是`Result<文件句柄,io::Error>`
    let f = File::open("hello.txt");

    let mut f = match f {
        // 打开文件成功，将file句柄赋值给f
        Ok(file) => file,
        // 打开文件失败，将错误返回(向上传播)
        Err(e) => return Err(e),
    };
    // 创建动态字符串s
    let mut s = String::new();
    // 从f文件句柄读取数据并写入s中
    match f.read_to_string(&mut s) {
        // 读取成功，返回Ok封装的字符串
        Ok(_) => Ok(s),
        // 将错误向上传播
        Err(e) => Err(e),
    }
}
```

有几点值得注意：

- 该函数返回一个 `Result<String, io::Error>` 类型，当读取用户名成功时，返回 `Ok(String)`，失败时，返回 `Err(io:Error)`
- `File::open` 和 `f.read_to_string` 返回的 `Result<T, E>` 中的 `E` 就是 `io::Error`

由此可见，该函数将 `io::Error` 的错误往上进行传播，该函数的调用者最终会对 `Result<String,io::Error>` 进行再处理，至于怎么处理就是调用者的事，如果是错误，它可以选择继续向上传播错误，也可以直接 `panic`，亦或将具体的错误原因包装后写入 socket 中呈现给终端用户。

但是上面的代码也有自己的问题，那就是太长了(优秀的程序员身上的优点极多，其中最大的优点就是*懒*)，我自认为也有那么一点点优秀，因此见不到这么啰嗦的代码，下面咱们来讲讲如何简化它。

### 传播界的大明星: ?
大明星出场，必需得有排面，来看看 `?` 的排面：
```rust
use std::fs::File;
use std::io;
use std::io::Read;

fn read_username_from_file() -> Result<String, io::Error> {
    let mut f = File::open("hello.txt")?;
    let mut s = String::new();
    f.read_to_string(&mut s)?;
    Ok(s)
}
```

看到没，这就是排面，相比前面的 `match` 处理错误的函数，代码直接减少了一半不止，但是，一山更比一山难，看不懂啊！

其实 `?` 就是一个宏，它的作用跟上面的 `match` 几乎一模一样：
```rust
let mut f = match f {
    // 打开文件成功，将file句柄赋值给f
    Ok(file) => file,
    // 打开文件失败，将错误返回(向上传播)
    Err(e) => return Err(e),
};
```
如果结果是 `Ok(T)`，则把 `T` 赋值给 `f`，如果结果是 `Err(E)`，则返回该错误，所以 `?` 特别适合用来传播错误。

虽然 `?` 和 `match` 功能一致，但是事实上 `?` 会更胜一筹。何解？

想象一下，一个设计良好的系统中，肯定有自定义的错误特征，错误之间很可能会存在上下级关系，例如标准库中的 `std::io::Error `和 `std::error::Error`，前者是 IO 相关的错误结构体，后者是一个最最通用的标准错误特征，同时前者实现了后者，因此 `std::io::Error` 可以转换为 `std:error::Error`。

明白了以上的错误转换，`?` 的更胜一筹就很好理解了，它可以自动进行类型提升（转换）：
```rust
fn open_file() -> Result<File, Box<dyn std::error::Error>> {
    let mut f = File::open("hello.txt")?;
    Ok(f)
}
```
上面代码中 `File::open` 报错时返回的错误是 `std::io::Error` 类型，但是 `open_file` 函数返回的错误类型是 `std::error::Error` 的特征对象，可以看到一个错误类型通过 `?` 返回后，变成了另一个错误类型，这就是 `?` 的神奇之处。

根本原因是在于标准库中定义的 `From` 特征，该特征有一个方法 `from`，用于把一个类型转成另外一个类型，`?` 可以自动调用该方法，然后进行隐式类型转换。因此只要函数返回的错误 `ReturnError` 实现了 `From<OtherError>` 特征，那么 `?` 就会自动把 `OtherError` 转换为 `ReturnError`。

这种转换非常好用，意味着你可以用一个大而全的 `ReturnError` 来覆盖所有错误类型，只需要为各种子错误类型实现这种转换即可。

强中自有强中手，一码更比一码短：
```rust
use std::fs::File;
use std::io;
use std::io::Read;

fn read_username_from_file() -> Result<String, io::Error> {
    let mut s = String::new();

    File::open("hello.txt")?.read_to_string(&mut s)?;

    Ok(s)
}
```
瞧见没？ `?` 还能实现链式调用，`File::open` 遇到错误就返回，没有错误就将 `Ok` 中的值取出来用于下一个方法调用，简直太精妙了，从 Go 语言过来的我，内心狂喜（其实学 Rust 的苦和痛我才不会告诉你们）。

不仅有更强，还要有最强，我不信还有人比我更短(不要误解)：
```rust
use std::fs;
use std::io;

fn read_username_from_file() -> Result<String, io::Error> {
    // read_to_string是定义在std::io中的方法，因此需要在上面进行引用
    fs::read_to_string("hello.txt")
}
```

从文件读取数据到字符串中，是比较常见的操作，因此 Rust 标准库为我们提供了 `fs::read_to_string` 函数，该函数内部会打开一个文件、创建 `String`、读取文件内容最后写入字符串并返回，因为该函数其实与本章讲的内容关系不大，因此放在最后来讲，其实只是我想震你们一下 :)

#### ? 用于Option的返回
`?` 不仅仅可以用于 `Result` 的传播，还能用于 `Option` 的传播，再来回忆下 `Option` 的定义：
```rust
pub enum Option<T> {
    Some(T),
    None
}
```

`Result` 通过 `?` 返回错误，那么 `Option` 就通过 `?` 返回 `None`：
```rust
fn first(arr: &[i32]) -> Option<&i32> {
   let v = arr.get(0)?;
   Some(v)
}
```
上面的函数中，`arr.get` 返回一个 `Option<&i32>` 类型，因为 `?` 的使用，如果 `get` 的结果是 `None`，则直接返回 `None`，如果是 `Some(&i32)`，则把里面的值赋给 `v`。

其实这个函数有些画蛇添足，我们完全可以写出更简单的版本：
```rust
fn first(arr: &[i32]) -> Option<&i32> {
   arr.get(0)
}
```
有一句话怎么说？没有需求，制造需求也要上……大家别跟我学习，这是软件开发大忌。只能用代码洗洗眼了：
```rust
fn last_char_of_first_line(text: &str) -> Option<char> {
    text.lines().next()?.chars().last()
}
```
上面代码展示了在链式调用中使用 `?` 提前返回 `None` 的用法， `.next` 方法返回的是 `Option` 类型：如果返回 `Some(&str)`，那么继续调用 `chars` 方法,如果返回 `None`，则直接从整个函数中返回 `None`，不再继续进行链式调用。

#### 新手用 ? 常会犯的错误
初学者在用 `?` 时，老是会犯错，例如写出这样的代码：
```rust
fn first(arr: &[i32]) -> Option<&i32> {
   arr.get(0)?
}
```
这段代码无法通过编译，切记：`?` 操作符需要一个变量来承载正确的值，这个函数只会返回 `Some(&i32)` 或者 `None`，只有错误值能直接返回，正确的值不行，所以如果数组中存在 0 号元素，那么函数第二行使用 `?` 后的返回类型为 `&i32` 而不是 `Some(&i32)`。因此 `?` 只能用于以下形式：

- `let v = xxx()?;`
- `xxx()?.yyy()?;`

#### 带返回值的main函数
在了解了 `?` 的使用限制后，这段代码你很容易看出它无法编译：
```rust
use std::fs::File;

fn main() {
    let f = File::open("hello.txt")?;
}
```
因为 `?` 要求 `Result<T, E>` 形式的返回值，而 `main` 函数的返回是 `()`，因此无法满足，那是不是就无解了呢？

实际上 Rust 还支持另外一种形式的 `main` 函数：
```rust
use std::error::Error;
use std::fs::File;

fn main() -> Result<(), Box<dyn Error>> {
    let f = File::open("hello.txt")?;

    Ok(())
}
```

这样就能使用 `?` 提前返回了，同时我们又一次看到了`Box<dyn Error>` 特征对象，因为 `std::error:Error` 是 Rust 中抽象层次最高的错误，其它标准库中的错误都实现了该特征，因此我们可以用该特征对象代表一切错误，就算 `main` 函数中调用任何标准库函数发生错误，都可以通过 `Box<dyn Error>` 这个特征对象进行返回.

至于 `main` 函数可以有多种返回值，那是因为实现了 [std::process::Termination](https://doc.rust-lang.org/std/process/trait.Termination.html) 特征，目前为止该特征还没进入稳定版 Rust 中，也许未来你可以为自己的类型实现该特征！

#### try!
在 `?` 横空出世之前( Rust 1.13 )，Rust 开发者还可以使用 `try!` 来处理错误，该宏的大致定义如下：
```rust
macro_rules! try {
    ($e:expr) => (match $e {
        Ok(val) => val,
        Err(err) => return Err(::std::convert::From::from(err)),
    });
}
```

简单看一下与 `?` 的对比:
```rust
//  `?`
let x = function_with_error()?; // 若返回 Err, 则立刻返回；若返回 Ok(255)，则将 x 的值设置为 255

// `try!()`
let x = try!(function_with_error());
```

可以看出 `?` 的优势非常明显，何况 `?` 还能做链式调用。 

总之，`try!` 作为前浪已经死在了沙滩上，**在当前版本中，我们要尽量避免使用 try!**。

