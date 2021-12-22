# 持续集成


## github ci
https://github.com/julianandrews/sgf-render/blob/master/.github/workflows/build.yml

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