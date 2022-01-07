// enums2.rs
// 让我能够编译！执行 `rustex hint enums2` 获取提示！

// I AM NOT DONE

#[derive(Debug)]
enum Message {
    // TODO：定义下面使用到的多种 Message 类型
}

impl Message {
    fn call(&self) {
        println!("{:?}", &self);
    }
}

fn main() {
    let messages = [
        Message::Move { x: 10, y: 30 },
        Message::Echo(String::from("hello world")),
        Message::ChangeColor(200, 255, 255),
        Message::Quit,
    ];

    for message in &messages {
        message.call();
    }
}
