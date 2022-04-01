# 生成随机值

## 生成随机数

使用 [rand::thread_rng](https://docs.rs/rand/*/rand/fn.thread_rng.html) 可以获取一个随机数生成器 [rand::Rng](https://docs.rs/rand/0.8.5/rand/trait.Rng.html) ，该生成器需要在每个线程都初始化一个。

整数的随机分布范围等于类型的取值范围，但是浮点数只分布在 `[0, 1)` 区间内。

```rust,editable
use rand::Rng;

fn main() {
    let mut rng = rand::thread_rng();

    let n1: u8 = rng.gen();
    let n2: u16 = rng.gen();
    println!("Random u8: {}", n1);
    println!("Random u16: {}", n2);
    println!("Random u32: {}", rng.gen::<u32>());
    println!("Random i32: {}", rng.gen::<i32>());
    println!("Random float: {}", rng.gen::<f64>());
}
```

## 指定范围生成随机数

使用 [Rng::gen_range](https://rust-lang-nursery.github.io/rust-cookbook/algorithms/randomness.html) 生成 [0, 10) 区间内的随机数( 右开区间，不包括 `10` )。
```rust,editable
use rand::Rng;

fn main() {
    let mut rng = rand::thread_rng();
    println!("Integer: {}", rng.gen_range(0..10));
    println!("Float: {}", rng.gen_range(0.0..10.0));
}
```

[Uniform](https://docs.rs/rand/*/rand/distributions/uniform/struct.Uniform.html) 可以用于生成<ruby>均匀分布<rt>uniform distribution</rt></ruby>的随机数。当需要在同一个范围内重复生成随机数时，该方法虽然和之前的方法效果一样，但会更快一些。

```rust,editable
use rand::distributions::{Distribution, Uniform};

fn main() {
    let mut rng = rand::thread_rng();
    let die = Uniform::from(1..7);

    loop {
        let throw = die.sample(&mut rng);
        println!("Roll the die: {}", throw);
        if throw == 6 {
            break;
        }
    }
}
```

## 使用指定分布来生成随机数

默认情况下，`rand` 包使用均匀分布来生成随机数，而 [rand_distr](https://docs.rs/rand_distr/*/rand_distr/index.html) 包提供了其它类型的分布方式。

首先，你需要获取想要使用的分布的实例，然后在 [rand::Rng](https://docs.rs/rand/*/rand/trait.Rng.html) 的帮助下使用 [Distribution::sample](https://docs.rs/rand/*/rand/distributions/trait.Distribution.html#tymethod.sample) 对该实例进行取样。

如果想要查询可用的分布列表，可以访问[这里](https://docs.rs/rand_distr/*/rand_distr/index.html)，下面的示例中我们将使用 [Normal](https://docs.rs/rand_distr/0.4.3/rand_distr/struct.Normal.html) 分布:
```rust,editable
use rand_distr::{Distribution, Normal, NormalError};
use rand::thread_rng;

fn main() -> Result<(), NormalError> {
    let mut rng = thread_rng();
    let normal = Normal::new(2.0, 3.0)?;
    let v = normal.sample(&mut rng);
    println!("{} is from a N(2, 9) distribution", v);
    Ok(())
}
```

## 在自定义类型中生成随机值


使用 [Distribution](https://docs.rs/rand/*/rand/distributions/trait.Distribution.html) 特征包裹我们的自定义类型，并为 [Standard](https://docs.rs/rand/*/rand/distributions/struct.Standard.html) 实现该特征，可以为自定义类型的指定字段生成随机数。


```rust,editable
use rand::Rng;
use rand::distributions::{Distribution, Standard};

#[derive(Debug)]
struct Point {
    x: i32,
    y: i32,
}

impl Distribution<Point> for Standard {
    fn sample<R: Rng + ?Sized>(&self, rng: &mut R) -> Point {
        let (rand_x, rand_y) = rng.gen();
        Point {
            x: rand_x,
            y: rand_y,
        }
    }
}

fn main() {
    let mut rng = rand::thread_rng();

    // 生成一个随机的 Point
    let rand_point: Point = rng.gen();
    println!("Random Point: {:?}", rand_point);

    // 通过类型暗示( hint )生成一个随机的元组
    let rand_tuple = rng.gen::<(i32, bool, f64)>();
    println!("Random tuple: {:?}", rand_tuple);
}
```

## 生成随机的字符串(A-Z, a-z, 0-9)
通过 [Alphanumeric](https://docs.rs/rand/0.8.5/rand/distributions/struct.Alphanumeric.html) 采样来生成随机的 ASCII 字符串，包含从 `A-Z, a-z, 0-9` 的字符。

```rust,editble
use rand::{thread_rng, Rng};
use rand::distributions::Alphanumeric;

fn main() {
    let rand_string: String = thread_rng()
        .sample_iter(&Alphanumeric)
        .take(30)
        .map(char::from)
        .collect();

    println!("{}", rand_string);
}
```

## 生成随机的字符串( 用户指定 ASCII 字符 )
通过 [gen_string](https://docs.rs/rand/0.8.5/rand/trait.Rng.html#method.gen_range) 生成随机的 ASCII 字符串，包含用户指定的字符。

```rust,editable
fn main() {
    use rand::Rng;
    const CHARSET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZ\
                            abcdefghijklmnopqrstuvwxyz\
                            0123456789)(*&^%$#@!~";
    const PASSWORD_LEN: usize = 30;
    let mut rng = rand::thread_rng();

    let password: String = (0..PASSWORD_LEN)
        .map(|_| {
            let idx = rng.gen_range(0..CHARSET.len());
            CHARSET[idx] as char
        })
        .collect();

    println!("{:?}", password);
}
```
