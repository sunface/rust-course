# 背包问题

```rust
//! Solves the knapsack problem
use std::cmp::max;

/// knapsack_table(w, weights, values) returns the knapsack table (`n`, `m`) with maximum values, where `n` is number of items
///
/// Arguments:
///     * `w` - knapsack capacity
///     * `weights` - set of weights for each item
///     * `values` - set of values for each item
fn knapsack_table(w: &usize, weights: &[usize], values: &[usize]) -> Vec<Vec<usize>> {
    // Initialize `n` - number of items
    let n: usize = weights.len();
    // Initialize `m`
    // m[i, w] - the maximum value that can be attained with weight less that or equal to `w` using items up to `i`
    let mut m: Vec<Vec<usize>> = vec![vec![0; w + 1]; n + 1];

    for i in 0..=n {
        for j in 0..=*w {
            // m[i, j] compiled according to the following rule:
            if i == 0 || j == 0 {
                m[i][j] = 0;
            } else if weights[i - 1] <= j {
                // If `i` is in the knapsack
                // Then m[i, j] is equal to the maximum value of the knapsack,
                // where the weight `j` is reduced by the weight of the `i-th` item and the set of admissible items plus the value `k`
                m[i][j] = max(values[i - 1] + m[i - 1][j - weights[i - 1]], m[i - 1][j]);
            } else {
                // If the item `i` did not get into the knapsack
                // Then m[i, j] is equal to the maximum cost of a knapsack with the same capacity and a set of admissible items
                m[i][j] = m[i - 1][j]
            }
        }
    }
    m
}

/// knapsack_items(weights, m, i, j) returns the indices of the items of the optimal knapsack (from 1 to `n`)
///
/// Arguments:
///     * `weights` - set of weights for each item
///     * `m` - knapsack table with maximum values
///     * `i` - include items 1 through `i` in knapsack (for the initial value, use `n`)
///     * `j` - maximum weight of the knapsack
fn knapsack_items(weights: &[usize], m: &[Vec<usize>], i: usize, j: usize) -> Vec<usize> {
    if i == 0 {
        return vec![];
    }
    if m[i][j] > m[i - 1][j] {
        let mut knap: Vec<usize> = knapsack_items(weights, m, i - 1, j - weights[i - 1]);
        knap.push(i);
        knap
    } else {
        knapsack_items(weights, m, i - 1, j)
    }
}

/// knapsack(w, weights, values) returns the tuple where first value is `optimal profit`,
/// second value is `knapsack optimal weight` and the last value is `indices of items`, that we got (from 1 to `n`)
///
/// Arguments:
///     * `w` - knapsack capacity
///     * `weights` - set of weights for each item
///     * `values` - set of values for each item
///
/// Complexity
///     - time complexity: O(nw),
///     - space complexity: O(nw),
///
/// where `n` and `w` are `number of items` and `knapsack capacity`
pub fn knapsack(w: usize, weights: Vec<usize>, values: Vec<usize>) -> (usize, usize, Vec<usize>) {
    // Checks if the number of items in the list of weights is the same as the number of items in the list of values
    assert_eq!(weights.len(), values.len(), "Number of items in the list of weights doesn't match the number of items in the list of values!");
    // Initialize `n` - number of items
    let n: usize = weights.len();
    // Find the knapsack table
    let m: Vec<Vec<usize>> = knapsack_table(&w, &weights, &values);
    // Find the indices of the items
    let items: Vec<usize> = knapsack_items(&weights, &m, n, w);
    // Find the total weight of optimal knapsack
    let mut total_weight: usize = 0;
    for i in items.iter() {
        total_weight += weights[i - 1];
    }
    // Return result
    (m[n][w], total_weight, items)
}

#[cfg(test)]
mod tests {
    // Took test datasets from https://people.sc.fsu.edu/~jburkardt/datasets/bin_packing/bin_packing.html
    use super::*;

    #[test]
    fn test_p02() {
        assert_eq!(
            (51, 26, vec![2, 3, 4]),
            knapsack(26, vec![12, 7, 11, 8, 9], vec![24, 13, 23, 15, 16])
        );
    }

    #[test]
    fn test_p04() {
        assert_eq!(
            (150, 190, vec![1, 2, 5]),
            knapsack(
                190,
                vec![56, 59, 80, 64, 75, 17],
                vec![50, 50, 64, 46, 50, 5]
            )
        );
    }

    #[test]
    fn test_p01() {
        assert_eq!(
            (309, 165, vec![1, 2, 3, 4, 6]),
            knapsack(
                165,
                vec![23, 31, 29, 44, 53, 38, 63, 85, 89, 82],
                vec![92, 57, 49, 68, 60, 43, 67, 84, 87, 72]
            )
        );
    }

    #[test]
    fn test_p06() {
        assert_eq!(
            (1735, 169, vec![2, 4, 7]),
            knapsack(
                170,
                vec![41, 50, 49, 59, 55, 57, 60],
                vec![442, 525, 511, 593, 546, 564, 617]
            )
        );
    }

    #[test]
    fn test_p07() {
        assert_eq!(
            (1458, 749, vec![1, 3, 5, 7, 8, 9, 14, 15]),
            knapsack(
                750,
                vec![70, 73, 77, 80, 82, 87, 90, 94, 98, 106, 110, 113, 115, 118, 120],
                vec![135, 139, 149, 150, 156, 163, 173, 184, 192, 201, 210, 214, 221, 229, 240]
            )
        );
    }
}
```