// errors6.rs

// 像 `Box<dyn error::Error>` 这样的万能错误类型并不推荐用于库代码，
// 因为调用者可能想根据错误内容进行相关处理，而不是将其打印出来或进一步传播。
// 在这里，我们自定义了一个错误类型，让调用者有可能去决定当函数返回错误时
// 下一步该怎么做

// 通过这些测试！执行 `rustlings hint errors6` 获取提示 :)

// I AM NOT DONE

use std::num::ParseIntError;

// 这是一个自定义的错误类型，我们将在 `parse_pos_nonzero()` 中使用。
#[derive(PartialEq, Debug)]
enum ParsePosNonzeroError {
    Creation(CreationError),
    ParseInt(ParseIntError)
}

impl ParsePosNonzeroError {
    fn from_creation(err: CreationError) -> ParsePosNonzeroError {
        ParsePosNonzeroError::Creation(err)
    }
    // TODO：在这添加另一个错误转换函数。
}

fn parse_pos_nonzero(s: &str)
    -> Result<PositiveNonzeroInteger, ParsePosNonzeroError>
{
    // TODO：改为返回一个恰当的错误，而不是在 `parse()` 返回一个错误时 panic
    let x: i64 = s.parse().unwrap();
    PositiveNonzeroInteger::new(x)
        .map_err(ParsePosNonzeroError::from_creation)
}

// 不要更改这一行以下的任何内容。

#[derive(PartialEq, Debug)]
struct PositiveNonzeroInteger(u64);

#[derive(PartialEq, Debug)]
enum CreationError {
    Negative,
    Zero,
}

impl PositiveNonzeroInteger {
    fn new(value: i64) -> Result<PositiveNonzeroInteger, CreationError> {
        match value {
            x if x < 0 => Err(CreationError::Negative),
            x if x == 0 => Err(CreationError::Zero),
            x => Ok(PositiveNonzeroInteger(x as u64))
        }
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_parse_error() {
        // 我们不能构造一个 ParseIntError ，所以必须进行模式匹配。
        assert!(matches!(
            parse_pos_nonzero("not a number"),
            Err(ParsePosNonzeroError::ParseInt(_))
        ));
    }

    #[test]
    fn test_negative() {
        assert_eq!(
            parse_pos_nonzero("-555"),
            Err(ParsePosNonzeroError::Creation(CreationError::Negative))
        );
    }

    #[test]
    fn test_zero() {
        assert_eq!(
            parse_pos_nonzero("0"),
            Err(ParsePosNonzeroError::Creation(CreationError::Zero))
        );
    }

    #[test]
    fn test_positive() {
        let x = PositiveNonzeroInteger::new(42);
        assert!(x.is_ok());
        assert_eq!(parse_pos_nonzero("42"), Ok(x.unwrap()));
    }
}
