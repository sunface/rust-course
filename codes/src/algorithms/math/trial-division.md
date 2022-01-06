# 试除法

```rust
fn floor(value: f64, scale: u8) -> f64 {
    let multiplier = 10i64.pow(scale as u32) as f64;
    (value * multiplier).floor()
}

fn double_to_int(amount: f64) -> i128 {
    amount.round() as i128
}

pub fn trial_division(mut num: i128) -> Vec<i128> {
    let mut result: Vec<i128> = vec![];

    while num % 2 == 0 {
        result.push(2);
        num /= 2;
        num = double_to_int(floor(num as f64, 0))
    }
    let mut f: i128 = 3;

    while f.pow(2) <= num {
        if num % f == 0 {
            result.push(f);
            num /= f;
            num = double_to_int(floor(num as f64, 0))
        } else {
            f += 2
        }
    }

    if num != 1 {
        result.push(num)
    }
    result
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn basic() {
        assert_eq!(trial_division(9), vec!(3, 3));
        assert_eq!(trial_division(10), vec!(2, 5));
        assert_eq!(trial_division(11), vec!(11));
        assert_eq!(trial_division(33), vec!(3, 11));
        assert_eq!(trial_division(2003), vec!(2003));
        assert_eq!(trial_division(100001), vec!(11, 9091));
    }
}
```