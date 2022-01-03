// if1.rs

// I AM NOT DONE

pub fn bigger(a: i32, b: i32) -> i32 {
    // 完成这个返回更大数字的函数！
    // 但不允许以下方式：
    // - 调用其它函数
    // - 额外变量
    // 执行 `rustex hint if1` 获取提示
}

// 暂时不要在意它 :)
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn ten_is_bigger_than_eight() {
        assert_eq!(10, bigger(10, 8));
    }

    #[test]
    fn fortytwo_is_bigger_than_thirtytwo() {
        assert_eq!(42, bigger(32, 42));
    }
}
