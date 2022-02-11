// errors5.rs

// 这个程序使用练习 errors4 代码的完整版。
// 它现在不能编译! 为什么呢？
// 执行 `rustlings hint errors5` 获取提示！

// I AM NOT DONE

use std::error;
use std::fmt;
use std::num::ParseIntError;

// TODO：修改 `main()` 的返回类型，以使其通过编译。
fn main() -> Result<(), ParseIntError> {
    let pretend_user_input = "42";
    let x: i64 = pretend_user_input.parse()?;
    println!("output={:?}", PositiveNonzeroInteger::new(x)?);
    Ok(())
}

// 不要更改此行以下的任何内容。

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

// 以下是必要的，以便 `CreationError` 能够实现 `error::Error` 。
impl fmt::Display for CreationError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        let description = match *self {
            CreationError::Negative => "number is negative",
            CreationError::Zero => "number is zero",
        };
        f.write_str(description)
    }
}

impl error::Error for CreationError {}
