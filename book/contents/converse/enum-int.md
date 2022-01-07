# 整数转换为枚举
在Rust中，从枚举到整数的转换很容易，但是反过来，就没那么容易，甚至部分实现还挺邪恶, 例如使用`transmute`。

## C语言的实现
对于C语言来说，万物皆邪恶，因此我们不讨论安全，只看实现，不得不说很简洁：
```C
#include <stdio.h>

enum atomic_number {
    HYDROGEN = 1,
    HELIUM = 2,
    // ...
    IRON = 26,
};

int main(void)
{
    enum atomic_number element = 26;

    if (element == IRON) {
        printf("Beware of Rust!\n");
    }

    return 0;
}
```

但是在Rust中，以下代码：
```rust
enum MyEnum {
    A = 1,
    B,
    C,
}

fn main() {
    // 将枚举转换成整数，顺利通过
    let x = MyEnum::C as i32;

    // 将整数转换为枚举，失败
    match x {
        MyEnum::A => {}
        MyEnum::B => {}
        MyEnum::C => {}
        _ => {}
    }
}
```

就会报错: `MyEnum::A => {} mismatched types, expected i32, found enum MyEnum`。

## 一个真实场景的需求
在实际场景中，从枚举到整数的转换有时还是非常需要的，例如你有一个枚举类型，然后需要从外面穿入一个整数，用于控制后续的流程走向，此时就需要用整数去匹配相应的枚举(你也可以用整数匹配整数-, -，看看会不会被喷)。

既然有了需求，剩下的就是看看该如何实现，这篇文章的水远比你想象的要深，且看八仙过海各显神通。

## 使用三方库
首先可以想到的肯定是三方库，毕竟Rust的生态目前已经发展的很不错，类似的需求总是有的，这里我们先使用`num-traits`和`num-derive`来试试。

在`Cargo.toml`中引入：
```toml
[dependencies]
num-traits = "0.2.14"
num-derive = "0.3.3"
```

代码如下:
```rust
use num_derive::FromPrimitive;    
use num_traits::FromPrimitive;

#[derive(FromPrimitive)]
enum MyEnum {
    A = 1,
    B,
    C,
}

fn main() {
    let x = 2;

    match FromPrimitive::from_i32(x) {
        Some(MyEnum::A) => println!("Got A"),
        Some(MyEnum::B) => println!("Got B"),
        Some(MyEnum::C) => println!("Got C"),
        None            => println!("Couldn't convert {}", x),
    }
}
```

除了上面的库，还可以使用一个较新的库: [`num_enums`](https://github.com/illicitonion/num_enum)。

## TryFrom + 宏
在Rust1.34后，可以实现`TryFrom`特征来做转换:
```rust
use std::convert::TryFrom;

impl TryFrom<i32> for MyEnum {
    type Error = ();

    fn try_from(v: i32) -> Result<Self, Self::Error> {
        match v {
            x if x == MyEnum::A as i32 => Ok(MyEnum::A),
            x if x == MyEnum::B as i32 => Ok(MyEnum::B),
            x if x == MyEnum::C as i32 => Ok(MyEnum::C),
            _ => Err(()),
        }
    }
}
```

以上代码定义了从`i32`到`MyEnum`的转换，接着就可以使用`TryInto`来实现转换：
```rust
use std::convert::TryInto;

fn main() {
    let x = MyEnum::C as i32;

    match x.try_into() {
        Ok(MyEnum::A) => println!("a"),
        Ok(MyEnum::B) => println!("b"),
        Ok(MyEnum::C) => println!("c"),
        Err(_) => eprintln!("unknown number"),
    }
}
```

但是上面的代码有个问题，你需要为每个枚举成员都实现一个转换分支，非常麻烦。好在可以使用宏来简化，自动根据枚举的定义来实现`TryFrom`特征:
```rust
macro_rules! back_to_enum {
    ($(#[$meta:meta])* $vis:vis enum $name:ident {
        $($(#[$vmeta:meta])* $vname:ident $(= $val:expr)?,)*
    }) => {
        $(#[$meta])*
        $vis enum $name {
            $($(#[$vmeta])* $vname $(= $val)?,)*
        }

        impl std::convert::TryFrom<i32> for $name {
            type Error = ();

            fn try_from(v: i32) -> Result<Self, Self::Error> {
                match v {
                    $(x if x == $name::$vname as i32 => Ok($name::$vname),)*
                    _ => Err(()),
                }
            }
        }
    }
}

back_to_enum! {
    enum MyEnum {
        A = 1,
        B,
        C,
    }
}
```





## 邪恶之王std::mem::transmute
**这个方法原则上并不推荐，但是有其存在的意义，如果要使用，你需要清晰的知道自己为什么使用**。

在之前的类型转换章节，我们提到过非常邪恶的[`transmute`转换](../basic/converse.md#变形记(Transmutes))，其实，当你知道数值一定不会超过枚举的范围时(例如枚举成员对应1，2，3，传入的整数也在这个范围内)，就可以使用这个方法完成变形。

> 最好使用#[repr(..)]来控制底层类型的大小，免得本来需要i32，结果传入i64，最终内存无法对齐，产生奇怪的结果

```rust
#[repr(i32)]
enum MyEnum {
    A = 1, B, C
}

fn main() {
    let x = MyEnum::C;
    let y = x as i32;
    let z: MyEnum = unsafe { ::std::mem::transmute(y) };

    // match the enum that came from an int
    match z {
        MyEnum::A => { println!("Found A"); }
        MyEnum::B => { println!("Found B"); }
        MyEnum::C => { println!("Found C"); }
    }
}
```

既然是邪恶之王，当然得有真本事，无需标准库、也无需unstable的Rust版本，我们就完成了转换！awesome!??


## 总结
本文列举了常用(其实差不多也是全部了，还有一个unstable特性没提到)的从整数转换为枚举的方式，推荐度按照出现的先后顺序递减。

但是推荐度最低，不代表它就没有出场的机会，只要使用边界清晰，一样可以大方光彩，例如最后的`transmute`函数.