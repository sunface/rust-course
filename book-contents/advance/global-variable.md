# 全局变量

在一些场景，我们可能需要全局变量来简化状态共享的代码，包括全局ID，全局数据存储等等，下面我们来一一给出对应的实现方法。

## 全局唯一ID

```rust
use std::sync::atomic::{Ordering, AtomicUsize};

struct Factory{
    factory_id: usize,
}

static GLOBAL_ID_COUNTER: AtomicUsize = AtomicUsize::new(0);
// This gives large room for ids to overflow
// This code assumes that your app never would need many factories
const MAX_ID: usize = usize::MAX / 2;

fn generate_id()->usize{
    // Check overflow twice to avoid growing of GLOBAL_ID_COUNTER after overflow.
    let current_val = GLOBAL_ID_COUNTER.load(Ordering::Relaxed);
    if current_val > MAX_ID{
        panic!("Factory ids overflowed");
    }
    let next_id = GLOBAL_ID_COUNTER.fetch_add(1, Ordering::Relaxed);
    if next_id > MAX_ID{
        panic!("Factory ids overflowed");
    }
    next_id
}

impl Factory{
    fn new()->Self{
        Self{
            factory_id: generate_id()
        }
    }
}
```

## 从函数中返回全局变量
https://www.reddit.com/r/learnrust/comments/rqn74g/cant_a_function_return_a_reference_to_some_global/