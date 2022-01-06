# 质数检测

```rust
pub fn prime_check(num: usize) -> bool {
    if (num > 1) & (num < 4) {
        return true;
    } else if (num < 2) || (num % 2 == 0) {
        return false;
    }

    let stop: usize = (num as f64).sqrt() as usize + 1;
    for i in (3..stop).step_by(2) {
        if num % i == 0 {
            return false;
        }
    }
    true
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn basic() {
        assert_eq!(prime_check(3), true);
        assert_eq!(prime_check(7), true);
        assert_eq!(prime_check(11), true);
        assert_eq!(prime_check(2003), true);

        assert_eq!(prime_check(4), false);
        assert_eq!(prime_check(6), false);
        assert_eq!(prime_check(21), false);
        assert_eq!(prime_check(2004), false);
    }
}
```