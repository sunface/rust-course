# 代码重构导致的可变借用错误

相信大家都听说过**重构一时爽，一直重构一直爽**的说法，私以为这种说法是很有道理的，不然技术团队绩效从何而来？但是，在 Rust 中，重构可能就不是那么爽快的事了，不信？咱们来看看。

## 欣赏下报错
很多时候，错误也是一种美，但是当这种错误每天都能见到时(呕):
```css
error[E0499]: cannot borrow `*self` as mutable more than once at a time
```

虽然这一类错误长得一样，但是我这里的错误可能并不是大家常遇到的那些妖艳错误，废话不多说，一起来看看。

## 重构前的正确代码
```rust
struct Test {
    a : u32,
    b : u32
}

impl Test {
    fn increase(&mut self) {
        let mut a = &mut self.a;
        let mut b = &mut self.b;
        *b += 1;
        *a += 1;
    }
}
```

这段代码是可以正常编译的，也许有读者会有疑问，`self`在这里被两个变量以可变的方式借用了，明明违反了 Rust 的所有权规则，为何它不会报错？

答案要从很久很久之前开始(啊哒~~~由于我太啰嗦，被正义群众来了一下，那咱现在开始长话短说，直接进入主题)。

#### 正确代码为何不报错？
虽然从表面来看，`a`和`b`都可变引用了`self`，但是 Rust 的编译器在很多时候都足够聪明，它发现我们其实仅仅引用了同一个结构体中的不同字段，因此完全可以将其的借用权分离开来。

因此，虽然我们不能同时对整个结构体进行可变引用，但是我们可以分别对结构体中的不同字段进行可变引用，当然，一个字段至多也只能存在一个可变引用，这个最基本的所有权规则还是不能违反的。变量`a`引用结构体字段`a`，变量`b`引用结构体字段`b`，从底层来说，这种方式也不会造成两个可变引用指向了同一块内存。

至此，正确代码我们已经挖掘完毕，再来看看重构后的错误代码。

## 重构后的错误代码
由于领导说我们这个函数没办法复用，那就敷衍一下呗：
```rust
struct Test {
    a : u32,
    b : u32
}

impl Test {

    fn increase_a (&mut self) {
        self.a += 1;
    }

    fn increase(&mut self) {
        let b = &mut self.b;
        self.increase_a();
        *b += 1;
    }
}
```

既然领导说了，咱照做，反正他也没说怎么个复用法，咱就来个简单的，把`a`的递增部分复用下。

代码说实话。。。更丑了，但是更强了吗？
```console
error[E0499]: cannot borrow `*self` as mutable more than once at a time
  --> src/main.rs:14:9
   |
13 |         let b = &mut self.b;
   |                 ----------- first mutable borrow occurs here
14 |         self.increase_a();
   |         ^^^^ second mutable borrow occurs here
15 |         *b += 1;
   |         ------- first borrow later used here
```

嗯，最开始提到的错误，它终于出现了。

## 大聪明编译器
为什么？明明之前还是正确的代码，就因为放入函数中就报错了？我们先从一个简单的理解谈起，当然这个理解也是浮于表面的，等会会深入分析真实的原因。

之前讲到 Rust 编译器挺聪明，可以识别到引用到不同的结构体字段，因此不会报错。但是现在这种情况下，编译器又不够聪明了，一旦放入函数中，编译器将无法理解我们对`self`的使用：它仅仅用到了一个字段，而不是整个结构体。 

因此它会简单的认为，这个结构体作为一个整体被可变借用了，产生两个可变引用，一个引用整个结构体，一个引用了结构体字段`b`，这两个引用存在重叠的部分，最终导致编译错误。

## 被冤枉的编译器
在工作生活中，我们无法理解甚至错误的理解一件事，有时是因为层次不够导致的。同样，对于本文来说，也是因为我们对编译器的所知不够，才冤枉了它，还给它起了一个屈辱的“大聪明”外号。

#### 深入分析
> 如果只改变相关函数的实现而不改变它的签名，那么不会影响编译的结果

何为相关函数？当函数`a`调用了函数`b`，那么`b`就是`a`的相关函数。

上面这句是一条非常重要的编译准则，意思是，对于编译器来说，只要函数签名没有变，那么任何函数实现的修改都不会影响已有的编译结果(前提是函数实现没有错误- , -)。

以前面的代码为例：
```rust
fn increase_a (&mut self) {
    self.a += 1;
}

fn increase(&mut self) {
    let b = &mut self.b;
    self.increase_a();
    *b += 1;
}
```

虽然`increase_a`在函数实现中没有访问`self.b`字段，但是它的签名允许它访问`b`，因此违背了借用规则。事实上，该函数有没有访问`b`不重要，**因为编译器在这里只关心签名，签名存在可能性，那么就立刻报出错误**。

