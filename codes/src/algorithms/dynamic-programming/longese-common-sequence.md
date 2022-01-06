# 最长公共子序列

```rust
/// Longest common subsequence via Dynamic Programming

/// longest_common_subsequence(a, b) returns the longest common subsequence
/// between the strings a and b.
pub fn longest_common_subsequence(a: &str, b: &str) -> String {
    let a: Vec<_> = a.chars().collect();
    let b: Vec<_> = b.chars().collect();
    let (na, nb) = (a.len(), b.len());

    // solutions[i][j] is the length of the longest common subsequence
    // between a[0..i-1] and b[0..j-1]
    let mut solutions = vec![vec![0; nb + 1]; na + 1];

    for (i, ci) in a.iter().enumerate() {
        for (j, cj) in b.iter().enumerate() {
            // if ci == cj, there is a new common character;
            // otherwise, take the best of the two solutions
            // at (i-1,j) and (i,j-1)
            solutions[i + 1][j + 1] = if ci == cj {
                solutions[i][j] + 1
            } else {
                solutions[i][j + 1].max(solutions[i + 1][j])
            }
        }
    }

    // reconstitute the solution string from the lengths
    let mut result: Vec<char> = Vec::new();
    let (mut i, mut j) = (na, nb);
    while i > 0 && j > 0 {
        if a[i - 1] == b[j - 1] {
            result.push(a[i - 1]);
            i -= 1;
            j -= 1;
        } else if solutions[i - 1][j] > solutions[i][j - 1] {
            i -= 1;
        } else {
            j -= 1;
        }
    }

    result.reverse();
    result.iter().collect()
}

#[cfg(test)]
mod tests {
    use super::longest_common_subsequence;

    #[test]
    fn test_longest_common_subsequence() {
        // empty case
        assert_eq!(&longest_common_subsequence("", ""), "");
        assert_eq!(&longest_common_subsequence("", "abcd"), "");
        assert_eq!(&longest_common_subsequence("abcd", ""), "");

        // simple cases
        assert_eq!(&longest_common_subsequence("abcd", "c"), "c");
        assert_eq!(&longest_common_subsequence("abcd", "d"), "d");
        assert_eq!(&longest_common_subsequence("abcd", "e"), "");
        assert_eq!(&longest_common_subsequence("abcdefghi", "acegi"), "acegi");

        // less simple cases
        assert_eq!(&longest_common_subsequence("abcdgh", "aedfhr"), "adh");
        assert_eq!(&longest_common_subsequence("aggtab", "gxtxayb"), "gtab");

        // unicode
        assert_eq!(
            &longest_common_subsequence("你好，世界", "再见世界"),
            "世界"
        );
    }
}
```