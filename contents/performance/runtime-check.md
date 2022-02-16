# 减少runtime check


## 减少集合访问的边界检查

以下代码，我们实现了两种循环方式：
```rust
// 第一种
let collection = [1, 2, 3, 4, 5];
for i in 0..collection.len() {
  let item = collection[i];
  // ...
}

// 第二种
for item in collection {

}
```

第一种方式是循环索引，然后通过索引下标去访问集合，第二种方式是直接循环迭代集合中的元素，优劣如下：
- **性能**：第一种使用方式中`collection[index]`的索引访问，会因为边界检查(bounds checking)导致运行时的性能损耗 - Rust会检查并确认`index`是落在集合内也就是合法的，但是第二种直接迭代的方式就不会触发这种检查,因为编译器会在编译时就完成分析并证明这种访问是合法的`

## Box::leak
https://www.reddit.com/r/rust/comments/rntx7s/why_use_boxleak/


## bounds check
https://www.reddit.com/r/rust/comments/rnbubh/whats_the_big_deal_with_bounds_checking/

https://www.reddit.com/r/rust/comments/s6u65e/optimization_of_bubble_sort_fails_without_hinting/

## 使用assert 优化检查性能
https://www.reddit.com/r/rust/comments/rui1zz/write_assertions_that_clarify_code_to_both_the/
