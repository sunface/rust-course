# Rust 语言基础学习：Rust 2024 升级计划

> - 状态：执行中（阶段 0 已完成，等待验收）
> - 范围：`Rust 语言基础学习` 及其前置入门章节
> - 版本基线：Rust 2024 Edition / Rust 1.97.1
> - 基线日期：2026-08-14

## 1. 背景与目标

本轮重构以 Rust 2024 Edition 为语言基线，以 Rust 1.97.1 为已验证工具链，在现有目录和章节组织下升级“Rust 语言基础学习”的技术内容与代码示例。

目标不是简单替换版本号，而是让这一部分具备以下特征：

- 初学者从安装到完成 `minigrep` 项目，学习路径连续且无隐性前置知识。
- 所有示例明确区分“可运行”“只编译”“预期编译失败”“伪代码”。
- 正文只教授稳定 Rust；基础章节中的 Nightly 和实验性示例在原位置删除或改写。
- Rust 2024 对初学者有实际影响的变化进入对应章节，而不是单独堆成迁移清单。
- 容易随时间失效的工具、生态和实现细节得到清理或明确标注。
- 内容可以由 CI 持续验证，后续 Rust 版本升级时能快速发现退化。

### 本轮约束

- 冻结“Rust 语言基础学习”的现有目录、文件路径和 `SUMMARY.md` 层级。
- 不新增、删除、重命名、移动或拆分章节。
- 包括“全模式列表”在内的现有章节均保留原位置，只升级正文和示例。
- 发现结构问题时先记录，不在本轮内容升级中处理；结构优化留到后续独立计划。

## 2. 已确认的版本基线

### 2.1 教学基线

- Edition：Rust 2024。
- 验证工具链：Rust 1.97.1。
- 支持通道：Stable。
- 基础部分不依赖 Nightly，不使用 `#![feature(...)]`。

书中统一使用“本文经 Rust 1.97.1 验证”之类的准确表述，不使用无法长期成立的“当前最新版”。

### 2.2 仓库策略

- 增加 `rust-toolchain.toml`，固定主验证版本为 `1.97.1`。
- 工具链组件至少包含 `rustfmt` 和 `clippy`。
- CI 同时设置两条验证线：
  - 必须通过：固定工具链 Rust 1.97.1。
  - 前瞻检查：最新 Stable，用于提前发现教程漂移。
- `book.toml` 最终切换到 `edition = "2024"`。

注意：`book.toml` 的 edition 是全书级配置。切换前必须先修正基础部分代码块分类，并确认不会让其他两部分失去最低可构建性。

## 3. 当前审计结论

### 3.1 内容规模

- 基础学习范围包含 `first-try/`、`basic/` 和 `basic-practice/`。
- 共 54 个章节文件、711 个代码围栏；初始审计中有 538 个 Rust 围栏，其中包含 1 个格式错误的 `rust,` 围栏。
- 14 个章节超过 400 行，部分章节承担了过多主题。
- 基础部分存在约 95 个指向 `https://beatai.org/rust-course...` 的站内绝对链接。
- 仍有 10 处旧版 `Rust 1.x` 标识需要逐一判断是历史说明还是过期信息。

### 3.2 验证问题

- 当前几乎没有使用 `rust,compile_fail`，只有少量 `rust,ignore`。
- `mdbook test` 会把教学中的错误示例和代码片段当作完整程序执行，导致多个基础章节失败。
- 已发现失败集中在变量、数值、所有权、借用、字符串、结构体、枚举、模式、Trait 和文档等核心章节。
- 当前 CI 使用浮动的 Stable 与最新版 mdBook，不能稳定复现某次教程发布时的结果。

### 3.3 已确认的过时或不准确内容

