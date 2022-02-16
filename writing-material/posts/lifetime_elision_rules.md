一些lifetime消除规则


### 1
Let's talk about a feature that's available in both editions: we've added some additional elision rules for `impl` blocks and function definitions. Code like this:

```rust
impl<'a> Reader for BufReader<'a> {
    // methods go here
}
```

can now be written like this:
```rust
impl Reader for BufReader<'_> {
    // methods go here
}
```

The `'_` lifetime still shows that `BufReader` takes a parameter, but we don't need to create a name for it anymore.

### 2
Lifetimes are still required to be defined in structs. However, we no longer require as much boilerplate as before:

```rust
// Rust 2015
struct Ref<'a, T: 'a> {
    field: &'a T
}

// Rust 2018
struct Ref<'a, T> {
    field: &'a T
}
```

The `: 'a` is inferred. You can still be explicit if you prefer. We're considering some more options for elision here in the future, but have no concrete plans yet.

