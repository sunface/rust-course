# 所有权和借用

Rust 之所以能成为万众瞩目的语言，就是因为其内存安全性。在以往，内存安全几乎都是通过 GC 的方式实现，但是 GC 会引来性能、内存占用以及 Stop the world 等问题，在高性能场景和系统编程上是不可接受的，因此 Rust 采用了与 ( 不 ) 众 ( 咋 ) 不 ( 好 ) 同 ( 学 )的方式：**所有权系统**。

理解**所有权**和**借用**，对于 Rust 学习是至关重要的，因此我们把本章提到了非常靠前的位置，So，在座的各位，有一个算一个，准备好了嘛？

从现在开始，鉴于大家已经掌握了非常基本的语法，有些时候，在示例代码中，将省略 `fn main() {}` 的模版代码，只要将相应的示例放在 `fn main() {}` 中，即可运行。
