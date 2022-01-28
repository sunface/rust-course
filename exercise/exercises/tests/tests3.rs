// tests3.rs
// 这个测试不是在测试我们的函数——想些方法让它的返回值可以通过测试。
// 在第二个测试判断调用 `is_even(5)` 是否得到了预期的结果。
// 执行 `rustlings hint tests3` 获取提示 :)

// I AM NOT DONE

pub fn is_even(num: i32) -> bool {
    num % 2 == 0
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn is_true_when_even() {// 偶数将返回 true
        assert!();
    }

    #[test]
    fn is_false_when_odd() {// 奇数将返回 false
        assert!();
    }
}
