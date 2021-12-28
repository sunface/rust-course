# 失效的可变性
众所周知Rust是一门安全性非常强的系统级语言，其中，显式的设置变量可变性，是安全性的重要组成部分。按理来说，变量可变不可变在设置时就已经决定了，但是你遇到过可变变量在某些情况失效，变成不可变吗？

先来看段正确的代码：
```rust
#[derive(Debug)]
struct A {
    f1: u32,
    f2: u32,
    f3: u32
}

#[derive(Debug)]
struct B<'a> {
    f1: u32,
    a: &'a mut A,
}

fn main() {
    let mut a: A = A{ f1: 0, f2: 1, f3: 2 };
    // b不可变
    let b: B = B{ f1: 3, a: &mut a };
    // 但是b中的字段a可以变
    b.a.f1 += 1;
    
    println!("b is {:?} ", &b);
}
```

在这里，虽然变量`b`被设置为不可变，但是`b`的其中一个字段`a`被设置为可变的结构体，因此我们可以通过`b.a.f1 += 1`来修改`a`的值。

也许有人还不知道这种部分可变性的存在，不过没关系，因为马上就不可变了：) 

- 结构体可变时，里面的字段都是可变的，例如`&mut a`
- 结构体不可变时，里面的某个字段可以单独设置为可变，例如`b.a`

在理解了上面两条简单规则后，来看看下面这段代码:
```rust
#[derive(Debug)]
struct A {
    f1: u32,
    f2: u32,
    f3: u32
}

#[derive(Debug)]
struct B<'a> {
    f1: u32,
    a: &'a mut A,
}


impl B<'_> {
    // this will not work
    pub fn changeme(&self) {
        self.a.f1 += 1;
    }
}

fn main() {
    let mut a: A = A{ f1: 0, f2: 1, f3: 2 };
    // b is immutable
    let b: B = B{ f1: 3, a: &mut a };
    b.changeme();
    
    println!("b is {:?} ", &b);
}
```

这段代码，仅仅做了一个小改变，不再直接修改`b.a`，而是通过调用`b`上的方法去修改其中的`a`，按理说不会有任何区别。因此我预言：通过方法调用跟直接调用不应该有任何区别，运行验证下：
```console
error[E0594]: cannot assign to `self.a.f1`, which is behind a `&` reference
  --> src/main.rs:18:9
   |
17 |     pub fn changeme(&self) {
   |                     ----- help: consider changing this to be a mutable reference: `&mut self`
18 |         self.a.f1 += 1;
   |         ^^^^^^^^^^^^^^ `self` is a `&` reference, so the data it refers to cannot be written
```

啪，又被打脸了。我说我是大意了，没有闪，大家信不？反正马先生应该是信的:D

## 简单分析
观察第一个例子，我们调用的`b.a`实际上是用`b`的值直接调用的，在这种情况下，由于所有权规则，编译器可以认定，只有一个可变引用指向了`a`，因此这种使用是非常安全的。

但是，在第二个例子中，`b`被藏在了`&`后面，根据所有权规则，同时可能存在多个`b`的借用，那么就意味着可能会存在多个可变引用指向`a`,因此编译器就拒绝了这段代码。

事实上如果你将第一段代码的调用改成:
```rust
let b: &B = &B{ f1: 3, a: &mut a };
b.a.f1 += 1;
```

一样会报错！

## 一个练习
结束之前再来一个练习，稍微有点绕，大家品味品味：
```rust
#[derive(Debug)]
struct A {
    f1: u32,
    f2: u32,
    f3: u32
}

#[derive(Debug)]
struct B<'a> {
    f1: u32,
    a: &'a mut A,
}

fn main() {
    let mut a: A = A{ f1: 0, f2: 1, f3: 2 };
    let b: B = B{ f1: 3, a: &mut a };
    b.a.f1 += 1;
    a.f1 = 10;
    
    println!("b is {:?} ", &b);
}
```

小提示：这里`b.a.f1 += 1`和`a.f1 = 10`只能有一个存在，否则就会报错。

## 总结

根据之前的观察和上面的小提示，可以得出一个结论：**可变性的真正含义是你对目标对象的独占修改权**。在实际项目中，偶尔会遇到比上述代码更复杂的可变性情况，记住这个结论，有助于我们拨云见日，直达本质。

学习，就是不断接近和认识事物本质的过程，对于Rust语言的学习亦是如此。