> 词汇表是从https://github.com/rust-lang-cn/english-chinese-glossary-of-rust fork而来，原因是在部分词汇的翻译上，存在不同的意见，欢迎大家开issue讨论或者提交pr

# Rust 语言术语中英文对照表

English 英文                     | Chinese 中文                  | Note 备注
-------------------------------  |----------------------------- |----------
**A**                            |                               |
Abstract Syntax Tree             | 抽象语法树                    |
ABI                              | 应用程序二进制接口            | Application Binary Interface 缩写
accumulator                      | 累加器                        |
accumulator variable             | 累加器变量                    |
ahead-of-time compiled           | 预编译                        |
ahead-of-time compiled language  | 预编译语言                    |
algebraic data types(ADT)        | 代数数据类型                  |
alias                            | 别名                          |
aliasing                         | 别名使用                      | 参见 [Wikipedia](https://en.wikipedia.org/wiki/Pointer_aliasing)
angle brackets                   | 尖括号，“&lt;”和“&gt;”        |
annotate                         | 标注，注明（动词）            |
annotation                       | 标注，注明（名词）            |
ARC                              | 原子引用计数器                | Atomic Referecne Counter
anonymity                        | 匿名                          |
argument                         | 参数，实参，实际参数          | 不严格区分的话， argument（参数）和 <br> parameter（参量）可以互换地使用
argument type                    | 参数类型                      |
assignment                       | 赋值                          |
associated functions             | 关联函数                      |
associated items                 | 关联项                        |
associated types                 | 关联类型                      |
asterisk                         | 星号（\*)                     |
atomic                           | 原子的                        |
attribute                        | 属性                          |
automated building               | 自动构建                      |
automated test                   | 自动测试，自动化测试          |
**B**                            |                               |
baroque macro                    | 巴洛克宏                      |
benchmark                        | 基准                          |
binary                           | 二进制的                      |
binary executable                | 二进制的可执行文件            |
bind                             | 绑定                          |
block                            | 语句块，代码块                |
boolean                          | 布尔型，布尔值                |
borrow check                     | 借用检查                      |
borrower                         | 借用者，借入者                |
borrowed                         | 借用的                       |
borrowing                        | 借用                          |
bound                            | 约束，限定，限制              | 此词和 constraint 意思相近，<br>constraint 在 C# 语言中翻译成“约束”
box                              | 箱子，盒子，装箱类型          | 一般不译，作动词时翻译成“装箱”，<br>具有所有权的智能指针
boxed                            | 装箱，装包                    |
boxing                           | 装箱，装包                    |
brace                            | 大括号，“{”或“}”              |
buffer                           | 缓冲，缓冲区，缓冲器，缓存    |
build                            | 构建                          |
builder pattern                  | 创建者模式                    |
**C**                            |                               |
call                             | 调用                          |
caller                           | 调用者                        |
capacity                         | 容量                          |
capture                          | 捕获                          |
cargo                            | (Rust 包管理器，不译)         | 该词作名词时意思是“货物”，<br>作动词时意思是“装载货物”
cargo-fy                         | Cargo 化，使用 Cargo 创建项目 |
case analysis                    | 事例分析                      |
cast                             | 类型转换，转型                |
casting                          | 类型转换                      |
chaining method call             | 链式方法调用                  |
channel                          | 信道，通道                    |
closure                          | 闭包                          |
coercion                         | 强制类型转换，强制转换        | coercion 原意是“强制，胁迫”
collection                       | 集合                          | 参见 [Wikipedia](https://zh.wikipedia.org/wiki/%E9%9B%86%E5%90%88_(%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%A7%91%E5%AD%A6)) |
combinator                       | 组合算子，组合器              |
comma                            | 逗号，“,”                     |
command                          | 命令                          |
command line                     | 命令行                        |
comment                          | 注释                          |
compile                          | 编译（动词）                  |
compile time                     | 编译期，编译期间，编译时      |
compilation                      | 编译（名词）                  |
compilation unit                 | 编译单元                      |
compiler                         | 编译器                        |
compiler intrinsics              | 编译器固有功能                |
compound                         | 复合（类型，数据）            |
concurrency                      | 并发                          |
conditional compilation          | 条件编译                      |
configuration                    | 配置                          |
constant                         | 常量                          |
constant raw pointer             | 原生常量指针                   |
constructor                      | 构造器                        |
consumer                         | 消费者                        |
container                        | 容器                          |
container type                   | 容器类型                      |
convert                          | 转换，转化，转                |
copy                             | 复制，拷贝                    |
crate                            | 包                          | crate 是 Rust 的基本编译单元
crate root                       | 包根                        | 别拍我，我知道很奇葩
curly braces                     | 大括号，包含“{”和“}”          |
custom type                      | 自定义类型                    |
**D**                            |                               |
dangling pointer                 | 悬垂指针                      | use after free 在释放后使用
data race                        | 数据竞争                      |
dead code                        | 死代码，无效代码，不可达代码  |
deallocate                       | 释放，重新分配                |
declare                          | 声明                          |
deep copy                        | 深拷贝，深复制                |
dependency                       | 依赖                          |
deref coercions                  | 解引用强制转换                |
dereference                      | 解引用                        | Rust  文章中有时简写为 Deref
derive                           | 派生                          |
designator                       | 指示符                        |
destruction                      | 销毁，毁灭                    |
destructor                       | 析构器，析构函数              |
destructure                      | 解构                          |
destructuring                    | 解构，解构赋值                |
desugar                          | 脱糖                          |
diverge function                 | 发散函数                      |
device drive                     | 设备驱动                      |
directory                        | 目录                          |
dispatch                         | 分发                          |
diverging functions              | 发散函数                      |
documentation                    | 文档                          |
dot operator                     | 点运算符                      |
DST                              | 动态大小类型                  | dynamic sized type，一般不译，<br>使用英文缩写形式
dynamic language                 | 动态类型语言                  |
dynamic trait type               | 动态特质类型               |
**E**                            |                               |
enum variant                     | 枚举成员                         |
enumeration                      | 枚举                          |
encapsulation                    | 封装                          |
equality test                    | 相等测试                      |
elision                          | 省略                          |
exhaustiveness checking          | 穷尽性检查，无遗漏检查        |
executor                         | 执行器                       | 
expression                       | 表达式                        |
expression-oriented language     | 面向表达式的语言              |
explicit                         | 显式                          |
explicit discriminator           | 显式的辨别值                  |
explicit type conversion         | 显式类型转换                  |
extension                        | 扩展名                        |
extern                           | 外，外部                      | 作关键字时不译
**F**                            |                               |
fat pointer                      | 宽指针                        |
Feature                          | 暂时不译                      | 在Rust中主要用于Cargo feature该词
feature gate                     | 功能开关                      |
field                            | 字段                          |
field-level mutability           | 字段级别可变性                |
file                             | 文件                          |
fmt                              | 格式化，是 format 的缩写      |
formatter                        | 格式化程序，格式化工具，格式器|
floating-point number            | 浮点数                        |
flow control                     | 流程控制                      |
Foreign Function Interface（FFI）| 外部语言函数接口              |
fragment specifier               | 片段分类符                    |
free variables                   | 自由变量                      |
freeze                           | 冻结                          |
function                         | 函数                          |
function declaration             | 函数声明                      |
functional                       | 函数式                        |
**G**                            |                               |
garbage collector                | 垃圾回收                      |
generalize                       | 泛化，泛型化                  |
generator                        | 生成器                        |
generic                          | 泛型                          |
generic type                     | 泛型类型                      |
getter                           | 读访问器                      |
growable                         | 可增长的                      |
guard                            | 守卫                          |
**H**                            |                               |
handle error                     | 句柄错误                      |
hash                             | 哈希，哈希值，散列            |
hash map                         | 散列映射，哈希表              |
heap                             | 堆                            |
hierarchy                        | 层次，分层，层次结构          |
higher rank lifetime             | 高阶生命周期                  |
higher rank trait bound          | 高阶特质约束               |
higher rank type                 | 高阶类型                      |
hygiene                          | 卫生                          |
hygienic macro system            | 卫生宏系统                    |
**I**                            |                               |
ICE                              | 编译内部错误                  | internal compiler error 的缩写
immutable                        | 不可变的                      |
implement                        | 实现                          |
implementor                      | 实现者                        |
implicit                         | 隐式                          |
implicit discriminator           | 隐式的辨别值                  |
implicit type conversion         | 隐式类型转换                  |
import                           | 导入                          |
in assignment                    | 在赋值（语句）                |
index                            | 索引                          | 英语复数形式：indices
infer                            | 推导（动词）                  |
inference                        | 推导（名词）                  |
inherited mutability             | 承袭可变性                    |
inheritance                      | 继承                          |
integrated development <br>environment(IDE) | 集成开发环境       | 中文著作中通常直接写成 IDE
integration-style test           | 集成测试                      |
interior mutability              | 内部可变性                    |
installer                        | 安装程序，安装器              |
instance                         | 实例                          |
instance method                  | 实例方法                      |
integer                          | 整型，整数                    |
interact                         | 相互作用，相互影响            |
interior mutability              | 内部可变性                    |
intrinsic                        | 固有的                        |
invoke                           | 调用                          |
item                             | 项，条目，项目                |
iterate                          | 重复                          |
iteration                        | 迭代                          |
iterator                         | 迭代器                        |
iterator adaptors                | 迭代器适配器                  |
iterator invalidation            | 迭代器失效                    |
**L**                            |                               |
local variables                  | 局部变量                      |
LHS                              | 左操作数                      | left-hand side 的非正式缩写，<br>与 RHS 相对
lender                           | 借出者                        |
library                          | 库                            |
lifetime                         | 生命周期                       |
lifetime elision                 | 生命周期消除                    |
link                             | 链接                          |
linked-list                      | 链表                          |
lint                             | 代码静态分析                      | Lint, or a linter, is a static code analysis tool used to flag programming errors, bugs, stylistic errors and suspicious constructs |
list                             | 列表                            |
listener                         | 监听器                        |
literal                          | 数据，常量数据，字面值，字面量，<br>字面常量，字面上的 | 英文意思：字面意义的（内容）
LLVM                             | （不译）                      | Low Level Virtual Machine 的缩写，<br>是构建编译器的系统
loop                             | 循环                          | 作关键字时不译
low-level code                   | 底层代码                      |
low-level language               | 底层语言                      |
l-value                          | 左值                          |
**M**                            |                               |
main function                    | main 函数，主函数             |
macro                            | 宏                            |
map                              | 映射                          | 一般不译
match guard                      | 匹配守卫                      |
memory                           | 内存                          |
memory leak                      | 内存泄露                      |
memory safe                      | 内存安全                      |
meta                             | 原则，元                      |
metadata                         | 元数据                        |
metaprogramming                  | 元编程                        |
metavariable                     | 元变量                        |
method call syntax               | 方法调用语法                  |
method chaining                  | 方法链                        |
method definition                | 方法定义                      |
modifier                         | 修饰符                        |
module                           | 模块                          |
monomorphization                 | 单态                          | mono: one, morph: form
move                             | 移动，转移                    | 按照 Rust 所规定的内容，<br>英语单词 transfer 的意思<br>比 move 更贴合实际描述<br>参考：[Rust by Example](http://rustwiki.org/rust-by-example/scope/move.html)
move semantics                   | 移动语义                      |
mutability                       | 可变性                        |
mutable                          | 可变                          |
mutable reference                | 可变引用                      |
multiple bounds                  | 多重约束                      |
mutiple patterns                 | 多重模式                      |
**N**                            |                               |
naming                           | 命名                          |
nest                             | 嵌套                          |
Nightly Rust                     | Rust 开发版                   | nightly本意是“每夜，每天晚上”，<br>指代码每天都更新
NLL                              | 非词法生命周期                | non lexical lifetime 的缩写，<br>一般不译
non-copy type                    | 非复制类型                    |
non-generic                      | 非泛型                        |
no-op                            | 空操作，空运算                | (此词出现在类型转换章节中）
non-commutative                  | 非交换的                      |
non-scalar cast                  | 非标量转换                    |
notation                         | 符号，记号                    |
number type                      | 数据类型
numeric                          | 数值，数字                    |
**O**                            |                               |
optimization                     | 优化                          |
out-of-bounds accessing          | 越界访问                      |
orphan rule                      | 孤儿规则                      |
overflow                         | 溢出，越界                    |
own                              | 占有，拥有                    |
owned                            | 所拥有的                      |
owner                            | 所有者，拥有者                |
ownership                        | 所有权                        |
**P**                            |                               |
package                          | 不翻译                        |
panic                            | 异常、致命错误、不译            | 在 Rust 中用于不可恢复的错误处理，跟其它语言的exception类似
parallelism                      | 并行                         |
parameter                        | 参数                         | 
parametric polymorphism          | 参数多态                      |
parent scope                     | 父级作用域                    |
parentheses                      | 小括号，包括“(”和“)”          |
parse                            | 分析，解析                    |
parser                           | （语法）分析器，解析器        |
pattern                          | 模式                          |
pattern match                    | 模式匹配                      |
phantom type                     | 虚类型，虚位类型              | phantom 相关的专有名词：<br>phantom bug 幻影指令<br>phantom power 幻象电源<br>参见：[Haskell](https://wiki.haskell.org/Phantom_type)、[Haskell/Phantom_type](https://en.wikibooks.org/wiki/Haskell/Phantom_types)、<br>[Rust/Phantom](http://rustwiki.org/rust-by-example/generics/phantom.html)、[stdlib/PhantomData](https://doc.rust-lang.org/std/marker/struct.PhantomData.html)
platform                         | 平台                          |
polymorphism                     | 多态                          |
powershell                       |（不译）                       | Windows 系统的一种命令行外壳程序<br>和脚本环境
possibility of absence           | 不存在的可能性                |
precede                          | 预先？，在...发生（或出现）   |
prelude                          |（不译）                       | 预先导入模块，英文本意：序曲，前奏 
primitive types                  | 原生类型，基本类型，简单类型  |
print                            | 打印                          |
process                          | 进程                          |
procedural macros                | 过程宏，程序宏                |
project                          | 项目，工程                    |
prototype                        | 原型                          |
**R**                            |                               |
race condition                   | 竞态条件                      |
RAII                             | 资源获取即初始化（一般不译）  | resource acquisition is initialization 的缩写
range                            | 区间，范围                    |
range expression                 | 区间表达式                    |
raw identifier                   | 原生标识符                    |
raw pointer                      | 原生指针，裸指针              |
RC                               | 引用计数                      | reference counted
Reader                           | 读取器                        |
recursive macro                  | 递归宏                        |
reference                        | 引用                          |
reference cycle                  | 引用循环                      |
release                          | 发布                          |
resource                         | 资源                          |
resource leak                    | 资源泄露                      |
RHS                              | 右操作数                      | right-hand side 的非正式缩写，<br>与 LHS 相对
root directory                   | 根目录                        |
runtime                          | 运行时                        |
runtime behavior                 | 运行时行为                    |
runtime overhead                 | 运行时开销                    |
Rust                             | （不译）                      | 一种编程语言
Rustacean                        | （不译）                      | 编写 Rust 的程序员或爱好者的通称
rustc                            | （不译）                      | Rust 语言编译器
r-value                          | 右值                          |
**S**                            |                               |
scalar                           | 标量，数量                    |
schedule                         | 调度                          |
scope                            | 作用域                        |
screen                           | 屏幕                          |
script                           | 脚本                          |
semicolon                        | 分号，“;”                     |
self                             | 自身，作关键字时不译          |
setter                           | 写访问器                      |
shadow                           | 遮蔽，隐蔽，隐藏，覆盖        |
shallow copy                     | 浅拷贝，浅复制                |
signature                        | 标记                          |
slice                            | 切片                          |
snake case                       | 蛇形命名                      | 参见：[Snake case](https://en.wikipedia.org/wiki/Snake_case)
source file                      | 源文件                        |
source code                      | 源代码                        |
specialization                   | 泛型特化                      |
square                           | 平方，二次方，二次幂          |
square brackets                  | 中括号，“[”和“]”              |
src                              | （不译）                      | source 的缩写，指源代码
stack                            | 栈                            |
stack unwind                     | 栈解开、栈展开                |
statement                        | 语句                          |
statically allocated             | 静态分配                      |
statically allocated string      | 静态分配的字符串              |
statically dispatch              | 静态分发                      |
static method                    | 静态方法                      |
string                           | 字符串                        |
string literal                   | 字符串常量                    |
string slices                    | 字符串切片                    |
stringify                        | 字符串化                      |
subscript notation               | 下标                          |
sugar                            | 糖                            |
super                            | 父级，作关键字时不译          |
syntax context                   | 语法上下文                    |
systems programming language     | 系统级编程语言                |
**T**                            |                               |
tagged union                     | 标记联合                      |
target triple                    | 多层次指标，三层/重 指标/目标 | triple 本义是“三”，但此处虚指“多”，<br>此词翻译需要更多讨论
terminal                         | 终端                          |
testing                          | 测试                          |
testsuit                         | 测试套件                      |
the least significant bit (LSB)  | 最低数字位                    |
the most significant bit (MSB)   | 最高数字位                    |
thread                           | 线程                          |
TOML                             | （不译）                      | Tom's Obvious, Minimal Language <br>的缩写，一种配置语言
token tree                       | 令牌树？                      | 待进一步斟酌
trait                            | 特征                        | 其字面上有“特性，特征”之意
trait bound                      | 特征约束                    | bound 有“约束，限制，限定”之意
trait object                     | 特征对象                    |
transmute                        | （不译）                      | 其字面上有“变化，变形，变异”之意，<br>不作翻译
trivial                          | 平凡的                        |
troubleshooting                  | 疑难解答，故障诊断，<br>故障排除，故障分析 |
tuple                            | 元组                          |
turbofish                        | 双冒号`::`                   ｜ 难以翻译，所以直接用形译法
two's complement                 | 补码，二补数                  |
two-word object                  | 双字对象                      |
type annotation                  | 类型标注                      |
type erasure                     | 类型擦除                      |
type inference                   | 类型推导                      |
type inference engine            | 类型推导引擎                  |
type parameter                   | 类型参量                      |
type placeholder                 | 类型占位符                    |
type signature                   | 类型标记                      |
**U**                            |                               |
undefined behavior               | 未定义行为                    |
uninstall                        | 卸载                          |
unit-like struct                 | 类单元结构体                  |
 unit struct                     | 单元结构体                    |
"unit-style" tests               | 单元测试                      |
unit test                        | 单元测试                      |
unit type                        | 单元类型                      |
universal function call syntax <br>(UFCS)  | 通用函数调用语法    |
unsized types                    | 不定长类型                    |
unwind                           | 展开                          |
unwrap                           | 解包                          | 暂译！
**V**                            |                               | 
variable binding                 | 变量绑定                      |
variable shadowing               | 变量遮蔽，变量隐蔽,<br>变量隐藏，变量覆盖 |
variable capture                 | 变量捕获                      |
variant                          | 变量                          |
vector                           | （动态数组，一般不译）        | vector 本义是“向量”
visibility                       | 可见性                        |
vtable                           | 虚表                          |
**W**                            |                               |
where clause                     | where 子句，where 从句，where 分句 | 在数据库的官方手册中多翻译成“子句”，英语语法中翻译成“从句”
workspace                        | 工作空间                       |
wrap                             | 包装                          | 暂译！
wrapped                          | 装包                          |
wrapper                          | 装包                          |
**Y**                            |                               |
yield                            | 产生(收益、效益等)，产出，提供|
**Z**                            |                               |
zero-cost abstractions           | 零开销抽象                    |
zero-width space(ZWSP)           | 零宽空格                      |




