# 发布配置Profile
细心的同学可能发现了迄今为止我们已经为 Cargo 引入了不少新的名词，而且这些名词有一个共同的特点，不容易或不适合翻译成中文，因为难以表达的很准确，例如 Cargo Target, Feature 等，这不现在又多了一个 Profile。

## 默认的 profile
Profile 其实是一种发布配置，例如它默认包含四种: `dev`、 `release`、 `test` 和 `bench`，正常情况下，我们无需去指定，`Cargo` 会根据我们使用的命令来自动进行选择

- 例如 `cargo build` 自动选择 `dev` profile，而 `cargo test` 则是 `test` profile, 出于历史原因，这两个 profile 输出的结果都存放在项目根目录下的 `target/debug` 目录中，结果往往用于开发/测试环境
- 而 `cargo build  --release` 自动选择 `release` profile，并将输出结果存放在 `target/release` 目录中，结果往往用于生产环境

可以看出 Profile 跟 Nodejs 的 `dev` 和 `prod` 很像，都是通过不同的配置来为目标环境构建最终编译后的结果: `dev` 编译输出的结果用于开发环境，`prod` 则用于生产环境。

针对不同的 profile，编译器还会提供不同的优化级别，例如 `dev` 用于开发环境，因此构建速度是最重要的：此时，我们可以牺牲运行性能来换取编译性能，那么优化级别就会使用最低的。而 `release` 则相反，优化级别会使用最高，导致的结果就是运行得非常快，但是编译速度大幅降低。

> 初学者一个常见的错误，就是使用非 `release` profile 去测试性能，例如 `cargo run`，这种方式显然无法得到正确的结果，我们应该使用 `cargo run --release` 的方式测试性能

profile 可以通过 `Cargo.toml` 中的 `[profile]` 部分进行设置和改变:
```toml
[profile.dev]
opt-level = 1               # 使用稍高一些的优化级别，最低是0，最高是3
overflow-checks = false     # 关闭整数溢出检查
```

需要注意的是，每一种 profile 都可以单独的进行设置，例如上面的 `[profile.dev]`。

如果是工作空间的话，只有根 package 的 `Cargo.toml` 中的 `[profile` 设置才会被使用，其它成员或依赖包中的设置会被自动忽略。

另外，profile 还能在 Cargo 自身的配置文件中进行覆盖，总之，通过 `.cargo/config.toml` 或环境变量的方式所指定的 `profile` 配置会覆盖项目的 `Cargo.toml` 中相应的配置。

## 自定义profile
除了默认的四种 profile，我们还可以定义自己的。对于大公司来说，这个可能会非常有用，自定义的 profile 可以帮助我们建立更灵活的工作发布流和构建模型。

当定义 profile 时，你必须指定 `inherits` 用于说明当配置缺失时，该 profile 要从哪个 profile 那里继承配置。

例如，我们想在 release profile 的基础上增加 [LTO](#lto) 优化，那么可以在 `Cargo.toml` 中添加如下内容：
```toml
[profile.release-lto]
inherits = "release"
lto = true
```

然后在构建时使用 `--profile` 来指定想要选择的自定义 profile ：
```shell
cargo build --profile release-lto
```

与默认的 profile 相同，自定义 profile 的编译结果也存放在 [`target/`](https://course.rs/cargo/guide/build-cache.html) 下的同名目录中，例如 `--profile release-lto` 的输出结果存储在 `target/release-lto` 中。

## profile设置
下面我们来看看 profile 中可以进行哪些优化设置。

#### opt-level
该字段用于控制 [`-C opt-level`](https://doc.rust-lang.org/stable/rustc/codegen-options/index.html#opt-level) 标志的优化级别。更高的优化级别往往意味着运行更快的代码，但是也意味着更慢的编译速度。

同时，更高的编译级别甚至会造成编译代码的改变和再排列，这会为 debug 带来更高的复杂度。

`opt-level` 支持的选项包括:

- `0`: 无优化
- `1`: 基本优化
- `2`: 一些优化
- `3`: 全部优化
- "s": 优化输出的二进制文件的大小
- "z": 优化二进制文件大小，但也会关闭循环向量化

我们非常推荐你根据自己的需求来找到最适合的优化级别(例如，平衡运行和编译速度)。而且有一点值得注意，有的时候优化级别和性能的关系可能会出乎你的意料之外，例如 `3` 比 `2` 更慢，再比如 `"s"` 并没有让你的二进制文件变得更小。

而且随着 `rustc` 版本的更新，你之前的配置也可能要随之变化，总之，为项目的热点路径做好基准性能测试是不错的选择，不然总不能每次都手动重写代码来测试吧 :)

如果想要了解更多，可以参考 [rustc 文档](https://doc.rust-lang.org/stable/rustc/profile-guided-optimization.html)，这里有更高级的优化技巧。

#### lto