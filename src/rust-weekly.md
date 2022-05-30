# Rust语言周刊
Rust语言周刊精选全世界过去一周的优秀文章、新闻、开源项目和语言动态。

本周刊由 RustCn 倾情打造，其中， `[Zh]` 标识的中文资料由 Rust 翻译计划提供，并且原始的 Markdown 文档已[全部开源](https://github.com/rustlang-cn/rustt)，欢迎大家阅读和订阅。

> RustCn：https://hirust.cn, 公众号: Rust语言中文网

# 「Rust 语言周刊」 第 14 期 · 2022-05-29
Rust语言周刊精选全世界过去一周的优秀文章、新闻、开源项目和语言动态。

本周刊由 RustCn 社区倾情打造，其中， `[Zh]` 标识的中文资料由 Rust 翻译计划提供，并且原始的 Markdown 文档已[全部开源](https://github.com/rustlang-cn/rustt)，欢迎大家阅读和订阅。

> RustCn：https://hirust.cn, 公众号: Rust语言中文网

<img src="https://pic1.zhimg.com/80/v2-cd8fc37f15c5547a0853a92a9e06c528_1440w.webp">
<h5 align="center">题图: 将 Ruby 的编译器移植到 Rust 上</h5>

#### Rust 项目

1、[IntelliJ 的 Rust 插件发布新版本](https://blog.jetbrains.com/rust/2022/05/19/what-s-new-in-intellij-rust-for-2022-1/)

Vscode 的 Rust 插件 `rust-analyzer` 已经相当牛了，但是跟 IntelliJ 依然有一定的差距。告诉大家一个小秘密，ra 之前的的核心作者其实也是 IntelliJ Rust 插件的核心开发，当然，现在 ra 在合并到官方组织后，跟以前又有所不同了。

#### 精选文章

1、[为了开发一个操作系统，我学习了 Rust 并写下 10 万行代码](https://www.bunniestudios.com/blog/?p=6375)

对于作者所在的公司来说，他们希望能清晰地掌控 OS 的每一个细节，虽说 linux 是开源的，但是它实在太大了，而其他的开源系统或多或少页无法满足他们的需求，因此需要重新手撸一个 OS。那么，在这个时间点，对于这种需求，除了 Rust 之外，还有更好的选择吗？显然没有。

2、[从零构建一个云数据库：我们为何从 C++ 迁移到 Rust](https://singularity-data.com/blog/building-a-cloud-database-from-scratch-why-we-moved-from-cpp-to-rust/)

就我个人而言，真的很羡慕国外的技术人生存环境，你能想象，国内创业公司在开发 7 个月后删除了所有的 C++ 代码，然后从零开始，使用 Rust 从头开始吗？作者所在的公司就是这样一(yi)股(duo)清(qi)流(pa)。

3、[修复 Rust 中的内存泄漏问题](https://onesignal.com/blog/solving-memory-leaks-in-rust/)

OneSignal 是一个消息服务公司，在之前将其中的一些核心服务[迁移到了 Rust 上](https://onesignal.com/blog/rust-at-onesignal/)，在此过程中，他们遇到并解决了不少问题，其中一个就是内存泄漏。

这篇文章干货多多，非常值得深入阅读！

4、[Rust 中的崩溃处理](https://jake-shadle.github.io/crash-reporting/)

不知道大家学过 Erlang 没，这门语言不仅是现代化并发编程的引路者，还是崩溃哲学的提倡者：错误不应该被隐藏，而是直接抛出来，任其崩溃，若有需要，自动重启任务协程即可(通过 gen_supervisor 统一管理)。

当然，这种特立独行的方式并不适合于所有的语言和开发者，因此 Rust 中并没有内置这套崩溃自动处理系统，而是需要我们根据自己的需求来手动处理，这篇文章就介绍了一些不错的崩溃处理方式。

5、[从 BonsaiDb 的性能问题引发的文件同步性能探究](https://bonsaidb.io/blog/durable-writes/)

数据库是非常复杂的领域，作者本来想要同时搞定中上层数据库服务和底层数据存储服务，但是在遇到了一系列问题后，现在不禁怀疑，自己实现底层数据存储服务是否是一个正确的抉择。

6、[优化 Rust 二进制文件的大小](https://kerkour.com/optimize-rust-binary-size)

这篇文章很短，只介绍了优化大小的一些途径( 其实不是很全 )，并没有对此进行深入展开，我个人其实并不想把文章列到周刊中，但是鉴于本期的内容素材并不多，只能向现实屈服了 :(

7、[使用 Github Actions 来测试和构建你的 Rust 应用](https://kerkour.com/rust-github-actions-ci-cd)

这篇文章的推荐程度同上，如果大家想要全面了解 Github Actions，可以看看 Rust 语言圣经中的[这篇章节](https://course.rs/test/ci.html)。







## 往期回顾

目前所有的周刊都按照 `年/月/日期` 的方式归纳在 [docs](./docs) 目录下，大家可以按需查看。

- [第 13 期](./docs/2022/5月/22.md)
- [第 12 期](./docs/2022/5月/16.md)
- [第 11 期](./docs/2022/5月/07.md)
- [第 10 期](./docs/2022/4月/29.md)
- [第 9 期](./docs/2022/4月/24.md)
- [第 8 期](./docs/2022/4月/15.md)
- [第 7 期](./docs/2022/4月/08.md)
- [第 6 期](./docs/2022/4月/02.md)
- [第 5 期](./docs/2022/3月/25.md)
- [第 4 期](./docs/2022/3月/18.md)
- [第 3 期](./docs/2022/3月/11.md)
- [第 2 期](./docs/2022/3月/04.md)
- [第 1 期](./docs/2022/2月/28.md)


## 怀揣劲爆消息或优质内容？
欢迎提交 `issue` 或 `PR`，我们欢迎一切有价值的内容，并且你提供的每条消息都将标注上你的 github 用户名和链接。
