// traits1.rs
// 是时候来实现些 trait 了！
//
// 你的任务是为 `String` 实现 `AppendBar` trait。
//
// `AppendBar` 只有一个函数，它将 "Bar" 追加到任何实现该 trait 的对象上。
// 译：Append 有追加、附加的意思，所以“追加/附加 Bar”。

// I AM NOT DONE

trait AppendBar {
    fn append_bar(self) -> Self;
}

impl AppendBar for String {
    // 在这里编写代码
}

fn main() {
    let s = String::from("Foo");
    let s = s.append_bar();
    println!("s: {}", s);
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn is_foo_bar() {
        assert_eq!(String::from("Foo").append_bar(), String::from("FooBar"));
    }

    #[test]
    fn is_bar_bar() {
        assert_eq!(
            String::from("").append_bar().append_bar(),
            String::from("BarBar")
        );
    }
}
