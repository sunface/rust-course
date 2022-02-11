// move_semantics4.rs
// 重构这段代码，做到删除 `vec0` ，并在 `fn fill_vec` 而非 `fn main` 中创建 vector ，
// 然后将新创建的 vector 从 `fill_vec` 转移到其调用者。
// 执行 `rustex hint move_semantics4` 获取提示 :)

// I AM NOT DONE

fn main() {
    let vec0 = Vec::new();

    let mut vec1 = fill_vec(vec0);

    println!("{} has length {} content `{:?}`", "vec1", vec1.len(), vec1);

    vec1.push(88);

    println!("{} has length {} content `{:?}`", "vec1", vec1.len(), vec1);
}

// `fill_vec()` 不再获取 `vec: Vec<i32>` 参数
fn fill_vec() -> Vec<i32> {
    let mut vec = vec;

    vec.push(22);
    vec.push(44);
    vec.push(66);

    vec
}
