# Rust 语言周刊

精选过去一周的文章、新闻、开源项目和 Rust 语言动态( 中文内容用 🇨🇳 进行标识 )，欢迎大家[订阅及查看往期回顾](https://github.com/studyrs/rust-weekly)。


## 「Rust 语言周刊」 第 7 期 · 2022-04-08
Rust 语言周刊精选过去一周的优秀文章、新闻、开源项目和 Rust 语言动态。

本周刊由 Rust 语言中文网倾情打造，其中的 [Zh] 中文资料由 Rustt 进行翻译，原始 Markdown 文档已全部开源，欢迎大家阅读和订阅。


<img src="https://pic1.zhimg.com/v2-23a24b00623e46297ea9146e648a1126_1440w.jpg?source=172ae18b">
<h5 align="center">题图: 一本生锈的书</h5>

#### Rust新闻

1、[Zh] [Rust 1.60 发布](https://course.rs/appendix/rust-versions/1.60.html)

在新版中，我们可以查看 Cargo 构建时的详细耗时了，有助于分析和改善编译时间，还有就是条件编译和依赖引入了新的期待已久的功能。

1、[Zh] [Rust 2024 官方路线图公布](https://www.163.com/dy/article/H4CMGAF50511CUMI.html)
这篇文章从比较宏观的角度讲解了 Rust 2024 的路线图。

2、[Zh] [Rust 2024：敢于要求更多](https://github.com/studyrs/Rustt/blob/main/Articles/%5B2022-03-28%5D%20Rust%202024：敢于要求更多.md)

本文是从更细节的角度出发讲解 Rust 2024 的路线图，喜欢技术细节的同学不容错过。

3、[Rust 基金会激励计划](https://foundation.rust-lang.org/news/2022-03-31-cgp-is-open-announcement/)

基金会筹划已久的开源项目激励计划终于开始实施了，里面包含了基金会合作伙伴、开源项目等一系列举措，大家快去申请了！

#### 开源项目

1、[一本生锈的书](https://github.com/studyrs/rusty-book)

这本书主要关于如何打造一个 “有锈” 的 Rust 项目。

2、[StarfishQL](https://www.sea-ql.org/SeaORM/blog/2022-04-04-introducing-starfish-ql/)

一个图数据库和查询引擎，目前主要的目的是绘制和探索 crates.io 上的包依赖网络。

3、[Coppers](https://github.com/ThijsRay/coppers)

一套测试工具，用于测量 Rust 项目的能耗情况。

#### 精选文章

1、[虚弱之塔: 每个人都应该懂的内存模型](https://gankra.github.io/blah/tower-of-weakenings/)

干货作者又出手了，这次为我们带来了内存模型的分析和改进。他甚至基于这种改进修改了 Rust 代码，并且应用在自己的部分项目上，crazy!

2、[Rust 的 Mutex 为何这样设计?](https://cliffle.com/blog/rust-mutexes/)

已经有不少人抱怨为何 Rust 的 Mutex 跟别的语言不一样，例如它可以持有数据。作者针对这些疑问给出了自己的分析，总之他站队 Rust 的设计。

3、[Zh] [在 Rust 中使用 epoll 实现非阻塞 IO](https://github.com/studyrs/Rustt/blob/main/Articles/%5B2022-03-29%5D%20在%20Rust%20中使用%20epoll%20实现基本的非阻塞%20IO.md)

本文试图解释清楚 epoll 和非阻塞 IO 背后的原理

4、[Zh] [用 Rust 写 Devops 工具](https://github.com/studyrs/Rustt/blob/main/Articles/%5B2022-04-02%5D%20用%20Rust%20写%20DevOps%20工具.md)

文章中会介绍几个 Rust 用在 DevOps 领域的案例，以及为什么使用 Rust。其中我们还会介绍一些在 AWS 上基于 Rust 的 DevOps 工具常用的库。

5、[Zh] [Rust 背后不是公司](https://github.com/studyrs/Rustt/blob/main/Articles/%5B2022-04-01%5D%20Rust%20背后并不是公司.md)
Rust 大佬带来的对 Rust 组织架构的分析。

6、[使用 Rust 改善 Python S3 客户端的性能](https://joshua-robinson.medium.com/improving-python-s3-client-performance-with-rust-e9639359072f)

Python 是数据科学的主力军语言，但是性能有的时候会成为平静下来。例如现在亚马逊 S3 存储非常火热，如果大家使用 S3 作为数据集的存储，那么 Pyhton 去读取这些数据可能就是一个很大的性能瓶颈。

7、[Qiskit 使用 Rust 来获取更好的性能](https://medium.com/qiskit/new-weve-started-using-rust-in-qiskit-for-better-performance-a3676433ca8c)

Qiskit 是一家从事量子计算的公司，最近他们 在 Python 之外还引入了 Rust 语言，事实证明，这个举措带来了显著的性能提升。

8、[ScyllaDB 将数据库驱动使用异步 Rust 重新实现](https://thenewstack.io/why-were-porting-our-database-drivers-to-async-rust/)

ScyllaDB 是这几年很火的开源分布式 KV 数据库，兼容 Cassandra 的 CQL 协议，性能非常非常高。这不，为了性能和安全性，他们又出手了，这次是使用 Rust 将客户端的驱动进行了重写( 使用 tokio )。

9、[在 2022 年使用 axum 和 yew 打造一个全栈 Rust web 服务](https://robert.kra.hn/posts/2022-04-03_rust-web-wasm/)

在过去两年，WebAssembly 在 Rust 这里发展的非常快，而且构建和打包也变得更加简单。因此，是时候使用 Rust 写一套前后端服务了。

