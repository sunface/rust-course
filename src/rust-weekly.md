# Rust 语言周刊

精选过去一周的文章、新闻、开源项目和 Rust 语言动态( 中文内容用 🇨🇳 进行标识 )，欢迎大家[订阅及查看往期回顾](https://github.com/studyrs/rust-weekly)。


## 「Rust 语言周刊」 第 6 期 · 2022-04-02

<img src="https://pica.zhimg.com/80/v2-23889bd3869ac6736256ac51ae4975d3_1440w.jpg">
<h5 align="center">题图: Rust 嵌入式开发</h5>

#### 精选文章

1、 [Zh] [敢于要求更多 Rust 2024](https://github.com/studyrs/Rustt/blob/main/Articles/%5B2022-03-28%5D%20Rust%202024：敢于要求更多.md) - 翻译 [YuKun Liu](https://github.com/mrxiaozhuox)

未来几年的 Rust 和社区应该怎么发展，可以简单总结为：敢于要求更多。

2、[Zh] [Rust 嵌入式开发](https://github.com/studyrs/Rustt/blob/main/Articles/%5B2022-03-26%5D%20Rust%20嵌入式开发.md)  - 翻译 [Xiaobin.Liu](https://github.com/lxbwolf)

本文展示了一些适用于嵌入式 Rust 的特性，总之, Rust 的高性能、高可靠和生产效率都非常适用于嵌入式系统。

3、[dyn*: 尝试将 dyn 变成定长类型](https://smallcultfollowing.com/babysteps/blog/2022/03/29/dyn-can-we-make-dyn-sized/)

三人行必能干翻诸葛亮，这不，作者和两个朋友在一次深入讨论后，突然诞生了这个奇妙的想法，最后还提交给了 Rust Team。作者还认为，一旦成功，那 `dyn Trait` 将更加好用、易用。

4、[自修改代码](https://matklad.github.io/2022/03/26/self-modifying-code.html)

对于 JIT 类似的动态机器码修改技术，大家应该都比较熟悉了，但是 Rust 中并没有。因此，作者想要通过一个简单的方法来替代宏去生成源代码。

5、[异步解构器、异步泛型和完成式期约](https://sabrinajewson.org/blog/async-drop)

本文的主要目标是为 Rust 设计一个系统以支持异步解构器( asynchronous destructors )。长文预警！

6、[何时不应该使用 Rust](https://kerkour.com/why-not-rust)

不出所料，文章内给出了快速原型设计的答案。短文预警！

7、[Rust 交叉编译](https://kerkour.com/rust-cross-compilation)

黑帽 Rust 作者又出手了，这次为我们带来关于交叉编译的优质内容。

8、[小而美的 Rust Docker 镜像](https://azzamsa.com/n/rust-docker/)

文章用 Rocket 框架写了一个 demo，然后将其打包成 Docker 镜像，最后的大小仅仅是 `8.38MB`，但... 算了，不剧透了，大家还是自己探索吧。

9、[Book] [High Assurance Rust](https://highassurance.rs)

由于我自己是开源书作者，因此对开源书有一种特别的偏爱。这本书主要关于如何开发高可靠、安全的软件服务，当然，书中还有一些计算机原理和架构设计的讲解。

10、[Video] [Rust for Linux](https://www.youtube.com/watch?v=fVEeqo40IyQ)

本视频将讲解目前 Linux 的 kernel 中，Rust 将扮演什么角色以及未来规划。

#### 开源项目

1、[生成你的 Github Profile](https://github.com/autarch/autarch)

灵感来自于作者在简历中看到别人的炫酷 Github 个人首页展示，还写了[一篇文章](https://blog.urth.org/2022/03/28/yet-another-github-profile-generator/)。


2、[fp-bindgen: 为全栈 WASM 插件生成相应的 binding](https://fiberplane.dev/blog/announcing-fp-bindgen/)

全栈 WASM 插件是可以同时用在客户端和服务端的插件，而 `fp-bindgen` 让插件的创作变得更加简单，不仅如此，还提供了工具可以让它们在服务器上运行( hosting )。

3、[BonsaiDB v0.4.0](https://bonsaidb.io/blog/bonsaidb-v0-4-0/)

`BonsaiDB` 的目标是打造一个使用者友好的数据库，拥有大量常用的数据结构。但是之前的版本只支持异步 API，这个缺陷在新版本中得到了解决。


