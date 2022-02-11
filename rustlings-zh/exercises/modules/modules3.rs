// modules3.rs
// 你可以使用 'use' 关键字将任何位置的模块（特别是 Rust 标准库中的模块）引入作用域。
// 从 std::time 模块引入 SystemTime 和 UNIX_EPOCH。如果你能用一行代码解决，就能获得额外得分。
// 让我能够编译！执行 `rustex hint modules3` 获取提示 :)

// I AM NOT DONE

// TODO: 完成这个 `use` 语句
use ???

fn main() {
    match SystemTime::now().duration_since(UNIX_EPOCH) {
        Ok(n) => println!("1970-01-01 00:00:00 UTC was {} seconds ago!", n.as_secs()),
        Err(_) => panic!("SystemTime before UNIX EPOCH!"),
    }
}
