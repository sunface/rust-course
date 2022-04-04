# 构建时工具
本章节的内容是关于构建工具的，如果大家没有听说过 `build.rs` 文件，强烈建议先看看[这里](https://course.rs/cargo/reference/build-script/intro.html)了解下何为构建工具。

### 编译并静态链接一个 C 库

[cc](https://docs.rs/cc/latest/cc/) 包能帮助我们更好地跟 C/C++/汇编进行交互：它提供了简单的 API 可以将外部的库编译成静态库( .a )，然后通过 `rustc` 进行静态链接。

下面的例子中，我们将在 Rust 代码中使用 C 的代码: *src/hello.c*。在开始编译 Rust 的项目代码前，`build.rs` 构建脚本将先被执行。通过 cc 包，一个静态的库可以被生成( *libhello.a* ),然后该库将被 Rust的代码所使用：通过 `extern` 声明外部函数签名的方式来使用。

由于例子中的 C 代码很简单，因此只需要将一个文件传递给 [cc::Build](https://docs.rs/cc/*/cc/struct.Build.html)。如果大家需要更复杂的构建，`cc::Build` 还提供了通过 [include](https://docs.rs/cc/*/cc/struct.Build.html#method.include) 来包含路径的方式，以及额外的编译标志( [flags](https://docs.rs/cc/1.0.73/cc/struct.Build.html#method.flag) )。

*Cargo.toml*

```toml
[package]
...
build = "build.rs"

[build-dependencies]
cc = "1"

[dependencies]
error-chain = "0.11"
```

*build.rs*

```rust
fn main() {
    cc::Build::new()
        .file("src/hello.c")
        .compile("hello");   // outputs `libhello.a`
}
```

*src/hello.c*

```C
#include <stdio.h>


void hello() {
    printf("Hello from C!\n");
}

void greet(const char* name) {
    printf("Hello, %s!\n", name);
}
```

*src/main.rs*

```rust
use error_chain::error_chain;
use std::ffi::CString;
use std::os::raw::c_char;

error_chain! {
    foreign_links {
        NulError(::std::ffi::NulError);
        Io(::std::io::Error);
    }
}
fn prompt(s: &str) -> Result<String> {
    use std::io::Write;
    print!("{}", s);
    std::io::stdout().flush()?;
    let mut input = String::new();
    std::io::stdin().read_line(&mut input)?;
    Ok(input.trim().to_string())
}

extern {
    fn hello();
    fn greet(name: *const c_char);
}

fn main() -> Result<()> {
    unsafe { hello() }
    let name = prompt("What's your name? ")?;
    let c_name = CString::new(name)?;
    unsafe { greet(c_name.as_ptr()) }
    Ok(())
}
```

###  编译并静态链接一个 C++ 库
链接到 C++ 库跟之前的方式非常相似。主要的区别在于链接到 C++ 库时，你需要通过构建方法 [cpp(true)](https://docs.rs/cc/*/cc/struct.Build.html#method.cpp) 来指定一个 C++ 编译器，然后在 C++ 的代码顶部添加 `extern "C"` 来阻止 C++ 编译器对库名进行名称重整( name mangling )。

*Cargo.toml*

```toml
[package]
...
build = "build.rs"

[build-dependencies]
cc = "1"
```

*build.rs*

```rust
fn main() {
    cc::Build::new()
        .cpp(true)
        .file("src/foo.cpp")
        .compile("foo");   
}
```

*src/foo.cpp*

```c++
extern "C" {
    int multiply(int x, int y);
}

int multiply(int x, int y) {
    return x*y;
}
```

*src/main.rs*

```rust
extern {
    fn multiply(x : i32, y : i32) -> i32;
}

fn main(){
    unsafe {
        println!("{}", multiply(5,7));
    }   
}
```

### 为 C 库创建自定义的 define

[cc::Build::define](https://docs.rs/cc/*/cc/struct.Build.html#method.define) 可以让我们使用自定义的 define 来构建 C 库。

以下示例在构建脚本 `build.rs` 中动态定义了一个 define，然后在运行时打印出 **Welcome to foo - version 1.0.2**。Cargo 会设置一些[环境变量](https://doc.rust-lang.org/cargo/reference/environment-variables.html)，它们对于自定义的 define 会有所帮助。

*Cargo.toml*

```toml
[package]
...
version = "1.0.2"
build = "build.rs"

[build-dependencies]
cc = "1"
```

*build.rs*
```rust
fn main() {
    cc::Build::new()
        .define("APP_NAME", "\"foo\"")
        .define("VERSION", format!("\"{}\"", env!("CARGO_PKG_VERSION")).as_str())
        .define("WELCOME", None)
        .file("src/foo.c")
        .compile("foo");
}
```

*src/foo.c*
```C
#include <stdio.h>

void print_app_info() {
#ifdef WELCOME
    printf("Welcome to ");
#endif
    printf("%s - version %s\n", APP_NAME, VERSION);
}
```

*src/main.rs*
```rust
extern {
    fn print_app_info();
}

fn main(){
    unsafe {
        print_app_info();
    }   
}
```

