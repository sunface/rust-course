# 测试和 CI

Cargo 可以通过 `cargo test` 命令运行项目中的测试文件：它会在 `src/` 底下的文件寻找单元测试，也会在 `tests/` 目录下寻找集成测试。

```rust
$ cargo test
   Compiling regex v1.5.0 (https://github.com/rust-lang/regex.git#9f9f693)
   Compiling hello_world v0.1.0 (file:///path/to/package/hello_world)
     Running target/test/hello_world-9c2b65bbb79eabce

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

从上面结果可以看出，项目中实际上还没有任何测试代码。

事实上，除了单元测试、集成测试，`cargo test` 还会编译 `examples/` 下的示例文件以及[文档中的示例](https://course.rs/basic/comment.html#文档测试doc-test)。

如果希望深入学习如何在 Rust 编写及运行测试，请查阅[该章节](https://course.rs/test/intro.html)。

## CI

持续集成是软件开发中异常重要的一环，大家应该都听说过 Jenkins，它就是一个拥有悠久历史的持续集成工具。简单来说，持续集成会定期拉取同一个项目中所有成员的相关代码，对其进行自动化构建。

在没有持续集成前，首先开发者需要手动编译代码并运行单元测试、集成测试等基础测试，然后启动项目相关的所有服务，接着测试人员开始介入对整个项目进行回归测试、黑盒测试等系统化的测试，当测试通过后，最后再手动发布到指定的环境中运行，这个过程是非常冗长，且所有成员都需要同时参与的。

在有了持续集成后，只要编写好相应的编译、测试、发布配置文件，那持续集成平台会自动帮助我们完成整个相关的流程，期间无需任何人介入，高效且可靠。

#### GitHub Actions

关于如何使用 `GitHub Actions` 进行持续集成，在[之前的章节](https://course.rs/test/ci.html)已经有过详细的介绍，这里就不再赘述。

#### Travis CI

以下是 `Travis CI` 需要的一个简单的示例配置文件:

```yml
language: rust
rust:
  - stable
  - beta
  - nightly
matrix:
  allow_failures:
    - rust: nightly
```

以上配置将测试所有的 [Rust 发布版本](https://course.rs/appendix/rust-version.html)，但是 `nightly` 版本的构建失败不会导致全局测试的失败，可以查看 [Travis CI Rust 文档](https://docs.travis-ci.com/user/languages/rust/) 获取更详细的说明。

#### Gitlab CI

以下是一个示例 `.gitlab-ci.yml` 文件:

```yml
stages:
  - build

rust-latest:
  stage: build
  image: rust:latest
  script:
    - cargo build --verbose
    - cargo test --verbose

rust-nightly:
  stage: build
  image: rustlang/rust:nightly
  script:
    - cargo build --verbose
    - cargo test --verbose
  allow_failure: true
```

这里将测试 `stable` 和 `nightly` 发布版本，同样的，`nightly` 下的测试失败不会导致全局测试的失败。查看 [Gitlab CI 文档](https://docs.gitlab.com/ee/ci/yaml/index.html) 获取更详细的说明。
