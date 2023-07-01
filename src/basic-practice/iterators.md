# 使用迭代器来改进我们的程序

> 本章节是可选内容，请大家在看完[迭代器章节](https://course.rs/advance/functional-programing/iterator.html)后，再来阅读


在之前的 `minigrep` 中，功能虽然已经 ok，但是一些细节上还值得打磨下，下面一起看看如何使用迭代器来改进 `Config::build` 和 `serach` 的实现。

## 移除 `clone` 的使用

虽然之前有讲过为什么这里可以使用 `clone`，但是也许总有同学心有芥蒂，毕竟程序员嘛，都希望代码处处完美，而不是丑陋的处处妥协。

```rust
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

之前的代码大致长这样，两行 `clone` 着实有点啰嗦，好在，在学习完迭代器后，我们知道了 `build` 函数实际上可以**直接拿走迭代器的所有权**，而不是去借用一个数组切片 `&[String]`。

这里先不给出代码，下面统一给出。

## 直接使用返回的迭代器

在之前的实现中，我们的 `args` 是一个动态数组:

```rust
fn main() {
    let args: Vec<String> = env::args().collect();

    let config = Config::build(&args).unwrap_or_else(|err| {
        eprintln!("Problem parsing arguments: {err}");
        process::exit(1);
    });

    // --snip--
}
```

当时还提到了 `collect` 方法的使用，相信大家学完迭代器后，对这个方法会有更加深入的认识。

现在呢，无需数组了，直接传入迭代器即可：

```rust
fn main() {
    let config = Config::build(env::args()).unwrap_or_else(|err| {
        eprintln!("Problem parsing arguments: {err}");
        process::exit(1);
    });

    // --snip--
}
```

如上所示，我们甚至省去了一行代码，原因是 `env::args` 可以直接返回一个迭代器，再作为 `Config::build` 的参数传入，下面再来改写 `build` 方法。


```rust
impl Config {
    pub fn build(
        mut args: impl Iterator<Item = String>,
    ) -> Result<Config, &'static str> {
        // --snip--
```

为了可读性和更好的通用性，这里的 `args` 类型并没有使用本身的 `std::env::Args` ，而是使用了特征约束的方式来描述 `impl Iterator<Item = String>`，这样意味着 `arg` 可以是任何实现了 `String` 迭代器的类型。

还有一点值得注意，由于迭代器的所有权已经转移到 `build` 内，因此可以直接对其进行修改，这里加上了 `mut` 关键字。

## 移除数组索引的使用

数组索引会越界，为了安全性和简洁性，使用 `Iterator` 特征自带的 `next` 方法是一个更好的选择:

```rust
impl Config {
    pub fn build(
        mut args: impl Iterator<Item = String>,
    ) -> Result<Config, &'static str> {
        // 第一个参数是程序名，由于无需使用，因此这里直接空调用一次
        args.next();

        let query = match args.next() {
            Some(arg) => arg,
            None => return Err("Didn't get a query string"),
        };

        let file_path = match args.next() {
            Some(arg) => arg,
            None => return Err("Didn't get a file path"),
        };

        let ignore_case = env::var("IGNORE_CASE").is_ok();

        Ok(Config {
            query,
            file_path,
            ignore_case,
        })
    }
}
```

喔，上面使用了迭代器和模式匹配的代码，看上去是不是很 Rust？我想我们已经走在了正确的道路上。


## 使用迭代器适配器让代码更简洁

为了帮大家更好的回忆和对比，之前的 `search` 长这样：

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

引入了迭代器后，就连古板的 `search` 函数也可以变得更 rusty 些:

```rust
pub fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
    contents
        .lines()
        .filter(|line| line.contains(query))
        .collect()
}
```

Rock，让我们的函数编程 Style rock 起来，这种一行到底的写法有时真的让人沉迷。


## 总结

至此，整个大章节全部结束，本章没有试图覆盖已学的方方面面( 也许未来会 )，而是聚焦于 Rust 的一些核心知识：所有权、生命周期、借用、模式匹配等等。

强烈推荐大家忘记已有的一切，自己重新实现一遍 `minigrep`，甚至可以根据自己的想法和喜好，来完善一些，也欢迎在评论中附上自己的练习项目，供其它人学习参考( 提个小建议，项目主页写清楚新增的功能、亮点等 )。

从下一章开始，我们将正式开始 Rust 进阶学习，请深呼吸一口，然后问自己：你..准备好了吗？
