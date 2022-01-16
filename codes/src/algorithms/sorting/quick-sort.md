# 快速排序

```rust
pub fn quick_sort<T: PartialOrd>(arr: &mut [T]) {
    if arr.len() > 1 {
        quick_sort_range(arr, 0, arr.len() - 1);
    }
}

fn quick_sort_range<T: PartialOrd>(arr: &mut [T], lo: usize, hi: usize) {
    // 只有当元素个数大于一时才进行排序
    if lo < hi {
        let pos = partition(arr, lo, hi);
        // let pos = partition_random(arr, lo, hi);
        if pos != 0 {
            // 如果 pos == 0, pos - 1 会发生溢出错误
            quick_sort_range(arr, lo, pos - 1);
        }
        quick_sort_range(arr, pos + 1, hi);
    }
}

fn partition<T: PartialOrd>(arr: &mut [T], lo: usize, hi: usize) -> usize {
    // 默认选取 lo 作为 pivot
    let pivot = lo;

    let (mut left, mut right) = (lo, hi);
    while left < right {
        // 找到右边第一个不大于等于 arr[pivot] 的元素
        while left < right && arr[right] >= arr[pivot] {
            right -= 1;
        }

        // 找到左边第一个不小于等于 arr[pivot] 的元素
        while left < right && arr[left] <= arr[pivot] {
            left += 1;
        }
        
        // 交换前面找到的两个元素
        if left != right {
            arr.swap(left, right);
        }
    }

    arr.swap(pivot, left);

    // 返回正确的分割位置
    left
}

// 随机选取 pivot 的位置
fn partition_random<T: PartialOrd>(arr: &mut [T], lo: usize, hi: usize) -> usize {
    // 在 Cargo.toml 的依赖中添加 rand 库
    use rand::Rng;
    let mut rng = rand::thread_rng();
    let pivot = rng.gen_range(lo..=hi);

    // 交换 lo 和 pivot 位置上的元素，从而间接使得 pivot = lo
    // 因此后序操作和 partition() 函数一致
    arr.swap(lo, pivot);

    let pivot = lo;
    let (mut left, mut right) = (lo, hi);
    while left < right {
        // 找到右边第一个不大于等于 arr[pivot] 的元素
        while left < right && arr[right] >= arr[pivot] {
            right -= 1;
        }

        // 找到左边第一个不小于等于 arr[pivot] 的元素
        while left < right && arr[left] <= arr[pivot] {
            left += 1;
        }
        
        // 交换前面找到的两个元素
        if left != right {
            arr.swap(left, right);
        }
    }

    arr.swap(pivot, left);

    // 返回正确的分割位置
    left
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_empty_vec() {
        let mut empty_vec: Vec<String> = vec![];
        quick_sort(&mut empty_vec);
        assert_eq!(empty_vec, Vec::<String>::new());
    }

    #[test]
    fn test_number_vec() {
        let mut vec = vec![7, 49, 73, 58, 30, 72, 44, 78, 23, 9];
        quick_sort(&mut vec);
        assert_eq!(vec, vec![7, 9, 23, 30, 44, 49, 58, 72, 73, 78]);
    }

    #[test]
    fn test_string_vec() {
        let mut vec = vec![
            String::from("Bob"),
            String::from("David"),
            String::from("Carol"),
            String::from("Alice"),
        ];
        quick_sort(&mut vec);
        assert_eq!(
            vec,
            vec![
                String::from("Alice"),
                String::from("Bob"),
                String::from("Carol"),
                String::from("David"),
            ]
        );
    }
}
```