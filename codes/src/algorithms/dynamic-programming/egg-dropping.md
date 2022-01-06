# 扔鸡蛋(Egg dropping)

```rust
/// # Egg Dropping Puzzle

/// `egg_drop(eggs, floors)` returns the least number of egg droppings
///     required to determine the highest floor from which an egg will not
///     break upon dropping
///
/// Assumptions: n > 0
pub fn egg_drop(eggs: u32, floors: u32) -> u32 {
    assert!(eggs > 0);

    // Explicity handle edge cases (optional)
    if eggs == 1 || floors == 0 || floors == 1 {
        return floors;
    }

    let eggs_index = eggs as usize;
    let floors_index = floors as usize;

    // Store solutions to subproblems in 2D Vec,
    // where egg_drops[i][j] represents the solution to the egg dropping
    // problem with i eggs and j floors
    let mut egg_drops: Vec<Vec<u32>> = vec![vec![0; floors_index + 1]; eggs_index + 1];

    // Assign solutions for egg_drop(n, 0) = 0, egg_drop(n, 1) = 1
    for egg_drop in egg_drops.iter_mut().skip(1) {
        egg_drop[0] = 0;
        egg_drop[1] = 1;
    }

    // Assign solutions to egg_drop(1, k) = k
    for j in 1..=floors_index {
        egg_drops[1][j] = j as u32;
    }

    // Complete solutions vector using optimal substructure property
    for i in 2..=eggs_index {
        for j in 2..=floors_index {
            egg_drops[i][j] = std::u32::MAX;

            for k in 1..=j {
                let res = 1 + std::cmp::max(egg_drops[i - 1][k - 1], egg_drops[i][j - k]);

                if res < egg_drops[i][j] {
                    egg_drops[i][j] = res;
                }
            }
        }
    }

    egg_drops[eggs_index][floors_index]
}

#[cfg(test)]
mod tests {
    use super::egg_drop;

    #[test]
    fn zero_floors() {
        assert_eq!(egg_drop(5, 0), 0);
    }

    #[test]
    fn one_egg() {
        assert_eq!(egg_drop(1, 8), 8);
    }

    #[test]
    fn eggs2_floors2() {
        assert_eq!(egg_drop(2, 2), 2);
    }

    #[test]
    fn eggs3_floors5() {
        assert_eq!(egg_drop(3, 5), 3);
    }

    #[test]
    fn eggs2_floors10() {
        assert_eq!(egg_drop(2, 10), 4);
    }

    #[test]
    fn eggs2_floors36() {
        assert_eq!(egg_drop(2, 36), 8);
    }

    #[test]
    fn large_floors() {
        assert_eq!(egg_drop(2, 100), 14);
    }
}
```