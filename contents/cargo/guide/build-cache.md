# Cargo构建缓存
Cargo 使用了缓存的方式提升构建效率，当构建时，Cargo 会将已下载的依赖包放在 `CARGO_HOME` 目录下，下面一起来看看。

## Cargo Home
默认情况下，Cargo Home 所在的目录是 `$HOME/.cargo/`，例如在 `macos` ，对应的目录是:
```shell
$ echo $HOME/.cargo/
/Users/sunfei/.cargo/
```

我们也可以通过修改 `CARGO_HOME` [环境变量](https://course.rs/cargo/reference/env.html)的方式来重新设定该目录的位置