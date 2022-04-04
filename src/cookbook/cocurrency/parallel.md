# 任务并行处理

### 并行修改数组中的元素

[rayon](https://docs.rs/rayon/1.5.1/rayon/index.html) 提供了一个 [par_iter_mut](https://docs.rs/rayon/*/rayon/iter/trait.IntoParallelRefMutIterator.html#tymethod.par_iter_mut) 方法用于并行化迭代一个数据集合。

```rust,editable
use rayon::prelude::*;

fn main() {
    let mut arr = [0, 7, 9, 11];
    arr.par_iter_mut().for_each(|p| *p -= 1);
    println!("{:?}", arr);
}
```

### 并行测试集合中的元素是否满足给定的条件

[rayon::any](https://docs.rs/rayon/*/rayon/iter/trait.ParallelIterator.html#method.any) 和 [rayon::all](https://docs.rs/rayon/*/rayon/iter/trait.ParallelIterator.html#method.all) 类似于 [std::any](https://doc.rust-lang.org/std/iter/trait.Iterator.html#method.any) / [std::all](https://doc.rust-lang.org/std/iter/trait.Iterator.html#method.all) ，但是是并行版本的。

- `rayon::any` 并行检查迭代器中是否有任何元素满足给定的条件，一旦发现符合条件的元素，就立即返回
- `rayon::all` 并行检查迭代器中的所有元素是否满足给定的条件，一旦发现不满足条件的元素，就立即返回

```rust,editable
use rayon::prelude::*;

fn main() {
    let mut vec = vec![2, 4, 6, 8];

    assert!(!vec.par_iter().any(|n| (*n % 2) != 0));
    assert!(vec.par_iter().all(|n| (*n % 2) == 0));
    assert!(!vec.par_iter().any(|n| *n > 8 ));
    assert!(vec.par_iter().all(|n| *n <= 8 ));

    vec.push(9);

    assert!(vec.par_iter().any(|n| (*n % 2) != 0));
    assert!(!vec.par_iter().all(|n| (*n % 2) == 0));
    assert!(vec.par_iter().any(|n| *n > 8 ));
    assert!(!vec.par_iter().all(|n| *n <= 8 )); 
}
```

### 使用给定条件并行搜索
下面例子使用 [par_iter](https://docs.rs/rayon/*/rayon/iter/trait.IntoParallelRefIterator.html#tymethod.par_iter) 和 [rayon::find_any](https://docs.rs/rayon/*/rayon/iter/trait.ParallelIterator.html#method.find_any) 来并行搜索一个数组，直到找到任意一个满足条件的元素。

如果有多个元素满足条件，`rayon` 会返回第一个找到的元素，注意：第一个找到的元素未必是数组中的顺序最靠前的那个。

```rust,editable
use rayon::prelude::*;

fn main() {
    let v = vec![6, 2, 1, 9, 3, 8, 11];

    // 这里使用了 `&&x` 的形式，大家可以在以下链接阅读更多 https://doc.rust-lang.org/std/iter/trait.Iterator.html#method.find
    let f1 = v.par_iter().find_any(|&&x| x == 9);
    let f2 = v.par_iter().find_any(|&&x| x % 2 == 0 && x > 6);
    let f3 = v.par_iter().find_any(|&&x| x > 8);

    assert_eq!(f1, Some(&9));
    assert_eq!(f2, Some(&8));
    assert!(f3 > Some(&8));
}
```

### 对数组进行并行排序
下面的例子将对字符串数组进行并行排序。

[par_sort_unstable](https://docs.rs/rayon/*/rayon/slice/trait.ParallelSliceMut.html#method.par_sort_unstable) 方法的排序性能往往要比[稳定的排序算法](https://docs.rs/rayon/1.5.1/rayon/slice/trait.ParallelSliceMut.html#method.par_sort)更高。


```rust,editable
use rand::{Rng, thread_rng};
use rand::distributions::Alphanumeric;
use rayon::prelude::*;

fn main() {
  let mut vec = vec![String::new(); 100_000];
  // 并行生成数组中的字符串
  vec.par_iter_mut().for_each(|p| {
    let mut rng = thread_rng();
    *p = (0..5).map(|_| rng.sample(&Alphanumeric)).collect()
  });
  
  // 
  vec.par_sort_unstable();
}
```

### 并行化 Map-Reuduce

下面例子使用 [rayon::filter](https://docs.rs/rayon/*/rayon/iter/trait.ParallelIterator.html#method.filter), [rayon::map](https://docs.rs/rayon/*/rayon/iter/trait.ParallelIterator.html#method.map), 和 [rayon::reduce](https://docs.rs/rayon/*/rayon/iter/trait.ParallelIterator.html#method.reduce) 来超过 30 岁的 `Person` 的平均年龄。

- `rayon::filter` 返回集合中所有满足给定条件的元素
- `rayon::map` 对集合中的每一个元素执行一个操作，创建并返回新的迭代器，类似于[迭代器适配器](https://course.rs/advance/functional-programing/iterator.html#迭代器适配器)
- `rayon::reduce` 则迭代器的元素进行不停的聚合运算，直到获取一个最终结果，这个结果跟例子中 `rayon::sum` 获取的结果是相同的

```rust,editable
use rayon::prelude::*;

struct Person {
    age: u32,
}

fn main() {
    let v: Vec<Person> = vec![
        Person { age: 23 },
        Person { age: 19 },
        Person { age: 42 },
        Person { age: 17 },
        Person { age: 17 },
        Person { age: 31 },
        Person { age: 30 },
    ];

    let num_over_30 = v.par_iter().filter(|&x| x.age > 30).count() as f32;
    let sum_over_30 = v.par_iter()
        .map(|x| x.age)
        .filter(|&x| x > 30)
        .reduce(|| 0, |x, y| x + y);

    let alt_sum_30: u32 = v.par_iter()
        .map(|x| x.age)
        .filter(|&x| x > 30)
        .sum();

    let avg_over_30 = sum_over_30 as f32 / num_over_30;
    let alt_avg_over_30 = alt_sum_30 as f32/ num_over_30;

    assert!((avg_over_30 - alt_avg_over_30).abs() < std::f32::EPSILON);
    println!("The average age of people older than 30 is {}", avg_over_30);
}
```

### 并行生成缩略图
下面例子将为目录中的所有图片并行生成缩略图，然后将结果存到新的目录 `thumbnails` 中。

[glob::glob_with](https://docs.rs/glob/*/glob/fn.glob_with.html) 可以找出当前目录下的所有 `.jpg` 文件，`rayon` 通过 [DynamicImage::resize](https://docs.rs/image/*/image/enum.DynamicImage.html#method.resize) 来并行调整图片的大小。

```rust,editable
# use error_chain::error_chain;

use std::path::Path;
use std::fs::create_dir_all;

# use error_chain::ChainedError;
use glob::{glob_with, MatchOptions};
use image::{FilterType, ImageError};
use rayon::prelude::*;

# error_chain! {
#    foreign_links {
#        Image(ImageError);
#        Io(std::io::Error);
#        Glob(glob::PatternError);
#    }
#}

fn main() -> Result<()> {
    let options: MatchOptions = Default::default();
    // 找到当前目录中的所有 `jpg` 文件
    let files: Vec<_> = glob_with("*.jpg", options)?
        .filter_map(|x| x.ok())
        .collect();

    if files.len() == 0 {
        error_chain::bail!("No .jpg files found in current directory");
    }

    let thumb_dir = "thumbnails";
    create_dir_all(thumb_dir)?;

    println!("Saving {} thumbnails into '{}'...", files.len(), thumb_dir);

    let image_failures: Vec<_> = files
        .par_iter()
        .map(|path| {
            make_thumbnail(path, thumb_dir, 300)
                .map_err(|e| e.chain_err(|| path.display().to_string()))
        })
        .filter_map(|x| x.err())
        .collect();

    image_failures.iter().for_each(|x| println!("{}", x.display_chain()));

    println!("{} thumbnails saved successfully", files.len() - image_failures.len());
    Ok(())
}

fn make_thumbnail<PA, PB>(original: PA, thumb_dir: PB, longest_edge: u32) -> Result<()>
where
    PA: AsRef<Path>,
    PB: AsRef<Path>,
{
    let img = image::open(original.as_ref())?;
    let file_path = thumb_dir.as_ref().join(original);

    Ok(img.resize(longest_edge, longest_edge, FilterType::Nearest)
        .save(file_path)?)
}
```