# 结构体

上一节中提到需要一个更高级的数据结构来帮助我们更好的抽象问题，结构体`struct`恰恰就是这样的复合数据结构，它是由其它数据类型组合而来。 其它语言也有类似的数据结构，不过可能有不同的名称，例如`object`、`record`等。

结构体跟之前讲过的[元组](./tuple.md)有些相像：都是由多种类型组合而成。但是与元组不同的是，结构体可以为内部的每个字段起一个富有含义的名称。因此结构体更加灵活更加强大，你无需依赖这些字段的顺序来访问和解析它们。

## 结构体语法
天下无敌的剑士往往也因为他有一柄无双之剑，既然结构体这么强大，那么我们就需要给它配套一套强大的语法，让用户能更好的驾驭。

#### 定义结构体
一个结构体有几部分组成：
- 通过关键字`struct`定义
- 一个清晰明确的结构体`名称`
- 数个具名的结构体`字段`

例如以下结构体定义了某网站的用户：
```rust
struct User {
    active: bool,
    username: String,
    email: String,
    sign_in_count: u64,
}
```
该结构体名称是`User`，拥有4个具名的字段，且每个字段都有对应的类型声明，例如`username`代表了用户名，是一个可变的`String`类型。

#### 创建结构体实例
为了使用上述结构体，我们需要创建`User`结构体的**实例**：
```rust
  let user1 = User {
        email: String::from("someone@example.com"),
        username: String::from("someusername123"),
        active: true,
        sign_in_count: 1,
};
```
有几点值得注意:
1. 初始化实例时，需要为**每个字段**都进行初始化
2. 初始化时的字段顺序无需按照定义的顺序来

#### 访问结构体字段
通过`.`操作符即可访问结构体实例内部的字段值，也可以修改它们：
```rust
    let mut user1 = User {
        email: String::from("someone@example.com"),
        username: String::from("someusername123"),
        active: true,
        sign_in_count: 1,
    };

    user1.email = String::from("anotheremail@example.com");
```
需要注意的是，必须要将整个结构体都声明为可变的，才能修改它，Rust不允许单独将某个字段标记为可变: `let mut user1 = User {...}`.

#### 简化结构体创建
下面的函数类似一个构建函数，返回了`User`结构体的实例：
```rust
fn build_user(email: String, username: String) -> User {
    User {
        email: email,
        username: username,
        active: true,
        sign_in_count: 1,
    }
}
```
它接收两个字符串参数：`email`和`username`，然后使用它们来创建一个`User`结构体，并且返回。可以注意到这两行：`email: email`和`username: username`，非常的扎眼，因为实在有些啰嗦，如果你从typescript过来，肯定会鄙视Rust一番，不过好在，它也不是无可救药:
```rust
fn build_user(email: String, username: String) -> User {
    User {
        email,
        username,
        active: true,
        sign_in_count: 1,
    }
}
```
如上所示，当函数参数和结构体字段同名时，可以直接使用缩略的方式进行初始化，跟`typescript`中一模一样.


#### 结构体更新语法
在实际场景中，有一种情况很常见：根据已有的结构体实例，创建新的结构体实例，例如根据已有的`user1`实例来构建`user2`：
```rust
  let user2 = User {
        active: user1.active,
        username: user1.username,
        email: String::from("another@example.com"),
        sign_in_count: user1.sign_in_count,
    };
```

老话重提，如果你从typescript过来，肯定觉得啰嗦爆了：竟然手动把`user1`的三个字段逐个赋值给`user2`，好在Rust为我们提供了`结构体更新语法`:
```rust
  let user2 = User {
        email: String::from("another@example.com"),
        ..user1
    };
```
因为`user2`仅仅在`email`上与`user1`不同，因此我们只需要对`email`进行赋值，剩下的通过结构体更新语法`..user1`即可完成。

`..`语法说明我们没有显示声明的字段全部从`user1`中自动获取。需要注意的是`..user1`必须在结构体的尾部使用。

