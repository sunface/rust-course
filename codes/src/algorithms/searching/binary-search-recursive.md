# 递归二分查找

```rust
use std::cmp::Ordering;

pub fn binary_search_rec<T: Ord>(
    list_of_items: &[T],
    target: &T,
    left: &usize,
    right: &usize,
) -> Option<usize> {
    if left >= right {
        return None;
    }

    let middle: usize = left + (right - left) / 2;
    match target.cmp(&list_of_items[middle]) {
        Ordering::Less => binary_search_rec(list_of_items, target, left, &middle),
        Ordering::Greater => binary_search_rec(list_of_items, target, &(middle + 1), right),
        Ordering::Equal => Some(middle),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const LEFT: usize = 0;

    #[test]
    fn fail_empty_list() {
        let list_of_items = vec![];
        assert_eq!(
            binary_search_rec(&list_of_items, &1, &LEFT, &list_of_items.len()),
            None
        );
    }

    #[test]
    fn success_one_item() {
        let list_of_items = vec![30];
        assert_eq!(
            binary_search_rec(&list_of_items, &30, &LEFT, &list_of_items.len()),
            Some(0)
        );
    }

    #[test]
    fn success_search_strings() {
        let say_hello_list = vec!["hi", "olá", "salut"];
        let right = say_hello_list.len();
        assert_eq!(
            binary_search_rec(&say_hello_list, &"hi", &LEFT, &right),
            Some(0)
        );
        assert_eq!(
            binary_search_rec(&say_hello_list, &"salut", &LEFT, &right),
            Some(2)
        );
    }

    #[test]
    fn fail_search_strings() {
        let say_hello_list = vec!["hi", "olá", "salut"];
        for target in &["adiós", "你好"] {
            assert_eq!(
                binary_search_rec(&say_hello_list, target, &LEFT, &say_hello_list.len()),
                None
            );
        }
    }

    #[test]
    fn success_search_integers() {
        let integers = vec![0, 10, 20, 30, 40, 50, 60, 70, 80, 90];
        for (index, target) in integers.iter().enumerate() {
            assert_eq!(
                binary_search_rec(&integers, target, &LEFT, &integers.len()),
                Some(index)
            )
        }
    }

    #[test]
    fn fail_search_integers() {
        let integers = vec![0, 10, 20, 30, 40, 50, 60, 70, 80, 90];
        for target in &[100, 444, 336] {
            assert_eq!(
                binary_search_rec(&integers, target, &LEFT, &integers.len()),
                None
            );
        }
    }

    #[test]
    fn fail_search_unsorted_strings_list() {
        let unsorted_strings = vec!["salut", "olá", "hi"];
        for target in &["hi", "salut"] {
            assert_eq!(
                binary_search_rec(&unsorted_strings, target, &LEFT, &unsorted_strings.len()),
                None
            );
        }
    }

    #[test]
    fn fail_search_unsorted_integers_list() {
        let unsorted_integers = vec![90, 80, 70, 60, 50, 40, 30, 20, 10, 0];
        for target in &[0, 80, 90] {
            assert_eq!(
                binary_search_rec(&unsorted_integers, target, &LEFT, &unsorted_integers.len()),
                None
            );
        }
    }

    #[test]
    fn success_search_string_in_middle_of_unsorted_list() {
        let unsorted_strings = vec!["salut", "olá", "hi"];
        assert_eq!(
            binary_search_rec(&unsorted_strings, &"olá", &LEFT, &unsorted_strings.len()),
            Some(1)
        );
    }

    #[test]
    fn success_search_integer_in_middle_of_unsorted_list() {
        let unsorted_integers = vec![90, 80, 70];
        assert_eq!(
            binary_search_rec(&unsorted_integers, &80, &LEFT, &unsorted_integers.len()),
            Some(1)
        );
    }
}
```