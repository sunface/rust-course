# 命名规范

基本的Rust命名规范在[RFC 430]中有描述.

通常，对于"type-level"的构造Rust倾向于使用驼峰命名,而对于'value-level'的构造使用蛇形命名。详情如下:

| 条目 | 惯例 |
| ---- | ---------- |
| 包Crates | [unclear](https://github.com/rust-lang/api-guidelines/issues/29) |
| 模块Modules | `snake_case` |
| 类型Types | `UpperCamelCase` |
| 特征Traits | `UpperCamelCase` |
| 枚举项 | `UpperCamelCase` |
| 函数Functions | `snake_case` |
| 方法Methods | `snake_case` |
| 通用构造器General constructors | `new` or `with_more_details` |
| 转换构造器Conversion constructors | `from_some_other_type` |
| 宏Macros | `snake_case!` |
| 局部变量Local variables | `snake_case` |
| 静态类型Statics | `SCREAMING_SNAKE_CASE` |
| 常量Constants | `SCREAMING_SNAKE_CASE` |
| 类型参数Type parameters | `UpperCamelCase`, 通常使用一个大写字母: `T` |
| 生命周期Lifetimes | 通常使用小写字母: `'a`, `'de`, `'src` |
| Features | [unclear](https://github.com/rust-lang/api-guidelines/issues/101) but see [C-FEATURE] |

对于驼峰命名法, 复合词的缩略形式我们认为是一个单独的词语，所以只对首字母进行大写: 使用`Uuid`而不是`UUID`, `Usize`而不是`USize`, `Stdin`而不是`StdIn`.对于蛇形命名法，缩略词用全小写: `is_xid_start`.

对于蛇形命名(包括全大写的`SCREAMING_SNAKE_CASE`), 除了最后一部分，其它部分的词语都不能由单个字母组成：
`btree_map`而不是`b_tree_map`, `PI_2`而不是`PI2`.

包名不应该使用`-rs`或者`-rust`作为后缀，因为每一个包都是Rust写的，因此这种多余的注释其实没有任何意义。

[RFC 430]: https://github.com/rust-lang/rfcs/blob/master/text/0430-finalizing-naming-conventions.md
[C-FEATURE]: #c-feature


##  类型转换要遵守`as_`, `to_`, `into_`命名惯例(C-CONV)
类型转换应该通过方法调用的方式实现，其中的前缀规则如下：

| 方法前缀 | 性能开销 | 所有权改变 |
| ------ | ---- | --------- |
| `as_` | Free | borrowed -\> borrowed |
| `to_` | Expensive | borrowed -\> borrowed<br>borrowed -\> owned (non-Copy types)<br>owned -\> owned (Copy types) |
| `into_` | Variable | owned -\> owned (non-Copy types) |

For example:

- [`str::as_bytes()`] 把`str`变成UTF-8字节数组, 性能开销是0. 其中输入是一个借用的`&str`，输出也是一个借用的`&str`.
- [`Path::to_str`] 会执行一次昂贵的UTF-8字节数组检查，输入和输出都是借用的。对于这种情况，如果把方法命名为`as_str`是不正确的，因为这个方法的开销还挺大.
- [`str::to_lowercase()`]在调用过程中会遍历字符串的字符，且可能会分配新的内存对象.输入是一个借用的`str`，输出是一个有独立所有权的`String`
- [`String::into_bytes()`]返回`String`底层的`Vec<u8>`数组，转换本身是零消耗的。该方法获取`String`的所有权，然后返回一个新的有独立所有权的`Vec<u8>`


[`str::as_bytes()`]: https://doc.rust-lang.org/std/primitive.str.html#method.as_bytes
[`Path::to_str`]: https://doc.rust-lang.org/std/path/struct.Path.html#method.to_str
[`str::to_lowercase()`]: https://doc.rust-lang.org/std/primitive.str.html#method.to_lowercase
[`f64::to_radians()`]: https://doc.rust-lang.org/std/primitive.f64.html#method.to_radians
[`String::into_bytes()`]: https://doc.rust-lang.org/std/string/struct.String.html#method.into_bytes
[`BufReader::into_inner()`]: https://doc.rust-lang.org/std/io/struct.BufReader.html#method.into_inner
[`BufWriter::into_inner()`]: https://doc.rust-lang.org/std/io/struct.BufWriter.html#method.into_inner


当一个单独的值被某个类型所包装时，访问该类型的内部值应通过`into_inner()`方法来访问。例如将一个缓冲区值包装为[`BufReader`]类型，还有[`GzDecoder`]、[`AtomicBool`]等，都是这种类型。


[`BufReader`]: https://doc.rust-lang.org/std/io/struct.BufReader.html#method.into_inner
[`GzDecoder`]: https://docs.rs/flate2/0.2.19/flate2/read/struct.GzDecoder.html#method.into_inner
[`AtomicBool`]: https://doc.rust-lang.org/std/sync/atomic/struct.AtomicBool.html#method.into_inner

如果`mut`限定符在返回类型中出现，那么在命名上也应该体现出来。例如，[`Vec::as_mut_slice`] 就说明它返回了一个mut切片，在这种情况下`as_mut_slice`比`as_slice_mut`更适合。

[`Vec::as_mut_slice`]: https://doc.rust-lang.org/std/vec/struct.Vec.html#method.as_mut_slice

```rust
// 返回类型是一个mut切片.
fn as_mut_slice(&mut self) -> &mut [T];
```

##### 标准库中的一些例子

- [`Result::as_ref`](https://doc.rust-lang.org/std/result/enum.Result.html#method.as_ref)
- [`RefCell::as_ptr`](https://doc.rust-lang.org/std/cell/struct.RefCell.html#method.as_ptr)
- [`slice::to_vec`](https://doc.rust-lang.org/std/primitive.slice.html#method.to_vec)
- [`Option::into_iter`](https://doc.rust-lang.org/std/option/enum.Option.html#method.into_iter)


##  读访问器(Getter)的名称遵循Rust的命名规范(C-GETTER)

除了少数例外，在Rust代码中`get`前缀不用于getter。

```rust
pub struct S {
    first: First,
    second: Second,
}

impl S {
    // 而不是get_first
    pub fn first(&self) -> &First {
        &self.first
    }

    // 而不是get_first_mut, get_mut_first, or mut_first.
    pub fn first_mut(&mut self) -> &mut First {
        &mut self.first
    }
}
```
至于上文提到的少数例外，如下：当有且仅有一个值能被getter所获取时，才使用`get`前缀。例如，
[`Cell::get`]能直接访问到`Cell`中的内容。

[`Cell::get`]: https://doc.rust-lang.org/std/cell/struct.Cell.html#method.get

有些getter会在过程中执行运行时检查，那么我们就可以考虑添加`_unchecked`getter函数，这个函数虽然不安全，但是往往具有更高的性能，
典型的例子如下：

```rust
fn get(&self, index: K) -> Option<&V>;
fn get_mut(&mut self, index: K) -> Option<&mut V>;
unsafe fn get_unchecked(&self, index: K) -> &V;
unsafe fn get_unchecked_mut(&mut self, index: K) -> &mut V;
```

[`TempDir::path`]: https://docs.rs/tempdir/0.3.5/tempdir/struct.TempDir.html#method.path
[`TempDir::into_path`]: https://docs.rs/tempdir/0.3.5/tempdir/struct.TempDir.html#method.into_path

### 标准库示例

- [`std::io::Cursor::get_mut`](https://doc.rust-lang.org/std/io/struct.Cursor.html#method.get_mut)
- [`std::ptr::Unique::get_mut`](https://doc.rust-lang.org/std/ptr/struct.Unique.html#method.get_mut)
- [`std::sync::PoisonError::get_mut`](https://doc.rust-lang.org/std/sync/struct.PoisonError.html#method.get_mut)
- [`std::sync::atomic::AtomicBool::get_mut`](https://doc.rust-lang.org/std/sync/atomic/struct.AtomicBool.html#method.get_mut)
- [`std::collections::hash_map::OccupiedEntry::get_mut`](https://doc.rust-lang.org/std/collections/hash_map/struct.OccupiedEntry.html#method.get_mut)
- [`<[T]>::get_unchecked`](https://doc.rust-lang.org/std/primitive.slice.html#method.get_unchecked)

## 一个集合上的方法，如果返回迭代器，需遵循命名规则：`iter`, `iter_mut`, `into_iter` (C-ITER)

```rust
fn iter(&self) -> Iter             // Iter implements Iterator<Item = &U>
fn iter_mut(&mut self) -> IterMut  // IterMut implements Iterator<Item = &mut U>
fn into_iter(self) -> IntoIter     // IntoIter implements Iterator<Item = U>
```
上面的规则适用于同构性的数据集合。与之相反，`str`类型是一个utf8字节数组切片，与同构性集合有一点微妙的差别，它可以认为是字节集合，也可以认为是字符集合，因此它提供了[`str::bytes`]去遍历字节，还有[`str::chars`]去遍历字符，而并没有直接定义`iter`等方法。

[`str::bytes`]: https://doc.rust-lang.org/std/primitive.str.html#method.bytes
[`str::chars`]: https://doc.rust-lang.org/std/primitive.str.html#method.chars

上述规则只适用于方法，并不适用于函数。例如`url`包的[`percent_encode`]函数返回一个迭代器用于遍历百分比编码([Percent encoding](https://en.wikipedia.org/wiki/Percent-encoding))的字符串片段. 在这种情况下，使用`iter`/`iter_mut`/`into_iter`诸如此类的函数命名无法表达任何具体的含义。

[`percent_encode`]: https://docs.rs/url/1.4.0/url/percent_encoding/fn.percent_encode.html
[RFC 199]: https://github.com/rust-lang/rfcs/blob/master/text/0199-ownership-variants.md

### 标准库示例

- [`Vec::iter`](https://doc.rust-lang.org/std/vec/struct.Vec.html#method.iter)
- [`Vec::iter_mut`](https://doc.rust-lang.org/std/vec/struct.Vec.html#method.iter_mut)
- [`Vec::into_iter`](https://doc.rust-lang.org/std/vec/struct.Vec.html#method.into_iter)
- [`BTreeMap::iter`](https://doc.rust-lang.org/std/collections/struct.BTreeMap.html#method.iter)
- [`BTreeMap::iter_mut`](https://doc.rust-lang.org/std/collections/struct.BTreeMap.html#method.iter_mut)

## 迭代器的类型应该与产生它的方法名相匹配(C-ITER-TY)
例如形如`into_iter()`的方法应该返回一个`IntoIter`类型，与之相似，其它任何返回迭代器的方法也应该遵循这种命名惯例。

上述规则主要应用于方法，但是经常对于函数也适用。例如上文提到的url包中的[`percent_encode`]函数，返回了一个[`PercentEncode`]类型.

[PercentEncode-type]: https://docs.rs/url/1.4.0/url/percent_encoding/struct.PercentEncode.html

特别是，当这些类型跟包名前缀一起使用时，将具备非常清晰的含义，例如[`vec::IntoIter`].

[`vec::IntoIter`]: https://doc.rust-lang.org/std/vec/struct.IntoIter.html

### 标准库示例

* [`Vec::iter`] returns [`Iter`][slice::Iter]
* [`Vec::iter_mut`] returns [`IterMut`][slice::IterMut]
* [`Vec::into_iter`] returns [`IntoIter`][vec::IntoIter]
* [`BTreeMap::keys`] returns [`Keys`][btree_map::Keys]
* [`BTreeMap::values`] returns [`Values`][btree_map::Values]

[`Vec::iter`]: https://doc.rust-lang.org/std/vec/struct.Vec.html#method.iter
[slice::Iter]: https://doc.rust-lang.org/std/slice/struct.Iter.html
[`Vec::iter_mut`]: https://doc.rust-lang.org/std/vec/struct.Vec.html#method.iter_mut
[slice::IterMut]: https://doc.rust-lang.org/std/slice/struct.IterMut.html
[`Vec::into_iter`]: https://doc.rust-lang.org/std/vec/struct.Vec.html#method.into_iter
[vec::IntoIter]: https://doc.rust-lang.org/std/vec/struct.IntoIter.html
[`BTreeMap::keys`]: https://doc.rust-lang.org/std/collections/struct.BTreeMap.html#method.keys
[btree_map::Keys]: https://doc.rust-lang.org/std/collections/btree_map/struct.Keys.html
[`BTreeMap::values`]: https://doc.rust-lang.org/std/collections/struct.BTreeMap.html#method.values
[btree_map::Values]: https://doc.rust-lang.org/std/collections/btree_map/struct.Values.html


<a id="c-feature"></a>
## Cargo Feature的名称不应该包含占位词(C-FEATURE)

不要在[Cargo feature]中包含无法传达任何意义的词，例如`use-abc`或`with-abc`，直接命名为`abc`即可。

[Cargo feature]: http://doc.crates.io/manifest.html#the-features-section

一个典型的例子就是：一个包对标准库有可选性的依赖。标准的写法如下：

```toml
# 在Cargo.toml中

[features]
default = ["std"]
std = []
```

```rust
// 在我们自定义的lib.rs中

#![cfg_attr(not(feature = "std"), no_std)]
```
除了`std`之外，不要使用任何`ust-std`或者`with-std`等自以为很有创造性的名称。

## 命名要使用一致性的词序(C-WORD-ORDER)

这是一些标准库中的错误类型:

- [`JoinPathsError`](https://doc.rust-lang.org/std/env/struct.JoinPathsError.html)
- [`ParseBoolError`](https://doc.rust-lang.org/std/str/struct.ParseBoolError.html)
- [`ParseCharError`](https://doc.rust-lang.org/std/char/struct.ParseCharError.html)
- [`ParseFloatError`](https://doc.rust-lang.org/std/num/struct.ParseFloatError.html)
- [`ParseIntError`](https://doc.rust-lang.org/std/num/struct.ParseIntError.html)
- [`RecvTimeoutError`](https://doc.rust-lang.org/std/sync/mpsc/enum.RecvTimeoutError.html)
- [`StripPrefixError`](https://doc.rust-lang.org/std/path/struct.StripPrefixError.html)

它们都使用了`谓语-宾语-错误`的词序，如果我们想要表达一个网络地址无法分析的错误，由于词序一致性的原则，命名应该如下`ParseAddrError`,而不是`AddrParseError`。

词序和个人习惯有很大关系，需要注意的是，你可以选择合适的词序，但是要在包的范畴内保持一致性，就如标准库中的包一样。
