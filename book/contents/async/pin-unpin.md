# 定海神针Pin和Unpin
在Rust异步编程中，有一个定海神针般的存在，它就是`Pin`，作用说简单也简单，说复杂也非常复杂，当初刚出来时就连一些Rust大佬都一头雾水，何况瑟瑟发抖的我。好在今非昔比，目前网上的资料已经很全，因此我借花献佛，给大家好好讲讲这个`Pin`。

在Rust中，所有的类型可以分为两类:

- **类型的值可以在内存中安全地被移动**，例如数值、字符串、布尔值、结构体、枚举，总之你能想到的几乎所有类型都可以落入到此范畴内
- **自引用类型**，大魔王来了，大家快跑，在之前章节我们已经见识过它的厉害，下面来看看自引用类型的一种简单解决方法：

```rust
struct SelfRef {
    value: String,
    pointer_to_value: *mut String,
}
```

在上面的结构体中，`pointer_to_value`是一个原生指针，指向第一个字段`value`持有的字符串`String`。很简单对吧？现在考虑一个情况，若`String`被移动了怎么办？

此时一个致命的问题就出现了：新的字符串的内存地址变了，而`pointer_to_value`依然指向之前的地址，一个重大bug就出现了！

原生指针是`unsafe`的，因此遇到这种问题也在情理之中，谁让我们不用Rust提供的安全引用类型呢。但是既然已经用了，抱怨也没用，那么有没有办法解决这个问题？

答案就是使用`Pin`，它可以防止一个类型在内存中被移动。再来回忆下之前在`Futuer`章节中，我们提到过在`poll`方法的签名中有一个`self: Pin<&mut Self>`，那么为何要在这里使用`Pin`呢？ 

## 为何需要Pin
其实`Pin`还有一个小伙伴`UnPin`，与前者相反，后者表示类型可以在内存中安全地移动。在深入之前，我们先来回忆下`async/.await`是如何工作的:
```rust
let fut_one = /* ... */; // Future 1
let fut_two = /* ... */; // Future 2
async move {
    fut_one.await;
    fut_two.await;
}
```

在底层，`async`会创建一个实现了`Future`的匿名类型，并提供了一个`poll`方法：
```rust
// `async { ... }`语句块创建的`Future`类型
struct AsyncFuture {
    fut_one: FutOne,
    fut_two: FutTwo,
    state: State,
}

// `async`语句块可能处于的状态
enum State {
    AwaitingFutOne,
    AwaitingFutTwo,
    Done,
}

impl Future for AsyncFuture {
    type Output = ();

    fn poll(mut self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<()> {
        loop {
            match self.state {
                State::AwaitingFutOne => match self.fut_one.poll(..) {
                    Poll::Ready(()) => self.state = State::AwaitingFutTwo,
                    Poll::Pending => return Poll::Pending,
                }
                State::AwaitingFutTwo => match self.fut_two.poll(..) {
                    Poll::Ready(()) => self.state = State::Done,
                    Poll::Pending => return Poll::Pending,
                }
                State::Done => return Poll::Ready(()),
            }
        }
    }
}
```

当`poll`第一次被调用时，它会去查询`fut_one`的状态，若`fut_one`无法完成，则`poll`方法会返回。未来对`poll`的调用将从上一次调用结束的地方开始。该过程会一直持续，直到`Future`完成为止。

然而，如果我们的`async`语句块中使用了引用类型，会发生什么？例如下面例子：
```rust
async {
    let mut x = [0; 128];
    let read_into_buf_fut = read_into_buf(&mut x);
    read_into_buf_fut.await;
    println!("{:?}", x);
}
```

这段代码会编译成下面的形式：
```rust
struct ReadIntoBuf<'a> {
    buf: &'a mut [u8], // 指向下面的`x`字段
}

struct AsyncFuture {
    x: [u8; 128],
    read_into_buf_fut: ReadIntoBuf<'what_lifetime?>,
}
```

这里，`ReadIntoBuf`拥有一个引用字段，指向了结构体的另一个字段`x`，一旦`AsyncFuture`被移动，那`x`的地址也将随之变化，此时对`x`的引用就变成了不合法的，也就是`read_into_buf_fut.buf`会变为不合法的。

若能将`Future`在内存中固定到一个位置，就可以避免这种问题的发生，也就可以安全的创建上面这种引用类型。

## 深入理解Pin
对于上面的问题，我们可以简单的归结为如何在Rust中处理自引用类型(果然，只要是难点，都和自引用脱离不了关系)，下面用一个稍微简单点的例子来理解下`Pin`:
```rust
#[derive(Debug)]
struct Test {
    a: String,
    b: *const String,
}

impl Test {
    fn new(txt: &str) -> Self {
        Test {
            a: String::from(txt),
            b: std::ptr::null(),
        }
    }

    fn init(&mut self) {
        let self_ref: *const String = &self.a;
        self.b = self_ref;
    }

    fn a(&self) -> &str {
        &self.a
    }

    fn b(&self) -> &String {
        assert!(!self.b.is_null(), "Test::b called without Test::init being called first");
        unsafe { &*(self.b) }
    }
}
```

`Test`提供了方法用于获取字段`a`和`b`的值的引用。`b`是`a`的一个引用，但是我们并没有使用引用类型而是用了原生指针，原因是：Rust的借用规则不允许我们这样用，不符合生命周期的要求。此时的`Test`就是一个自引用结构体。

如果不移动任何值，那么上面的例子将没有任何问题，例如:
```rust
fn main() {
    let mut test1 = Test::new("test1");
    test1.init();
    let mut test2 = Test::new("test2");
    test2.init();

    println!("a: {}, b: {}", test1.a(), test1.b());
    println!("a: {}, b: {}", test2.a(), test2.b());

}
```

输出非常正常：
```console
a: test1, b: test1
a: test2, b: test2
```

明知上有虎，偏向虎山行，这才是我辈年轻人的风华。既然移动数据会导致指针不合法，那我们就移动下数据试试，将`test`和`test2`进行下交换：
```rust
fn main() {
    let mut test1 = Test::new("test1");
    test1.init();
    let mut test2 = Test::new("test2");
    test2.init();

    println!("a: {}, b: {}", test1.a(), test1.b());
    std::mem::swap(&mut test1, &mut test2);
    println!("a: {}, b: {}", test2.a(), test2.b());

}
```

按理来说，这样修改后，输出应该如下:
```rust
a: test1, b: test1
a: test1, b: test1
```

但是实际运行后，却产生了下面的输出:
```rust
a: test1, b: test1
a: test1, b: test2
```

原因是`test2.b`指针依然指向了旧的地址，而该地址现在在`test1`里。因此会打印出意料之外的值。

如果大家还是将信将疑，那再看看下面的代码：
```rust
fn main() {
    let mut test1 = Test::new("test1");
    test1.init();
    let mut test2 = Test::new("test2");
    test2.init();

    println!("a: {}, b: {}", test1.a(), test1.b());
    std::mem::swap(&mut test1, &mut test2);
    test1.a = "I've totally changed now!".to_string();
    println!("a: {}, b: {}", test2.a(), test2.b());

}
```

下面的图片也可以帮助更好的理解这个过程：

<img alt="" src="/img/async-02.jpg" class="center"  />

## Pin在实践中的运用