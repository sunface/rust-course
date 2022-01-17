# KV存储HashMap

和动态数组一样，`HashMap` 也是 Rust 标准库中提供的集合类型，但是又与动态数组不同，`HashMap` 中存储的是一一映射的 `KV `键值对，并提供了平均复杂度为 `O(1)` 的查询方法，当我们希望通过一个 `Key` 去查询值时，该类型非常有用，以致于 `Go语言` 将该类型设置成了语言级别的内置特性。

Rust 中哈希(Map？)类型为 `HashMap<K,V>`，在其它语言中，也有类似的数据结构，例如 `hash map`，`map`，`object`，`hash table`，`字典`等等，引用小品演员孙涛的一句台词：大家都是本地狐狸，别搁那装貂 :)。

## 创建HashMap

跟创建动态数组 `Vec` 的方法类似，可以使用 `new` 方法来创建` HashMap`，然后通过` insert` 方法插入键值对。

#### 使用new方法创建
```rust
use std::collections::HashMap;

// 创建一个HashMap，用于存储宝石种类和对应的数量
let mut my_gems = HashMap::new();

// 将宝石类型和对应的数量写入表中
my_gems.insert("红宝石", 1);
my_gems.insert("蓝宝石", 2);
my_gems.insert("河边捡的误以为是宝石的破石头", 18);
```

很简单对吧？跟其它语言没有区别，聪明的同学甚至能够猜到该 `HashMap` 的类型： `HashMap<&str,i32>`。

但是还有一点，你可能没有注意，那就是使用 `HashMap` 需要手动通过 `use ...` 从标准库中引入到我们当前的作用域中来，仔细回忆下，之前使用另外两个集合类型 `String` 和` Vec` 时，我们是否有手动引用过？答案是 `No`，因为 `HashMap` 并没有包含在Rust的[`prelude`](../../appendix/prelude.md)中(Rust为了简化用户使用，提前将最常用的类型自动引入到作用域中)。

所有的集合类型都是动态的，意味着它们没有固定的内存大小，因此它们底层的数据都存储在内存堆上，然后通过一个存储在栈中的引用类型来访问。同时，跟其它集合类型一致，`HashMap` 也是内聚性的，即所有的`K`必须拥有同样的类型，`V`也是如此。

> 跟Vec一样，如果预先知道要存储的KV对个数，可以使用 `HashMap::with_capacity(capacity)` 创建指定大小的HashMap，避免频繁的内存分配和拷贝，提升性能

#### 使用迭代器和collect方法创建
在实际使用中，不是所有的场景都能 `new` 一个哈希表后，然后悠哉悠哉的依次插入对应的键值对，而是可能会从另外一个数据结构中，获取到对应的数据，最终生成 `HashMap`。

例如考虑一个场景，有一张表格中记录了足球联赛中各队伍名称和积分的信息，这张表如果被导入到Rust项目中，一个合理的数据结构是 `Vec<(String,u32)>` 类型，该数组中的元素是一个个元组，该数据结构跟表格数据非常契合：表格中的数据都是逐行存储，每一个行都存有一个 `(队伍名称,积分)` 的信息。

但是在很多时候，又需要通过队伍名称来查询对应的积分，此时动态数组就不适用了，因此可以用 `HashMap` 来保存相关的**队伍名称 -> 积分**映射关系。 理想很骨感，现实很丰满，如何将 `Vec<(String, u32)>` 中的数据快速写入到`HashMap<String, u32>`中？

一个动动脚趾头就能想到的笨方法如下：
```rust
fn main() {
    use std::collections::HashMap;

    let teams_list = vec![
        ("中国队".to_string(), 100),
        ("美国队".to_string(),10),
        ("日本队".to_string(),50),
    ];

    let mut teams_map = HashMap::new();
    for team in &teams_list {
        teams_map.insert(&team.0, team.1);
    }
    
    println!("{:?}",teams_map)
}
```

遍历列表，将每一个元组作为一对 `KV `插入到 `HashMap` 中，很简单，但是。。。也不太聪明的样子，换个词说就是 - 不够`rusty`。

好在，Rust为我们提供了一个非常精妙的解决办法：先将 `Vec` 转为迭代器，接着通过 `collect` 方法，将迭代器中的元素收集后，转成 `HashMap`：
```rust
fn main() {
    use std::collections::HashMap;

    let teams_list = vec![
        ("中国队".to_string(), 100),
        ("美国队".to_string(),10),
        ("日本队".to_string(),50),
    ];

    let teams_map: HashMap<_,_> = teams_list.into_iter().collect();
    
    println!("{:?}",teams_map)
}
```

