// option2.rs
// 让我通过编译！执行 `rustlings hint option2` 获取提示！

// I AM NOT DONE

fn main() {
    let optional_word = Some(String::from("rustlings"));
    // TODO：改成适用于值为 "Some" 类型的 if let 语句，
    word = optional_word {
        println!("The word is: {}", word);
    } else {
        println!("The optional word doesn't contain anything");
    }

    let mut optional_integers_vec: Vec<Option<i8>> = Vec::new();
    for x in 1..10 {
        optional_integers_vec.push(Some(x));
    }

    // TODO：改成 while let 语句——记住，vector.pop 的返回类型为 Option<T>。
    // 你可以多次层叠地对 `Option<T>` 使用 while let 或 if let
    integer = optional_integers_vec.pop() {
        println!("current value: {}", integer);
    }
}
