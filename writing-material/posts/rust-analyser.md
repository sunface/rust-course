## 可以为rust-analyzer指定一个check文件夹，避免构建的cache被lock住

You can already setup rust-analyzer to use different folder. I set `Check On Save` to `check` and in `Check On Save: Extra Args` to `--target-dir target/rust-analyzer-target`.