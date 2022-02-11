// primitive_types6.rs
// 使用元组索引（tuple index）来访问 `numbers` 的第二个元素。
// 你可以把第二个元素的表达式放在 ??? 处，这样测试就会通过。
// 执行 `rustex hint primitive_types6` 获取提示！

// I AM NOT DONE

#[test]
fn indexing_tuple() {
    let numbers = (1, 2, 3);
    // 用元组索引的语法替换下面的 ???
    let second = ???;

    assert_eq!(2, second,
        "This is not the 2nd number in the tuple!")// 译：这不是元组中的第二个数字!
}
