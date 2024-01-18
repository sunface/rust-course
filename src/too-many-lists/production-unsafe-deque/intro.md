# A Production-Quality Unsafe Doubly-Linked Deque

我们终于成功了。我最大的克星：**[std::collections::LinkedList](https://github.com/rust-lang/rust/blob/master/library/alloc/src/collections/linked_list.rs)，双向链接的 Deque**。

我尝试过但未能击败的那个。

来吧，我将向你展示你需要知道的一切，帮助我一劳永逸地摧毁它--实现一个 **unsafe** 的生产质量双向链接 Deque 所需要知道的一切。

我们将彻底重写我那古老的 Rust 1.0 linked-list crate，那个 linked-list 客观上比 std 要好，它从 2015 年开始，就存在 Cursors (游标，后面文章会介绍)！而标准库2022年了还没有的东西！
