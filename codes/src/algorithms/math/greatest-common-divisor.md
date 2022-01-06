# 最大公约数

```rust
/// Greatest Common Divisor.
///
/// greatest_common_divisor(num1, num2) returns the greatest number of num1 and num2.
///
/// Wikipedia reference: https://en.wikipedia.org/wiki/Greatest_common_divisor
/// gcd(a, b) = gcd(a, -b) = gcd(-a, b) = gcd(-a, -b) by definition of divisibility

pub fn greatest_common_divisor_recursive(a: i64, b: i64) -> i64 {
    if a == 0 {
        b.abs()
    } else {
        greatest_common_divisor_recursive(b % a, a)
    }
}

pub fn greatest_common_divisor_iterative(mut a: i64, mut b: i64) -> i64 {
    while a != 0 {
        let remainder = b % a;
        b = a;
        a = remainder;
    }
    b.abs()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn positive_number_recursive() {
        assert_eq!(greatest_common_divisor_recursive(4, 16), 4);
        assert_eq!(greatest_common_divisor_recursive(16, 4), 4);
        assert_eq!(greatest_common_divisor_recursive(3, 5), 1);
        assert_eq!(greatest_common_divisor_recursive(40, 40), 40);
        assert_eq!(greatest_common_divisor_recursive(27, 12), 3);
    }

    #[test]
    fn positive_number_iterative() {
        assert_eq!(greatest_common_divisor_iterative(4, 16), 4);
        assert_eq!(greatest_common_divisor_iterative(16, 4), 4);
        assert_eq!(greatest_common_divisor_iterative(3, 5), 1);
        assert_eq!(greatest_common_divisor_iterative(40, 40), 40);
        assert_eq!(greatest_common_divisor_iterative(27, 12), 3);
    }

    #[test]
    fn negative_number_recursive() {
        assert_eq!(greatest_common_divisor_recursive(-32, -8), 8);
        assert_eq!(greatest_common_divisor_recursive(-8, -32), 8);
        assert_eq!(greatest_common_divisor_recursive(-3, -5), 1);
        assert_eq!(greatest_common_divisor_recursive(-40, -40), 40);
        assert_eq!(greatest_common_divisor_recursive(-12, -27), 3);
    }

    #[test]
    fn negative_number_iterative() {
        assert_eq!(greatest_common_divisor_iterative(-32, -8), 8);
        assert_eq!(greatest_common_divisor_iterative(-8, -32), 8);
        assert_eq!(greatest_common_divisor_iterative(-3, -5), 1);
        assert_eq!(greatest_common_divisor_iterative(-40, -40), 40);
        assert_eq!(greatest_common_divisor_iterative(-12, -27), 3);
    }

    #[test]
    fn mix_recursive() {
        assert_eq!(greatest_common_divisor_recursive(0, -5), 5);
        assert_eq!(greatest_common_divisor_recursive(-5, 0), 5);
        assert_eq!(greatest_common_divisor_recursive(-64, 32), 32);
        assert_eq!(greatest_common_divisor_recursive(-32, 64), 32);
        assert_eq!(greatest_common_divisor_recursive(-40, 40), 40);
        assert_eq!(greatest_common_divisor_recursive(12, -27), 3);
    }

    #[test]
    fn mix_iterative() {
        assert_eq!(greatest_common_divisor_iterative(0, -5), 5);
        assert_eq!(greatest_common_divisor_iterative(-5, 0), 5);
        assert_eq!(greatest_common_divisor_iterative(-64, 32), 32);
        assert_eq!(greatest_common_divisor_iterative(-32, 64), 32);
        assert_eq!(greatest_common_divisor_iterative(-40, 40), 40);
        assert_eq!(greatest_common_divisor_iterative(12, -27), 3);
    }
}
```