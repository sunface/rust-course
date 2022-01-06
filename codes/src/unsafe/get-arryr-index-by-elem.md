# 通过元素获取数组索引
给出一个数组和其中的元素，获取该元素在数组中的索引位置.

## unsafe版本
```rust
fn main() {
    let slice = &[1, 2, 3, 4];
    let elem = &slice[2];

    let elem_ptr = elem as *const i32;
    let index = unsafe {
        elem_ptr.offset_from(slice.as_ptr())
    }; 

    println!("{}",index);
}
```

## 正常版本
实际上，该代码还能通过正常的方式实现，只要把指针转为`usize`：
```rust
fn main() {
    let slice = &[1, 2, 3, 4];
    let elem = &slice[2];
    let slice_ptr = slice.as_ptr() as usize;
    let elem_ptr = elem as *const i32 as usize;
    let index = (elem_ptr - slice_ptr) / std::mem::size_of::<i32>(); 

    println!("{}",index);
}
```