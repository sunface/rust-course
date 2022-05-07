# Rust语言周刊
Rust语言周刊精选全世界过去一周的优秀文章、新闻、开源项目和语言动态。

本周刊由 RustCn 倾情打造，其中， `[Zh]` 标识的中文资料由 Rust 翻译计划提供，并且原始的 Markdown 文档已[全部开源](https://github.com/rustlang-cn/rustt)，欢迎大家阅读和订阅。

> RustCn：https://hirust.cn, 公众号: Rust语言中文网

# 「Rust 语言周刊」 第 11 期 · 2022-05-07

<img src="https://pic2.zhimg.com/80/v2-6243e39368f24d4193564a701942413f_1440w.png">
<h5 align="center">题图: 可视化 Rust 数据类型的内存布局</h5>

#### 本期明星

1、[Zh] [可视化 Rust 数据类型的内存布局](https://github.com/rustlang-cn/Rustt/blob/main/Articles/%5B2022-05-04%5D%20可视化%20Rust%20各数据类型的内存布局.md)

了解 Rust 中每个数据类型的内存布局有助于锻炼我们的编程直觉，可以提前规避一些编译错误和性能问题。

原文是以视频形式呈现，译文是由 Rustt 翻译组的明星译者 trdthg (third thing) 倾情翻译，内容巨多、工作量巨大，如果大家喜欢，在[这里](https://github.com/trdthg)给他点个赞吧 :D



#### 开源项目
1、[shuttle: 使用 Cargo 部署你的 Rust 应用](https://www.shuttle.rs)

说实话，这个库真的很酷很 rusty，它完成了从源代码到云部署的全过程覆盖，支持通过派生特征的方式去自定义你的部署流程，甚至还提供了短域名服务！

哦对了，我特别喜欢 shuttle 的 slogan：

> **Let's make Rust the next language of cloud-native**
>
> We love you Go, but Rust is just better.

你们喜欢不？😆

2、[Redox发布0.7.0: 一个完全用 Rust 编写，专注于稳定性和安全性的全新微内核操作系统](https://www.redox-os.org/news/release-0.7.0/)

Redox 不是一个新项目，已开发多年，但仍达不到成熟可用的状态，毕竟操作系统不是一个小工程。

不过这次的新版本改动还是挺大的：对硬件扩展的支持、改进的文件系统、重写的引导程序、微内核的更新，甚至它还改进了rustc 和 reibc(基于 Rust 的 C 库)。

> 求大佬告知：国内在做操作系统的厂商是否有在跟进这个项目，基于它来做一个国产操作系统，不知道有没有搞头

3、[重生之路之 Plotters ](https://github.com/plotters-rs/plotters)

Plotters 是一个非常棒的纯 Rust 编写的绘图库( charts )，除了支持位图、向量图等传统方式外，还支持 WebAssembly。

但..这个库之前很长一段时间内都没怎么维护，而且还是个人项目，其它贡献者只能望洋兴叹，作为一门有志于 GUI、前端领域的语言，这个库还是非常重要的。

好在，现在作者宣布了自己已经归来，并重新建立了一个组织用于维护该项目。

<img src="https://pic2.zhimg.com/80/v2-494d0f57300cb3c7950b19b838430dbf_1440w.jpeg" />



#### 精选文章

1、[Zh] [Rust类型系统图灵完备的证明](https://github.com/rustlang-cn/Rustt/blob/main/Articles/%5B2022-05-04%5D%20Rust类型系统图灵完备的证明.md)

一门编程语言要进入科研等严肃领域，必须要经过九九之关的检验，其中图灵完备的证明就是其中一环。本文作者通过实现 Smallfuck 的方式(一门已知的图灵完备语言)，证明了 Rust 的类型系统是图灵完备的。

2、 [Zh] [使用 Rust 和 WebAssembly 在 48 小时内制作游戏](https://github.com/rustlang-cn/Rustt/blob/main/Articles/%5B2022-04-27%5D%20使用%20Rust%20和%20WebAssembly%20在%2048%20小时内制作游戏.md)

[Ludum Dare] 是一个 48 小时个人游戏开发挑战赛，作者之前已经使用 Unity 参加过几次了，这次，他决定尝试点不一样的。

3、[Zh] [半小时快速了解 Rust](https://github.com/rustlang-cn/Rustt/blob/main/Articles/%5B2022-04-28%5D%20半小时快速了解%20Rust.md)

21天？7天？3天？都弱爆了好吗！这里，只要半个小时！

4、[GAT的美好未来](https://jackh726.github.io/rust/2022/05/04/a-shiny-future-with-gats.html)

GAT 是 Generic Associated Types (泛型关联类型) 的简写，大家可以在[这里](https://blog.rust-lang.org/2021/08/03/GATs-stabilization-push.html)对其进行深入了解。

GAT 计划是在1年多之前就开始了，本身计划在去年 10 月稳定化的，但是其中遇到了不少问题，导致了计划的延期，然后就是 12 月、2月( 这种感觉好熟悉:P )。

现在，作者终于可以骄傲的写出这篇文章，来告诉我们 GAT 到底可以用来做什么，质量很高，值得一看！

> 关于 GAT 还有另一篇文章值得一读：[生命周期 GAT 的更好替代品](https://sabrinajewson.org/blog/the-better-alternative-to-lifetime-gats)


5、[C++ & Rust: 泛型和特性化](https://www.tangramvision.com/blog/c-rust-generics-and-specialization)

一周一次、喜闻乐见的 C++ Pk Rust 环节又来了，作者所在的公司原本是做 C++ 的，但是在遇到 Rust 后，变心了，甚至还加入了 Rust 基金会，一起来欣赏下他们的一些看法吧。


6、[这些年 Rust 编译器帮你捕获的 Bug 们](https://kerkour.com/bugs-rust-compiler-helps-prevent)

在过去几十年内，随着程序员水平的越来越高，我们终于证明了自己 —— 没办法写出 Bug Free 的软件。因此，新编程语言的编译器越来越强大，也越来越复杂，Rust 就是其中的翘楚。

7、[自引用结构体和其替代品](https://swatinem.de/blog/self-reference-alternatives/)

文章讲解了该如何更好的理解和使用自引用结构体，以及在一些场景下，该如何使用其它方式来替代自引用结构题。






## 往期回顾

目前所有的周刊都按照 `年/月/日期` 的方式归纳在 [docs](./docs) 目录下，大家可以按需查看。

- [第 10 期](./docs/2022/5月/07.md)
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
