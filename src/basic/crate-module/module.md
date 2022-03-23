# 模块 Module

在本章节，我们将深入讲讲 Rust 的代码构成单元：模块。使用模块可以将包中的代码按照功能性进行重组，最终实现更好的可读性及易用性。同时，我们还能非常灵活地去控制代码的可见性，进一步强化 Rust 的安全性。

## 创建嵌套模块

小旅馆，sorry，是小餐馆，相信大家都挺熟悉的，学校外的估计也没少去，那么咱就用小餐馆为例，来看看 Rust 的模块该如何使用。

使用 `cargo new --lib restaurant` 创建一个小餐馆，注意，这里创建的是一个库类型的 `Package`，然后将以下代码放入 `src/lib.rs` 中：

```rust
// 餐厅前厅，用于吃饭
mod front_of_house {
    mod hosting {
        fn add_to_waitlist() {}

        fn seat_at_table() {}
    }

    mod serving {
        fn take_order() {}

        fn serve_order() {}

        fn take_payment() {}
    }
}
```

以上的代码创建了三个模块，有几点需要注意的：

- 使用 `mod` 关键字来创建新模块，后面紧跟着模块名称
- 模块可以嵌套，这里嵌套的原因是招待客人和服务都发生在前厅，因此我们的代码模拟了真实场景
- 模块中可以定义各种 Rust 类型，例如函数、结构体、枚举、特征等
- 所有模块均定义在同一个文件中

类似上述代码中所做的，使用模块，我们就能将功能相关的代码组织到一起，然后通过一个模块名称来说明这些代码为何被组织在一起。这样其它程序员在使用你的模块时，就可以更快地理解和上手。

## 模块树

在[上一节](basic/crate-module/crate.md)中，我们提到过 `src/main.rs` 和 `src/lib.rs` 被称为包根(crate root)，这个奇葩名称的来源(我不想承认是自己翻译水平太烂-,-)是由于这两个文件的内容形成了一个模块 `crate`，该模块位于包的树形结构(由模块组成的树形结构)的根部：

```console
crate
 └── front_of_house
     ├── hosting
     │   ├── add_to_waitlist
     │   └── seat_at_table
     └── serving
         ├── take_order
         ├── serve_order
         └── take_payment
```

这颗树展示了模块之间**彼此的嵌套**关系，因此被称为**模块树**。其中 `crate` 包根是 `src/lib.rs` 文件，包根文件中的三个模块分别形成了模块树的剩余部分。

#### 父子模块

如果模块 `A` 包含模块 `B`，那么 `A` 是 `B` 的父模块，`B` 是 `A` 的子模块。在上例中，`front_of_house` 是 `hosting` 和 `serving` 的父模块，反之，后两者是前者的子模块。

聪明的读者，应该能联想到，模块树跟计算机上文件系统目录树的相似之处。不仅仅是组织结构上的相似，就连使用方式都很相似：每个文件都有自己的路径，用户可以通过这些路径使用它们，在 Rust 中，我们也通过路径的方式来引用模块。

## 用路径引用模块

想要调用一个函数，就需要知道它的路径，在 Rust 中，这种路径有两种形式：

- **绝对路径**，从包根开始，路径名以包名或者 `crate` 作为开头
- **相对路径**，从当前模块开始，以 `self`，`super` 或当前模块的标识符作为开头

让我们继续经营那个惨淡的小餐馆，这次为它实现一个小功能：
<span class="filename">文件名：src/lib.rs</span>

```rust
mod front_of_house {
    mod hosting {
        fn add_to_waitlist() {}
    }
}

pub fn eat_at_restaurant() {
    // 绝对路径
    crate::front_of_house::hosting::add_to_waitlist();

    // 相对路径
    front_of_house::hosting::add_to_waitlist();
}
```

上面的代码为了简化实现，省去了其余模块和函数，这样可以把关注点放在函数调用上。`eat_at_restaurant` 是一个定义在包根中的函数，在该函数中使用了两种方式对 `add_to_waitlist` 进行调用。

#### 绝对路径引用

因为 `eat_at_restaurant` 和 `add_to_waitlist` 都定义在一个包中，因此在绝对路径引用时，可以直接以 `crate` 开头，然后逐层引用，每一层之间使用 `::` 分隔：

```rust
crate::front_of_house::hosting::add_to_waitlist();
```

对比下之前的模块树：

```console
crate
 └── eat_at_restaurant
 └── front_of_house
     ├── hosting
     │   ├── add_to_waitlist
     │   └── seat_at_table
     └── serving
         ├── take_order
         ├── serve_order
         └── take_payment
```

