# 参数解析

## Clap
下面的程序给出了使用 `clap` 来解析命令行参数的样式结构，如果大家想了解更多，在 `clap` [文档](https://docs.rs/clap/)中还给出了另外两种初始化一个应用的方式。

在下面的构建中，`value_of` 将获取通过 `with_name` 解析出的值。`short` 和 `long` 用于设置用户输入的长短命令格式，例如短命令 `-f` 和长命令 `--file`。

```rust,editable
use clap::{Arg, App};

fn main() {
    let matches = App::new("My Test Program")
        .version("0.1.0")
        .author("Hackerman Jones <hckrmnjones@hack.gov>")
        .about("Teaches argument parsing")
        .arg(Arg::with_name("file")
                 .short("f")
                 .long("file")
                 .takes_value(true)
                 .help("A cool file"))
        .arg(Arg::with_name("num")
                 .short("n")
                 .long("number")
                 .takes_value(true)
                 .help("Five less than your favorite number"))
        .get_matches();

    let myfile = matches.value_of("file").unwrap_or("input.txt");
    println!("The file passed is: {}", myfile);

    let num_str = matches.value_of("num");
    match num_str {
        None => println!("No idea what your favorite number is."),
        Some(s) => {
            match s.parse::<i32>() {
                Ok(n) => println!("Your favorite number must be {}.", n + 5),
                Err(_) => println!("That's not a number! {}", s),
            }
        }
    }
}
```

`clap` 针对上面提供的构建样式，会自动帮我们生成相应的使用方式说明。例如，上面代码生成的使用说明如下：
```shell
My Test Program 0.1.0
Hackerman Jones <hckrmnjones@hack.gov>
Teaches argument parsing

USAGE:
    testing [OPTIONS]

FLAGS:
    -h, --help       Prints help information
    -V, --version    Prints version information

OPTIONS:
    -f, --file <file>     A cool file
    -n, --number <num>    Five less than your favorite number
```

最后，再使用一些参数来运行下我们的代码:
```shell
$ cargo run -- -f myfile.txt -n 251
The file passed is: myfile.txt
Your favorite number must be 256.
```

## Structopt
@todo