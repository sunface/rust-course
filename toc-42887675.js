// Populate the sidebar
//
// This is a script, and not included directly in the page, to control the total size of the book.
// The TOC contains an entry for each page, so if each page includes a copy of the TOC,
// the total size of the page becomes O(n**2).
class MDBookSidebarScrollbox extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.innerHTML = '<ol class="chapter"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="about-book.html">关于本书</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="into-rust.html">进入 Rust 编程世界</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="first-try/sth-you-should-not-do.html">避免从入门到放弃</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="community.html">社区和锈书</a></span></li><li class="chapter-item "><li class="spacer"></li></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="some-thoughts.html">Xobserve: 一切皆可观测</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="beat-ai.html">BeatAI: 工程师 AI 入门圣经</a></span></li><li class="chapter-item "><li class="part-title">Rust 语言基础学习</li></li><li class="chapter-item "><li class="spacer"></li></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="first-try/intro.html"><strong aria-hidden="true">1.</strong> 寻找牛刀，以便小试</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="first-try/installation.html"><strong aria-hidden="true">1.1.</strong> 安装 Rust 环境</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="first-try/editor.html"><strong aria-hidden="true">1.2.</strong> 墙推 VSCode!</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="first-try/cargo.html"><strong aria-hidden="true">1.3.</strong> 认识 Cargo</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="first-try/hello-world.html"><strong aria-hidden="true">1.4.</strong> 不仅仅是 Hello world</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="first-try/slowly-downloading.html"><strong aria-hidden="true">1.5.</strong> 下载依赖太慢了？</a></span></li></ol><li class="chapter-item "><span class="chapter-link-wrapper"><a href="basic/intro.html"><strong aria-hidden="true">2.</strong> Rust 基础入门</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="basic/variable.html"><strong aria-hidden="true">2.1.</strong> 变量绑定与解构</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="basic/base-type/index.html"><strong aria-hidden="true">2.2.</strong> 基本类型</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="basic/base-type/numbers.html"><strong aria-hidden="true">2.2.1.</strong> 数值类型</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="basic/base-type/char-bool.html"><strong aria-hidden="true">2.2.2.</strong> 字符、布尔、单元类型</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="basic/base-type/statement-expression.html"><strong aria-hidden="true">2.2.3.</strong> 语句与表达式</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="basic/base-type/function.html"><strong aria-hidden="true">2.2.4.</strong> 函数</a></span></li></ol><li class="chapter-item "><span class="chapter-link-wrapper"><a href="basic/ownership/index.html"><strong aria-hidden="true">2.3.</strong> 所有权和借用</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="basic/ownership/ownership.html"><strong aria-hidden="true">2.3.1.</strong> 所有权</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="basic/ownership/borrowing.html"><strong aria-hidden="true">2.3.2.</strong> 引用与借用</a></span></li></ol><li class="chapter-item "><span class="chapter-link-wrapper"><a href="basic/compound-type/intro.html"><strong aria-hidden="true">2.4.</strong> 复合类型</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="basic/compound-type/string-slice.html"><strong aria-hidden="true">2.4.1.</strong> 字符串与切片</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="basic/compound-type/tuple.html"><strong aria-hidden="true">2.4.2.</strong> 元组</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="basic/compound-type/struct.html"><strong aria-hidden="true">2.4.3.</strong> 结构体</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="basic/compound-type/enum.html"><strong aria-hidden="true">2.4.4.</strong> 枚举</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="basic/compound-type/array.html"><strong aria-hidden="true">2.4.5.</strong> 数组</a></span></li></ol><li class="chapter-item "><span class="chapter-link-wrapper"><a href="basic/flow-control.html"><strong aria-hidden="true">2.5.</strong> 流程控制</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="basic/match-pattern/intro.html"><strong aria-hidden="true">2.6.</strong> 模式匹配</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="basic/match-pattern/match-if-let.html"><strong aria-hidden="true">2.6.1.</strong> match 和 if let</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="basic/match-pattern/option.html"><strong aria-hidden="true">2.6.2.</strong> 解构 Option</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="basic/match-pattern/pattern-match.html"><strong aria-hidden="true">2.6.3.</strong> 模式适用场景</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="basic/match-pattern/all-patterns.html"><strong aria-hidden="true">2.6.4.</strong> 全模式列表</a></span></li></ol><li class="chapter-item "><span class="chapter-link-wrapper"><a href="basic/method.html"><strong aria-hidden="true">2.7.</strong> 方法 Method</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="basic/trait/intro.html"><strong aria-hidden="true">2.8.</strong> 泛型和特征</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="basic/trait/generic.html"><strong aria-hidden="true">2.8.1.</strong> 泛型 Generics</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="basic/trait/trait.html"><strong aria-hidden="true">2.8.2.</strong> 特征 Trait</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="basic/trait/trait-object.html"><strong aria-hidden="true">2.8.3.</strong> 特征对象</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="basic/trait/advance-trait.html"><strong aria-hidden="true">2.8.4.</strong> 进一步深入特征</a></span></li></ol><li class="chapter-item "><span class="chapter-link-wrapper"><a href="basic/collections/intro.html"><strong aria-hidden="true">2.9.</strong> 集合类型</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="basic/collections/vector.html"><strong aria-hidden="true">2.9.1.</strong> 动态数组 Vector</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="basic/collections/hashmap.html"><strong aria-hidden="true">2.9.2.</strong> KV 存储 HashMap</a></span></li></ol><li class="chapter-item "><span class="chapter-link-wrapper"><a href="basic/lifetime.html"><strong aria-hidden="true">2.10.</strong> 认识生命周期</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="basic/result-error/intro.html"><strong aria-hidden="true">2.11.</strong> 返回值和错误处理</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="basic/result-error/panic.html"><strong aria-hidden="true">2.11.1.</strong> panic! 深入剖析</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="basic/result-error/result.html"><strong aria-hidden="true">2.11.2.</strong> 返回值 Result 和?</a></span></li></ol><li class="chapter-item "><span class="chapter-link-wrapper"><a href="basic/crate-module/intro.html"><strong aria-hidden="true">2.12.</strong> 包和模块</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="basic/crate-module/crate.html"><strong aria-hidden="true">2.12.1.</strong> 包 Crate</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="basic/crate-module/module.html"><strong aria-hidden="true">2.12.2.</strong> 模块 Module</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="basic/crate-module/use.html"><strong aria-hidden="true">2.12.3.</strong> 使用 use 引入模块及受限可见性</a></span></li></ol><li class="chapter-item "><span class="chapter-link-wrapper"><a href="basic/comment.html"><strong aria-hidden="true">2.13.</strong> 注释和文档</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="basic/formatted-output.html"><strong aria-hidden="true">2.14.</strong> 格式化输出</a></span></li></ol><li class="chapter-item "><span class="chapter-link-wrapper"><a href="basic-practice/intro.html"><strong aria-hidden="true">3.</strong> 入门实战：文件搜索工具</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="basic-practice/base-features.html"><strong aria-hidden="true">3.1.</strong> 基本功能</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="basic-practice/refactoring.html"><strong aria-hidden="true">3.2.</strong> 增加模块化和错误处理</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="basic-practice/tests.html"><strong aria-hidden="true">3.3.</strong> 测试驱动开发</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="basic-practice/envs.html"><strong aria-hidden="true">3.4.</strong> 使用环境变量</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="basic-practice/stderr.html"><strong aria-hidden="true">3.5.</strong> 重定向错误信息的输出</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="basic-practice/iterators.html"><strong aria-hidden="true">3.6.</strong> 使用迭代器来改进程序(可选)</a></span></li></ol><li class="chapter-item "><li class="part-title">Rust 语言进阶学习</li></li><li class="chapter-item "><li class="spacer"></li></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance/intro.html"><strong aria-hidden="true">4.</strong> Rust 高级进阶</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance/lifetime/intro.html"><strong aria-hidden="true">4.1.</strong> 生命周期</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance/lifetime/advance.html"><strong aria-hidden="true">4.1.1.</strong> 深入生命周期</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance/lifetime/static.html"><strong aria-hidden="true">4.1.2.</strong> &amp;&#39;static 和 T: &#39;static</a></span></li></ol><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance/functional-programing/intro.html"><strong aria-hidden="true">4.2.</strong> 函数式编程: 闭包、迭代器</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance/functional-programing/closure.html"><strong aria-hidden="true">4.2.1.</strong> 闭包 Closure</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance/functional-programing/iterator.html"><strong aria-hidden="true">4.2.2.</strong> 迭代器 Iterator</a></span></li></ol><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance/into-types/intro.html"><strong aria-hidden="true">4.3.</strong> 深入类型</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance/into-types/converse.html"><strong aria-hidden="true">4.3.1.</strong> 类型转换</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance/into-types/custom-type.html"><strong aria-hidden="true">4.3.2.</strong> newtype 和 类型别名</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance/into-types/sized.html"><strong aria-hidden="true">4.3.3.</strong> Sized 和不定长类型 DST</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance/into-types/enum-int.html"><strong aria-hidden="true">4.3.4.</strong> 枚举和整数</a></span></li></ol><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance/smart-pointer/intro.html"><strong aria-hidden="true">4.4.</strong> 智能指针</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance/smart-pointer/box.html"><strong aria-hidden="true">4.4.1.</strong> Box&lt;T&gt; 堆对象分配</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance/smart-pointer/deref.html"><strong aria-hidden="true">4.4.2.</strong> Deref 解引用</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance/smart-pointer/drop.html"><strong aria-hidden="true">4.4.3.</strong> Drop 释放资源</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance/smart-pointer/rc-arc.html"><strong aria-hidden="true">4.4.4.</strong> Rc 与 Arc 实现 1vN 所有权机制</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance/smart-pointer/cell-refcell.html"><strong aria-hidden="true">4.4.5.</strong> Cell 与 RefCell 内部可变性</a></span></li></ol><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance/circle-self-ref/intro.html"><strong aria-hidden="true">4.5.</strong> 循环引用与自引用</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance/circle-self-ref/circle-reference.html"><strong aria-hidden="true">4.5.1.</strong> Weak 与循环引用</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance/circle-self-ref/self-referential.html"><strong aria-hidden="true">4.5.2.</strong> 结构体中的自引用</a></span></li></ol><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance/concurrency-with-threads/intro.html"><strong aria-hidden="true">4.6.</strong> 多线程并发编程</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance/concurrency-with-threads/concurrency-parallelism.html"><strong aria-hidden="true">4.6.1.</strong> 并发和并行</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance/concurrency-with-threads/thread.html"><strong aria-hidden="true">4.6.2.</strong> 使用多线程</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance/concurrency-with-threads/message-passing.html"><strong aria-hidden="true">4.6.3.</strong> 线程同步：消息传递</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance/concurrency-with-threads/sync1.html"><strong aria-hidden="true">4.6.4.</strong> 线程同步：锁、Condvar 和信号量</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance/concurrency-with-threads/sync2.html"><strong aria-hidden="true">4.6.5.</strong> 线程同步：Atomic 原子操作与内存顺序</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance/concurrency-with-threads/send-sync.html"><strong aria-hidden="true">4.6.6.</strong> 基于 Send 和 Sync 的线程安全</a></span></li></ol><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance/global-variable.html"><strong aria-hidden="true">4.7.</strong> 全局变量</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance/errors.html"><strong aria-hidden="true">4.8.</strong> 错误处理</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance/unsafe/intro.html"><strong aria-hidden="true">4.9.</strong> Unsafe Rust</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance/unsafe/superpowers.html"><strong aria-hidden="true">4.9.1.</strong> 五种兵器</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance/unsafe/inline-asm.html"><strong aria-hidden="true">4.9.2.</strong> 内联汇编</a></span></li></ol><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance/macro.html"><strong aria-hidden="true">4.10.</strong> Macro 宏编程</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance/async/intro.html"><strong aria-hidden="true">4.11.</strong> async/await 异步编程</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance/async/getting-started.html"><strong aria-hidden="true">4.11.1.</strong> async 编程入门</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance/async/future-excuting.html"><strong aria-hidden="true">4.11.2.</strong> 底层探秘: Future 执行与任务调度</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance/async/pin-unpin.html"><strong aria-hidden="true">4.11.3.</strong> 定海神针 Pin 和 Unpin</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance/async/async-await.html"><strong aria-hidden="true">4.11.4.</strong> async/await 和 Stream 流处理</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance/async/multi-futures-simultaneous.html"><strong aria-hidden="true">4.11.5.</strong> 同时运行多个 Future</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance/async/pain-points-and-workarounds.html"><strong aria-hidden="true">4.11.6.</strong> 一些疑难问题的解决办法</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance/async/web-server.html"><strong aria-hidden="true">4.11.7.</strong> 实践应用：Async Web 服务器</a></span></li></ol></li></ol><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance-practice1/intro.html"><strong aria-hidden="true">5.</strong> 进阶实战1: 实现一个 web 服务器</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance-practice1/web-server.html"><strong aria-hidden="true">5.1.</strong> 单线程版本</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance-practice1/multi-threads.html"><strong aria-hidden="true">5.2.</strong> 多线程版本</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance-practice1/graceful-shutdown.html"><strong aria-hidden="true">5.3.</strong> 优雅关闭和资源清理</a></span></li></ol><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance-practice/intro.html"><strong aria-hidden="true">6.</strong> 进阶实战2: 实现一个简单 Redis</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance-practice/overview.html"><strong aria-hidden="true">6.1.</strong> tokio 概览</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance-practice/getting-startted.html"><strong aria-hidden="true">6.2.</strong> 使用初印象</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance-practice/spawning.html"><strong aria-hidden="true">6.3.</strong> 创建异步任务</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance-practice/shared-state.html"><strong aria-hidden="true">6.4.</strong> 共享状态</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance-practice/channels.html"><strong aria-hidden="true">6.5.</strong> 消息传递</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance-practice/io.html"><strong aria-hidden="true">6.6.</strong> I/O</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance-practice/frame.html"><strong aria-hidden="true">6.7.</strong> 解析数据帧</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance-practice/async.html"><strong aria-hidden="true">6.8.</strong> 深入 async</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance-practice/select.html"><strong aria-hidden="true">6.9.</strong> select</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance-practice/stream.html"><strong aria-hidden="true">6.10.</strong> 类似迭代器的 Stream</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance-practice/graceful-shutdown.html"><strong aria-hidden="true">6.11.</strong> 优雅的关闭</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance-practice/bridging-with-sync.html"><strong aria-hidden="true">6.12.</strong> 异步跟同步共存</a></span></li></ol><li class="chapter-item "><span class="chapter-link-wrapper"><a href="difficulties/intro.html"><strong aria-hidden="true">7.</strong> Rust 难点攻关</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="difficulties/slice.html"><strong aria-hidden="true">7.1.</strong> 切片和切片引用</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="difficulties/eq.html"><strong aria-hidden="true">7.2.</strong> Eq 和 PartialEq</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="difficulties/string.html"><strong aria-hidden="true">7.3.</strong> String、&amp;str 和 str TODO</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="difficulties/lifetime.html"><strong aria-hidden="true">7.4.</strong> 作用域、生命周期和 NLL TODO</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="difficulties/move-copy.html"><strong aria-hidden="true">7.5.</strong> move、Copy 和 Clone TODO</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="advance/difficulties/pointer.html"><strong aria-hidden="true">7.6.</strong> 裸指针、引用和智能指针 TODO</a></span></li></ol><li class="chapter-item "><li class="part-title">常用工具链</li></li><li class="chapter-item "><li class="spacer"></li></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="test/intro.html"><strong aria-hidden="true">8.</strong> 自动化测试</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="test/write-tests.html"><strong aria-hidden="true">8.1.</strong> 编写测试及控制执行</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="test/unit-integration-test.html"><strong aria-hidden="true">8.2.</strong> 单元测试和集成测试</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="test/assertion.html"><strong aria-hidden="true">8.3.</strong> 断言 assertion</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="test/ci.html"><strong aria-hidden="true">8.4.</strong> 用 GitHub Actions 进行持续集成</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="test/benchmark.html"><strong aria-hidden="true">8.5.</strong> 基准测试 benchmark</a></span></li></ol><li class="chapter-item "><span class="chapter-link-wrapper"><a href="cargo/intro.html"><strong aria-hidden="true">9.</strong> Cargo 使用指南</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="cargo/getting-started.html"><strong aria-hidden="true">9.1.</strong> 上手使用</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="cargo/guide/intro.html"><strong aria-hidden="true">9.2.</strong> 基础指南</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="cargo/guide/why-exist.html"><strong aria-hidden="true">9.2.1.</strong> 为何会有 Cargo</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="cargo/guide/download-package.html"><strong aria-hidden="true">9.2.2.</strong> 下载并构建 Package</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="cargo/guide/dependencies.html"><strong aria-hidden="true">9.2.3.</strong> 添加依赖</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="cargo/guide/package-layout.html"><strong aria-hidden="true">9.2.4.</strong> Package 目录结构</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="cargo/guide/cargo-toml-lock.html"><strong aria-hidden="true">9.2.5.</strong> Cargo.toml vs Cargo.lock</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="cargo/guide/tests-ci.html"><strong aria-hidden="true">9.2.6.</strong> 测试和 CI</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="cargo/guide/cargo-cache.html"><strong aria-hidden="true">9.2.7.</strong> Cargo 缓存</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="cargo/guide/build-cache.html"><strong aria-hidden="true">9.2.8.</strong> Build 缓存</a></span></li></ol><li class="chapter-item "><span class="chapter-link-wrapper"><a href="cargo/reference/intro.html"><strong aria-hidden="true">9.3.</strong> 进阶指南</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="cargo/reference/specify-deps.html"><strong aria-hidden="true">9.3.1.</strong> 指定依赖项</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="cargo/reference/deps-overriding.html"><strong aria-hidden="true">9.3.2.</strong> 依赖覆盖</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="cargo/reference/manifest.html"><strong aria-hidden="true">9.3.3.</strong> Cargo.toml 清单详解</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="cargo/reference/cargo-target.html"><strong aria-hidden="true">9.3.4.</strong> Cargo Target</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="cargo/reference/workspaces.html"><strong aria-hidden="true">9.3.5.</strong> 工作空间 Workspace</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="cargo/reference/features/intro.html"><strong aria-hidden="true">9.3.6.</strong> 条件编译 Features</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="cargo/reference/features/examples.html"><strong aria-hidden="true">9.3.6.1.</strong> Features 示例</a></span></li></ol><li class="chapter-item "><span class="chapter-link-wrapper"><a href="cargo/reference/profiles.html"><strong aria-hidden="true">9.3.7.</strong> 发布配置 Profile</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="cargo/reference/configuration.html"><strong aria-hidden="true">9.3.8.</strong> 通过 config.toml 对 Cargo 进行配置</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="cargo/reference/publishing-on-crates.io.html"><strong aria-hidden="true">9.3.9.</strong> 发布到 crates.io</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="cargo/reference/build-script/intro.html"><strong aria-hidden="true">9.3.10.</strong> 构建脚本 build.rs</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="cargo/reference/build-script/examples.html"><strong aria-hidden="true">9.3.10.1.</strong> 构建脚本示例</a></span></li></ol></li></ol></li></ol><li class="chapter-item "><li class="part-title">开发实践</li></li><li class="chapter-item "><li class="spacer"></li></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="usecases/intro.html"><strong aria-hidden="true">10.</strong> 企业落地实践</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="usecases/aws-rust.html"><strong aria-hidden="true">10.1.</strong> AWS 为何这么喜欢 Rust?</a></span></li></ol><li class="chapter-item "><span class="chapter-link-wrapper"><a href="logs/intro.html"><strong aria-hidden="true">11.</strong> 日志和监控</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="logs/about-log.html"><strong aria-hidden="true">11.1.</strong> 日志详解</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="logs/log.html"><strong aria-hidden="true">11.2.</strong> 日志门面 log</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="logs/tracing.html"><strong aria-hidden="true">11.3.</strong> 使用 tracing 记录日志</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="logs/tracing-logger.html"><strong aria-hidden="true">11.4.</strong> 自定义 tracing 的输出格式</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="logs/observe/intro.html"><strong aria-hidden="true">11.5.</strong> 监控</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="logs/observe/about-observe.html"><strong aria-hidden="true">11.5.1.</strong> 可观测性</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="logs/observe/trace.html"><strong aria-hidden="true">11.5.2.</strong> 分布式追踪</a></span></li></ol></li></ol><li class="chapter-item "><span class="chapter-link-wrapper"><a href="practice/intro.html"><strong aria-hidden="true">12.</strong> Rust 最佳实践</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="practice/third-party-libs.html"><strong aria-hidden="true">12.1.</strong> 日常开发三方库精选</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="practice/naming.html"><strong aria-hidden="true">12.2.</strong> 命名规范</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="practice/interview.html"><strong aria-hidden="true">12.3.</strong> 面试经验</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="practice/best-pratice.html"><strong aria-hidden="true">12.4.</strong> 代码开发实践 todo</a></span></li></ol><li class="chapter-item "><span class="chapter-link-wrapper"><a href="too-many-lists/intro.html"><strong aria-hidden="true">13.</strong> 手把手带你实现链表</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="too-many-lists/do-we-need-it.html"><strong aria-hidden="true">13.1.</strong> 我们到底需不需要链表</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="too-many-lists/bad-stack/intro.html"><strong aria-hidden="true">13.2.</strong> 不太优秀的单向链表：栈</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="too-many-lists/bad-stack/layout.html"><strong aria-hidden="true">13.2.1.</strong> 数据布局</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="too-many-lists/bad-stack/basic-operations.html"><strong aria-hidden="true">13.2.2.</strong> 基本操作</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="too-many-lists/bad-stack/final-code.html"><strong aria-hidden="true">13.2.3.</strong> 最后实现</a></span></li></ol><li class="chapter-item "><span class="chapter-link-wrapper"><a href="too-many-lists/ok-stack/intro.html"><strong aria-hidden="true">13.3.</strong> 还可以的单向链表</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="too-many-lists/ok-stack/type-optimizing.html"><strong aria-hidden="true">13.3.1.</strong> 优化类型定义</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="too-many-lists/ok-stack/peek.html"><strong aria-hidden="true">13.3.2.</strong> 定义 Peek 函数</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="too-many-lists/ok-stack/iter.html"><strong aria-hidden="true">13.3.3.</strong> IntoIter 和 Iter</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="too-many-lists/ok-stack/itermut.html"><strong aria-hidden="true">13.3.4.</strong> IterMut 以及完整代码</a></span></li></ol><li class="chapter-item "><span class="chapter-link-wrapper"><a href="too-many-lists/persistent-stack/intro.html"><strong aria-hidden="true">13.4.</strong> 持久化单向链表</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="too-many-lists/persistent-stack/layout.html"><strong aria-hidden="true">13.4.1.</strong> 数据布局和基本操作</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="too-many-lists/persistent-stack/drop-arc.html"><strong aria-hidden="true">13.4.2.</strong> Drop、Arc 及完整代码</a></span></li></ol><li class="chapter-item "><span class="chapter-link-wrapper"><a href="too-many-lists/deque/intro.html"><strong aria-hidden="true">13.5.</strong> 不咋样的双端队列</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="too-many-lists/deque/layout.html"><strong aria-hidden="true">13.5.1.</strong> 数据布局和基本操作</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="too-many-lists/deque/peek.html"><strong aria-hidden="true">13.5.2.</strong> Peek</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="too-many-lists/deque/symmetric.html"><strong aria-hidden="true">13.5.3.</strong> 基本操作的对称镜像</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="too-many-lists/deque/iterator.html"><strong aria-hidden="true">13.5.4.</strong> 迭代器</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="too-many-lists/deque/final-code.html"><strong aria-hidden="true">13.5.5.</strong> 最终代码</a></span></li></ol><li class="chapter-item "><span class="chapter-link-wrapper"><a href="too-many-lists/unsafe-queue/intro.html"><strong aria-hidden="true">13.6.</strong> 不错的 unsafe 队列</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="too-many-lists/unsafe-queue/layout.html"><strong aria-hidden="true">13.6.1.</strong> 数据布局</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="too-many-lists/unsafe-queue/basics.html"><strong aria-hidden="true">13.6.2.</strong> 基本操作</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="too-many-lists/unsafe-queue/miri.html"><strong aria-hidden="true">13.6.3.</strong> Miri</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="too-many-lists/unsafe-queue/stacked-borrow.html"><strong aria-hidden="true">13.6.4.</strong> 栈借用</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="too-many-lists/unsafe-queue/testing-stacked-borrow.html"><strong aria-hidden="true">13.6.5.</strong> 测试栈借用</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="too-many-lists/unsafe-queue/layout2.html"><strong aria-hidden="true">13.6.6.</strong> 数据布局 2</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="too-many-lists/unsafe-queue/extra-junk.html"><strong aria-hidden="true">13.6.7.</strong> 额外的操作</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="too-many-lists/unsafe-queue/final-code.html"><strong aria-hidden="true">13.6.8.</strong> 最终代码</a></span></li></ol><li class="chapter-item "><span class="chapter-link-wrapper"><a href="too-many-lists/production-unsafe-deque/intro.html"><strong aria-hidden="true">13.7.</strong> 生产级的双向 unsafe 队列</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="too-many-lists/production-unsafe-deque/layout.html"><strong aria-hidden="true">13.7.1.</strong> 数据布局</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="too-many-lists/production-unsafe-deque/variance-and-phantomData.html"><strong aria-hidden="true">13.7.2.</strong> 型变与子类型</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="too-many-lists/production-unsafe-deque/basics.html"><strong aria-hidden="true">13.7.3.</strong> 基础结构</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="too-many-lists/production-unsafe-deque/drop-and-panic-safety.html"><strong aria-hidden="true">13.7.4.</strong> 恐慌与安全</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="too-many-lists/production-unsafe-deque/boring-combinatorics.html"><strong aria-hidden="true">13.7.5.</strong> 无聊的组合</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="too-many-lists/production-unsafe-deque/filling-in-random-bits.html"><strong aria-hidden="true">13.7.6.</strong> 其它特征</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="too-many-lists/production-unsafe-deque/testing.html"><strong aria-hidden="true">13.7.7.</strong> 测试</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="too-many-lists/production-unsafe-deque/send-sync-and-compile-tests.html"><strong aria-hidden="true">13.7.8.</strong> Send,Sync和编译测试</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="too-many-lists/production-unsafe-deque/implementing-cursors.html"><strong aria-hidden="true">13.7.9.</strong> 实现游标</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="too-many-lists/production-unsafe-deque/testing-cursors.html"><strong aria-hidden="true">13.7.10.</strong> 测试游标</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="too-many-lists/production-unsafe-deque/final-code.html"><strong aria-hidden="true">13.7.11.</strong> 最终代码</a></span></li></ol><li class="chapter-item "><span class="chapter-link-wrapper"><a href="too-many-lists/advanced-lists/intro.html"><strong aria-hidden="true">13.8.</strong> 使用高级技巧实现链表</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="too-many-lists/advanced-lists/double-singly.html"><strong aria-hidden="true">13.8.1.</strong> 双单向链表</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="too-many-lists/advanced-lists/stack-allocated.html"><strong aria-hidden="true">13.8.2.</strong> 栈上的链表</a></span></li></ol></li></ol><li class="chapter-item "><li class="part-title">攻克编译错误</li></li><li class="chapter-item "><li class="spacer"></li></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="compiler/intro.html"><strong aria-hidden="true">14.</strong> 征服编译错误</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="compiler/fight-with-compiler/intro.html"><strong aria-hidden="true">14.1.</strong> 对抗编译检查</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="compiler/fight-with-compiler/lifetime/intro.html"><strong aria-hidden="true">14.1.1.</strong> 生命周期</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="compiler/fight-with-compiler/lifetime/too-long1.html"><strong aria-hidden="true">14.1.1.1.</strong> 生命周期过大-01</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="compiler/fight-with-compiler/lifetime/too-long2.html"><strong aria-hidden="true">14.1.1.2.</strong> 生命周期过大-02</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="compiler/fight-with-compiler/lifetime/loop.html"><strong aria-hidden="true">14.1.1.3.</strong> 循环中的生命周期</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="compiler/fight-with-compiler/lifetime/closure-with-static.html"><strong aria-hidden="true">14.1.1.4.</strong> 闭包碰到特征对象-01</a></span></li></ol><li class="chapter-item "><span class="chapter-link-wrapper"><a href="compiler/fight-with-compiler/borrowing/intro.html"><strong aria-hidden="true">14.1.2.</strong> 重复借用</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="compiler/fight-with-compiler/borrowing/ref-exist-in-out-fn.html"><strong aria-hidden="true">14.1.2.1.</strong> 同时在函数内外使用引用</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="compiler/fight-with-compiler/borrowing/borrow-distinct-fields-of-struct.html"><strong aria-hidden="true">14.1.2.2.</strong> 智能指针引起的重复借用错误</a></span></li></ol><li class="chapter-item "><span class="chapter-link-wrapper"><a href="compiler/fight-with-compiler/unconstrained.html"><strong aria-hidden="true">14.1.3.</strong> 类型未限制(todo)</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="compiler/fight-with-compiler/phantom-data.html"><strong aria-hidden="true">14.1.4.</strong> 幽灵数据(todo)</a></span></li></ol><li class="chapter-item "><span class="chapter-link-wrapper"><a href="compiler/pitfalls/index.html"><strong aria-hidden="true">14.2.</strong> Rust 常见陷阱</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="compiler/pitfalls/use-vec-in-for.html"><strong aria-hidden="true">14.2.1.</strong> for 循环中使用外部数组</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="compiler/pitfalls/stack-overflow.html"><strong aria-hidden="true">14.2.2.</strong> 线程类型导致的栈溢出</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="compiler/pitfalls/arithmetic-overflow.html"><strong aria-hidden="true">14.2.3.</strong> 算术溢出导致的 panic</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="compiler/pitfalls/closure-with-lifetime.html"><strong aria-hidden="true">14.2.4.</strong> 闭包中奇怪的生命周期</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="compiler/pitfalls/the-disabled-mutability.html"><strong aria-hidden="true">14.2.5.</strong> 可变变量不可变？</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="compiler/pitfalls/multiple-mutable-references.html"><strong aria-hidden="true">14.2.6.</strong> 可变借用失败引发的深入思考</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="compiler/pitfalls/lazy-iterators.html"><strong aria-hidden="true">14.2.7.</strong> 不太勤快的迭代器</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="compiler/pitfalls/weird-ranges.html"><strong aria-hidden="true">14.2.8.</strong> 奇怪的序列 x..y</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="compiler/pitfalls/iterator-everywhere.html"><strong aria-hidden="true">14.2.9.</strong> 无处不在的迭代器</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="compiler/pitfalls/main-with-channel-blocked.html"><strong aria-hidden="true">14.2.10.</strong> 线程间传递消息导致主线程无法结束</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="compiler/pitfalls/utf8-performance.html"><strong aria-hidden="true">14.2.11.</strong> 警惕 UTF-8 引发的性能隐患</a></span></li></ol></li></ol><li class="chapter-item "><li class="part-title">性能优化</li></li><li class="chapter-item "><li class="spacer"></li></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="profiling/intro.html"><strong aria-hidden="true">15.</strong> Rust 性能优化 todo</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="profiling/memory/intro.html"><strong aria-hidden="true">15.1.</strong> 深入内存 todo</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="profiling/memory/pointer-ref.html"><strong aria-hidden="true">15.1.1.</strong> 指针和引用 todo</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="profiling/memory/uninit.html"><strong aria-hidden="true">15.1.2.</strong> 未初始化内存 todo</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="profiling/memory/allocation.html"><strong aria-hidden="true">15.1.3.</strong> 内存分配 todo</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="profiling/memory/layout.html"><strong aria-hidden="true">15.1.4.</strong> 内存布局 todo</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="profiling/memory/virtual.html"><strong aria-hidden="true">15.1.5.</strong> 虚拟内存 todo</a></span></li></ol><li class="chapter-item "><span class="chapter-link-wrapper"><a href="profiling/performance/intro.html"><strong aria-hidden="true">15.2.</strong> 性能调优 doing</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="profiling/performance/string.html"><strong aria-hidden="true">15.2.1.</strong> 字符串操作性能</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="profiling/performance/deep-into-move.html"><strong aria-hidden="true">15.2.2.</strong> 深入理解 move</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="profiling/performance/early-optimise.html"><strong aria-hidden="true">15.2.3.</strong> 糟糕的提前优化 todo</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="profiling/performance/clone-copy.html"><strong aria-hidden="true">15.2.4.</strong> Clone 和 Copy todo</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="profiling/performance/runtime-check.html"><strong aria-hidden="true">15.2.5.</strong> 减少 Runtime check(todo)</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="profiling/performance/cpu-cache.html"><strong aria-hidden="true">15.2.6.</strong> CPU 缓存性能优化 todo</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="profiling/performance/calculate.html"><strong aria-hidden="true">15.2.7.</strong> 计算性能优化 todo</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="profiling/performance/heap-stack.html"><strong aria-hidden="true">15.2.8.</strong> 堆和栈 todo</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="profiling/performance/allocator.html"><strong aria-hidden="true">15.2.9.</strong> 内存 allocator todo</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="profiling/performance/tools.html"><strong aria-hidden="true">15.2.10.</strong> 常用性能测试工具 todo</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="profiling/performance/enum.html"><strong aria-hidden="true">15.2.11.</strong> Enum 内存优化 todo</a></span></li></ol><li class="chapter-item "><span class="chapter-link-wrapper"><a href="profiling/compiler/intro.html"><strong aria-hidden="true">15.3.</strong> 编译优化 todo</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="profiling/compiler/llvm.html"><strong aria-hidden="true">15.3.1.</strong> LLVM todo</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="profiling/compiler/attributes.html"><strong aria-hidden="true">15.3.2.</strong> 常见属性标记 todo</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="profiling/compiler/speed-up.html"><strong aria-hidden="true">15.3.3.</strong> 提升编译速度 todo</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="profiling/compiler/optimization/intro.html"><strong aria-hidden="true">15.3.4.</strong> 编译器优化 todo</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="profiling/compiler/optimization/option.html"><strong aria-hidden="true">15.3.4.1.</strong> Option 枚举 todo</a></span></li></ol></li></ol></li></ol><li class="chapter-item "><li class="part-title">附录</li></li><li class="chapter-item "><li class="spacer"></li></li><li class="chapter-item "><span class="chapter-link-wrapper"><span><strong aria-hidden="true">16.</strong> Appendix</span><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="appendix/keywords.html"><strong aria-hidden="true">16.1.</strong> 关键字</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="appendix/operators.html"><strong aria-hidden="true">16.2.</strong> 运算符与符号</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="appendix/expressions.html"><strong aria-hidden="true">16.3.</strong> 表达式</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="appendix/derive.html"><strong aria-hidden="true">16.4.</strong> 派生特征 trait</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="appendix/prelude.html"><strong aria-hidden="true">16.5.</strong> prelude 模块 todo</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="appendix/rust-version.html"><strong aria-hidden="true">16.6.</strong> Rust 版本说明</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="appendix/rust-versions/intro.html"><strong aria-hidden="true">16.7.</strong> Rust 历次版本更新解读</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="appendix/rust-versions/1.58.html"><strong aria-hidden="true">16.7.1.</strong> 1.58</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="appendix/rust-versions/1.59.html"><strong aria-hidden="true">16.7.2.</strong> 1.59</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="appendix/rust-versions/1.60.html"><strong aria-hidden="true">16.7.3.</strong> 1.60</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="appendix/rust-versions/1.61.html"><strong aria-hidden="true">16.7.4.</strong> 1.61</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="appendix/rust-versions/1.62.html"><strong aria-hidden="true">16.7.5.</strong> 1.62</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="appendix/rust-versions/1.63.html"><strong aria-hidden="true">16.7.6.</strong> 1.63</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="appendix/rust-versions/1.64.html"><strong aria-hidden="true">16.7.7.</strong> 1.64</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="appendix/rust-versions/1.65.html"><strong aria-hidden="true">16.7.8.</strong> 1.65</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="appendix/rust-versions/1.66.html"><strong aria-hidden="true">16.7.9.</strong> 1.66</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="appendix/rust-versions/1.67.html"><strong aria-hidden="true">16.7.10.</strong> 1.67</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="appendix/rust-versions/1.68.html"><strong aria-hidden="true">16.7.11.</strong> 1.68</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="appendix/rust-versions/1.69.html"><strong aria-hidden="true">16.7.12.</strong> 1.69</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="appendix/rust-versions/1.70.html"><strong aria-hidden="true">16.7.13.</strong> 1.70</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="appendix/rust-versions/1.71.html"><strong aria-hidden="true">16.7.14.</strong> 1.71</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="appendix/rust-versions/1.72.html"><strong aria-hidden="true">16.7.15.</strong> 1.72</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="appendix/rust-versions/1.73.html"><strong aria-hidden="true">16.7.16.</strong> 1.73</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="appendix/rust-versions/1.74.html"><strong aria-hidden="true">16.7.17.</strong> 1.74</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="appendix/rust-versions/1.75.html"><strong aria-hidden="true">16.7.18.</strong> 1.75</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="appendix/rust-versions/1.76.html"><strong aria-hidden="true">16.7.19.</strong> 1.76</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="appendix/rust-versions/1.77.html"><strong aria-hidden="true">16.7.20.</strong> 1.77</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="appendix/rust-versions/1.78.html"><strong aria-hidden="true">16.7.21.</strong> 1.78</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="appendix/rust-versions/1.79.html"><strong aria-hidden="true">16.7.22.</strong> 1.79</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="appendix/rust-versions/1.80.html"><strong aria-hidden="true">16.7.23.</strong> 1.80</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="appendix/rust-versions/1.81.html"><strong aria-hidden="true">16.7.24.</strong> 1.81</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="appendix/rust-versions/1.82.html"><strong aria-hidden="true">16.7.25.</strong> 1.82</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="appendix/rust-versions/1.83.html"><strong aria-hidden="true">16.7.26.</strong> 1.83</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="appendix/rust-versions/1.84.html"><strong aria-hidden="true">16.7.27.</strong> 1.84</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="appendix/rust-versions/1.85.html"><strong aria-hidden="true">16.7.28.</strong> 1.85</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="appendix/rust-versions/1.86.html"><strong aria-hidden="true">16.7.29.</strong> 1.86</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="appendix/rust-versions/1.87.html"><strong aria-hidden="true">16.7.30.</strong> 1.87</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="appendix/rust-versions/1.88.html"><strong aria-hidden="true">16.7.31.</strong> 1.88</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="appendix/rust-versions/1.89.html"><strong aria-hidden="true">16.7.32.</strong> 1.89</a></span></li></ol></li></ol></li></ol>';
        // Set the current, active page, and reveal it if it's hidden
        let current_page = document.location.href.toString().split('#')[0].split('?')[0];
        if (current_page.endsWith('/')) {
            current_page += 'index.html';
        }
        const links = Array.prototype.slice.call(this.querySelectorAll('a'));
        const l = links.length;
        for (let i = 0; i < l; ++i) {
            const link = links[i];
            const href = link.getAttribute('href');
            if (href && !href.startsWith('#') && !/^(?:[a-z+]+:)?\/\//.test(href)) {
                link.href = path_to_root + href;
            }
            // The 'index' page is supposed to alias the first chapter in the book.
            if (link.href === current_page
                || i === 0
                && path_to_root === ''
                && current_page.endsWith('/index.html')) {
                link.classList.add('active');
                let parent = link.parentElement;
                while (parent) {
                    if (parent.tagName === 'LI' && parent.classList.contains('chapter-item')) {
                        parent.classList.add('expanded');
                    }
                    parent = parent.parentElement;
                }
            }
        }
        // Track and set sidebar scroll position
        this.addEventListener('click', e => {
            if (e.target.tagName === 'A') {
                const clientRect = e.target.getBoundingClientRect();
                const sidebarRect = this.getBoundingClientRect();
                sessionStorage.setItem('sidebar-scroll-offset', clientRect.top - sidebarRect.top);
            }
        }, { passive: true });
        const sidebarScrollOffset = sessionStorage.getItem('sidebar-scroll-offset');
        sessionStorage.removeItem('sidebar-scroll-offset');
        if (sidebarScrollOffset !== null) {
            // preserve sidebar scroll position when navigating via links within sidebar
            const activeSection = this.querySelector('.active');
            if (activeSection) {
                const clientRect = activeSection.getBoundingClientRect();
                const sidebarRect = this.getBoundingClientRect();
                const currentOffset = clientRect.top - sidebarRect.top;
                this.scrollTop += currentOffset - parseFloat(sidebarScrollOffset);
            }
        } else {
            // scroll sidebar to current active section when navigating via
            // 'next/previous chapter' buttons
            const activeSection = document.querySelector('#mdbook-sidebar .active');
            if (activeSection) {
                activeSection.scrollIntoView({ block: 'center' });
            }
        }
        // Toggle buttons
        const sidebarAnchorToggles = document.querySelectorAll('.chapter-fold-toggle');
        function toggleSection(ev) {
            ev.currentTarget.parentElement.parentElement.classList.toggle('expanded');
        }
        Array.from(sidebarAnchorToggles).forEach(el => {
            el.addEventListener('click', toggleSection);
        });
    }
}
window.customElements.define('mdbook-sidebar-scrollbox', MDBookSidebarScrollbox);


