# 实现基本功能

无论功能设计的再怎么花里胡哨，对于一个文件查找命令而言，首先得指定文件和待查找的字符串，它们需要用户从命令行给予输入，然后我们在程序内进行读取。

## 接收命令行参数

国际惯例，先创建一个新的项目 `minigrep` ，该名字充分体现了我们的自信：就是不如 `grep`。

```shell
cargo new minigrep
     Created binary (application) `minigrep` project
$ cd minigrep
```

首先来思考下，如果要传入文件路径和待搜索的字符串，那这个命令该长啥样，我觉得大概率是这样:

```shell
cargo run -- searchstring example-filename.txt
```

`--` 告诉 `cargo` 后面的参数是给我们的程序使用的，而不是给 `cargo` 自己使用，例如 `--` 前的 `run` 就是给它用的。

接下来就是在程序中读取传入的参数，这个很简单，下面代码就可以:

```rust,ignore,mdbook-runnable
// in main.rs
use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();
    dbg!(args);
}
```

首先通过 `use` 引入标准库中的 `env` 包，然后 `env::args` 方法会读取并分析传入的命令行参数，最终通过 `collect` 方法输出一个集合类型 `Vector`。

可能有同学疑惑，为啥不直接引入 `args` ，例如 `use std::env::args` ，这样就无需 `env::args` 来繁琐调用，直接`args.collect()` 即可。原因很简单，`args` 方法只会使用一次，啰嗦就啰嗦点吧，把相同的好名字让给 `let args..` 这位大哥不好吗？毕竟人家要出场多次的。

> ### 不可信的输入
>
> 所有的用户输入都不可信！不可信！不可信！
>
> 重要的话说三遍，我们的命令行程序也是，用户会输入什么你根本就不知道，例如他输入了一个非 Unicode 字符，你能阻止吗？显然不能，但是这种输入会直接让我们的程序崩溃！
>
> 原因是当传入的命令行参数包含非 Unicode 字符时， `std::env::args` 会直接崩溃，如果有这种特殊需求，建议大家使用 `std::env::args_os`，该方法产生的数组将包含 `OsString` 类型，而不是之前的 `String` 类型，前者对于非 Unicode 字符会有更好的处理。
>
> 至于为啥我们不用，两个理由，你信哪个：1. 用户爱输入啥输入啥，反正崩溃了，他就知道自己错了 2. `args_os` 会引入额外的跨平台复杂性

`collect` 方法其实并不是`std::env`包提供的，而是迭代器自带的方法(`env::args()` 会返回一个迭代器)，它会将迭代器消费后转换成我们想要的集合类型，关于迭代器和 `collect` 的具体介绍，请参考[这里](https://course.rs/advance/functional-programing/iterator.html)。

最后，代码中使用 `dbg!` 宏来输出读取到的数组内容，来看看长啥样：

```shell
$ cargo run
   Compiling minigrep v0.1.0 (file:///projects/minigrep)
    Finished dev [unoptimized + debuginfo] target(s) in 0.61s
     Running `target/debug/minigrep`
[src/main.rs:5] args = [
    "target/debug/minigrep",
]
```

```shell
$ cargo run -- needle haystack
   Compiling minigrep v0.1.0 (file:///projects/minigrep)
    Finished dev [unoptimized + debuginfo] target(s) in 1.57s
     Running `target/debug/minigrep needle haystack`
[src/main.rs:5] args = [
    "target/debug/minigrep",
    "needle",
    "haystack",
]
```

上面两个版本分别是无参数和两个参数，其中无参数版本实际上也会读取到一个字符串，仔细看，是不是长得很像我们的程序名，Bingo! `env::args` 读取到的参数中第一个就是程序的可执行路径名。

## 存储读取到的参数

在编程中，给予清晰合理的变量名是一项基本功，咱总不能到处都是 `args[1]` 、`args[2]` 这样的糟糕代码吧。

因此我们需要两个变量来存储文件路径和待搜索的字符串:

```rust,ignore,mdbook-runnable
use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();

    let query = &args[1];
    let file_path = &args[2];

    println!("Searching for {}", query);
    println!("In file {}", file_path);
}
```

很简单的代码，来运行下:

```shell
$ cargo run -- test sample.txt
   Compiling minigrep v0.1.0 (file:///projects/minigrep)
    Finished dev [unoptimized + debuginfo] target(s) in 0.0s
     Running `target/debug/minigrep test sample.txt`
Searching for test
In file sample.txt
```

输出结果很清晰的说明了我们的目标：在文件 `sample.txt` 中搜索包含 `test` 字符串的内容。

事实上，就算作为一个简单的程序，它也太过于简单了，例如用户不提供任何参数怎么办？因此，错误处理显然是不可少的，但是在添加之前，先来看看如何读取文件内容。

## 文件读取

既然读取文件，那么首先我们需要创建一个文件并给予一些内容，来首诗歌如何？"我啥也不是，你呢?"

```text
I'm nobody! Who are you?
我啥也不是，你呢？
Are you nobody, too?
牛逼如你也是无名之辈吗？
Then there's a pair of us - don't tell!
那我们就是天生一对，嘘！别说话！
They'd banish us, you know.
你知道，我们不属于这里。
How dreary to be somebody!
因为这里属于没劲的大人物！
How public, like a frog
他们就像青蛙一样呱噪，
To tell your name the livelong day
成天将自己的大名
To an admiring bog!
传遍整个无聊的沼泽！
```

在项目根目录创建 `poem.txt` 文件，并写入如上的优美诗歌(可能翻译的很烂，别打我，哈哈，事实上大家写入英文内容就够了)。

接下来修改 `main.rs` 来读取文件内容：

```rust,ignore,mdbook-runnable
use std::env;
use std::fs;

fn main() {
    // --省略之前的内容--
    println!("In file {}", file_path);

    let contents = fs::read_to_string(file_path)
        .expect("Should have been able to read the file");

    println!("With text:\n{contents}");
}
```

首先，通过 `use std::fs` 引入文件操作包，然后通过 `fs::read_to_string` 读取指定的文件内容，最后返回的 `contents` 是 `std::io::Result<String>` 类型。

运行下试试，这里无需输入第二个参数，因为我们还没有实现查询功能:

```shell
$ cargo run -- the poem.txt
   Compiling minigrep v0.1.0 (file:///projects/minigrep)
    Finished dev [unoptimized + debuginfo] target(s) in 0.0s
     Running `target/debug/minigrep the poem.txt`
Searching for the
In file poem.txt
With text:
I'm nobody! Who are you?
Are you nobody, too?
Then there's a pair of us - don't tell!
They'd banish us, you know.

How dreary to be somebody!
How public, like a frog
To tell your name the livelong day
To an admiring bog!
```

完美，虽然代码还有很多瑕疵，例如所有内容都在 `main` 函数，这个不符合软件工程，没有错误处理，功能不完善等。不过没关系，万事开头难，好歹我们成功迈开了第一步。

好了，是时候重构赚波 KPI 了，读者：are you serious? 这就开始重构了？
