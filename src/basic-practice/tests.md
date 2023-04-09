# 测试驱动开发

> 开始之前，推荐大家先了解下[如何在 Rust 中编写测试代码](https://course.rs/test/intro.html)，这块儿内容不复杂，先了解下有利于本章的继续阅读

在之前的章节中，我们完成了对项目结构的重构，并将进入逻辑代码编程的环节，但在此之前，我们需要先编写一些测试代码，也是最近颇为流行的测试驱动开发模式(TDD, Test Driven Development)：

1. 编写一个注定失败的测试，并且失败的原因和你指定的一样
2. 编写一个成功的测试
3. 编写你的逻辑代码，直到通过测试

这三个步骤将在我们的开发过程中不断循环，直到所有的代码都开发完成并成功通过所有测试。

## 注定失败的测试用例

既然要添加测试，那之前的 `println!` 语句将没有大的用处，毕竟 `println!` 存在的目的就是为了让我们看到结果是否正确，而现在测试用例将取而代之。

接下来，在 `lib.rs` 文件中，添加 `tests` 模块和 `test` 函数: 

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn one_result() {
        let query = "duct";
        let contents = "\
Rust:
safe, fast, productive.
Pick three.";

        assert_eq!(vec!["safe, fast, productive."], search(query, contents));
    }
}
```

测试用例将在指定的内容中搜索 `duct` 字符串，目测可得：其中有一行内容是包含有目标字符串的。

但目前为止，还无法运行该测试用例，更何况还想幸灾乐祸的看其失败，原因是 `search` 函数还没有实现！毕竟是测试驱动、测试先行。

```rust
// in lib.rs
pub fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
    vec![]
}
```

先添加一个简单的 `search` 函数实现，非常简单粗暴的返回一个空的数组，显而易见测试用例将成功通过，真是一个居心叵测的测试用例！

注意这里生命周期 `'a` 的使用，之前的章节有[详细介绍](https://course.rs/basic/lifetime.html#函数签名中的生命周期标注)，不太明白的同学可以回头看看。

喔，这么复杂的代码，都用上生命周期了！嘚瑟两下试试：

```shell
$ cargo test
   Compiling minigrep v0.1.0 (file:///projects/minigrep)
    Finished test [unoptimized + debuginfo] target(s) in 0.97s
     Running unittests src/lib.rs (target/debug/deps/minigrep-9cd200e5fac0fc94)

running 1 test
test tests::one_result ... FAILED

failures:

---- tests::one_result stdout ----
thread 'main' panicked at 'assertion failed: `(left == right)`
  left: `["safe, fast, productive."]`,
 right: `[]`', src/lib.rs:44:9
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace


failures:
    tests::one_result

test result: FAILED. 0 passed; 1 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

error: test failed, to rerun pass `--lib`
```

太棒了！它失败了...

## 务必成功的测试用例

接着就是测试驱动的第二步：编写注定成功的测试。当然，前提条件是实现我们的 `search` 函数。它包含以下步骤：

- 遍历迭代 `contents` 的每一行
- 检查该行内容是否包含我们的目标字符串
- 若包含，则放入返回值列表中，否则忽略
- 返回匹配到的返回值列表

### 遍历迭代每一行

Rust 提供了一个很便利的 `lines` 方法将目标字符串进行按行分割:

```rust
// in lib.rs
pub fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
    for line in contents.lines() {
        // do something with line
    }
}
```

这里的 `lines` 返回一个[迭代器](https://course.rs/advance/functional-programing/iterator.html)，关于迭代器在后续章节会详细讲解，现在只要知道 `for` 可以遍历取出迭代器中的值即可。

### 在每一行中查询目标字符串

```rust
// in lib.rs
pub fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
    for line in contents.lines() {
        if line.contains(query) {
            // do something with line
        }
    }
}
```

与之前的 `lines` 函数类似，Rust 的字符串还提供了 `contains` 方法，用于检查 `line` 是否包含待查询的 `query`。

接下来，只要返回合适的值，就可以完成 `search` 函数的编写。


### 存储匹配到的结果

简单，创建一个 `Vec` 动态数组，然后将查询到的每一个 `line` 推进数组中即可：

```rust
// in lib.rs
pub fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
    let mut results = Vec::new();

    for line in contents.lines() {
        if line.contains(query) {
            results.push(line);
        }
    }

    results
}
```

至此，`search` 函数已经完成了既定目标，为了检查功能是否正确，运行下我们之前编写的测试用例:

```shell
$ cargo test
   Compiling minigrep v0.1.0 (file:///projects/minigrep)
    Finished test [unoptimized + debuginfo] target(s) in 1.22s
     Running unittests src/lib.rs (target/debug/deps/minigrep-9cd200e5fac0fc94)

running 1 test
test tests::one_result ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

     Running unittests src/main.rs (target/debug/deps/minigrep-9cd200e5fac0fc94)

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

   Doc-tests minigrep

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

测试通过，意味着我们的代码也完美运行，接下来就是在 `run` 函数中大显身手了。

### 在 run 函数中调用 search 函数

```rust
// in src/lib.rs
pub fn run(config: Config) -> Result<(), Box<dyn Error>> {
    let contents = fs::read_to_string(config.file_path)?;

    for line in search(&config.query, &contents) {
        println!("{line}");
    }

    Ok(())
}
```

好，再运行下看看结果，看起来我们距离成功从未如此之近！

```shell
$ cargo run -- frog poem.txt
   Compiling minigrep v0.1.0 (file:///projects/minigrep)
    Finished dev [unoptimized + debuginfo] target(s) in 0.38s
     Running `target/debug/minigrep frog poem.txt`
How public, like a frog
```

酷！成功查询到包含 `frog` 的行，再来试试 `body` :

```shell
$ cargo run -- body poem.txt
   Compiling minigrep v0.1.0 (file:///projects/minigrep)
    Finished dev [unoptimized + debuginfo] target(s) in 0.0s
     Running `target/debug/minigrep body poem.txt`
I'm nobody! Who are you?
Are you nobody, too?
How dreary to be somebody!
```

完美，三行，一行不少，为了确保万无一失，再来试试查询一个不存在的单词:

```shell
cargo run -- monomorphization poem.txt
   Compiling minigrep v0.1.0 (file:///projects/minigrep)
    Finished dev [unoptimized + debuginfo] target(s) in 0.0s
     Running `target/debug/minigrep monomorphization poem.txt`
```

至此，章节开头的目标已经全部完成，接下来思考一个小问题：如果要为程序加上大小写不敏感的控制命令，由用户进行输入，该怎么实现比较好呢？毕竟在实际搜索查询中，同时支持大小写敏感和不敏感还是很重要的。

答案留待下一章节揭晓。