可以看出，绝对路径的调用，完全符合了模块树的层级递进，非常符合直觉，如果类比文件系统，就跟使用绝对路径调用可执行程序差不多：`/front_of_house/hosting/add_to_waitlist`，使用 `crate` 作为开始就和使用 `/` 作为开始一样。

#### 相对路径引用

再回到模块树中，因为 `eat_at_restaurant` 和 `front_of_house` 都处于包根 `crate` 中，因此相对路径可以使用 `front_of_house` 作为开头：

```rust
front_of_house::hosting::add_to_waitlist();
```

如果类比文件系统，那么它类似于调用同一个目录下的程序，你可以这么做：`front_of_house/hosting/add_to_waitlist`，嗯也很符合直觉。

#### 绝对还是相对？

如果只是为了引用到指定模块中的对象，那么两种都可以，但是在实际使用时，需要遵循一个原则：**当代码被挪动位置时，尽量减少引用路径的修改**，相信大家都遇到过，修改了某处代码，导致所有路径都要挨个替换，这显然不是好的路径选择。

回到之前的例子，如果我们把 `front_of_house` 模块和 `eat_at_restaurant` 移动到一个模块中 `customer_experience`，那么绝对路径的引用方式就必须进行修改：`crate::customer_experience::front_of_house ...`，但是假设我们使用的相对路径，那么该路径就无需修改，因为它们两的相对位置其实没有变：

```console
crate
 └── customer_experience
    └── eat_at_restaurant
    └── front_of_house
        ├── hosting
        │   ├── add_to_waitlist
        │   └── seat_at_table
```

从新的模块树中可以很清晰的看出这一点。

再比如，其它的都不动，把 `eat_at_restaurant` 移动到模块 `dining` 中，如果使用相对路径，你需要修改该路径，但如果使用的是绝对路径，就无需修改：

```console
crate
 └── dining
     └── eat_at_restaurant
 └── front_of_house
     ├── hosting
     │   ├── add_to_waitlist
```

不过，如果不确定哪个好，你可以考虑优先使用绝对路径，因为调用的地方和定义的地方往往是分离的，而定义的地方较少会变动。

## 代码可见性

让我们运行下面(之前)的代码：

```rust
mod front_of_house {
    mod hosting {
        fn add_to_waitlist() {}
    }
}

pub fn eat_at_restaurant() {
    // 绝对路径
    crate::front_of_house::hosting::add_to_waitlist();

    // 相对路径
    front_of_house::hosting::add_to_waitlist();
}
```

意料之外的报错了，毕竟看上去确实很简单且没有任何问题：

```console
error[E0603]: module `hosting` is private
 --> src/lib.rs:9:28
  |
9 |     crate::front_of_house::hosting::add_to_waitlist();
  |                            ^^^^^^^ private module
```

错误信息很清晰：`hosting` 模块是私有的，无法在包根进行访问，那么为何 `front_of_house` 模块就可以访问？因为它和 `eat_at_restaurant` 同属于一个包根作用域内，同一个模块内的代码自然不存在私有化问题(所以我们之前章节的代码都没有报过这个错误！)。

模块不仅仅对于组织代码很有用，它还能定义代码的私有化边界：在这个边界内，什么内容能让外界看到，什么内容不能，都有很明确的定义。因此，如果希望让函数或者结构体等类型变成私有化的，可以使用模块。

Rust 出于安全的考虑，默认情况下，所有的类型都是私有化的，包括函数、方法、结构体、枚举、常量，是的，就连模块本身也是私有化的。在中国，父亲往往不希望孩子拥有小秘密，但是在 Rust 中，**父模块完全无法访问子模块中的私有项，但是子模块却可以访问父模块、父父..模块的私有项**。

#### pub 关键字

类似其它语言的 `public` 或者 Go 语言中的首字母大写，Rust 提供了 `pub` 关键字，通过它你可以控制模块和模块中指定项的可见性。

由于之前的解释，我们知道了只需要将 `hosting` 模块标记为对外可见即可：

```rust
mod front_of_house {
    pub mod hosting {
        fn add_to_waitlist() {}
    }
}

/*--- snip ----*/
```

但是不幸的是，又报错了：

```console
error[E0603]: function `add_to_waitlist` is private
  --> src/lib.rs:12:30
   |
12 |     front_of_house::hosting::add_to_waitlist();
   |                              ^^^^^^^^^^^^^^^ private function
```

哦？难道模块可见还不够，还需要将函数 `add_to_waitlist` 标记为可见的吗？ 是的，没错，模块可见性不代表模块内部项的可见性，模块的可见性仅仅是允许其它模块去引用它，但是想要引用它内部的项，还得继续将对应的项标记为 `pub`。

在实际项目中，一个模块需要对外暴露的数据和 API 往往就寥寥数个，如果将模块标记为可见代表着内部项也全部对外可见，那你是不是还得把那些不可见的，一个一个标记为 `private`？反而是更麻烦的多。

