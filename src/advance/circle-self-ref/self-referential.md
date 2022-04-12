## 结构体自引用

结构体自引用在 Rust 中是一个众所周知的难题，而且众说纷纭，也没有一篇文章能把相关的话题讲透，那本文就王婆卖瓜，来试试看能不能讲透这一块儿内容，让读者大大们舒心。

## 平平无奇的自引用

可能也有不少人第一次听说自引用结构体，那咱们先来看看它们长啥样。

```rust
struct SelfRef<'a> {
    value: String,

    // 该引用指向上面的value
    pointer_to_value: &'a str,
}
```

以上就是一个很简单的自引用结构体，看上去好像没什么，那来试着运行下：

```rust
fn main(){
    let s = "aaa".to_string();
    let v = SelfRef {
        value: s,
        pointer_to_value: &s
    };
}
```

运行后报错：

```console
 let v = SelfRef {
12 |         value: s,
   |                - value moved here
13 |         pointer_to_value: &s
   |                           ^^ value borrowed here after move
```

因为我们试图同时使用值和值的引用，最终所有权转移和借用一起发生了。所以，这个问题貌似并没有那么好解决，不信你可以回想下自己具有的知识，是否可以解决？

## 使用 Option

最简单的方式就是使用 `Opiton` 分两步来实现：

```rust
#[derive(Debug)]
struct WhatAboutThis<'a> {
    name: String,
    nickname: Option<&'a str>,
}

fn main() {
    let mut tricky = WhatAboutThis {
        name: "Annabelle".to_string(),
        nickname: None,
    };
    tricky.nickname = Some(&tricky.name[..4]);

    println!("{:?}", tricky);
}
```

在某种程度上来说，`Option` 这个方法可以工作，但是这个方法的限制较多，例如从一个函数创建并返回它是不可能的：

```rust
fn creator<'a>() -> WhatAboutThis<'a> {
    let mut tricky = WhatAboutThis {
        name: "Annabelle".to_string(),
        nickname: None,
    };
    tricky.nickname = Some(&tricky.name[..4]);

    tricky
}
```

报错如下：

```console
error[E0515]: cannot return value referencing local data `tricky.name`
  --> src/main.rs:24:5
   |
22 |     tricky.nickname = Some(&tricky.name[..4]);
   |                             ----------- `tricky.name` is borrowed here
23 |
24 |     tricky
   |     ^^^^^^ returns a value referencing data owned by the current function
```

其实从函数签名就能看出来端倪，`'a` 生命周期是凭空产生的！

如果是通过方法使用，你需要一个无用 `&'a self` 生命周期标识，一旦有了这个标识，代码将变得更加受限，你将很容易就获得借用错误，就连 NLL 规则都没用：

```rust
#[derive(Debug)]
struct WhatAboutThis<'a> {
    name: String,
    nickname: Option<&'a str>,
}

impl<'a> WhatAboutThis<'a> {
    fn tie_the_knot(&'a mut self) {
       self.nickname = Some(&self.name[..4]);
    }
}

fn main() {
    let mut tricky = WhatAboutThis {
        name: "Annabelle".to_string(),
        nickname: None,
    };
    tricky.tie_the_knot();

    // cannot borrow `tricky` as immutable because it is also borrowed as mutable
    // println!("{:?}", tricky);
}
```

## unsafe 实现

既然借用规则妨碍了我们，那就一脚踢开：

```rust
#[derive(Debug)]
struct SelfRef {
    value: String,
    pointer_to_value: *const String,
}

impl SelfRef {
    fn new(txt: &str) -> Self {
        SelfRef {
            value: String::from(txt),
            pointer_to_value: std::ptr::null(),
        }
    }

    fn init(&mut self) {
        let self_ref: *const String = &self.value;
        self.pointer_to_value = self_ref;
    }

    fn value(&self) -> &str {
        &self.value
    }

    fn pointer_to_value(&self) -> &String {
        assert!(!self.pointer_to_value.is_null(),
            "Test::b called without Test::init being called first");
        unsafe { &*(self.pointer_to_value) }
    }
}

fn main() {
    let mut t = SelfRef::new("hello");
    t.init();
    // 打印值和指针地址
    println!("{}, {:p}", t.value(), t.pointer_to_value());
}
```

在这里，我们在 `pointer_to_value` 中直接存储裸指针，而不是 Rust 的引用，因此不再受到 Rust 借用规则和生命周期的限制，而且实现起来非常清晰、简洁。但是缺点就是，通过指针获取值时需要使用 `unsafe` 代码。