// ---------------------------------------------------------------------------
// Support for dynamically adding headers to the sidebar.

(function() {
    // This is used to detect which direction the page has scrolled since the
    // last scroll event.
    let lastKnownScrollPosition = 0;
    // This is the threshold in px from the top of the screen where it will
    // consider a header the "current" header when scrolling down.
    const defaultDownThreshold = 150;
    // Same as defaultDownThreshold, except when scrolling up.
    const defaultUpThreshold = 300;
    // The threshold is a virtual horizontal line on the screen where it
    // considers the "current" header to be above the line. The threshold is
    // modified dynamically to handle headers that are near the bottom of the
    // screen, and to slightly offset the behavior when scrolling up vs down.
    let threshold = defaultDownThreshold;
    // This is used to disable updates while scrolling. This is needed when
    // clicking the header in the sidebar, which triggers a scroll event. It
    // is somewhat finicky to detect when the scroll has finished, so this
    // uses a relatively dumb system of disabling scroll updates for a short
    // time after the click.
    let disableScroll = false;
    // Array of header elements on the page.
    let headers;
    // Array of li elements that are initially collapsed headers in the sidebar.
    // I'm not sure why eslint seems to have a false positive here.
    // eslint-disable-next-line prefer-const
    let headerToggles = [];
    // This is a debugging tool for the threshold which you can enable in the console.
    let thresholdDebug = false;

    // Updates the threshold based on the scroll position.
    function updateThreshold() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        // The number of pixels below the viewport, at most documentHeight.
        // This is used to push the threshold down to the bottom of the page
        // as the user scrolls towards the bottom.
        const pixelsBelow = Math.max(0, documentHeight - (scrollTop + windowHeight));
        // The number of pixels above the viewport, at least defaultDownThreshold.
        // Similar to pixelsBelow, this is used to push the threshold back towards
        // the top when reaching the top of the page.
        const pixelsAbove = Math.max(0, defaultDownThreshold - scrollTop);
        // How much the threshold should be offset once it gets close to the
        // bottom of the page.
        const bottomAdd = Math.max(0, windowHeight - pixelsBelow - defaultDownThreshold);
        let adjustedBottomAdd = bottomAdd;

        // Adjusts bottomAdd for a small document. The calculation above
        // assumes the document is at least twice the windowheight in size. If
        // it is less than that, then bottomAdd needs to be shrunk
        // proportional to the difference in size.
        if (documentHeight < windowHeight * 2) {
            const maxPixelsBelow = documentHeight - windowHeight;
            const t = 1 - pixelsBelow / Math.max(1, maxPixelsBelow);
            const clamp = Math.max(0, Math.min(1, t));
            adjustedBottomAdd *= clamp;
        }

        let scrollingDown = true;
        if (scrollTop < lastKnownScrollPosition) {
            scrollingDown = false;
        }

        if (scrollingDown) {
            // When scrolling down, move the threshold up towards the default
            // downwards threshold position. If near the bottom of the page,
            // adjustedBottomAdd will offset the threshold towards the bottom
            // of the page.
            const amountScrolledDown = scrollTop - lastKnownScrollPosition;
            const adjustedDefault = defaultDownThreshold + adjustedBottomAdd;
            threshold = Math.max(adjustedDefault, threshold - amountScrolledDown);
        } else {
            // When scrolling up, move the threshold down towards the default
            // upwards threshold position. If near the bottom of the page,
            // quickly transition the threshold back up where it normally
            // belongs.
            const amountScrolledUp = lastKnownScrollPosition - scrollTop;
            const adjustedDefault = defaultUpThreshold - pixelsAbove
                + Math.max(0, adjustedBottomAdd - defaultDownThreshold);
            threshold = Math.min(adjustedDefault, threshold + amountScrolledUp);
        }

        if (documentHeight <= windowHeight) {
            threshold = 0;
        }

        if (thresholdDebug) {
            const id = 'mdbook-threshold-debug-data';
            let data = document.getElementById(id);
            if (data === null) {
                data = document.createElement('div');
                data.id = id;
                data.style.cssText = `
                    position: fixed;
                    top: 50px;
                    right: 10px;
                    background-color: 0xeeeeee;
                    z-index: 9999;
                    pointer-events: none;
                `;
                document.body.appendChild(data);
            }
            data.innerHTML = `
                <table>
                  <tr><td>documentHeight</td><td>${documentHeight.toFixed(1)}</td></tr>
                  <tr><td>windowHeight</td><td>${windowHeight.toFixed(1)}</td></tr>
                  <tr><td>scrollTop</td><td>${scrollTop.toFixed(1)}</td></tr>
                  <tr><td>pixelsAbove</td><td>${pixelsAbove.toFixed(1)}</td></tr>
                  <tr><td>pixelsBelow</td><td>${pixelsBelow.toFixed(1)}</td></tr>
                  <tr><td>bottomAdd</td><td>${bottomAdd.toFixed(1)}</td></tr>
                  <tr><td>adjustedBottomAdd</td><td>${adjustedBottomAdd.toFixed(1)}</td></tr>
                  <tr><td>scrollingDown</td><td>${scrollingDown}</td></tr>
                  <tr><td>threshold</td><td>${threshold.toFixed(1)}</td></tr>
                </table>
            `;
            drawDebugLine();
        }

        lastKnownScrollPosition = scrollTop;
    }

    function drawDebugLine() {
        if (!document.body) {
            return;
        }
        const id = 'mdbook-threshold-debug-line';
        const existingLine = document.getElementById(id);
        if (existingLine) {
            existingLine.remove();
        }
        const line = document.createElement('div');
        line.id = id;
        line.style.cssText = `
            position: fixed;
            top: ${threshold}px;
            left: 0;
            width: 100vw;
            height: 2px;
            background-color: red;
            z-index: 9999;
            pointer-events: none;
        `;
        document.body.appendChild(line);
    }

    function mdbookEnableThresholdDebug() {
        thresholdDebug = true;
        updateThreshold();
        drawDebugLine();
    }

    window.mdbookEnableThresholdDebug = mdbookEnableThresholdDebug;

    // Updates which headers in the sidebar should be expanded. If the current
    // header is inside a collapsed group, then it, and all its parents should
    // be expanded.
    function updateHeaderExpanded(currentA) {
        // Add expanded to all header-item li ancestors.
        let current = currentA.parentElement;
        while (current) {
            if (current.tagName === 'LI' && current.classList.contains('header-item')) {
                current.classList.add('expanded');
            }
            current = current.parentElement;
        }
    }

    // Updates which header is marked as the "current" header in the sidebar.
    // This is done with a virtual Y threshold, where headers at or below
    // that line will be considered the current one.
    function updateCurrentHeader() {
        if (!headers || !headers.length) {
            return;
        }

        // Reset the classes, which will be rebuilt below.
        const els = document.getElementsByClassName('current-header');
        for (const el of els) {
            el.classList.remove('current-header');
        }
        for (const toggle of headerToggles) {
            toggle.classList.remove('expanded');
        }

        // Find the last header that is above the threshold.
        let lastHeader = null;
        for (const header of headers) {
            const rect = header.getBoundingClientRect();
            if (rect.top <= threshold) {
                lastHeader = header;
            } else {
                break;
            }
        }
        if (lastHeader === null) {
            lastHeader = headers[0];
            const rect = lastHeader.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            if (rect.top >= windowHeight) {
                return;
            }
        }

        // Get the anchor in the summary.
        const href = '#' + lastHeader.id;
        const a = [...document.querySelectorAll('.header-in-summary')]
            .find(element => element.getAttribute('href') === href);
        if (!a) {
            return;
        }

        a.classList.add('current-header');

        updateHeaderExpanded(a);
    }

    // Updates which header is "current" based on the threshold line.
    function reloadCurrentHeader() {
        if (disableScroll) {
            return;
        }
        updateThreshold();
        updateCurrentHeader();
    }


    // When clicking on a header in the sidebar, this adjusts the threshold so
    // that it is located next to the header. This is so that header becomes
    // "current".
    function headerThresholdClick(event) {
        // See disableScroll description why this is done.
        disableScroll = true;
        setTimeout(() => {
            disableScroll = false;
        }, 100);
        // requestAnimationFrame is used to delay the update of the "current"
        // header until after the scroll is done, and the header is in the new
        // position.
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                // Closest is needed because if it has child elements like <code>.
                const a = event.target.closest('a');
                const href = a.getAttribute('href');
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    threshold = targetElement.getBoundingClientRect().bottom;
                    updateCurrentHeader();
                }
            });
        });
    }

    // Takes the nodes from the given head and copies them over to the
    // destination, along with some filtering.
    function filterHeader(source, dest) {
        const clone = source.cloneNode(true);
        clone.querySelectorAll('mark').forEach(mark => {
            mark.replaceWith(...mark.childNodes);
        });
        dest.append(...clone.childNodes);
    }

    // Scans page for headers and adds them to the sidebar.
    document.addEventListener('DOMContentLoaded', function() {
        const activeSection = document.querySelector('#mdbook-sidebar .active');
        if (activeSection === null) {
            return;
        }

        const main = document.getElementsByTagName('main')[0];
        headers = Array.from(main.querySelectorAll('h2, h3, h4, h5, h6'))
            .filter(h => h.id !== '' && h.children.length && h.children[0].tagName === 'A');

        if (headers.length === 0) {
            return;
        }

        // Build a tree of headers in the sidebar.

        const stack = [];

        const firstLevel = parseInt(headers[0].tagName.charAt(1));
        for (let i = 1; i < firstLevel; i++) {
            const ol = document.createElement('ol');
            ol.classList.add('section');
            if (stack.length > 0) {
                stack[stack.length - 1].ol.appendChild(ol);
            }
            stack.push({level: i + 1, ol: ol});
        }

        // The level where it will start folding deeply nested headers.
        const foldLevel = 3;

        for (let i = 0; i < headers.length; i++) {
            const header = headers[i];
            const level = parseInt(header.tagName.charAt(1));

            const currentLevel = stack[stack.length - 1].level;
            if (level > currentLevel) {
                // Begin nesting to this level.
                for (let nextLevel = currentLevel + 1; nextLevel <= level; nextLevel++) {
                    const ol = document.createElement('ol');
                    ol.classList.add('section');
                    const last = stack[stack.length - 1];
                    const lastChild = last.ol.lastChild;
                    // Handle the case where jumping more than one nesting
                    // level, which doesn't have a list item to place this new
                    // list inside of.
                    if (lastChild) {
                        lastChild.appendChild(ol);
                    } else {
                        last.ol.appendChild(ol);
                    }
                    stack.push({level: nextLevel, ol: ol});
                }
            } else if (level < currentLevel) {
                while (stack.length > 1 && stack[stack.length - 1].level > level) {
                    stack.pop();
                }
            }

            const li = document.createElement('li');
            li.classList.add('header-item');
            li.classList.add('expanded');
            if (level < foldLevel) {
                li.classList.add('expanded');
            }
            const span = document.createElement('span');
            span.classList.add('chapter-link-wrapper');
            const a = document.createElement('a');
            span.appendChild(a);
            a.href = '#' + header.id;
            a.classList.add('header-in-summary');
            filterHeader(header.children[0], a);
            a.addEventListener('click', headerThresholdClick);
            const nextHeader = headers[i + 1];
            if (nextHeader !== undefined) {
                const nextLevel = parseInt(nextHeader.tagName.charAt(1));
                if (nextLevel > level && level >= foldLevel) {
                    const toggle = document.createElement('a');
                    toggle.classList.add('chapter-fold-toggle');
                    toggle.classList.add('header-toggle');
                    toggle.addEventListener('click', () => {
                        li.classList.toggle('expanded');
                    });
                    const toggleDiv = document.createElement('div');
                    toggleDiv.textContent = '❱';
                    toggle.appendChild(toggleDiv);
                    span.appendChild(toggle);
                    headerToggles.push(li);
                }
            }
            li.appendChild(span);

            const currentParent = stack[stack.length - 1];
            currentParent.ol.appendChild(li);
        }

        const onThisPage = document.createElement('div');
        onThisPage.classList.add('on-this-page');
        onThisPage.append(stack[0].ol);
        const activeItemSpan = activeSection.parentElement;
        activeItemSpan.after(onThisPage);
    });

    document.addEventListener('DOMContentLoaded', reloadCurrentHeader);
    document.addEventListener('scroll', reloadCurrentHeader, { passive: true });
})();

