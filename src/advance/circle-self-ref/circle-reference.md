# Weak 与循环引用

Rust 的安全性是众所周知的，但是不代表它不会内存泄漏。一个典型的例子就是同时使用 `Rc<T>` 和 `RefCell<T>` 创建循环引用，最终这些引用的计数都无法被归零，因此 `Rc<T>` 拥有的值也不会被释放清理。

## 何为循环引用

关于内存泄漏，如果你没有充足的 Rust 经验，可能都无法造出一份代码来再现它：

```rust
use crate::List::{Cons, Nil};
use std::cell::RefCell;
use std::rc::Rc;

#[derive(Debug)]
enum List {
    Cons(i32, RefCell<Rc<List>>),
    Nil,
}

impl List {
    fn tail(&self) -> Option<&RefCell<Rc<List>>> {
        match self {
            Cons(_, item) => Some(item),
            Nil => None,
        }
    }
}

fn main() {}
```

这里我们创建一个有些复杂的枚举类型 `List`，这个类型很有意思，它的每个值都指向了另一个 `List`，此外，得益于 `Rc` 的使用还允许多个值指向一个 `List`：

<img alt="" src="https://pica.zhimg.com/80/v2-0db007dfb4167ebc22f50cf5b5a85f53_1440w.png" class="center"  />

如上图所示，每个矩形框节点都是一个 `List` 类型，它们或者是拥有值且指向另一个 `List` 的`Cons`，或者是一个没有值的终结点 `Nil`。同时，由于 `RefCell` 的使用，每个 `List` 所指向的 `List` 还能够被修改。

下面来使用一下这个复杂的 `List` 枚举：

```rust
fn main() {
    let a = Rc::new(Cons(5, RefCell::new(Rc::new(Nil))));

    println!("a的初始化rc计数 = {}", Rc::strong_count(&a));
    println!("a指向的节点 = {:?}", a.tail());

    // 创建`b`到`a`的引用
    let b = Rc::new(Cons(10, RefCell::new(Rc::clone(&a))));

    println!("在b创建后，a的rc计数 = {}", Rc::strong_count(&a));
    println!("b的初始化rc计数 = {}", Rc::strong_count(&b));
    println!("b指向的节点 = {:?}", b.tail());

    // 利用RefCell的可变性，创建了`a`到`b`的引用
    if let Some(link) = a.tail() {
        *link.borrow_mut() = Rc::clone(&b);
    }

    println!("在更改a后，b的rc计数 = {}", Rc::strong_count(&b));
    println!("在更改a后，a的rc计数 = {}", Rc::strong_count(&a));

    // 下面一行println!将导致循环引用
    // 我们可怜的8MB大小的main线程栈空间将被它冲垮，最终造成栈溢出
    // println!("a next item = {:?}", a.tail());
}
```

这个类型定义看着复杂，使用起来更复杂！不过排除这些因素，我们可以清晰看出：

1. 在创建了 `a` 后，紧接着就使用 `a` 创建了 `b`，因此 `b` 引用了 `a`
2. 然后我们又利用 `Rc` 克隆了 `b`，然后通过 `RefCell` 的可变性，让 `a` 引用了 `b`

至此我们成功创建了循环引用`a`-> `b` -> `a` -> `b` ····

先来观察下引用计数：

```console
a的初始化rc计数 = 1
a指向的节点 = Some(RefCell { value: Nil })
在b创建后，a的rc计数 = 2
b的初始化rc计数 = 1
b指向的节点 = Some(RefCell { value: Cons(5, RefCell { value: Nil }) })
在更改a后，b的rc计数 = 2
在更改a后，a的rc计数 = 2
```

在 `main` 函数结束前，`a` 和 `b` 的引用计数均是 `2`，随后 `b` 触发 `Drop`，此时引用计数会变为 `1`，并不会归 `0`，因此 `b` 所指向内存不会被释放，同理可得 `a` 指向的内存也不会被释放，最终发生了内存泄漏。

下面一张图很好的展示了这种引用循环关系：
<img alt="" src="https://pic1.zhimg.com/80/v2-2dbfc981f05019bf70bf81c93f956c35_1440w.png" class="center"  />

现在我们还需要轻轻的推一下，让塔米诺骨牌轰然倒塌。反注释最后一行代码，试着运行下：

```console
RefCell { value: Cons(5, RefCell { value: Cons(10, RefCell { value: Cons(5, RefCell { value: Cons(10, RefCell { value: Cons(5, RefCell { value: Cons(10, RefCell {
...无穷无尽
thread 'main' has overflowed its stack
fatal runtime error: stack overflow
```

