# 方法Method

从面向对象语言过来的同学对于方法肯定不陌生，`class`里面就充斥着方法的概念，在Rust中方法的概念也大差不差，往往和对象成对出现:
```rust
object.method()
```
例如读取一个文件写入缓冲区，如果用函数的写法`read(f,buffer)`,用方法的写法`f.read(buffer)`. 不过与其它语言`class`跟方法的联动使用不同，Rust的方法往往跟结构体、枚举、特征一起使用，特征将在后面几章进行介绍。

## 定义方法

Rust使用`impl`来定义方法,例如以下代码：
```rust
struct Circle {
    x: f64,
    y: f64,
    radius: f64,
}

impl Circle {
    // new是Circle的关联函数，因为它的第一个参数不是self
    // 这种方法往往用于初始化当前结构体的实例
    fn new(x: f64, y: f64, radius: f64) -> Circle {
        Circle {
            x: x,
            y: y,
            radius: radius,
        }
    }

    // Circle的方法，&self表示借用当前的Circle结构体
    fn area(&self) -> f64 {
        std::f64::consts::PI * (self.radius * self.radius)
    }
}
```

我们这里先不详细展开讲解，首先建立对方法定义的大致印象。下面图片将Rust方法定义与其它语言的方法定义做一下对比：

<img alt="" src="/img/method-01.png" class="center"/>

可以看出，其它语言中所有定义都在`class`中，但是Rust的对象定义和方法定义是分离的，这种数据和使用分离的方式，会给予使用者极高的灵活度。

再来看一个例子：
```rust
#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    fn area(&self) -> u32 {
        self.width * self.height
    }
}

fn main() {
    let rect1 = Rectangle { width: 30, height: 50 };

    println!(
        "The area of the rectangle is {} square pixels.",
        rect1.area()
    );
}
```

该例子定义了一个`Rectangle`结构体，并且在其上定义一个`area`方法，用于计算该矩形的面积。

`impl Rectangle {}`表示为`Rectangle`实现方法(`impl` 是实现*implementation* 的缩写)，这样的写法标明`impl`语句块中的一切都是跟`Rectangle`相关联的。

接下里的内容非常重要，请大家仔细看。在 `area` 的签名中，我们使用`&self`替代`rectangle: &Rectangle`，`&self`其实是`self: &Self`的简写（注意大小写）。在一个`impl`块内，`Self`指代被实现方法的结构体类型，`self`指代此类型的实例，换句话说，`self`指代的是`Rectangle`结构体实例，这样的写法会让我们的代码简洁很多，而且非常便于理解: 我们为哪个结构体实现方法，那么`self`就是指代的该结构体的实例。

需要注意的是，`self`依然有所有权的概念：
- `self`表示`Rectangle`的所有权转移到该方法中，这种形式用的较少
- `&self`表示该方法对`Rectangle`的不可变借用
- `&mut self`表示可变借用

总之，`self`的使用就跟函数参数一样，要严格遵守Rust的所有权规则。

回到上面的例子中，选择 `&self` 的理由跟在函数中使用 `&Rectangle` 是相同的：我们并不想获取所有权，也无需去改变它，只是希望能够读取结构体中的数据。如果想要在方法中去改变当前的结构体，需要将第一个参数改为 `&mut self`。通过仅仅使用 `self` 作为第一个参数来使方法获取实例的所有权是很少见的，这种使用方式往往用于把当前的对象转成另外一个对象时使用，转换完后，就不再关注之前的对象，且可以防止对之前对象的误调用。

简单总结下，使用方法代替函数有以下好处：
- 不用在函数签名中重复书写`self`对应的类型
- 代码的组织性和内聚性更强，对于代码维护和阅读来说，好处巨大

#### 方法名跟结构体字段名相同
在Rust中，允许方法名跟结构体的字段名相同：
```rust
impl Rectangle {
    fn width(&self) -> bool {
        self.width > 0
    }
}

fn main() {
    let rect1 = Rectangle {
        width: 30,
        height: 50,
    };

    if rect1.width() {
        println!("The rectangle has a nonzero width; it is {}", rect1.width);
    }
}
```

当我们使用`rect1.width()`时，Rust知道我们调用的是它的方法，如果使用`rect1.witdh`，则是调用它的字段。

一般来说，方法跟字段同名，往往适用于实现`getter`访问器，例如:
```rust
pub struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    pub fn new(width: u32, height: u32) -> Self {
        Rectangle { width, height }
    }
    pub fn width(&self) -> u32 {
        return self.width;
    }
}

fn main() {
    let rect1 = Rectangle::new(30, 50);

    println!("{}", rect1.width());
}
```

用这种方式，我们可以把`Rectangle`的字段设置为私有属性，只需把它的`new`和`width`方法设置为公开可见，那么用户就可以创建一个矩形，同时通过访问器`rect1.width()`方法来获取矩形的宽度, 因为`width`字段是私有的，当用户访问`rect1.width`字段时，就会报错。注意在此例中，`Self`指代的就是被实现方法的结构体`Rectangle`。

