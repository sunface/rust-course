# 马拉车算法(Manacher)

```rust
pub fn manacher(s: String) -> String {
    let l = s.len();
    if l <= 1 {
        return s;
    }

    // MEMO: We need to detect odd palindrome as well,
    // therefore, inserting dummy string so that
    // we can find a pair with dummy center character.
    let mut chars: Vec<char> = Vec::with_capacity(s.len() * 2 + 1);
    for c in s.chars() {
        chars.push('#');
        chars.push(c);
    }
    chars.push('#');

    // List: storing the length of palindrome at each index of string
    let mut length_of_palindrome = vec![1usize; chars.len()];
    // Integer: Current checking palindrome's center index
    let mut current_center: usize = 0;
    // Integer: Right edge index existing the radius away from current center
    let mut right_from_current_center: usize = 0;

    for i in 0..chars.len() {
        // 1: Check if we are looking at right side of palindrome.
        if right_from_current_center > i && i > current_center {
            // 1-1: If so copy from the left side of palindrome.
            // If the value + index exceeds the right edge index, we should cut and check palindrome later #3.
            length_of_palindrome[i] = std::cmp::min(
                right_from_current_center - i,
                length_of_palindrome[2 * current_center - i],
            );
            // 1-2: Move the checking palindrome to new index if it exceeds the right edge.
            if length_of_palindrome[i] + i >= right_from_current_center {
                current_center = i;
                right_from_current_center = length_of_palindrome[i] + i;
                // 1-3: If radius exceeds the end of list, it means checking is over.
                // You will never get the larger value because the string will get only shorter.
                if right_from_current_center >= chars.len() - 1 {
                    break;
                }
            } else {
                // 1-4: If the checking index doesn't exceeds the right edge,
                // it means the length is just as same as the left side.
                // You don't need to check anymore.
                continue;
            }
        }

        // Integer: Current radius from checking index
        // If it's copied from left side and more than 1,
        // it means it's ensured so you don't need to check inside radius.
        let mut radius: usize = (length_of_palindrome[i] - 1) / 2;
        radius += 1;
        // 2: Checking palindrome.
        // Need to care about overflow usize.
        while i >= radius && i + radius <= chars.len() - 1 && chars[i - radius] == chars[i + radius]
        {
            length_of_palindrome[i] += 2;
            radius += 1;
        }
    }

    // 3: Find the maximum length and generate answer.
    let center_of_max = length_of_palindrome
        .iter()
        .enumerate()
        .max_by_key(|(_, &value)| value)
        .map(|(idx, _)| idx)
        .unwrap();
    let radius_of_max = (length_of_palindrome[center_of_max] - 1) / 2;
    let answer = &chars[(center_of_max - radius_of_max)..(center_of_max + radius_of_max + 1)]
        .iter()
        .collect::<String>();
    answer.replace("#", "")
}

#[cfg(test)]
mod tests {
    use super::manacher;

    #[test]
    fn get_longest_palindrome_by_manacher() {
        assert_eq!(manacher("babad".to_string()), "aba".to_string());
        assert_eq!(manacher("cbbd".to_string()), "bb".to_string());
        assert_eq!(manacher("a".to_string()), "a".to_string());

        let ac_ans = manacher("ac".to_string());
        assert!(ac_ans == "a".to_string() || ac_ans == "c".to_string());
    }
}
```