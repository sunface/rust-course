# 哈希

### 计算文件的 SHA-256 摘要
写入一些数据到文件中，然后使用 [digest::Context](https://briansmith.org/rustdoc/ring/digest/struct.Context.html) 来计算文件内容的 SHA-256 摘要 [digest::Digest](https://briansmith.org/rustdoc/ring/digest/struct.Digest.html)。

```rust,editable
# use error_chain::error_chain;
use data_encoding::HEXUPPER;
use ring::digest::{Context, Digest, SHA256};
use std::fs::File;
use std::io::{BufReader, Read, Write};

# error_chain! {
#    foreign_links {
#        Io(std::io::Error);
#        Decode(data_encoding::DecodeError);
#    }
# }

fn sha256_digest<R: Read>(mut reader: R) -> Result<Digest> {
    let mut context = Context::new(&SHA256);
    let mut buffer = [0; 1024];

    loop {
        let count = reader.read(&mut buffer)?;
        if count == 0 {
            break;
        }
        context.update(&buffer[..count]);
    }

    Ok(context.finish())
}

fn main() -> Result<()> {
    let path = "file.txt";

    let mut output = File::create(path)?;
    write!(output, "We will generate a digest of this text")?;

    let input = File::open(path)?;
    let reader = BufReader::new(input);
    let digest = sha256_digest(reader)?;

    println!("SHA-256 digest is {}", HEXUPPER.encode(digest.as_ref()));

    Ok(())
}
```

### 使用 HMAC 摘要来签名和验证消息
使用 [ring::hmac](https://briansmith.org/rustdoc/ring/hmac/) 创建一个字符串签名并检查该签名的正确性。

```rust,editable
use ring::{hmac, rand};
use ring::rand::SecureRandom;
use ring::error::Unspecified;

fn main() -> Result<(), Unspecified> {
    let mut key_value = [0u8; 48];
    let rng = rand::SystemRandom::new();
    rng.fill(&mut key_value)?;
    let key = hmac::Key::new(hmac::HMAC_SHA256, &key_value);

    let message = "Legitimate and important message.";
    let signature = hmac::sign(&key, message.as_bytes());
    hmac::verify(&key, message.as_bytes(), signature.as_ref())?;

    Ok(())
}
```