- `book.toml` 仍使用 Edition 2021。
- 安装章节仍展示 Rust 1.56.1 / Cargo 1.57.0 的输出。
- Cargo 章节仍以 Edition 2021、`rand 0.3`、`hammer 0.5` 为例。
- Cargo.lock 的提交建议已过时，不能再简单表述为“库项目加入 `.gitignore`”。
- 下载加速章节仍把 sparse 注册表写成需要手动开启的特性；它自 Cargo 1.70 起已是 crates.io 默认协议。
- 下载加速章节包含旧 Git 注册表配置和手动删除 `$HOME/.cargo/.package_cache` 的高风险建议。
- 泛型章节使用 `#![feature(generic_const_exprs)]`；该能力仍不适合进入稳定版基础教程。
- 错误处理章节称 `Termination` 尚未稳定，此说法已经失效。
- 工具章节把普通编译器警告与 Clippy lint 混为一谈，需要拆开说明 `cargo check` 与 `cargo clippy`。
- 个别章节把容器扩容、内存位置、String 布局、HashMap hasher 等实现细节写成语言或标准库保证，需要改成概念说明或弱化措辞。

## 4. 内容升级边界

### 4.1 保持现有组织结构

本轮严格按照当前阅读顺序逐章升级：

1. 环境安装与工具链。
2. 变量、基本类型、函数、表达式和流程控制。
3. 所有权、借用与切片。
4. 结构体、枚举、模式匹配与方法。
5. 包、Crate、模块与 `use`。
6. 常用集合与错误处理。
7. 泛型、Trait 与生命周期基础。
8. 项目内的测试实践。
9. 综合项目 `minigrep`。

上述列表只用于说明内容主线，不代表调整章节顺序或目录结构。

### 4.2 原位升级原则

- “全模式列表”保留在 `basic/match-pattern/all-patterns.md`，在原文件中更新语法、示例和说明。
- “进一步深入特征”保留在现有位置，通过内容分层和“可选阅读”提示控制难度。
- 泛型章节中的 `generic_const_exprs` Nightly 示例原位改写为 Stable Rust 支持的 const generics 内容。
- 格式化输出与 rustdoc 章节均保留原位置，直接修正过时内容并优化章内结构。
- 超长章节可以调整二级、三级标题和段落顺序，但不拆成新文件。
- Rust 2024 的新内容只补充到最相关的现有章节，不为版本变化新建章节。

### 4.3 写作标准

每章尽量采用相同结构：

1. 本章目标。
2. 最小可运行示例。
3. 概念解释。
4. 常见错误及编译器反馈。
5. 小结。
6. 可验证练习。

保留教程原有的交流感与作者风格，但删除或标明日期的内容包括：编辑器排名、语言流行度、其他语言未来计划、短期生态趋势等。

## 5. Rust 2024 内容落点

Rust 2024 的变化应融入原有知识点，不单独制造一章庞大的版本迁移说明。

| 变化 | 基础部分落点 | 处理方式 |
| --- | --- | --- |
| `gen` 成为保留关键字 | 变量与关键字 | 介绍原始标识符 `r#gen`，说明新代码应避免使用 |
| let chains | 流程控制、模式匹配 | 使用 Edition 2024 写法补充连续条件示例 |
| match ergonomics 调整 | 模式匹配 | 更新引用模式示例和错误说明 |
| `if let` 临时值作用域变化 | 流程控制、智能指针相关提示 | 用一个短例子说明析构时机，不展开高级实现 |
| 尾表达式临时值作用域变化 | 表达式、生命周期 | 修正可能受影响的示例，并解释常见借用错误 |
| Cargo resolver 3 | Cargo | 将 Edition 2024 项目清单与依赖解析策略一并更新 |
| never type fallback 变化 | 函数 | 仅在确实影响示例时提示，详细内容放进阶部分 |

## 6. 代码示例规范

所有 Rust 代码围栏必须归入以下类型之一：

| 标记 | 用途 |
| --- | --- |
| `rust` | 可编译且应执行成功的完整示例 |
| `rust,no_run` | 应成功编译，但不应在文档测试中执行 |
| `rust,compile_fail` | 为教学而展示的预期编译失败示例 |
| `rust,should_panic` | 应通过 panic 展示行为的示例 |
| `rust,ignore` | 受平台、网络或外部资源限制，暂不适合验证的 Rust 代码 |
| `text` | 伪代码、不完整片段、终端输出或非 Rust 内容 |

