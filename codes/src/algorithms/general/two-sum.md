# 两数之和

```rust
use std::collections::HashMap;
use std::convert::TryInto;

// Given an array of integers nums and an integer target,
// return indices of the two numbers such that they add up to target.

pub fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {
    let mut hash_map: HashMap<i32, i32> = HashMap::new();

    for (i, item) in nums.iter().enumerate() {
        match hash_map.get(&(target - item)) {
            Some(value) => {
                return vec![i.try_into().unwrap(), *value];
            }
            None => {
                hash_map.insert(*item, i.try_into().unwrap());
            }
        }
    }

    vec![]
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test() {
        let nums = vec![2, 7, 11, 15];
        assert_eq!(two_sum(nums, 9), vec![1, 0]);

        let nums = vec![3, 2, 4];
        assert_eq!(two_sum(nums, 6), vec![2, 1]);

        let nums = vec![3, 3];
        assert_eq!(two_sum(nums, 6), vec![1, 0]);
    }
}
```