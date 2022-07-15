# 「Rust 语言周刊」 第 17 期 · 2022-07-15
Rust语言周刊精选全世界过去一周(或者几周)的优秀文章、新闻、开源项目和语言动态。

本周刊由 RustCn 倾情打造，其中， `[Zh]` 标识的中文资料由 Rust 翻译计划提供，并且原始的 Markdown 文档已[全部开源](https://github.com/rustlang-cn/rustt)，欢迎大家阅读和订阅。

> RustCn：https://hirust.cn, 公众号: Rust语言中文网

<img src="https://pica.zhimg.com/80/v2-2826dfca738cdc1795e77d12eb269906_1440w.png">
<h5 align="center">题图: Tauri 发布 1.0 版本</h5>


## 官方新闻

1、[Zh] [Rust 发布 1.62 版本](https://course.rs/appendix/rust-versions/1.62.html)

如果大家期待 Rust 像其它语言一样，每一个新版本都带来大量新特性，那你们可要失望了，1.62 的更新内容相当少，甚至不如某些语言一个 minor 版本的更新力度，但**错不在 Rust**，建议大家了解下 Rust 的[版本发布流程](https://course.rs/appendix/rust-version.html)，就明白其中的弯弯绕绕了。

## 开源项目

1、[基于 Rust 的操作系统训练营](https://github.com/LearningOS/rust-based-os-comp2022)

该训练营有一个配套教程，将带大家从零开始使用 Rust 编写 RISC-V 架构的 类 Unix 内核 。

我自己也做开源，深知这件事会占用多少的时间和精力，甚至还会遭人非议，而我仅仅是写写书，跟作者这种大佬一比，差距就太大了... Respect!

2、[Tauri 发布 1.0 版本](https://tauri.app/blog/tauri_1_0/)

虽然 Tauri 很有名，但是为防有同学不知道背景，还是简单介绍下：它是一款跨平台的桌面应用开发框架，虽然内核是使用 Rust 开发，但是开发者可以使用自己喜欢的前端框架( `react`, `vue`, `vite` )来构建自己的用户界面，最终编译生成一个可执行的二进制文件，方便在各个不同的操作系统间分发运行。总之，你可以将 Tauri 当作是理念更先进的 Electron.js 。

言归正传，在历经 1 年多的时间后，Tauri 终于发布了 1.0 版本，这也标志着它已经可以在生产环境正式使用，并且目前来看，官方文档还算可以，甚至还提供了[中文文档](https://tauri.app/zh/v1/guides/getting-started/prerequisites)，除此之外，我还发现了一个[宝藏教学系列](https://zhuanlan.zhihu.com/p/539708101)，值得一读。

3、[lettre 发布 0.1.0 版本](https://lettre.rs/post/lettre-0-10/)

`lettre` 是一个现代化的邮件发送库，它简单易用、安全可靠，但是需要注意，它的目标**不是支持所有的邮件 RFC 标准**，因此在你有特殊需求时，可能会需要自己动手，丰衣足食。

该库目前已被多个项目使用，包括大名鼎鼎的 `crates.io`。 

4、[workers-rs: 使用 Rust + WebAssembly 实现 Cloudflare 的 Workers](https://github.com/cloudflare/workers-rs)

Cloudflare 已经成为全世界最大的 DNS 服务商，而且它的业务不仅仅是 DNS，目前云计算方面也进行的如火如荼。CF 最大的优势不仅仅在于 DNS 的快速和稳定，还在于它提供了多种方式来扩展你的 DNS 使用，例如你可以使用 Rust 来变成它的 worker。

为了便于有需要的同学进一步学习该如何使用，这里还有一篇[实战文章](https://logankeenan.com/posts/running-a-rust-server-in-a-cloudflare-worker/)，值得一看。


## 精选文章

1、[过程宏揭秘 II](https://blog.jetbrains.com/rust/2022/07/07/procedural-macros-under-the-hood-part-ii/)

想要了解过程宏是如何编译、怎么跟 IDE 互动的吗？来看看这个系列的文章，作者来自 Intellij Rust 插件开发组，之前还给 RustCon 分享过，干货满满。

本文是系列文章中的第二篇，第一篇见[这里](https://blog.jetbrains.com/rust/2022/03/18/procedural-macros-under-the-hood-part-i/)。


2、[youtube][有字幕] [AWS 在构建 Rust SDK 方面的实践](https://www.youtube.com/watch?v=N0XMjokwTIM)

如果没有亚马逊这几年对 Rust 的大力(肆)支(鼓)持(吹)，Rust 也不会走到今天这个地步。出于敬意，放上这个视频，事实上，里面更多的是对自己产品的宣传 = ， = 特别是第一部分，大家可以跳着看，一些关于底层的讲解还是值得一看的。

3、[Zh] [在 GCC 13 中，大家可能将看到 Rust 的身影](https://www.oschina.net/news/202630/gcc-rust-approved-by-gcc-steering-committee)

目前来说，Rust 的编译器实现是基于 LLVM 的，而我们可能很快将看到基于 GCC 的实现，与 LLVM 不同，新的编译器将能获得 GCC 内部优化通道的所有访问权，同时带来更多的目标平台的支持，以及享受 GCC 众多的插件生态。

该项目已经历时多年(从 Rust 0.9 版本开始)，我一度怀疑可能永远都无法看到它的身影，没想到现在突然官宣了，但是项目依然还处于早期阶段，当前的目标是在 GCC 13 中提供测试级别的支持。

再加上 Rust 即将在 Linux 5.20 中出现，可以预料， Rust 的未来将更加美好，大家一起期待吧！

4、[C++ 大战 Rust 系列：可变性和所有权](https://www.tangramvision.com/blog/c-rust-interior-mutability-moving-and-ownership)

虽然 Rust 将所有权发扬光大，但是咱不能说 Rust 发明了所有权，毕竟众所周知：Rust 语言是借鉴大师 :P  

在这篇文章中，作者将介绍 C++ 和 Rust 在实现所有权、可变性方面的不同设计哲学，以及标准库、编译器层面的支持。

5、[Rust 错误介绍，比你想要的更多](https://www.shuttle.rs/blog/2022/06/30/error-handling)

文章不错，标题也不错！ 虽然你想要的错误处理几乎都可以在 `https://course.rs` 上找到，但是这篇文章依然值得一看。

6、[Youtube][有字幕] [为何你的 Rust 编译这么慢？](https://www.youtube.com/watch?v=pMiqRM5ooNw)

视频质量自然非常高，从各个方面介绍了该如何提升 Rust 的编译速度，干货满满，强烈推荐。

但...我的天，我真的佩服作者，就以 Rust 周刊举例吧，每次周刊基本都要花费我几个小时，那一个将近 3 个小时的干货视频，要准备多久？简直是卷王在世 :)

甚至有人评论到：这个是一个 AMSR 视频...


7、[Rust中的再借用](https://haibane-tenshi.github.io/rust-reborrowing/)

大家都知道 Rust 中的生命周期很难，那你们谈谈对借用的印象，难吗？我猜，大多数人会说不难。其实不然，Rust 中的借用并不仅仅是书上介绍的那些，例如**再借用(reborrowing)**，你听说过吗？

8、[我很强，但 Rust 更强](https://blog.polybdenum.com/2022/06/25/an-unfortunate-experience-with-rust.html)

作者说他对于 Rust 极其有经验，但是就算这样的高手，依然避免不了被 Rust 所教育，你问怎么个教育法？当然是跟编译器搏斗咯。

其实，从我个人而言，非常推荐大家看看这类文章，那些关于 Rust 如何成功的营销文，爽则爽矣，对于技术却无多大帮助。而这种错误实践类的文章，却能帮助我们少走很多弯路！
