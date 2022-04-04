# 版本

### 解析并增加版本号
下面例子使用 [Version::parse](https://docs.rs/semver/*/semver/struct.Version.html#method.parse) 将一个字符串转换成 [semver::Version](https://docs.rs/semver/*/semver/struct.Version.html) 版本号，然后将它的 patch, minor, major 版本号都增加 1。

注意，为了符合[语义化版本的说明](http://semver.org)，增加 `minor` 版本时，`patch` 版本会被重设为 `0`，当增加 `major` 版本时，`minor` 和 `patch` 都将被重设为 `0`。

```rust,editable
use semver::{Version, SemVerError};

fn main() -> Result<(), SemVerError> {
    let mut parsed_version = Version::parse("0.2.6")?;

    assert_eq!(
        parsed_version,
        Version {
            major: 0,
            minor: 2,
            patch: 6,
            pre: vec![],
            build: vec![],
        }
    );

    parsed_version.increment_patch();
    assert_eq!(parsed_version.to_string(), "0.2.7");
    println!("New patch release: v{}", parsed_version);

    parsed_version.increment_minor();
    assert_eq!(parsed_version.to_string(), "0.3.0");
    println!("New minor release: v{}", parsed_version);

    parsed_version.increment_major();
    assert_eq!(parsed_version.to_string(), "1.0.0");
    println!("New major release: v{}", parsed_version);

    Ok(())
}
```

### 解析一个复杂的版本号字符串
这里的版本号字符串还将包含 `SemVer` 中定义的预发布和构建元信息。

值得注意的是，为了符合 `SemVer` 的规则，构建元信息虽然会被解析，但是在做版本号比较时，该信息会被忽略。换而言之，即使两个版本号的构建字符串不同，它们的版本号依然可能相同。

```rust,editable
use semver::{Identifier, Version, SemVerError};

fn main() -> Result<(), SemVerError> {
    let version_str = "1.0.49-125+g72ee7853";
    let parsed_version = Version::parse(version_str)?;

    assert_eq!(
        parsed_version,
        Version {
            major: 1,
            minor: 0,
            patch: 49,
            pre: vec![Identifier::Numeric(125)],
            build: vec![],
        }
    );
    assert_eq!(
        parsed_version.build,
        vec![Identifier::AlphaNumeric(String::from("g72ee7853"))]
    );

    let serialized_version = parsed_version.to_string();
    assert_eq!(&serialized_version, version_str);

    Ok(())
}
```

### 检查给定的版本号是否是预发布
下面例子给出两个版本号，然后通过 [is_prerelease](https://docs.rs/semver/1.0.7/semver/struct.Version.html#method.is_prerelease) 判断哪个是预发布的版本号。

```rust,editable
use semver::{Version, SemVerError};

fn main() -> Result<(), SemVerError> {
    let version_1 = Version::parse("1.0.0-alpha")?;
    let version_2 = Version::parse("1.0.0")?;

    assert!(version_1.is_prerelease());
    assert!(!version_2.is_prerelease());

    Ok(())
}
```

### 找出给定范围内的最新版本
下面例子给出了一个版本号列表，我们需要找到其中最新的版本。

```rust,editable
#use error_chain::error_chain;

use semver::{Version, VersionReq};

#error_chain! {
#    foreign_links {
#        SemVer(semver::SemVerError);
#        SemVerReq(semver::ReqParseError);
#    }
3}

fn find_max_matching_version<'a, I>(version_req_str: &str, iterable: I) -> Result<Option<Version>>
where
    I: IntoIterator<Item = &'a str>,
{
    let vreq = VersionReq::parse(version_req_str)?;

    Ok(
        iterable
            .into_iter()
            .filter_map(|s| Version::parse(s).ok())
            .filter(|s| vreq.matches(s))
            .max(),
    )
}

fn main() -> Result<()> {
    assert_eq!(
        find_max_matching_version("<= 1.0.0", vec!["0.9.0", "1.0.0", "1.0.1"])?,
        Some(Version::parse("1.0.0")?)
    );

    assert_eq!(
        find_max_matching_version(
            ">1.2.3-alpha.3",
            vec![
                "1.2.3-alpha.3",
                "1.2.3-alpha.4",
                "1.2.3-alpha.10",
                "1.2.3-beta.4",
                "3.4.5-alpha.9",
            ]
        )?,
        Some(Version::parse("1.2.3-beta.4")?)
    );

    Ok(())
}
```

### 检查外部命令的版本号兼容性
下面将通过 [Command](https://doc.rust-lang.org/std/process/struct.Command.html) 来执行系统命令 `git --version`，并对该系统命令返回的 `git` 版本号进行解析。

```rust,editable
#use error_chain::error_chain;

use std::process::Command;
use semver::{Version, VersionReq};

#error_chain! {
#    foreign_links {
#        Io(std::io::Error);
#        Utf8(std::string::FromUtf8Error);
#        SemVer(semver::SemVerError);
#        SemVerReq(semver::ReqParseError);
#    }
#}

fn main() -> Result<()> {
    let version_constraint = "> 1.12.0";
    let version_test = VersionReq::parse(version_constraint)?;
    let output = Command::new("git").arg("--version").output()?;

    if !output.status.success() {
        error_chain::bail!("Command executed with failing error code");
    }

    let stdout = String::from_utf8(output.stdout)?;
    let version = stdout.split(" ").last().ok_or_else(|| {
        "Invalid command output"
    })?;
    let parsed_version = Version::parse(version)?;

    if !version_test.matches(&parsed_version) {
        error_chain::bail!("Command version lower than minimum supported version (found {}, need {})",
            parsed_version, version_constraint);
    }

    Ok(())
}
```