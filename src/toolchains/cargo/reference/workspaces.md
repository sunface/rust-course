# 工作空间 Workspace

一个工作空间是由多个 `package` 组成的集合，它们共享同一个 `Cargo.lock` 文件、输出目录和一些设置(例如 profiles : 编译器设置和优化)。组成工作空间的 `packages` 被称之为工作空间的成员。

## 工作空间的两种类型

工作空间有两种类型：`root package` 和虚拟清单( virtual manifest )。

#### 根 package

**若一个 `package` 的 `Cargo.toml` 包含了`[package]` 的同时又包含了 `[workspace]` 部分，则该 `package` 被称为工作空间的根 `package`**。

换而言之，一个工作空间的根( root )是该工作空间的 `Cargo.toml` 文件所在的目录。

举个例子，我们现在有多个 `package`，它们的目录是嵌套关系，然后我们在最外层的 `package`，也就是最外层目录中的 `Cargo.toml` 中定义一个 `[workspace]`，此时这个最外层的 `package` 就是工作空间的根。

再举个例子，大名鼎鼎的 [ripgrep](https://github.com/BurntSushi/ripgrep/blob/master/Cargo.toml) 就在最外层的 `package` 中定义了 `[workspace]` :

```toml
[workspace]
members = [
  "crates/globset",
  "crates/grep",
  "crates/cli",
  "crates/matcher",
  "crates/pcre2",
  "crates/printer",
  "crates/regex",
  "crates/searcher",
  "crates/ignore",
]
```

那么[最外层的目录](https://github.com/BurntSushi/ripgrep)就是 `ripgrep` 的工作空间的根。

#### 虚拟清单

若一个 `Cargo.toml` 有 `[workspace]` 但是没有 `[package]` 部分，则它是虚拟清单类型的工作空间。

**对于没有主 `package` 的场景或你希望将所有的 `package` 组织在单独的目录中时，这种方式就非常适合。**

例如 [rust-analyzer](https://github.com/rust-analyzer/rust-analyzer) 就是这样的项目，它的根目录中的 `Cargo.toml` 中并没有 `[package]`，说明该根目录不是一个 `package`，但是却有 `[workspace]` :

```toml
[workspace]
members = ["xtask/", "lib/*", "crates/*"]
exclude = ["crates/proc_macro_test/imp"]
```

结合 rust-analyzer 的目录布局可以看出，**该工作空间的所有成员 `package` 都在单独的目录中，因此这种方式很适合虚拟清单的工作空间。**

## 关键特性

工作空间的几个关键点在于:

- 所有的 `package` 共享同一个 `Cargo.lock` 文件，该文件位于工作空间的根目录中
- 所有的 `package` 共享同一个[输出目录](https://course.rs/toolchains/cargo/guide/build-cache.html)，该目录默认的名称是 `target` ，位于工作空间根目录下
- 只有工作空间根目录的 `Cargo.toml` 才能包含 `[patch]`, `[replace]` 和 `[profile.*]`，而成员的 `Cargo.toml` 中的相应部分将被自动忽略

## [workspace]

`Cargo.toml` 中的 `[workspace]` 部分用于定义哪些 `packages` 属于工作空间的成员:

```toml
[workspace]
members = ["member1", "path/to/member2", "crates/*"]
exclude = ["crates/foo", "path/to/other"]
```

若某个本地依赖包是通过 [`path`](https://course.rs/toolchains/cargo/reference/specify-deps.html#通过路径引入本地依赖包) 引入，且该包位于工作空间的目录中，则该包自动成为工作空间的成员。

剩余的成员需要通过 `workspace.members` 来指定，里面包含了各个成员所在的目录(成员目录中包含了 Cargo.toml )。

`members` 还支持使用 [`glob`](https://docs.rs/glob/0.3.0/glob/struct.Pattern.html) 来匹配多个路径，例如上面的例子中使用 `crates/*` 匹配 `crates` 目录下的所有包。

`exclude` 可以将指定的目录排除在工作空间之外，例如还是上面的例子，`crates/*` 在包含了 `crates` 目录下的所有包后，又通过 `exclude` 中 `crates/foo` 将 `crates` 下的 `foo` 目录排除在外。

你也可以将一个空的 `[workspace]` 直接联合 `[package]` 使用，例如：

```toml
[package]
name = "hello"
version = "0.1.0"

[workspace]
```

此时的工作空间的成员包含:

- 根 `package` : "hello"
- 所有通过 `path` 引入的本地依赖(位于工作空间目录下)

## 选择工作空间

选择工作空间有两种方式：`Cargo` 自动查找、手动指定 `package.workspace` 字段。

当位于工作空间的子目录中时，`Cargo` 会自动在该目录的父目录中寻找带有 `[workspace]` 定义的 `Cargo.toml`，然后再决定使用哪个工作空间。

我们还可以使用下面的方法来覆盖 `Cargo` 自动查找功能：将成员包中的 `package.workspace` 字段修改为工作区间根目录的位置，这样就能显式地让一个成员使用指定的工作空间。

当成员不在工作空间的子目录下时，这种手动选择工作空间的方法就非常适用。毕竟 `Cargo` 的自动搜索是沿着父目录往上查找，而成员并不在工作空间的子目录下，这意味着顺着成员的父目录往上找是无法找到该工作空间的 `Cargo.toml` 的，此时就只能手动指定了。

## 选择 package

在工作空间中，`package` 相关的 `Cargo` 命令(例如 `cargo build` )可以使用 `-p` 、 `--package` 或 `--workspace` 命令行参数来指定想要操作的 `package`。

若没有指定任何参数，则 `Cargo` 将使用当前工作目录的中的 `package` 。若工作目录是虚拟清单类型的工作空间，则该命令将作用在所有成员上(就好像是使用了 `--workspace` 命令行参数)。而 `default-members` 可以在命令行参数没有被提供时，手动指定操作的成员:

```toml
[workspace]
members = ["path/to/member1", "path/to/member2", "path/to/member3/*"]
default-members = ["path/to/member2", "path/to/member3/foo"]
```

这样一来， `cargo build` 就不会应用到虚拟清单工作空间的所有成员，而是指定的成员上。

## workspace.metadata

与 [package.metadata](https://course.rs/toolchains/cargo/reference/manifest.html#metadata) 非常类似，`workspace.metadata` 会被 `Cargo` 自动忽略，就算没有被使用也不会发出警告。

这个部分可以用于让工具在 `Cargo.toml` 中存储一些工作空间的配置元信息。例如:

```toml
[workspace]
members = ["member1", "member2"]

[workspace.metadata.webcontents]
root = "path/to/webproject"
tool = ["npm", "run", "build"]
# ...
```
