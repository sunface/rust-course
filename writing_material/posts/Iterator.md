包含了一些Iterator的常用处理方法
## 遍历同时获取元素的索引
```rust
    let mut xs = vec![1i32, 2, 3];
    for (i, x) in xs.iter().enumerate() {
        println!("In position {} we have value {}", i, x);
    }
```

## 几种从Vec生成Iterator的方式
1. iter返回的是值的不可变引用，即&T
2. iter_mut返回的是可变引用，即&mut T
3. into_iter返回的是T类型的值

```rust
  let mut v = [String::from("a"), String::from("a"), String::from("a")];
    // - move occurs because `v` has type `Vec<String>`, which does not implement the `Copy
    //`v` moved due to this method call
    for x in v.into_iter() {
        println!("{:?}", x)
    }

    // Error: borrow of moved value: `v`
    println!("{:?}", v)
```
## 忽略Vec中失败的Result
`filter_map` calls a function and filters out the results that are `None`

```rust
fn main() {
    let strings = vec!["tofu", "93", "18"];
    let numbers: Vec<_> = strings
        .into_iter()
        .filter_map(|s| s.parse::<i32>().ok())
        .collect();
    println!("Results: {:?}", numbers);
}
```

## 遍历Vec时，失败直接返回
`Result` implements `FromIter` so that a vector of results (`Vec<Result<T, E>>`) can be turned into a result with a vector (`Result<Vec<T>, E>`). Once an `Result::Err` is found, the iteration will terminate

```rust
fn main() {
    let strings = vec!["tofu", "93", "18"];
    let numbers: Result<Vec<_>, _> = strings
        .into_iter()
        .map(|s| s.parse::<i32>())
        .collect();
    println!("Results: {:?}", numbers);
}
```

This same technique can be used with `Option`.

## 遍历Vec时，收集所有的正确值和错误值

```rust
fn main() {
    let strings = vec!["tofu", "93", "18"];
    let (numbers, errors): (Vec<_>, Vec<_>) = strings
        .into_iter()
        .map(|s| s.parse::<i32>())
        .partition(Result::is_ok);
    let numbers: Vec<_> = numbers.into_iter().map(Result::unwrap).collect();
    let errors: Vec<_> = errors.into_iter().map(Result::unwrap_err).collect();
    println!("Numbers: {:?}", numbers);
    println!("Errors: {:?}", errors);
}
```