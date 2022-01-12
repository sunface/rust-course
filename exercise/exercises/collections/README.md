# 集合（Collections）

Rust 的标准库包含了很多有用的数据结构，它们称作为集合。
大多其它的数据类型通常仅表示一个特定的值，但集合可以包含多个值。
内置的数组和元组类型指向的数据存储在堆上，这意味着存储的数据不必在编译时确定，
并可以根据程序的运行来增加或减少。

本次练习将带你熟悉 Rust 程序中两个特别常用的基本数据结构：

* *vector* 能够存储一段连续且数量不定的值。

* *散列表（hash map）* 能够将某个值与一个特定的键关联起来。
  你可能也知道它们：[C++ 中的 *unordered map*](https://en.cppreference.com/w/cpp/container/unordered_map)、[Python 的 *dictionary*](https://docs.python.org/3/tutorial/datastructures.html#dictionaries) 或其它语言中的 *associative array（译：关联数组、map、映射）*。

## 更多信息

- [Storing Lists of Values with Vectors](https://doc.rust-lang.org/stable/book/ch08-01-vectors.html)
- [Storing Keys with Associated Values in Hash Maps](https://doc.rust-lang.org/book/ch08-03-hash-maps.html)