当然，上面的代码你还能通过裸指针来修改 `String`，但是需要将 `*const` 修改为 `*mut`：

```rust
#[derive(Debug)]
struct SelfRef {
    value: String,
    pointer_to_value: *mut String,
}

impl SelfRef {
    fn new(txt: &str) -> Self {
        SelfRef {
            value: String::from(txt),
            pointer_to_value: std::ptr::null_mut(),
        }
    }

    fn init(&mut self) {
        let self_ref: *mut String = &mut self.value;
        self.pointer_to_value = self_ref;
    }

    fn value(&self) -> &str {
        &self.value
    }

    fn pointer_to_value(&self) -> &String {
        assert!(!self.pointer_to_value.is_null(), "Test::b called without Test::init being called first");
        unsafe { &*(self.pointer_to_value) }
    }
}

fn main() {
    let mut t = SelfRef::new("hello");
    t.init();
    println!("{}, {:p}", t.value(), t.pointer_to_value());

    t.value.push_str(", world");
    unsafe {
        (&mut *t.pointer_to_value).push_str("!");
    }

    println!("{}, {:p}", t.value(), t.pointer_to_value());
}
```

运行后输出：

```console
hello, 0x16f3aec70
hello, world!, 0x16f3aec70
```

上面的 `unsafe` 虽然简单好用，但是它不太安全，是否还有其他选择？还真的有，那就是 `Pin`。

## 无法被移动的 Pin

`Pin` 在后续章节会深入讲解，目前你只需要知道它可以固定住一个值，防止该值在内存中被移动。

通过开头我们知道，自引用最麻烦的就是创建引用的同时，值的所有权会被转移，而通过 `Pin` 就可以很好的防止这一点：

```rust
use std::marker::PhantomPinned;
use std::pin::Pin;
use std::ptr::NonNull;

// 下面是一个自引用数据结构体，因为 slice 字段是一个指针，指向了 data 字段
// 我们无法使用普通引用来实现，因为违背了 Rust 的编译规则
// 因此，这里我们使用了一个裸指针，通过 NonNull 来确保它不会为 null
struct Unmovable {
    data: String,
    slice: NonNull<String>,
    _pin: PhantomPinned,
}

impl Unmovable {
    // 为了确保函数返回时数据的所有权不会被转移，我们将它放在堆上，唯一的访问方式就是通过指针
    fn new(data: String) -> Pin<Box<Self>> {
        let res = Unmovable {
            data,
            // 只有在数据到位时，才创建指针，否则数据会在开始之前就被转移所有权
            slice: NonNull::dangling(),
            _pin: PhantomPinned,
        };
        let mut boxed = Box::pin(res);

        let slice = NonNull::from(&boxed.data);
        // 这里其实安全的，因为修改一个字段不会转移整个结构体的所有权
        unsafe {
            let mut_ref: Pin<&mut Self> = Pin::as_mut(&mut boxed);
            Pin::get_unchecked_mut(mut_ref).slice = slice;
        }
        boxed
    }
}

fn main() {
    let unmoved = Unmovable::new("hello".to_string());
    // 只要结构体没有被转移，那指针就应该指向正确的位置，而且我们可以随意移动指针
    let mut still_unmoved = unmoved;
    assert_eq!(still_unmoved.slice, NonNull::from(&still_unmoved.data));

    // 因为我们的类型没有实现 `Unpin` 特征，下面这段代码将无法编译
    // let mut new_unmoved = Unmovable::new("world".to_string());
    // std::mem::swap(&mut *still_unmoved, &mut *new_unmoved);
}
```

上面的代码也非常清晰，虽然使用了 `unsafe`，其实更多的是无奈之举，跟之前的 `unsafe` 实现完全不可同日而语。

其实 `Pin` 在这里并没有魔法，它也并不是实现自引用类型的主要原因，最关键的还是里面的裸指针的使用，而 `Pin` 起到的作用就是确保我们的值不会被移走，否则指针就会指向一个错误的地址！

## 使用 ouroboros

