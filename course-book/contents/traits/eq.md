# Eq

The rules for == and friends in Rust are a bit complicated. Consider some type T that implements Eq:
- You can always compare objects of type T. The comparison will be notionally done as if by reference, meaning there will be no move or copy involved.
- You can always compare references to objects of type T. The objects must match in "reference depth": &&a == &&a is OK, &a == &&a is not. Dereferences count here: &*&&a == &&*&a is OK.
- Some types — for example, String — have a Deref implementation. This will play a role in comparisons because they are "auto-derefed". For example, if s is a String then s == "x" is OK, because s will automatically be treated as &str for comparison purposes.


In general, you can't dereference a string literal. A string literal is of type `&'static str`. If you dereference it you get a str, which is unsized and thus really hard to work with.

However, `==` and friends are special. From the Rust Reference Manual:
> Unlike the arithmetic and logical operators above, these operators implicitly take shared borrows of their operands, evaluating them in place expression context:
```rust
a == b;
// is equivalent to
::std::cmp::PartialEq::eq(&a, &b);
```

> This means that the operands don't have to be moved out of.
So when you write `*"s" == *"t"` it is treated as

```rust
::std::cmp::PartialEq::eq(&*"s", &*"t");
```

and thus works even though it looks like it shouldn't.