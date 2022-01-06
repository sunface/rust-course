# 运算符重载

```rust
use std::ops::Index;

struct MyType<T> {
    bytes: T
}

impl<I,T:Index<I>> Index<I> for MyType<T> {
    type Output = T::Output;
    fn index(&self, index: I) -> &Self::Output {
        &self.bytes[index]
    }
}


fn main() {
   let arr = MyType{
       bytes: [1,2,3]
   };

   println!("{}",arr[0]);
}
```