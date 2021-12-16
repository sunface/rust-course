# 安装Rust

强烈建议使用`rustup`来安装Rust，当然如果你有异心，请寻找其它安装方式，然后再从下一节开始阅读。

> haha,开个玩笑，读者乃大大，怎么能弃之不顾，所以，注意：如果你不想用或者不能用rustup，请参见[Rust其它安装方法](https://forge.rust-lang.org/infra/other-installation-methods.html#other-rust-installation-methods)

现在Rust稳定版特性越来越全了，因此下载最新稳定版本即可。由于你用的Rust版本可能跟本书写的时候不一样，一些编译错误和警告可能也会有所不同。


### 在 Linux 或 macOS 上安装 `rustup`

如果你使用的是 Linux 或 macOS，打开终端并输入下面命令：

```console
$ curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
```

这个命令将下载一个脚本并开始安装 `rustup` 工具，此工具将安装 `Rust` 的最新稳定版本。可能会提示你输入管理员密码, 如果安装成功，将出现下面这行：

```text
Rust is installed now. Great!
```

注意,上面已经完成了Rust安装，**假如在安装过程中遇到连接器错误，请继续往下看**，否则可以直接跳到[更新和卸载](#更新和卸载)，继续阅读.

Rust对运行环境和Go语言很像，几乎所有环境都可以无需安装任何依赖直接运行，但是，Rust会依赖`libc`和链接器`linker`,所以如果遇到了提示链接器无法执行的错误，你需要手动安装一个C语言编译器:

**在Macos下**
```console
$ xcode-select --install
```
**在linux下**
Linux 用户一般应按照相应发行版的文档来安装`GCC`或`Clang`。例如，如果你使用 Ubuntu，则可安装 `build-essential`。


### 在 Windows 上安装 `rustup`

windows上安装Rust需要有`c++`环境,以下为安装的两种方式:

**1、x86_64-pc-windows-msvc(官方推荐)**

先安装 [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/zh-hans/visual-cpp-build-tools/)，安装勾选 C++ 环境即可，安装时 可自行修改缓存路径与安装路径，避免占用过多C盘空间。

准备好 C++ 环境后开始安装Rust: 在[RUSTUP-INIT](https://www.rust-lang.org/learn/get-started) 下载系统相对应的Rust安装程序, 一路默认即可。

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

**2、x86_64-pc-windows-gnu**

该类型的C++ 环境其实官方也有说明  [Other Rust Installation Methods](https://forge.rust-lang.org/infra/other-installation-methods.html#other-rust-installation-methods).

个人习惯使用 [mingw-w64 官网](https://www.mingw-w64.org/) , 当然你也可以选择[win-builds](http://win-builds.org/).

为了方便初学者使用 这里提供一个免安装的的方式 [mingw-w64下载](https://sourceforge.net/projects/mingw-w64/files/),演示选择的 `x86_64-posix-seh` 对于学习者，初次安装不需要纠结什么类别，因为切换版本很方便。下载完压缩包并解压，把压缩包下的 `/bin` 目录添加到 环境`Path` 即可:
<img alt="" src="/img/mingw-w64-download" class="center"  />

1、验证 c++ 环境
``` shell
PS C:\Users\Hehongyuan> c++ -v
Using built-in specs.
COLLECT_GCC=C:\ENV\mingw64\bin\c++.exe
COLLECT_LTO_WRAPPER=C:/ENV/mingw64/bin/../libexec/gcc/x86_64-w64-mingw32/8.1.0/lto-wrapper.exe
Target: x86_64-w64-mingw32
Configured with: xxxxxxxxxxxxxx
gcc version 8.1.0 (x86_64-posix-seh-rev0, Built by MinGW-W64 project)

```

2、安装 Rust 注意选择 `Customize installation` 并设置 `host triple` 为 `x86_64-pc-windows-gnu`

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
>2

I m going to ask you the value of each of these installation options.
You may simply press the Enter key to leave unchanged.

Default host triple? [x86_64-pc-windows-msvc]
x86_64-pc-windows-gnu

Default toolchain? (stable/beta/nightly/none) [stable]


Profile (which tools and data to install)? (minimal/default/complete) [default]

```

> windows上安装过程较为麻烦，因此我们专门写了一篇文章来讲解相关的安装过程，请参考：[Windows安装](https://blog.csdn.net/erlib/article/details/121684998?spm=1001.2014.3001.5501).


### 更新和卸载

通过 `rustup` 安装 Rust 后，更新到最新版本很简单。在终端中运行以下更新命令：

```console
$ rustup update
```

要卸载 `Rust` 和 `rustup`，在终端中运行以下卸载命令：

```console
$ rustup self uninstall
```

### 检查安装是否成功

检查是否正确安装了 Rust，可打开终端并输入下面这行, 此时能看到最新发布的稳定版本的版本号、提交哈希值和提交日期:

```console
$ rustc -V
rustc 1.56.1 (59eed8a2a 2021-11-01)
```

恭喜，你已成功安装 Rust！如果没看到此信息，并且你使用的是 Windows，请检查 Rust 是否在 `%PATH%` 系统变量中。如果都正确，但 `Rust` 仍然无法正常工作，那么你可以在很多地方获得帮助。最简单的是**加入Rust编程学院这个大家庭，QQ群：1009730433**.

### 本地文档

安装Rust的同时也会在本地安装一个文档服务，方便我们离线阅读: 运行 `rustup doc` 让浏览器打开本地文档。

每当遇到标准库提供的类型或函数不知道怎么用时，都可以在 API 文档中查找到！具体参见[在标准库寻找你想要的内容](../std/search.md)