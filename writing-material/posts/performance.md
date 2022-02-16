## books
1. [Rust性能之书](https://nnethercote.github.io/perf-book/title-page.html)
2. [How to write fast rust code](https://likebike.com/posts/How_To_Write_Fast_Rust_Code.html#emit-asm)


## crates
1. [高性能Mutex库](https://github.com/Amanieu/parking_lot)

## 不要通过环境变量来控制在不同环境下的tracing行为

这种控制消耗很大，随着rust 1.57.0版本发布，可以使用自定义cargo profile的方式来实现

cargo profile可以做：
Enable costlier tracing/logging/debug on staging builds, or force LTO only for production builds.


为何不要用环境变量来控制tracing库的行为:
If your app is in any way performance sensitive you are carrying a significant cost for that.