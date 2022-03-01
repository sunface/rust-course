# rustlings-zh 🦀❤️
本项目是 [rustlings](https://github.com/rust-lang/rustlings) 的中文翻译版。
   
## 开始使用

_注意: 如果你在使用 macOS，确保已经安装了 Xcode 以及相应的开发者工具 `xcode-select --install`._

同时，你也需要安装Rust，具体参见<<精通Rust编程>>一书或者访问https://rustup.rs。

### 手动安装
Clone该项目，然后运行`cargo install`.

```bash
git clone https://github.com/sunface/rust-course
cd rustlings-zh
cargo install --force --path .
```

如果有安装错误，请先升级rust工具链
```bash
rustup update
```

然后, 运行`rustlings`来启动.

## 使用方式

练习题是按照专题(topic)来排序的，具体可以在`/exercises/<topic>`下找到。

完成练习的方式其实挺简单的，大多数可以通过修改代码、通过编译的方式来完成。还有些练习需要让你编写代码来通过测试，总之目标是比较简单的：让它运行起来。

我们强烈建议你按照推荐的顺序来做练习题，在终端执行：

```bash
rustlings watch
```
该命令会在预先定义的顺序下，来呈现练习题，同时，在你修改了`exercises/`下的任何一处代码并保存后，都会触发一次重新编译运行，因此无需再手动去编译运行。当然你也可以通过以下命令来只运行一次：

```bash
rustlings verify
```

和watch做的事情基本一致，但是在运行后会自动退出。

如果想要指定运行一个练习题，可以运行：

```bash
rustlings run myExercise1
```

或者也可以运行下一个未完成的练习

```bash
rustlings run next
```

一旦你遇到解决不了的问题，可以运行下面的命令来获得帮助提示：

``` bash
rustlings hint myExercise1
```

你也可以直接对下一道未解决的问题获取帮助提示:

``` bash
rustlings hint next
```

想要查看目前的学习进度:
```bash
rustlings list
```

## Testing yourself
在每完成几个专题后，会有一个 quiz 测验，这个测验是对这些内容的综合测试，可以在`exercises/quizN.rs`下找到


## Uninstalling rustlings

从系统中移除 rustlings 需要两个步骤。首先，移除已经安装的练习题文件夹：

``` bash
rm -rf rustlings # 或者你的自定义文件夹
```

其次，因为 rustlings 是通过`cargo install`安装的，所以你可以通过`cargo uninstall rustlings`来移除 `rustlings` 这个可执行二进制文件:

``` bash
cargo uninstall rustlings
```

最后...没有最后了，恭喜你，已经卸载完成。



