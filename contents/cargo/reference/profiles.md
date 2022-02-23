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

## 默认profile

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

#### debug
`debug` 控制 [`-C debuginfo`](https://doc.rust-lang.org/stable/rustc/codegen-options/index.html#debuginfo) 标志，而后者用于控制最终二进制文件输出的 `debug` 信息量。

支持的选项包括:

- `0` 或 `false`：不输出任何 debug 信息
- `1`: 行信息
- `2`: 完整的 debug 信息

#### split-debuginfo
`split-debuginfo` 控制 [-C split-debuginfo](https://doc.rust-lang.org/stable/rustc/codegen-options/index.html#split-debuginfo) 标志，用于决定输出的 debug 信息是存放在二进制可执行文件里还是邻近的文件中。

#### debug-assertions
该字段控制 [-C debug-assertions](https://doc.rust-lang.org/stable/rustc/codegen-options/index.html#debug-assertions) 标志，可以开启或关闭其中一个[条件编译](https://doc.rust-lang.org/stable/reference/conditional-compilation.html#debug_assertions)选项： `cfg(debug_assertions)`。

`debug-assertion` 会提供运行时的检查，该检查只能用于 `debug` 模式，原因是对于 `release` 来说，这种检查的成本较为高昂。

大家熟悉的 [`debug_assert!`](https://course.rs/test/assertion.html#debug_assert-系列) 宏也是通过该标志开启的。


支持的选项包括 :

- `true`: 开启
- `false`: 关闭

#### overflow-checks
用于控制 [-C overflow-checks](https://doc.rust-lang.org/stable/rustc/codegen-options/index.html#overflow-checks) 标志，该标志可以控制运行时的整数溢出行为。**当开启后，整数溢出会导致 `panic`**。

支持的选项包括 :

- `true`: 开启
- `false`: 关闭

#### lto
`lto` 用于控制 [`-C lto`](https://doc.rust-lang.org/stable/rustc/codegen-options/index.html#lto) 标志，而后者可以控制 LLVM 的[链接时优化( link time optimizations )](https://llvm.org/docs/LinkTimeOptimization.html)。通过对整个程序进行分析，并以增加链接时间为代价，LTO 可以生成更加优化的代码。

支持的选项包括：

- `false`: 只会对代码生成单元中的本地包进行 `thin LTO` 优化，若代码生成单元数为 1 或者 `opt-level` 为 0，则不会进行任何 LTO 优化
- `true` 或 `fat`：对依赖图中的所有包进行 `fat LTO` 优化
- `thin`：对依赖图的所有包进行 [`thin LTO`](http://blog.llvm.org/2016/06/thinlto-scalable-and-incremental-lto.html)，相比 `fat` 来说，它仅牺牲了一点性能，但是换来了链接时间的可观减少 
- `off`： 禁用 LTO
  
如果大家想了解跨语言 LTO，可以看下 [-C linker-plugin-lto](https://doc.rust-lang.org/stable/rustc/codegen-options/index.html#linker-plugin-lto) 标志。

#### panic
`panic` 控制 [-C panic](https://doc.rust-lang.org/stable/cargo/reference/profiles.html#codegen-units) 标志，它可以控制 `panic` 策略的选择。

支持的选项包括:

- `"unwind"`: 遇到 panic 后对栈进行展开( unwind )
- `"abort"`: 遇到 panic 后直接停止程序

当设置为 `"unwind"` 时，具体的栈展开信息取决于特定的平台，例如 `NVPTX` 不支持 `unwind`，因此程序只能 "abort"。

测试、基准性能测试、构建脚本和过程宏会忽略 `panic` 设置，目前来说它们要求是 `"unwind"`，如果大家希望修改成 `"abort"`，可以看看 [panic-abort-tests ](https://doc.rust-lang.org/stable/cargo/reference/unstable.html#panic-abort-tests)。

另外，当你使用 `"abort"` 策略且在执行测试时，由于上述的要求，除了测试代码外，所有的依赖库也会忽略该 `"abort"` 设置而使用 `"unwind"` 策略。

#### incremental
`incremental` 控制 [-C incremental](https://doc.rust-lang.org/stable/rustc/codegen-options/index.html#incremental) 标志，用于开启或关闭增量编译。开启增量编译时，`rustc` 会将必要的信息存放到硬盘中( `target` 目录中 )，当下次编译时，这些信息可以被复用以改善编译时间。

支持的选项包括:

- `true`： 启用
- `false`: 关闭

**增量编译只能用于工作空间的成员和通过 `path` 引入的本地依赖。**

大家还可以通过[环境变量](https://doc.rust-lang.org/stable/cargo/reference/environment-variables.html) `CARGO_INCREMENTAL` 或 Cargo 配置 [build.incremental](https://doc.rust-lang.org/stable/cargo/reference/config.html#buildincremental) 在全局对 `incremental` 进行覆盖。

#### codegen-units
`codegen-units` 控制 [-C codegen-units](https://doc.rust-lang.org/stable/rustc/codegen-options/index.html#codegen-units) 标志，可以指定一个包会被分隔为多少个代码生成单元。**更多的代码生成单元会提升代码的并行编译速度，但是可能会降低运行速度。**

对于增量编译，默认值是 256，非增量编译是 16。

#### r-path
用于控制 [-C rpath](https://doc.rust-lang.org/stable/rustc/codegen-options/index.html#rpath)标志，可以控制 [`rpath`](https://en.wikipedia.org/wiki/Rpath) 的启用与关闭。

`rpath` 代表硬编码到二进制可执行文件或库文件中的**运行时代码搜索(runtime search path)**，动态链接库的加载器就通过它来搜索所需的库。

