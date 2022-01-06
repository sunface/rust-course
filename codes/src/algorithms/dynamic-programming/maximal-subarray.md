# 最大子数组

```rust
/// ## maximum subarray via Dynamic Programming

/// maximum_subarray(array) find the subarray (containing at least one number) which has the largest sum
/// and return its sum.
///
/// A subarray is a contiguous part of an array.
///
/// Arguments:
///     * `array` - an integer array
/// Complexity
///     - time complexity: O(array.length),
///     - space complexity: O(array.length),
pub fn maximum_subarray(array: &[i32]) -> i32 {
    let mut dp = vec![0; array.len()];
    dp[0] = array[0];
    let mut result = dp[0];

    for i in 1..array.len() {
        if dp[i - 1] > 0 {
            dp[i] = dp[i - 1] + array[i];
        } else {
            dp[i] = array[i];
        }
        result = result.max(dp[i]);
    }

    result
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn non_negative() {
        //the maximum value: 1 + 0 + 5 + 8 = 14
        let array = vec![1, 0, 5, 8];
        assert_eq!(maximum_subarray(&array), 14);
    }

    #[test]
    fn negative() {
        //the maximum value: -1
        let array = vec![-3, -1, -8, -2];
        assert_eq!(maximum_subarray(&array), -1);
    }

    #[test]
    fn normal() {
        //the maximum value: 3 + (-2) + 5 = 6
        let array = vec![-4, 3, -2, 5, -8];
        assert_eq!(maximum_subarray(&array), 6);
    }

    #[test]
    fn single_element() {
        let array = vec![6];
        assert_eq!(maximum_subarray(&array), 6);
        let array = vec![-6];
        assert_eq!(maximum_subarray(&array), -6);
    }
}
```