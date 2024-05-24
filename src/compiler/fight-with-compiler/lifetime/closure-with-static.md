# 当闭包碰到特征对象 1

特征对象是一个好东西，闭包也是一个好东西，但是如果两者你都想要时，可能就会火星撞地球，boom! 至于这两者为何会勾搭到一起？考虑一个常用场景：使用闭包作为回调函数.

## 学习目标

如何使用闭包作为特征对象，并解决以下错误：`the parameter type ` \`impl Fn(&str) -> Res\` ` may not live long enough`

## 报错的代码

在下面代码中，我们通过闭包实现了一个简单的回调函数(错误代码已经标注)：

```rust,ignore,mdbook-runnable
pub struct Res<'a> {
    value: &'a str,
}

impl<'a> Res<'a> {
    pub fn new(value: &str) -> Res {
        Res { value }
    }
}

pub struct Container<'a> {
    name: &'a str,
    callback: Option<Box<dyn Fn(&str) -> Res>>,
}

impl<'a> Container<'a> {
    pub fn new(name: &str) -> Container {
        Container {
            name,
            callback: None,
        }
    }

    pub fn set(&mut self, cb: impl Fn(&str) -> Res) {
        self.callback = Some(Box::new(cb));
    }
}

fn main() {
    let mut inl = Container::new("Inline");

    inl.set(|val| {
        println!("Inline: {}", val);
        Res::new("inline")
    });

    if let Some(cb) = inl.callback {
        cb("hello, world");
    }
}
```

```console
error[E0310]: the parameter type `impl Fn(&str) -> Res` may not live long enough
  --> src/main.rs:25:30
   |
24 |     pub fn set(&mut self, cb: impl Fn(&str) -> Res) {
   |                               -------------------- help: consider adding an explicit lifetime bound...: `impl Fn(&str) -> Res + 'static`
25 |         self.callback = Some(Box::new(cb));
   |                              ^^^^^^^^^^^^ ...so that the type `impl Fn(&str) -> Res` will meet its required lifetime bounds
```

从第一感觉来说，报错属实不应该，因为我们连引用都没有用，生命周期都不涉及，怎么就报错了？在继续深入之前，先来观察下该闭包是如何被使用的：

```rust,ignore,mdbook-runnable
callback: Option<Box<dyn Fn(&str) -> Res>>,
```

众所周知，闭包跟哈姆雷特一样，每一个都有[自己的类型](https://course.rs/advance/functional-programing/closure.html#闭包作为函数返回值)，因此我们无法通过类型标注的方式来声明一个闭包，那么只有一个办法，就是使用特征对象，因此上面代码中，通过`Box<dyn Trait>`的方式把闭包特征封装成一个特征对象。

## 深入挖掘报错原因

事出诡异必有妖，那接下来我们一起去会会这只妖。

#### 特征对象的生命周期

首先编译器报错提示我们闭包活得不够久，那可以大胆推测，正因为使用了闭包作为特征对象，所以才活得不够久。因此首先需要调查下特征对象的生命周期。

首先给出结论：**特征对象隐式的具有`'static`生命周期**。

其实在 Rust 中，`'static`生命周期很常见，例如一个没有引用字段的结构体它其实也是`'static`。当`'static`用于一个类型时，该类型不能包含任何非`'static`引用字段，例如以下结构体：

```rust,ignore,mdbook-runnable
struct Foo<'a> {
    x : &'a [u8]
};
```

除非`x`字段借用了`'static`的引用，否则`'a`肯定比`'static`要小，那么该结构体实例的生命周期肯定不是`'static`: `'a: 'static`的限制不会被满足([HRTB](https://course.rs/advance/lifetime/advance.html#生命周期约束HRTB))。

对于特征对象来说，它没有包含非`'static`的引用，因此它隐式的具有`'static`生命周期, `Box<dyn Trait>`就跟`Box<dyn Trait + 'static>`是等价的。

#### 'static 闭包的限制

其实以上代码的错误很好解决，甚至编译器也提示了我们：

```console
help: consider adding an explicit lifetime bound...: `impl Fn(&str) -> Res + 'static`
```

但是解决问题不是本文的目标，我们还是要继续深挖一下，如果闭包使用了`'static`会造成什么问题。

##### 1. 无本地变量被捕获

```rust,ignore,mdbook-runnable
inl.set(|val| {
    println!("Inline: {}", val);
    Res::new("inline")
});
```

以上代码只使用了闭包中传入的参数，并没有本地变量被捕获，因此`'static`闭包一切 OK。

##### 2. 有本地变量被捕获

```rust,ignore,mdbook-runnable
let local = "hello".to_string();

// 编译错误： 闭包不是'static!
inl.set(|val| {
    println!("Inline: {}", val);
    println!("{}", local);
    Res::new("inline")
});
```

这里我们在闭包中捕获了本地环境变量`local`，因为`local`不是`'static`，那么闭包也不再是`'static`。

##### 3. 将本地变量 move 进闭包

```rust,ignore,mdbook-runnable
let local = "hello".to_string();

inl.set(move |val| {
    println!("Inline: {}", val);
    println!("{}", local);
    Res::new("inline")
});

// 编译错误: local已经被移动到闭包中，这里无法再被借用
// println!("{}", local);
```

如上所示，你也可以选择将本地变量的所有权`move`进闭包中，此时闭包再次具有`'static`生命周期

##### 4. 非要捕获本地变量的引用？

对于第 2 种情况，如果非要这么干，那`'static`肯定是没办法了，我们只能给予闭包一个新的生命周期:

```rust,ignore,mdbook-runnable
pub struct Container<'a, 'b> {
    name: &'a str,
    callback: Option<Box<dyn Fn(&str) -> Res + 'b>>,
}

impl<'a, 'b> Container<'a, 'b> {
    pub fn new(name: &str) -> Container {
        Container {
            name,
            callback: None,
        }
    }

    pub fn set(&mut self, cb: impl Fn(&str) -> Res + 'b) {
        self.callback = Some(Box::new(cb));
    }
}
```

肉眼可见，代码复杂度哐哐哐提升，不得不说`'static`真香！

友情提示：由此修改引发的一系列错误，需要你自行修复: ) (再次友情小提示，可以考虑把`main`中的`local`变量声明位置挪到`inl`声明位置之前)

## 姗姗来迟的正确代码

其实，大家应该都知道该如何修改了，不过出于严谨，我们还是继续给出完整的正确代码:

```rust,ignore,mdbook-runnable
pub fn set(&mut self, cb: impl Fn(&str) -> Res + 'static) {
```

可能大家觉得我重新定义了`完整`两个字，其实是我不想水篇幅:)

## 总结

闭包和特征对象的相爱相杀主要原因就在于特征对象默认具备`'static`的生命周期，同时我们还对什么样的类型具备`'static`进行了简单的分析。

同时，如果一个闭包拥有`'static`生命周期，那闭包无法通过引用的方式来捕获本地环境中的变量。如果你想要非要捕获，只能使用非`'static`。
