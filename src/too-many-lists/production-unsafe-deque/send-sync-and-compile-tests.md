# Send, Sync, and Compile Tests

好吧，其实我们还有一对特征需要考虑，但它们很特别。我们必须对付 Rust 的神圣罗马帝国： unsafe 的 Opt-in Built-out 特征（OIBITs）： Send 和 Sync，它们实际上是（opt-out）和（built-out）（3 个中有 1 个已经很不错了！）。

与 Copy 一样，这些特征完全没有相关代码，只是标记您的类型具有特定属性。Send 表示你的类型可以安全地发送到另一个线程。Sync 表示你的类型可以在线程间安全共享（&Self: Send）。

关于 LinkedList _covariant(协变的)_ 论点在这里同样适用：一般来说，不使用花哨的内部可变技巧的普通集合可以安全地进行 Send 和 Sync。

But I said they're _opt out_. So actually, are we already? How would we know?

让我们在代码中添加一些新的魔法：随机的私有垃圾，除非我们的类型具有我们所期望的属性，否则将无法编译：

```rust,ignore,mdbook-runnable
#[allow(dead_code)]
fn assert_properties() {
    fn is_send<T: Send>() {}
    fn is_sync<T: Sync>() {}

    is_send::<LinkedList<i32>>();
    is_sync::<LinkedList<i32>>();

    is_send::<IntoIter<i32>>();
    is_sync::<IntoIter<i32>>();

    is_send::<Iter<i32>>();
    is_sync::<Iter<i32>>();

    is_send::<IterMut<i32>>();
    is_sync::<IterMut<i32>>();

    is_send::<Cursor<i32>>();
    is_sync::<Cursor<i32>>();

    fn linked_list_covariant<'a, T>(x: LinkedList<&'static T>) -> LinkedList<&'a T> { x }
    fn iter_covariant<'i, 'a, T>(x: Iter<'i, &'static T>) -> Iter<'i, &'a T> { x }
    fn into_iter_covariant<'a, T>(x: IntoIter<&'static T>) -> IntoIter<&'a T> { x }
}
cargo build
   Compiling linked-list v0.0.3
error[E0277]: `NonNull<Node<i32>>` cannot be sent between threads safely
   --> src\lib.rs:433:5
    |
433 |     is_send::<LinkedList<i32>>();
    |     ^^^^^^^^^^^^^^^^^^^^^^^^^^ `NonNull<Node<i32>>` cannot be sent between threads safely
    |
    = help: within `LinkedList<i32>`, the trait `Send` is not implemented for `NonNull<Node<i32>>`
    = note: required because it appears within the type `Option<NonNull<Node<i32>>>`
note: required because it appears within the type `LinkedList<i32>`
   --> src\lib.rs:8:12
    |
8   | pub struct LinkedList<T> {
    |            ^^^^^^^^^^
note: required by a bound in `is_send`
   --> src\lib.rs:430:19
    |
430 |     fn is_send<T: Send>() {}
    |                   ^^^^ required by this bound in `is_send`

<a million more errors>
```

我骗你说原始指针只有一个安全保护：这是另一个。 `*const` 和 `*mut` explicitly opt out of Send and Sync to be safe, so we do _actually_ have to opt back in:

```rust,ignore,mdbook-runnable
unsafe impl<T: Send> Send for LinkedList<T> {}
unsafe impl<T: Sync> Sync for LinkedList<T> {}

unsafe impl<'a, T: Send> Send for Iter<'a, T> {}
unsafe impl<'a, T: Sync> Sync for Iter<'a, T> {}

unsafe impl<'a, T: Send> Send for IterMut<'a, T> {}
unsafe impl<'a, T: Sync> Sync for IterMut<'a, T> {}
```

请注意，我们必须在这里编写不安全的 impl：这些是不安全的特征！不安全代码（如并发库）只能依靠我们正确地实现这些特征！由于没有实际代码，我们所做的保证只是：是的，我们在线程间发送或共享确实是安全的！

别以为这些都是随便说说的，我可是经过认证的专业人士，我在这里要说：是的，这些都是完全没问题的。请注意，我们并不需要为 IntoIter 实现 Send 和 Sync：它只是包含 LinkedList，所以会自动生成 Send 和 Sync--我告诉过你它们实际上是 opt out！

```text
cargo build
   Compiling linked-list v0.0.3
    Finished dev [unoptimized + debuginfo] target(s) in 0.18s
```

很好

IterMut 绝对不应该是协变的，因为它 "就像" `&mut T`。

用魔术！其实是用 rustdoc！好吧，我们不一定要使用 rustdoc，但这是最有趣的用法。你看，如果你写了一个 doccomment 并包含了一个代码块，那么 rustdoc 就会尝试编译并运行它，所以我们可以用它来创建新的匿名 "程序"，而这些程序不会影响主程序：

