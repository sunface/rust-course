// errors1.rs
// 假使你传给这个函数一个空字符串，那么它将拒绝生成一段个性签名（nametage）。
// 如果它能解释拒绝的原因是什么，而不是粗暴返回 `None` 那就更完美了。
// 第 2 个测试目前还没通过并未能编译，但它说明了我们希望这个函数具有的行为。
// 执行 `rustlings hint errors1` 获取提示！

// I AM NOT DONE

pub fn generate_nametag_text(name: String) -> Option<String> {// 译：生成个性签名
    if name.len() > 0 {
        Some(format!("Hi! My name is {}", name))// 译："嗨！我的名字是 {}"
    } else {
        // 不允许使用空的名字。
        None
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // 你可以注释掉第 2 个测试，那么这个测试就能初步通过。
    // 当你更改了测试的函数时，也需要修改下测试代码以使测试正确！
    #[test]
    fn generates_nametag_text_for_a_nonempty_name() {// 译：用一个非空名称生成一段个性签名
        assert_eq!(
            generate_nametag_text("Beyoncé".into()),
            Some("Hi! My name is Beyoncé".into())
        );
    }

    #[test]
    fn explains_why_generating_nametag_text_fails() {// 译：说明为什么个性签名生成失败了
        assert_eq!(
            generate_nametag_text("".into()),
            Err("`name` was empty; it must be nonempty.".into())
        );
    }
}
