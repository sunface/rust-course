# 条件编译Features
`Cargo Feature` 是非常强大的机制，可以为大家提供[条件编译](https://doc.rust-lang.org/stable/reference/conditional-compilation.html)和可选依赖的高级特性。

## [features]
`Featuure` 可以通过 `Cargo.toml` 中的 `[features]` 部分来定义：其中每个 `feature` 通过列表的方式指定了它所能启用的其他 `feature` 或可选依赖。

假设我们有一个 2D 图像处理库，然后该库所支持的图片格式可以通过以下方式启用：
```toml
[features]
# 定义一个 feature : webp, 但它并没有启用其它 feature
webp = []
```

当定义了 `webp` 后，我们就可以在代码中通过 [`cfg` 表达式](https://doc.rust-lang.org/stable/reference/conditional-compilation.html)来进行条件编译。例如项目中的 `lib.rs` 可以使用以下代码对 `webp` 模块进行条件引入:
```toml
#[cfg(feature = "webp")]
pub mod webp;
```

`#[cfg(feature = "webp")]` 的含义是：只有在 `webp` feature 被定义后，以下的 `webp` 模块才能被引入进来。由于我们之前在 `[features]` 里定义了 `webp`，因此以上代码的 `webp` 模块会被成功引入。

在 `Cargo.toml` 中定义的 `feature` 会被 `Cargo` 通过命令行参数 `--cfg` 传给 `rustc`，最终由后者完成编译：`rustc --cfg ...`。若项目中的代码想要测试 `feature` 是否存在，可以使用 [`cfg` 属性](https://doc.rust-lang.org/stable/reference/conditional-compilation.html#the-cfg-attribute)或 [`cfg` 宏](https://doc.rust-lang.org/stable/std/macro.cfg.html)。

之前我们提到了一个 `feature` 还可以开启其他 `feature`，举个例子，例如 `ICO` 图片格式包含 `BMP` 和 `PNG`，因此当 `ICO` 图片格式被启用后，它还得确保启用 `BMP` 和 `PNG` 格式：
```toml
[features]
bmp = []
png = []
ico = ["bmp", "png"]
webp = []
```

对此，我们可以理解为： **`bmp` 和 `png` 是开启 `ico` 的先决条件**。

Feature 名称可以包含来自 [Unicode XID standard]() 定义的字母，允许使用 `_` 或 `0-9` 的数字作为起始字符，在起始字符后，还可以使用 `-`、`+` 或 `.` 。

但是我们**还是推荐按照 crates.io 的方式来设置 Feature 名称** : `crate.io` 要求名称只能由 ASCII 字母数字、`_`、`-` 或 `+` 组成。

## default feature
默认情况下，所有的 `feature` 都会被自动禁用，可以通过 `default` 来启用它们：
```toml
[features]
default = ["ico", "webp"]
bmp = []
png = []
ico = ["bmp", "png"]
webp = []
```

使用如上配置的项目被构建时，`default` feature 首先会被启用，然后它接着启用了 `ico` 和 `webp` feature，当然我们还可以关闭 `default`：

- `--no-default-features` 命令行参数可以禁用 `default` feature
- `default-features = false` 选项可以在依赖声明中指定

> 当你要去改变某个依赖库的 `default` 启用的 feature 列表时(例如觉得该库引入的 feature 过多，导致最终编译出的文件过大)，需要格外的小心，因为这可能会导致某些功能的缺失

## 可选依赖
当依赖被标记为 "可选 optional" 时，意味着它默认不会被编译。假设我们的 2D 图片处理库需要用到一个外部的包来处理 GIF 图片：
```toml
[dependencies]
gif = { version = "0.11.1", optional = true }
```

**这种可选依赖的写法会自动定义一个与依赖同名的 feature，也就是 `gif` feature**，这样一来，当我们启用 `gif` feautre时，该依赖库也会被自动引入并启用：例如通过 `--feature gif` 的方式启用 feauture。

> 注意：目前来说，`[fetuare]` 中定义的 feature 还不能与已引入的依赖库同名。但是在 `nightly` 中已经提供了实验性的功能用于改变这一点: [namespaced features](https://doc.rust-lang.org/stable/cargo/reference/unstable.html#namespaced-features)

当然，**我们还可以通过显式定义 feature 的方式来启用这些可选依赖库**，例如为了支持 `AVIF` 图片格式，我们需要引入两个依赖包，由于 `AVIF` 是通过 feature 引入的可选格式，因此它依赖的两个包也必须声明为可选的:
```toml
[dependencies]
ravif = { version = "0.6.3", optional = true }
rgb = { version = "0.8.25", optional = true }

[features]
avif = ["ravif", "rgb"]
```

之后，`avif` feature 一旦被启用，那这两个依赖库也将自动被引入。

> 注意：我们之前也讲过条件引入依赖的方法，那就是使用[平台相关的依赖](https://course.rs/cargo/reference/specify-deps.html#根据平台引入依赖)，与基于 feature 的可选依赖不同，它们是基于特定平台的可选依赖

## 依赖库自身的 feature
就像我们的项目可以定义 `feature` 一样，依赖库也可以定义它自己的 feature、也有需要启用的 feature 列表，当引入该依赖库时，我们可以通过以下方式为其启用相关的 features :
```toml
[dependencies]
serde = { version = "1.0.118", features = ["derive"] }
```

以上配置为 `serde` 依赖开启了 `derive` feature，还可以通过 `default-features = false` 来禁用依赖库的 `default` feature :
```toml
[dependencies]
flate2 = { version = "1.0.3", default-features = false, features = ["zlib"] }
```

这里我们禁用了 `flate2` 的 `default` feature，但又手动为它启用了 `zlib` feature。

> 注意：这种方式未必能成功禁用 `default`，原因是可能会有其它依赖也引入了 `flate2`，并且没有对 `default` 进行禁用，那此时 `default` 依然会被启用。
>
> 查看下文的 [feature同一化](#feature同一化) 获取更多信息

除此之外，还能通过下面的方式来间接开启依赖库的 feature :
```toml
[dependencies]
jpeg-decoder = { version = "0.1.20", default-features = false }

[features]
# Enables parallel processing support by enabling the "rayon" feature of jpeg-decoder.
parallel = ["jpeg-decoder/rayon"]
```

如上所示，我们定义了一个 `parallel` feature，同时为其启用了 `jpeg-decoder` 依赖的 `rayon` feature。

> 注意: 上面的 "package-name/feature-name" 语法形式不仅会开启指定依赖的指定 feature，若该依赖是可选依赖，那还会自动将其引入
>
> 在 `nightly` 版本中，可以对这种行为进行禁用：[weak dependency features]("package-name/feature-name")

## 通过命令行参数启用feature
以下的命令行参数可以启用指定的 `feature` :

- `--features FEATURES`: 启用给出的 feature 列表，可以使用逗号或空格进行分隔，若你是在终端中使用，还需要加上双引号，例如 `--features "foo bar"`。 若在工作空间中构建多个 `package`，可以使用 `package-name/feature-name` 为特定的成员启用 features
- `--all-features`: 启用命令行上所选择的所有包的所有 features
- `--no-default-features`: 对选择的包禁用 `default` featue

## feature同一化
`feature` 只有在定义的包中才是唯一的，不同包之间的 `feature` 允许同名。因此，在一个包上启用 `feature` 不会导致另一个包的同名 `feature` 被误启用。

当一个依赖被多个包所使用时，这些包对该依赖所设置的 `feature` 将被进行合并，这样才能确保该依赖只有一个拷贝存在，大家可以查看[这里](https://doc.rust-lang.org/stable/cargo/reference/resolver.html#features)了解下解析器如何对 feature 进行解析处理。

这里，我们使用 `winapi` 为例来说明这个过程。首先，`winapi` 使用了大量的 `features`；然后我们有两个包 `foo` 和 `bar` 分别使用了它的两个 features，那么在合并后，最终 `winapi` 将同时启四个 features :

<img src="https://pic2.zhimg.com/80/v2-251973b0cc83f35cd6858bf21dd00ed6_1440w.png" />

由于这种不可控性，我们需要让 `启用feature  = 添加特性` 这个等式成立，换而言之，**启用一个 feature 不应该导致某个功能被禁止**。这样才能的让多个包启用同一个依赖的不同features。

例如，如果我们想可选的支持 `no_std` 环境(不使用标准库)，那么有两种做法：

- 默认代码使用标准库的，当该 `no_std` feature 启用时，禁用相关的标准库代码
- 默认代码使用非标准库的，当 `std` feature 启用时，才使用标准库的代码

前者就是功能削减，与之相对，后者是功能添加，根据之前的内容，我们应该选择后者的做法：
```rust
#![no_std]

#[cfg(feature = "std")]
extern crate std;

#[cfg(feature = "std")]
pub fn function_that_requires_std() {
    // ...
}
```
