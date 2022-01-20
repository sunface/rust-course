# 安装 Rust

`rustup` 是 Rust 的安装程序，也是它的版本管理程序。
强烈建议使用 `rustup` 来安装 Rust，当然如果你有异心，请寻找其它安装方式，然后再从下一节开始阅读。

> haha，开个玩笑。读者乃大大，怎么能弃之不顾。
>
> 注意：如果你不想用或者不能用 rustup，请参见 [Rust 其它安装方法](https://forge.rust-lang.org/infra/other-installation-methods.html#other-rust-installation-methods)

至于版本，现在 Rust 稳定版特性越来越全了，因此下载最新稳定版本即可。由于你用的 Rust 版本可能跟本书写作时不一样，一些编译错误和警告可能也会有所不同。

## 在 Linux 或 MacOS 上安装 `rustup`

打开终端并输入下面命令：

```console
curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
```

这个命令将下载一个脚本并开始安装 `rustup` 工具，此工具将安装 Rust 的最新稳定版本。可能会提示你输入管理员密码。

如果安装成功，将出现下面这行：

```text
Rust is installed now. Great!
```

OK，这样就已经完成 Rust 安装啦。

### 安装 C 语言编译器：（非必需）

Rust 对运行环境的依赖和 Go 语言很像，几乎所有环境都可以无需安装任何依赖直接运行。但是，Rust 会依赖 `libc` 和链接器 `linker`。所以如果遇到了提示链接器无法执行的错误，你需要再手动安装一个 C 语言编译器：

**MacOS 下：**

```console
xcode-select --install
```
**Linux 下：**

Linux 用户一般应按照相应发行版的文档来安装 `GCC` 或 `Clang`。

例如，如果你使用 Ubuntu，则可安装 `build-essential`。

## 在 Windows 上安装 `rustup`

Windows 上安装 Rust 需要有 `C++` 环境，以下为安装的两种方式：

**1. `x86_64-pc-windows-msvc`（官方推荐）**

先安装 [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/zh-hans/visual-cpp-build-tools/)，安装勾选 C++ 环境即可。安装时 可自行修改缓存路径与安装路径，避免占用过多 C 盘空间。

准备好 C++ 环境后开始安装 Rust：

在 [RUSTUP-INIT](https://www.rust-lang.org/learn/get-started) 下载系统相对应的 Rust 安装程序，一路默认即可。

``` shell
PS C:\Users\Hehongyuan> rustup-init.exe 
......
Current installation options:

   default host triple: x86_64-pc-windows-msvc
     default toolchain: stable (default)
               profile: default
  modify PATH variable: yes

1) Proceed with installation (default)
2) Customize installation
3) Cancel installation
```

**2、`x86_64-pc-windows-gnu`**

相比于 MSVC 版本来说，GNU 版本具有更轻量，更靠近 Linux 的优势。

首先，根据 [MSYS2 官网](https://www.msys2.org/) 配置 MSYS。

若您觉得下载太慢，可以试试由 [Caviar-X](https://github.com/Caviar-X) 提供的 [代理](https://github.pigeons.icu/msys2/msys2-installer/releases/download/2021-11-30/msys2-x86_64-20211130.exe)。

在安装 `mingw-toolchain` 后，请将 `%MSYS 安装路径%\mingw64\bin` 添加到系统变量 `PATH` 中。

配置好后，在 MSYS 中输入下面的命令来安装 rustup。

```bash
curl https://sh.rustup.rs -sSf | sh
```

之后，根据以下输出进行配置。

```text
Current installation options:

   default host triple: x86_64-pc-windows-msvc
     default toolchain: stable (default)
               profile: default
  modify PATH variable: yes

1) Proceed with installation (default)
2) Customize installation
3) Cancel installation
>2

I'm going to ask you the value of each of these installation options.
You may simply press the Enter key to leave unchanged.

Default host triple? [x86_64-pc-windows-msvc]
x86_64-pc-windows-gnu

Default toolchain? (stable/beta/nightly/none) [stable]
stable

Profile (which tools and data to install)? (minimal/default/complete) [default]
complete

Modify PATH variable? (Y/n)
Y

Current installation options:

   default host triple: x86_64-pc-windows-gnu
     default toolchain: stable
               profile: complete
  modify PATH variable: yes

1) Proceed with installation (default)
2) Customize installation
3) Cancel installation
>
```

再之后，按下 1，等待。完成后，您就已经安装了 Rust 和 `rustup`。

## 卸载

要卸载 Rust 和 `rustup`，在终端执行以下命令即可卸载：

```bash
rustup self uninstall
```

## 检查安装是否成功

检查是否正确安装了 Rust，可打开终端并输入下面这行，此时能看到最新发布的稳定版本的版本号、提交哈希值和提交日期：

```bash
rustc -V
rustc 1.56.1 (59eed8a2a 2021-11-01)

cargo -V
cargo 1.57.0 (b2e52d7ca 2021-10-21)
```
> 注：若发现版本号不同，以您的版本号为准

恭喜，你已成功安装 Rust！如果没看到此信息，并且你使用的是 Windows，请检查 Rust 或 `%USERPROFILE%\.cargo\bin` 是否在 `%PATH%` 系统变量中。

如果都正确，但 Rust 仍然无法正常工作，那么你可以在很多地方获得帮助。最简单的是**加入 Rust 编程学院这个大家庭，QQ 群：1009730433**.

## 本地文档

安装 Rust 的同时也会在本地安装一个文档服务，方便我们离线阅读：运行 `rustup doc` 让浏览器打开本地文档。

每当遇到标准库提供的类型或函数不知道怎么用时，都可以在 API 文档中查找到！具体参见 [在标准库寻找你想要的内容](../std/search.md)。
