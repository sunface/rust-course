# 同时从首尾遍历

下面的代码展示了如何同时从首尾两端同时开始，对数组进行迭代.

```rust
fn main() {
    let v = vec![1, 2, 3, 4, 5];

    // 第一种方法
    // 将数组分成两段
    let (f, b) = v.split_at(v.len() / 2);
    // 使用zip将两段数组合并成[(x1,y1),(x2,y2)..]形式的迭代器
    for (x, y) in f.iter().zip(b.iter().rev()) {
        println!("{}, {}", x, y)
    }

    // 第二种方法
    // 使用循环匹配的方式，不停的匹配出首尾元素,非常巧妙!
    let mut s = &v[..];
    loop {
        match s {
            [a, rest @ .., b] => {
                println!("{}, {}", a, b);
                s = rest;
            }
            [a] => {
                println!("{}", a);
                break;
            }
            [] => break,
        }
    }
}
```