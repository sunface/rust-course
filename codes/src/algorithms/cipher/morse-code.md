# 摩斯码

```rust
use std::collections::HashMap;
use std::io;

const UNKNOWN_CHARACTER: &str = "........";
const _UNKNOWN_MORSE_CHARACTER: &str = "_";

pub fn encode(message: &str) -> String {
    let dictionary = _morse_dictionary();
    message
        .chars()
        .into_iter()
        .map(|char| char.to_uppercase().to_string())
        .map(|letter| dictionary.get(letter.as_str()))
        .map(|option| option.unwrap_or(&UNKNOWN_CHARACTER).to_string())
        .collect::<Vec<String>>()
        .join(" ")
}

// Declaritive macro for creating readable map declarations, for more info see https://doc.rust-lang.org/book/ch19-06-macros.html
macro_rules! map {
    ($($key:expr => $value:expr),* $(,)?) => {
        std::iter::Iterator::collect(std::array::IntoIter::new([$(($key, $value),)*]))
    };
}

fn _morse_dictionary() -> HashMap<&'static str, &'static str> {
    map! {
        "A" => ".-",      "B" => "-...",    "C" => "-.-.",
        "D" => "-..",     "E" => ".",       "F" => "..-.",
        "G" => "--.",     "H" => "....",    "I" => "..",
        "J" => ".---",    "K" => "-.-",     "L" => ".-..",
        "M" => "--",      "N" => "-.",      "O" => "---",
        "P" => ".--.",    "Q" => "--.-",    "R" => ".-.",
        "S" => "...",     "T" => "-",       "U" => "..-",
        "V" => "...-",    "W" => ".--",     "X" => "-..-",
        "Y" => "-.--",    "Z" => "--..",

        "1" => ".----",   "2" => "..---",   "3" => "...--",
        "4" => "....-",   "5" => ".....",   "6" => "-....",
        "7" => "--...",   "8" => "---..",   "9" => "----.",
        "0" => "-----",

        "&" => ".-...",   "@" => ".--.-.",  ":" => "---...",
        "," => "--..--",  "." => ".-.-.-",  "'" => ".----.",
        "\"" => ".-..-.", "?" => "..--..",  "/" => "-..-.",
        "=" => "-...-",   "+" => ".-.-.",   "-" => "-....-",
        "(" => "-.--.",   ")" => "-.--.-",  " " => "/",
        "!" => "-.-.--",
    }
}

fn _morse_to_alphanumeric_dictionary() -> HashMap<&'static str, &'static str> {
    map! {
        ".-"   =>  "A",      "-..." => "B",    "-.-." => "C",
        "-.."  =>  "D",      "."    => "E",       "..-." => "F",
        "--."  =>  "G",      "...." => "H",    ".." => "I",
        ".---" =>  "J",     "-.-" => "K",     ".-.." => "L",
        "--"   =>  "M",       "-." => "N",      "---" => "O",
        ".--." =>  "P",     "--.-" => "Q",    ".-." => "R",
        "..."  =>  "S",      "-" => "T",       "..-" => "U",
        "...-" =>  "V",     ".--" => "W",     "-..-" => "X",
        "-.--" =>  "Y",     "--.." => "Z",

        ".----" => "1",    "..---" => "2",   "...--" => "3",
        "....-" => "4",    "....." => "5",   "-...." => "6",
        "--..." => "7",    "---.." => "8",   "----." => "9",
        "-----" => "0",

        ".-..." => "&",    ".--.-." => "@",  "---..." => ":",
        "--..--" => ",",   ".-.-.-" => ".",  ".----." => "'",
        ".-..-." => "\"",  "..--.." => "?",  "-..-." => "/",
        "-...-" => "=",   ".-.-." => "+",   "-....-" => "-",
        "-.--." => "(",   "-.--.-" => ")",  "/" => " ",
        "-.-.--" => "!",  " " => " ",       "" => ""
    }
}

fn _check_part(string: &str) -> bool {
    for c in string.chars() {
        match c {
            '.' | '-' | ' ' => (),
            _ => return false,
        }
    }
    true
}

fn _check_all_parts(string: &str) -> bool {
    string.split('/').all(_check_part)
}

fn _decode_token(string: &str) -> String {
    _morse_to_alphanumeric_dictionary()
        .get(string)
        .unwrap_or(&_UNKNOWN_MORSE_CHARACTER)
        .to_string()
}

fn _decode_part(string: &str) -> String {
    string
        .split(' ')
        .map(_decode_token)
        .collect::<Vec<String>>()
        .join("")
}

/// Convert morse code to ascii.
///
/// Given a morse code, return the corresponding message.
/// If the code is invalid, the undecipherable part of the code is replaced by `_`.
pub fn decode(string: &str) -> Result<String, io::Error> {
    if !_check_all_parts(string) {
        return Err(io::Error::new(
            io::ErrorKind::InvalidData,
            "Invalid morse code",
        ));
    }

    let mut partitions: Vec<String> = vec![];

    for part in string.split('/') {
        partitions.push(_decode_part(part));
    }

    Ok(partitions.join(" "))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn encrypt_only_letters() {
        let message = "Hello Morse";
        let cipher = encode(message);
        assert_eq!(
            cipher,
            ".... . .-.. .-.. --- / -- --- .-. ... .".to_string()
        )
    }

    #[test]
    fn encrypt_letters_and_special_characters() {
        let message = "What's a great day!";
        let cipher = encode(message);
        assert_eq!(
            cipher,
            ".-- .... .- - .----. ... / .- / --. .-. . .- - / -.. .- -.-- -.-.--".to_string()
        )
    }

    #[test]
    fn encrypt_message_with_unsupported_character() {
        let message = "Error?? {}";
        let cipher = encode(message);
        assert_eq!(
            cipher,
            ". .-. .-. --- .-. ..--.. ..--.. / ........ ........".to_string()
        )
    }

    #[test]
    fn decrypt_valid_morsecode_with_spaces() {
        let expected = "Hello Morse! How's it goin, \"eh\"?"
            .to_string()
            .to_uppercase();
        let encypted = encode(&expected);
        let result = decode(&encypted).unwrap();

        assert_eq!(expected, result);
    }

    #[test]
    fn decrypt_valid_character_set_invalid_morsecode() {
        let expected = format!(
            "{}{}{}{} {}",
            _UNKNOWN_MORSE_CHARACTER,
            _UNKNOWN_MORSE_CHARACTER,
            _UNKNOWN_MORSE_CHARACTER,
            _UNKNOWN_MORSE_CHARACTER,
            _UNKNOWN_MORSE_CHARACTER,
        );

        let encypted = ".-.-.--.-.-. --------. ..---.-.-. .-.-.--.-.-. / .-.-.--.-.-.".to_string();
        let result = decode(&encypted).unwrap();

        assert_eq!(expected, result);
    }

    #[test]
    fn decrypt_invalid_morsecode_with_spaces() {
        let encypted = "1... . .-.. .-.. --- / -- --- .-. ... .";
        let result = decode(encypted).map_err(|e| e.kind());
        let expected = Err(io::ErrorKind::InvalidData);

        assert_eq!(expected, result);
    }
}
```
