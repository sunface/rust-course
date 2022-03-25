# 蠢笨编译器之循环生命周期

当涉及生命周期时，Rust 编译器有时会变得不太聪明，如果再配合循环，蠢笨都不足以形容它，不信？那继续跟着我一起看看。

## 循环中的生命周期错误

Talk is cheap, 一起来看个例子：

```rust
use rand::{thread_rng, Rng};

#[derive(Debug, PartialEq)]
enum Tile {
    Empty,
}

fn random_empty_tile(arr: &mut [Tile]) -> &mut Tile {
    loop {
        let i = thread_rng().gen_range(0..arr.len());
        let tile = &mut arr[i];
        if Tile::Empty == *tile{
            return tile;
        }
    }
}
```

我们来看看上面的代码中，`loop`循环有几个引用：

- `arr.len()`, 一个不可变引用，生命周期随着函数调用的结束而结束
- `tile`是可变引用，生命周期在下次循环开始前会结束

根据以上的分析，可以得出个初步结论：在同一次循环间各个引用生命周期互不影响，在两次循环间，引用也互不影响。

那就简单了，开心运行，开心。。。报错:

```console
error[E0502]: cannot borrow `*arr` as immutable because it is also borrowed as mutable
  --> src/main.rs:10:43
   |
8  | fn random_empty_tile(arr: &mut [Tile]) -> &mut Tile {
   |                           - let's call the lifetime of this reference `'1`
9  |     loop {
10 |         let i = thread_rng().gen_range(0..arr.len());
   |                                           ^^^ immutable borrow occurs here
11 |         let tile = &mut arr[i];
   |                    ----------- mutable borrow occurs here
12 |         if Tile::Empty == *tile{
13 |             return tile;
   |                    ---- returning this value requires that `arr[_]` is borrowed for `'1`

error[E0499]: cannot borrow `arr[_]` as mutable more than once at a time
  --> src/main.rs:11:20
   |
8  | fn random_empty_tile(arr: &mut [Tile]) -> &mut Tile {
   |                           - let's call the lifetime of this reference `'1`
...
11 |         let tile = &mut arr[i];
   |                    ^^^^^^^^^^^ `arr[_]` was mutably borrowed here in the previous iteration of the loop
12 |         if Tile::Empty == *tile{
13 |             return tile;
   |                    ---- returning this value requires that `arr[_]` is borrowed for `'1`
```

不仅是错误，还是史诗级别的错误！无情刷屏了！只能想办法梳理下：

1. `arr.len()`报错，原因是它借用了不可变引用，但是在紧跟着的`&mut arr[i]`中又借用了可变引用
2. `&mut arr[i]`报错，因为在上一次循环中，已经借用过同样的可变引用`&mut arr[i]`
3. `tile`的生命周期跟`arr`不一致

奇了怪了，跟我们之前的分析完全背道而驰，按理来说`arr.len()`的借用应该在调用后立刻结束，而不是持续到后面的代码行；同时可变借用`&mut arr[i]`也应该随着每次循环的结束而结束，为什么会前后两次循环会因为同一处的引用而报错？

## 尝试去掉中间变量

虽然报错复杂，不过可以看出，所有的错误都跟`tile`这个中间变量有关，我们试着移除它看看：

```rust
use rand::{thread_rng, Rng};

#[derive(Debug, PartialEq)]
enum Tile {
    Empty,
}

fn random_empty_tile(arr: &mut [Tile]) -> &mut Tile {
    loop {
        let i = thread_rng().gen_range(0..arr.len());
        if Tile::Empty == arr[i] {
            return &mut arr[i];
        }
    }
}
```

见证奇迹的时刻，竟然编译通过了！到底发什么了什么？仅仅移除了中间变量，就编译通过了？是否可以大胆的猜测，因为中间变量，导致编译器变蠢了，因此无法正确的识别引用的生命周期。

## 循环展开

如果不使用循环呢？会不会也有这样的错误？咱们试着把循环展开：

```rust
use rand::{thread_rng, Rng};

#[derive(Debug, PartialEq)]
enum Tile {
    Empty,
}

fn random_empty_tile_2<'arr>(arr: &'arr mut [Tile]) -> &'arr mut Tile {
    let len = arr.len();

    // First loop iteration
    {
        let i = thread_rng().gen_range(0..len);
        let tile = &mut arr[i]; // Lifetime: 'arr
        if Tile::Empty == *tile {
            return tile;
        }
    }

    // Second loop iteration
    {
        let i = thread_rng().gen_range(0..len);
        let tile = &mut arr[i]; // Lifetime: 'arr
         if Tile::Empty == *tile {
            return tile;
        }
    }

    unreachable!()
}
```

结果，编译器还是不给通过，报的错误几乎一样

## 深层原因

令人沮丧的是，我找遍了网上，也没有具体的原因，大家都说这是编译器太笨导致的问题，但是关于深层的原因，也没人能说出个所有然。

因此，我无法在本文中给出为什么编译器会这么笨的真实原因，如果以后有结果，会在这里进行更新。

------2022 年 1 月 13 日更新-------
兄弟们，我带着挖掘出的一些内容回来了，再来看段错误代码先：

```rust
struct A {
    a: i32
}

impl A {
    fn one(&mut self) -> &i32{
        self.a = 10;
        &self.a
    }
    fn two(&mut self) -> &i32 {
        loop {
            let k = self.one();
            if *k > 10i32 {
                return k;
            }

            // 可能存在的剩余代码
            // ...
        }
    }
}
```

我们来逐步深入分析下：

1. 首先为`two`方法增加一下生命周期标识: `fn two<'a>(&'a mut self) -> &'a i32 { .. }`, 这里根据生命周期的[消除规则](https://course.rs/advance/lifetime/basic.html#三条消除规则)添加的
2. 根据生命周期标识可知：`two`中返回的`k`的生命周期必须是`'a`
3. 根据第 2 条，又可知：`let k = self.one();`中对`self`的借用生命周期也是`'a`
4. 因为`k`的借用发生在`loop`循环内，因此它需要小于等于循环的生命周期，但是根据之前的推断，它又要大于等于函数的生命周期`'a`，而函数的生命周期又大于等于循环生命周期，

