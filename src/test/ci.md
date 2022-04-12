# 用 GitHub Actions 进行持续集成

[GitHub Actions](https://github.com/features/actions) 是官方于 2018 年推出的持续集成服务，它非常强大，本文将手把手带领大家学习如何使用 `GitHub Actions` 对 Rust 项目进行持续集成。

持续集成是软件开发中异常重要的一环，大家应该都听说过 `Jenkins`，它就是一个拥有悠久历史的持续集成工具。简单来说，持续集成会定期拉取同一个项目中所有成员的相关代码，对其进行自动化构建。

在没有持续集成前，首先开发者需要手动编译代码并运行单元测试、集成测试等基础测试，然后启动项目相关的所有服务，接着测试人员开始介入对整个项目进行回归测试、黑盒测试等系统化的测试，当测试通过后，最后再手动发布到指定的环境中运行，这个过程是非常冗长，且所有成员都需要同时参与的。

在有了持续集成后，只要编写好相应的编译、测试、发布配置文件，那持续集成平台会自动帮助我们完成整个相关的流程，期间无需任何人介入，高效且可靠。

## GitHub Actions

而本文的主角正是这样的持续集成平台，它由 GitHub 官方提供，并且跟 GitHub 进行了深度的整合，其中 `actions` 代表了代码拉取、测试运行、登陆远程服务器、发布到第三方服务等操作行为。

最妙的是 GitHub 发现这些 `actions` 其实在很多项目中都是类似的，意味着 `actions` 完全可以被多个项目共享使用，而不是每个项目都从零开发自己的 `actions`。

若你需要某个 `action`，不必自己写复杂的脚本，直接引用他人写好的 `action` 即可，整个持续集成过程，就变成了多个 `action` 的组合，这就是` GitHub Actions` 最厉害的地方。

#### action 的分享与引用

既然 `action` 这么强大，我们就可以将自己的 `action` 分享给他人，也可以引用他人分享的 `action`，有以下几种方式：

1. 将你的 `action` 放在 GitHub 上的公共仓库中，这样其它开发者就可以引用，例如 [github-profile-summary-cards](https://github.com/vn7n24fzkq/github-profile-summary-cards) 就提供了相应的 `action`，可以生成 GitHub 用户统计信息，然后嵌入到你的个人主页中，具体效果[见这里](https://github.com/sunface)
2. GitHub 提供了一个[官方市场](https://github.com/marketplace?type=actions)，里面收集了许多质量不错的 `actions`，并支持在线搜索
3. [awesome-actions](https://github.com/sdras/awesome-actions)，由三方开发者收集并整理的 actions
4. [starter workflows](https://github.com/actions/starter-workflows)，由官方提供的工作流( workflow )模版

对于第一点这里再补充下，如果你想要引用某个代码仓库中的 `action` ，可以通过 `userName/repoName` 方式来引用: 例如你可以通过 `actions/setup-node` 来引用 `github.com/actions/setup-node` 仓库中的 `action`，该 `action` 的作用是安装 Node.js。

由于 `action` 是代码仓库，因此就有版本的概念，你可以使用 `@` 符号来引入同一个仓库中不同版本的 `action`，例如:

```yml
actions/setup-node@master  # 指向一个分支
actions/setup-node@v2.5.1    # 指向一个 release
actions/setup-node@f099707 # 指向一个 commit
```

如果希望深入了解，可以进一步查看官方的[文档](https://docs.github.com/cn/actions/creating-actions/about-custom-actions#using-release-management-for-actions)。

## Actions 基础

在了解了何为 GitHub Actions 后，再来通过一个基本的例子来学习下它的基本概念，注意，由于篇幅有限，我们只会讲解最常用的部分，如果想要完整的学习，请移步[这里](https://docs.github.com/en/actions)。

#### 创建 action demo

首先，为了演示，我们需要创建一个公开的 GitHub 仓库 `rust-action`，然后在仓库主页的导航栏中点击 `Actions` ，你会看到如下页面 :

<img src="https://pic1.zhimg.com/80/v2-4bb58f042c7a285219910bfd3c259464_1440w.jpg" />

接着点击 `set up a workflow yourself ->` ，你将看到系统为你自动创建的一个工作流 workflow ，在 `rust-action/.github/workflows/main.yml` 文件中包含以下内容:

```yml
# 下面是一个基础的工作流，你可以基于它来编写自己的 GitHub Actions
name: CI

# 控制工作流何时运行
on:
  # 当 `push` 或 `pull request` 事件发生时就触发工作流的执行，这里仅仅针对 `main` 分支
  push:
    branches: [main]
  pull_request:
    branches: [main]

  # 允许用于在 `Actions` 标签页中手动运行工作流
  workflow_dispatch:

# 工作流由一个或多个作业( job )组成，这些作业可以顺序运行也可以并行运行
jobs:
  # 当前的工作流仅包含一个作业，作业 id 是 "build"
  build:
    # 作业名称
    name: build rust action
    # 执行作业所需的运行器 runner
    runs-on: ubuntu-latest

    # steps 代表了作业中包含的一系列可被执行的任务
    steps:
      # 在 $GITHUB_WORKSPACE 下 checks-out 当前仓库，这样当前作业就可以访问该仓库
      - uses: actions/checkout@v2

      # 使用运行器的终端来运行一个命令
      - name: Run a one-line script
        run: echo Hello, world!

      # 使用运行器的终端运行一组命令
      - name: Run a multi-line script
        run: |
          echo Add other actions to build,
          echo test, and deploy your project.
```

#### 查看工作流信息

通过内容的注释，大家应该能大概理解这个工作流是怎么回事了，在具体讲解前，我们先完成 `Actions` 的创建，点击右上角的 `Start Commit` 绿色按钮提交，然后再回到 `Actions` 标签页，你可以看到如下界面:

<img src="https://pic2.zhimg.com/80/v2-301a8feac57633f34f9cd638ac139c22_1440w.jpg" />

这里包含了我们刚创建的工作流及当前的状态，从右下角可以看出，该工作流的运行时间是 `now` 也就是现在，`queued` 代表它已经被安排到了运行队列中，等待运行。

等过几秒(也可能几十秒后)，刷新当前页面，就能看到成功运行的工作流：

<img src="https://pic3.zhimg.com/80/v2-99fb593bc3140f71c316ce0ba6249911_1440w.png"/>

还记得之前配置中的 `workflow_dispatch` 嘛？它允许工作流被手动执行：点击左边的 `All workflows -> CI` ，可以看到如下页面。

<img src="https://pic3.zhimg.com/80/v2-cc1d9418f6befb5a089cde659666e65e_1440w.png" />

页面中通过蓝色的醒目高亮提示我们 `this workflow has a workflow_dispatch event trigger`，因此可以点击右边的 `Run workflow` 手动再次执行该工作流。

> 注意，目前 `Actions` 并不会自动渲染最新的结果，因此需要刷新页面来看到最新的结果

点击 `Create main.yml` 可以查看该工作流的详细信息：

<img src="https://pic1.zhimg.com/80/v2-94b46f23b5d63de35eae7f0425bb99b7_1440w.jpg" />

至此，我们已经初步掌握 `GitHub Actions` 的用法，现在来看看一些基本的概念。

#### 基本概念

- **GitHub Actions**，每个项目都拥有一个 `Actions` ，可以包含多个工作流
- **workflow 工作流**，描述了一次持续集成的过程
- **job 作业**，一个工作流可以包含多个作业，因为一次持续集成本身就由多个不同的部分组成
- **step 步骤**，每个作业由多个步骤组成，按照顺序一步一步完成
- **action 动作**，每个步骤可以包含多个动作，例如上例中的 `Run a multi-line script` 步骤就包含了两个动作

可以看出，每一个概念都是相互包含的关系，前者包含了后者，层层相扣，正因为这些精心设计的对象才有了强大的 `GitHub Actions`。

#### on

`on` 可以设定事件用于触发工作流的运行：

1. 一个或多个 GitHub 事件，例如 `push` 一个 `commit`、创建一个 `issue`、提交一次 `pr` 等等，详细的事件列表参见[这里](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows)

2. 预定的时间，例如每天零点零分触发，详情见[这里](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule)

```yml
on:
  schedule: -cron:'0 0 * * *'
```

3. 外部事件触发，例如你可以通过 `REST API` 向 GitHub 发送请求去触发，具体请查阅[官方文档](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#repository_dispatch)

#### jobs

工作流由一个或多个作业 `job` 组成，这些作业可以顺序运行也可以并行运行，同时我们还能使用 `needs` 来指定作业之间的依赖关系：

```yml
jobs:
  job1:

  job2:
    needs: job1

  job3:
    needs: [job1, job2]
```

这里的 `job2` 必须等待 `job1` 成功后才能运行，而 `job3` 则需要等待 `job1` 和 `job2`。

#### runs-on

指定作业的运行环境，运行器 `runner` 分为两种：`GitHub-hosted runner` 和 `self-hosted runner`，后者是使用自己的机器来运行作业，但是需要 GitHub 能进行访问并给予相应的机器权限，感兴趣的同学可以看看[这里](https://docs.github.com/en/actions/using-jobs/choosing-the-runner-for-a-job#choosing-self-hosted-runners)。

而对于前者，GitHub 提供了以下的运行环境：

<img src="https://pic2.zhimg.com/80/v2-614999565cc513715aaf156c2e478991_1440w.jpg" />

其中比较常用的就是 `runs-on:ubuntu-latest`。

#### strategy.matrix

有时候我们常常需要对多个操作系统、多个平台、多个编程语言版本进行测试，为此我们可以配置一个 `matrix` 矩阵：

```yml
runs-on: ${{ matrix.os }}
strategy:
  matrix:
    os: [ubuntu-18.04, ubuntu-20.04]
    node: [10, 12, 14]
steps:
  - uses: actions/setup-node@v2
    with:
      node-version: ${{ matrix.node }}
```

大家猜猜，这段代码会最终构建多少个作业？答案是 `2 * 3 = 6`，通过 `os` 和 `node` 进行组合，就可以得出这个结论，这也是 `matrix` 矩阵名称的来源。

当然，`matrix` 能做的远不止这些，例如，你还可以定义自己想要的 `kv` 键值对，想要深入学习的话可以看看[官方文档](https://docs.github.com/en/actions/using-jobs/using-a-build-matrix-for-your-jobs)。

#### strategy

除了 `matrix` ，`strategy` 中还能设定以下内容：

- `fail-fast` : 默认为 true ，即一旦某个矩阵任务失败则立即取消所有还在进行中的任务
- `max-paraller` : 可同时执行的最大并发数，默认情况下 GitHub 会动态调整

#### env

用于设定环境变量，可以用于以下地方:

- env

- jobs.<job_id>.env

- jobs.<job_id>.steps.env

```yml
env:
  NODE_ENV: dev

jobs:
  job1:
    env:
      NODE_ENV: test

    steps:
      - name:
        env:
          NODE_ENV: prod
```

如果有多个 `env` 存在，会使用就近那个。

至此，`GitHub Actions` 的常用内容大家已经基本了解，下面来看一个实用的示例。

## 真实示例：生成 GitHub 统计卡片

相信大家看过不少用户都定制了自己的个性化 GitHub 首页，这个是通过在个人名下创建一个同名的仓库来实现的，该仓库中的 `Readme.md` 的内容会自动展示在你的个人首页中，例如 `Sunface` 的[个人首页](https://github.com/sunface) 和内容所在的[仓库](https://github.com/sunface/sunface)。

大家可能会好奇上面链接中的 GitHub 统计卡片如何生成，其实有两种办法:

- 使用 [github-readme-stats](https://github.com/anuraghazra/github-readme-stats)
- 使用 `GitHub Actions` 来引用其它人提供的 `action` 生成对应的卡片，再嵌入进来， `Sunface` 的个人首页就是这么做的

第一种的优点就是非常简单，缺点是样式不太容易统一，不能对齐对于强迫症来说实在难受 :( 而后者的优点是规规整整的卡片，缺点就是使用起来更加复杂，而我们正好借此来看看真实的 `GitHub Actions` 长什么样。

首先，在你的同名项目下创建 `.github/workflows/profile-summary-cards.yml` 文件，然后填入以下内容:

```yml
# 工作流名称
name: GitHub-Profile-Summary-Cards

on:
  schedule:
    # 每24小时触发一次
    - cron: "0 * * * *"
  # 开启手动触发
  workflow_dispatch:

jobs:
  # job id
  build:
    runs-on: ubuntu-latest
    name: generate

    steps:
      # 第一步，checkout 当前项目
      - uses: actions/checkout@v2
      # 第二步，引入目标 action: vn7n24fzkq/github-profile-summary-cards仓库中的 `release` 分支
      - uses: vn7n24fzkq/github-profile-summary-cards@release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          USERNAME: ${{ github.repository_owner }}
```

当提交后，该工作流会自动在当前项目中生成 `profile-summary-card-output` 目录，然后将所有卡片放入其中，当然我们这里使用了定时触发的机制，并没有基于 `pr` 或`push` 来触发，如果你在编写过程中，希望手动触发来看看结果，请参考前文的手动触发方式。

这里我们引用了 `vn7n24fzkq/github-profile-summary-cards@release` 的 `action`，位于 `https://github.com/vn7n24fzkq/github-profile-summary-cards` 仓库中，并指定使用 `release` 分支。

接下来就可以愉快的[使用这些卡片](https://github.com/sunface/sunface/edit/master/Readme.md)来定制我们的主页了: )

## 使用 Actions 来构建 Rust 项目

其实 Rust 项目也没有什么特别之处，我们只需要在 `steps` 逐步构建即可，下面给出该如何测试和构建的示例。

#### 测试

```yml
on: [push, pull_request]

name: Continuous integration

jobs:
  check:
    name: Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions-rs/toolchain@v1
        with:
          profile: minimal
          toolchain: stable
          override: true
      - uses: actions-rs/cargo@v1
        with:
          command: check

  test:
    name: Test Suite
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions-rs/toolchain@v1
        with:
          profile: minimal
          toolchain: stable
          override: true
      - uses: actions-rs/cargo@v1
        with:
          command: test

  fmt:
    name: Rustfmt
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions-rs/toolchain@v1
        with:
          profile: minimal
          toolchain: stable
          override: true
      - run: rustup component add rustfmt
      - uses: actions-rs/cargo@v1
        with:
          command: fmt
          args: --all -- --check

  clippy:
    name: Clippy
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions-rs/toolchain@v1
        with:
          profile: minimal
          toolchain: stable
          override: true
      - run: rustup component add clippy
      - uses: actions-rs/cargo@v1
        with:
          command: clippy
          args: -- -D warnings
```

## 构建

```yml
name: build
on:
  workflow_dispatch: {}
jobs:
  build:
    name: build
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        build: [linux, macos, windows]
        include:
          - build: linux
            os: ubuntu-18.04
            rust: nightly
            target: x86_64-unknown-linux-musl
            archive-name: sgf-render-linux.tar.gz
          - build: macos
            os: macos-latest
            rust: nightly
            target: x86_64-apple-darwin
            archive-name: sgf-render-macos.tar.gz
          - build: windows
            os: windows-2019
            rust: nightly-x86_64-msvc
            target: x86_64-pc-windows-msvc
            archive-name: sgf-render-windows.7z
      fail-fast: false

    steps:
      - name: Checkout repository
        uses: actions/checkout@v2

      - name: Install Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: ${{ matrix.rust }}
          profile: minimal
          override: true
          target: ${{ matrix.target }}

      - name: Build binary
        run: cargo build --verbose --release --target ${{ matrix.target }}
        env:
          RUST_BACKTRACE: 1

      - name: Strip binary (linux and macos)
        if: matrix.build == 'linux' || matrix.build == 'macos'
        run: strip "target/${{ matrix.target }}/release/sgf-render"

      - name: Build archive
        shell: bash
        run: |
          mkdir archive
          cp LICENSE README.md archive/
          cd archive
          if [ "${{ matrix.build }}" = "windows" ]; then
            cp "../target/${{ matrix.target }}/release/sgf-render.exe" ./
            7z a "${{ matrix.archive-name }}" LICENSE README.md sgf-render.exe
          else
            cp "../target/${{ matrix.target }}/release/sgf-render" ./
            tar -czf "${{ matrix.archive-name }}" LICENSE README.md sgf-render
          fi
      - name: Upload archive
        uses: actions/upload-artifact@v1
        with:
          name: ${{ matrix.archive-name }}
          path: archive/${{ matrix.archive-name }}
```

限于文章篇幅有限，我们就不再多做解释，大家有疑问可以看看文中给出的文档链接，顺便说一句官方文档是支持中文的！

