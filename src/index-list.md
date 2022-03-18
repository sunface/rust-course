# 快速查询入口

<<Rust 语言圣经>> 既然自诩为 Rust 日常开发工具书，那就得有工具书的样子，如果没有了快速索引查询的功能，也就没有了灵魂。

因此我们决定在这里提供一个对全书内容进行快速索引的途径。理论上来说，**你想查的任何东西在这里都可以快速的被找到并能进入相应的章节查看详细的介绍**。

可能大家会有疑问，不是有站内搜索功能嘛？是的，但是尴尬的是：首先它不支持中文，其次就算支持了中文，也一样不好用，我们需要的是快速精准地找到内容而不是模糊的查询内容。

# 索引列表 doing

<a id="head"></a>

|     NN      |   NN    |   NN    |   NN    |   NN    |   NN    |   NN    |   NN    |   NN    |   NN    |   NN    |
| :---------: | :-----: | :-----: | :-----: | :-----: | :-----: | :-----: | :-----: | :-----: | :-----: | :-----: |
| [Sym](#Sym) | [A](#A) | [B](#B) | [C](#C) | [D](#D) | [E](#E) | [F](#F) | [G](#G) | [H](#H) | [I](#I) | [J](#J) |
|   [K](#K)   | [L](#L) | [M](#M) | [N](#N) | [O](#O) | [P](#P) | [Q](#Q) | [R](#R) | [S](#S) | [T](#T) | [U](#U) |
|   [V](#V)   | [W](#W) | [X](#X) | [Y](#Y) | [Z](#Z) |

## Sym

| 名称                    | 关键字       | 简介                       |
| ----------------------- | ------------ | -------------------------- |
| [?]                     | 错误传播     | 用于简化错误传播           |
| [()]                    | 单元类型     | 单元类型，无返回值         |
| `!` : [1] 函数 [2] 类型 | 永不返回     | 永不返回                   |
| [@]                     | 变量绑定     | 为一个字段绑定另外一个变量 |
| ['a: 'b]                | 生命周期约束 |                            |
| A                       |              | AIntroduction              |

[?]: https://course.rs/basic/result-error/result.html#传播界的大明星-
[()]: https://course.rs/basic/base-type/function.html#无返回值
[1]: https://course.rs/basic/base-type/function.html#永不返回的函数
[2]: https://course.rs/advance/into-types/custom-type.html#永不返回类型
[@]: https://course.rs/basic/match-pattern/all-patterns.html#绑定
['a: 'b]: https://course.rs/advance/lifetime/advance.html#生命周期约束-hrtb

[back](#head)

## A

| 名称 | 关键字 | 简介          |
| ---- | ------ | ------------- |
| A    | KWA    | AIntroduction |

[back](#head)

## B

| 名称        | 关键字    | 简介                                   |
| ----------- | --------- | -------------------------------------- |
| [变量遮蔽]  | shadowing | 允许声明相同的变量名，后者会遮蔽掉前者 |
| [bool 布尔] | 布尔类型  | `true` `false`，占用 1 字节            |
| B           | KWB       | BIntroduction                          |

[变量遮蔽]: https://course.rs/basic/variable.html#变量遮蔽shadowing
[bool 布尔]: https://course.rs/basic/base-type/char-bool.html#布尔bool

[back](#head)

## C

| 名称         | 关键字   | 简介                              |
| ------------ | -------- | --------------------------------- |
| [const 常量] | constant | const MAX_POINTS: u32 = 100_000;  |
| [char 字符]  | 字符类型 | 使用 `''` 表示，所有的 Unicode 值 |
| C            | KWC      | CIntroduction                     |

[const 常量]: https://course.rs/basic/variable.html#变量和常量之间的差异
[char 字符]: https://course.rs/basic/base-type/char-bool.html#字符类型char

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

| 名称 | 关键字 | 简介          |
| ---- | ------ | ------------- |
| H    | KWH    | HIntroduction |

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

| 名称 | 关键字 | 简介          |
| ---- | ------ | ------------- |
| M    | KWM    | MIntroduction |

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

| 名称 | 关键字 | 简介          |
| ---- | ------ | ------------- |
| S    | KWS    | SIntroduction |

[back](#head)

## T

| 名称 | 关键字 | 简介          |
| ---- | ------ | ------------- |
| T    | KWT    | TIntroduction |

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

| 名称 | 关键字 | 简介          |
| ---- | ------ | ------------- |
| Y    | KWY    | YIntroduction |

[back](#head)

## Z

| 名称         | 关键字   | 简介                                                                                                   |
| ------------ | -------- | ------------------------------------------------------------------------------------------------------ |
| [整数]       | 数值类型 | 有符号整数，`i8`,`i16`,`i32`,`i64`,`i128`,`isize`<br>无符号整数，`u8`,`u16`,`u32`,`u64`,`u128`,`usize` |
| [整形字面量] | 进制书写 | 十进制 `98_222`<br>十六进制 `0xff`<br>八进制 `0o77`<br>二进制 `0b1111_0000`<br>字节(仅限于`u8`) `b'A'` |
| Z            | KWZ      | ZIntroduction                                                                                          |

[整数]: https://course.rs/basic/base-type/numbers.html#整数类型
[整形字面量]: https://course.rs/basic/base-type/numbers.html#整数类型

[back](#head)
