## 结构体自引用
结构体自引用在Rust中是一个众所周知的难题，而且众说纷纭，也没有一篇文章能把相关的话题讲透，那本文就王婆卖瓜，来试试看能不能讲透这一块儿内容，让读者大大们舒心。

## 平平无奇的自引用
可能也有不少人第一次听说自引用结构体，那咱们先来看看它们长啥样。

```rust
struct RefWithinMe<'a> {
    value: String,

    // 该引用指向上面的value
    pointer_to_value: &'a str,
}
```
以上就是一个很简单的自引用结构体,看上去好像没什么，那来试着运行下：
```rust
fn main(){
    let s = "aaa".to_string();
    let v = SelfRef {
        value: s,
        pointer_to_value: &s
    };
}
```

运行后报错:
```console
 let v = SelfRef {
12 |         value: s,
   |                - value moved here
13 |         pointer_to_value: &s
   |                           ^^ value borrowed here after move
```

因为我们试图同时使用值和值的引用，最终所有权转移和借用一起发生了。所以，这个问题貌似并没有那么好解决，不信你可以回想下自己具有的知识，是否可以解决？

#### 使用ouroboros

## 玉树临风的自引用
```rust
use std::str;

struct MyStruct<'a>{
    Buf: Vec<u8>,
    repr: Parsed<'a>
}

struct Parsed<'a>{
    name:&'a str
}

fn main(){

    let v = vec!(0065,0066,0067,0068,0069);
    let s = str::from_utf8(&v).unwrap();
    println!("{}",s);
    let p = &v[1..=3];
    let s1 = str::from_utf8(p).unwrap();
    println!("{}",s1);
    let par = Parsed{name:s1};

    let new1 = MyStruct{Buf:v,repr:par};
}
```

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