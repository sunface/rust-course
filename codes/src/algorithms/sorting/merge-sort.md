# 归并排序

```rust
fn _merge<T: Ord + Copy>(arr: &mut [T], lo: usize, mid: usize, hi: usize) {
    // create temporary arrays to support merge
    let mut left_half = Vec::new();
    let mut right_half = Vec::new();
    for v in arr.iter().take(mid + 1).skip(lo) {
        left_half.push(*v);
    }
    for v in arr.iter().take(hi + 1).skip(mid + 1) {
        right_half.push(*v);
    }

    let lsize = left_half.len();
    let rsize = right_half.len();

    // pointers to track the positions while merging
    let mut l = 0;
    let mut r = 0;
    let mut a = lo;

    // pick smaller element one by one from either left or right half
    while l < lsize && r < rsize {
        if left_half[l] < right_half[r] {
            arr[a] = left_half[l];
            l += 1;
        } else {
            arr[a] = right_half[r];
            r += 1;
        }
        a += 1;
    }

    // put all the remaining ones
    while l < lsize {
        arr[a] = left_half[l];
        l += 1;
        a += 1;
    }

    while r < rsize {
        arr[a] = right_half[r];
        r += 1;
        a += 1;
    }
}

fn _merge_sort<T: Ord + Copy>(arr: &mut [T], lo: usize, hi: usize) {
    if lo < hi {
        let mid = lo + (hi - lo) / 2;
        _merge_sort(arr, lo, mid);
        _merge_sort(arr, mid + 1, hi);
        _merge(arr, lo, mid, hi);
    }
}

pub fn merge_sort<T: Ord + Copy>(arr: &mut [T]) {
    let len = arr.len();
    if len > 1 {
        _merge_sort(arr, 0, len - 1);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn basic() {
        let mut res = vec![10, 8, 4, 3, 1, 9, 2, 7, 5, 6];
        merge_sort(&mut res);
        assert_eq!(res, vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    }

    #[test]
    fn basic_string() {
        let mut res = vec!["a", "bb", "d", "cc"];
        merge_sort(&mut res);
        assert_eq!(res, vec!["a", "bb", "cc", "d"]);
    }

    #[test]
    fn empty() {
        let mut res = Vec::<u8>::new();
        merge_sort(&mut res);
        assert_eq!(res, vec![]);
    }

    #[test]
    fn one_element() {
        let mut res = vec![1];
        merge_sort(&mut res);
        assert_eq!(res, vec![1]);
    }

    #[test]
    fn pre_sorted() {
        let mut res = vec![1, 2, 3, 4];
        merge_sort(&mut res);
        assert_eq!(res, vec![1, 2, 3, 4]);
    }

    #[test]
    fn reverse_sorted() {
        let mut res = vec![4, 3, 2, 1];
        merge_sort(&mut res);
        assert_eq!(res, vec![1, 2, 3, 4]);
    }
}
```