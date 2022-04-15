# 「Rust 语言周刊」 第 8 期 · 2022-04-15
Rust语言周刊精选全世界过去一周的优秀文章、新闻、开源项目和语言动态。

本周刊由 Rust 语言中文网倾情打造，其中的 `[Zh]` 标识的中文资料由 Rust 翻译计划提供，并且原始的 Markdown 文档已[全部开源](https://github.com/rustlang-cn/rustt)，欢迎大家阅读和订阅。

> 官方网址：https://cnru.st, 公众号: Rust语言中文网

<img src="https://pic3.zhimg.com/80/v2-c0bc94b659686e9aa955363c492f9951_1440w.png">
<h5 align="center">题图: 开发 DNS 客户端过程中的笑与泪</h5>

#### Rust新闻

1、[Zh] [Rust 1.60 发布](https://course.rs/appendix/rust-versions/1.60.html)

在新版中，我们可以查看 Cargo 构建时的详细耗时了，有助于分析和改善编译时间，还有就是条件编译和依赖引入了新的期待已久的功能。

2、[rust-analyzer 正式加入官方组织](https://www.reddit.com/r/rust/comments/u2nm0y/rustanalyzer_is_now_official_github_repo_moved_to/)

优秀的产品很难被埋没，`rust-analyzer` 就是如此，这不，现在已经正式成为了官方项目，并且很快会替代 `rls` 成为 VSCode上的默认首选插件，新人有福了。


#### 精选文章

1、[Zh] [Rust 的 unsafe 指针，到底怎么了？](https://github.com/rustlang-cn/Rustt/blob/main/Articles/%5B2022-04-07%5D%20Rust%20的%20unsafe%20指针类型需要大修.md)

本文由 `Nomicon` 和 `Too Many Lists` 作者编写，大佬对 Rust 现有的裸指针进行了深入剖析，并给出了相应的解决方案，干货满满!

2、[Zh] [理解 Rust 的借用检查器](https://github.com/rustlang-cn/Rustt/blob/main/Articles/%5B2022-04-07%5D%20理解%20Rust%20的借用检查器.md)

每当你心潮澎湃想要写一些 Rust 代码时，可能最后都会败给借用检查器。

3、[Zh] [使用 Rust 构建自己的区块链平台](https://github.com/rustlang-cn/Rustt/blob/main/Articles/%5B2022-04-07%5D%20使用%20Rust%20和%20Substrate%20构建自己的区块链平台.md)

本文将基于著名的 [Substrate](https://substrate.io) 区块链框架来构建一个区块链平台：一个博客后端，用户可以在此提交博客文章、发表评论等。

4、[Zh] [由 Java/C#/C/C++ 开发者转为 Rustacean](https://github.com/rustlang-cn/Rustt/blob/main/Articles/%5B2022-04-02%5D%20由%20Java:C%23:C:C%2B%2B%20开发者转为%20Rustacean.md)

从题目能看出，作者是一个爱秀肌肉的多面手，对了，他还在写一本生命周期的书，值得期待！

5、[开发 DNS 客户端过程中的笑与泪](https://blog.adamchalmers.com/making-a-dns-client/)

看看下面这张图，你是否被勾引起开发一个 DNS 客户端的兴趣？反正作者是的。

<img src="https://pic3.zhimg.com/80/v2-c0bc94b659686e9aa955363c492f9951_1440w.png" />

6、[生命苦短，我选择与编译检查搏斗？](https://kerkour.com/life-is-short-rust-borrow-checker)

本文很短，短到令人震惊，但是确实很好的吐槽了为了对付 Rust 编译检查，我们需要付出的努力。

7、[默认值和类型推断：使用表达式来替代类型](https://gankra.github.io/blah/defaults-affect-inference/)

你是否注意过 Rust 中的集合类型存在一些奇怪的约束条件？这种奇怪已经存在很久了，甚至在 1.0 版本前就有，本文试图解释下相关的问题并且尝试使用一种新的方法去解决。

8、[隐性约束和完美派生](https://smallcultfollowing.com/babysteps/blog/2022/04/12/implied-bounds-and-perfect-derive/)

在 Rust 社区中，有两个问题已经被讨论很久了：完美派生以及可扩展的隐性约束，但是最近，Rust 团队在实现它们时遇到了一些问题，一起来看看。


9、[系列] [指针很复杂 III](https://www.ralfj.de/blog/2022/04/11/provenance-exposed.html)

作者目前的工作需要处理 Rust/MIR 的内存模型，因此会触及到普通开发不太熟悉的领域，系列的文章第一篇见[这里](https://www.ralfj.de/blog/2018/07/24/pointers-and-bytes.html)。

10、[使用 Rust 构建爬虫](https://kerkour.com/rust-crawler-associated-types)

本文节选自 `Black Hat Rust`，在文中，作者清晰的解释了 `scraper` 和 `crawler` 的区别，以及介绍了 Rust 为何非常适合爬虫的原因。


#### 开源项目

1、[fdb - 基于 Tokio 的 FoundationDB 客户端驱动](https://github.com/fdb-rs/fdb)

FoundationDB 于数年前被苹果收购，并且服务于生产环境多年，是一个非常可靠、非常非常有特色的分布式数据库。

2、[ogma - 用于处理表格化数据的脚本语言](https://github.com/kdr-aus/ogma)

<img src="https://github.com/kdr-aus/ogma/raw/main/docs/assets/common-cmds.filter.gif?raw=true" />
