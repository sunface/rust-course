# 最大正方形

```rust
use std::cmp::max;
use std::cmp::min;

/// Maximal Square
/// Given an m x n binary matrix filled with 0's and 1's, find the largest square containing only 1's and return its area.
/// https://leetcode.com/problems/maximal-square/
///
/// Arguments:
///     * `matrix` - an array of integer array
/// Complexity
///     - time complexity: O(n^2),
///     - space complexity: O(n),
pub fn maximal_square(matrix: &mut Vec<Vec<i32>>) -> i32 {
    if matrix.is_empty() {
        return 0;
    }

    let rows = matrix.len();
    let cols = matrix[0].len();
    let mut result: i32 = 0;

    for row in 0..rows {
        for col in 0..cols {
            if matrix[row][col] == 1 {
                if row == 0 || col == 0 {
                    result = max(result, 1);
                } else {
                    let temp = min(matrix[row - 1][col - 1], matrix[row - 1][col]);

                    let count: i32 = min(temp, matrix[row][col - 1]) + 1;
                    result = max(result, count);

                    matrix[row][col] = count;
                }
            }
        }
    }

    result * result
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test() {
        assert_eq!(maximal_square(&mut vec![]), 0);

        let mut matrix = vec![vec![0, 1], vec![1, 0]];
        assert_eq!(maximal_square(&mut matrix), 1);

        let mut matrix = vec![
            vec![1, 0, 1, 0, 0],
            vec![1, 0, 1, 1, 1],
            vec![1, 1, 1, 1, 1],
            vec![1, 0, 0, 1, 0],
        ];
        assert_eq!(maximal_square(&mut matrix), 4);

        let mut matrix = vec![vec![0]];
        assert_eq!(maximal_square(&mut matrix), 0);
    }
}
```