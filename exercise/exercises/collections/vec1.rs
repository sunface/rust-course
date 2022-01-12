// vec1.rs
// 你的任务是创建一个与数组 `a` 中的元素完全相同的 `Vec`。
// 让我通过编译和测试！
// 如果需要提示，可以执行命令 `rustlings hint vec1`。

// I AM NOT DONE

fn array_and_vec() -> ([i32; 4], Vec<i32>) {
    let a = [10, 20, 30, 40]; // 一个普通的数组
    let v = // TODO：在这里用 vectors 的宏来声明你的 vector

    (a, v)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_array_and_vec_similarity() {
        let (a, v) = array_and_vec();
        assert_eq!(a, v[..]);
    }
}
