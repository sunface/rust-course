# Miri
看到这里，大家是不是暗中松了口气？unsafe 不过如此嘛，不知道为何其它人都谈之色变。

怎么说呢？你以为的编译器已经不是以前的编译器了，它不报错不代表没有错误。包括测试用例也是，正常地运行不能意味着代码没有任何错误。

在周星驰电影功夫中，还有一个奇怪大叔 10 元一本主动上门卖如来神掌，那么有没有 10 元一本的 Rust 秘笈呢？( 喂，Rust语言圣经都免费让你读了，有了摩托车，还要什么拖拉机... 哈哈，开个玩笑 )

有的，奇怪大叔正在赶来，他告诉我们先来安装一个命令:
```shell
rustup +nightly-2022-01-21 component add miri
info: syncing channel updates for 'nightly-2022-01-21-x86_64-pc-windows-msvc'
info: latest update on 2022-01-21, rust version 1.60.0-nightly (777bb86bc 2022-01-20)
info: downloading component 'cargo'
info: downloading component 'clippy'
info: downloading component 'rust-docs'
info: downloading component 'rust-std'
info: downloading component 'rustc'
info: downloading component 'rustfmt'
info: installing component 'cargo'
info: installing component 'clippy'
info: installing component 'rust-docs'
info: installing component 'rust-std'
info: installing component 'rustc'
info: installing component 'rustfmt'
info: downloading component 'miri'
info: installing component 'miri'
```

等等，你在我电脑上装了什么奇怪的东西？！  "好东西"


> miri 目前只能在 nightly Rust 上安装，`+nightly-2022-01-21` 告诉 `rustup` 我们想要安装的 `nightly` 版本，事实上，你可以直接通过 `rustup +nightly component add miri` 安装，这里指定版本主要因为 `miri` 有时候会因为某些版本而出错。
>
> 2022-01-21 是我所知的 miri 可以成功运行的版本，你可以检查[这个网址](https://rust-lang.github.io/rustup-components-history/)获取更多信息
>
> + 是一种临时性的规则运用，如果你不想每次都使用 `+nightly-2022-01-21`，可以使用 [`rustup override set`](https://course.rs/appendix/rust-version.html#rustup-和-rust-nightly-的职责) 命令对当前项目的 Rust 版本进行覆盖

```shell
> cargo +nightly-2022-01-21 miri test

I will run `"cargo.exe" "install" "xargo"` to install
a recent enough xargo. Proceed? [Y/n]
```

额，`xargo` 是什么东东？"不要担心，选择 y 就行，我像是会坑你的人吗？"

```shell
> y

    Updating crates.io index
  Installing xargo v0.3.24
...
    Finished release [optimized] target(s) in 10.65s
  Installing C:\Users\ninte\.cargo\bin\xargo-check.exe
  Installing C:\Users\ninte\.cargo\bin\xargo.exe
   Installed package `xargo v0.3.24` (executables `xargo-check.exe`, `xargo.exe`)

I will run `"rustup" "component" "add" "rust-src"` to install 
the `rust-src` component for the selected toolchain. Proceed? [Y/n]
```

额？ "不要怕，多给你一份 Rust 源代码，不开心嘛？"

```shell
> y

info: downloading component 'rust-src'
info: installing component 'rust-src'
```

"看吧，我就说我不会骗你的，不相信我，等着错误砸脸吧!" 真是一个奇怪的大叔...
```shell
 Compiling lists v0.1.0 (C:\Users\ninte\dev\tmp\lists)
    Finished test [unoptimized + debuginfo] target(s) in 0.25s
     Running unittests (lists-5cc11d9ee5c3e924.exe)

error: Undefined Behavior: trying to reborrow for Unique at alloc84055, 
       but parent tag <209678> does not have an appropriate item in 
       the borrow stack

   --> \lib\rustlib\src\rust\library\core\src\option.rs:846:18
    |
846 |             Some(x) => Some(f(x)),
    |                  ^ trying to reborrow for Unique at alloc84055, 
    |                    but parent tag <209678> does not have an 
    |                    appropriate item in the borrow stack
    |
    = help: this indicates a potential bug in the program: 
      it performed an invalid operation, but the rules it 
      violated are still experimental
    = help: see https://github.com/rust-lang/unsafe-code-guidelines/blob/master/wip/stacked-borrows.md 
      for further information

    = note: inside `std::option::Option::<std::boxed::Box<fifth::Node<i32>>>::map::<i32, [closure@src\fifth.rs:31:30: 40:10]>` at \lib\rustlib\src\rust\library\core\src\option.rs:846:18

note: inside `fifth::List::<i32>::pop` at src\fifth.rs:31:9
   --> src\fifth.rs:31:9
    |
31  | /         self.head.take().map(|head| {
32  | |             let head = *head;
33  | |             self.head = head.next;
34  | |
...   |
39  | |             head.elem
40  | |         })
    | |__________^
note: inside `fifth::test::basics` at src\fifth.rs:74:20
   --> src\fifth.rs:74:20
    |
74  |         assert_eq!(list.pop(), Some(1));
    |                    ^^^^^^^^^^
note: inside closure at src\fifth.rs:62:5
   --> src\fifth.rs:62:5
    |
61  |       #[test]
    |       ------- in this procedural macro expansion
62  | /     fn basics() {
63  | |         let mut list = List::new();
64  | |
65  | |         // Check empty list behaves right
...   |
96  | |         assert_eq!(list.pop(), None);
97  | |     }
    | |_____^
 ...
error: aborting due to previous error
```

咦还真有错误，大叔，这是什么错误？大叔？...奇怪的大叔默默离开了，留下我在风中凌乱。

果然不靠谱...还是得靠自己，首先得了解下何为 `miri`。


[`miri`](https://github.com/rust-lang/miri) 可以生成 Rust 的中间层表示 MIR，对于编译器来说，我们的 Rust 代码首先会被编译为 MIR ，然后再提交给 LLVM 进行处理。

可以通过 `rustup component add miri` 来安装它，并通过 `cargo miri` 来使用，同时还可以使用 `cargo miri test` 来运行测试代码。

`miri` 可以帮助我们检查常见的未定义行为(UB = Undefined Behavior)，以下列出了一部分:

- 内存越界检查和内存释放后再使用(use-after-free)
- 使用未初始化的数据
- 数据竞争
- 内存对齐问题

UB 检测是必须的，因为它发生在运行时，因此很难发现，如果 `miri` 能在编译期检测出来，那自然是最好不过的。

总之，`miri` 的使用很简单:
```shell
> cargo +nightly-2022-01-21 miri test
```

下面来看看具体的错误：
```shell
error: Undefined Behavior: trying to reborrow for Unique at alloc84055, but parent tag <209678> does not have an appropriate item in the borrow stack

   --> \lib\rustlib\src\rust\library\core\src\option.rs:846:18
    |
846 |             Some(x) => Some(f(x)),
    |                  ^ trying to reborrow for Unique at alloc84055, 
    |                    but parent tag <209678> does not have an 
    |                    appropriate item in the borrow stack
    |

    = help: this indicates a potential bug in the program: it 
      performed an invalid operation, but the rules it 
      violated are still experimental
    
    = help: see 
      https://github.com/rust-lang/unsafe-code-guidelines/blob/master/wip/stacked-borrows.md 
      for further information
```

嗯，只能看出是一个错误，其它完全看不懂了，例如什么是 `borrow stack`？


