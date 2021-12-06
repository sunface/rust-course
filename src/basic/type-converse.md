# 类型转换

In some cases, using the as keyword is too restrictive. It’s possible to regain fuller control over the type conversion process at the cost of introducing some bureaucracy. The following listing shows a Rust method to use instead of the as keyword when the conversion might fail.

```rust
use std::convert::TryInto;
 
 fn main() {
   let a: i32 = 10;
   let b: u16 = 100;
 
   let b_ = b.try_into()
             .unwrap();
 
   if a < b_ {
     println!("Ten is less than one hundred.");
   }
 }
 ```

 Listing 2.5 introduces two new Rust concepts: traits and error handling. On line 1, the use keyword brings the std::convert::TryInto trait into local scope. This unlocks the try_into() method of the b variable. We’ll bypass a full explanation of why this occurs for now. In the meantime, consider a trait as a collection of methods. If you are from an object-oriented background, traits can be thought of as abstract classes or interfaces. If your programming experience is in functional languages, you can think of traits as type classes.

Line 7 provides a glimpse of error handling in Rust. b.try_into() returns an i32 value wrapped within a Result. Result is introduced properly in chapter 3. It can contain either a success value or an error value. The unwrap() method can handle the success value and returns the value of b as an i32 here. If the conversion between u16 and i32 were to fail, then calling unsafe() would crash the program. As the book progresses, you will learn safer ways of dealing with Result rather than risking the program’s stability!

A distinguishing characteristic of Rust is that it only allows a type’s methods to be called when the trait is within local scope. An implicit prelude enables common operations such as addition and assignment to be used without explicit imports.

> TIP
>
> To understand what is included in local scope by default, you should investigate the std::prelude module. Its >documentation is available online at https://doc.rust-lang.org/std/prelude/index.html.