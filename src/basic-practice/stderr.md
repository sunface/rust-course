# 重定向错误信息的输出

迄今为止，所有的输出信息，无论 debug 还是 error 类型，都是通过 `println!` 宏输出到终端的标准输出( `stdout` )，但是对于程序来说，错误信息更适合输出到标准错误输出(stderr)。

这样修改后，用户就可以选择将普通的日志类信息输出到日志文件 1，然后将错误信息输出到日志文件 2，甚至还可以输出到终端命令行。

## 目前的错误输出位置

我们先来观察下，目前的输出信息包括错误，是否是如上面所说，都写到标准错误输出。

测试方式很简单，将标准错误输出的内容重定向到文件中，看看是否包含故意生成的错误信息即可。

```shell
$ cargo run > output.txt
```

首先，这里的运行没有带任何参数，因此会报出类如文件不存在的错误，其次，通过 `>` 操作符，标准输出上的内容被重定向到文件 `output.txt` 中，不再打印到控制上。

大家先观察下控制台，然后再看看 `output.txt`，是否发现如下的错误信息已经如期被写入到文件中？

```shell
Problem parsing arguments: not enough arguments
```

所以，可以得出一个结论，如果错信息输出到标准输出，那么它们将跟普通的日志信息混在一起，难以分辨，因此我们需要将错误信息进行单独输出。


## 标准错误输出 stderr

将错误信息重定向到 `stderr` 很简单，只需在打印错误的地方，将 `println!` 宏替换为 `eprintln!`即可。

```rust
fn main() {
    let args: Vec<String> = env::args().collect();

    let config = Config::build(&args).unwrap_or_else(|err| {
        eprintln!("Problem parsing arguments: {err}");
        process::exit(1);
    });

    if let Err(e) = minigrep::run(config) {
        eprintln!("Application error: {e}");
        process::exit(1);
    }
}
```

接下来，还是同样的运行命令：
```shell
$ cargo run > output.txt
Problem parsing arguments: not enough arguments
```

可以看到，日志信息成功的重定向到 `output.txt` 文件中，而错误信息由于 `eprintln!` 的使用，被写入到标准错误输出中，默认还是输出在控制台中。

再来试试没有错误的情况:

```shell
$ cargo run -- to poem.txt > output.txt
```

这次运行参数很正确，因此也没有任何错误信息产生，同时由于我们重定向了标准输出，因此相应的输出日志会写入到 `output.txt` 中，打开可以看到如下内容：

```shell
Are you nobody, too?
How dreary to be somebody!
```

至此，简易搜索程序 `minigrep` 已经基本完成，下一章节将使用迭代器进行部分改进，请大家在看完[迭代器章节](https://course.rs/advance/functional-programing/iterator.html)后，再回头阅读。