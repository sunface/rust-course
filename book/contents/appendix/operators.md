## 附录 B：运算符与符号


该附录包含了 Rust 目前出现过的各种符号，这些符号之前都分散在各个章节中。

### 运算符

表 B-1 包含了 Rust 中的运算符、上下文中的示例、简短解释以及该运算符是否可重载。如果一个运算符是可重载的，则该运算符上用于重载的特征也会列出。

下表中，`expr`是表达式，`ident`是标识符,`type`是类型,`var`是变量，`trait`是特征,`pat`是匹配分支(pattern)。

<span class="caption">表 B-1: 运算符</span>

| 运算符 | 示例 | 解释 | 是否可重载 |
|----------|---------|-------------|---------------|
| `!` | `ident!(...)`, `ident!{...}`, `ident![...]` | 宏展开 |  |
| `!` | `!expr` | 按位非或逻辑非 | `Not` |
| `!=` | `var != expr` | 不等比较 | `PartialEq` |
| `%` | `expr % expr` | 算术求余 | `Rem` |
| `%=` | `var %= expr` | 算术求余与赋值 | `RemAssign` |
| `&` | `&expr`, `&mut expr` | 借用 | |
| `&` | `&type`, `&mut type`, `&'a type`, `&'a mut type` | 借用指针类型 |  |
| `&` | `expr & expr` | 按位与 | `BitAnd` |
| `&=` | `var &= expr` | 按位与及赋值 | `BitAndAssign` |
| `&&` | `expr && expr` | 逻辑与 |  |
| `*` | `expr * expr` | 算术乘法 | `Mul` |
| `*=` | `var *= expr` | 算术乘法与赋值 | `MulAssign` |
| `*` | `*expr` | 解引用 | |
| `*` | `*const type`, `*mut type` | 原生指针 | |
| `+` | `trait + trait`, `'a + trait` | 复合类型限制 | |
| `+` | `expr + expr` | 算术加法 | `Add` |
| `+=` | `var += expr` | 算术加法与赋值 | `AddAssign` |
| `,` | `expr, expr` | 参数以及元素分隔符 | |
| `-` | `- expr` | 算术取负 | `Neg` |
| `-` | `expr - expr` | 算术减法| `Sub` |
| `-=` | `var -= expr` | 算术减法与赋值 | `SubAssign` |
| `->` | `fn(...) -> type`, <code>&vert;...&vert; -> type</code> | 函数与闭包，返回类型 | |
| `.` | `expr.ident` | 成员访问 | |
| `..` | `..`, `expr..`, `..expr`, `expr..expr` | 右半开区间 | PartialOrd |
| `..=` | `..`, `expr..`, `..expr`, `expr..expr` | 闭合区间 | PartialOrd |
| `..` | `..expr` | 结构体更新语法 | |
| `..` | `variant(x, ..)`, `struct_type { x, .. }` | “代表剩余部分”的模式绑定 | |
| `...` | `expr...expr` | (不推荐使用，用`..=`替代) 闭合区间 | |
| `/` | `expr / expr` | 算术除法 | `Div` |
| `/=` | `var /= expr` | 算术除法与赋值 | `DivAssign` |
| `:` | `pat: type`, `ident: type` | 约束 | |
| `:` | `ident: expr` | 结构体字段初始化 | |
| `:` | `'a: loop {...}` | 循环标志 | |
| `;` | `expr;` | 语句和语句结束符 | |
| `;` | `[...; len]` | 固定大小数组语法的部分 | |
| `<<` | `expr << expr` |左移 | `Shl` |
| `<<=` | `var <<= expr` | 左移与赋值| `ShlAssign` |
| `<` | `expr < expr` | 小于比较 | `PartialOrd` |
| `<=` | `expr <= expr` | 小于等于比较 | `PartialOrd` |
| `=` | `var = expr`, `ident = type` | 赋值/等值 | |
| `==` | `expr == expr` | 等于比较 | `PartialEq` |
| `=>` | `pat => expr` | 匹配分支语法的部分 | |
| `>` | `expr > expr` | 大于比较 | `PartialOrd` |
| `>=` | `expr >= expr` | 大于等于比较 | `PartialOrd` |
| `>>` | `expr >> expr` | 右移 | `Shr` |
| `>>=` | `var >>= expr` | 右移与赋值 | `ShrAssign` |
| `@` | `ident @ pat` | 模式绑定 | |
| `^` | `expr ^ expr` | 按位异或 | `BitXor` |
| `^=` | `var ^= expr` | 按位异或与赋值 | `BitXorAssign` |
| <code>&vert;</code> | <code>pat &vert; pat</code> | 模式匹配中的多个可选条件 | |
| <code>&vert;</code> | <code>expr &vert; expr</code> | 按位或 | `BitOr` |
| <code>&vert;=</code> | <code>var &vert;= expr</code> | 按位或与赋值 | `BitOrAssign` |
| <code>&vert;&vert;</code> | <code>expr &vert;&vert; expr</code> | 逻辑或 | |
| `?` | `expr?` | 错误传播 | |


### 非运算符符号

<span class="caption">表 B-2：独立语法</span>

