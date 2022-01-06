# 凯撒算法(caesar)

```rust
pub fn another_rot13(text: &str) -> String {
    let input = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let output = "NOPQRSTUVWXYZABCDEFGHIJKLMnopqrstuvwxyzabcdefghijklm";
    text.chars()
        .map(|c| match input.find(c) {
            Some(i) => output.chars().nth(i).unwrap(),
            None => c,
        })
        .collect()
}

#[cfg(test)]
mod tests {
    // Note this useful idiom: importing names from outer (for mod tests) scope.
    use super::*;

    #[test]
    fn test_simple() {
        assert_eq!(another_rot13("ABCzyx"), "NOPmlk");
    }

    #[test]
    fn test_every_alphabet_with_space() {
        assert_eq!(
            another_rot13("The quick brown fox jumps over the lazy dog"),
            "Gur dhvpx oebja sbk whzcf bire gur ynml qbt"
        );
    }

    #[test]
    fn test_non_alphabet() {
        assert_eq!(another_rot13("🎃 Jack-o'-lantern"), "🎃 Wnpx-b'-ynagrea");
    }
}
```