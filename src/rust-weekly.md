# 「Rust 语言周刊」 第 10 期 · 2022-04-29
Rust语言周刊精选全世界过去一周的优秀文章、新闻、开源项目和语言动态。

本周刊由 RustCn 社区倾情打造，其中， `[Zh]` 标识的中文资料由 Rust 翻译计划提供，并且原始的 Markdown 文档已[全部开源](https://github.com/rustlang-cn/rustt)，欢迎大家阅读和订阅。

> RustCn：https://hirust.cn, 公众号: Rust语言中文网

<img src="https://pica.zhimg.com/80/v2-03ba9143032c8bcef9fd38b195dfaa21_1440w.png">
<h5 align="center">题图: Robyn</h5>

#### Rust新闻

1、[Rust 库团队的愿景](https://blog.rust-lang.org/inside-rust/2022/04/20/libs-aspirations.html)

最近，Rust 语言发布了 [2024 年展望](https://zhuanlan.zhihu.com/p/490221490)，编译器团队也发布了 [2022年 野望](https://blog.rust-lang.org/inside-rust/2022/02/22/compiler-team-ambitions-2022.html)，现在库团队也不甘落后，为我们带了了未来的库规划和生态发展愿景。

#### 开源项目

1、[Robyn: 一个全新的 Python Web 框架](https://www.sanskar.me/hello_robyn.html)

大家会不会以为自己走错片场了？:D 其实没有，因为这个框架是基于 Rust 运行时实现的，在提供了高性能、高吞吐的同时，又能使用 Python 来愉快地写逻辑代码。


|Total Time(seconds) |	Slowest(seconds) |	Fastest(seconds)|	Average(seconds)	 |Requests/sec |
| --- | --- | --- | --- | --- |
| Flask(Gunicorn) |	5.5254 |	0.0784 |	0.0028 |	0.0275 |	1809.8082
|FastAPI(API) |	4.1314 |	0.0733 |	0.0027 |	0.0206 |	2420.4851
|Django(Gunicorn)	| 13.5070 |	0.3635 |	0.0249 |	0.0674 |	740.3558
|Robyn(1 process and 1 worker) |	1.8324 |	0.0269 |	0.0024 |	0.0091 |	5457.2339
|Robyn(5 processes and 5 workers)	| 1.5592 |	0.0211 |	0.0017 |	0.0078 |	6413.6480

2、[Gitoxide: 一个使用 Rust 实现的 Git 命令](https://github.com/Byron/gitoxide/discussions/398)

它不仅拥有丰富的仓库信息展示，还能在 1 秒内克隆下来 linux 内核代码，它的作者还是一个生活在西安的外国人，它...名字好难记。

3、[czkawka: 从计算机中移除无需的文件](https://github.com/qarmin/czkawka)

大家不要问我项目名该怎么读，我也不会。但是这个项目还是挺有用的，可以在你的计算机中找出重复的文件、空目录、相似的图片等等。


#### 精选文章

1、[Zh] [基于 RocksDB 使用 Rust 构建关系型数据库](https://github.com/rustlang-cn/Rustt/blob/main/Articles/%5B2022-04-15%5D%20基于RocksDB使用Rust构建关系型数据库.md)

现在很多新的数据库底层都是基于 RocksDB 来实现的，作者的 `rrrdb` 亦是如此，从名称也能看出，这个项目不是一个很正式的关系型数据库，但是不妨碍我们去了解下作者的一些构思和实现。

2、[Zh] [使用 Tokio 处理 CPU 密集型任务](https://github.com/rustlang-cn/Rustt/blob/main/Articles/%5B2022-04-20%5D%20使用%20Tokio%20处理%20CPU%20密集型任务.md)

众所周知，tokio 是一个异步 IO 库，众所周知知，异步 IO 特别适合网络编程，并不是很适合 CPU 密集的场景，且看作者如何化腐朽为神奇。

3、[假设 Rust 目前还是一门相当不完美的语言，我们该怎么改进它？](https://kerkour.com/what-a-better-rust-would-look-like)

最近，又双叒叕出了一门新的编程语言：[Hare](https://harelang.org)，语法看上去很像 Rust，作者不禁开始思考，人们为啥去创建一门像是 Rust 的新语言，答案可能就藏在文章的标题中。

4、[间接所有权、浅借用和自引用数据结构](https://yoyo-code.com/indirect-ownership-and-self-borrow/)

什么？有读者震惊了，为啥这几个概念我都没有听说过？不要慌，其实就是一篇讲解自引用数据结构的文章，例如下面这个结构体：
```rust
struct ParsedFile {
  contents: Vec<u8>,
  // words中包含的项引用了 `contents` 中的数据
  words: Vec<&'self:contents:indirect [u8]>
}
```

5、[Rust 中的特征和依赖注入](https://jmmv.dev/2022/04/rust-traits-and-dependency-injection.html)

在现代化编程中，依赖注入不说是 superstar，至少也是一颗 star，它可以大幅简化模块化编程和代码可测试性的难度。本文将从特征出发，来看看在 Rust 中该如何实现 DI(dependency injection)。

6、[Rust 中的原生标识符](https://inspektor.cloud/blog/raw-identifier-in-rust/)

不要被标题误导，这篇文章简而言之，就是教大家如果使用 Rust 的预留关键字作为自己的变量或字段名。

7、[AsRef 中藏有的魔法](https://swatinem.de/blog/magic-asref/)

一般的开发场景中，不太用得到 AsRef，但是如果你和作者一样，从事词法分析相关的开发(或其它类型的数据场景)，就值得深入了解下了。

8、[在四周内构建一个无服务架构平台](https://www.shuttle.rs/blog/2022/04/22/dev-log-0)

假如你发现了一个潜在的商机，想要给投资人证明这一点，时间很紧迫，只有四周，你会怎么办？

