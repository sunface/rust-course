# 插入排序

```rust
pub fn insertion_sort<T: PartialOrd>(arr: &mut [T]) {
    // 从第二个元素开始排序
    for i in 1..arr.len() {
        // 找到 arr[i] 该插入的位置
        let mut j = i;
        while j > 0 && arr[j - 1] > arr[j] {
            arr.swap(j - 1, j);
            j -= 1;
        }
    }
}

// 这里需要 T: Ord 是因为 binary_search() 方法的限制
pub fn insertion_sort_binary_search<T: Ord>(arr: &mut[T]) {
    // 从第二个元素开始排序
    for i in 1..arr.len() {
        // 利用二分查找获取 arr[i] 应该插入的位置
        let pos = arr[..i].binary_search(&arr[i]).unwrap_or_else(|pos| pos);
        let mut j = i;
        while j > pos {
            arr.swap(j - 1, j);
            j -= 1;
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    mod insertion_sort {
        use super::*;

        #[test]
        fn test_empty_vec() {
            let mut empty_vec: Vec<String> = vec![];
            insertion_sort(&mut empty_vec);
            assert_eq!(empty_vec, Vec::<String>::new());
        }
    
        #[test]
        fn test_number_vec() {
            let mut vec = vec![7, 49, 73, 58, 30, 72, 44, 78, 23, 9];
            insertion_sort(&mut vec);
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
            insertion_sort(&mut vec);
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

    mod insertion_sort_binary_search {
        use super::*;
        
        #[test]
        fn test_empty_vec() {
            let mut empty_vec: Vec<String> = vec![];
            insertion_sort_binary_search(&mut empty_vec);
            assert_eq!(empty_vec, Vec::<String>::new());
        }
    
        #[test]
        fn test_number_vec() {
            let mut vec = vec![7, 49, 73, 58, 30, 72, 44, 78, 23, 9];
            insertion_sort_binary_search(&mut vec);
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
            insertion_sort_binary_search(&mut vec);
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
}
```