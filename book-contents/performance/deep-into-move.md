# Rust所有权转移时发生了奇怪的深拷贝

深拷贝可以说是Rust性能优化的禁忌之词，但是在最不该发生深拷贝的地方却发生了, 本文带领大家来深入分析下原因。

在所有权章节中，我们详细介绍过[所有权转移(move)](https://course.rs/basic/ownership/ownership.html#转移所有权), 里面提到过一个重点：当类型实现`Copy`特征时，不会转移所有权，而是直接对值进行拷贝：
```rust
fn main() {
    let x = 1;
    let y = x;
    // 不会报错
    println!("我(x)的值仅仅是被复制了，我还拥有值的所有权，不信你看：{:?}",x);

    let s = "aaa".to_string();
    let s1 = s;
    // 会报错
    println!("我(s)的值被转移给了s1，我已经失去所有权了: {}",s);
}
```

这里的`x`是数值类型，因此实现了`Copy`特征，当赋值给`y`时，仅仅是复制了值，并没有把所有权转移给`y`，但是`s`恰好相反，它没有实现`Copy`特征，当赋值后，所有权被转移给`s1`，最终导致了最后一行代码的报错.

根据之前的所有权学习章节，所有权转移时的仅仅是复制一个引用，并不会复制底层的数据，例如上面代码中，`s`的所有权转移给`s1`时，仅仅是复制了一个引用，该引用继续指向之前的字符串底层数据，因此**所有权转移的性能是非常高的**。

但是如果一切都这么完美，也不会出现这篇文章了，实际上是怎么样？先来看一段代码.

## move时发生了数据的深拷贝
```rust
struct LargeArray {
    a: [i128; 10000],
}

impl LargeArray {
    #[inline(always)]
    fn transfer(mut self) -> Self {
        println!("{:?}", &mut self.a[1] as *mut i128);

        // 改变数组中的值
        self.a[1] += 23;
        self.a[4] += 24;

        // 返回所有权
        self
    }
}

fn main() {
    let mut f = LargeArray { a: [10i128; 10000] };

    println!("{:?}", &mut f.a[1] as *mut i128);

    let mut f2 = f.transfer();

    println!("{:?}", &mut f2.a[1] as *mut i128);
}
```

上面的例子很简单，创建了一个结构体`f`(内部有一个大数组)，接着将它的所有权转移给`transfer`方法，最后再通过`Self`返回，转移给`f2`，在此过程中，观察结构体中的数组第二个元素的内存地址如何变化。

这里还有几个注意点：
- `LargeArray`没有实现`Copy`特征，因此在所有权转移时， **本应该**只是复制一下引用，底层的数组并不会被复制
- `transfer`方法的参数`self`表示接收所有权，而不是借用，返回类型`Self`也表示返回所有权，而不是返回借用, 具体内容在[方法](https://course.rs/basic/method.html)章节有介绍

从上可知，我们并不应该去复制底层的数组，那么底层数组的地址也不应该变化，换而言之三次内存地址输出应该是同一个地址。但是真的如此吗？世事难料：
```console
0x16f9d6870
0x16fa4bbc0
0x16fa24ac0
```

果然，结果让人大跌眼镜，竟然三次地址都不一样，意味着每次转移所有权都发生了底层数组的深拷贝！什么情况？！！如果这样，我们以后还能信任Rust吗？完全不符合官方的宣传。

在福建有一个武夷山5A景区，不仅美食特别好吃，而且风景非常优美，其中最著名的就是历时1个多小时的九曲十八弯漂流，而我们的结论是否也能像漂游一样来个大转折？大家拭目以待。


## 罪魁祸首println?
首先，通过谷歌搜索，我发现了一些蛛丝马迹，有文章提到如果通过`println`输出内存地址，可能会导致编译器优化失效，也就是从本该有的所有权转移变成了深拷贝，不妨来试试。

但是问题又来了，如果不用`println`或者类似的方法，我们怎么观察内存地址？好像陷入了绝路。。。只能从Rust之外去想办法了，此时大学学过的汇编发挥了作用：
```asm
.LCPI0_0:
        .quad   10
        .quad   0
example::xxx:
        mov     eax, 160000
        call    __rust_probestack
        sub     rsp, rax
        mov     rax, rsp
        lea     rcx, [rsp + 160000]
        vbroadcasti128  ymm0, xmmword ptr [rip + .LCPI0_0]
.LBB0_1:
        vmovdqu ymmword ptr [rax], ymm0
        vmovdqu ymmword ptr [rax + 32], ymm0
        vmovdqu ymmword ptr [rax + 64], ymm0
        vmovdqu ymmword ptr [rax + 96], ymm0
        vmovdqu ymmword ptr [rax + 128], ymm0
        vmovdqu ymmword ptr [rax + 160], ymm0
        vmovdqu ymmword ptr [rax + 192], ymm0
        vmovdqu ymmword ptr [rax + 224], ymm0
        vmovdqu ymmword ptr [rax + 256], ymm0
        vmovdqu ymmword ptr [rax + 288], ymm0
        vmovdqu ymmword ptr [rax + 320], ymm0
        vmovdqu ymmword ptr [rax + 352], ymm0
        vmovdqu ymmword ptr [rax + 384], ymm0
        vmovdqu ymmword ptr [rax + 416], ymm0
        vmovdqu ymmword ptr [rax + 448], ymm0
        vmovdqu ymmword ptr [rax + 480], ymm0
        vmovdqu ymmword ptr [rax + 512], ymm0
        vmovdqu ymmword ptr [rax + 544], ymm0
        vmovdqu ymmword ptr [rax + 576], ymm0
        vmovdqu ymmword ptr [rax + 608], ymm0
        add     rax, 640
        cmp     rax, rcx
        jne     .LBB0_1
        mov     rax, qword ptr [rsp + 16]
        mov     rdx, qword ptr [rsp + 24]
        add     rax, 69
        adc     rdx, 0
        add     rsp, 160000
        vzeroupper
        ret
```

去掉所有`println`后的汇编生成如上所示(大家可以在godbolt上自己尝试)，以我蹩脚的汇编水平来看，貌似没有任何数组拷贝的发生，也就是说：
如同量子的不可观测性，我们的`move`也这么傲娇？我们用println观测，它就傲娇去复制，不观测时，就老老实实转移所有权？WTF!

事情感觉进入了僵局，下一步该如何办？

## 栈和堆的不同move行为
我突然灵光一现，想到一个问题，之前的所有权转移其实可以分为两类：**栈上数据的复制和堆上数据的转移**，这也是非常符合直觉的，例如`i32`这种类型实现了`Copy`特征，可以存储在栈上，因此它就是复制行为，而`String`类型是引用存储在栈上，底层数据存储在堆上，因此转移所有权时只需要复制一下引用即可。

那问题来了，我们的`LargeArray`存在哪里？这也许就是一个破局点！
```rust
struct LargeArray {
    a: [i128; 10000],
}
```
结构体是一个复合类型，它内部字段的数据存在哪里，就大致决定了它存在哪里。而该结构体里面的`a`字段是一个数组，而不是动态数组`Vec`，从[数组](https://course.rs/basic/compound-type/array.html#创建数组)章节可知：数组是存储在栈上的数据结构！

再想想，栈上的数据在`move`的时候，是要从一个栈复制到另外一个栈的，那是不是内存地址就变了？！因此，就能完美解释，为什么使用`println`时，数组的地址会变化了，是因为栈上的数组发生了复制。

但是问题还有，为什么不使用`println`，数组地址就不变？要解释清楚这个问题，先从编译器优化讲起。

## 编译器对move的优化
从根本上来说，`move`就意味着拷贝复制，只不过看是浅拷贝还是深拷贝，对于堆上的数据来说，浅拷贝只复制引用，而栈上的数据则是整个复制。

但是在实际场景中，由于编译器的复杂实现，它能优化的场景远比我们想象中更多，例如对于`move`过程中的复制，编译器有可能帮你优化掉，在没有`println`的代码中，该`move`过程就被Rust编译器优化了。

但是这种编译器优化非常复杂，而且随着Rust的版本更新在不停变化，因此几乎没有人能说清楚这里面的门门道道，但是有一点可以知道：**`move`确实存在被优化的可能性，最终避免了复制的发生**.

那么`println`没有被优化的原因也呼之欲出了: 它阻止了编译器对`move`的优化。

## println阻止了优化
编译器优化的一个基本准则就是：中间过程没有其它代码在使用，则可以尝试消除这些中间过程。

回头来看看`println`:
```rust
println!("{:?}", &mut f.a[1] as *mut i128);
```

它需要打印数组在各个点的内存地址，假如编译器优化了复制，那这些中间状态的内存地址是不是就丢失了？对于这种可能会导致状态丢失的情况，编译器是不可能进行优化的，因此`move`时的栈上数组复制就顺理成章的发生了, 还是2次。


## 最佳实践
那么，在实践中遇到这种情况怎么办？

#### &mut self
其实办法也很多，首当其冲的就是使用`&mut self`进行可变借用，而不是转移进来所有权，再转移出去。


#### Box分配到堆上
如果你确实需要依赖所有权的转移来实现某个功能(例如链式方法调用:`x.a().b()...`)，那么就需要使用`Box`把该数组分配在堆上，而不是栈上：
```rust
struct LargeArray {
    a: Box<[i128; 10000]>,
}

impl LargeArray {
    #[inline(always)]
    fn transfer(mut self) -> Self {
        println!("{:?}", &mut self.a[1] as *mut i128);

        //do some stuff to alter it
        self.a[1] += 23;
        self.a[4] += 24;

        //return the same object
        self
    }
}

fn main() {
    let mut f = LargeArray { a: Box::new([10i128; 10000] )};

    println!("{:?}", &mut f.a[1] as *mut i128);

    let mut f2 = f.transfer();

    println!("{:?}", &mut f2.a[1] as *mut i128);
}
```

输出如下:
```
0x138008010
0x138008010
0x138008010
```

完美符合了我们对堆上数据的预期，hooray!

#### 神龟莫测的编译器优化
当然，你也可以选择相信编译器的优化，虽然很难识它真面目，同时它的行为也神鬼莫测，但是总归是在之前的例子中证明了，它确实可以，不是嘛？ = , =


