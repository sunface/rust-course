# 模式适用场景

## 模式
模式是Rust中的特殊语法，它用来匹配类型中的结构和数据，它往往和`match`表达式联用，以实现强大的模式匹配能力。模式一般由以下内容组合而成：
- 字面值
- 解构的数组、枚举、结构体或者元组
- 变量
- 通配符
- 占位符


### 所有可能用到模式的地方

#### match分支

```rust
match VALUE {
    PATTERN => EXPRESSION,
    PATTERN => EXPRESSION,
    PATTERN => EXPRESSION,
}
```
如上所示，`match`的每个分支就是一个**模式**，因为`match`匹配是穷尽式的，因此我们往往需要一个特殊的模式`_`，来匹配剩余的所有情况：
```rust
match VALUE {
    PATTERN => EXPRESSION,
    PATTERN => EXPRESSION,
    _ => EXPRESSION,
}
```

#### if let分支
`if let`往往用于匹配一个模式，而忽略剩下的所有模式的场景：
```rust
if let PATTERN = SOME_VALUE {

}
```

#### while let条件循环
一个与 `if let` 结构类似的是 `while let` 条件循环，它允许只要模式匹配就一直进行 `while` 循环。下面展示了一个使用`while let`的例子:
```rust
// Vec是动态数组
let mut stack = Vec::new();

// 向数组尾部插入元素
stack.push(1);
stack.push(2);
stack.push(3);

// stack.pop从数组尾部弹出元素
while let Some(top) = stack.pop() {
    println!("{}", top);
}
```

这个例子会打印出 `3`、`2` 接着是 `1`。`pop` 方法取出动态数组的最后一个元素并返回 `Some(value)`,如果动态数组是空的，它返回 `None`。对于`while`来说，只要 `pop` 返回 `Some` 就会一直不停的循环。一旦其返回 `None`，`while` 循环停止。我们可以使用 `while let` 来弹出栈中的每一个元素。

你也可以用`loop` + `if let` 或者`match`来实现，但是会更加啰嗦。

#### for循环
```rust
let v = vec!['a', 'b', 'c'];

for (index, value) in v.iter().enumerate() {
    println!("{} is at index {}", value, index);
}
```

这里使用 `enumerate` 方法产生一个迭代器，该迭代器每次迭代会返回一个`(索引，值)`形式的元组，同时用`(index,value)`来匹配。

#### let语句

```rust
let PATTERN = EXPRESSION;
```
是的， 该语句我们已经用了无数次了，它也是一种模式匹配:
```rust
let x = 5;
```
这其中，`x`也是一种模式绑定，代表将**匹配的值绑定到变量x上**.因此，在Rust中,**变量名也是一种模式**,只不过它比较朴素很不起眼罢了。

```rust
let (x, y, z) = (1, 2, 3);
```

上面将一个元组与模式进行匹配(**模式和值的类型必需相同！**)，然后把`1,2,3`分别绑定到`x,y,z`上。

因为模式匹配要求两边的类型必须相同，导致了下面的代码会报错：
```rust
let (x, y) = (1, 2, 3);
```
因为对于元组来说，元素个数也是类型的一部分！

#### 函数参数
函数参数也是模式：
```rust
fn foo(x: i32) {
    // 代码
}
```
其中`x`就是一个模式，你还可以在参数中匹配元组：
```rust
fn print_coordinates(&(x, y): &(i32, i32)) {
    println!("Current location: ({}, {})", x, y);
}

fn main() {
    let point = (3, 5);
    print_coordinates(&point);
}
```
`&(3,5)`会匹配模式`&(x,y)`,因此`x`得到了`3`，`y`得到了`5`.


#### if 和 if let

对于以下代码，编译器会报错：
```rust
let Some(x) = some_option_value;
```
因为右边的值可能为`None`，这种时候就不能进行匹配，也就是上面的代码遗漏了`None`的匹配。

类似`let`和`for`、`match`都必须要求完全覆盖匹配，才能通过编译。

但是对于`if let`，就可以这样使用:
```rust
if let Some(x) = some_option_value {
    println!("{}", x);
}
```

因为`if let`允许匹配一种模式，而忽略其余的模式。