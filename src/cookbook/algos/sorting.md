## Vector 排序


### 对整数 Vector 排序

以下示例使用 [Vec::sort](https://doc.rust-lang.org/std/vec/struct.Vec.html#method.sort) 来排序，如果大家希望获得更高的性能，可以使用 [Vec::sort_unstable](https://doc.rust-lang.org/std/vec/struct.Vec.html#method.sort_unstable)，但是该方法无法保留相等元素的顺序。

```rust,editable
fn main() {
    let mut vec = vec![1, 5, 10, 2, 15];
    
    vec.sort();

    assert_eq!(vec, vec![1, 2, 5, 10, 15]);
}
```

### 对浮点数 Vector 排序

浮点数数组可以使用 [Vec::sort_by](https://doc.rust-lang.org/std/primitive.slice.html#method.sort_by) 和 [PartialOrd::partial_cmp](https://doc.rust-lang.org/std/cmp/trait.PartialOrd.html#tymethod.partial_cmp) 进行排序。

```rust,editable
fn main() {
    let mut vec = vec![1.1, 1.15, 5.5, 1.123, 2.0];

    vec.sort_by(|a, b| a.partial_cmp(b).unwrap());

    assert_eq!(vec, vec![1.1, 1.123, 1.15, 2.0, 5.5]);
}
```

### 对结构体 Vector 排序

以下示例中的结构体 `Person` 将实现基于字段 `name` 和 `age` 的自然排序。为了让 `Person` 变为可排序的，我们需要为其派生 `Eq、PartialEq、Ord、PartialOrd` 特征，关于这几个特征的详情，请见[这里](https://course.rs/advance/confonding/eq.html)。

当然，还可以使用 [vec:sort_by](https://doc.rust-lang.org/std/vec/struct.Vec.html#method.sort_by) 方法配合一个自定义比较函数，只按照 `age` 的维度对 `Person` 数组排序。

```rust,editable
#[derive(Debug, Eq, Ord, PartialEq, PartialOrd)]
struct Person {
    name: String,
    age: u32
}

impl Person {
    pub fn new(name: String, age: u32) -> Self {
        Person {
            name,
            age
        }
    }
}

fn main() {
    let mut people = vec![
        Person::new("Zoe".to_string(), 25),
        Person::new("Al".to_string(), 60),
        Person::new("John".to_string(), 1),
    ];

    // 通过派生后的自然顺序(Name and age)排序
    people.sort();

    assert_eq!(
        people,
        vec![
            Person::new("Al".to_string(), 60),
            Person::new("John".to_string(), 1),
            Person::new("Zoe".to_string(), 25),
        ]);

    // 只通过 age 排序
    people.sort_by(|a, b| b.age.cmp(&a.age));

    assert_eq!(
        people,
        vec![
            Person::new("Al".to_string(), 60),
            Person::new("Zoe".to_string(), 25),
            Person::new("John".to_string(), 1),
        ]);

}
```