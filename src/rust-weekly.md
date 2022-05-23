# Rust语言周刊
Rust语言周刊精选全世界过去一周的优秀文章、新闻、开源项目和语言动态。

本周刊由 RustCn 倾情打造，其中， `[Zh]` 标识的中文资料由 Rust 翻译计划提供，并且原始的 Markdown 文档已[全部开源](https://github.com/rustlang-cn/rustt)，欢迎大家阅读和订阅。

> RustCn：https://hirust.cn, 公众号: Rust语言中文网

# 「Rust 语言周刊」 第 13 期 · 2022-05-22

<img src="https://pic1.zhimg.com/80/v2-cd8fc37f15c5547a0853a92a9e06c528_1440w.webp">
<h5 align="center">题图: 将 Ruby 的编译器移植到 Rust 上</h5>

#### 官方新闻

1、[Rust 发布 1.61 版本](https://blog.rust-lang.org/2022/05/19/Rust-1.61.0.html)

在历次版本更迭中，Rust 的 `fn main` 函数经历了从返回单元类型 `()`，到返回 `Result`，这两个实际上都是通过 `Termination` 特征来返回一个状态码(Exit Status)。

但之前该特征并没有稳定，我们无法自定义想要的返回状态码，而新版本中中，该特征最终稳定下来。

除此之外还有对常量函数 (const fn) 的进一步支持，意味着我们可以将更多的任务放在编译期去执行了。

#### 开源项目

1、[BlindAI: 一个基于 Rust 的开源 AI 项目](https://blog.mithrilsecurity.io/introducing-blindai/)

谁说 Rust 在机器学习/人工智能方面是纯纯的菜鸟？这不，我们拥有了一个纯 Rust 编写的、现代化的...AI 模型部署工具，它可以把我们创建的 AI 模型方便地部署在远程服务器上，同时对终端用户提供安全的访问接口。

<img src="https://pic2.zhimg.com/80/v2-dafe81318a7f3e25d73b704251fad4c6_1440w.gif" />

2、[Fyrox 发布 0.25 版本](https://fyrox.rs/blog/post/feature-highlights-0-25/)

对于 Fyrox 大家可能不熟悉，但是提到 rg3d，很多人可能就恍然大悟了。是的， fyrox 它的新名字( 我觉得新名字比老的要好，未来更好推广，但是还是建议大家在项目初期想一个好的名字，不然后面改名的隐形成本实在太高了！)

在新版本中，主要是引入了静态插件和脚本的支持，其中一个用途就是用来扩展游戏引擎，例如现在的 fyrox 支持在游戏编辑器中运行游戏了，就像很多知名的游戏引擎一样！

<img src="https://pic1.zhimg.com/80/v2-7ba91c93e0c8ebe1e2a7928434173414_1440w.jpeg" />


#### 精选文章

1、[我们是怎么将 Ruby 编译器移植到 Rust 的](https://shopify.engineering/porting-yjit-ruby-compiler-to-rust)

在 [4 月份时](https://baijiahao.baidu.com/s?id=1730684175033094920&wfr=spider&for=pc)，一个爆炸性的新闻出现：Ruby 的 YJIT 编译器使用 Rust 完成了移植，并等待合并到上游代码仓库中，但当时并没有给出太多的细节。

一个月后的这篇文章中，开发者团队终于解开了神秘的面纱，深入谈了下在移植过程中遇到问题以及收获的经验，值得一读。

2、[Rust和供应链](https://blog.logrocket.com/comparing-rust-supply-chain-safety-tools/)

嗒哒，你可能被题目所欺骗了，以为本文是写 Rust 和物流供应链的，实际上，这是一篇关于 Rust 依赖链的文章，作者貌似对于外部的一切都充满了不信任感，因此希望能发现 Rust 项目中到底使用了哪些库，以及相关的详细信息。

如果大家读了后，觉得意犹未尽，这里也有一篇[相似的文章](https://insanitybit.github.io/2022/05/10/supply-chain-thoughts)。

3、[语言特性真的越多越好吗?](https://www.thecodedmessage.com/posts/2022-05-11-programming-multiparadigm/)

C++ 程序员经常引以为傲的一点就是 C++ 什么都能做，而且还是多编程范式的。如果你对此套路不熟悉，很容易就被其吸引，然后走上一条不归路。

看了本文后，至少这些套路你将了若指掌，以后互喷起来，不要太愉快 ：P

4、[使用 Rust 扩展 SQLite](https://ricardoanderegg.com/posts/extending-sqlite-with-rust/)

SQLite 支持多种扩展机制，本文将通过扩展的方式，为 SQLite 实现 zstd 压缩。


5、[深入 Rust 异步编程](https://conradludgate.com/posts/async)

友情提示，阅读本文，首先你需要坚实的基础？其实不是，你需要一杯咖啡、一个躺椅和一盘小点心，因为它真的挺长。。

6、[Default 和 From](https://elijahcaine.me/rust-default-from/)

从 Python 到 Rust，作者发现代码变得冗长了不少，他的手已然累了。因此，本文将从工程性的角度出发，谈谈 `Default` 和 `From` 在实战中能发挥出什么威力。

7、[游戏开发中的音频为何这么难](https://tesselode.github.io/articles/audio-libraries-considered-challenging/)

游戏由于 fps 的限制，导致了音视频的开发难度相对其他领域来说会更高一些，作者在编写 [kira](https://github.com/tesselode/kira/) 的过程中，深刻领悟了这一点。

8、[系列] [链接 Rust 依赖包 1](https://blog.pnkfx.org/blog/2022/05/12/linking-rust-crates/)

说到依赖包，应该没人不知道 `bin` 和 `lib` 类型，前者可以编译成可运行的二进制文件，后者则是常用的依赖库。但是以下这些呢？`bin, lib, dylib, staticlib, cdylib, rlib, and proc-macro`，能够一一说出的同学，请举个爪 =，= 

而文章要做的就是通过系列文章的方式带大家通过示例的方式熟悉这些库类型，本文是第一篇。






## 往期回顾

目前所有的周刊都按照 `年/月/日期` 的方式归纳在 [docs](./docs) 目录下，大家可以按需查看。

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
