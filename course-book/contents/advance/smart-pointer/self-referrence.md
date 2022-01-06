## 自引用
本文分为上下两篇，试图彻底解决困扰大家已久的循环引用和自引用问题，因此难度较高，但是非常值得深入阅读，它会让你对Rust的理解上升到一个新的境界。

## 使用Pin来解决自引用
Pin在后续章节会深入讲解，目前你只需要知道它可以固定住一个值，防止该值的所有权被转移。通过Pin也可以实现自引用的数据结构:
```rust
use std::marker::PhantomPinned;
use std::pin::Pin;
use std::ptr::NonNull;

// 下面是一个自引用数据结构体，因为slice字段是一个指针, 指向了data字段
// 我们无法使用普通引用来实现，因为违背了Rust的编译规则
// 因此，这里我们使用了一个原生指针，通过NonNull来确保它不会为null
struct Unmovable {
    data: String,
    slice: NonNull<String>,
    _pin: PhantomPinned,
}

impl Unmovable {
    // To ensure the data doesn't move when the function returns,
    // we place it in the heap where it will stay for the lifetime of the object,
    // and the only way to access it would be through a pointer to it.
    fn new(data: String) -> Pin<Box<Self>> {
        let res = Unmovable {
            data,
            // we only create the pointer once the data is in place
            // otherwise it will have already moved before we even started
            slice: NonNull::dangling(),
            _pin: PhantomPinned,
        };
        let mut boxed = Box::pin(res);

        let slice = NonNull::from(&boxed.data);
        // we know this is safe because modifying a field doesn't move the whole struct
        unsafe {
            let mut_ref: Pin<&mut Self> = Pin::as_mut(&mut boxed);
            Pin::get_unchecked_mut(mut_ref).slice = slice;
        }
        boxed
    }
}

fn main() {
    let unmoved = Unmovable::new("hello".to_string());
    // The pointer should point to the correct location,
    // so long as the struct hasn't moved.
    // Meanwhile, we are free to move the pointer around.
    let mut still_unmoved = unmoved;
    assert_eq!(still_unmoved.slice, NonNull::from(&still_unmoved.data));

    // Since our type doesn't implement Unpin, this will fail to compile:
    // let mut new_unmoved = Unmovable::new("world".to_string());
    // std::mem::swap(&mut *still_unmoved, &mut *new_unmoved);
}
```


## 三方库解决引用循环
一些三方库也可以用来解决引用循环的问题，例如:

1. https://github.com/Kimundi/owning-ref-rs
2. https://github.com/joshua-maros/ouroboros

不过需要注意的是，这些库需要目标值的内存地址不会改变，因此`Vec`动态数组就不适合，因为当内存空间不够时，Rust会重新分配一块空间来存放该数组，这会导致内存地址的改变。


## 总结
本文深入讲解了何为引用循环以及如何使用Weak来解决，同时还结合`Rc`、`RefCell`、`Weak`等实现了两个有实战价值的例子，让大家对智能指针的使用更加融会贯通。

至此，智能指针一章即将结束(严格来说还有一个Mutex放在多线程一章讲解)，而Rust语言本身的学习之旅也即将结束，后面我们将深入多线程、项目工程、应用实践、性能分析等特色专题，来一睹Rust在这些领域的风采。