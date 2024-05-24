# 使用环境变量来增强程序

在上一章节中，留下了一个悬念，该如何实现用户控制的大小写敏感，其实答案很简单，你在其它程序中肯定也遇到过不少，例如如何控制 `panic` 后的栈展开？ Rust 提供的解决方案是通过命令行参数来控制:

```shell
RUST_BACKTRACE=1 cargo run
```

与之类似，我们也可以使用环境变量来控制大小写敏感，例如:

```shell
IGNORE_CASE=1 cargo run -- to poem.txt
```

既然有了目标，那么一起来看看该如何实现吧。

## 编写大小写不敏感的测试用例

还是遵循之前的规则：测试驱动，这次是对一个新的大小写不敏感函数进行测试 `search_case_insensitive`。

还记得 TDD 的测试步骤嘛？首先编写一个注定失败的用例:

```rust,ignore,mdbook-runnable
// in src/lib.rs
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn case_sensitive() {
        let query = "duct";
        let contents = "\
Rust:
safe, fast, productive.
Pick three.
Duct tape.";

        assert_eq!(vec!["safe, fast, productive."], search(query, contents));
    }

    #[test]
    fn case_insensitive() {
        let query = "rUsT";
        let contents = "\
Rust:
safe, fast, productive.
Pick three.
Trust me.";

        assert_eq!(
            vec!["Rust:", "Trust me."],
            search_case_insensitive(query, contents)
        );
    }
}
```

可以看到，这里新增了一个 `case_insensitive` 测试用例，并对 `search_case_insensitive` 进行了测试，结果显而易见，函数都没有实现，自然会失败。

接着来实现这个大小写不敏感的搜索函数:

```rust,ignore,mdbook-runnable
pub fn search_case_insensitive<'a>(
    query: &str,
    contents: &'a str,
) -> Vec<&'a str> {
    let query = query.to_lowercase();
    let mut results = Vec::new();

    for line in contents.lines() {
        if line.to_lowercase().contains(&query) {
            results.push(line);
        }
    }

    results
}
```

跟之前一样，但是引入了一个新的方法 `to_lowercase`，它会将 `line` 转换成全小写的字符串，类似的方法在其它语言中也差不多，就不再赘述。

还要注意的是 `query` 现在是 `String` 类型，而不是之前的 `&str`，因为 `to_lowercase` 返回的是 `String`。

修改后，再来跑一次测试，看能否通过。

```shell
$ cargo test
   Compiling minigrep v0.1.0 (file:///projects/minigrep)
    Finished test [unoptimized + debuginfo] target(s) in 1.33s
     Running unittests src/lib.rs (target/debug/deps/minigrep-9cd200e5fac0fc94)

running 2 tests
test tests::case_insensitive ... ok
test tests::case_sensitive ... ok

test result: ok. 2 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

     Running unittests src/main.rs (target/debug/deps/minigrep-9cd200e5fac0fc94)

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

   Doc-tests minigrep

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

Ok，TDD 的第二步也完成了，测试通过，接下来就是最后一步，在 `run` 中调用新的搜索函数。但是在此之前，要新增一个配置项，用于控制是否开启大小写敏感。

```rust,ignore,mdbook-runnable
// in lib.rs
pub struct Config {
    pub query: String,
    pub file_path: String,
    pub ignore_case: bool,
}
```

接下来就是检查该字段，来判断是否启动大小写敏感：

```rust,ignore,mdbook-runnable
pub fn run(config: Config) -> Result<(), Box<dyn Error>> {
    let contents = fs::read_to_string(config.file_path)?;

    let results = if config.ignore_case {
        search_case_insensitive(&config.query, &contents)
    } else {
        search(&config.query, &contents)
    };

    for line in results {
        println!("{line}");
    }

    Ok(())
}
```

现在的问题来了，该如何控制这个配置项呢。这个就要借助于章节开头提到的环境变量，好在 Rust 的 `env` 包提供了相应的方法。

```rust,ignore,mdbook-runnable
use std::env;
// --snip--

impl Config {
    pub fn build(args: &[String]) -> Result<Config, &'static str> {
        if args.len() < 3 {
            return Err("not enough arguments");
        }

        let query = args[1].clone();
        let file_path = args[2].clone();

        let ignore_case = env::var("IGNORE_CASE").is_ok();

        Ok(Config {
            query,
            file_path,
            ignore_case,
        })
    }
}
```

`env::var` 没啥好说的，倒是 `is_ok` 值得说道下。该方法是 `Result` 提供的，用于检查是否有值，有就返回 `true`，没有则返回 `false`，刚好完美符合我们的使用场景，因为我们并不关心 `Ok<T>` 中具体的值。

运行下试试：

```shell
$ cargo run -- to poem.txt
   Compiling minigrep v0.1.0 (file:///projects/minigrep)
    Finished dev [unoptimized + debuginfo] target(s) in 0.0s
     Running `target/debug/minigrep to poem.txt`
Are you nobody, too?
How dreary to be somebody!
```

看起来没有问题，接下来测试下大小写不敏感:

```shell
$ IGNORE_CASE=1 cargo run -- to poem.txt
```

```shell
Are you nobody, too?
How dreary to be somebody!
To tell your name the livelong day
To an admiring bog!
```

大小写不敏感后，查询到的内容明显多了很多，也很符合我们的预期。

最后，给大家留一个小作业：同时使用命令行参数和环境变量的方式来控制大小写不敏感，其中环境变量的优先级更高，也就是两个都设置的情况下，优先使用环境变量的设置。
