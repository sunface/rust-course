// strings2.rs
// 在不改变函数签名的要求下通过编译！
// 执行 `rustlings hint strings2` 获取提示 ;)

// I AM NOT DONE

fn main() {
    let word = String::from("green"); // 尝试不更改这一行 :)
    if is_a_color_word(word) {
        println!("That is a color word I know!");// 译：我知道这个颜色词
    } else {
        println!("That is not a color word I know.");// 译：我不知道这个颜色词
    }
}

// 译：是否是颜色词
fn is_a_color_word(attempt: &str) -> bool {
    attempt == "green" || attempt == "blue" || attempt == "red"
}