> 结构体更新语法跟赋值语句`=`非常相像，因此在上面代码中，`user1`的部分字段所有权被转移到`user2`中：`username`字段发生了所有权转移,作为结果，`user1`无法再被使用。
>
> 聪明的读者肯定要发问了：明明有三个字段进行了自动赋值，为何只有`username`发生了所有权转移？
>
> 仔细回想一下[所有权](../ownership/ownership.md#拷贝(浅拷贝))那一节的内容，我们提到了Copy特征：实现了Copy特征的类型无需所有权转移，可以直接在赋值时进行
> 数据拷贝，其中`bool`和`u64`类型就实现了`Copy`特征，因此`active`和`sign_in_count`字段在赋值给user2时，仅仅发生了拷贝，而不是所有权转移.
>
> 值的注意的是：`username`所有权被转移给了`user2`,导致了`user1`无法再被使用，但是并不代表`user1`内部的其它字段不能被继续使用，例如:

```rust
# #[derive(Debug)]
# struct User {
#     active: bool,
#     username: String,
#     email: String,
#     sign_in_count: u64,
# }
# fn main() {
let user1 = User {
    email: String::from("someone@example.com"),
    username: String::from("someusername123"),
    active: true,
    sign_in_count: 1,
};
let user2 = User {
    active: user1.active,
    username: user1.username,
    email: String::from("another@example.com"),
    sign_in_count: user1.sign_in_count,
};
println!("{}", user1.active);
// 下面这行会报错
println!("{:?}", user1);
# }
```

## 结构体的内存排列

先来看以下代码：
```rust
#[derive(Debug)]
 struct File {
   name: String,
   data: Vec<u8>,
 }
 
 fn main() {
   let f1 = File {
     name: String::from("f1.txt"),
     data: Vec::new(),
   };
 
   let f1_name = &f1.name;
   let f1_length = &f1.data.len();
 
   println!("{:?}", f1);
   println!("{} is {} bytes long", f1_name, f1_length);
 }
``` 

上面定义的`File`结构体在内存中的排列如下图所示：
<img alt="" src="/img/struct-01.png" class="center"  />
 
从图中可以清晰的看出`File`结构体两个字段`name`和`data`分别拥有底层两个`[u8]`数组的所有权(`String`类型的底层也是`[u8]`数组)，通过`ptr`指针指向底层数组的内存地址,这里你可以把`ptr`指针理解为Rust中的引用类型。

该图片也侧面印证了：把结构体中具有所有权的字段转移出去后，将无法再访问该字段，但是可以正常访问其它的字段.

## 元组结构体(Tuple Struct)

结构体必须要有名称，但是结构体的字段可以没有名称，这种结构体长得很像元组，因此被称为元组结构体，例如：
```rust
    struct Color(i32, i32, i32);
    struct Point(i32, i32, i32);

    let black = Color(0, 0, 0);
    let origin = Point(0, 0, 0);
```

元组结构体在你希望有一个整体名称，但是又不关心里面字段的名称时将非常有用。例如上面的`Point`元组结构体，众所周知3D点是`(x,y,x)`形式的坐标点，因此我们无需再为内部的字段逐一命名为：`x`,`y`,`z`。

## 元结构体(Unit-like Struct)
还记得之前讲过的基本没啥用的[元类型](../base-type/char-bool.md#元类型)吧? 元结构体就跟它很像，没有任何字段和属性，但是好在，它还挺有用。

如果你定义一个类型，但是不关心该类型的内容, 只关心它的行为时，就可以使用`元结构体`:
```rust
struct AlwaysEqual;

let subject = AlwaysEqual;

// 我们不关心为AlwaysEqual的字段数据，只关心它的行为，因此将它声明为元结构体，然后再为它实现某个特征
impl SomeTrait for AlwaysEqual {
    
}
```


## 结构体数据的所有权

在之前的`User` 结构体的定义中，我们使用了自身拥有所有权的 `String` 类型而不是基于引用的`&str` 字符串切片类型。这是一个有意而为之的选择，因为我们想要这个结构体拥有它所有的数据，而不是从其它地方借用数据。

你也可以让`User`结构体从其它对象借用数据，不过这么做，就需要引入**生命周期**这个新概念(也是一个复杂的概念)，简而言之，生命周期能确保结构体的作用范围要比它所借用的数据的作用范围要小。

总之，如果你想在结构体中使用一个引用，就必须加上生命周期，否则就会报错：

```rust
struct User {
    username: &str,
    email: &str,
    sign_in_count: u64,
    active: bool,
}

fn main() {
    let user1 = User {
        email: "someone@example.com",
        username: "someusername123",
        active: true,
        sign_in_count: 1,
    };
}
```

编译器会抱怨它需要生命周期标识符：

```console
error[E0106]: missing lifetime specifier
 --> src/main.rs:2:15
  |
2 |     username: &str,
  |               ^ expected named lifetime parameter // 需要一个生命周期
  |
help: consider introducing a named lifetime parameter // 考虑像下面的代码这样引入一个生命周期
  |
1 ~ struct User<'a> {
2 ~     username: &'a str,
  |

error[E0106]: missing lifetime specifier
 --> src/main.rs:3:12
  |
3 |     email: &str,
  |            ^ expected named lifetime parameter
  |
help: consider introducing a named lifetime parameter
  |
1 ~ struct User<'a> {
2 |     username: &str,
3 ~     email: &'a str,
  |
```


未来在[生命周期](../../advance/lifetime/basic.md)中会讲到如何修复这个问题以便在结构体中存储引用，不过在那之前，我们会避免在结构体中使用引用类型。
