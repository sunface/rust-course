# Drop and Panic Safety

嘿，你注意到这些注释了吗：

```rust,ignore,mdbook-runnable
// Note that we don't need to mess around with `take` anymore
// because everything is Copy and there are no dtors that will
// run if we mess up... right? :) Riiiight? :)))
```

这对吗？

你忘记你正在读那本书了吗？当然这是错误的（部分上是）。

让我们再次看看 pop_front 内部:

```rust,ignore,mdbook-runnable
// Bring the Box back to life so we can move out its value and
// Drop it (Box continues to magically understand this for us).
let boxed_node = Box::from_raw(node.as_ptr());
let result = boxed_node.elem;

// Make the next node into the new front.
self.front = boxed_node.back;
if let Some(new) = self.front {
    // Cleanup its reference to the removed node
    (*new.as_ptr()).front = None;
} else {
    // If the front is now null, then this list is now empty!
    debug_assert!(self.len == 1);
    self.back = None;
}

self.len -= 1;
result
// Box gets implicitly freed here, knows there is no T.
```

你看到 bug 了吗? 真可怕, 是这一行:

```rust,ignore,mdbook-runnable
debug_assert!(self.len == 1);
```

大多数情况下，你不需要考虑或担心恐慌，但一旦你开始编写真正不安全的代码，并在 "invariants(不可变性) "上大做文章，你就需要对恐慌保持高度警惕！

我们必须谈谈 [_异常安全_](https://doc.rust-lang.org/nightly/nomicon/exception-safety.html) （又名恐慌安全、解除安全......）。

情况是这样的：在默认情况下，恐慌会被 unwinding。unwind 只是 "让每个函数立即返回 "的一种花哨说法。你可能会想："好吧，如果每个函数都返回，那么程序就要结束了，何必在乎它呢？"但你错了！

我们必须关注有两个原因：当函数返回时，析构函数会运行，而且可以捕获 unwind。在这两种情况下，代码都可能在恐慌发生后继续运行，因此我们必须非常小心，确保我们的不安全的集合在恐慌发生时始终处于某种一致的状态，因为每次恐慌都是隐式的提前返回！

让我们想一想，到这一行时，我们的集合处于什么状态：

我们将 boxed_node 放在栈上，并从中提取了元素。如果我们在此时返回，Box 将被丢弃，节点将被释放。self.back 仍然指向那个被释放的节点！一旦我们使用 self.back 来处理一些事情，这就可能导致释放后再使用！

有趣的是，这行也有类似的问题，但它要安全得多：

```rust,ignore,mdbook-runnable
self.len -= 1;
```

默认情况下，Rust 会在调试构建时检查上溢和下溢，并在发生时产生恐慌。是的，每一次算术运算都会带来恐慌安全隐患！这行还好，他不会导致内存错误，因为之前已经完成了该做的所有操作。所以调试断言哪行在某种意义上更糟糕，因为它可能将一个小问题升级为关键问题！

在实现过程中，只要我们确保在别人注意到之前修复它们，我们可以临时性的破坏 invariants(不可变性)。这实际上是 Rust 的集合所有权和借用系统的 "杀手级应用 "之一：如果一个操作需要一个 `&mut Self`，那么我们就能保证对我们的集合拥有独占访问权，而且我们可以暂时破坏 invariants(不可变性)，因为我们知道没有人能偷偷摸摸地破坏它。

我们有两种方法可以让我们的代码更健壮：

- 更积极地使用 Option::take 这样的操作，因为它们更 "事务性"，更倾向于保留 invariants(不可变性)。
- 放弃 debug_asserts，相信自己能写出更好的测试，并使用专用的 "完整性检查 "函数，而这些函数永远不会在用户代码中运行。

原则上，我喜欢第一种方案，但它对双链路列表的实际效果并不好，因为所有内容都是双冗余编码的。Option::take 并不能解决这里的问题，但将 debug_assert 下移一行却可以。不过说真的，为什么要为难我们自己呢？让我们移除那些 debug_asserts，并确保任何可能引起恐慌的事情都发生在我们方法的开头或结尾，而我们在这些地方保持 invariants(不可变性)。

这是我们的全部实现：

```rust,ignore,mdbook-runnable
use std::ptr::NonNull;
use std::marker::PhantomData;

pub struct LinkedList<T> {
    front: Link<T>,
    back: Link<T>,
    len: usize,
    _boo: PhantomData<T>,
}

type Link<T> = Option<NonNull<Node<T>>>;

struct Node<T> {
    front: Link<T>,
    back: Link<T>,
    elem: T,
}

impl<T> LinkedList<T> {
    pub fn new() -> Self {
        Self {
            front: None,
            back: None,
            len: 0,
            _boo: PhantomData,
        }
    }

    pub fn push_front(&mut self, elem: T) {
        // SAFETY: it's a linked-list, what do you want?
        unsafe {
            let new = NonNull::new_unchecked(Box::into_raw(Box::new(Node {
                front: None,
                back: None,
                elem,
            })));
            if let Some(old) = self.front {
                // Put the new front before the old one
                (*old.as_ptr()).front = Some(new);
                (*new.as_ptr()).back = Some(old);
            } else {
                // If there's no front, then we're the empty list and need
                // to set the back too.
                self.back = Some(new);
            }
            // These things always happen!
            self.front = Some(new);
            self.len += 1;
        }
    }

    pub fn pop_front(&mut self) -> Option<T> {
        unsafe {
            // Only have to do stuff if there is a front node to pop.
            self.front.map(|node| {
                // Bring the Box back to life so we can move out its value and
                // Drop it (Box continues to magically understand this for us).
                let boxed_node = Box::from_raw(node.as_ptr());
                let result = boxed_node.elem;

                // Make the next node into the new front.
                self.front = boxed_node.back;
                if let Some(new) = self.front {
                    // Cleanup its reference to the removed node
                    (*new.as_ptr()).front = None;
                } else {
                    // If the front is now null, then this list is now empty!
                    self.back = None;
                }

                self.len -= 1;
                result
                // Box gets implicitly freed here, knows there is no T.
            })
        }
    }

    pub fn len(&self) -> usize {
        self.len
    }
}
```

这还有什么可以引发恐慌？老实说，要知道这些需要你是 Rust 专家，不过幸好我是！

在这段代码中，我能看到的唯一可能引起恐慌的地方是 `Box::new`（用于内存不足的情况）和 `len` 运算。所有这些都在我们方法的最末端或最开始，所以，我们是安全的！
