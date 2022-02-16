## 可以通过move struct中的字段，来解决borrow和mut borrow无法共存的问题

```rust
struct Foo {
    bar: Bar
}

let bar: &Bar = &foo.bar;
let foo_mut: &mut Foo = &mut foo; // Can’t do it.
println!("{}{}", foo_mut, bar);
```

If you no longer need Bar as a field of Foo, you can move it out instead of borrowing. This way you will be able to obtain Bar and still be able to mutate Foo.

```rust
struct Foo {
    bar: Option<Bar>
}

let bar: Bar = foo.bar.take(); // sets option to None
let foo_mut: &mut Foo = &mut foo;

println!("{}{}", foo_mut, bar);
```

