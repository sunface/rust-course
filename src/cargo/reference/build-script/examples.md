# 构建脚本示例

下面我们通过一些例子来说明构建脚本该如何使用。社区中也提供了一些构建脚本的[常用功能](https://crates.io/keywords/build-dependencies)，例如：

- [bindgen](https://crates.io/crates/bindgen), 自动生成 Rust -> C 的 FFI 绑定
- [cc](https://crates.io/crates/cc), 编译 C/C++/汇编
- [pkg-config](https://crates.io/crates/cc), 使用 `pkg-config` 工具检测系统库
- [cmake](https://crates.io/crates/cmake), 运行 `cmake` 来构建一个本地库
- [autocfg](https://crates.io/crates/autocfg), [rustc_version](https://crates.io/crates/rustc_version), [version_check](https://crates.io/crates/version_check)，这些包提供基于 `rustc` 的当前版本来实现条件编译的方法

## 代码生成

一些项目需要在编译开始前先生成一些代码，下面我们来看看如何在构建脚本中生成一个库调用。

先来看看项目的目录结构:

```shell
.
├── Cargo.toml
├── build.rs
└── src
    └── main.rs

1 directory, 3 files
```

`Cargo.toml` 内容如下:

```toml
# Cargo.toml

[package]
name = "hello-from-generated-code"
version = "0.1.0"
```

接下来，再来看看构建脚本的内容:

```rust
// build.rs

use std::env;
use std::fs;
use std::path::Path;

fn main() {
    let out_dir = env::var_os("OUT_DIR").unwrap();
    let dest_path = Path::new(&out_dir).join("hello.rs");
    fs::write(
        &dest_path,
        "pub fn message() -> &'static str {
            \"Hello, World!\"
        }
        "
    ).unwrap();
    println!("cargo:rerun-if-changed=build.rs");
}
```

以上代码中有几点值得注意：

- `OUT_DIR` 环境变量说明了构建脚本的输出目录，也就是最终生成的代码文件的存放地址
- 一般来说，构建脚本不应该修改 `OUT_DIR` 之外的任何文件
- 这里的代码很简单，但是我们这是为了演示，大家完全可以生成更复杂、更实用的代码
- `return-if-changed` 指令告诉 Cargo 只有在脚本内容发生变化时，才能重新编译和运行构建脚本。如果没有这一行，项目的任何文件发生变化都会导致 Cargo 重新编译运行该构建脚本

下面，我们来看看 `main.rs`：

```rust
// src/main.rs

include!(concat!(env!("OUT_DIR"), "/hello.rs"));

fn main() {
    println!("{}", message());
}
```

这里才是体现真正技术的地方，我们联合使用 rustc 定义的 `include!` 以及 `concat!` 和 `env!` 宏，将生成的代码文件( `hello.rs` ) 纳入到我们项目的编译流程中。

例子虽然很简单，但是它清晰地告诉了我们该如何生成代码文件以及将这些代码文件纳入到编译中来，大家以后有需要只要回头看看即可。

## 构建本地库

有时，我们需要在项目中使用基于 C 或 C++ 的本地库，而这种使用场景恰恰是构建脚本非常擅长的。

例如，下面来看看该如何在 Rust 中调用 C 并打印 `Hello, World`。首先，来看看项目结构和 `Cargo.toml`:

```shell
.
├── Cargo.toml
├── build.rs
└── src
    ├── hello.c
    └── main.rs

1 directory, 4 files
```

```toml
# Cargo.toml

[package]
name = "hello-world-from-c"
version = "0.1.0"
edition = "2021"
```

现在，我们还不会使用任何构建依赖，先来看看构建脚本:

```rust
// build.rs

use std::process::Command;
use std::env;
use std::path::Path;

fn main() {
    let out_dir = env::var("OUT_DIR").unwrap();

    Command::new("gcc").args(&["src/hello.c", "-c", "-fPIC", "-o"])
                       .arg(&format!("{}/hello.o", out_dir))
                       .status().unwrap();
    Command::new("ar").args(&["crus", "libhello.a", "hello.o"])
                      .current_dir(&Path::new(&out_dir))
                      .status().unwrap();

    println!("cargo:rustc-link-search=native={}", out_dir);
    println!("cargo:rustc-link-lib=static=hello");
    println!("cargo:rerun-if-changed=src/hello.c");
}
```

首先，构建脚本将我们的 C 文件通过 `gcc` 编译成目标文件，然后使用 `ar` 将该文件转换成一个静态库，最后告诉 Cargo 我们的输出内容在 `out_dir` 中，编译器要在这里搜索相应的静态库，最终通过 `-l static-hello` 标志将我们的项目跟 `libhello.a` 进行静态链接。

但是这种硬编码的解决方式有几个问题:

- `gcc` 命令的跨平台性是受限的，例如 Windows 下就难以使用它，甚至于有些 Unix 系统也没有 `gcc` 命令，同样，`ar` 也有这个问题
- 这些命令往往不会考虑交叉编译的问题，如果我们要为 Android 平台进行交叉编译，那么 `gcc` 很可能无法输出一个 ARM 的可执行文件

但是别怕，构建依赖 `[build-dependencies]` 解君忧：社区中已经有现成的解决方案，可以让这种任务得到更容易的解决。例如文章开头提到的 [`cc`](https://crates.io/crates/cc) 包。首先在 `Cargo.toml` 中为构建脚本引入 `cc` 依赖:

```toml
[build-dependencies]
cc = "1.0"
```

然后重写构建脚本使用 `cc` :

```rust
// build.rs

fn main() {
    cc::Build::new()
        .file("src/hello.c")
        .compile("hello");
    println!("cargo:rerun-if-changed=src/hello.c");
}
```

不得不说，Rust 社区的大腿就是粗，代码立刻简洁了很多，最重要的是：可移植性、稳定性等头疼的问题也得到了一并解决。

简单来说，`cc` 包将构建脚本使用 `C` 的需求进行了抽象:

- `cc` 会针对不同的平台调用合适的编译器：windows 下调用 MSVC, MinGW 下调用 gcc， Unix 平台调用 cc 等
- 在编译时会考虑到平台因素，例如将合适的标志传给正在使用的编译器
- 其它环境变量，例如 `OPT_LEVEL`、`DEBUG` 等会自动帮我们处理
- 标准输出和 `OUT_DIR` 的位置也会被 `cc` 所处理

如上所示，与其在每个构建脚本中复制粘贴相同的代码，将尽可能多的功能通过构建依赖来完成是好得多的选择。

再回到例子中，我们来看看 `src` 下的项目文件：

```c
// src/hello.c

#include <stdio.h>

void hello() {
    printf("Hello, World!\n");
}
```

```rust
// src/main.rs

// 注意，这里没有再使用 `#[link]` 属性。我们把选择使用哪个 link 的责任交给了构建脚本，而不是在这里进行硬编码
extern { fn hello(); }

fn main() {
    unsafe { hello(); }
}
```

至此，这个简单的例子已经完成，我们学到了该如何使用构建脚本来构建 C 代码，当然又一次被构建脚本和构建依赖的强大所震撼！但控制下情绪，因为构建脚本还能做到更多。

## 链接系统库

当一个 Rust 包想要链接一个本地系统库时，如何实现平台透明化，就成了一个难题。

例如，我们想使用在 Unix 系统中的 `zlib` 库，用于数据压缩的目的。实际上，社区中的 [`libz-sys`](https://crates.io/crates/libz-sys) 包已经这么做了，但是出于演示的目的，我们来看看该如何手动完成，当然，这里只是简化版的，想要看完整代码，见[这里](https://github.com/rust-lang/libz-sys)。

为了更简单的定位到目标库的位置，可以使用 [`pkg-config`](https://crates.io/crates/pkg-config) 包，该包使用系统提供的 `pkg-config` 工具来查询库的信息。它会自动告诉 Cargo 该如何链接到目标库。

先修改 `Cargo.toml`：

```toml
# Cargo.toml

[package]
name = "libz-sys"
version = "0.1.0"
edition = "2021"
links = "z"

[build-dependencies]
pkg-config = "0.3.16"
```

这里的 `links = "z"` 用于告诉 Cargo 我们想要链接到 `libz` 库，在[下文](#使用其它-sys-包)还有更多的示例。

构建脚本也很简单:

```rust
// build.rs

fn main() {
    pkg_config::Config::new().probe("zlib").unwrap();
    println!("cargo:rerun-if-changed=build.rs");
}
```

下面再在代码中使用：

```rust
// src/lib.rs

use std::os::raw::{c_uint, c_ulong};

extern "C" {
    pub fn crc32(crc: c_ulong, buf: *const u8, len: c_uint) -> c_ulong;
}

#[test]
fn test_crc32() {
    let s = "hello";
    unsafe {
        assert_eq!(crc32(0, s.as_ptr(), s.len() as c_uint), 0x3610a686);
    }
}
```

代码很清晰，也很简洁，这里就不再过多介绍，运行 [`cargo build --vv`](https://course.rs/cargo/reference/build-script/intro.html#构建脚本的输出) 来看看部分结果( 系统中需要已经安装 `libz` 库)：

```shell
[libz-sys 0.1.0] cargo:rustc-link-search=native=/usr/lib
[libz-sys 0.1.0] cargo:rustc-link-lib=z
[libz-sys 0.1.0] cargo:rerun-if-changed=build.rs
```

非常棒，`pkg-config` 帮助我们找到了目标库，并且还告知了 Cargo 所有需要的信息！

实际使用中，我们需要做的比上面的代码更多，例如 [`libz-sys`](https://github.com/rust-lang/libz-sys) 包会先检查环境变量 `LIBZ_SYS_STATIC` 或者 `static` feature，然后基于源码去构建 `libz`，而不是直接去使用系统库。

## 使用其它 sys 包

本例中，一起来看看该如何使用 `libz-sys` 包中的 `zlib` 来创建一个 C 依赖库。

若你有一个依赖于 `zlib` 的库，那可以使用 `libz-sys` 来自动发现或构建该库。这个功能对于交叉编译非常有用，例如 Windows 下往往不会安装 `zlib`。

`libz-sys` 通过设置 [`include`](https://github.com/rust-lang/libz-sys/blob/3c594e677c79584500da673f918c4d2101ac97a1/build.rs#L156) 元数据来告知其它包去哪里找到 `zlib` 的头文件，然后我们的构建脚本可以通过 `DEP_Z_INCLUDE` 环境变量来读取 `include` 元数据( 关于元数据的传递，见[这里](https://course.rs/cargo/reference/build-script/intro.html#links) )。

```toml
# Cargo.toml

[package]
name = "zuser"
version = "0.1.0"
edition = "2021"

[dependencies]
libz-sys = "1.0.25"

[build-dependencies]
cc = "1.0.46"
```

通过包含 `libz-sys`，确保了最终只会使用一个 `libz` 库，并且给了我们在构建脚本中使用的途径:

```rust
// build.rs

fn main() {
    let mut cfg = cc::Build::new();
    cfg.file("src/zuser.c");
    if let Some(include) = std::env::var_os("DEP_Z_INCLUDE") {
        cfg.include(include);
    }
    cfg.compile("zuser");
    println!("cargo:rerun-if-changed=src/zuser.c");
}
```

由于 `libz-sys` 帮我们完成了繁重的相关任务，C 代码只需要包含 `zlib` 的头文件即可，甚至于它还能在没有安装 `zlib` 的系统上找到头文件:

```c
// src/zuser.c

#include "zlib.h"

// … 在剩余的代码中使用 zlib
```

## 条件编译

构建脚本可以通过发出 `rustc-cfg` 指令来开启编译时的条件检查。在本例中，一起来看看 [openssl](https://crates.io/crates/openssl) 包是如何支持多版本的 OpenSSL 库的。

`openssl-sys` 包对 OpenSSL 库进行了构建和链接，支持多个不同的实现(例如 LibreSSL )和多个不同的版本。它也使用了 `links` 配置，这样就可以给**其它构建脚本**传递所需的信息。例如 `version_number` ，包含了检测到的 OpenSSL 库的版本号信息。`openssl-sys` 自己的[构建脚本中](https://github.com/sfackler/rust-openssl/blob/dc72a8e2c429e46c275e528b61a733a66e7877fc/openssl-sys/build/main.rs#L216)有类似于如下的代码:

```rust
println!("cargo:version_number={:x}", openssl_version);
```

该指令将 `version_number` 的信息通过环境变量 `DEP_OPENSSL_VERSION_NUMBER` 的方式传递给直接使用 `openssl-sys` 的项目。例如 `openssl` 包提供了更高级的抽象接口，并且它使用了 `openssl-sys` 作为依赖。`openssl` 的构建脚本会通过环境变量读取 `openssl-sys` 提供的版本号的信息，然后使用该版本号来生成一些 [`cfg`](https://github.com/sfackler/rust-openssl/blob/dc72a8e2c429e46c275e528b61a733a66e7877fc/openssl/build.rs#L18-L36):

```rust
// (portion of build.rs)

if let Ok(version) = env::var("DEP_OPENSSL_VERSION_NUMBER") {
    let version = u64::from_str_radix(&version, 16).unwrap();

    if version >= 0x1_00_01_00_0 {
        println!("cargo:rustc-cfg=ossl101");
    }
    if version >= 0x1_00_02_00_0 {
        println!("cargo:rustc-cfg=ossl102");
    }
    if version >= 0x1_01_00_00_0 {
        println!("cargo:rustc-cfg=ossl110");
    }
    if version >= 0x1_01_00_07_0 {
        println!("cargo:rustc-cfg=ossl110g");
    }
    if version >= 0x1_01_01_00_0 {
        println!("cargo:rustc-cfg=ossl111");
    }
}
```

这些 `cfg` 可以跟 [`cfg` 属性]() 或 [`cfg` 宏]()一起使用以实现条件编译。例如，在 OpenSSL 1.1 中引入了 SHA3 的支持，那么我们就可以指定只有当版本号为 1.1 时，才[包含并编译相关的代码](https://github.com/sfackler/rust-openssl/blob/dc72a8e2c429e46c275e528b61a733a66e7877fc/openssl/src/hash.rs#L67-L85):

```rust
// (portion of openssl crate)

#[cfg(ossl111)]
pub fn sha3_224() -> MessageDigest {
    unsafe { MessageDigest(ffi::EVP_sha3_224()) }
}
```

当然，大家在使用时一定要小心，因为这可能会导致生成的二进制文件进一步依赖当前的构建环境。例如，当二进制可执行文件需要在另一个操作系统中分发运行时，那它依赖的信息对于该操作系统可能是不存在！
