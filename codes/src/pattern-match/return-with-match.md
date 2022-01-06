# 使用match和if let返回值

## 1
以下代码使用`if let`给外面的变量赋值(在循环中)：
```rust
let file_stem;
let stem = source_path.file_stem();
if let Some(x) = stem {
    file_stem = x;
} else {
    continue
}
```

实际上不必这么复杂，可以直接用`if let`作为一个表达式，直接进行赋值：
```rust
let file_stem = if let Some(x) = source_path.file_stem(){
    x
} else {
    continue
}
```

也可以使用`match`：
```rust
let file_stem = match source_path.file_stem() {
  Some(x) => x,
  None => continue,
};
```

从中可以看出, **在匹配中假如一个分支没有任何返回值，可以通过另外一个分支进行赋值**。