对于自引用结构体，三方库也有支持的，其中一个就是 [ouroboros](https://github.com/joshua-maros/ouroboros)，当然它也有自己的限制，我们后面会提到，先来看看该如何使用：

```rust
use ouroboros::self_referencing;

#[self_referencing]
struct SelfRef {
    value: String,

    #[borrows(value)]
    pointer_to_value: &'this str,
}

fn main(){
    let v = SelfRefBuilder {
        value: "aaa".to_string(),
        pointer_to_value_builder: |value: &String| value,
    }.build();

    // 借用value值
    let s = v.borrow_value();
    // 借用指针
    let p = v.borrow_pointer_to_value();
    // value值和指针指向的值相等
    assert_eq!(s, *p);
}
```

可以看到，`ouroboros` 使用起来并不复杂，就是需要你去按照它的方式创建结构体和引用类型：`SelfRef` 变成 `SelfRefBuilder`，引用字段从 `pointer_to_value` 变成 `pointer_to_value_builder`，并且连类型都变了。

在使用时，通过 `borrow_value` 来借用 `value` 的值，通过 `borrow_pointer_to_value` 来借用 `pointer_to_value` 这个指针。

看上去很美好对吧？但是你可以尝试着去修改 `String` 字符串的值试试，`ouroboros` 限制还是较多的，但是对于基本类型依然是支持的不错，以下例子来源于官方：

```rust
use ouroboros::self_referencing;

#[self_referencing]
struct MyStruct {
    int_data: i32,
    float_data: f32,
    #[borrows(int_data)]
    int_reference: &'this i32,
    #[borrows(mut float_data)]
    float_reference: &'this mut f32,
}

fn main() {
    let mut my_value = MyStructBuilder {
        int_data: 42,
        float_data: 3.14,
        int_reference_builder: |int_data: &i32| int_data,
        float_reference_builder: |float_data: &mut f32| float_data,
    }.build();

    // Prints 42
    println!("{:?}", my_value.borrow_int_data());
    // Prints 3.14
    println!("{:?}", my_value.borrow_float_reference());
    // Sets the value of float_data to 84.0
    my_value.with_mut(|fields| {
        **fields.float_reference = (**fields.int_reference as f32) * 2.0;
    });

    // We can hold on to this reference...
    let int_ref = *my_value.borrow_int_reference();
    println!("{:?}", *int_ref);
    // As long as the struct is still alive.
    drop(my_value);
    // This will cause an error!
    // println!("{:?}", *int_ref);
}
```

总之，使用这个库前，强烈建议看一些官方的例子中支持什么样的类型和 API，如果能满足的你的需求，就果断使用它，如果不能满足，就继续往下看。

只能说，它确实帮助我们解决了问题，但是一个是破坏了原有的结构，另外就是并不是所有数据类型都支持：它需要目标值的内存地址不会改变，因此 `Vec` 动态数组就不适合，因为当内存空间不够时，Rust 会重新分配一块空间来存放该数组，这会导致内存地址的改变。

类似的库还有：

- [rental](https://github.com/jpernst/rental)， 这个库其实是最有名的，但是好像不再维护了，用倒是没问题
- [owning-ref](https://github.com/Kimundi/owning-ref-rs)，将所有者和它的引用绑定到一个封装类型

这三个库，各有各的特点，也各有各的缺陷，建议大家需要时，一定要仔细调研，并且写 demo 进行测试，不可大意。

> rental 虽然不怎么维护，但是可能依然是这三个里面最强大的，而且网上的用例也比较多，容易找到参考代码

## Rc + RefCell 或 Arc + Mutex

类似于循环引用的解决方式，自引用也可以用这种组合来解决，但是会导致代码的类型标识到处都是，大大的影响了可读性。

## 终极大法

如果两个放在一起会报错，那就分开它们。对，终极大法就这么简单，当然思路上的简单不代表实现上的简单，最终结果就是导致代码复杂度的上升。

## 学习一本书：如何实现链表

最后，推荐一本专门将如何实现链表的书（真是富有 Rust 特色，链表都能复杂到出书了 o_o），[Learn Rust by writing Entirely Too Many Linked Lists](https://rust-unofficial.github.io/too-many-lists/)

## 总结

上面讲了这么多方法，但是我们依然无法正确的告诉你在某个场景应该使用哪个方法，这个需要你自己的判断，因为自引用实在是过于复杂。

我们能做的就是告诉你，有这些办法可以解决自引用问题，而这些办法每个都有自己适用的范围，需要你未来去深入的挖掘和发现。

偷偷说一句，就算是我，遇到自引用一样挺头疼，好在这种情况真的不常见，往往是实现特定的算法和数据结构时才需要，应用代码中几乎用不到。
