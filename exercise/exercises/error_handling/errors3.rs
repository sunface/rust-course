// errors3.rs
// 这是一个试图使用前面练习中 `total_cost` 函数完整版的程序。
// 但出了些问题！为什么不行？我们需要怎样做才能解决问题？
// 执行 `rustlings hint errors3` 获取提示！

// I AM NOT DONE

use std::num::ParseIntError;

fn main() {
    let mut tokens = 100;
    let pretend_user_input = "8";

    let cost = total_cost(pretend_user_input)?;

    if cost > tokens {
        println!("You can't afford that many!");// 译：你的代币不足以完成支付！
    } else {
        tokens -= cost;
        println!("You now have {} tokens.", tokens);// 译：现在你有 {} 个代币"
    }
}

pub fn total_cost(item_quantity: &str) -> Result<i32, ParseIntError> {
    let processing_fee = 1;
    let cost_per_item = 5;
    let qty = item_quantity.parse::<i32>()?;

    Ok(qty * cost_per_item + processing_fee)
}
