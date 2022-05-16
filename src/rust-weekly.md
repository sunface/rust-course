# Rust语言周刊
Rust语言周刊精选全世界过去一周的优秀文章、新闻、开源项目和语言动态。

本周刊由 RustCn 倾情打造，其中， `[Zh]` 标识的中文资料由 Rust 翻译计划提供，并且原始的 Markdown 文档已[全部开源](https://github.com/rustlang-cn/rustt)，欢迎大家阅读和订阅。

> RustCn：https://hirust.cn, 公众号: Rust语言中文网

# 「Rust 语言周刊」 第 12 期 · 2022-05-16
Rust语言周刊精选全世界过去一周的优秀文章、新闻、开源项目和语言动态。

本周刊由 RustCn 社区倾情打造，其中， `[Zh]` 标识的中文资料由 Rust 翻译计划提供，并且原始的 Markdown 文档已[全部开源](https://github.com/rustlang-cn/rustt)，欢迎大家阅读和订阅。

> RustCn：https://hirust.cn, 公众号: Rust语言中文网

<img src="https://pica.zhimg.com/80/v2-61f557bd623557b6872c99c09cb4fc4c_1440w.png">
<h5 align="center">题图: Kani - Rust 代码检查工具</h5>

#### 官方新闻

1、[cc 正式成为官方库: 将 C/C++ 代码编译成 Rust 代码](https://github.com/rust-lang/cc-rs)

Rust 的生态环境正在快速发展中，但是就目前而言，我们依然需要经常去调用 C/C++ 代码，此时 cc 就成了必不可少的构建工具( 配合 build.rs )。

在之前的某期中，我们有提到该库的作者已经[无力继续维护](https://github.com/rust-lang/cc-rs/issues/663)，原因是各种平台兼容的 PR 搞得他焦头烂额，因此希望找一个接盘侠，如果是普通的库就罢了，偏偏是这么重要的库、维护复杂度这么高的库，因此这件事变得异常棘手。

好在，在官方的协调和支持下，cc 最终转入了官方组织，并且在多个月后，重写开始合并 PR ！

#### 开源项目

1、[Fornjot 发布 0.6 版本：一个使用 Rust 编写的 CAD 应用](https://www.fornjot.app/blog/fornjot-0.6/)

这个世界需要一个新的 CAD，嗯，不是我说的，是作者说的，虽然我对此表示怀疑 :D 

总之，这个库是一个基于代码扩展的 CAD 应用，但是大家一定不要被 0.6 这个版本号所忽悠，它还很早期！例如它终于在新版本中支持 Z 轴非垂直方向的建模了：

<img src="https://pic3.zhimg.com/80/v2-d563fdd0d5d5c562e087e0c0f0863445_1440w.png" />

2、[Kani: 一个全新的 Rust 代码检查工具](https://github.com/model-checking/kani)

Rust 的编译器这么强大，我们为什么还需要另一个非官方的编译检查工具？岂不是没事找事嘛？其实不然，毕竟，面对 unsafe 代码，传统的编译器依然有些有心无力，即使已经有了 mio。

而 kami 可以帮助我们检查代码的内存安全、用户定义的危险断言、panics、算术溢出等非预期行为，而且 kami 可以和我们的测试代码紧密结合，例如下面的一使用示例:

```rust
use my_crate::{function_under_test, meets_specification, precondition};

#[kani::proof]
fn check_my_property() {
   // 创建一个非确定性的输入
   let input = kani::any();

   //根据函数的先决条件来限制它
   kani::assume(precondition(input));

   // 调用需要被验证的函数
   let output = function_under_test(input);

   // 检查它是否满足特性需求
   assert!(meets_specification(input, output));
}
```

3、[RepliByte: 一个开源的数据库同步服务](https://github.com/Qovery/replibyte)

作为开发者而言，在测试环境伪造数据用于测试是一件头疼的事，而且还不能反映出真实世界的复杂性，出于自身的这个痛点，作者创建了 RepliByte。

它支持 Pg、Mysql、MongoDB 的数据备份和还原，还支持敏感数据替换、数据子集、传输过程中的数据压缩和加密等，最重要的：它是 Rust 写的，每次想起公司那个占用大量资源、基于 Java 的数据库同步中间件，我就...

```shell
### 列出所有备份
$ replibyte -c conf.yaml dump list

type          name                  size    when                    compressed  encrypted
PostgreSQL    dump-1647706359405    154MB   Yesterday at 03:00 am   true        true
PostgreSQL    dump-1647731334517    152MB   2 days ago at 03:00 am  true        true
PostgreSQL    dump-1647734369306    149MB   3 days ago at 03:00 am  true        true
```

```shell
### 还原最新的备份到本地数据库中
$ replibyte -c conf.yaml dump restore local -v latest -i postgres -p 5432

### 还原最新的备份到远程数据库中
$ replibyte -c conf.yaml dump restore remote -v latest
```


4、[Stretch: 一个高性能的基于 flexbox 的 UI 布局库](https://github.com/DioxusLabs/stretch)

严格来说，该库是一个 fork 项目，之前的项目已经很久不再维护了，现在 [Dioxus]() 扛起了大旗，目标是为跨平台的布局提供一个坚定的基石，尤其是移动端，未来还会提供除了 `flexbox` 外更多的布局方式。

项目目前处于初期阶段，主要是 Dioxus 和 BevyEngine 在参与，如果大家感兴趣，可以看看里面的 `good first issue`。

> 感谢 [Asura](https://github.com/asur4s) 同学提供的[消息源](https://github.com/rustlang-cn/rust-weekly/issues/6)



#### 精选文章

1、[Zh] [Rust 与 OpenCV](https://github.com/rustlang-cn/Rustt/blob/main/Articles/%5B2022-05-08%5D%20Rust%20与%20OpenCV.md)

Rust非常优秀，但是与 C/C++ 等巨头相比，它在社区生态上还只是一头初生牛犊，因此我们经常需要去使用 C/C++ 编写的库。友情提示：在 Rust 中使用 OpenCV 是可行的，但是首先，你可能需要拥有足够的意志力来克服遇到的各种问题，毕竟，这是一条未知之路。

2、[编程语言是平台，而不是产品](https://kerkour.com/programming-languages-are-platforms)

现代社会，每个大公司都想做一个大而全的产品，这样就可以行成更强的护城河，让竞争对手无路可走，然而这种产品会牺牲稳定性和可靠性。那么问题来了，对于编程语言而言，适合吗？

3、[Xilem: 一个 Rust UI 架构](https://raphlinus.github.io/rust/gui/2022/05/07/ui-architecture.html)

对于用户界面领域来说，Rust 语言提供了足够的吸引力，原因很简单，它能够同时交付安全性和性能。但是，如何找到一个好的 UI 架构，成为了相当大的挑战。

在其它语言适用的架构设计未必能很好的应用在 Rust 上，毕竟 Rust 的一些语言特性，学过的人都懂，一个自引用结构体都能整的人快乐无边  :P 基于此原因，一些人并不看好 Rust 在用户界面的未来，但是作者依然坚定的认为 Rust 就是未来。

他之前的尝试( 包括当前的 [Druid](https://github.com/linebender/druid) 架构 !) 都存在或多或少的缺陷，因此在这篇文章中，他提出了一个全新的架构，非常值得一读！

4、[使用 Rust 进行有限状态机的建模](https://www.ramnivas.com/blog/2022/05/09/fsm-model-rust)

在文章中，作者介绍了如何运用 Rust 的所有权机制和静态编译的特点实现一个有限状态机( FSM )。


5、[算法面试很卷？](https://ada-x64.github.io/over-engineering/)

作者在找工作中，现在的大环境意味着算法成了绕不过去的坎。那到底是用更高级的代码卷起来，还是躺平使用简单的实现，文中给出了他的选择。

6、[挑战：在 wifi 路由器上运行 Rust](https://blog.dend.ro/building-rust-for-routers/)

作者有一个 OpenWrt wifi 路由器，某一天无聊至极，盯着这个老朋友发呆ing，结果突发奇想，嘿，也许我可以在这上面运行个 Rust 项目。`hello world` 显然跟路由器八字不合，那就写一个 DNS 客户端吧。


7、[Rust 中的 O(1) 泛型](https://peterkos.me/rust-const-generics/)

众所周知，Rust 的泛型是零开销的，原因在于编译器会把泛型展开为一个个具体的类型，以二进制文件膨胀的代价来换取性能，这个做法没有任何问题。但是如果我们想要更加强大的泛型特性呢？文中针对这一点，给出了一些有价值的观点，值得一看！

8、[创业公司是否应该使用 Rust ?](https://www.shuttle.rs/blog/2021/10/08/building-a-startup-with-rust)

可以说，每一个优秀的工程师，内心都有这样的梦想：使用技术创业，然后改变世界。就目前来看，Rust 拥有足够的吸引力，那我们是否可以选择 Rust 来作为初创公司的主要语言呢？

9、[使用 Rust 实现去中心化的集群管理](https://quickwit.io/blog/chitchat/)

大家可能在想，分布式集群？难道不是在前面做一层负载均衡( nginx )，后面的集群就随便搞嘛？其实不是，你说的是无状态的分布式集群，这种集群的状态都存储在 redis、mysql 等数据库中，因此分布式很简单。

但是对于有状态的集群来说，分布式就变成了一个相当棘手且有挑战的问题，最基本的：如果让集群中的节点感知到其它节点，在本文中，你能获取到一些灵感和解决方案。



## 往期回顾

目前所有的周刊都按照 `年/月/日期` 的方式归纳在 [docs](./docs) 目录下，大家可以按需查看。

- [第 11 期](./docs/2022/5月/07.md)
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
