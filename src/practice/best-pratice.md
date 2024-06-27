# 最佳实践

https://www.reddit.com/r/rust/comments/rgjsbt/whats_your_top_rust_tip_crate_tool_other_for/

https://www.reddit.com/r/rust/comments/rnmmqz/question_how_to_keep_code_dry_when_many_similar/

https://www.reddit.com/r/rust/comments/rrgho1/what_is_the_recommended_way_to_use_a_library/

## 最佳开发流程 workflow

cargo watch
https://www.reddit.com/r/rust/comments/rxrkbo/what_is_your_workflow_when_working_with_rust/

## 测试文件组织结构

https://www.reddit.com/r/rust/comments/rsuhnn/need_a_piece_of_advice_about_organising_tests/

## git 备份

https://github.com/tkellogg/dura

## code cover

https://docs.codecov.com/docs

## clippy

https://www.reddit.com/r/rust/comments/s62xu0/inspect_enum_variant_size_differences/

## todo

unimplemented!() todo!()

## 如何获知变量类型或者函数的返回类型

有几种常用的方式:

- 第一种是查询标准库或者三方库文档，搜索`File`，然后找到它的`open`方法，但是此处更推荐第二种方法:
- 在[Rust IDE]章节，我们推荐了`VSCode` IED 和`rust-analyze`插件，如果你成功安装的话，那么就可以在`VScode`中很方便的通过代码跳转的方式查看代码，同时`rust-analyze`插件还会对代码中的类型进行标注，非常方便好用！
- 你还可以尝试故意标记一个错误的类型，然后让编译器告诉你:

```rust,ignore,mdbook-runnable
let f: u32 = File::open("hello.txt");
```

错误提示如下：

```console
error[E0308]: mismatched types
 --> src/main.rs:4:18
  |
4 |     let f: u32 = File::open("hello.txt");
  |                  ^^^^^^^^^^^^^^^^^^^^^^^ expected u32, found enum
`std::result::Result`
  |
  = note: expected type `u32`
             found type `std::result::Result<std::fs::File, std::io::Error>`
```

# 代码风格(todo)

https://www.reddit.com/r/rust/comments/rlsatb/generically_working_with_futuressinkstream/
