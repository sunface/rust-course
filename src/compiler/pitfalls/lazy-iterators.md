# 不太勤快的迭代器

迭代器，在 Rust 中是一个非常耀眼的存在，它光鲜亮丽，它让 Rust 大道至简，它备受用户的喜爱。可是，它也是懒惰的，不信？一起来看看。

## for 循环 vs 迭代器

在迭代器学习中，我们提到过迭代器在功能上可以替代循环，性能上略微优于循环(避免边界检查),安全性上优于循环，因此在 Rust 中，迭代器往往都是更优的选择，前提是迭代器得发挥作用。

在下面代码中，分别是使用`for`循环和迭代器去生成一个`HashMap`。

使用循环:

```rust,ignore,mdbook-runnable
use std::collections::HashMap;
#[derive(Debug)]
struct Account {
    id: u32,
}

fn main() {
    let accounts = [Account { id: 1 }, Account { id: 2 }, Account { id: 3 }];

    let mut resolvers = HashMap::new();
    for a in accounts {
        resolvers.entry(a.id).or_insert(Vec::new()).push(a);
    }

    println!("{:?}",resolvers);
}
```

使用迭代器:

```rust,ignore,mdbook-runnable
let mut resolvers = HashMap::new();
accounts.into_iter().map(|a| {
    resolvers
        .entry(a.id)
        .or_insert(Vec::new())
        .push(a);
});
println!("{:?}",resolvers);
```

#### 预料之外的结果

两端代码乍一看(很多时候我们快速浏览代码的时候，不会去细看)都很正常, 运行下试试:

- `for`循环很正常，输出`{2: [Account { id: 2 }], 1: [Account { id: 1 }], 3: [Account { id: 3 }]}`
- 迭代器很。。。不正常，输出了一个`{}`, 黑人问号`? ?` **?**

在继续深挖之前，我们先来简单回顾下迭代器。

## 回顾下迭代器

在迭代器章节中，我们曾经提到过，迭代器的[适配器](https://course.rs/advance/functional-programing/iterator.html#消费者与适配器)分为两种：消费者适配器和迭代器适配器，前者用来将一个迭代器变为指定的集合类型，往往通过`collect`实现；后者用于生成一个新的迭代器，例如上例中的`map`。

还提到过非常重要的一点: **迭代器适配器都是懒惰的，只有配合消费者适配器使用时，才会进行求值**.

## 懒惰是根因

在我们之前的迭代器示例中，只有一个迭代器适配器`map`:

```rust,ignore,mdbook-runnable
accounts.into_iter().map(|a| {
    resolvers
        .entry(a.id)
        .or_insert(Vec::new())
        .push(a);
});
```

首先, `accounts`被拿走所有权后转换成一个迭代器，其次该迭代器通过`map`方法生成一个新的迭代器，最后，在此过程中没有以类如`collect`的消费者适配器收尾。

因此在上述过程中，`map`完全是懒惰的，它没有做任何事情，它在等一个消费者适配器告诉它：赶紧起床，任务可以开始了，它才会开始行动。

自然，我们的插值计划也失败了。

> 事实上，IDE 和编译器都会对这种代码给出警告：iterators are lazy and do nothing unless consumed

## 解决办法

原因非常清晰，如果读者还有疑惑，建议深度了解下上面给出的迭代器链接，我们这里就不再赘述。

下面列出三种合理的解决办法：

1. 不再使用迭代器适配器`map`，改成`for_each`:

```rust,ignore,mdbook-runnable
let mut resolvers = HashMap::new();
accounts.into_iter().for_each(|a| {
    resolvers
        .entry(a.id)
        .or_insert(Vec::new())
        .push(a);
});
```

但是，相关的文档也友善的提示了我们，除非作为链式调用的收尾，否则更建议使用`for`循环来处理这种情况。哎，忙忙碌碌，又回到了原点，不禁让人感叹：天道有轮回。

2. 使用消费者适配器`collect`来收尾，将`map`产生的迭代器收集成一个集合类型:

```rust,ignore,mdbook-runnable
let resolvers: HashMap<_, _> = accounts
.into_iter()
.map(|a| (a.id, a))
.collect();
```

嗯，还挺简洁，挺`rusty`.

3. 使用`fold`，语义表达更强:

```rust,ignore,mdbook-runnable
let resolvers = account.into_iter().fold(HashMap::new(), |mut resolvers, a|{
    resolvers.entry(a.id).or_insert(Vec::new()).push(a);
    resolvers
});
```

## 总结

在使用迭代器时，要清晰的认识到需要用到的方法是迭代型还是消费型适配器，如果一个调用链中没有以消费型适配器结尾，就需要打起精神了，也许，不远处就是一个陷阱在等你跳:)
