// hashmap1.rs

// 用散列表定义一个水果篮。以键表示水果的名称，值来代表篮子里对应水果的个数。
// 要求必须在篮子里放至少三种水果（如苹果、香蕉、芒果），每种水果的总数也应不少于五个。
//
// 让我通过编译和测试！
//
// 如果需要提示，可以执行命令 `rustlings hint hashmap1`。

// I AM NOT DONE

use std::collections::HashMap;

fn fruit_basket() -> HashMap<String, u32> {
    let mut basket = // TODO：在这声明个散列表

    // 给你两个香蕉
    basket.insert(String::from("banana"), 2);

    // TODO：在这往篮子里添加更多的水果

    basket
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn at_least_three_types_of_fruits() {
        let basket = fruit_basket();
        assert!(basket.len() >= 3);
    }

    #[test]
    fn at_least_five_fruits() {
        let basket = fruit_basket();
        assert!(basket.values().sum::<u32>() >= 5);
    }
}