通过 `a.tail` 的调用，Rust 试图打印出 `a -> b -> a ···` 的所有内容，但是在不懈的努力后，`main` 线程终于不堪重负，发生了[栈溢出](https://course.rs/pitfalls/stack-overflow.html)。

以上的代码可能并不会造成什么大的问题，但是在一个更加复杂的程序中，类似的问题可能会造成你的程序不断地分配内存、泄漏内存，最终程序会不幸**OOM**，当然这其中的 CPU 损耗也不可小觑。

总之，创建引用并不简单，但是也并不是完全遇不到，当你使用 `RefCell<Rc<T>>` 或者类似的类型嵌套组合（具备内部可变性和引用计数）时，就要打起万分精神，前面可能是深渊！

那么问题来了？ 如果我们确实需要实现上面的功能，该怎么办？答案是使用 `Weak`。

## Weak

`Weak` 非常类似于 `Rc`，但是与 `Rc` 持有所有权不同，`Weak` 不持有所有权，它仅仅保存一份指向数据的弱引用：如果你想要访问数据，需要通过 `Weak` 指针的 `upgrade` 方法实现，该方法返回一个类型为 `Option<Rc<T>>` 的值。

看到这个返回，相信大家就懂了：何为弱引用？就是**不保证引用关系依然存在**，如果不存在，就返回一个 `None`！

因为 `Weak` 引用不计入所有权，因此它**无法阻止所引用的内存值被释放掉**，而且 `Weak` 本身不对值的存在性做任何担保，引用的值还存在就返回 `Some`，不存在就返回 `None`。

#### Weak 与 Rc 对比

我们来将 `Weak` 与 `Rc` 进行以下简单对比：

| `Weak`                                          | `Rc`                                      |
| ----------------------------------------------- | ----------------------------------------- |
| 不计数                                          | 引用计数                                  |
| 不拥有所有权                                    | 拥有值的所有权                            |
| 不阻止值被释放(drop)                            | 所有权计数归零，才能 drop                 |
| 引用的值存在返回 `Some`，不存在返回 `None `     | 引用的值必定存在                          |
| 通过 `upgrade` 取到 `Option<Rc<T>>`，然后再取值 | 通过 `Deref` 自动解引用，取值无需任何操作 |

通过这个对比，可以非常清晰的看出 `Weak` 为何这么弱，而这种弱恰恰非常适合我们实现以下的场景：

- 持有一个 `Rc` 对象的临时引用，并且不在乎引用的值是否依然存在
- 阻止 `Rc` 导致的循环引用，因为 `Rc` 的所有权机制，会导致多个 `Rc` 都无法计数归零

使用方式简单总结下：**对于父子引用关系，可以让父节点通过 `Rc` 来引用子节点，然后让子节点通过 `Weak` 来引用父节点**。

#### Weak 总结

因为 `Weak` 本身并不是很好理解，因此我们再来帮大家梳理总结下，然后再通过一个例子，来彻底掌握。

`Weak` 通过 `use std::rc::Weak` 来引入，它具有以下特点:

- 可访问，但没有所有权，不增加引用计数，因此不会影响被引用值的释放回收
- 可由 `Rc<T>` 调用 `downgrade` 方法转换成 `Weak<T>`
- `Weak<T>` 可使用 `upgrade` 方法转换成 `Option<Rc<T>>`，如果资源已经被释放，则 `Option` 的值是 `None`
- 常用于解决循环引用的问题

一个简单的例子：

```rust
use std::rc::Rc;
fn main() {
    // 创建Rc，持有一个值5
    let five = Rc::new(5);

    // 通过Rc，创建一个Weak指针
    let weak_five = Rc::downgrade(&five);

    // Weak引用的资源依然存在，取到值5
    let strong_five: Option<Rc<_>> = weak_five.upgrade();
    assert_eq!(*strong_five.unwrap(), 5);

    // 手动释放资源`five`
    drop(five);

    // Weak引用的资源已不存在，因此返回None
    let strong_five: Option<Rc<_>> = weak_five.upgrade();
    assert_eq!(strong_five, None);
}
```

需要承认的是，使用 `Weak` 让 Rust 本来就堪忧的代码可读性又下降了不少，但是。。。真香，因为可以解决循环引用了。

## 使用 Weak 解决循环引用

理论知识已经足够，现在用两个例子来模拟下真实场景下可能会遇到的循环引用。

#### 工具间的故事

工具间里，每个工具都有其主人，且多个工具可以拥有一个主人；同时一个主人也可以拥有多个工具，在这种场景下，就很容易形成循环引用，好在我们有 `Weak`：

```rust
use std::rc::Rc;
use std::rc::Weak;
use std::cell::RefCell;

// 主人
struct Owner {
    name: String,
    gadgets: RefCell<Vec<Weak<Gadget>>>,
}

// 工具
struct Gadget {
    id: i32,
    owner: Rc<Owner>,
}

fn main() {
    // 创建一个 Owner
    // 需要注意，该 Owner 也拥有多个 `gadgets`
    let gadget_owner : Rc<Owner> = Rc::new(
        Owner {
            name: "Gadget Man".to_string(),
            gadgets: RefCell::new(Vec::new()),
        }
    );

    // 创建工具，同时与主人进行关联：创建两个 gadget，他们分别持有 gadget_owner 的一个引用。
    let gadget1 = Rc::new(Gadget{id: 1, owner: gadget_owner.clone()});
    let gadget2 = Rc::new(Gadget{id: 2, owner: gadget_owner.clone()});

    // 为主人更新它所拥有的工具
    // 因为之前使用了 `Rc`，现在必须要使用 `Weak`，否则就会循环引用
    gadget_owner.gadgets.borrow_mut().push(Rc::downgrade(&gadget1));
    gadget_owner.gadgets.borrow_mut().push(Rc::downgrade(&gadget2));

    // 遍历 gadget_owner 的 gadgets 字段
    for gadget_opt in gadget_owner.gadgets.borrow().iter() {

        // gadget_opt 是一个 Weak<Gadget> 。 因为 weak 指针不能保证他所引用的对象
        // 仍然存在。所以我们需要显式的调用 upgrade() 来通过其返回值(Option<_>)来判
        // 断其所指向的对象是否存在。
        // 当然，Option 为 None 的时候这个引用原对象就不存在了。
        let gadget = gadget_opt.upgrade().unwrap();
        println!("Gadget {} owned by {}", gadget.id, gadget.owner.name);
    }

    // 在 main 函数的最后，gadget_owner，gadget1 和 gadget2 都被销毁。
    // 具体是，因为这几个结构体之间没有了强引用（`Rc<T>`），所以，当他们销毁的时候。
    // 首先 gadget2 和 gadget1 被销毁。
    // 然后因为 gadget_owner 的引用数量为 0，所以这个对象可以被销毁了。
    // 循环引用问题也就避免了
}
```

#### tree 数据结构

```rust
use std::cell::RefCell;
use std::rc::{Rc, Weak};

#[derive(Debug)]
struct Node {
    value: i32,
    parent: RefCell<Weak<Node>>,
    children: RefCell<Vec<Rc<Node>>>,
}

fn main() {
    let leaf = Rc::new(Node {
        value: 3,
        parent: RefCell::new(Weak::new()),
        children: RefCell::new(vec![]),
    });

    println!(
        "leaf strong = {}, weak = {}",
        Rc::strong_count(&leaf),
        Rc::weak_count(&leaf),
    );

    {
        let branch = Rc::new(Node {
            value: 5,
            parent: RefCell::new(Weak::new()),
            children: RefCell::new(vec![Rc::clone(&leaf)]),
        });

        *leaf.parent.borrow_mut() = Rc::downgrade(&branch);

        println!(
            "branch strong = {}, weak = {}",
            Rc::strong_count(&branch),
            Rc::weak_count(&branch),
        );

        println!(
            "leaf strong = {}, weak = {}",
            Rc::strong_count(&leaf),
            Rc::weak_count(&leaf),
        );
    }

    println!("leaf parent = {:?}", leaf.parent.borrow().upgrade());
    println!(
        "leaf strong = {}, weak = {}",
        Rc::strong_count(&leaf),
        Rc::weak_count(&leaf),
    );
}

```

这个例子就留给读者自己解读和分析，我们就不画蛇添足了:）

## unsafe 解决循环引用

除了使用 Rust 标准库提供的这些类型，你还可以使用 `unsafe` 里的原生指针来解决这些棘手的问题，但是由于我们还没有讲解 `unsafe`，因此这里就不进行展开，只附上[源码链接](https://github.com/sunface/rust-algos/blob/fbcdccf3e8178a9039329562c0de0fd01a3372fb/src/unsafe/self-ref.md), 挺长的，需要耐心 o_o

虽然 `unsafe` 不安全，但是在各种库的代码中依然很常见用它来实现自引用结构，主要优点如下:

- 性能高，毕竟直接用原生指针操作
- 代码更简单更符合直觉: 对比下 `Option<Rc<RefCell<Node>>>`

## 总结

本文深入讲解了何为循环引用以及如何使用 `Weak` 来解决，同时还结合 `Rc`、`RefCell`、`Weak` 等实现了两个有实战价值的例子，让大家对智能指针的使用更加融会贯通。

至此，智能指针一章即将结束（严格来说还有一个 `Mutex` 放在多线程一章讲解），而 Rust 语言本身的学习之旅也即将结束，后面我们将深入多线程、项目工程、应用实践、性能分析等特色专题，来一睹 Rust 在这些领域的风采。