由上可以推出：`let k = self.one();`中`k`的生命周期要大于等于循环的生命周期，又要小于等于循环的生命周期, 唯一满足条件的就是：`k`的生命周期等于循环生命周期。

但是我们的`two`方法在循环中对`k`进行了提前返回，编译器自然会认为存在其它代码，这会导致`k`的生命周期小于循环的生命周期。

怎么办呢？很简单：

```rust
fn two(&mut self) -> &i32 {
    loop {
        let k = self.one();
        return k;
    }
}
```

不要在`if`分支中返回`k`，而是直接返回，这样就让它们的生命周期相等了，最终可以顺利编译通过。

> 如果一个引用值从函数的某个路径提前返回了，那么该借用必须要在函数的所有返回路径都合法

## 解决方法

虽然不能给出原因，但是我们可以看看解决办法，在上面，**移除中间变量**和**消除代码分支**都是可行的方法，还有一种方法就是将部分引用移到循环外面.

#### 引用外移

```rust
fn random_empty_tile(arr: &mut [Tile]) -> &mut Tile {
    let len = arr.len();
    let mut the_chosen_i = 0;
    loop {
        let i = rand::thread_rng().gen_range(0..len);
        let tile = &mut arr[i];
        if Tile::Empty == *tile {
            the_chosen_i = i;
            break;
        }
    }
    &mut arr[the_chosen_i]
}
```

在上面代码中，我们只在循环中保留一个可变引用，剩下的`arr.len`和返回值引用，都移到循环外面，顺利通过编译.

## 一个更复杂的例子

再来看一个例子，代码会更复杂，但是原因几乎相同：

```rust
use std::collections::HashMap;

enum Symbol {
    A,
}

pub struct SymbolTable {
    scopes: Vec<Scope>,
    current: usize,
}

struct Scope {
    parent: Option<usize>,
    symbols: HashMap<String, Symbol>,
}

impl SymbolTable {
    pub fn get_mut(&mut self, name: &String) -> &mut Symbol {
        let mut current = Some(self.current);

        while let Some(id) = current {
            let scope = self.scopes.get_mut(id).unwrap();
            if let Some(symbol) = scope.symbols.get_mut(name) {
                return symbol;
            }

            current = scope.parent;
        }

        panic!("Value not found: {}", name);
    }
}
```

运行后报错如下：

```console
error[E0499]: cannot borrow `self.scopes` as mutable more than once at a time
  --> src/main.rs:22:25
   |
18 |     pub fn get_mut(&mut self, name: &String) -> &mut Symbol {
   |                    - let's call the lifetime of this reference `'1`
...
22 |             let scope = self.scopes.get_mut(id).unwrap();
   |                         ^^^^^^^^^^^ `self.scopes` was mutably borrowed here in the previous iteration of the loop
23 |             if let Some(symbol) = scope.symbols.get_mut(name) {
24 |                 return symbol;
   |                        ------ returning this value requires that `self.scopes` is borrowed for `'1`
```

对于上述代码，只需要将返回值修改下，即可通过编译：

```rust
fn get_mut(&mut self, name: &String) -> &mut Symbol {
    let mut current = Some(self.current);

    while let Some(id) = current {
        let scope = self.scopes.get_mut(id).unwrap();
        if scope.symbols.contains_key(name) {
            return self.scopes.get_mut(id).unwrap().symbols.get_mut(name).unwrap();
        }

        current = scope.parent;
    }

    panic!("Value not found: {}", name);
}
```

其中的关键就在于返回的时候，新建一个引用，而不是使用中间状态的引用。

## 新编译器 Polonius

针对现有编译器存在的各种问题，Rust 团队正在研发一个全新的编译器，名曰[`polonius`](https://github.com/rust-lang/polonius),但是目前它仍然处在开发阶段，如果想在自己项目中使用，需要在`rustc/RUSTFLAGS`中增加标志`-Zpolonius`，但是可能会导致编译速度变慢，或者引入一些新的编译错误。

## 总结

编译器不是万能的，它也会迷茫，也会犯错。

因此我们在循环中使用引用类型时要格外小心，特别是涉及可变引用，这种情况下，最好的办法就是避免中间状态，或者在返回时避免使用中间状态。
