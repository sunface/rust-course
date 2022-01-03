// functions4.rs
// 让我能够编译！执行 `rustex hint functions4` 获取提示 :)

// 商店正在进行促销，如果价格是偶数，可以优惠 10 Rustbucks，如果是奇数，则优惠 3 Rustbucks。
// 译：Rustbucks 可能想表达 Rust元 的意思，好比 美元 。

// I AM NOT DONE

/// 翻译: [mg-chao](https://github.com/mg-chao)
fn main() {
    let original_price = 51;
    println!("Your sale price is {}", sale_price(original_price));// 译："你需支付 {}"
}

fn sale_price(price: i32) -> {
    if is_even(price) {
        price - 10
    } else {
        price - 3
    }
}

fn is_even(num: i32) -> bool {
    num % 2 == 0
}