执行时遵守以下优先级：

1. 优先用 rustdoc 隐藏行 `#` 补齐上下文，让有价值的片段可编译。
2. 确实用于讲解错误时使用 `compile_fail`。
3. 只有无法合理验证时才使用 `ignore`。
4. 不通过滥用 `ignore` 来追求 CI 变绿。
5. 编译器诊断只保留教学所需的关键部分，避免复制依赖具体补丁版本的完整输出。

## 7. 分阶段执行计划

### 阶段 0：建立可复现基线

- [x] 新增 `rust-toolchain.toml`，固定 Rust 1.97.1、rustfmt 与 clippy。
- [x] 记录当前 `mdbook build` 与 `mdbook test` 的结果。
- [x] 为基础部分建立章节清单、代码块清单和失败清单。
- [x] 统一代码围栏分类，先修复测试基础设施问题。
- [x] 将 CI 拆为固定版本必过与最新 Stable 前瞻检查。
- [x] 固定或显式管理 mdBook 版本，避免 CI 无提示漂移。

完成标准：每个失败都能归类为“教程错误”“预期错误示例”“不完整片段”或“环境依赖”，不存在原因不明的失败。

#### 阶段 0 结果（2026-08-14）

- 固定工具链为 Rust 1.97.1，并安装 `rustfmt` 与 `clippy`；CI 固定使用 mdBook 0.4.48。
- 初始基线：`mdbook build` 成功；基础范围 54 章中 19 章通过文档测试、35 章失败。
- 修正后基线：基础范围 54 章全部通过文档测试，且全书 `mdbook build` 成功。
- 711 个代码围栏已完成分类：`rust` 395 个、`compile_fail` 61 个、`should_panic` 12 个、`no_run` 8 个、`ignore` 14 个，其余非 Rust 围栏 221 个。
- 固定版本 CI 覆盖 Linux、macOS 和 Windows；最新 Stable 作为非阻塞前瞻检查。
- 全书其他部分尚未进入内容升级，因此本阶段只要求全书可构建，不要求进阶与工程部分通过文档测试。

### 阶段 1：重写“寻找牛刀”

- [ ] 更新 rustup、Rust 和 Cargo 的安装输出。
- [ ] Windows 以官方 MSVC 工具链为主路径；GNU、FreeBSD 等内容保留在原章节，以补充说明呈现。
- [ ] 编辑器统一推荐 rust-analyzer，补充 `cargo fmt`、`cargo check`、`cargo clippy` 的职责边界。
- [ ] Cargo 示例切换到 Edition 2024 与 resolver 3。
- [ ] 使用 `cargo add` 演示添加依赖，换用当前合理的依赖版本。
- [ ] 重写 Cargo.lock 建议：二进制和应用通常提交；库项目也可提交，按发布与复现需求决定。
- [ ] 重写下载加速章节：sparse 为默认方案，删除旧 Git 协议和危险缓存删除命令。
- [ ] 如保留国内镜像，只提供 HTTPS sparse 配置，并在发布前实际验证。
- [ ] 更新 Hello World 与遍历示例，移除已经过时的 edition 说明。

完成标准：新用户按 macOS、Linux、Windows 任一路径，可以创建、格式化、检查、测试和运行 Edition 2024 项目。

### 阶段 2：升级语法与基础类型

- [ ] 处理 `gen` 关键字及原始标识符。
- [ ] 核查整数溢出、浮点、字符、元组、数组与切片的描述。
- [ ] 避免把数组等数据结构的具体存储位置写成无条件保证。
- [ ] 更新函数、表达式和流程控制示例。
- [ ] 在合适位置引入 let chains。
- [ ] 修复所有预期失败代码块的分类与断言。

完成标准：变量到流程控制章节可以在 Rust 1.97.1 下独立通过文档测试。

### 阶段 3：所有权、复合类型与模式

