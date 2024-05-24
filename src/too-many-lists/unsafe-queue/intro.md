# 不错的 unsafe 队列

在之前章节中，基于内部可变性和引用计数的双向链表有些失控了，原因在于 `Rc` 和 `RefCell` 对于简单的任务而言，它们是非常称职的，但是对于复杂的任务，它们可能会变得相当笨拙，特别是当我们试图隐藏一些细节时。

总之，一定有更好的办法！下面来看看该如何使用裸指针和 unsafe 代码实现一个单向链表。

> 大家可能想等着看我犯错误，unsafe 嘛，不犯错误不可能的，但是呢，俺偏就不犯错误：）

国际惯例，添加第五个链表所需的文件 `fifth.rs`:

```rust,ignore,mdbook-runnable
// in lib.rs

pub mod first;
pub mod second;
pub mod third;
pub mod fourth;
pub mod fifth;
```

虽然我们依然会从零开始撸代码，但是 `fifth.rs` 的代码会跟 `second.rs` 存在一定的重叠，因为对于链表而言，队列其实就是栈的增强。
