# Rust Exercise 🦀❤️
Rust练习题，是Rust学习教程的第二步，请在完成[第一步](https://mastery.rs)后，再来做题。

本项目从[rustling](https://github.com/rust-lang/rustlings)fork而来，主要有以下改变：
1. 翻译成中文
2. 为<<精通Rust编程>>一书提供相应的配套练习题

## 开始使用

_注意: 如果你在使用MacOS，确保已经安装了Xcode以及相应的开发者工具 `xcode-select --install`._

同时，你也需要安装Rust，具体参见<<精通Rust编程>>一书或者访问https://rustup.rs。

### 手动安装
Clone该项目，然后运行`cargo install`.

```bash
git clone https://github.com/rustcm/rustex
cd exercise
cargo install --force --path .
```

如果有安装错误，请先升级rust工具链
```bash
rustup update
```

然后, 运行`rustex`来启动.

## 使用方式

练习题是按照专题(topic)来排序的，具体可以在`/exercises/<topic>`下找到。

完成练习的方式其实挺简单的，大多数可以通过修改代码、通过编译的方式来完成。还有些练习需要让你编写代码来通过测试，总之目标是比较简单的：让它运行起来。

我们强烈建议你按照推荐的顺序来做练习题，在终端执行：

```bash
rustex watch
```
该命令会在预先定义的顺序下，来呈现练习题，同时，在你修改了`exercises/`下的任何一处代码并保存后，都会触发一次重新编译运行，因此无需再手动去编译运行。当然你也可以通过以下命令来只运行一次：

```bash
rustex verify
```

和watch做的事情基本一致，但是在运行后会自动退出。

如果想要指定运行一个练习题，可以运行：

```bash
rustex run myExercise1
```

或者也可以运行下一个未完成的练习

```bash
rustex run next
```

一旦你遇到解决不了的问题，可以运行下面的命令来获得帮助提示：

``` bash
rustex hint myExercise1
```

你也可以直接对下一道未解决的问题获取帮助提示:

``` bash
rustex hint next
```

想要查看目前的学习进度:
```bash
rustex list
```

## Testing yourself
在每完成几个专题后，会有一个quiz测验，这个测验是对这些内容的综合测试，可以在`exercises/quizN.rs`下找到


## Uninstalling rustex

从系统中移除rustex需要两个步骤。首先，移除已经安装的练习题文件夹：

``` bash
rm -rf rustex # 或者你的自定义文件夹
```

其次，因为rustex是通过`cargo install`安装的，所以你可以通过`cargo uninstall rustex`来移除`rustex`这个可执行二进制文件:

``` bash
cargo uninstall rustex
```

最后...没有最后了，恭喜你，已经卸载完成。

## 写在最后
rustex目前也只是开始，远远没有达到完成的地步，欢迎大家来贡献自己的力量，一起为这个项目添砖加瓦，未中国Rust的快速发展贡献自己的力量。


## Contributing

参见[CONTRIBUTING.md](./CONTRIBUTING.md).

## Contributors ✨
1. 致敬英文版的练习项目[rustling](https://github.com/rust-lang/rustlings)
2. [Sunface](https://im.dev)

