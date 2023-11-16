# Eq 和 PartialEq
在 Rust 中，想要重载操作符，你就需要实现对应的特征。

例如 `<`、`<=`、`>` 和 `>=` 需要实现 `PartialOrd` 特征:
```rust
use std::fmt::Display;

struct Pair<T> {
    x: T,
    y: T,
}

impl<T> Pair<T> {
    fn new(x: T, y: T) -> Self {
        Self { x, y }
    }
}

impl<T: Display + PartialOrd> Pair<T> {
    fn cmp_display(&self) {
        if self.x >= self.y {
            println!("The largest member is x = {}", self.x);
        } else {
            println!("The largest member is y = {}", self.y);
        }
    }
}
```

再比如， `+` 号需要实现 `std::ops::Add` 特征，而本文的主角 `Eq` 和 `PartialEq` 正是 `==` 和 `!=` 所需的特征，那么问题来了，这两个特征有何区别？

我相信很多同学都说不太清楚，包括一些老司机，而且就算是翻文档，可能也找不到特别明确的解释。如果大家看过标准库示例，可能会看过这个例子：
```rust
enum BookFormat { Paperback, Hardback, Ebook }
struct Book {
    isbn: i32,
    format: BookFormat,
}
impl PartialEq for Book {
    fn eq(&self, other: &Self) -> bool {
        self.isbn == other.isbn
    }
}
impl Eq for Book {}
```

这里只实现了 `PartialEq`，并没有实现 `Eq`，而是直接使用了默认实现 `impl Eq for Book {}`，奇了怪了，别急，还有呢：
```rust
impl PartialEq<IpAddr> for Ipv4Addr {
    #[inline]
    fn eq(&self, other: &IpAddr) -> bool {
        match other {
            IpAddr::V4(v4) => self == v4,
            IpAddr::V6(_) => false,
        }
    }
}

impl Eq for Ipv4Addr {}
```

以上代码来自 Rust 标准库，可以看到，依然是这样使用，类似的情况数不胜数。既然如此，是否说明**如果要为我们的类型增加相等性比较，只要实现 `PartialEq` 即可？**

其实，关键点就在于 `partial` 上，**如果我们的类型只在部分情况下具有相等性**，那你就只能实现 `PartialEq`，否则可以实现 `PartialEq` 然后再默认实现 `Eq`。

好的，问题逐步清晰起来，现在我们只需要搞清楚何为部分相等。

### 部分相等性
首先我们需要找到一个类型，它实现了 `PartialEq` 但是没有实现 `Eq`（你可能会想有没有反过来的情况？当然没有啦，部分相等肯定是全部相等的子集！）

在 `HashMap` 章节提到过 `HashMap` 的 key 要求实现 `Eq` 特征，也就是要能完全相等，而浮点数由于没有实现 `Eq` ，因此不能用于 `HashMap` 的 key。

当时由于一些知识点还没有介绍，因此就没有进一步展开，那么让我们考虑浮点数既然没有实现 `Eq` 为何还能进行比较呢？
```rust
fn main() {
   let f1 = 3.14;
   let f2 = 3.14;

   if f1 == f2 {
       println!("hello, world!");
   }
}
```

以上代码是可以看到输出内容的，既然浮点数没有实现 `Eq` 那说明它实现了 `PartialEq`，一起写个简单代码验证下：
```rust
fn main() {
    let f1 = 3.14;
    is_eq(f1);
    is_partial_eq(f1)
}

fn is_eq<T: Eq>(f: T) {}
fn is_partial_eq<T: PartialEq>(f: T) {}
```

上面的代码通过特征约束的方式验证了我们的结论: 
```shell
3 |     is_eq(f1);
  |     ----- ^^ the trait `Eq` is not implemented for `{float}`
```

好的，既然我们成功找到了一个类型实现了 `PartialEq` 但没有实现 `Eq`，那就通过它来看看何为部分相等性。

其实答案很简单，浮点数有一个特殊的值 `NaN`，它是无法进行相等性比较的:
```rust
fn main() {
    let f1 = f32::NAN;
    let f2 = f32::NAN;

    if f1 == f2 {
        println!("NaN 竟然可以比较，这很不数学啊！")
    } else {
        println!("果然，虽然两个都是 NaN ，但是它们其实并不相等")
    }
}
```

大家猜猜哪一行会输出 :) 至于 `NaN` 为何不能比较，这个原因就比较复杂了( 有读者会说，其实就是你不知道，我只能义正严辞的说：咦？你怎么知道 :P )。

既然浮点数有一个值不可以比较相等性，那它自然只能实现 `PartialEq` 而不能实现 `Eq` 了，以此类推，如果我们的类型也有这种特殊要求，那也应该这么做。

### Ord 和 PartialOrd
事实上，还有一对与 `Eq/PartialEq` 非常类似的特征，它们可以用于 `<`、`<=`、`>` 和 `>=` 比较，至于哪个类型实现了 `PartialOrd` 却没有实现 `Ord` 就交给大家自己来思考了：）


> 小提示：Ord 意味着一个类型的所有值都可以进行排序，而 PartialOrd 则不然
