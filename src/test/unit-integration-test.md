# 单元测试、集成测试

在了解了如何在 Rust 中写测试用例后，本章节我们将学习如何实现单元测试、集成测试，其实它们用到的技术还是[上一章节](https://course.rs/test/write-tests.html)中的测试技术，只不过对如何组织测试代码提出了新的要求。

## 单元测试

单元测试目标是测试某一个代码单元(一般都是函数)，验证该单元是否能按照预期进行工作，例如测试一个 `add` 函数，验证当给予两个输入时，最终返回的和是否符合预期。

在 Rust 中，单元测试的惯例是将测试代码的模块跟待测试的正常代码放入同一个文件中，例如 `src/lib.rs` 文件中有如下代码:

```rust
pub fn add_two(a: i32) -> i32 {
    a + 2
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        assert_eq!(add_two(2), 4);
    }
}
```

`add_two` 是我们的项目代码，为了对它进行测试，我们在同一个文件中编写了测试模块 `tests`，并使用 `#[cfg(test)]` 进行了标注。

#### 条件编译 `#[cfg(test)]`

上面代码中的 `#[cfg(test)]` 标注可以告诉 Rust 只有在 `cargo test` 时才编译和运行模块 `tests`，其它时候当这段代码是空气即可，例如在 `cargo build` 时。这么做有几个好处：

- 节省构建代码时的编译时间
- 减小编译出的可执行文件的体积

其实集成测试就不需要这个标注，因为它们被放入单独的目录文件中，而单元测试是跟正常的逻辑代码在同一个文件，因此必须对其进行特殊的标注，以便 Rust 可以识别。

在 `#[cfg(test)]` 中，`cfg` 是配置 `configuration` 的缩写，它告诉 Rust ：当 `test` 配置项存在时，才运行下面的代码，而 `cargo test` 在运行时，就会将 `test` 这个配置项传入进来，因此后面的 `tests` 模块会被包含进来。

大家看出来了吗？这是典型的条件编译，`Cargo` 会根据指定的配置来选择是否编译指定的代码，事实上关于条件编译 Rust 能做的不仅仅是这些，在 [`Cargo` 专题](https://course.rs/cargo/intro.html)中我们会进行更为详细的介绍。

#### 测试私有函数

关于私有函数能否被直接测试，编程社区里一直争论不休，甚至于部分语言可能都不支持对私有函数进行测试或者难以测试。无论你的立场如何，反正 Rust 是支持对私有函数进行测试的:

```rust
pub fn add_two(a: i32) -> i32 {
    internal_adder(a, 2)
}

fn internal_adder(a: i32, b: i32) -> i32 {
    a + b
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn internal() {
        assert_eq!(4, internal_adder(2, 2));
    }
}
```

`internal_adder` 并没有使用 `pub` 进行声明，因此它是一个私有函数。根据我们之前[学过的内容]()，`tests` 作为另一个模块，是绝对无法对它进行调用的，因为它们根本不在同一个模块中！

但是在上述代码中，我们使用 `use super::*;` 将 `tests` 的父模块中的所有内容引入到当前作用域中，这样就可以非常简单的实现对私有函数的测试。

## 集成测试

与单元测试的同吃同住不同，集成测试的代码是在一个单独的目录下的。由于它们使用跟其它模块一样的方式去调用你想要测试的代码，因此只能调用通过 `pub` 定义的 `API`，这一点与单元测试有很大的不同。

如果说单元测试是对代码单元进行测试，那集成测试则是对某一个功能或者接口进行测试，因此单元测试的通过，并不意味着集成测试就能通过：局部上反映不出的问题，在全局上很可能会暴露出来。

#### _tests_ 目录

一个标准的 Rust 项目，在它的根目录下会有一个 `tests` 目录，大名鼎鼎的 [`ripgrep`](https://github.com/BurntSushi/ripgrep) 也不能免俗。

没错，该目录就是用来存放集成测试的，Cargo 会自动来此目录下寻找集成测试文件。我们可以在该目录下创建任何文件，Cargo 会对每个文件都进行自动编译，但友情提示下，最好按照合适的逻辑来组织你的测试代码。

首先来创建一个集成测试文件 `tests/integration_test.rs` ，注意，`tests` 目录一般来说需要手动创建，该目录在项目的根目录下，跟 `src` 目录同级。然后在文件中填入如下测试代码：

```rust
use adder;

#[test]
fn it_adds_two() {
    assert_eq!(4, adder::add_two(2));
}
```

这段测试代码是对之前**私有函数**中的示例进行测试，该示例代码在 `src/lib.rs` 中。

首先与单元测试有所不同，我们并没有创建测试模块。其次，`tests` 目录下的每个文件都是一个单独的包，我们需要将待测试的包引入到当前包的作用域后: `use adder`，才能进行测试 。大家应该还记得[包和模块章节](https://course.rs/advance/crate-module/crate.html)中讲过的内容吧？在创建项目后，`src/lib.rs` 自动创建一个与项目同名的 `lib` 类型的包，由于我们的项目名是 `adder`，因此包名也是 `adder`。

因为 `tests` 目录本身就说明了它的特殊用途，因此我们无需再使用 `#[cfg(test)]` 来取悦 Cargo。后者会在运行 `cargo test` 时，对 `tests` 目录中的每个文件都进行编译运行。

```shell
$ cargo test
     Running unittests (target/debug/deps/adder-8a400aa2b5212836)

running 1 test
test tests::it_works ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

     Running tests/integration_test.rs (target/debug/deps/integration_test-2d3aeee6f15d1f20)

running 1 test
test it_adds_two ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

   Doc-tests adder

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

运行 `cargo test` ，可以看到上述输出。测试内容有三个部分：单元测试，集成测试和文档测试。

首先是单元测试被运行 `Running unittests` ，其次就是我们的主角集成测试的运行 `Running tests/integration_test.rs`，可以看出，集成测试的输出内容与单元测试并没有大的区别。最后运行的是文档测试 `Doc-tests adder`。

与单元测试类似，我们可以通过[指定名称的方式](https://course.rs/test/write-tests.html#指定运行一部分测试)来运行特定的集成测试用例:

```shell
$ cargo test --test integration_test
     Running tests/integration_test.rs (target/debug/deps/integration_test-82e7799c1bc62298)

running 1 test
test it_adds_two ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

这次，单元测试、文档测试啥的都没有运行，只有集成测试目录下的 `integration_test` 文件被顺利执行。

大家可以尝试下在同一个测试文件中添加更多的测试用例或者添加更多的测试文件，并观察测试输出会如何变化。

#### 共享模块

在集成测试的 `tests` 目录下，每一个文件都是一个独立的包，这种组织方式可以很好的帮助我们理清测试代码的关系，但是如果大家想要在多个文件中共享同一个功能该怎么做？例如函数 `setup` 可以用于状态初始化，然后多个测试包都需要使用该函数进行状态的初始化。

也许你会想要创建一个 `tests/common.rs` 文件，然后将 `setup` 函数放入其中：

```rust
pub fn setup() {
    // 初始化一些测试状态
    // ...
}
```

但是当我们运行 `cargo test` 后，会发现该函数被当作集成测试函数运行了，即使它并没有包含任何测试功能，也没有被其它测试文件所调用:

```shell
$ cargo test
     Running tests/common.rs (target/debug/deps/common-5c21f4f2c87696fb)

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

显然，这个结果并不是我们想要的。**为了避免这种输出，我们不能创建 `tests/common.rs`，而是要创建 `tests/common/mod.rs`。**，此时再运行 `cargo test` 就不会再看到相应的输出。 原因是**通过这种文件组织和命名方式， Rust 不再将 `common` 模块看作是集成测试文件。**

总结来说，**`tests` 目录下的子目录中的文件不会被当作独立的包，也不会有测试输出**。

```rust
use adder;

mod common;

#[test]
fn it_adds_two() {
    common::setup();
    assert_eq!(4, adder::add_two(2));
}
```

此时，就可以在测试中调用 `common` 中的共享函数了，不过还有一点值得注意，为了使用 `common`，这里使用了 `mod common` 的方式来声明该模块。

#### 二进制包的集成测试

目前来说，Rust 只支持对 `lib` 类型的包进行集成测试，对于二进制包例如 `src/main.rs` 是无能为力的。原因在于，我们无法在其它包中使用 `use` 引入二进制包，而只有 `lib` 类型的包才能被引入，例如 `src/lib.rs`。

这就是为何我们需要将代码逻辑从 `src/main.rs` 剥离出去放入 `lib` 包中，例如很多 Rust 项目中都同时有 `src/main.rs` 和 `src/lib.rs` ，前者中只保留代码的主体脉络部分，而具体的实现通通放在类似后者的 `lib` 包中。

这样，我们就可以对 `lib` 包中的具体实现进行集成测试，由于 `main.rs` 中的主体脉络足够简单，当集成测试通过时，意味着 `main.rs` 中相应的调用代码也将正常运行。

## 总结

Rust 提供了单元测试和集成测试两种方式来帮助我们组织测试代码以解决代码正确性问题。

单元测试针对的是具体的代码单元，例如函数，而集成测试往往针对的是一个功能或接口 API，正因为目标上的不同，导致了两者在组织方式上的不同：

- 单元测试的模块和待测试的代码在同一个文件中，且可以很方便地对私有函数进行测试
- 集成测试文件放在项目根目录下的 `tests` 目录中，由于该目录下每个文件都是一个包，我们必须要引入待测试的代码到当前包的作用域中，才能进行测试，正因为此，集成测试只能对声明为 `pub` 的 API 进行测试

下个章节，我们再来看看该如何使用 `GitHub Actions` 对 Rust 项目进行持续集成。