代码很简单，`into_iter` 方法将列表转为迭代器，接着通过 `collect` 进行收集，不过需要注意的是，`collect` 方法在内部实际上支持生成多种类型的目标集合，因为我们需要通过类型标注 `HashMap<_,_>` 来告诉编译器：请帮我们收集为 `HashMap` 集合类型，具体的 `KV` 类型，麻烦编译器您老人家帮我们推导。

由此可见，Rust中的编译器时而小聪明，时而大聪明，不过好在，它大聪明的时候，会自家人知道自己事，总归会通知你一声：
```console
error[E0282]: type annotations needed 需要类型标注
  --> src/main.rs:10:9
   |
10 |     let teams_map = teams_list.into_iter().collect(); 
   |         ^^^^^^^^^ consider giving `teams_map` a type 给予teams_map一个具体的类型
```

## 所有权转移

`HashMap` 的所有权规则与其它 Rust 类型没有区别：
- 若类型实现 `Copy` 特征，该类型会被复制进 `HashMap`，因此无所谓所有权
- 若没实现 `Copy` 特征，所有权将被转移给`HashMap`中

例如我参选帅气男孩时的场景再现：
```rust
fn main() {
    use std::collections::HashMap;

    let name = String::from("Sunface");
    let age = 18;

    let mut handsome_boys = HashMap::new();
    handsome_boys.insert(name, age);

    println!("因为过于无耻，{}已经被从帅气男孩名单中除名", name);
    println!("还有，他的真实年龄远远不止{}岁",age);
}
```

运行代码，报错如下：
```console
error[E0382]: borrow of moved value: `name`
  --> src/main.rs:10:32
   |
4  |     let name = String::from("Sunface");
   |         ---- move occurs because `name` has type `String`, which does not implement the `Copy` trait
...
8  |     handsome_boys.insert(name, age);
   |                          ---- value moved here
9  | 
10 |     println!("因为过于无耻，{}已经被除名", name);
   |                                            ^^^^ value borrowed here after move
```

提示很清晰，`name` 是 `String` 类型，因此它受到所有权的限制，在 `insert` 时，它的所有权被转移给 `handsome_boys`，所以最后在使用时，会遇到这个无情但是意料之中的报错。


**如果你使用引用类型放入HashMap中**，请确保该引用的生命周期至少跟 `HashMap` 一样久：
```rust
fn main() {
    use std::collections::HashMap;

    let name = String::from("Sunface");
    let age = 18;

    let mut handsome_boys = HashMap::new();
    handsome_boys.insert(&name, age);

    std::mem::drop(name);
    println!("因为过于无耻，{:?}已经被除名", handsome_boys);
    println!("还有，他的真实年龄远远不止{}岁",age);
}
```

上面代码，我们借用 `name` 获取了它的引用，然后插入到 `handsome_boys` 中，至此一切都很完美。但是紧接着，就通过 `drop` 函数手动将 `name` 字符串从内存中移除，再然后就报错了：
```console
 handsome_boys.insert(&name, age);
   |                          ----- borrow of `name` occurs here // name借用发生在此处
9  | 
10 |     std::mem::drop(name);
   |                    ^^^^ move out of `name` occurs here // name的所有权被转移走
11 |     println!("因为过于无耻，{:?}已经被除名", handsome_boys);
   |                                              ------------- borrow later used here // 所有权转移后，还试图使用name
```

最终，某人因为过于无耻，真正的被除名了 :)

## 查询HashMap
通过 `get` 方法可以获取元素：
```rust
use std::collections::HashMap;

let mut scores = HashMap::new();

scores.insert(String::from("Blue"), 10);
scores.insert(String::from("Yellow"), 50);

let team_name = String::from("Blue");
let score: Option<&i32> = scores.get(&team_name);
```

上面有几点需要注意：
- `get` 方法返回一个 `Option<&i32> `类型：当查询不到时，会返回一个 `None`，查询到时返回 `Some(&i32)`
- `&i32` 是对 `HashMap` 中值的借用，如果不使用借用，可能会发生所有权的转移

还可以通过循环的方式依次遍历 `KV` 对：
```rust
use std::collections::HashMap;

let mut scores = HashMap::new();

scores.insert(String::from("Blue"), 10);
scores.insert(String::from("Yellow"), 50);

for (key, value) in &scores {
    println!("{}: {}", key, value);
}
```
最终输出：
```console
Yellow: 50
Blue: 10
```

