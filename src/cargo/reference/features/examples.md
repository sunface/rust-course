# Features 示例

以下我们一起来看看一些来自真实世界的示例。

### 最小化构建时间和文件大小

如果一些包的部分特性不再启用，就可以减少该包占用的大小以及编译时间:

- [`syn`](https://crates.io/crates/syn) 包可以用来解析 Rust 代码，由于它很受欢迎，大量的项目都在引用，因此它给出了[非常清晰的文档](https://docs.rs/syn/1.0.54/syn/#optional-features)关于如何最小化使用它包含的 `features`
- [`regex`](https://crates.io/crates/regex) 也有关于 features 的[描述文档](https://docs.rs/regex/1.4.2/regex/#crate-features)，例如移除 Unicode 支持的 feature 可以降低最终生成可执行文件的大小
- [`winapi`](https://crates.io/crates/winapi) 拥有[众多 features](https://github.com/retep998/winapi-rs/blob/0.3.9/Cargo.toml#L25-L431)，这些 `feature` 对用了各种 Windows API，你可以只引入代码中用到的 API 所对应的 feature.

### 行为扩展

[`serde_json`](https://crates.io/crates/serde_json) 拥有一个 [`preserve_order` feature](https://github.com/serde-rs/json/blob/v1.0.60/Cargo.toml#L53-L56)，可以用于在序列化时保留 JSON 键值对的顺序。同时，该 feature 还会启用一个可选依赖 [indexmap](https://crates.io/crates/indexmap)。

当这么做时，一定要小心不要破坏了 SemVer 的版本兼容性，也就是说：启用 feature 后，代码依然要能正常工作。

### no_std 支持

一些包希望能同时支持 [`no_std`](https://doc.rust-lang.org/stable/reference/names/preludes.html#the-no_std-attribute) 和 `std` 环境，例如该包希望支持嵌入式系统或资源紧张的系统，且又希望能支持其它的平台，此时这种做法是非常有用的，因为标准库 `std` 会大幅增加编译出来的文件的大小，对于资源紧张的系统来说，`no_std` 才是最合适的。

[wasm-bindgen](https://crates.io/crates/wasm-bindgen) 定义了一个 [std feature](https://github.com/rustwasm/wasm-bindgen/blob/0.2.69/Cargo.toml#L25)，它是[默认启用的](https://github.com/rustwasm/wasm-bindgen/blob/0.2.69/Cargo.toml#L25)。首先，在库的顶部，它[无条件的启用了 `no_std` 属性](https://github.com/rustwasm/wasm-bindgen/blob/0.2.69/src/lib.rs#L8)，它可以确保 `std` 和 [`std prelude`](https://doc.rust-lang.org/stable/std/prelude/index.html) 不会自动引入到作用域中来。其次，在不同的地方([示例 1](https://doc.rust-lang.org/stable/std/prelude/index.html)，[示例 2](https://github.com/rustwasm/wasm-bindgen/blob/0.2.69/src/lib.rs#L67-L75))，它通过 `#[cfg(feature = "std")]` 启用 `std` feature 来添加 `std` 标准库支持。

## 对依赖库的 features 进行再导出

从依赖库再导出 features 在有些场景中会相当有用，这样用户就可以通过依赖包的 features 来控制功能而不是自己去手动定义。

例如 [`regex`](https://crates.io/crates/regex) 将 [`regex_syntax`](https://github.com/rust-lang/regex/blob/1.4.2/regex-syntax/Cargo.toml#L17-L32) 包的 features 进行了[再导出](https://github.com/rust-lang/regex/blob/1.4.2/Cargo.toml#L65-L89)，这样 `regex` 的用户无需知道 `regex_syntax` 包，但是依然可以访问后者包含的 features。

## feature 优先级

一些包可能会拥有彼此互斥的 features(无法共存，上一章节中有讲到)，其中一个办法就是为 feature 定义优先级，这样其中一个就会优于另一个被启用。

例如 [`log`](https://crates.io/crates/log) 包，它有[几个 features](https://github.com/rust-lang/log/blob/0.4.11/Cargo.toml#L29-L42) 可以用于在编译期选择最大的[日志级别](https://docs.rs/log/0.4.11/log/#compile-time-filters)，这里，它就使用了 [`cfg-if`](https://crates.io/crates/cfg-if) 的方式来[设置优先级](https://github.com/rust-lang/log/blob/0.4.11/src/lib.rs#L1422-L1448)。一旦多个 `features` 被启用，那更高优先级的就会优先被启用。

## 过程宏包

一些包拥有过程宏，这些宏必须定义在一个独立的包中。但是不是所有的用户都需要过程宏的，因此也无需引入该包。

在这种情况下，将过程宏所在的包定义为可选依赖，是很不错的选择。这样做还有一个好处：有时过程宏的版本必须要跟父包进行同步，但是我们又不希望所有的用户都进行同步。

其中一个例子就是 [serde](https://crates.io/crates/serde) ，它有一个 [derive](https://github.com/serde-rs/serde/blob/v1.0.118/serde/Cargo.toml#L34-L35) feature 可以启用 [serde_derive](https://crates.io/crates/serde_derive) 过程宏。由于 `serde_derive` 包跟 `serde` 的关系非常紧密，因此它使用了[版本相同的需求](https://github.com/serde-rs/serde/blob/v1.0.118/serde/Cargo.toml#L17)来保证两者的版本同步性。

## 只能用于 nightly 的 feature

Rust 有些实验性的 API 或语言特性只能在 nightly 版本下使用，但某些使用了这些 API 的包并不想强制他们的用户也使用 `nightly` 版本，因此他们会通过 feature 的方式来控制。

若用户希望使用这些 API 时，需要启用相应的 feature ，而这些 feature 只能在 nightly 下使用。若用户不需要使用这些 API，就无需开启 相应的 feature，自然也不需要使用 nightly 版本。

例如 [`rand`](https://crates.io/crates/rand) 包有一个 [simd_support](https://github.com/rust-random/rand/blob/0.7.3/Cargo.toml#L40) feature 就只能在 nightly 下使用，若我们不使用该 feature，则在 stable 下依然可以使用 `rand`。

## 实验性 feature

有一些包会提前将一些实验性的 API 放出去，既然是实验性的，自然无法保证其稳定性。在这种情况下，通常会在文档中将相应的 features 标记为实验性，意味着它们在未来可能会发生大的改变(甚至 minor 版本都可能发生)。

其中一个例子是 [async-std](https://crates.io/crates/async-std) 包，它拥有一个 [unstable feature](https://github.com/async-rs/async-std/blob/v1.8.0/Cargo.toml#L38-L42)，用来[标记一些新的 API](https://github.com/async-rs/async-std/blob/v1.8.0/src/macros.rs#L46)，表示人们已经可以选择性的使用但是还没有准备好去依赖它。

