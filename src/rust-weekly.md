# 「Rust 语言周刊」 第 9 期 · 2022-04-24
Rust语言周刊精选全世界过去一周的优秀文章、新闻、开源项目和语言动态。

本周刊由 RustCn 倾情打造，其中， `[Zh]` 标识的中文资料由 Rust 翻译计划提供，并且原始的 Markdown 文档已[全部开源](https://github.com/rustlang-cn/rustt)，欢迎大家阅读和订阅。

> RustCn：https://hirust.cn, 公众号: Rust语言中文网

<img src="https://pic3.zhimg.com/80/v2-ba5c1b119916224a45041b157f46f26c_1440w.jpeg">
<h5 align="center">题图: MnemOS</h5>


#### 开源项目

1、[一个新的小型操作系统: MnemOS](https://jamesmunns.com/blog/mnemos-initial-release/)

该操作系统使用 Rust 开发，适用于受限的硬件环境，例如微控制器。但是目前它的状态还比较玩具，大家想要用它来 make money ，还是洗洗睡了吧，用来学习下新的领域倒是很不错，毕竟互联网的未来..懂的都懂。

2、[著名 Rust 游戏引擎 Bevy 发布 0.7 版本](https://bevyengine.org/news/bevy-0-7/)
 
Bevy 的游戏引擎理念可谓是非常先进，因此得到了一大票忠实的粉丝和贡献者的喜爱，发展也极为迅速，这次的新版本带来了大量的新特性，包括骨骼动画、场景中的无限制点光源、集群渲染、材质压缩、着色器优化、ECS优化等等。

但。。。离生产可用，依然有很长的距离，大家在业余爱好上玩玩即可，毕竟哪个男孩子没有一个游戏梦呢 :P

<img src="https://pica.zhimg.com/80/v2-c9a1040d81119cf412559774cb411e51_1440w.png" />

3、[systeroid: Rust 版本的 sysctl](https://systeroid.cli.rs)

`sysctl` 大家应该都很熟悉了，但是再辉煌的英雄也终将老去，而我们的 Rust 替代者 `systeroid` 更快、更强、更安全，值得一试！

<img src="https://pic2.zhimg.com/80/v2-95002dd3324691764cb727bedb34308d_1440w.gif" />


#### 精选文章

1、[Zh] [用 Rust 加速你的 Python 代码](https://github.com/rustlang-cn/Rustt/blob/main/Articles/%5B2022-04-13%5D%20从python调用rust-使用rust加速你的python代码.md)

Python 的广袤天空只存在一个限制，那就是性能，以往都是通过 C/C++ 来增强，现在我们还能使用 Rust 来实现。

2、[Zh] [异步 Rust: 协作与抢占式调度](https://github.com/rustlang-cn/Rustt/blob/main/Articles/%5B2022-04-12%5D%20异步%20Rust：协作与抢占式调度.md)

多线程往往用来并行执行计算密集型任务，但是时代变了，现在，越来越多的程序是I/O 密集型，此时就需要 `async` 来大展身手了。

3、[Zh] [如何用 Rust 实现朴素贝叶斯分类器](https://zhuanlan.zhihu.com/p/501337745)

难度高能预警，实力干货满满！

4、[Zh] [Ruby 的新 YJIT 编译器已完成，使用 Rust 重新实现](https://zhuanlan.zhihu.com/p/502298810)

去年 12 月时，Ruby 开始将 YJIT 代码库从 C99 移植到 Rust 上，这周，负责此项目的开发者表示已经完成新编译器的实现，等待合并。

难道说，使用 Rust 重写各个语言的基础层和工具已经成为了新的潮流？

5、[危! C/C++ 的嵌入式！](https://apollolabsblog.hashnode.dev/why-you-should-be-worried-about-the-future-of-cc-in-embedded-a-case-for-rust)

对于嵌入式环境而言，软件的错误和失败太正常不过了，你问我罪魁祸首是谁？嗯，我不知道 🤪，但是我知道未来的救世主可能会是谁。

6、[连续性和包级别的 Where 语句](https://smallcultfollowing.com/babysteps/blog/2022/04/17/coherence-and-crate-level-where-clauses/)

大佬的硬核文章又来了。这次带来的是对 Rust 中[孤儿原则](https://course.rs/basic/trait/trait.html#特征定义与实现的位置孤儿规则)的深入分析，曾经大放异彩的它随着时间的逐步推移，却成了包组合的障碍( 通过组合的方式来使用多个包 )。

7、[Hack rustc: 为特征实现异步函数](https://blog.theincredibleholk.org/blog/2022/04/18/how-async-functions-in-traits-could-work-in-rustc/)

目前 Rust 异步工作组的一个重要工作就是让 `async fn` 能在所有 `fn` 出现的地方使用，当然，最受大家关注的，应该就是在特征中使用异步函数了。本文将从 Rustc 的角度出发，来讲解异步函数该如何在特征中实现。

8、[该如何选择合适的整数类型？](https://www.thecodedmessage.com/posts/programming-integers/)

> i8 - i64, u8 - u64，天，我该如何选择？

这个问题在国内外各个论坛屡见不鲜，事实上，要正确的回答它，是想当困难的，而本文就是从实践的角度出发，给出该如何选择的建议。

9、[使用 MacOS 下的 MetaAPI 来构建一个全新的终端](https://console.dev/interviews/warp-zach-lloyd/)

聪明的同学可能已经想到，使用 Rust 开发的、MacOS 下的新终端？这会不会是刚融资了几千万美元的 Warp ? Bingo，你猜对了，本文正式对 Warp 的独家采访

10、[为何 Rust 在嵌入式这么受欢迎?](https://tweedegolf.nl/en/blog/70/we-asked-5-people-why-they-like-embedded-rust)

文章采访了 5 位不同的大佬，通过他们的观点，我们可以看出 Rust 为啥在嵌入式领域越来越火了。

11、[编译期的求值： Nim, Zig, Rust and C++](https://castillodel.github.io/compile-time-evaluation/)

编译期求值，对于计算性能优化来说是非常重要的，本文将从多门语言的角度出发，看看编译期求值到底是个什么东东。

12、[在 10 分钟之内构建并部署一个短域名服务](https://www.shuttle.rs/blog/2022/03/13/url-shortener)

大佬的世界总是与众不同的，这不，作者发现自己失眠后，出于对睡眠不足的恐惧，决定要挑战下自己...