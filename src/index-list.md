# 快速查询入口

<<Rust 语言圣经>> 既然自诩为 Rust 日常开发工具书，那就得有工具书的样子，如果没有了快速索引查询的功能，也就没有了灵魂。

因此我们决定在这里提供一个对全书内容进行快速索引的途径。理论上来说，**你想查的任何东西在这里都可以快速的被找到并能进入相应的章节查看详细的介绍**。

可能大家会有疑问，不是有站内搜索功能嘛？是的，但是尴尬的是：首先它不支持中文，其次就算支持了中文，也一样不好用，我们需要的是快速精准地找到内容而不是模糊的查询内容。

# 索引列表 doing

<a id="head"></a>

|     NN      |   NN    |   NN    |   NN    |   NN    |   NN    |   NN    |   NN    |   NN    |
| :---------: | :-----: | :-----: | :-----: | :-----: | :-----: | :-----: | :-----: | :-----: |
| [Sym](#sym) | [A](#a) | [B](#b) | [C](#c) | [D](#d) | [E](#e) | [F](#f) | [G](#g) | [H](#h) |
|   [I](#i)   | [J](#j) | [K](#k) | [L](#l) | [M](#m) | [N](#n) | [O](#o) | [P](#p) | [Q](#q) |
|   [R](#r)   | [S](#s) | [T](#t) | [U](#u) | [V](#v) | [W](#w) | [X](#x) | [Y](#y) | [Z](#z) |

## Sym

| 名称                    | 关键字       | 简介                                             |
| ----------------------- | ------------ | ------------------------------------------------ |
| [?]                     | 错误传播     | 用于简化错误传播                                 |
| [()]                    | 单元类型     | 单元类型，无返回值                               |
| `!` : [1 函数] [2 类型] | 永不返回     | 永不返回                                         |
| [&]                     | 引用         | 常规引用是一个指针类型，指向了对象存储的内存地址 |
| [\*]                    | 解引用       | 解出引用所指向的值                               |
| [@]                     | 变量绑定     | 为一个字段绑定另外一个变量                       |
| ['a: 'b]                | 生命周期约束 |                                                  |
| A                       |              | AIntroduction                                    |

[?]: https://course.rs/basic/result-error/result.html#传播界的大明星-
[()]: https://course.rs/basic/base-type/function.html#无返回值
[1 函数]: https://course.rs/basic/base-type/function.html#永不返回的函数
[2 类型]: https://course.rs/advance/into-types/custom-type.html#永不返回类型
[&]: https://course.rs/basic/ownership/borrowing.html#引用与解引用
[\*]: https://course.rs/basic/ownership/borrowing.html#引用与解引用
[@]: https://course.rs/basic/match-pattern/all-patterns.html#绑定
['a: 'b]: https://course.rs/advance/lifetime/advance.html#生命周期约束-hrtb

[back](#head)

## A

| 名称 | 关键字 | 简介          |
| ---- | ------ | ------------- |
| []   |        |               |
| A    | KWA    | AIntroduction |

[back](#head)

## B

| 名称         | 关键字    | 简介                                   |
| ------------ | --------- | -------------------------------------- |
| [变量遮蔽]   | shadowing | 允许声明相同的变量名，后者会遮蔽掉前者 |
| [变量作用域] | 所有权    | 作用域是一个变量在程序中有效的范围     |
| [表达式]     |           | 进行求值，结尾无 `;`，有返回值         |
| [bool 布尔]  | 布尔类型  | `true` `false`，占用 1 字节            |
| B            | KWB       | BIntroduction                          |

[变量遮蔽]: https://course.rs/basic/variable.html#变量遮蔽shadowing
[变量作用域]: https://course.rs/basic/ownership/ownership.html#变量作用域
[bool 布尔]: https://course.rs/basic/base-type/char-bool.html#布尔bool
[表达式]: https://course.rs/basic/base-type/statement-expression.html#表达式

[back](#head)

## C

| 名称         | 关键字   | 简介                                                                                |
| ------------ | -------- | ----------------------------------------------------------------------------------- |
| [char 字符]  | 字符类型 | 使用 `''` 表示，所有的 Unicode 值                                                   |
| [const 常量] | constant | const MAX_POINTS: u32 = 100_000;                                                    |
| [Copy 拷贝]  | 浅拷贝   | 任何基本类型的组合可以 `Copy`，不需要分配内存或某种形式资源的类型是可以 `Copy` 的。 |
| [Clone 克隆] | 深拷贝   | 需要复制堆上的数据时，可以使用 `.clone()` 方法                                      |
| C            | KWC      | CIntroduction                                                                       |

[char 字符]: https://course.rs/basic/base-type/char-bool.html#字符类型char
[const 常量]: https://course.rs/basic/variable.html#变量和常量之间的差异
[copy 拷贝]: https://course.rs/basic/ownership/ownership.html#拷贝浅拷贝
[clone 克隆]: https://course.rs/basic/ownership/ownership.html#克隆深拷贝

[back](#head)

## D

| 名称 | 关键字 | 简介          |
| ---- | ------ | ------------- |
| D    | KWD    | DIntroduction |

[back](#head)

## E

| 名称 | 关键字 | 简介          |
| ---- | ------ | ------------- |
| E    | KWE    | EIntroduction |

[back](#head)

## F

| 名称     | 关键字   | 简介                       |
| -------- | -------- | -------------------------- |
| [浮点数] | 数值类型 | `f32` <br> `f64`(默认类型) |
| F        | KWF      | FIntroduction              |

[浮点数]: https://course.rs/basic/base-type/numbers.html#浮点类型

[back](#head)

## G

| 名称 | 关键字 | 简介          |
| ---- | ------ | ------------- |
| G    | KWG    | GIntroduction |

[back](#head)

## H

| 名称   | 关键字 | 简介                                                                                              |
| ------ | ------ | ------------------------------------------------------------------------------------------------- |
| [函数] | `fn`   | 函数名和变量名使用 `蛇形命名法(snake case)`<br>函数的位置可以随便放<br>每个函数参数都需要标注类型 |
| H      | KWH    | HIntroduction                                                                                     |

[函数]: https://course.rs/basic/base-type/function.html

[back](#head)

## I

| 名称 | 关键字 | 简介          |
| ---- | ------ | ------------- |
| I    | KWI    | IIntroduction |

[back](#head)

## J

| 名称 | 关键字 | 简介          |
| ---- | ------ | ------------- |
| J    | KWJ    | JIntroduction |

[back](#head)

## K

| 名称 | 关键字 | 简介          |
| ---- | ------ | ------------- |
| K    | KWK    | KIntroduction |

[back](#head)

## L

| 名称      | 关键字   | 简介                        |
| --------- | -------- | --------------------------- |
| [let]     | 变量绑定 | let x : u32 = 5;            |
| [let mut] | 可变变量 | let mut x : u32 = 5; x = 9; |
| L         | KWL      | LIntroduction               |

[let]: https://course.rs/basic/variable.html#变量绑定
[let mut]: https://course.rs/basic/variable.html#变量可变性

[back](#head)

## M

| 名称        | 关键字     | 简介                                                  |
| ----------- | ---------- | ----------------------------------------------------- |
| [move 移动] | 转移所有权 | `let s2 = s1;`<br>`s1` 所有权转移给了 `s2`，`s1` 失效 |
| M           | KWM        | MIntroduction                                         |

[move 移动]: https://course.rs/basic/ownership/ownership.html#转移所有权

[back](#head)

## N

| 名称 | 关键字 | 简介          |
| ---- | ------ | ------------- |
| N    | KWN    | NIntroduction |

[back](#head)

## O

| 名称 | 关键字 | 简介          |
| ---- | ------ | ------------- |
| O    | KWO    | OIntroduction |

[back](#head)

## P

| 名称 | 关键字 | 简介          |
| ---- | ------ | ------------- |
| P    | KWP    | PIntroduction |

[back](#head)

## Q

| 名称 | 关键字 | 简介          |
| ---- | ------ | ------------- |
| Q    | KWQ    | QIntroduction |

[back](#head)

## R

| 名称         | 关键字 | 简介                                                                               |
| ------------ | ------ | ---------------------------------------------------------------------------------- |
| [Range 序列] |        | 生成连续的数值<br> 只允许用于数字或字符类型<br> `..` 右半开区间 <br>`..=` 闭合区间 |
| R            | KWR    | RIntroduction                                                                      |

[range 序列]: https://course.rs/basic/base-type/numbers.html#序列range

[back](#head)

## S

| 名称            | 关键字        | 简介                                                                                                                     |
| --------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------ |
| [所有权与堆栈]  |               | Rust 所有权提供的强大保障                                                                                                |
| [所有权原则]    |               | Rust 中每一个值都 `有且只有` 一个所有者(变量)<br> 当所有者(变量)离开作用域范围时，这个值将被丢弃(drop)                   |
| [slice 切片]    | `&str`        | 允许你引用 `String` 中部分连续的元素序列，而不是引用整个 `String` <br>语法：`[开始索引..终止索引]`<br>字符串字面量是切片 |
| [String 字符串] | `String` 类型 | Rust 中的字符串是 UTF-8 编码，也就是字符串中的字符所占的字节数是变化的(1 - 4)                                            |
| [String 操作]   | `String` 方法 | 由于 `String` 是可变字符串，因此我们可以对它进行创建、增删操作                                                           |
| S               | KWS           | SIntroduction                                                                                                            |

[所有权与堆栈]: https://course.rs/basic/ownership/ownership.html#所有权与堆栈
[所有权原则]: https://course.rs/basic/ownership/ownership.html#所有权原则
[slice 切片]: https://course.rs/basic/compound-type/string-slice.html#切片slice
[string 字符串]: https://course.rs/basic/compound-type/string-slice.html#什么是字符串
[string 操作]: https://course.rs/basic/compound-type/string-slice.html#操作字符串

[back](#head)

## T

| 名称         | 关键字 | 简介                                                                                                                                                                      |
| ------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Tuple 元组] |        | 由多种类型组合一起，元组的长度是固定的，元组中元素的顺序也是固定的<br>用模式匹配解构元组： `let (x, y, z) = (20, 19.2, 1)`<br>用 `.` 来访问元组： `tuple.0` 索引从 0 开始 |
| T            | KWT    | TIntroduction                                                                                                                                                             |

[tuple 元组]: https://course.rs/basic/compound-type/tuple.html#元组

[back](#head)

## U

| 名称 | 关键字 | 简介          |
| ---- | ------ | ------------- |
| U    | KWU    | UIntroduction |

[back](#head)

## V

| 名称 | 关键字 | 简介          |
| ---- | ------ | ------------- |
| V    | KWV    | VIntroduction |

[back](#head)

## W

| 名称 | 关键字 | 简介          |
| ---- | ------ | ------------- |
| W    | KWW    | WIntroduction |

[back](#head)

## X

| 名称 | 关键字 | 简介          |
| ---- | ------ | ------------- |
| X    | KWX    | XIntroduction |

[back](#head)

## Y

| 名称   | 关键字 | 简介                                                 |
| ------ | ------ | ---------------------------------------------------- |
| [语句] |        | 完成一个操作，结尾有 `;` ，无返回值，如 `let x = 9;` |
| Y      | KWY    | YIntroduction                                        |

[语句]: https://course.rs/basic/base-type/statement-expression.html#语句

[back](#head)

## Z

| 名称         | 关键字   | 简介                                                                                                             |
| ------------ | -------- | ---------------------------------------------------------------------------------------------------------------- |
| [整数]       | 数值类型 | 有符号整数，`i8`，`i16`，`i32`，`i64`，`i128`，`isize`<br>无符号整数，`u8`，`u16`，`u32`，`u64`，`u128`，`usize` |
| [整形字面量] | 进制书写 | 十进制 `98_222`<br>十六进制 `0xff`<br>八进制 `0o77`<br>二进制 `0b1111_0000`<br>字节(仅限于`u8`) `b'A'`           |
| Z            | KWZ      | ZIntroduction                                                                                                    |

[整数]: https://course.rs/basic/base-type/numbers.html#整数类型
[整形字面量]: https://course.rs/basic/base-type/numbers.html#整数类型

[back](#head)
