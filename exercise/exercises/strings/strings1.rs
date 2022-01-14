// strings1.rs
// 在不改变函数签名的要求下通过编译！
// 执行 `rustlings hint strings1` 获取提示 ;)

// I AM NOT DONE

fn main() {
    let answer = current_favorite_color();
    println!("My current favorite color is {}", answer);// 译："当前我最喜爱的颜色是 {}"
}

// 译：当前最喜爱的颜色
fn current_favorite_color() -> String {
    "blue"
}
