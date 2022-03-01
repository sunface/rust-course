# Option

Option 类型代表可选的值：每个 Option 要么是 Some ，包含一个值；要么是 None ，表示空值。
Option 在 Rust 代码中十分常见，因为它有许多用途：
- 初始值
- 输入值不符合定义的情况下作为函数的返回值（部分函数）。
- 返回 None 作为简单错误的返回值
- 可选的结构字段
- 可以借用或 "取走" 的结构字段（的值）
- 可选的函数参数
- 空指针
- 在某些情况下交换值*

译注：“在某些情况下交换值”可以假设有个可变数组，现在要通过两个可变引用来交换其中两个元素的值。但 Rust 显然不允许有两个对数组的可变引用，这时候可以用 Option 包装下元素值，比如：

``` rust
fn main() {
    let mut array = vec![Some(1), Some(2)];
    let a = array.get_mut(0).unwrap().take().unwrap();
    let b = array.get_mut(1).unwrap().replace(a);
    *array.get_mut(0).unwrap() = b;
    println!("{:?}", array);// [Some(2), Some(1)]
}
```

嘿嘿，有点强行了。
[示例参考](https://zulip-archive.rust-lang.org/stream/122651-general/topic/.60Option.60.20.22swapping.20things.20out.20of.20difficult.20situations.22.3F.html)
[关于 Option 的描述来自于](https://doc.rust-lang.org/std/option/)

## 更多信息

- [Option Enum Format](https://doc.rust-lang.org/stable/book/ch10-01-syntax.html#in-enum-definitions)
- [Option Module Documentation](https://doc.rust-lang.org/std/option/)
- [Option Enum Documentation](https://doc.rust-lang.org/std/option/enum.Option.html)
