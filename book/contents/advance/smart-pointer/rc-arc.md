# Rc与Arc
Rust所有权机制要求一个值只能有一个所有者，在大多数情况下，都没有问题，但是考虑以下情况:

- 在图数据结构中，多个边可能会拥有同一个节点，该节点直到没有边指向它时，才应该被释放清理
- 在多线程中，多个线程可能会持有同一个数据，但是你受限于Rust的安全机制，无法同时获取该数据的可变引用。

以上场景不是很常见，但是一旦遇到，就非常棘手，为了解决此类问题，Rust在所有权机制之外又引入了额外的措施来简化相应的实现：通过引用计数的方式，允许一个数据资源在同一时刻拥有多个所有者。

这种实现机制就是`Rc`和`Arc`，前者适用于单线程，后者适用于多线程。由于二者大部分情况下都相同，因此本章将以`Rc`作为讲解主体，对于`Arc`的不同之处，另外进行单独讲解。

## Rc<T>
引用计数(reference counting)，顾名思义，通过记录一个数据被引用的次数来确定该数据是否正在被使用。当引用次数归零时，就代表该数据不再被使用，因此可以被清理释放。

而`Rc`正是引用计数的英文缩写。当我们**希望在堆上分配一个对象供程序的多个部分使用且无法确定哪个部分最后一个结束时，就可以使用`Rc`成为数据值的所有者**，例如之前提到的多线程场景就非常适合。

下面是经典的所有权被转移导致报错的例子：
```rust
fn main() {
    let s = String::from("hello, world");
    // s在这里被转移给a
    let a = Box::new(s);
    // 报错！此处继续尝试将s转移给b
    let b = Box::new(s);     
}
```

使用`Rc`就可以轻易解决：
```rust
use std::rc::Rc;
fn main() {
    let a = Rc::new(String::from("hello, world"));
    let b = Rc::clone(&a);

    assert_eq!(2, Rc::strong_count(&a));
    assert_eq!(Rc::strong_count(&a),Rc::strong_count(&b))
}
```

以上代码我们使用`Rc::new`创建了一个新的`Rc<String>`智能指针并赋给变量`a`，该指针指向底层的字符串数据。

智能指针`Rc<T>`在创建时，还会将引用计数加1，此时获取引用计数的关联函数`Rc::strong_count`返回的值将是`1`。

#### Rc::clone
接着，我们又使用`Rc::clone`克隆了一份智能指针`Rc<String>`，并将该智能指针的引用计数增加到`2`。

由于`a`和`b`是同一个智能指针的两个副本，因此通过它们两个获取引用计数的结果都是`2`。

不要给`clone`字样所迷惑，以为所有的`clone`都是深拷贝。这里的`clone`**仅仅复制了智能指针并增加了引用计数，并没有克隆底层数据**，因此`a`和`b`是共享了底层的字符串`s`，这种**复制效率是非常高**的。当然你也可以使用`a.clone()`的方式来克隆，但是从可读性角度，`Rc::clone`的方式我们更加推荐。

