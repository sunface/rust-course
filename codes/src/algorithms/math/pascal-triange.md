# 帕斯卡三角

```rust
/// ## Paslcal's triangle problem

/// pascal_triangle(num_rows) returns the first num_rows of Pascal's triangle.
/// About Pascal's triangle: https://en.wikipedia.org/wiki/Pascal%27s_triangle
///
/// Arguments:
///     * `num_rows` - number of rows of triangle
/// Complexity
///     - time complexity: O(n^2),
///     - space complexity: O(n^2),
pub fn pascal_triangle(num_rows: i32) -> Vec<Vec<i32>> {
    let mut ans: Vec<Vec<i32>> = vec![];

    for i in 1..num_rows + 1 {
        let mut vec: Vec<i32> = vec![1];

        let mut res: i32 = 1;
        for k in 1..i {
            res *= i - k;
            res /= k;
            vec.push(res);
        }
        ans.push(vec);
    }

    ans
}

#[cfg(test)]
mod tests {
    use super::pascal_triangle;

    #[test]
    fn test() {
        assert_eq!(pascal_triangle(3), vec![vec![1], vec![1, 1], vec![1, 2, 1]]);
        assert_eq!(
            pascal_triangle(4),
            vec![vec![1], vec![1, 1], vec![1, 2, 1], vec![1, 3, 3, 1]]
        );
        assert_eq!(
            pascal_triangle(5),
            vec![
                vec![1],
                vec![1, 1],
                vec![1, 2, 1],
                vec![1, 3, 3, 1],
                vec![1, 4, 6, 4, 1]
            ]
        );
    }
}
```