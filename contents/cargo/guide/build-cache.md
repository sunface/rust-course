# 构建( Build )缓存
`cargo build` 的结果会被放入项目根目录下的 `target` 文件夹中，当然，这个位置可以三种方式更改：设置 `CARGO_TARGET_DIR` [环境变量](https://course.rs/cargo/reference/env.html)、[`build.target-dir`](https://course.rs/cargo/reference/configuration.html#buildtarget-dir) 配置项以及 `--target-dir` 命令行参数。

## target 目录结构
`target` 目录的结构取决于是否使用 `--target` 标志为特定的平台构建。

#### 不使用 --target
若 `--target` 标志没有指定，`Cargo` 会根据宿主机架构进行构建，构建结果会放入项目根目录下的 `target` 目录中，`target` 下每个子目录中包含了相应的 [`发布配置profile`](cargo/reference/profile.md) 的构建结果，例如 `release`、`debug` 是自带的`profile`，前者往往用于生产环境，因为会做大量的性能优化，而后者则用于开发环境，此时的编译效率和报错信息是最好的。

除此之外我们还可以定义自己想要的 `profile` ，例如用于测试环境的 `profile`： `test`，用于预发环境的 `profile` ：`pre-prod` 等。

| 目录 | 描述 |
| --- | --- |
| `target/debug/` | 包含了 `dev` profile 的构建输出(`cargo build` 或 `cargo build --debug`) |
| `target/release` | `release` profile 的构建输出，`cargo build --release` |
| `target/foo/` | 自定义 `foo` profile 的构建输出，`cargo build --profile=foo`|

出于历史原因:

- `dev` 和 `test` profile 的构建结果都存放在 `debug` 目录下
- `release` 和 `bench` profile 则存放在 `release` 目录下
- 用户定义的 profile 存在同名的目录下

#### 使用 --target
当使用 `--target XXX` 为特定的平台编译后，输出会放在 `target/XXX/` 目录下:

| 目录 | 示例 |
| --- | --- |
| `target/<triple>/debug` | `target/thumbv7em-none-eabihf/debug/` |
| `target/<triple>/release/` | `target/thumbv7em-none-eabihf/release/` |


> **注意：**，当没有使用 `--target` 时，`Cargo` 会与构建脚本和过程宏一起共享你的依赖包，对于每个 `rustc` 命令调用而言，[`RUSTFLAGS`](https://course.rs/cargo/reference/configuration.md#buildrustflags) 也将被共享。
>
> 而使用 `--target` 后，构建脚本、过程宏会针对宿主机的CPU架构进行各自构建，且不会共享 `RUSTFLAGS`。

#### target子目录说明
在 profile 文件夹中(例如 `debug` 或 `release`)，包含编译后的最终成果:

| 目录 | 描述 |
| --- | --- |
| `target/debug/` | 包含编译后的输出，例如二进制可执行文件、[库对象( library target )](https://course.rs/cargo/reference/manifest/cargo-target.html#library) |
| `target/debug/examples/`  | 包含[示例对象( example target )](cargo/reference/manifest/cargo-target.html#examples) |

还有一些命令会在 `target` 下生成自己的独立目录:

| 目录 | 描述 |
| --- | --- |
| `target/doc/` |  包含通过 `cargo doc` 生成的文档 |
| `target/package/` | 包含 `cargo package` 或 `cargo publish` 生成的输出 | 

Cargo 还会创建几个用于构建过程的其它类型目录，它们的目录结构只应该被 Cargo 自身使用，因此可能会在未来发生变化:

| 目录 | 描述 |
| --- | --- |
| `target/debug/deps` | 依赖和其它输出成果 |
| `target/debug/incremental` | `rustc` [增量编译](https://course.rs/cargo/reference/profile.html#incremental)的输出，该缓存可以用于提升后续的编译速度 | 
| `target/debug/build/` | [构建脚本](https://course.rs/cargo/reference/build-script/intro.html)的输出 |

## 依赖信息文件
在每一个编译成果的旁边，都有一个依赖信息文件，文件后缀是 `.d`。该文件的语法类似于 `Makefile`，用于说明构建编译成果所需的所有依赖包。

该文件往往用于提供给外部的构建系统，这样它们就可以判断 `Cargo` 命令是否需要再次被执行。

文件中的路径默认是绝对路径，你可以通过 [`build.dep-info-basedir`](https://course.rs/cargo/reference/configuration.html#builddep-info-basedir) 配置项来修改为相对路径。

```shell
# 关于 `.d` 文件的一个示例 : target/debug/foo.d
/path/to/myproj/target/debug/foo: /path/to/myproj/src/lib.rs /path/to/myproj/src/main.rs
```

## 共享缓存
[sccache](https://github.com/mozilla/sccache) 是一个三方工具，可以用于在不同的工作空间中共享已经构建好的依赖包。

为了设置 `sccache`，首先需要使用 `cargo install sccache` 进行安装，然后在调用 `Cargo` 之前将 `RUSTC_WRAPPER` 环境变量设置为 `sccache`。

- 如果用的 `bash`，可以将 `export RUSTC_WRAPPER=sccache` 添加到 `.bashrc` 中
- 也可以使用 [`build.rustc-wrapper`](https://course.rs/cargo/reference/configuration.html#buildrustc-wrapper) 配置项

