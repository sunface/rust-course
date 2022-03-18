# Cargo 使用指南

Rust 语言的名气之所以这么大，保守估计 `Cargo` 的贡献就占了三分之一。

`Cargo` 是包管理工具，可以用于依赖包的下载、编译、更新、分发等，与 `Cargo` 一样有名的还有 [`crates.io`](https://crates.io)，它是社区提供的包注册中心：用户可以将自己的包发布到该注册中心，然后其它用户通过注册中心引入该包。

> 本章内容是基于 [Cargo Book](https://doc.rust-lang.org/stable/cargo/index.html) 翻译，并做了一些内容优化和目录组织上的调整

<img src="https://doc.rust-lang.org/stable/cargo/images/Cargo-Logo-Small.png" />

