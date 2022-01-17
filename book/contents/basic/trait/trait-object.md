# 特征对象

在上一节中有一段代码无法通过编译:
```rust
fn returns_summarizable(switch: bool) -> impl Summary {
    if switch {
        Post {
           // ...
        }
    } else {
        Weibo {
            // ...
        }
    }
}
```
其中 `Post` 和 `Weibo` 都实现了 `Summary` 特征，因此上面的函数试图通过返回 `impl Summary` 来返回这两个类型，但是编译器却无情地报错了，原因是
 `impl Trait` 的返回值类型并不支持多种不同的类型返回，那如果我们想返回多种类型，该怎么办？

再来考虑一个问题：现在在做一款游戏，需要将多个对象渲染在屏幕上，这些对象属于不同的类型，存储在列表中，渲染的时候，需要循环该列表并顺序渲染每个对象，在Rust中该怎么实现？

聪明的同学可能已经能想到一个办法，利用枚举：
```rust
#[derive(Debug)]
enum UiObject {
    Button,
    SelectBox,
}

fn main() {
    let objects = [
        UiObject::Button,
        UiObject::SelectBox
    ];

    for o in objects {
        draw(o)
    }
}

fn draw(o: UiObject) {
    println!("{:?}",o);
}
```

Bingo，这个确实是一个办法，但是问题来了，如果你的对象集合并不能事先明确地知道呢？或者别人想要实现一个UI组件呢？此时枚举中的类型是有些缺少的，是不是还要修改你的代码增加一个枚举成员？

总之，在编写这个UI库时，我们无法知道所有的UI对象类型，只知道的是：
- UI对象的类型不同
- 需要一个统一的类型来处理这些对象，无论是作为函数参数还是作为列表中的一员
- 需要对每一个对象调用 `draw` 方法

在拥有继承的语言中，可以定义一个名为 `Component` 的类，该类上有一个 `draw` 方法。其他的类比如 `Button`、`Image` 和 `SelectBox` 会从 `Component` 派生并因此继承 `draw` 方法。它们各自都可以覆盖 `draw` 方法来定义自己的行为，但是框架会把所有这些类型当作是 `Component` 的实例，并在其上调用 `draw`。不过 Rust 并没有继承，我们得另寻出路。

## 特征对象定义
为了解决上面的所有问题，Rust引入了一个概念 - 特征对象。

在介绍特征对象之前，先来为之前的UI组件定义一个特征：
```rust
pub trait Draw {
    fn draw(&self);
}
```
只要组件实现了 `Draw` 特征，就可以调用 `draw` 方法来进行渲染。假设有一个 `Button` 和 `SelectBox` 组件实现了 `Draw` 特征：
```rust
pub struct Button {
    pub width: u32,
    pub height: u32,
    pub label: String,
}

impl Draw for Button {
    fn draw(&self) {
        // 绘制按钮的代码
    }
}

struct SelectBox {
    width: u32,
    height: u32,
    options: Vec<String>,
}

impl Draw for SelectBox {
    fn draw(&self) {
        // 绘制SelectBox的代码
    }
}

```
此时，还需要一个动态数组来存储这些UI对象：
```rust
pub struct Screen {
    pub components: Vec<?>,
}
```
注意到上面代码中的 `?` 吗？它的意思是：我们应该填入什么类型，可以说就之前学过的内容里，你找不到哪个类型可以填入这里，但是因为 `Button` 和 `SelectBox` 都实现了 `Draw` 特征，那我们是不是可以把 `Draw` 特征的对象作为类型，填入到数组中呢？答案是肯定的。

**特征对象**指向实现了 `Draw` 特征的类型的实例，也就是指向了 `Button` 或者 `SelectBox` 的实例，这种映射关系是存储在一张表中，可以在运行时通过特征对象找到具体调用的类型方法。

可以通过`&`引用或者`Box<T>`智能指针的方式来创建特征对象:
```rust
trait Draw {
    fn draw(&self) -> String; 
}

impl Draw for u8 {
    fn draw(&self) -> String {
        format!("u8: {}", *self) 
    } 
}

impl Draw for f64 {
    fn draw(&self) -> String {
        format!("f64: {}", *self) 
    } 
}

fn draw1(x: Box<dyn Draw>) {
    x.draw();
}

fn draw2(x: &dyn Draw) {
    x.draw();
}

fn main() {
    let x = 1.1f64;
    // do_something(&x);
    let y = 8u8;

    draw1(Box::new(x));
    draw1(Box::new(y));
    draw2(&x);
    draw2(&y);
}
```

