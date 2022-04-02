# 使用tar包

## 解压 tar 包
以下代码将解压缩( [GzDecoder](https://docs.rs/flate2/*/flate2/read/struct.GzDecoder.html) )当前目录中的 `archive.tar.gz` ，并将所有文件抽取出( [Archive::unpack](https://docs.rs/tar/*/tar/struct.Archive.html#method.unpack) )来后当入到当前目录中。

```rust,editable
use std::fs::File;
use flate2::read::GzDecoder;
use tar::Archive;

fn main() -> Result<(), std::io::Error> {
    let path = "archive.tar.gz";

    let tar_gz = File::open(path)?;
    let tar = GzDecoder::new(tar_gz);
    let mut archive = Archive::new(tar);
    archive.unpack(".")?;

    Ok(())
}
```

## 将目录压缩成 tar 包
以下代码将 `/var/log` 目录压缩成 `archive.tar.gz`:

- 创建一个 [File](https://doc.rust-lang.org/std/fs/struct.File.html) 文件，并使用 [GzEncoder](https://docs.rs/flate2/*/flate2/write/struct.GzEncoder.html) 和 [tar::Builder](https://docs.rs/tar/*/tar/struct.Builder.html) 对其进行包裹
- 通过 [Builder::append_dir_all](https://docs.rs/tar/*/tar/struct.Builder.html#method.append_dir_all) 将 `/var/log` 目录下的所有内容添加到压缩文件中，该文件在 `backup/logs` 目录下。
- [GzEncoder](https://docs.rs/flate2/*/flate2/write/struct.GzEncoder.html) 负责在写入压缩文件 `archive.tar.gz` 之前对数据进行压缩。

```rust,editable
use std::fs::File;
use flate2::Compression;
use flate2::write::GzEncoder;

fn main() -> Result<(), std::io::Error> {
    let tar_gz = File::create("archive.tar.gz")?;
    let enc = GzEncoder::new(tar_gz, Compression::default());
    let mut tar = tar::Builder::new(enc);
    tar.append_dir_all("backup/logs", "/var/log")?;
    Ok(())
}
```

## 解压的同时删除指定的文件前缀
遍历目录中的文件 [Archive::entries](https://docs.rs/tar/*/tar/struct.Archive.html#method.entries)，若解压前的文件名包含 `bundle/logs` 前缀，需要将前缀从文件名移除( [Path::strip_prefix](https://doc.rust-lang.org/std/path/struct.Path.html#method.strip_prefix) )后，再解压。



```rust,editable
use std::fs::File;
use std::path::PathBuf;
use flate2::read::GzDecoder;
use tar::Archive;

fn main() -> Result<()> {
    let file = File::open("archive.tar.gz")?;
    let mut archive = Archive::new(GzDecoder::new(file));
    let prefix = "bundle/logs";

    println!("Extracted the following files:");
    archive
        .entries()? // 获取压缩档案中的文件条目列表
        .filter_map(|e| e.ok())
        // 对每个文件条目进行 map 处理
        .map(|mut entry| -> Result<PathBuf> {
            // 将文件路径名中的前缀移除，获取一个新的路径名
            let path = entry.path()?.strip_prefix(prefix)?.to_owned();
            // 将内容解压到新的路径名中
            entry.unpack(&path)?;
            Ok(path)
        })
        .filter_map(|e| e.ok())
        .for_each(|x| println!("> {}", x.display()));

    Ok(())
}
```