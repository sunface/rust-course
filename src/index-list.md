# 快速查询入口

<<Rust 语言圣经>> 既然自诩为 Rust 日常开发工具书，那就得有工具书的样子，如果没有了快速索引查询的功能，也就没有了灵魂。

因此我们决定在这里提供一个对全书内容进行快速索引的途径。理论上来说，**你想查的任何东西在这里都可以快速的被找到并能进入相应的章节查看详细的介绍**。

可能大家会有疑问，不是有站内搜索功能嘛？是的，但是尴尬的是：首先它不支持中文，其次就算支持了中文，也一样不好用，我们需要的是快速精准地找到内容而不是模糊的查询内容。

# 索引列表 doing

<a id="head"></a>

|       NN        |    NN    |   NN    |   NN    |   NN    |   NN    |   NN    |   NN    |   NN    |   NN    |   NN    |
| :-------------: | :------: | :-----: | :-----: | :-----: | :-----: | :-----: | :-----: | :-----: | :-----: | :-----: |
|    [#](#sym)    | [A](#a)  | [B](#b) | [C](#c) | [D](#d) | [E](#e) | [F](#f) | [G](#g) | [H](#h) | [I](#i) | [J](#j) |
|     [K](#k)     | [L](#l)  | [M](#m) | [N](#n) | [O](#o) | [P](#p) | [Q](#q) | [R](#r) | [S](#s) | [T](#t) | [U](#u) |
|     [V](#v)     | [W](#w)  | [X](#x) | [Y](#y) | [Z](#z) |
| [Cargo](#cargo) | [Naming] |

[naming]: https://course.rs/practice/naming.html

[bottom](#bottom)

## Sym

| 名称                              | 关键字         | 简介                                                                                 |
| --------------------------------- | -------------- | ------------------------------------------------------------------------------------ |
| [?]                               | 错误传播       | 用于简化错误传播                                                                     |
| [()]                              | 单元类型       | 单元类型，无返回值                                                                   |
| `!` : 1. [函数] 2. [类型]         | 永不返回       | 永不返回                                                                             |
| [&]                               | 引用           | 常规引用是一个指针类型，指向了对象存储的内存地址                                     |
| [\*]                              | 解引用         | 解出引用所指向的值                                                                   |
| [@]                               | 变量绑定       | 为一个字段绑定另外一个变量                                                           |
| `_` : 1. [忽略变量] 2. [模式匹配] | 忽略           | 1. 忽略该值或者类型，否则编译器会给你一个 `变量未使用的` 的警告<br>2. 模式匹配通配符 |
| ['a: 'b]                          | 生命周期约束   | 用来说明两个生命周期的长短                                                           |
| [{:?}] {:#?}                      | 打印结构体信息 | 使用 `#[derive(Debug)]` 派生实现 `Debug` 特征                                        |
| [::]                              | 关联函数       | 定义在 `impl` 中且没有 `self` 的函数                                                 |
|                                   |                |

[?]: https://course.rs/basic/result-error/result.html#传播界的大明星-
[()]: https://course.rs/basic/base-type/function.html#无返回值
[函数]: https://course.rs/basic/base-type/function.html#永不返回的发散函数-
[类型]: https://course.rs/advance/into-types/custom-type.html#永不返回类型
[&]: https://course.rs/basic/ownership/borrowing.html#引用与解引用
[\*]: https://course.rs/basic/ownership/borrowing.html#引用与解引用
[@]: https://course.rs/basic/match-pattern/all-patterns.html#绑定
['a: 'b]: https://course.rs/advance/lifetime/advance.html#生命周期约束-hrtb
[{:?}]: https://course.rs/basic/compound-type/struct.html#使用-derivedebug-来打印结构体的信息
[忽略变量]: https://course.rs/basic/variable.html#使用下划线开头忽略未使用的变量
[模式匹配]: https://course.rs/basic/match-pattern/match-if-let.html#_-通配符
[::]: https://course.rs/basic/method.html#关联函数

[back](#head)

## A

| 名称          | 关键字   | 简介                                                                                                                   |
| ------------- | -------- | ---------------------------------------------------------------------------------------------------------------------- |
| [array 数组]  | 数组     | 长度固定<br>元素必须有相同的类型<br>依次线性排列<br>可以通过索引访问其中的元素<br>`let a: [i32; 5] = [1, 2, 3, 4, 5];` |
| [array slice] | 数组切片 | `let slice: &[i32] = &a[1..3];`                                                                                        |
|               | KWA      |                                                                                                                        |

[array 数组]: https://course.rs/basic/compound-type/array.html
[array slice]: https://course.rs/basic/compound-type/array.html#数组切片

[back](#head)

## B

| 名称         | 关键字    | 简介                                                                           |
| ------------ | --------- | ------------------------------------------------------------------------------ |
| [变量遮蔽]   | shadowing | 允许声明相同的变量名，后者会遮蔽掉前者                                         |
| [变量覆盖]   | 模式匹配  | 无论是是 `match` 还是 `if let`，他们都可以在模式匹配时覆盖掉老的值，绑定新的值 |
| [变量作用域] | 所有权    | 作用域是一个变量在程序中有效的范围                                             |
| [表达式]     |           | 进行求值，结尾无 `;`，有返回值                                                 |
| [bool 布尔]  | 布尔类型  | `true` `false`，占用 1 字节                                                    |
| [break]      | 循环控制  | 直接跳出当前整个循环                                                           |
|              | KWB       |                                                                                |

[变量遮蔽]: https://course.rs/basic/variable.html#变量遮蔽shadowing
[变量覆盖]: https://course.rs/basic/match-pattern/match-if-let.html#变量覆盖
[变量作用域]: https://course.rs/basic/ownership/ownership.html#变量作用域
[bool 布尔]: https://course.rs/basic/base-type/char-bool.html#布尔bool
[表达式]: https://course.rs/basic/base-type/statement-expression.html#表达式
[break]: https://course.rs/basic/flow-control.html#break

[back](#head)

## C

| 名称               | 关键字   | 简介                                                                                |
| ------------------ | -------- | ----------------------------------------------------------------------------------- |
| [char 字符]        | 字符类型 | 使用 `''` 表示，所有的 Unicode 值                                                   |
| [const 常量]       | constant | `const MAX_POINTS: u32 = 100_000;`                                                  |
| [const 泛型]       | 泛型     | `const N: usize` 针对值的泛型，适合处理数组长度的问题                               |
| [const 泛型表达式] | 泛型     |                                                                                     |
| [Copy 拷贝]        | 浅拷贝   | 任何基本类型的组合可以 `Copy`，不需要分配内存或某种形式资源的类型是可以 `Copy` 的。 |
| [continue]         | 循环控制 | 跳过当前当次的循环，开始下次的循环                                                  |
| [Clone 克隆]       | 深拷贝   | 需要复制堆上的数据时，可以使用 `.clone()` 方法                                      |
|                    | KWC      |                                                                                     |

[char 字符]: https://course.rs/basic/base-type/char-bool.html#字符类型char
[const 常量]: https://course.rs/basic/variable.html#变量和常量之间的差异
[copy 拷贝]: https://course.rs/basic/ownership/ownership.html#拷贝浅拷贝
[clone 克隆]: https://course.rs/basic/ownership/ownership.html#克隆深拷贝
[continue]: https://course.rs/basic/flow-control.html#continue
[const 泛型]: https://course.rs/basic/trait/generic.html#const-泛型rust-151-版本引入的重要特性
[const 泛型表达式]: https://course.rs/basic/trait/generic.html#const-泛型表达式

[back](#head)

## D

| 名称     | 关键字   | 简介                                                                                |
| -------- | -------- | ----------------------------------------------------------------------------------- |
| [derive] | 派生特征 | `#[derive(Trait)]`，被标记的对象自动实现对应的默认特征代码<br>详见：[附录-派生特征] |
|          | KWD      |                                                                                     |

[derive]: https://course.rs/basic/trait/trait.html#通过-derive-派生特征
[附录-派生特征]: https://course.rs/appendix/derive.html

[back](#head)

## E

| 名称              | 关键字   | 简介                                     |
| ----------------- | -------- | ---------------------------------------- |
| [enum 枚举]       | 枚举类型 | 允许通过列举可能的成员来定义一个枚举类型 |
| [enum 同一化类型] | 枚举方法 | 枚举实现方法                             |
|                   | KWE      |                                          |

[enum 枚举]: https://course.rs/basic/compound-type/enum.html#枚举
[enum 同一化类型]: https://course.rs/basic/compound-type/enum.html#同一化类型

[back](#head)

## F

| 名称             | 关键字   | 简介                                                                                                                                                                                                                                                         |
| ---------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [浮点数]         | 数值类型 | `f32`<br>`f64`(默认类型)                                                                                                                                                                                                                                     |
| [for 循环]       | 循环控制 | `for item in &collection {}`                                                                                                                                                                                                                                 |
| ['fn' 函数]      |          | 函数名和变量名使用 `蛇形命名法(snake case)`<br>函数的位置可以随便放<br>每个函数参数都需要标注类型                                                                                                                                                            |
| [调用同名的方法] |          | 1. 默认调用类型上的方法<br>`Struct.function(receiver_if_method, next_arg, ...);`<br>2. 显式调用特征上的方法<br>`Trait::function(receiver_if_method, next_arg, ...);`<br>3. [完全限定语法]<br>`<Type as Trait>::function(receiver_if_method, next_arg, ...);` |
|                  | KWF      |                                                                                                                                                                                                                                                              |

[浮点数]: https://course.rs/basic/base-type/numbers.html#浮点类型
[for 循环]: https://course.rs/basic/flow-control.html#for-循环
['fn' 函数]: https://course.rs/basic/base-type/function.html
[调用同名的方法]: https://course.rs/basic/trait/advance-trait.html#调用同名的方法
[完全限定语法]: https://course.rs/basic/trait/advance-trait.html#完全限定语法

[back](#head)

## G

| 名称            | 关键字 | 简介                               |
| --------------- | ------ | ---------------------------------- |
| [Generics 泛型] | 泛型   | 用同一功能的函数处理不同类型的数据 |
|                 | KWG    |                                    |

[generics 泛型]: https://course.rs/basic/trait/generic.html

[back](#head)

## H

| 名称 | 关键字 | 简介 |
| ---- | ------ | ---- |
|      | KWH    |      |

[back](#head)

## I

| 名称                                         | 关键字   | 简介                                                                  |
| -------------------------------------------- | -------- | --------------------------------------------------------------------- |
| [if else]                                    | 流程控制 | 根据条件执行不同的代码分支                                            |
| [else if]                                    | 流程控制 | 处理多重条件                                                          |
| [if let 匹配]                                | 模式匹配 | 当你只要匹配一个条件，且忽略其他条件时就用 `if let`，否则都用 `match` |
| `impl Trait` 1. [函数参数] 2. [函数返回类型] |          |                                                                       |
|                                              | KWI      |                                                                       |

[if else]: https://course.rs/basic/flow-control.html#使用-if-来做分支控制
[else if]: https://course.rs/basic/flow-control.html#使用-else-if-来处理多重条件
[if let 匹配]: https://course.rs/basic/match-pattern/match-if-let.html#if-let-匹配
[函数参数]: https://course.rs/basic/trait/trait.html#使用特征作为函数参数
[函数返回类型]: https://course.rs/basic/trait/trait.html#函数返回中的-impl-trait

[back](#head)

## J

| 名称 | 关键字 | 简介 |
| ---- | ------ | ---- |
|      | KWJ    |      |

[back](#head)

## K

| 名称 | 关键字 | 简介 |
| ---- | ------ | ---- |
|      | KWK    |      |

[back](#head)

## L

| 名称        | 关键字   | 简介                           |
| ----------- | -------- | ------------------------------ |
| [let]       | 变量绑定 | `let x : u32 = 5;`             |
| [let mut]   | 可变变量 | `let mut x : u32 = 5; x = 9;`  |
| [loop 循环] | 循环控制 | 无限循环，注意要配合 [`break`] |
|             | KWL      |                                |

[let]: https://course.rs/basic/variable.html#变量绑定
[let mut]: https://course.rs/basic/variable.html#变量可变性
[`break`]: https://course.rs/basic/flow-control.html#break
[loop 循环]: https://course.rs/basic/flow-control.html#loop-循环

[back](#head)

## M

| 名称            | 关键字     | 简介                                                                                                                                                                     |
| --------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [模式绑定]      | 模式匹配   | 从模式中取出绑定的值                                                                                                                                                     |
| [全模式列表]    | 模式匹配   | 列出了所有的模式匹配                                                                                                                                                     |
| [Method 方法]   | `impl`     | Rust 的方法往往跟结构体、枚举、特征一起使用                                                                                                                              |
| [Method getter] | `getter`   | 方法名跟结构体的字段名相同                                                                                                                                               |
| [match 匹配]    | 模式匹配   | 1. `match` 的匹配必须要穷举出所有可能，因此这里用 `_ ` 来代表未列出的所有可能性<br>2. `match` 的每一个分支都必须是一个表达式，且所有分支的表达式最终返回值的类型必须相同 |
| [matches! 宏]   | 模式匹配   | 将一个表达式跟模式进行匹配，然后返回匹配的结果 `true` 或 `false`                                                                                                         |
| [match guard]   | 匹配守卫   | 位于 `match` 分支模式之后的额外 `if` 条件，它能为分支模式提供更进一步的匹配条件                                                                                          |
| [move 移动]     | 转移所有权 | `let s2 = s1;`<br>`s1` 所有权转移给了 `s2`，`s1` 失效                                                                                                                    |
|                 | KWM        |                                                                                                                                                                          |

[模式绑定]: https://course.rs/basic/match-pattern/match-if-let.html#模式绑定
[match 匹配]: https://course.rs/basic/match-pattern/match-if-let.html#match-匹配
[matches! 宏]: https://course.rs/basic/match-pattern/match-if-let.html#matches宏
[move 移动]: https://course.rs/basic/ownership/ownership.html#转移所有权
[全模式列表]: https://course.rs/basic/match-pattern/all-patterns.html
[match guard]: https://course.rs/basic/match-pattern/all-patterns.html#匹配守卫提供的额外条件
[method 方法]: https://course.rs/basic/method.html#定义方法
[method getter]: https://course.rs/basic/method.html#方法名跟结构体字段名相同

[back](#head)

## N

| 名称      | 关键字 | 简介                                                                                       |
| --------- | ------ | ------------------------------------------------------------------------------------------ |
| [newtype] |        | 为一个[元组结构体]创建新类型。该元组结构体封装有一个字段，该字段就是希望实现特征的具体类型 |
|           | KWN    |                                                                                            |

[newtype]: https://course.rs/basic/trait/advance-trait.html#在外部类型上实现外部特征newtype
[元组结构体]: https://course.rs/basic/compound-type/struct.html#元组结构体tuple-struct

[back](#head)

## O

| 名称          | 关键字      | 简介                                                            |
| ------------- | ----------- | --------------------------------------------------------------- |
| [Option]      | Option 枚举 | 用于处理空值，**一个变量要么有值：`Some(T)`, 要么为空：`None`** |
| [Option 解构] | 模式匹配    | 可以通过 `match` 来实现                                         |
|               | KWO         |                                                                 |

[option]: https://course.rs/basic/compound-type/enum.html#option-枚举用于处理空值
[option 解构]: https://course.rs/basic/match-pattern/option.html#匹配-optiont

[back](#head)

## P

| 名称 | 关键字 | 简介 |
| ---- | ------ | ---- |
|      | KWP    |      |

[back](#head)

## Q

| 名称 | 关键字 | 简介 |
| ---- | ------ | ---- |
|      | KWQ    |      |

[back](#head)

## R

| 名称         | 关键字 | 简介                                                                               |
| ------------ | ------ | ---------------------------------------------------------------------------------- |
| [Range 序列] |        | 生成连续的数值<br> 只允许用于数字或字符类型<br> `..` 右半开区间 <br>`..=` 闭合区间 |
|              | KWR    |                                                                                    |

[range 序列]: https://course.rs/basic/base-type/numbers.html#序列range

[back](#head)

## S

| 名称                   | 关键字        | 简介                                                                                                                     |
| ---------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------ |
| [所有权与堆栈]         |               | Rust 所有权提供的强大保障                                                                                                |
| [所有权原则]           |               | Rust 中每一个值都 `有且只有` 一个所有者(变量)<br> 当所有者(变量)离开作用域范围时，这个值将被丢弃(drop)                   |
| [slice 切片]           | `&str`        | 允许你引用 `String` 中部分连续的元素序列，而不是引用整个 `String` <br>语法：`[开始索引..终止索引]`<br>字符串字面量是切片 |
| [String 字符串]        | `String` 类型 | Rust 中的字符串是 UTF-8 编码，也就是字符串中的字符所占的字节数是变化的(1 - 4)                                            |
| [String 操作]          | `String` 方法 | 由于 `String` 是可变字符串，因此我们可以对它进行创建、增删操作                                                           |
| [String 转义]          | `String` 方法 | 通过转义的方式 `\` 输出 ASCII 和 Unicode 字符                                                                            |
| [struct 结构体]        | 结构体        | 通过关键字 `struct` 定义<br>一个清晰明确的结构体 `名称`<br>几个有名字的结构体 `字段`<br>通过 `.` 访问字段                |
| [self &self &mut self] | Method 方法   | `self` 指代类型的实例                                                                                                    |
| [Self 与 self]         |               | `self` 指代当前的实例对象，`Self` 指代特征或者方法类型的别名                                                             |
|                        | KWS           |                                                                                                                          |

[所有权与堆栈]: https://course.rs/basic/ownership/ownership.html#所有权与堆栈
[所有权原则]: https://course.rs/basic/ownership/ownership.html#所有权原则
[slice 切片]: https://course.rs/basic/compound-type/string-slice.html#切片slice
[string 字符串]: https://course.rs/basic/compound-type/string-slice.html#什么是字符串
[string 操作]: https://course.rs/basic/compound-type/string-slice.html#操作字符串
[string 转义]: https://course.rs/basic/compound-type/string-slice.html#字符串转义
[struct 结构体]: https://course.rs/basic/compound-type/struct.html
[self &self &mut self]: https://course.rs/basic/method.html#selfself-和-mut-self
[self 与 self]: https://course.rs/basic/trait/trait-object#self-与-self

[back](#head)

## T

| 名称                                       | 关键字     | 简介                                                                                                                                                                                        |
| ------------------------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Tuple 元组]                               |            | 由多种类型组合一起，元组的长度是固定的，元组中元素的顺序也是固定的<br>用模式匹配解构元组：`let (x, y, z) = (20, 19.2, 1)`<br>用 `.` 来访问元组：`tuple.0` 索引从 0 开始                     |
| [Tuple Struct]                             | 元组结构体 | 结构体必须要有名称，但字段可以没有名称<br>`struct Color(i32, i32, i32);`                                                                                                                    |
| [Trait 特征]                               | 特征       | 一个可以被共享的行为，只要实现了特征，你就能使用该行为                                                                                                                                      |
| [T: Trait]                                 | 特征约束   | 还可以有多重约束，`T: Trait1 + Trait2`<br>另见：[where 约束]                                                                                                                                |
| [Trait Object]                             | 特征对象   | 特征对象指向实现了 `Trait` 特征的类型的实例，可以在运行时通过特征对象找到具体调用的类型方法                                                                                                 |
| `type` 1. [关联类型] 2. [默认泛型类型参数] |            | 1. `type Item;`<br>`Self` 用来指代当前调用者的具体类型，那么 `Self::em` 就用来指代该类型实现中定义的 `Item` 类型<br>2. `type Output = Struct;`<br>指定一个默认值，返回一个关联类型 `Output` |
| [特征定义中的特征约束]                     | 特征       | 用来说明一个特征需要实现另一个特征                                                                                                                                                          |
|                                            | KWT        |                                                                                                                                                                                             |

[tuple 元组]: https://course.rs/basic/compound-type/tuple.html#元组
[tuple struct]: https://course.rs/basic/compound-type/struct.html#元组结构体tuple-struct
[trait 特征]: https://course.rs/basic/trait/trait.html#定义特征
[t: trait]: https://course.rs/basic/trait/trait.html#特征约束trait-bound
[trait object]: https://course.rs/basic/trait/trait-object.html#特征对象定义
[关联类型]: https://course.rs/basic/trait/advance-trait.html#关联类型
[默认泛型类型参数]: https://course.rs/basic/trait/advance-trait.html#默认泛型类型参数
[特征定义中的特征约束]: https://course.rs/basic/trait/advance-trait.html#特征定义中的特征约束

[back](#head)

## U

| 名称               | 关键字     | 简介                                        |
| ------------------ | ---------- | ------------------------------------------- |
| [Unit-like Struct] | 单元结构体 | 没有任何字段和属性<br>`struct AlwaysEqual;` |
|                    | KWU        |                                             |

[unit-like struct]: https://course.rs/basic/compound-type/struct.html#单元结构体unit-like-struct

[back](#head)

## V

| 名称              | 关键字   | 简介                                                                                           |
| ----------------- | -------- | ---------------------------------------------------------------------------------------------- |
| [Vector 动态数组] | 动态数组 | `Vec<T>`，动态数组允许你存储多个值，这些值在内存中一个紧挨着另一个排列。只能存储相同类型的元素 |
| `Vec::new`        |          | 创建动态数组                                                                                   |
| `vec![]`          |          | 创建动态数组，能在创建时给予初始化值                                                           |
| `Vec::push`       |          | 向数组尾部添加元素，必须声明为 `mut`                                                           |
|                   | KWV      |                                                                                                |

[vector 动态数组]: https://course.rs/basic/collections/vector.html

[back](#head)

## W

| 名称         | 关键字   | 简介                                                              |
| ------------ | -------- | ----------------------------------------------------------------- |
| [while 循环] | 循环控制 | 当条件为 `true` 时，继续循环，条件为 `false`，跳出循环            |
| [where 约束] | 特征约束 | 当特征约束变多时，函数签名会很复杂，可以用 `where` 做形式上的改进 |
|              | KWW      |                                                                   |

[while 循环]: https://course.rs/basic/flow-control.html#while-循环
[where 约束]: https://course.rs/basic/trait/trait.html#where-约束

[back](#head)

## X

| 名称 | 关键字 | 简介 |
| ---- | ------ | ---- |
|      | KWX    |      |

[back](#head)

## Y

| 名称   | 关键字 | 简介                                                 |
| ------ | ------ | ---------------------------------------------------- |
| [语句] |        | 完成一个操作，结尾有 `;` ，无返回值，如 `let x = 9;` |
|        | KWY    |                                                      |

[语句]: https://course.rs/basic/base-type/statement-expression.html#语句

[back](#head)

## Z

| 名称         | 关键字   | 简介                                                                                                             |
| ------------ | -------- | ---------------------------------------------------------------------------------------------------------------- |
| [整数]       | 数值类型 | 有符号整数，`i8`，`i16`，`i32`，`i64`，`i128`，`isize`<br>无符号整数，`u8`，`u16`，`u32`，`u64`，`u128`，`usize` |
| [整形字面量] | 进制书写 | 十进制 `98_222`<br>十六进制 `0xff`<br>八进制 `0o77`<br>二进制 `0b1111_0000`<br>字节(仅限于`u8`) `b'A'`           |
|              | KWZ      |                                                                                                                  |

[整数]: https://course.rs/basic/base-type/numbers.html#整数类型
[整形字面量]: https://course.rs/basic/base-type/numbers.html#整数类型

[back](#head)

## Cargo

| 名称  | 关键字 | 简介 |
| ----- | ------ | ---- |
| Cargo | KWCG   |      |

[back](#head)

<a id="bottom"></a>
