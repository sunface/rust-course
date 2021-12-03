# 安装Rust

强烈建议使用`rustup`来安装Rust，当然如果你有异心，请寻找其它安装方式，然后再从下一节开始阅读。

> haha,开个玩笑，读者乃大大，怎么能弃之不顾，所以，注意：如果你不想用或者不能用rustup，请参见[Rust其它安装方法](https://forge.rust-lang.org/infra/other-installation-methods.html#other-rust-installation-methods)

现在Rust稳定版特性越来越全了，所以下载最新稳定版本即可。由于你用的Rust版本可能跟本书写的时候不一样，所以一些编译错误和警告可能也会有所不同。


### 在 Linux 或 macOS 上安装 `rustup`

如果你使用的是 Linux 或 macOS，打开终端并输入下面命令：

```console
$ curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
```

这个命令将下载一个脚本并开始安装 `rustup` 工具，此工具将安装 `Rust` 的最新稳定版本。可能会提示你输入管理员密码。如果安装成功，将出现下面这行：

```text
Rust is installed now. Great!
```

注意,上面已经完成了Rust安装，**如果你在安装过程中遇到连接器错误，请继续往下看**，否则可以直接跳到[更新和卸载](#更新和卸载)，继续阅读.

Rust对运行环境和Go语言很像，几乎所有环境都可以无需安装任何依赖直接运行，但是，Rust会依赖libc和链接器linker,所以如果遇到了提示链接器无法执行的错误，你需要手动安装一个C语言编译器即可:

**在Macos下**
```console
$ xcode-select --install
```
**在linux下**
Linux 用户一般应按照相应发行版的文档来安装 GCC 或 Clang。例如，如果你使用 Ubuntu，则可安装 `build-essential`。

### 在 Windows 上安装 `rustup`

windows上安装过程较为麻烦，因此我们专门写了一篇文章来讲解相关的安装过程，请移步：[Windows安装]()


### 更新和卸载

通过 `rustup` 安装 Rust 后，更新到最新版本很简单。在 shell 中运行以下更新命令：

```console
$ rustup update
```

要卸载 `Rust` 和 `rustup`，在 shell 中运行以下卸载命令：

```console
$ rustup self uninstall
```

### 疑难解答

要检查是否正确安装了 Rust，可打开 shell 并输入下面这行,你应该看到最新发布的稳定版本的版本号、提交哈希值和提交日期:

```console
$ rustc -V
rustc 1.56.1 (59eed8a2a 2021-11-01)
```

如果你看到此信息，则说明您已成功安装 Rust！如果没看到此信息，并且你使用的是 Windows，请检查 Rust 是否在 `%PATH%` 系统变量中。如果都正确，但 `Rust` 仍然无法正常工作，那么你可以在很多地方获得帮助。最简单的是**加入Rust编程学院这个大家庭，QQ群：1009730433**.

### 本地文档

Rust 的安装还自带文档的本地副本，可以方便地离线阅读。运行 `rustup doc` 让浏览器打开本地文档。

每当遇到标准库提供的类型或函数不知道怎么用时，都可以在 API 文档中查找到！具体参加[在标准库寻找你想要的内容](../std/search.md)