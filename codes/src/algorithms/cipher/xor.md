# xor

```rust
pub fn xor(text: &str, key: u8) -> String {
    text.chars().map(|c| ((c as u8) ^ key) as char).collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_simple() {
        let test_string = "test string";
        let ciphered_text = xor(test_string, 32);
        assert_eq!(test_string, xor(&ciphered_text, 32));
    }

    #[test]
    fn test_every_alphabet_with_space() {
        let test_string = "The quick brown fox jumps over the lazy dog";
        let ciphered_text = xor(test_string, 64);
        assert_eq!(test_string, xor(&ciphered_text, 64));
    }
}
```