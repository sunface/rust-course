# Cargo.toml vs Cargo.lock

`Cargo.toml` 和 `Cargo.lock` 是 `Cargo` 的两个元配置文件，但是它们拥有不同的目的:

- 前者从用户的角度出发来描述项目信息和依赖管理，因此它是由用户来编写
- 后者包含了依赖的精确描述信息，它是由 `Cargo` 自行维护，因此不要去手动修改

它们的关系跟 `package.json` 和 `package-lock.json` 非常相似，从 JavaScript 过来的同学应该会比较好理解。

## 是否上传本地的 `Cargo.lock`

当本地开发时，`Cargo.lock` 自然是非常重要的，但是当你要把项目上传到 `Git` 时，例如 `Github`，那是否上传 `Cargo.lock` 就成了一个问题。

关于是否上传，有如下经验准则:

- 从实践角度出发，如果你构建的是三方库类型的服务，请把 `Cargo.lock` 加入到 `.gitignore` 中。
- 若构建的是一个面向用户终端的产品，例如可以像命令行工具、应用程一样执行，那就把 `Cargo.lock` 上传到源代码目录中。

例如 [`axum`](https://github.com/tokio-rs/axum) 是 web 开发框架，它属于三方库类型的服务，因此源码目录中不应该出现 `Cargo.lock` 的身影，它的归宿是 `.gitignore`。而 [`ripgrep`](https://github.com/BurntSushi/ripgrep) 则恰恰相反，因为它是一个面向终端的产品，可以直接运行提供服务。

**那么问题来了，为何会有这种选择？**

原因是 `Cargo.lock` 会详尽描述上一次成功构建的各种信息：环境状态、依赖、版本等等，Cargo 可以使用它提供确定性的构建环境和流程，无论何时何地。这种特性对于终端服务是非常重要的：能确定、稳定的在用户环境中运行起来是终端服务最重要的特性之一。

而对于三方库来说，情况就有些不同。它不仅仅被库的开发者所使用，还会间接影响依赖链下游的使用者。用户引入了三方库是不会去看它的 `Cargo.lock` 信息的，也不应该受这个库的确定性运行条件所限制。

还有个原因，在项目中，可能会有几个依赖库引用同一个三方库的同一个版本，那如果该三方库使用了 `Cargo.lock` 文件，那可能三方库的多个版本会被引入使用，这时就会造成版本冲突。换句话说，通过指定版本的方式引用一个依赖库是无法看到该依赖库的完整情况的，而只有终端的产品才会看到这些完整的情况。

## 假设没有 `Cargo.lock`

`Cargo.toml` 是一个清单文件( `manifest` )包含了我们 `package` 的描述元数据。例如，通过以下内容可以说明对另一个 `package` 的依赖 :

```rust
[package]
name = "hello_world"
version = "0.1.0"

[dependencies]
regex = { git = "https://github.com/rust-lang/regex.git" }
```

可以看到，只有一个依赖，且该依赖的来源是 `Github` 上一个特定的仓库。由于我们没有指定任何版本信息，`Cargo` 会自动拉取该依赖库的最新版本( `master` 或 `main` 分支上的最新 `commit` )。

这种使用方式，其实就错失了包管理工具的最大的优点：版本管理。例如你在今天构建使用了版本 `A`，然后过了一段时间后，由于依赖包的升级，新的构建却使用了大更新版本 `B`，结果因为版本不兼容，导致了构建失败。

可以看出，确保依赖版本的确定性是非常重要的:

```rust
[dependencies]
regex = { git = "https://github.com/rust-lang/regex.git", rev = "9f9f693" }
```

这次，我们使用了指定 `rev` ( `revision` ) 的方式来构建，那么不管未来何时再次构建，使用的依赖库都会是该 `rev` ，而不是最新的 `commit`。

但是，这里还有一个问题：`rev` 需要手动的管理，你需要在每次更新包的时候都思考下 `SHA-1`，这显然非常麻烦。

## 当有了 `Cargo.lock` 后

当有了 `Cargo.lock` 后，我们无需手动追踪依赖库的 `rev`，`Cargo` 会自动帮我们完成，还是之前的清单:

```rust
[package]
name = "hello_world"
version = "0.1.0"

[dependencies]
regex = { git = "https://github.com/rust-lang/regex.git" }
```

第一次构建时，`Cargo` 依然会拉取最新的 `master commit`，然后将以下信息写到 `Cargo.lock` 文件中:

```rust
[[package]]
name = "hello_world"
version = "0.1.0"
dependencies = [
 "regex 1.5.0 (git+https://github.com/rust-lang/regex.git#9f9f693768c584971a4d53bc3c586c33ed3a6831)",
]

[[package]]
name = "regex"
version = "1.5.0"
source = "git+https://github.com/rust-lang/regex.git#9f9f693768c584971a4d53bc3c586c33ed3a6831"
```

可以看出，其中包含了依赖库的准确 `rev` 信息。当未来再次构建时，只要项目中还有该 `Cargo.lock` 文件，那构建依然会拉取同一个版本的依赖库，并且再也无需我们手动去管理 `rev` 的 `SHA` 信息!

## 更新依赖

由于 `Cargo.lock` 会锁住依赖的版本，你需要通过手动的方式将依赖更新到新的版本：

```rust
$ cargo update            # 更新所有依赖
$ cargo update -p regex   # 只更新 “regex”
```

以上命令将使用新的版本信息重新生成 `Cargo.lock` ，需要注意的是 `cargo update -p regex` 传递的参数实际上是一个 `Package ID`， `regex` 只是一个简写形式。
