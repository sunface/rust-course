// enums1.rs
// 让我能够编译！执行 `rustex hint enums1` 获取提示 :)

// I AM NOT DONE

#[derive(Debug)]
enum Message {
    // TODO：遵照下面的使用方式来定义几种 Message 的类型
}

fn main() {
    println!("{:?}", Message::Quit);
    println!("{:?}", Message::Echo);
    println!("{:?}", Message::Move);
    println!("{:?}", Message::ChangeColor);
}
