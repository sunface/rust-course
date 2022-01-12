// vec2.rs
// 给定一个全是偶数的 Vec 。你的任务是完成一个循环，做到将 Vec 中的每个数字都乘以 2 。
//
// 让我通过编译和测试！
//
// 如果需要提示，可以执行命令 `rustlings hint vec2`。

// I AM NOT DONE

fn vec_loop(mut v: Vec<i32>) -> Vec<i32> {
    for i in v.iter_mut() {
        // TODO：将 Vec `v` 中的每个元素都乘以 2 。
    }

    // 此时 `v' 应该等于 [4, 8, 12, 16, 20] 。
    v
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_vec_loop() {
        let v: Vec<i32> = (1..).filter(|x| x % 2 == 0).take(5).collect();
        let ans = vec_loop(v.clone());

        assert_eq!(ans, v.iter().map(|x| x * 2).collect::<Vec<i32>>());
    }
}
