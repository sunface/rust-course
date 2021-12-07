# 依赖管理


## 依赖升级

Minor note about your second point: You can use cargo update to update versions of transitive dependencies in your Cargo.lock when applicable; the very nice cargo-edit crate provides a cargo upgrade command which does the same for your Cargo.toml. If you use VSCode, I can also recommend the "crates" extension which shows available updates inline in your Cargo.toml.