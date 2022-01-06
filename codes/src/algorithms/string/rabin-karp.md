# Rabin Karp算法

```rust
pub fn rabin_karp(target: String, pattern: String) -> Vec<usize> {
    // Quick exit
    if target.is_empty() || pattern.is_empty() || pattern.len() > target.len() {
        return vec![];
    }

    let string: String = (&pattern[0..pattern.len()]).to_string();
    let hash_pattern = hash(string.clone());
    let mut ret = vec![];
    for i in 0..(target.len() - pattern.len() + 1) {
        let s = (&target[i..(i + pattern.len())]).to_string();
        let string_hash = hash(s.clone());

        if string_hash == hash_pattern && s == string {
            ret.push(i);
        }
    }
    ret
}

fn hash(mut s: String) -> u16 {
    let prime: u16 = 101;
    let last_char = s
        .drain(s.len() - 1..)
        .next()
        .expect("Failed to get the last char of the string");
    let mut res: u16 = 0;
    for (i, &c) in s.as_bytes().iter().enumerate() {
        if i == 0 {
            res = (c as u16 * 256) % prime;
        } else {
            res = (((res + c as u16) % 101) * 256) % 101;
        }
    }
    (res + last_char as u16) % prime
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn hi_hash() {
        let hash_result = hash("hi".to_string());
        assert_eq!(hash_result, 65);
    }

    #[test]
    fn abr_hash() {
        let hash_result = hash("abr".to_string());
        assert_eq!(hash_result, 4);
    }

    #[test]
    fn bra_hash() {
        let hash_result = hash("bra".to_string());
        assert_eq!(hash_result, 30);
    }

    // Attribution to @pgimalac for his tests from Knuth-Morris-Pratt
    #[test]
    fn each_letter_matches() {
        let index = rabin_karp("aaa".to_string(), "a".to_string());
        assert_eq!(index, vec![0, 1, 2]);
    }

    #[test]
    fn a_few_separate_matches() {
        let index = rabin_karp("abababa".to_string(), "ab".to_string());
        assert_eq!(index, vec![0, 2, 4]);
    }

    #[test]
    fn one_match() {
        let index = rabin_karp("ABC ABCDAB ABCDABCDABDE".to_string(), "ABCDABD".to_string());
        assert_eq!(index, vec![15]);
    }

    #[test]
    fn lots_of_matches() {
        let index = rabin_karp("aaabaabaaaaa".to_string(), "aa".to_string());
        assert_eq!(index, vec![0, 1, 4, 7, 8, 9, 10]);
    }

    #[test]
    fn lots_of_intricate_matches() {
        let index = rabin_karp("ababababa".to_string(), "aba".to_string());
        assert_eq!(index, vec![0, 2, 4, 6]);
    }

    #[test]
    fn not_found0() {
        let index = rabin_karp("abcde".to_string(), "f".to_string());
        assert_eq!(index, vec![]);
    }

    #[test]
    fn not_found1() {
        let index = rabin_karp("abcde".to_string(), "ac".to_string());
        assert_eq!(index, vec![]);
    }

    #[test]
    fn not_found2() {
        let index = rabin_karp("ababab".to_string(), "bababa".to_string());
        assert_eq!(index, vec![]);
    }

    #[test]
    fn empty_string() {
        let index = rabin_karp("".to_string(), "abcdef".to_string());
        assert_eq!(index, vec![]);
    }
}
```