上面代码，有几个非常重要的点：
- `draw1` 函数的参数是 `Box<dyn Draw>` 形式的特征对象，该特征对象是通过 `Box::new(x)` 的方式创建的
- `draw2` 函数的参数是 `&dyn Draw` 形式的特征对象，该特征对象是通过 `&x` 的方式创建的
- `dyn` 关键字只用在特征对象的类型声明上，在创建时无需使用 `dyn`

因此，可以使用特征对象来代表泛型或具体的类型。

继续来完善之前的UI组件代码，首先来实现 `Screen`：
```rust
pub struct Screen {
    pub components: Vec<Box<dyn Draw>>,
}
```
其中存储了一个动态数组，里面元素的类型是 `Draw` 特征对象：`Box<dyn Draw>`，任何实现了 `Draw` 特征的类型，都可以存放其中。

再来为 `Screen` 定义 `run` 方法，用于将列表中的UI组件渲染在屏幕上：
```rust
impl Screen {
    pub fn run(&self) {
        for component in self.components.iter() {
            component.draw();
        }
    }
}
```
至此，我们就完成了之前的目标：在列表中存储多种不同类型的实例，然后将它们使用同一个方法逐一渲染在屏幕上！

再来看看，如果通过泛型实现，会如何：
```rust
pub struct Screen<T: Draw> {
    pub components: Vec<T>,
}

impl<T> Screen<T>
    where T: Draw {
    pub fn run(&self) {
        for component in self.components.iter() {
            component.draw();
        }
    }
}
```
上面的 `Screen` 的列表中，存储了类型为 `T` 的元素，然后在 `Screen` 中使用特征约束让 `T` 实现了 `Draw` 特征，进而可以调用 `draw` 方法。

