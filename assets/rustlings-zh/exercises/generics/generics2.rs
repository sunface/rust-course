// 这个强大的 Wrapper 拥有存储一个正整数值的能力。
// 利用泛型重写它，使它支持包装（wrapping）任何类型的值。

// 执行 `rustlings hint generics2` 获取提示！

// I AM NOT DONE

struct Wrapper {
    value: u32,
}

impl Wrapper {
    pub fn new(value: u32) -> Self {
        Wrapper { value }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn store_u32_in_wrapper() {
        assert_eq!(Wrapper::new(42).value, 42);
    }

    #[test]
    fn store_str_in_wrapper() {
        assert_eq!(Wrapper::new("Foo").value, "Foo");
    }
}