| 符号 | 解释 |
|--------|-------------|
| `'ident` | 生命周期名称或循环标签 |
| `...u8`, `...i32`, `...f64`, `...usize`, 等 | 指定类型的数值常量 |
| `"..."` | 字符串常量 |
| `r"..."`, `r#"..."#`, `r##"..."##`, etc. | 原生字符串, 未转义字符 |
| `b"..."` | 将 `&str` 转换成 `&[u8; N]` 类型的数组 |
| `br"..."`, `br#"..."#`, `br##"..."##`, 等 | 原生字节字符串，原生和字节字符串字面值的结合 |
| `'...'` | Char字符 |
| `b'...'` | ASCII字节 |
| <code>&vert;...&vert; expr</code> | 闭包 |
| `!` | 代表总是空的类型，用于发散函数(无返回值函数) |
| `_` | 模式绑定中表示忽略的意思；也用于增强整型字面值的可读性 |

表 B-3展示了模块和对象调用路径的语法。

<span class="caption">表 B-3：路径相关语法</span>

| 符号 | 解释 |
|--------|-------------|
| `ident::ident` | 命名空间路径 |
| `::path` | 从当前的包的根路径开始的相对路径 |
| `self::path` | 与当前模块相对的路径（如一个显式相对路径）|
| `super::path` | 与父模块相对的路径 |
| `type::ident`, `<type as trait>::ident` | 关联常量、关联函数、关联类型 |
| `<type>::...` | 不可以被直接命名的关联项类型（如 `<&T>::...`，`<[T]>::...`， 等） |
| `trait::method(...)` | 使用特征名进行方法调用，以消除方法调用的二义性 |
| `type::method(...)` | 使用类型名进行方法调用, 以消除方法调用的二义性 |
| `<type as trait>::method(...)` | 将类型转换为特征，再进行方法调用,以消除方法调用的二义性 |


表 B-4 展示了使用泛型参数时用到的符号。

<span class="caption">表 B-4：泛型</span>

| 符号 | 解释 |
|--------|-------------|
| `path<...>` | 为一个类型中的泛型指定具体参数（如 `Vec<u8>`） |
| `path::<...>`, `method::<...>` | 为一个泛型、函数或表达式中的方法指定具体参数，通常指双冒号(turbofish)（如 `"42".parse::<i32>()`）|
| `fn ident<...> ...` | 泛型函数定义 |
| `struct ident<...> ...` | 泛型结构体定义 |
| `enum ident<...> ...` | 泛型枚举定义 |
| `impl<...> ...` | 实现泛型 |
| `for<...> type` | 高阶生命周期限制 |
| `type<ident=type>` | 泛型，其一个或多个相关类型必须被指定为特定类型（如 `Iterator<Item=T>`）|

表 B-5 展示了使用特征约束来限制泛型参数的符号。

<span class="caption">表 B-5: 特征约束</span>

| 符号 | 解释 |
|--------|-------------|
| `T: U` | 泛型参数 `T`需实现`U`类型 |
| `T: 'a` | 泛型 `T` 的生命周期必须长于 `'a`（意味着该类型不能传递包含生命周期短于 `'a` 的任何引用）|
| `T : 'static` | 泛型 T只能使用声明周期为'static的引用 |
| `'b: 'a` |生命周期`'b`必须长于生命周期`'a` |
| `T: ?Sized` | 使用一个不定大小的泛型类型 |
| `'a + trait`, `trait + trait` | 多个类型组成的复合类型限制 |

表 B-6 展示了宏以及在一个对象上定义属性的符号。

<span class="caption">表 B-6: 宏与属性</span>

| 符号 | 解释 |
|--------|-------------|
| `#[meta]` | 外部属性 |
| `#![meta]` | 内部属性 |
| `$ident` | 宏替换 |
| `$ident:kind` | 宏捕获 |
| `$(…)…` | 宏重复 |
| `ident!(...)`, `ident!{...}`, `ident![...]` | 宏调用 |

表 B-7 展示了写注释的符号。

<span class="caption">表 B-7: 注释</span>

| 符号 | 注释 |
|--------|-------------|
| `//` | 行注释 |
| `//!` | 内部行(hang)文档注释 |
| `///` | 外部行文档注释 |
| `/*...*/` | 块注释 |
| `/*!...*/` | 内部块文档注释 |
| `/**...*/` | 外部块文档注释 |

表 B-8 展示了出现在使用元组时的符号。

<span class="caption">表 B-8: 元组</span>

| 符号 | 解释 |
|--------|-------------|
| `()` | 空元组（亦称单元），即是字面值也是类型 |
| `(expr)` | 括号表达式 |
| `(expr,)` | 单一元素元组表达式 |
| `(type,)` | 单一元素元组类型 |
| `(expr, ...)` | 元组表达式 |
| `(type, ...)` | 元组类型 |
| `expr(expr, ...)` | 函数调用表达式；也用于初始化元组结构体 `struct` 以及元组枚举 `enum` 变体 |
| `expr.0`, `expr.1`, etc. | 元组索引 |

表 B-9 展示了使用大括号的上下文。

<span class="caption">表 B-9: 大括号</span>

| 符号 | 解释 |
|---------|-------------|
| `{...}` | 代码块表达式 |
| `Type {...}` | 结构体字面值  |

表 B-10 展示了使用方括号的上下文。

<span class="caption">表 B-10: 方括号</span>

| 符号 | 解释 |
|---------|-------------|
| `[...]` | 数组 |
| `[expr; len]` | 数组里包含`len`个`expr` |
| `[type; len]` | 数组里包含了`len`个`type`类型的对象|
| `expr[expr]` | 集合索引。 重载（`Index`, `IndexMut`） |
| `expr[..]`, `expr[a..]`, `expr[..b]`, `expr[a..b]` | 集合索引，也称为集合切片，索引要实现以下特征中的其中一个：`Range`，`RangeFrom`，`RangeTo` 或 `RangeFull` |
