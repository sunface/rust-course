# 迭代器

## 错误一
一般情况下，可以用过iter.map().rev()对一个迭代器进行连续变换，但是有些特殊场景，我们需要这样的形式：
```rust
let iter = array.to_iter();
iter = iter.map();
iter = iter.rev();
```

是的，这种用法很不常见，但是一旦遇到，那么编译检查将是你难以通过的天堑,例如以下代码:
```rust
fn main() {
    let arr = [0u32; 100]; // big array or vector with random numbers
    let mut iter= arr.iter();
    let map_func: Option<fn(&u32) -> &u32> = None;
    let reverse = true;
    
    if let Some(closure) = map_func {
      iter = iter.map(closure);
    }
    
    if reverse {
      iter = iter.rev();
    }
    
    // many more modification...
    
    let list: Vec<&u32> = iter.collect();
    println!("{:?}", list);
}
```

运行后，产生报错：
```console
error[E0308]: mismatched types
 --> src/main.rs:8:14
  |
8 |       iter = iter.map(closure);
  |              ^^^^^^^^^^^^^^^^^ expected struct `std::slice::Iter`, found struct `Map`
  |
  = note: expected struct `std::slice::Iter<'_, _>`
             found struct `Map<std::slice::Iter<'_, _>, for<'r> fn(&'r u32) -> &'r u32>`

error[E0308]: mismatched types
  --> src/main.rs:12:14
   |
12 |       iter = iter.rev();
   |              ^^^^^^^^^^ expected struct `std::slice::Iter`, found struct `Rev`
   |
   = note: expected struct `std::slice::Iter<'_, _>`
              found struct `Rev<std::slice::Iter<'_, _>>`
```

原因很简单，`let mut iter= arr.iter()`这里生成的`iter`是`std::slice::Iter`类型，但是`iter.map()`生成的是`Map<std::slice::Iter<'_, _>>`类型，因此无法进行直接赋值，`iter.rev()`也是类似情况。

那么为什么我们可以这样使用： `iter.map().rev()`？，因为`Map<std::slice::Iter<'_, _>>`实现了`Iterator`特征，因此可以直接在其上调用`rev`这个属于`Iterator`的方法。

回到上面的问题，因为`std::slice::Iter` 和 `Map<std::slice::Iter<'_, _>>`都实现了`impl Iterator<Item=T>`的特征，因此我们可以考虑用一个`Box<dyn Iterator<Item=u32>>`的类型来对iter进行包裹:

```rust
fn main() {
       let arr = [0u32; 100]; // big array or vector with random numbers
    let mut iter: Box<dyn DoubleEndedIterator<Item=&u32>> = Box::new(arr.iter());
    let map_func: Option<fn(&u32) -> &u32> = None;
    let reverse = true;
    
    if let Some(closure) = map_func {
      iter = Box::new(iter.map(closure));
    }
    
    if reverse {
      iter = Box::new(iter.rev());
    }
    
    // many more modification...
    
    let list: Vec<&u32> = iter.collect();
    println!("{:?}", list);
}
```

Bingo，代码编译通过! 