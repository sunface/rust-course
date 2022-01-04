// move_semantics5.rs
// 只通过重新排列 `main()` 中的已有行来完成编译，并且不能增加、更改或删除任何行
// 执行 `rustex hint move_semantics5` 获取提示 :)

// I AM NOT DONE

fn main() {
    let mut x = 100;
    let y = &mut x;
    let z = &mut x;
    *y += 100;
    *z += 1000;
    assert_eq!(x, 1200);
}
