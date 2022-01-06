# 判断子序列

```rust
/// Fibonacci via Dynamic Programming

/// fibonacci(n) returns the nth fibonacci number
/// This function uses the definition of Fibonacci where:
/// F(0) = F(1) = 1 and F(n+1) = F(n) + F(n-1) for n>0
///
/// Warning: This will overflow the 128-bit unsigned integer at n=186
pub fn fibonacci(n: u32) -> u128 {
    // Use a and b to store the previous two values in the sequence
    let mut a = 0;
    let mut b = 1;
    for _i in 0..n {
        // As we iterate through, move b's value into a and the new computed
        // value into b.
        let c = a + b;
        a = b;
        b = c;
    }
    b
}

/// fibonacci(n) returns the nth fibonacci number
/// This function uses the definition of Fibonacci where:
/// F(0) = F(1) = 1 and F(n+1) = F(n) + F(n-1) for n>0
///
/// Warning: This will overflow the 128-bit unsigned integer at n=186
pub fn recursive_fibonacci(n: u32) -> u128 {
    // Call the actual tail recursive implementation, with the extra
    // arguments set up.
    _recursive_fibonacci(n, 0, 1)
}

fn _recursive_fibonacci(n: u32, previous: u128, current: u128) -> u128 {
    if n == 0 {
        current
    } else {
        _recursive_fibonacci(n - 1, current, current + previous)
    }
}

/// classical_fibonacci(n) returns the nth fibonacci number
/// This function uses the definition of Fibonacci where:
/// F(0) = 0, F(1) = 1 and F(n+1) = F(n) + F(n-1) for n>0
///
/// Warning: This will overflow the 128-bit unsigned integer at n=186
pub fn classical_fibonacci(n: u32) -> u128 {
    match n {
        0 => 0,
        1 => 1,
        _ => {
            let k = n / 2;
            let f1 = classical_fibonacci(k);
            let f2 = classical_fibonacci(k - 1);

            match n % 4 {
                0 | 2 => f1 * (f1 + 2 * f2),
                1 => (2 * f1 + f2) * (2 * f1 - f2) + 2,
                _ => (2 * f1 + f2) * (2 * f1 - f2) - 2,
            }
        }
    }
}

/// logarithmic_fibonacci(n) returns the nth fibonacci number
/// This function uses the definition of Fibonacci where:
/// F(0) = 0, F(1) = 1 and F(n+1) = F(n) + F(n-1) for n>0
///
/// Warning: This will overflow the 128-bit unsigned integer at n=186
pub fn logarithmic_fibonacci(n: u32) -> u128 {
    // if it is the max value before overflow, use n-1 then get the second
    // value in the tuple
    if n == 186 {
        let (_, second) = _logarithmic_fibonacci(185);
        second
    } else {
        let (first, _) = _logarithmic_fibonacci(n);
        first
    }
}

fn _logarithmic_fibonacci(n: u32) -> (u128, u128) {
    match n {
        0 => (0, 1),
        _ => {
            let (current, next) = _logarithmic_fibonacci(n / 2);
            let c = current * (next * 2 - current);
            let d = current * current + next * next;

            match n % 2 {
                0 => (c, d),
                _ => (d, c + d),
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::classical_fibonacci;
    use super::fibonacci;
    use super::logarithmic_fibonacci;
    use super::recursive_fibonacci;

    #[test]
    fn test_fibonacci() {
        assert_eq!(fibonacci(0), 1);
        assert_eq!(fibonacci(1), 1);
        assert_eq!(fibonacci(2), 2);
        assert_eq!(fibonacci(3), 3);
        assert_eq!(fibonacci(4), 5);
        assert_eq!(fibonacci(5), 8);
        assert_eq!(fibonacci(10), 89);
        assert_eq!(fibonacci(20), 10946);
        assert_eq!(fibonacci(100), 573147844013817084101);
        assert_eq!(fibonacci(184), 205697230343233228174223751303346572685);
    }

    #[test]
    fn test_recursive_fibonacci() {
        assert_eq!(recursive_fibonacci(0), 1);
        assert_eq!(recursive_fibonacci(1), 1);
        assert_eq!(recursive_fibonacci(2), 2);
        assert_eq!(recursive_fibonacci(3), 3);
        assert_eq!(recursive_fibonacci(4), 5);
        assert_eq!(recursive_fibonacci(5), 8);
        assert_eq!(recursive_fibonacci(10), 89);
        assert_eq!(recursive_fibonacci(20), 10946);
        assert_eq!(recursive_fibonacci(100), 573147844013817084101);
        assert_eq!(
            recursive_fibonacci(184),
            205697230343233228174223751303346572685
        );
    }

    #[test]
    fn test_classical_fibonacci() {
        assert_eq!(classical_fibonacci(0), 0);
        assert_eq!(classical_fibonacci(1), 1);
        assert_eq!(classical_fibonacci(2), 1);
        assert_eq!(classical_fibonacci(3), 2);
        assert_eq!(classical_fibonacci(4), 3);
        assert_eq!(classical_fibonacci(5), 5);
        assert_eq!(classical_fibonacci(10), 55);
        assert_eq!(classical_fibonacci(20), 6765);
        assert_eq!(classical_fibonacci(21), 10946);
        assert_eq!(classical_fibonacci(100), 354224848179261915075);
        assert_eq!(
            classical_fibonacci(184),
            127127879743834334146972278486287885163
        );
    }

    #[test]
    fn test_logarithmic_fibonacci() {
        assert_eq!(logarithmic_fibonacci(0), 0);
        assert_eq!(logarithmic_fibonacci(1), 1);
        assert_eq!(logarithmic_fibonacci(2), 1);
        assert_eq!(logarithmic_fibonacci(3), 2);
        assert_eq!(logarithmic_fibonacci(4), 3);
        assert_eq!(logarithmic_fibonacci(5), 5);
        assert_eq!(logarithmic_fibonacci(10), 55);
        assert_eq!(logarithmic_fibonacci(20), 6765);
        assert_eq!(logarithmic_fibonacci(21), 10946);
        assert_eq!(logarithmic_fibonacci(100), 354224848179261915075);
        assert_eq!(
            logarithmic_fibonacci(184),
            127127879743834334146972278486287885163
        );
    }

    #[test]
    /// Check that the itterative and recursive fibonacci
    /// produce the same value. Both are combinatorial ( F(0) = F(1) = 1 )
    fn test_iterative_and_recursive_equivalence() {
        assert_eq!(fibonacci(0), recursive_fibonacci(0));
        assert_eq!(fibonacci(1), recursive_fibonacci(1));
        assert_eq!(fibonacci(2), recursive_fibonacci(2));
        assert_eq!(fibonacci(3), recursive_fibonacci(3));
        assert_eq!(fibonacci(4), recursive_fibonacci(4));
        assert_eq!(fibonacci(5), recursive_fibonacci(5));
        assert_eq!(fibonacci(10), recursive_fibonacci(10));
        assert_eq!(fibonacci(20), recursive_fibonacci(20));
        assert_eq!(fibonacci(100), recursive_fibonacci(100));
        assert_eq!(fibonacci(184), recursive_fibonacci(184));
    }

    #[test]
    /// Check that classical and combinatorial fibonacci produce the
    /// same value when 'n' differs by 1.
    /// classical fibonacci: ( F(0) = 0, F(1) = 1 )
    /// combinatorial fibonacci: ( F(0) = F(1) = 1 )
    fn test_classical_and_combinatorial_are_off_by_one() {
        assert_eq!(classical_fibonacci(1), fibonacci(0));
        assert_eq!(classical_fibonacci(2), fibonacci(1));
        assert_eq!(classical_fibonacci(3), fibonacci(2));
        assert_eq!(classical_fibonacci(4), fibonacci(3));
        assert_eq!(classical_fibonacci(5), fibonacci(4));
        assert_eq!(classical_fibonacci(6), fibonacci(5));
        assert_eq!(classical_fibonacci(11), fibonacci(10));
        assert_eq!(classical_fibonacci(20), fibonacci(19));
        assert_eq!(classical_fibonacci(21), fibonacci(20));
        assert_eq!(classical_fibonacci(101), fibonacci(100));
        assert_eq!(classical_fibonacci(185), fibonacci(184));
    }
}
```