为何会有这种编译器行为，主要有两个原因：
1. 一般来说，我们希望编译器有能力独立的编译每个函数，而无需深入到相关函数的内部实现，因为这样做会带来快得多的编译速度。
2. 如果没有这种保证，那么在实际项目开发中，我们会特别容易遇到各种错误。 假设我们要求编译器不仅仅关注相关函数的签名，还要深入其内部关注实现，那么由于 Rust 严苛的编译规则，当你修改了某个函数内部实现的代码后，可能会引起使用该函数的其它函数的各种错误！对于大型项目来说，这几乎是不可接受的！

然后，我们的借用类型这么简单，编译器有没有可能针对这种场景，在现有的借用规则之外增加特殊规则？答案是否定的，由于 Rust 语言的设计哲学：特殊规则的加入需要慎之又慎，而我们的这种情况其实还蛮好解决的，因此编译器不会为此新增规则。


## 解决办法
在深入分析中，我们提到一条重要的规则，要影响编译行为，就需要更改相关函数的签名，因此可以修改`increase_a`的签名:
```rust
fn increase_a (a :&mut u32) {
    *a += 1;
}

fn increase(&mut self) {
    let b = &mut self.b;
    Test::increase_a(&mut self.a);
    *b += 1;
}
```

此时，`increase_a`这个相关函数，不再使用`&mut self`作为签名，而是获取了结构体中的字段`a`，此时编译器又可以清晰的知道：函数`increase_a`和变量`b`分别引用了结构体中的不同字段，因此可以编译通过。


当然，除了修改相关函数的签名，你还可以修改调用者的实现：

```rust
fn increase(&mut self) {
    self.increase_a();
    self.b += 1;
}
```

在这里，我们不再单独声明变量`b`，而是直接调用`self.b+=1`进行递增，根据借用生命周期[NLL](https://course.rs/advance/lifetime/advance.html#nllnon-lexical-lifetime)的规则，第一个可变借用`self.increase_a()`的生命周期随着方法调用的结束而结束，那么就不会影响`self.b += 1`中的借用。


## 闭包中的例子
再来看一个使用了闭包的例子:
```rust
use tokio::runtime::Runtime;

struct Server {
    number_of_connections : u64
}

impl Server {
    pub fn new() -> Self {
        Server { number_of_connections : 0}
    }

    pub fn increase_connections_count(&mut self) {
        self.number_of_connections += 1;
    }
}

struct ServerRuntime {
    runtime: Runtime,
    server: Server
}

impl ServerRuntime {
    pub fn new(runtime: Runtime, server: Server) -> Self {
        ServerRuntime { runtime, server }
    }

    pub fn increase_connections_count(&mut self) {
        self.runtime.block_on(async {
            self.server.increase_connections_count()
        })
    }
}
```

代码中使用了`tokio`，在`increase_connections_count`函数中启动了一个异步任务，并且等待它的完成。这个函数中分别引用了`self`中的不同字段:`runtime`和`server`，但是可能因为闭包的原因，编译器没有像本文最开始的例子中那样聪明，并不能识别这两个引用仅仅引用了同一个结构体的不同部分，因此报错了：
```console
error[E0501]: cannot borrow `self.runtime` as mutable because previous closure requires unique access
  --> the_little_things\src\main.rs:28:9
   |
28 |            self.runtime.block_on(async {
   |  __________^____________--------_______-
   | |          |            |
   | | _________|            first borrow later used by call
   | ||
29 | ||             self.server.increase_connections_count()
   | ||             ---- first borrow occurs due to use of `self` in generator
30 | ||         })
   | ||_________-^ second borrow occurs here
   | |__________|
   |            generator construction occurs here
```

#### 解决办法
解决办法很粗暴，既然编译器不能理解闭包中的引用是不同的，那么我们就主动告诉它:
```rust
pub fn increase_connections_count(&mut self) {
    let runtime = &mut self.runtime;
    let server = &mut self.server;
    runtime.block_on(async {
        server.increase_connections_count()
    })
}
```

上面通过变量声明的方式，在闭包外声明了两个变量分别引用结构体`self`的不同字段，这样一来，编译器就不会那么笨，编译顺利通过。

你也可以这么写：
```rust
pub fn increase_connections_count(&mut self) {
    let ServerRuntime { runtime, server } = self;
    runtime.block_on(async {
        server.increase_connections_count()
    })
}
```

当然，如果难以解决，还有一个笨办法，那就是将`server`和`runtime`分离开来，不要放在一个结构体中。

## 总结
心中有剑，手中无剑，是武学至高境界。

本文列出的那条编译规则，在未来就将是大家心中的那把剑，当这些心剑招式足够多时，量变产生质变，终将天下无敌。