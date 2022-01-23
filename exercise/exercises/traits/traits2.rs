// traits2.rs
//
// 你的任务是为一个字符串 vector 实现 `AppendBar` trait。
//
// 为了实现该 trait，请思考下将 "Bar" 追加到字符串 vector 的意义是什么？ 
//
// 这次没有样板代码，相信自己！ 

// I AM NOT DONE

trait AppendBar {
    fn append_bar(self) -> Self;
}

//TODO：在这编写代码

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn is_vec_pop_eq_bar() {
        let mut foo = vec![String::from("Foo")].append_bar();
        assert_eq!(foo.pop().unwrap(), String::from("Bar"));
        assert_eq!(foo.pop().unwrap(), String::from("Foo"));
    }
}
