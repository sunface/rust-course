# 最长连续递增序列

```rust
pub fn longest_continuous_increasing_subsequence<T: Ord>(input_array: &[T]) -> &[T] {
    let length: usize = input_array.len();

    //Handle the base cases
    if length <= 1 {
        return input_array;
    }

    //Create the array to store the longest subsequence at each location
    let mut tracking_vec = vec![1; length];

    //Iterate through the input and store longest subsequences at each location in the vector
    for i in (0..length - 1).rev() {
        if input_array[i] < input_array[i + 1] {
            tracking_vec[i] = tracking_vec[i + 1] + 1;
        }
    }

    //Find the longest subsequence
    let mut max_index: usize = 0;
    let mut max_value: i32 = 0;
    for (index, value) in tracking_vec.iter().enumerate() {
        if value > &max_value {
            max_value = *value;
            max_index = index;
        }
    }

    &input_array[max_index..max_index + max_value as usize]
}

#[cfg(test)]
mod tests {
    use super::longest_continuous_increasing_subsequence;

    #[test]
    fn test_longest_increasing_subsequence() {
        //Base Cases
        let base_case_array: [i32; 0] = [];
        assert_eq!(
            &longest_continuous_increasing_subsequence(&base_case_array),
            &[]
        );
        assert_eq!(&longest_continuous_increasing_subsequence(&[1]), &[1]);

        //Normal i32 Cases
        assert_eq!(
            &longest_continuous_increasing_subsequence(&[1, 2, 3, 4]),
            &[1, 2, 3, 4]
        );
        assert_eq!(
            &longest_continuous_increasing_subsequence(&[1, 2, 2, 3, 4, 2]),
            &[2, 3, 4]
        );
        assert_eq!(
            &longest_continuous_increasing_subsequence(&[5, 4, 3, 2, 1]),
            &[5]
        );
        assert_eq!(
            &longest_continuous_increasing_subsequence(&[5, 4, 3, 4, 2, 1]),
            &[3, 4]
        );

        //Non-Numeric case
        assert_eq!(
            &longest_continuous_increasing_subsequence(&['a', 'b', 'c']),
            &['a', 'b', 'c']
        );
        assert_eq!(
            &longest_continuous_increasing_subsequence(&['d', 'c', 'd']),
            &['c', 'd']
        );
    }
}
```