> ### `->` 运算符到哪去了？
>
> 在 C/C++ 语言中，有两个不同的运算符来调用方法：`.` 直接在对象上调用方法，而 `->` 在一个对象的指针上调用方法，这时需要先解引用指针。换句话说，如果 `object` 是一个指针，那么 `object->something()`和`(*object).something()`是一样的。
>
> Rust 并没有一个与 `->` 等效的运算符；相反，Rust 有一个叫 **自动引用和解引用**的功能。方法调用是 Rust 中少数几个拥有这种行为的地方。
>
> 他是这样工作的：当使用 `object.something()` 调用方法时，Rust 会自动为 `object` 添加 `&`、`&mut` 或 `*` 以便使 `object` 与方法签名匹配。也就是说，这些代码是等价的：
>
> ```rust
> # #[derive(Debug,Copy,Clone)]
> # struct Point {
> #     x: f64,
> #     y: f64,
> # }
> #
> # impl Point {
> #    fn distance(&self, other: &Point) -> f64 {
> #        let x_squared = f64::powi(other.x - self.x, 2);
> #        let y_squared = f64::powi(other.y - self.y, 2);
> #
> #        f64::sqrt(x_squared + y_squared)
> #    }
> # }
> # let p1 = Point { x: 0.0, y: 0.0 };
> # let p2 = Point { x: 5.0, y: 6.5 };
> p1.distance(&p2);
> (&p1).distance(&p2);
> ```
>
> 第一行看起来简洁的多。这种自动引用的行为之所以有效，是因为方法有一个明确的接收者———— `self` 的类型。在给出接收者和方法名的前提下，Rust 可以明确地计算出方法是仅仅读取（`&self`），做出修改（`&mut self`）或者是获取所有权（`self`）。事实上，Rust 对方法接收者的隐式借用让所有权在实践中更友好。

## 带有多个参数的方法
方法和函数一样，可以使用多个参数:
```rust
impl Rectangle {
    fn area(&self) -> u32 {
        self.width * self.height
    }

    fn can_hold(&self, other: &Rectangle) -> bool {
        self.width > other.width && self.height > other.height
    }
}

fn main() {
    let rect1 = Rectangle { width: 30, height: 50 };
    let rect2 = Rectangle { width: 10, height: 40 };
    let rect3 = Rectangle { width: 60, height: 45 };

    println!("Can rect1 hold rect2? {}", rect1.can_hold(&rect2));
    println!("Can rect1 hold rect3? {}", rect1.can_hold(&rect3));
}
```


## 关联函数

现在大家可以思考一个问题，如果为一个结构体定义一个构造器方法？也就是接受几个参数，然后构造并返回该结构体的实例。其实答案在开头的代码片段中就给出了，很简单，不使用`self`中即可。

这种定义在`impl`中且没有`self`的函数被称之为**关联函数**： 因为它没有`self`，不能用`f.read()`的形式使用，因此它是一个函数而不是方法，它又在`impl`中,与结构体紧密关联，因此称为关联函数。

在之前的代码中，我们已经多次使用过关联函数，例如`String::from`,用于创建一个动态字符串。

```rust
# #[derive(Debug)]
# struct Rectangle {
#     width: u32,
#     height: u32,
# }
#
impl Rectangle {
    fn new(w: u32, h: u32) -> Rectangle {
        Rectangle { width: w, height: h }
    }
}
```

> Rust中有一个约定俗称的规则，使用`new`来作为构造器的名称，出于设计上的考虑，Rust特地没有用`new`作为关键字

因为是函数，所以不能用`.`的方式来调用，我们需要用`::`来调用，例如 `let sq = Rectangle::new(3,3);`。这个方法位于结构体的命名空间中：`::` 语法用于关联函数和模块创建的命名空间。

## 多个impl定义
Rust允许我们为一个结构体定义多个`impl`块，目的是提供更多的灵活性和代码组织性，例如当方法多了后，可以把相关的方法组织在同个`impl`块中，那么就可以形成多个`impl`块，各自完成一块儿目标：
```rust
# #[derive(Debug)]
# struct Rectangle {
#     width: u32,
#     height: u32,
# }
#
impl Rectangle {
    fn area(&self) -> u32 {
        self.width * self.height
    }
}

impl Rectangle {
    fn can_hold(&self, other: &Rectangle) -> bool {
        self.width > other.width && self.height > other.height
    }
}
```

当然，就这个例子而言，我们没必要使用两个`impl`块，这里只是为了演示方便。

## 为枚举实现方法

枚举类型之所以强大，不仅仅在于它好用、可以[同一化类型](./compound-type/enum.md#同一化类型)，还在于，我们可以像结构体一样，为枚举实现方法:

```rust
#![allow(unused)]
fn main() {
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(i32, i32, i32),
}

impl Message {
    fn call(&self) {
        // 在这里定义方法体
    }
}

let m = Message::Write(String::from("hello"));
m.call();
}
```

除了结构体和枚举，我们还能为特征(trait)实现方法，将在下一章进行讲解，在此之前，先来看看泛型。