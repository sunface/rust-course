// option3.rs
// 让我通过编译！执行 `rustlings hint option3` 获取提示

// I AM NOT DONE

struct Point {
    x: i32,
    y: i32,
}

fn main() {
    let y: Option<Point> = Some(Point { x: 100, y: 200 });

    match y {
        Some(p) => println!("Co-ordinates are {},{} ", p.x, p.y),
        _ => println!("no match"),
    }
    y; // 无需删除这行就可以解决。
}
