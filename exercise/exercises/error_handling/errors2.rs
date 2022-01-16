// errors2.rs
// 假设我们正在编写一个游戏，你可以用代币购买物品。
// 所有物品的价格都是 5 个代币，每当你购买物品时，都需要 1 个代币的小费。
// 游戏玩家将输入他们想要购买的物品数量，`total_cost` 函数能够计算出所需的代币数量。
// 虽然玩家输入的是数量，但我们得到的却是一个字符串——他们可能输入了任何东西，而不仅仅是数字！

// 目前这个函数没有处理任何错误的情况（也没有处理成功的情况）。
// 我们要做的是：
// 如果我们在非数字的字符串上调用 `parse` 方法，该方法将返回 `ParseIntError`，
// 在这种情况下，我们要立刻从函数返回这个错误，而不是继续进行相关计算。

// 至少有两种方法可以做到这点，它们都是正确的——但其中一种简短得多! 
// 执行 `rustlings hint errors2` 以获得关于这两种方式的提示。

// I AM NOT DONE

use std::num::ParseIntError;

pub fn total_cost(item_quantity: &str) -> Result<i32, ParseIntError> {
    let processing_fee = 1;
    let cost_per_item = 5;
    let qty = item_quantity.parse::<i32>();

    Ok(qty * cost_per_item + processing_fee)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn item_quantity_is_a_valid_number() {
        assert_eq!(total_cost("34"), Ok(171));
    }

    #[test]
    fn item_quantity_is_an_invalid_number() {
        assert_eq!(
            total_cost("beep boop").unwrap_err().to_string(),
            "invalid digit found in string"
        );// 译：字符串中包含无效的数字
    }
}
