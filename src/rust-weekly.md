# 「Rust 语言周刊」 第 16 期 · 2022-06-24
Rust语言周刊精选全世界过去一周的优秀文章、新闻、开源项目和语言动态。

本周刊由 RustCn 倾情打造，其中， `[Zh]` 标识的中文资料由 Rust 翻译计划提供，并且原始的 Markdown 文档已[全部开源](https://github.com/rustlang-cn/rustt)，欢迎大家阅读和订阅。

> RustCn：https://hirust.cn, 公众号: Rust语言中文网


## 官方新闻

1、[首期 Rust 基金会的赞助名单已经出炉](https://foundation.rust-lang.org/news/2022-06-14-community-grants-program-awards-announcement/)

按照目前的计划，基金会每年开放两次申请，每次 20 万美元的总额( 估计会逐年增加 )，大致授予[合作伙伴](https://foundation.rust-lang.org/news/2022-06-14-community-grants-program-awards-announcement/#fellowship-awards)和[个人项目](https://foundation.rust-lang.org/news/2022-06-14-community-grants-program-awards-announcement/#individual-project-grant-awards)两个方向。

下次的申请开放大概在 10 月份左右，强烈建议有能力的都去试试，万一申请下来，几千美元也是很香的 :)

## 精选文章

1、[Zh] [用 Rust 从 0 到 1 实现一个最简化的 KV 存储引擎](https://blog.csdn.net/qq_36456827/article/details/125304612)

这种有讲有练的干货真的不多( 大部分人貌似都更喜欢做一些偏软货的东东，包括我自己 :P )，本文不仅内容质量高，而且还随文附送一个相当不错的 DB demo 实现，非常值得阅读和学习！

2、[智商提升了一岁的 Rust 编译检查器](https://jackh726.github.io/rust/2022/06/10/nll-stabilization.html)

当你好奇的看到这里时，和我一样，你被作者的标题忽悠了，其实是 Rust 编译检查器在最新版本中会默认开启所有的功能。不过在文章中，还讲到了很多生命周期错误提示的最新变动以及未来的展望，总算没白来了 :D

3、[大佬来找茬系列之教学明星项目 mini-redis](https://smallcultfollowing.com/babysteps/blog/2022/06/13/async-cancellation-a-case-study-of-pub-sub-in-mini-redis/)

一般来说，在社区中推荐一个新手学习项目, [`mini-redis`](https://github.com/tokio-rs/mini-redis) 往往是首选，它拥有高质量且简洁的代码实现、清晰完善的文档以及对异步编程保姆式的引导讲解，总之非常棒。

但是它没有缺点吗？这不，Baby steps 大佬出手了，干货满满，强烈推荐阅读！

4、[如何让 Rust 项目发生内存泄漏甚至崩溃？](https://fly.io/blog/rust-memory-leak/)

别开枪，是友军！事实上，这篇文章讲的是如何修复 Rust 项目的内存泄漏问题，具体的项目是 `fly.io` 公司的代理服务，该代理会将来自世界各地的用户请求路由到最适合的虚拟机中( 虚拟机分布在全世界 21 个地区 )。

5、[使用自建的 prelude.rs 来简化 Rust 项目的依赖引入](https://justinwoodring.com/blog/tidy-your-rust-imports-with-prelude/)

Rust 项目大了后，一个不得不面对的问题就是：该如何处理每个文件中都需要导入的重复依赖，例如：

```rust
use crate::models::clubs_md::{Club, NewClub, ClubDetails};
use crate::models::users_md::{User, UserDetails, NewUser, Admin};
use crate::models::club_members_md::{MembershipStatus, ClubMember, NewClubMember};
use crate::Db;
```

6、[使用 Rust 来测试 NVDIA 的 GPU 性能](https://simbleau.github.io/blog/gpu-profiling-with-rust/)

在目前的 CPU、GPU 跑分领域，Rust 还是小兵之姿，但将军的梦想还是要有的。这篇文章中，作者将使用 NVDIA 的工具扩展 SDK 来开发基于 Rust 的 GPU 和 CPU 跑分工具，喜欢猎奇的同学不容错过。


## 开源项目

1、 [lurk: 使用 Rust 重新实现 strace](https://jakobwaibel.com/2022/06/06/ptrace/)

目前项目还较为早期，但是关于项目的愿景，作者描述的较为清晰，这种项目一般都是值得期待并能产生结果的。

2、[error-stack: 一个全新的 Rust 错误处理库](https://hash.dev/blog/announcing-error-stack)

该库支持上下文感知和任意用户数据的关联。事实上，这种类型的开源项目往往都来源于一个团队在实际项目中遇到的痛点，因此工程性适用性会非常强。总之，以我个人的经验，不以 star 论英雄，还是看看是 `谁` 开源了 `什么` 项目以及适不适合 `你` 的使用场景，很多低星项目其实是非常优秀和成熟的，只不过没有得到应有的曝光度。

3、[打遍 playground 无敌手的 Rust Explorer](https://www.rustexplorer.com/b/about)

这个项目真的非常吸引我，不知道大家对于在线代码运行的期许是什么，对我而言，能够运行各种代码绝对是最大的亮点，而这个项目支持 10000 个三方依赖库(crates.io 上的 top 10000)。

不是 100，也不是 1000，而是 10000，基本上这意味着几乎所有代码片段都可以在这里运行了，也意味着我的 `practice.rs` 项目可以进一步扩展，Bingo!

4、[clap 3.2 发布](https://epage.github.io/blog/2022/06/clap-32-last-call-before-40/)

看起来只是一个小版本，但是它可是 4.0 大版本的预演，因此新增了两种 API 构建方式。

5、[c2rust 王者归来](https://immunant.com/blog/2022/06/back/)

这个项目对于 Rust 的生态而言太太太重要了，要进一步扩大自己的份额，C 语言就是绕不过的高山，而重写旧项目在大多数时候显然都是不现实的，因此 `c2rust` 才会有这么高的呼声，只不过之前因为核心作者的原因，项目几乎不怎么活跃了，还好现在 `immunant` 公司接过了大旗。

要我说，这种底层类型的大型开源项目要做得好，还是得背靠大树，例如之前的 [`cc`](https://github.com/rust-lang/cc-rs/issues/663) 项目就是从 `alex` 个人名下转到了 `rust` 官方组织下，最终又焕发了第二春。

6、[mold 发布 0.3 版本](https://github.com/rui314/mold)

mold 是一个用 Rust 写的链接器，它的性能比 LLVM 的 lld 链接器快好几倍，目标是通过降低编译时间来让 Rust 项目的开发闭环周期大幅提速。以下是性能对比图：

<img src="https://pic1.zhimg.com/80/v2-62f5d64e110fb3c6a9af669ccb1357f7_1440w.png" />