但是这种写法限制了 `Screen` 实例的 `Vec<T>` 中的每个元素必须是 `Button` 类型或者全是 `SelectBox` 类型。如果只需要同质（相同类型）集合，更倾向于这种写法：使用泛型和 特征约束，因为实现更清晰，且性能更好(特征对象，需要在运行时从 `vtable` 动态查找需要调用的方法。

现在来运行渲染下咱们精心设计的UI组件列表：
```rust
fn main() {
    let screen = Screen {
        components: vec![
            Box::new(SelectBox {
                width: 75,
                height: 10,
                options: vec![
                    String::from("Yes"),
                    String::from("Maybe"),
                    String::from("No")
                ],
            }),
            Box::new(Button {
                width: 50,
                height: 10,
                label: String::from("OK"),
            }),
        ],
    };

    screen.run();
}
```
上面使用 `Box::new(T)` 的方式来创建了两个 `Box<dyn Draw>` 特征对象，如果以后还需要增加一个UI组件，那么让该组件实现 `Draw` 特征，则可以很轻松的将其渲染在屏幕上，甚至用户可以引入我们的库作为三方库，然后在自己的库中为自己的类型实现 `Draw` 特征，然后进行渲染。

在动态类型语言中，有一个很重要的概念： **鸭子类型**（*duck typing*），简单来说，就是只关心值长啥样，而不关心它实际是什么。当一个东西走起来像鸭子，叫起来像鸭子，那么它就是一只鸭子，就算它实际上是一个奥特曼，也不重要，我们就当它是鸭子。

在上例中，`Screen` 在 `run` 的时候，我们并不需要知道各个组件的具体类型是什么。它也不检查组件到底是 `Button` 还是 `SelectBox` 的实例，只要它实现了 `Draw` 特征，就能通过 `Box::new` 包装成 `Box<dyn Draw>` 特征对象，然后被渲染在屏幕上。

使用特征对象和 Rust 类型系统来进行类似鸭子类型操作的优势是，无需在运行时检查一个值是否实现了特定方法或者担心在调用时因为值没有实现方法而产生错误。如果值没有实现特征对象所需的特征， 那么 Rust 根本就不会编译这些代码：

```rust
fn main() {
    let screen = Screen {
        components: vec![
            Box::new(String::from("Hi")),
        ],
    };

    screen.run();
}
```
因为 `String` 类型没有实现 `Draw` 特征，编译器直接就会报错，不会让上述代码运行。如果想要 `String` 类型被渲染在屏幕上，那么只需要为其实现 `Draw` 特征即可，非常容易。

#### &dyn和Box\<dyn\>的区别
前文提到， `&dyn` 和 `Box<dyn>` 都可以用于特征对象，因此在功能上 `&dyn` 和 `Box<dyn>` 几乎没有区别，唯一的区别就是：`&dyn` 减少了一次指针调用。

因为 `Box<dyn>` 是一个宽指针(`fat pointer`)，它需要一次额外的解引用后，才能获取到指向`vtable`的指针，然后再通过该指针访问 `vtable` 查询到具体的函数指针，最后进行调用。

所以，如果你在乎性能，又想使用特征对象简化代码，可以优先考虑 `&dyn`。

注意 `dyn` 不能单独作为特征对象的定义，例如下面的代码编译器会报错，原因是特征对象可以是任意实现了某个特征的类型，编译器在编译期不知道该类型的大小，不同的类型大小是不同的。

而 `&dyn` 和 `Box<dyn>` 在编译期都是已知大小，所以可以用作特征对象的定义。

```rust
fn draw2(x: dyn Draw) {
    x.draw();
}
```

```
10 | fn draw2(x: dyn Draw) {
   |          ^ doesn't have a size known at compile-time
   |
   = help: the trait `Sized` is not implemented for `(dyn Draw + 'static)`
help: function arguments must have a statically known size, borrowed types always have a known size
```

## 特征对象的动态分发

回忆一下泛型章节我们提到过的，泛型是在编译期完成处理的：编译器会为每一个泛型参数对应的具体类型生成一份代码，这种方式是**静态分发(static dispatch)**，因为是在编译期完成的，对于运行期性能完全没有任何影响。

与静态分发相对应的是**动态分发(dynamic dispatch)**，在这种情况下，直到运行时，才能确定需要调用什么方法。

当使用特征对象时，Rust 必须使用动态分发。编译器无法知晓所有可能用于特征对象代码的类型，所以它也不知道应该调用哪个类型的哪个方法实现。为此，Rust 在运行时使用特征对象中的指针来知晓需要调用哪个方法。动态分发也阻止编译器有选择的内联方法代码，这会相应的禁用一些优化。

## Self与self
在Rust中，有两个`self`，一个指代当前的实例对象，一个指代特征或者方法类型的别名：
```rust
trait Draw {
    fn draw(&self) ->  Self;
}

#[derive(Clone)]
struct Button;
impl Draw for Button {
    fn draw(&self) -> Self {
        return self.clone()
    }
}

fn main() {
    let button = Button;
    let newb = button.draw();
}
```

上述代码中，`self`指代的就是当前的实例对象，也就是 `button.draw()` 中的 `button` 实例，`Self` 则指代的是 `Button` 类型。

当理解了 `self` 与 `Self` 的区别后，我们再来看看何为对象安全。

## 特征对象的限制
不是所有特征都能拥有特征对象，只有对象安全的特征才行。当一个特征的所有方法都有如下属性时，它的对象才是安全的：
- 方法的返回类型不能是 `Self`
- 方法没有任何泛型参数

对象安全对于特征对象是必须的，因为一旦有了特征对象，就不再需要知道实现该特征的具体类型是什么了。如果特征方法返回了具体的 `Self` 类型，但是特征对象忘记了其真正的类型，那这个 `Self` 就非常尴尬，因为没人知道它是谁了。但是对于泛型类型参数来说，当使用特征时其会放入具体的类型参数：此具体类型变成了实现该特征的类型的一部分。而当使用特征对象时其具体类型被抹去了，故而无从得知放入泛型参数类型到底是什么。

标准库中的 `Clone` 特征就不符合对象安全的要求：

```rust
pub trait Clone {
    fn clone(&self) -> Self;
}
```

因为它的其中一个方法，返回了 `Self` 类型，因此它是对象不安全的。

`String` 类型实现了 `Clone` 特征， `String` 实例上调用 `clone` 方法时会得到一个 `String` 实例。类似的，当调用 `Vec<T>` 实例的 `clone` 方法会得到一个 `Vec<T>` 实例。`clone` 的签名需要知道什么类型会代替 `Self`，因为这是它的返回值。

如果违反了对象安全的规则，编译器会提示你。例如，如果尝试使用之前的 `Screen` 结构体来存放实现了 `Clone` 特征的类型：

```rust
pub struct Screen {
    pub components: Vec<Box<dyn Clone>>,
}
```

将会得到如下错误：

```text
error[E0038]: the trait `std::clone::Clone` cannot be made into an object
 --> src/lib.rs:2:5
  |
2 |     pub components: Vec<Box<dyn Clone>>,
  |     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ the trait `std::clone::Clone`
  cannot be made into an object
  |
  = note: the trait cannot require that `Self : Sized`
```

这意味着不能以这种方式使用此特征作为特征对象。
