// functions3.rs
// 让我能够编译！执行 `rustex hint functions3` 获取提示 :)

// I AM NOT DONE

/// 翻译: [mg-chao](https://github.com/mg-chao)
fn main() {
    call_me();
}

fn call_me(num: u32) {
    for i in 0..num {
        println!("Ring! Call number {}", i + 1);
    }
}
