# Rust语言周刊
Rust语言周刊精选全世界过去一周的优秀文章、新闻、开源项目和语言动态。

本周刊由 RustCn 倾情打造，其中， `[Zh]` 标识的中文资料由 Rust 翻译计划提供，并且原始的 Markdown 文档已[全部开源](https://github.com/rustlang-cn/rustt)，欢迎大家阅读和订阅。

> RustCn：https://hirust.cn, 公众号: Rust语言中文网

# 「Rust 语言周刊」 第 15 期 · 2022-06-10

<img src="https://pic3.zhimg.com/80/v2-c7576bc34d1da15c96032aa39a6a1796_1440w.jpeg">
<h5 align="center">题图: Rust 好难啊</h5>


## 精选文章

1、[简单的 Rust 面试问题](https://flakm.github.io/posts/rust_interview_questions/)

当年(2015)我搜索 Go 语言工作时有多绝望，你现在搜索 Rust 工作就有多绝望，再优秀的语言，要在行业里流行开来，总需要时间的沉淀，不管如何，Rust 现在正在走在一条正确的快行道上。

因此，无论是面试官还是面试者，提前储备一些 Rust 的面试题，都是不错的选择。

2、[来自强类型的诅咒](https://fasterthanli.me/articles/the-curse-of-strong-typing)

我骑着马儿，穿过了雪山，来到了草原，遇到了美丽的...错误？！大家写 Rust 有没有这种感觉，从题目可以看出，作者是绝对有这种感觉的，特别是在他的 Boss 宣称：从今以后，我们的一切都要使用 Rust 后...

3、[测量 Rust 中的堆内存分配](https://flakm.github.io/posts/heap_allocation/)

如果问程序员，为何要节省内存，他会说这是技术的体现；如果问老板，为何要节省内存，他会说这是因为穷。总是，在节省硬件成本这件事上，大家的目标出奇的一致。那么现在的问题就是：该如何衡量应用的内存使用情况？

4、[Arc 和 Mutex](https://itsallaboutthebit.com/arc-mutex/)

这篇文章讲解了一个很有趣的点：`Arc` 为何要求其包裹的类型实现 `Sync` 特征，值得一看！

5、[使用 Github Actions 让 Rust 构建提速 30 倍](https://ectobit.com/blog/speed-up-github-actions-rust-pipelines/)

Rust 什么都好，就是编译太慢了，特别是你同时写 Go 和 Rust 时，那种对比体验更是明显。原因在于，在编译过程中，为了安全性和性能 Rust 会检查很多很多东西，何况 Rust 提供的语言特性也远比 Go 要更加丰富。

当然，这个过程是可以提速的，例如在 `Cargo.toml` 中设置编译优化选项，再比如本文中的构建缓存。


6、[Rust 好难啊](https://hirrolot.github.io/posts/rust-is-hard-or-the-misery-of-mainstream-programming.html)

Rust 之所以给很多人难学的印象，很重要的一点就在于：某些其它语言很轻松就能处理的问题，在 Rust 中，你需要兼具美貌、智慧与勇气，才能搞定。

大家可能以为这篇文章是一个新手写的，其实不然，作者已经浸淫 Rust 数年，还在某次大会上分享过 Rust，但是他依然会遇到一些意料之外的棘手错误，一起来看看吧。

7、[爆发和挑战并存](https://thestack.technology/rust-language-explosive-growth-challenges-rust-governance/)

在过去 24 个月中，Rust 开发者的数量增加了 3 倍，可以说从 Rust 基金会成立后，Rust 一直在爆发式增长，但是其所面临的挑战也越来越大。

8、[使用 Rust 来爬取网页](https://www.scrapingbee.com/blog/web-scraping-rust/)

想从某些网站获取信息，一般有两个途径：首先就是调用网站提供的 API，这也是最安全、最合法的方式(特别是国内！)，例如 Github 就提供了异常丰富的 API；其次，就是使用爬虫来爬取到网页后，再对内容进行解析，以提取出有用的信息。

9、[Video][使用 Rust 来编写 WGPU 程序](https://www.youtube.com/playlist?list=PL_UrKDEhALdJS0VrLPn7dqC5A4W1vCAUT)



## 往期回顾

目前所有的周刊都按照 `年/月/日期` 的方式归纳在 [docs](./docs) 目录下，大家可以按需查看。

- [第 14 期](./docs/2022/5月/29.md)
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