既然知道了如何解决，那么我们为函数也标记上 `pub`：

```rust
mod front_of_house {
    pub mod hosting {
        pub fn add_to_waitlist() {}
    }
}

/*--- snip ----*/
```

Bang，顺利通过编译，感觉自己又变强了。

## 使用 `super` 引用模块

在[用路径引用模块](#用路径引用模块)中，我们提到了相对路径有三种方式开始：`self`、`super`和 `crate` 或者模块名，其中第三种在前面已经讲到过，现在来看看通过 `super` 的方式引用模块项。

`super` 代表的是父模块为开始的引用方式，非常类似于文件系统中的 `..` 语法：`../a/b`
<span class="filename">文件名：src/lib.rs</span>

```rust
fn serve_order() {}

// 厨房模块
mod back_of_house {
    fn fix_incorrect_order() {
        cook_order();
        super::serve_order();
    }

    fn cook_order() {}
}
```

嗯，我们的小餐馆又完善了，终于有厨房了！看来第一个客人也快可以有了。。。在厨房模块中，使用 `super::serve_order` 语法，调用了父模块(包根)中的 `serve_order` 函数。

那么你可能会问，为何不使用 `crate::serve_order` 的方式？额，其实也可以，不过如果你确定未来这种层级关系不会改变，那么 `super::serve_order` 的方式会更稳定，未来就算它们都不在包根了，依然无需修改引用路径。所以路径的选用，往往还是取决于场景，以及未来代码的可能走向。

## 使用 `self` 引用模块

`self` 其实就是引用自身模块中的项，也就是说和我们之前章节的代码类似，都调用同一模块中的内容，区别在于之间章节中直接通过名称调用即可，而 `self`，你得多此一举：

```rust
fn serve_order() {
    self::back_of_house::cook_order()
}

mod back_of_house {
    fn fix_incorrect_order() {
        cook_order();
        crate::serve_order();
    }

    pub fn cook_order() {}
}
```

是的，多此一举，因为完全可以直接调用 `back_of_house`，但是 `self` 还有一个大用处，在下一节中我们会讲。

## 结构体和枚举的可见性

为何要把结构体和枚举的可见性单独拎出来讲呢？因为这两个家伙的成员字段拥有完全不同的可见性：

- 将结构体设置为 `pub`，但它的所有字段依然是私有的
- 将枚举设置为 `pub`，它的所有字段也将对外可见

原因在于，枚举和结构体的使用方式不一样。如果枚举的成员对外不可见，那该枚举将一点用都没有，因此枚举成员的可见性自动跟枚举可见性保持一致，这样可以简化用户的使用。

而结构体的应用场景比较复杂，其中的字段也往往部分在 A 处被使用，部分在 B 处被使用，因此无法确定成员的可见性，那索性就设置为全部不可见，将选择权交给程序员。

## 模块与文件分离

在之前的例子中，我们所有的模块都定义在 `src/lib.rs` 中，但是当模块变多或者变大时，需要将模块放入一个单独的文件中，让代码更好维护。

现在，把 `front_of_house` 前厅分离出来，放入一个单独的文件中 `src/front_of_house.rs`：

```rust
pub mod hosting {
    pub fn add_to_waitlist() {}
}
```

然后，将以下代码留在 `src/lib.rs` 中：

```rust
mod front_of_house;

pub use crate::front_of_house::hosting;

pub fn eat_at_restaurant() {
    hosting::add_to_waitlist();
    hosting::add_to_waitlist();
    hosting::add_to_waitlist();
}
```

so easy！其实跟之前在同一个文件中也没有太大的不同，但是有几点值得注意：

- `mod front_of_house;` 告诉 Rust 从另一个和模块 `front_of_house` 同名的文件中加载该模块的内容
- 使用绝对路径的方式来引用 `hosting` 模块：`crate::front_of_house::hosting;`

需要注意的是，和之前代码中 `mod front_of_house{..}` 的完整模块不同，现在的代码中，模块的声明和实现是分离的，实现是在单独的 `front_of_house.rs` 文件中，然后通过 `mod front_of_house;` 这条声明语句从该文件中把模块内容加载进来。因此我们可以认为，模块 `front_of_house` 的定义还是在 `src/lib.rs` 中，只不过模块的具体内容被移动到了 `src/front_of_house.rs` 文件中。

在这里出现了一个新的关键字 `use`，联想到其它章节我们见过的标准库引入 `use std::fmt;`，可以大致猜测，该关键字用来将外部模块中的项引入到当前作用域中来，这样无需冗长的父模块前缀即可调用：`hosting::add_to_waitlist();`，在下节中，我们将对 `use` 进行详细的讲解。