实际上Rust中，还有不少`clone`都是浅拷贝，例如[迭代器的克隆](https://course.rs/pitfalls/iterator-everywhere.html).

#### 观察引用计数的变化
使用关联函数`Rc::strong_count`可以获取当前引用计数的值，我们来观察下引用计数如何随着变量声明、释放而变化：
```rust
use std::rc::Rc;
fn main() {
        let a = Rc::new(String::from("test ref counting"));
        println!("count after creating a = {}", Rc::strong_count(&a));
        let b =  Rc::clone(&a);
        println!("count after creating b = {}", Rc::strong_count(&a));
        {
            let c =  Rc::clone(&a);
            println!("count after creating c = {}", Rc::strong_count(&c));
        }
        println!("count after c goes out of scope = {}", Rc::strong_count(&a));
}
```

有几点值得注意：

- 由于变量`c`在语句块内部声明，当离开语句块时它会因为超出作用域而被释放，最终引用计数会减少1, 事实上这个得益于`Rc<T>`实现了`Drop`特征
- `a`,`b`,`c`三个智能指针引用计数都是同样的，并且共享底层的数据，因此打印计数时用哪个都行
- 无法看到的是: 当`a`、`b`超出作用域后，引用计数会变成0，最终智能指针和它指向的底层字符串都会被清理释放

#### 不可变引用
事实上，`Rc<T>`是指向底层数据的不可变的引用，因此你无法通过它来修改数据，这也符合Rust的借用规则：要么多个不可变借用，要么一个可变借用。

但是可以修改数据也是非常有用的，只不过我们需要配合其它数据类型来一起使用，例如内部可变性的`RefCell<T>`类型以及互斥锁`Mutex<T>`。事实上，在多线程编程中，`Arc`跟`Mutext`锁的组合使用非常常见，它们既可以让我们在不同的线程中共享数据，又允许在各个线程中对其进行修改。


#### 一个综合例子
考虑一个场景，有很多小器具，里面每个器具都有自己的主人，但是存在多个器具属于同一个主人的情况，此时使用`Rc<T>`就非常适合:
```rust
use std::rc::Rc;

struct Owner {
    name: String,
    // ...其它字段
}

struct Gadget {
    id: i32,
    owner: Rc<Owner>,
    // ...其它字段
}

fn main() {
    // 创建一个基于引用计数的`Owner`.
    let gadget_owner: Rc<Owner> = Rc::new(
        Owner {
            name: "Gadget Man".to_string(),
        }
    );

    // 创建两个不同的工具，它们属于同一个主人
    let gadget1 = Gadget {
        id: 1,
        owner: Rc::clone(&gadget_owner),
    };
    let gadget2 = Gadget {
        id: 2,
        owner: Rc::clone(&gadget_owner),
    };

    // 释放掉第一个`Rc<Owner>`
    drop(gadget_owner);

    // 尽管在之前我们释放了gadget_owner，但是依然可以在这里使用owner的信息
    // 原因是上面仅仅drop掉其中一个智能指针引用，而不是drop掉owner数据，外面还有两个引用指向底层的owner数据，引用计数尚未清零
    // 因此owner数据依然可以被使用
    println!("Gadget {} owned by {}", gadget1.id, gadget1.owner.name);
    println!("Gadget {} owned by {}", gadget2.id, gadget2.owner.name);

    // 在函数最后，`gadget1`和`gadget2`也被释放，最终引用计数归零，随后底层数据也被清理释放
}
```

以上代码很好的展示了`Rc<T>`的用途，当然你也可以用借用的方式，但是实现起来就会复杂的多，而且随着`Gadget`在代码的各个地方使用，引用生命周期也将变得更加复杂，毕竟结构体中的引用类型，总是令人不那么愉快，对不？

#### Rc简单总结

- `Rc/Arc`是不可变引用，你无法修改它指向的值，只能进行读取, 如果要修改，需要配合后面章节的内部可变性`RefCell`或互斥锁`Mutex`
- 一旦最后一个拥有者消失，则资源会自动被回收，这个生命周期是在编译期就确定下来的
- Rc只能用于同一线程内部，想要用于线程之间的对象共享, 你需要使用`Arc`
- `Rc<T>`是一个智能指针，实现了`Deref`特征，因此你无需先解开`Rc`指针，再使用里面的`T`，而是可以直接使用`T`, 例如上例中的`gadget1.owner.name`



## 多线程无力的Rc<T>
来看看在多线程场景使用`Rc<T>`会如何:
```rust
use std::rc::Rc;
use std::thread;

fn main() {
    let s = Rc::new(String::from("多线程漫游者"));
    for _ in 0..10 {
        let s = Rc::clone(&s);
        let handle = thread::spawn(move || {
           println!("{}",s)
        });
    }
}
```

由于我们还没有学习多线程的章节，上面的例子就特地简化了相关的实现。首先通过`thread::spawn`创建一个线程，然后使用`move`关键字把克隆出的`s`的所有权转移到线程中。

能够实现这一点，完全得益于`Rc`带来的多所有权机制，但是以上代码会报错:
```console
error[E0277]: `Rc<String>` cannot be sent between threads safely
```

表面原因是`Rc<T>`不能在线程间安全的传递，实际上是因为它没有实现`Send`特征，而该特征是恰恰是多线程间传递数据的关键，我们会在多线程章节中进行讲解。

当然，还有更深层的原因: 由于`Rc<T>`需要管理引用计数，但是该计数器并没有使用任何并发原语，因此无法实现原子化的计数操作, 最终会导致计数错误。

好在天无绝人之路，一起来看看Rust为我们提供的功能一致但是多线程安全的`Arc`。

## Arc
`Arc`是`Atomic Rc`的缩写，顾名思义：原子化的`Rc<T>`智能指针。原子化是一种并发原语，我们在后续章节会进行深入讲解，这里你只要知道它能保证我们的数据能够安全的在线程间共享即可。

#### Arc的性能损耗
你可能好奇，为何不直接使用`Arc`，还要画蛇添足弄一个`Rc`，还有Rust的基本数据类型、标准库数据类型为什么不自动实现原子化操作？

原因在于原子化或者其它锁带来的线程安全，都会伴随着性能损耗，而且这种性能损耗还不小，因此Rust把这种选择权交给你，毕竟需要线程安全的代码其实占比并不高，大部分时间我们都在跟线程内的代码执行打交道。

`Arc`和`Rc`拥有完全一样的API，修改起来很简单:
```rust
use std::sync::Arc;
use std::thread;

fn main() {
    let s = Arc::new(String::from("多线程漫游者"));
    for _ in 0..10 {
        let s = Arc::clone(&s);
        let handle = thread::spawn(move || {
           println!("{}",s)
        });
    }
}
```

对了，两者还有一点区别: `Arc`和`Rc`并没有定义在同一个模块，前者通过`use std::sync::Arc`来引入，后者`use std::rc::Rc`.


## 总结
在Rust中，所有权机制保证了一个数据只会有一个所有者，但如果你想要在图数据结构、多线程等场景中共享数据，这种机制会成为极大的阻碍。好在Rust为我们提供了智能指针`Rc`和`Arc`，使用它们就能实现多个所有者共享一个数据的功能。

`Rc`和`Arc`的区别在于，后者是原子化实现的引用计数，因此是线程安全的，可以用于多线程中共享数据。

这两者都是只读的，如果想要实现内部数据可修改，必须配合内部可变性`RefCell`或者互斥锁`Mutex`来一起使用。