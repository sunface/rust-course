// option1.rs
// 让我通过编译！执行 `rustlings hint option1` 获取提示！

// I AM NOT DONE

// 你可以自由修改代码，但这个函数签名除外。
fn print_number(maybe_number: Option<u16>) {
    println!("printing: {}", maybe_number.unwrap());
}

fn main() {
    print_number(13);
    print_number(99);

    let mut numbers: [Option<u16>; 5];
    for iter in 0..5 {
        let number_to_add: u16 = {
            ((iter * 1235) + 2) / (4 * 16)
        };

        numbers[iter as usize] = number_to_add;
    }
}
