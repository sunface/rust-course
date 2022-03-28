# 双单向链表
在之前的双向链表章节中，我们一度非常纠结，原因来自同样纠结成一团的所有权依赖。还有一个重要原因就是：先入为主的链表定义。

谁说所有的链接一定要一个方向呢？这里一起来尝试下新的东东：链表的其中一半朝左，另一半朝右。

新规矩( 老规矩是创建文件 )，创建一个新的模块:
```rust
// lib.rs
// ...
pub mod silly1;     // NEW!
```

```rust
// silly1.rs
use crate::second::List as Stack;

struct List<T> {
    left: Stack<T>,
    right: Stack<T>,
}
```