- [ ] 用统一心智模型重写所有权、借用、引用和切片的过渡。
- [ ] 更新 String 与 `&str` 示例；只描述稳定 API 和概念模型，不承诺 ABI 布局。
- [ ] 核查 Vec 扩容措辞，不把增长倍数写成 API 保证。
- [ ] 更新结构体、枚举、Option、match 与 `if let` 示例。
- [ ] 纳入 Edition 2024 match ergonomics、`if let` 临时值和尾表达式临时值变化。
- [ ] 保留“模式适用场景”和“全模式列表”的现有位置，分别在原文件中更新内容，消除重复与过时示例。

完成标准：读者能用所有权解释常见编译错误，并能完成结构体/枚举驱动的小练习。

### 阶段 4：模块、集合与错误处理

- [ ] 按 package → crate → module → path → `use` 的顺序整理模块系统。
- [ ] 把站内绝对 URL 改为相对链接。
- [ ] 更新 Vec、HashMap 等集合示例，弱化未承诺的实现细节。
- [ ] 重新核对 panic、Result、`?` 和自定义错误的边界。
- [ ] 修正 `Termination` 的稳定性说明。
- [ ] 为命令行程序补充简洁的退出码处理方式。

完成标准：章节示例不依赖站点部署域名，集合与错误处理没有已知事实错误。

### 阶段 5：泛型、Trait 与生命周期

- [ ] 在泛型章节中删除 `generic_const_exprs` Nightly 示例，原位改写为 Stable Rust 的 const generics 内容。
- [ ] 保留 Trait 各章节的现有位置，更新基础内容，并将高级内容明确标为可选阅读。
- [ ] 通过调整章内小节和段落精简泛型、Trait 和生命周期章节，不拆分文件。
- [ ] 生命周期从函数签名与引用关系出发，减少把标注解释成“延长生命周期”的误导。
- [ ] 将高级生命周期、GAT 等内容链接到进阶部分。

完成标准：基础部分不含 feature gate，所有示例可在 Stable 上验证。

### 阶段 6：原位升级 `minigrep`

- [ ] 在现有 `basic-practice/tests.md` 中补齐项目所需的测试基础，不新增或移动章节。
- [ ] 分阶段复核 `minigrep`，确保每个中间版本都可编译。
- [ ] 统一跨平台命令、路径和换行符说明。
- [ ] 使用清晰的 `Result` 传播和退出码处理，但不在初学项目中过早引入复杂抽象。
- [ ] 为大小写搜索、环境变量和错误路径补齐测试。

完成标准：读者可从空项目完成 `minigrep`，并理解其核心测试，不需要提前阅读进阶或工程部分。

### 阶段 7：全量校验与发布准备

- [ ] 将 `book.toml` 切换至 Edition 2024。
- [ ] 执行全书构建与基础部分文档测试。
- [ ] 在 Linux、macOS、Windows CI 上验证关键命令和示例。
- [ ] 检查内部链接、标题层级、术语一致性与代码格式。
- [ ] 复查所有版本号、命令输出和外部链接。
- [ ] 记录本轮升级日志以及下一次基线复审日期。

完成标准：达到第 8 节全部验收条件。

## 8. 总体验收标准

- [ ] `book.toml` 使用 `edition = "2024"`。
- [ ] 仓库明确记录 Rust 1.97.1 验证基线。
- [ ] `mdbook build` 成功。
- [ ] 基础部分在 Rust 1.97.1 下通过全部文档测试。
- [ ] 最新 Stable 前瞻检查不会阻塞发布，但失败时会产生清晰报告。
- [ ] 不存在未分类的“故意编译失败”示例。
- [ ] 基础部分不存在 Nightly feature gate。
- [ ] 基础部分不存在指向 `beatai.org/rust-course` 的站内硬编码链接。
- [ ] 关键命令在 Linux、macOS、Windows 上成立，平台差异有明确说明。
- [ ] 编译错误输出已在 Rust 1.97.1 下重新生成或精简。
- [ ] 不把实现细节表述为语言或标准库的稳定保证。
- [ ] 基础部分不再依赖尚未讲解的进阶或工程章节。

## 9. 建议的提交粒度

为方便审阅和回退，每个阶段拆成独立提交：

