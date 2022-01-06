# rot13加密算法

```rust
pub fn rot13(text: &str) -> String {
    let to_enc = text.to_uppercase();
    to_enc
        .chars()
        .map(|c| match c {
            'A'..='M' => ((c as u8) + 13) as char,
            'N'..='Z' => ((c as u8) - 13) as char,
            _ => c,
        })
        .collect()
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_single_letter() {
        assert_eq!("N", rot13("A"));
    }

    #[test]
    fn test_bunch_of_letters() {
        assert_eq!("NOP", rot13("ABC"));
    }

    #[test]
    fn test_non_ascii() {
        assert_eq!("😀NO", rot13("😀AB"));
    }

    #[test]
    fn test_twice() {
        assert_eq!("ABCD", rot13(&rot13("ABCD")));
    }
}
```