````rust,ignore,mdbook-runnable
    /// ```
    /// use linked_list::IterMut;
    ///
    /// fn iter_mut_covariant<'i, 'a, T>(x: IterMut<'i, &'static T>) -> IterMut<'i, &'a T> { x }
    /// ```
    fn iter_mut_invariant() {}
cargo test

...

   Doc-tests linked-list

running 1 test
test src\lib.rs - assert_properties::iter_mut_invariant (line 458) ... FAILED

failures:

---- src\lib.rs - assert_properties::iter_mut_invariant (line 458) stdout ----
error[E0308]: mismatched types
 --> src\lib.rs:461:86
  |
6 | fn iter_mut_covariant<'i, 'a, T>(x: IterMut<'i, &'static T>) -> IterMut<'i, &'a T> { x }
  |                                                                                      ^ lifetime mismatch
  |
  = note: expected struct `linked_list::IterMut<'_, &'a T>`
             found struct `linked_list::IterMut<'_, &'static T>`
````

好吧，我们已经证明了它是不变的，但现在我们的测试失败了。不用担心，rustdoc 会让你在栅栏上注释 compile_fail，说明这是意料之中的！

(实际上，我们只证明了它 "不是*covariant(协变的)*"，但老实说，如果你能让一个类型 "意外地、错误地*contravariant(逆变的)* "，那么，恭喜你。）

````rust,ignore,mdbook-runnable
    /// ```compile_fail
    /// use linked_list::IterMut;
    ///
    /// fn iter_mut_covariant<'i, 'a, T>(x: IterMut<'i, &'static T>) -> IterMut<'i, &'a T> { x }
    /// ```
    fn iter_mut_invariant() {}
cargo test
   Compiling linked-list v0.0.3
    Finished test [unoptimized + debuginfo] target(s) in 0.49s
     Running unittests src\lib.rs

...

   Doc-tests linked-list

running 1 test
test src\lib.rs - assert_properties::iter_mut_invariant (line 458) - compile fail ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.12s
````

是的！我建议在进行测试时不要使用 compile_fail，这样你可以看到错误是不是和你预期的一致。例如，你忘记了使用 use 关键字，这是错误的，但因为 compile_fail 通过了测试。如果不使用 compile_fail，测试会因为没有使用 use 失败，这不是我们想要的， 我们想要的是：测试因为 `mut` 是*covariant(协变的)*的而失败！

(哦，等等，我们其实可以在 compile_fail 旁边指定我们想要的错误代码，但这只适用于 nightly，而且由于上述原因，依赖它是个坏主意。在 not-nightly 版本运行时，它将被默默忽略）。

````rust,ignore,mdbook-runnable
    /// ```compile_fail,E0308
    /// use linked_list::IterMut;
    ///
    /// fn iter_mut_covariant<'i, 'a, T>(x: IterMut<'i, &'static T>) -> IterMut<'i, &'a T> { x }
    /// ```
    fn iter_mut_invariant() {}
````

......还有，你注意到我们实际上把 IterMut 变成*invariant(不变的)*的那部分了吗？这很容易被忽略，因为我 "只是 "复制粘贴了 Iter 并把它放在了最后。这是最后一行：

```rust,ignore,mdbook-runnable
pub struct IterMut<'a, T> {
    front: Link<T>,
    back: Link<T>,
    len: usize,
    _boo: PhantomData<&'a mut T>,
}
```

我们试着去掉 PhantomData:

```text
 cargo build
   Compiling linked-list v0.0.3 (C:\Users\ninte\dev\contain\linked-list)
error[E0392]: parameter `'a` is never used
  --> src\lib.rs:30:20
   |
30 | pub struct IterMut<'a, T> {
   |                    ^^ unused parameter
   |
   = help: consider removing `'a`, referring to it in a field, or using a marker such as `PhantomData`
```

哈！编译器在背后支持我们，提示我们未使用的 lifetime。让我们试着用一个错误的例子来代替：

```rust,ignore,mdbook-runnable
    _boo: PhantomData<&'a T>,
cargo build
   Compiling linked-list v0.0.3 (C:\Users\ninte\dev\contain\linked-list)
    Finished dev [unoptimized + debuginfo] target(s) in 0.17s
```

它可以构建！我们的测试可以发现问题吗？

```text
cargo test

...

   Doc-tests linked-list

running 1 test
test src\lib.rs - assert_properties::iter_mut_invariant (line 458) - compile fail ... FAILED

failures:

---- src\lib.rs - assert_properties::iter_mut_invariant (line 458) stdout ----
Test compiled successfully, but it's marked `compile_fail`.

failures:
    src\lib.rs - assert_properties::iter_mut_invariant (line 458)

test result: FAILED. 0 passed; 1 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.15s
```

Eyyy!!.！这个系统真管用！我喜欢那些能真正完成任务的测试，这样我就不必为那些若隐若现的错误而感到恐惧了！
