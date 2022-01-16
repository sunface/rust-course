# 不仅仅是Hello world

几乎所有教程中安装的最后一个环节都是`hello world`，我们也不能免俗，但是在`hello world`之后，还有一个相亲，阿呸，Rust初印象环节，希望大家喜欢。

## 多国语言的"世界，你好"

还记得大明湖畔等你的[VScode](./editor.md) IDE和通过Cargo创建的[世界，你好](./cargo.md)工程嘛? 

现在使用VScode打开[上一节](./cargo.md)中创建的`world_hello`工程, 然后进入`main.rs`文件，此文件是当前Rust工程的入口文件，和其它语言几无区别。

接下来，对世界友人给予热切的问候：
```rust
fn greet_world() {
     let southern_germany = "Grüß Gott!";
     let chinese = "世界，你好";
     let english = "World, hello";
     let regions = [southern_germany, chinese, english];
     for region in regions.iter() {
             println!("{}", &region);
     }
 }
 
 fn main() {
     greet_world();
 }
```

打开终端，进入`world_hello`工程根目录，运行该程序(你也可以在VScode中打开终端,方法是点击左下角的错误和警告图标)，你的热情，好像一把火，燃烧了整个世界：
```console
$ cargo run
   Compiling world_hello v0.1.0 (/Users/sunfei/development/rust/world_hello)
    Finished dev [unoptimized + debuginfo] target(s) in 0.21s
     Running `target/debug/world_hello`
Grüß Gott!
世界，你好
World, hello
sunfei@sunfeideMa
```

花点时间来看看上面的代码，首先，Rust原生支持UTF-8编码的字符串，这意味着你可以很容易的使用世界各国文字作为字符串内容。

其次，关注下`println`后面的`!`，如果你有Ruby编程经验，那么你可能会认为这是解构操作符，但是在Rust中，这是`宏`操作符，你目前可以认为宏是一种特殊类型函数。

对于`println`来说，我们没有使用其它语言惯用的`%s`,`%d`来做输出占位符，而是使用`{}`，因为Rust在底层帮我们做了大量工作，会自动识别输出数据的类型，例如当前例子，会识别为`string`类型。

最后，和其它语言不同，rust的集合类型不能直接进行循环，需要变成迭代器(这里是通过`.iter()`方法)，才能用于迭代循环，在目前来看，你会觉得这一点好像挺麻烦，不急，以后就知道这么做的好处所在.

至于函数声明、调用、数组的使用，和其它语言没什么区别，so easy!

## Rust语言初印象
Rust这门语言对于Haskell和Java开发来说，会觉得很熟悉，因为它们在高阶表达方面都很优秀，简而言之，可以很简洁的写出原本需要一大堆代码才能表达的含义，但是Rust又有所不同：它的性能是底层语言级别的性能，可以跟C/C++相媲美。

上一句的`so easy`的余音仍在绕梁，我希望它能继续下去，可是。。。人总是要面对现实，因此让我们来些狠的: 
```rust
fn main() {
   let penguin_data = "\
   common name,length (cm)
   Little penguin,33
   Yellow-eyed penguin,65
   Fiordland penguin,60
   Invalid,data
   ";
 
   let records = penguin_data.lines();
 
   for (i, record) in records.enumerate() {
     if i == 0 || record.trim().len() == 0 {
       continue;
     }
     
     // 声明一个fields变量，类型是Vec
     // Vec是vector的缩写，是一个可伸缩的集合类型，可以认为是一个动态数组
     // <_>表示Vec中的元素类型由编译器自行推断，在很多场景下，都会帮我们省却不少功夫
     let fields: Vec<_> = record
       .split(',')
       .map(|field| field.trim())
       .collect();
     if cfg!(debug_assertions) {
         // 输出到标准错误输出
       eprintln!("debug: {:?} -> {:?}",
              record, fields);
     }
 
     let name = fields[0];
     // 1. 尝试把fields[1]的值转换为f32类型的浮点数，如果成功，则把f32值赋给length变量
     // 2. if let是一个匹配表达式，用来从=右边的结果中，匹配出length的值:
     // 当=右边的表达式执行成功，则会返回一个Ok(f32)的类型，若失败，则会返回一个Err(e)类型，if let的作用就是仅匹配Ok也就是成功的情
     // 况,如果是错误，就直接忽略，同时if let还会做一次解构匹配，通过Ok(length)去匹配右边的Ok(f32)，最终把相应的f32值赋给length
     // 3. 当然你也可以忽视成功的情况，用if let Err(e) = fields[1].parse::<f32>() {...}匹配出错误，然后打印出来，但是没啥卵用
     if let Ok(length) = fields[1].parse::<f32>() {
         // 输出到标准输出
         println!("{}, {}cm", name, length);
     }
   }
 }
```

看完这段代码，不知道你的余音有没有嘎然而止，反正我已经在颤抖了，这就是传说中的下马威嘛？上面代码中值得注意的Rust特性有：
- 控制流：`for`和`continue`在一起，实现的循环
- 方法语法：由于Rust没有继承，因此Rust不是传统意义上的面向对象语言，但是它却从`OO`语言那里偷师了方法的使用`record.trim()`,`record.split(',')`等
- 高阶函数编程： 函数可以作为参数也能作为返回值，例如`.map(|field| field.trim())`, 这里`map`使用闭包函数作为参数，也可以称呼为`匿名函数`、`lambda函数`
- 类型标注: `if let Ok(length) = fields[1].parse::<f32>()`, 通过`::<f32>`的使用，告诉编译器`length`是一个`f32`类型的浮点数，这种类型标注不是很常用，但是在编译器无法推断出你的数据类型时，就很有用了
- 条件编译: `if cfg!(debug_assertions)`，说明紧跟其后的输出打印只在`debug`模式下生效
- 隐式返回：Rust提供了`return`关键字用于函数返回，但是在很多时候，我们可以省略它。因为Rust是[**基于表达式的语言**](../basic/base-type/statement-expression.md)


在终端运行上述代码时，会看到很多`debug: ...`的输出, 上面有讲，这些都是`条件编译`的输出, 那么该怎么消除掉这些输出呢？

读者大大普遍冰雪聪明，肯定已经想到：是的，在[认识Cargo](./cargo.md#手动编译和运行项目)中，曾经介绍过`--release`参数，因为`cargo run`默认是运行`debug`模式. 因此想要消灭那些`debug:`输出，需要更改为其它模式，其中最常用的模式就是`--release`也就是生产发布的模式。

具体运行代码就不给了，留给大家作为一个小练习，建议亲自动手尝试下。

至此，Rust安装入门就已经结束，相信看到这里，你已经发现了本书与其它书的区别，其中最大的区别就是：**这本书就像优秀的国外课本一样，不太枯燥，也希望这本不太枯燥的书，能伴你长行，犹如一杯奶茶，细细品之，唇齿余香**。