1. `chore: pin rust 1.97.1 and establish book checks`
2. `docs: upgrade getting-started chapters to Rust 2024`
3. `docs: revise syntax and primitive type chapters`
4. `docs: revise ownership compound types and patterns`
5. `docs: revise modules collections and error handling`
6. `docs: streamline generics traits and lifetimes`
7. `docs: refresh tests chapter and minigrep`
8. `docs: complete Rust 2024 migration audit`

每个提交都应同时包含正文修改、对应代码围栏修复和必要测试，避免把内容更新与验证工作长期分离。

## 10. 风险与处理策略

| 风险 | 处理策略 |
| --- | --- |
| 全书共用 `book.toml` edition | 在基础部分代码块修复后再切换，并执行全书构建；其他部分遗留失败单独建账 |
| 编译器诊断随补丁版本变化 | 只展示关键诊断，完整输出由测试验证而非写死在正文 |
| 镜像地址和配置容易失效 | 官方 crates.io sparse 为主，第三方镜像必须标注维护日期并定期验证 |
| 外部 crate 版本继续变化 | 教学示例使用必要的最小依赖，并由锁定工具链与 CI 定期复查 |
| 超长章节一次改动过大 | 调整章内主题和学习目标，再逐段修正文与代码；本轮不拆文件 |
| 为通过测试而过度 `ignore` | 对 `ignore` 设置人工审查，优先改成可编译示例或 `compile_fail` |

## 11. 本轮不包含的工作

- 不调整“Rust 语言基础学习”的目录、文件路径、章节顺序和 `SUMMARY.md` 层级。
- 不新增、删除、重命名、移动或拆分章节，包括不移动“全模式列表”。
- 不在本轮系统重写“Rust 语言进阶学习”。
- 不在本轮系统重写“Rust 语言工程学习”。
- 不调整网站视觉设计和部署架构。
- 不更换现有公共 URL 结构；只修复正文中的站内链接写法。
- 不为了展示新特性而扩大基础部分的知识边界。

## 12. 官方参考资料

- [Rust 1.97.1](https://blog.rust-lang.org/2026/07/16/Rust-1.97.1/)
- [Rust 1.85.0 与 Rust 2024](https://blog.rust-lang.org/2025/02/20/Rust-1.85.0.html)
- [在 Cargo.toml 中选择 Edition](https://doc.rust-lang.org/edition-guide/editions/creating-a-new-project.html)
- [Rust 2024 Cargo resolver 3](https://doc.rust-lang.org/edition-guide/rust-2024/cargo-resolver.html)
- [`cargo add`](https://doc.rust-lang.org/stable/cargo/commands/cargo-add.html)
- [Cargo.toml 与 Cargo.lock](https://doc.rust-lang.org/cargo/guide/cargo-toml-vs-cargo-lock.html)
- [Rust 1.70：sparse 注册表成为默认协议](https://blog.rust-lang.org/2023/06/01/Rust-1.70.0/)
- [Rust 2024：match ergonomics](https://doc.rust-lang.org/edition-guide/rust-2024/match-ergonomics.html)
- [Rust 2024：`if let` 临时值作用域](https://doc.rust-lang.org/edition-guide/rust-2024/temporary-if-let-scope.html)
- [Rust 2024：尾表达式临时值作用域](https://doc.rust-lang.org/edition-guide/rust-2024/temporary-tail-expr-scope.html)
- [Rust 2024：`gen` 关键字](https://doc.rust-lang.org/edition-guide/rust-2024/gen-keyword.html)
- [Rust 1.88：let chains](https://blog.rust-lang.org/2025/06/26/Rust-1.88.0/)
- [rustdoc 文档测试](https://doc.rust-lang.org/rustdoc/documentation-tests.html)
- [generic_const_exprs 的实验状态](https://doc.rust-lang.org/unstable-book/language-features/generic-const-exprs.html)
- [rust-analyzer 的 VS Code 配置](https://rust-analyzer.github.io/book/vs_code.html)

## 13. 开工顺序

第一批工作先完成阶段 0，待验收后再进入阶段 1。之后依次完成安装、编辑器、Cargo、下载加速和 Hello World 五组入门章节，再向语言核心章节推进。