## 更新HashMap中的值
更新值的时候，涉及多种情况，咱们在代码中一一进行说明：
```rust
fn main() {
    use std::collections::HashMap;

    let mut scores = HashMap::new();

    scores.insert("Blue", 10);

    // 覆盖已有的值
    let old = scores.insert("Blue", 20);
    assert_eq!(old, Some(10));

    // 查询新插入的值
    let new = scores.get("Blue");
    assert_eq!(new, Some(&20));
    
    // 查询Yellow对应的值，若不存在则插入新值
    let v = scores.entry("Yellow").or_insert(5);
    assert_eq!(*v, 5); // 不存在，插入5

    // 查询Yellow对应的值，若不存在则插入新值
    let v = scores.entry("Yellow").or_insert(50);
    assert_eq!(*v, 5); // 已经存在，因此50没有插入
}
```

具体的解释在代码注释中已有，这里不再进行赘述。

#### 在已有值的基础上更新
另一个常用场景如下：查询某个 `key` 对应的值，若不存在则插入新值，若存在则对已有的值进行更新，例如在文本中统计词语出现的次数：
```rust
use std::collections::HashMap;

let text = "hello world wonderful world";

let mut map = HashMap::new();
// 根据空格来且分字符串(英文单词都是通过空格切分)
for word in text.split_whitespace() {
    let count = map.entry(word).or_insert(0);
    *count += 1;
}

println!("{:?}", map);
```

上面代码中，新建一个 `map` 用于保存词语出现的次数，插入一个词语时会进行判断：若之前没有插入过，则使用该词语作Key，插入次数0作为Value，若之前插入过则取出之前统计的该词语出现的次数，对其进行加一。

有两点值得注意：
- `or_insert` 返回了 `&mut v` 引用，因此可以通过该可变引用直接修改 `map` 中对应的值
- 使用 `count` 引用时，需要先进行解引用 `*count`，否则会出现类型不匹配


## 哈希函数
你肯定比较好奇，为何叫哈希表，到底什么是哈希。

先来设想下，如果要实现 `Key` 与 `Value` 的一一对应，是不是意味着我们要能比较两个 `Key` 的相等性？例如"a"和"b"，1和2，当这些类型做Key且能比较时，可以很容易知道 `1` 对应的值不会错误的映射到 `2` 上，因为 `1` 不等于 `2`。因此，一个类型能否作为 `Key` 的关键就是是否能进行相等比较，或者说该类型是否实现了 `std::cmp::Eq` 特征。

> f32和f64浮点数，没有实现 `std::cmp::Eq` 特征，因此不可以用作 `HashMap` 的 `Key`

好了，理解完这个，再来设想一点，若一个复杂点的类型作为Key，那怎么在底层对它进行存储，怎么使用它进行查询和比较？ 是不是很棘手？好在我们有哈希函数：通过它把 `Key` 计算后映射为哈希值，然后使用该哈希值来进行存储、查询、比较等操作。

但是问题又来了，如何保证不同 `Key` 通过哈希后的两个值不会相同？如果相同，那意味着我们使用不同的 `Key`，却查到了同一个结果，这种明显是错误的行为。
此时，就涉及到安全性跟性能的取舍了。

若要追求安全，尽可能减少冲突，同时防止拒绝服务(Denial of Service, DoS)攻击，就要使用密码学安全的哈希函数，`HashMap` 就是使用了这样的哈希函数。反之若要追求性能，就需要使用没有那么安全的算法。

#### 高性能三方库
因此若性能测试显示当前标准库默认的哈希函数不能满足你的性能需求，就需要去[`crates.io`](https://crates.io)上寻找其它的哈希函数实现，使用方法很简单：
```rust
use std::hash::BuildHasherDefault;
use std::collections::HashMap;
// 引入第三方的哈希函数
use twox_hash::XxHash64;

// 指定HashMap使用第三方的哈希函数XxHash64
let mut hash: HashMap<_, _, BuildHasherDefault<XxHash64>> = Default::default();
hash.insert(42, "the answer");
assert_eq!(hash.get(&42), Some(&"the answer"));
```

> 目前，`HashMap` 使用的哈希函数是 `SipHash`，它的性能不是很高，但是安全性很高。`SipHash` 在中等大小的 `Key` 上，性能相当不错，但是对于小型的 `Key` (例如整数)或者大型 `Key` (例如字符串)来说，性能还是不够好。若你需要极致性能，例如实现算法，可以考虑这个库：[ahash](https://github.com/tkaitchuck/ahash)

最后，如果你想要了解 `HashMap` 更多的用法，请参见本书的标准库解析章节：[HashMap常用方法](../../std/hashmap.md)
