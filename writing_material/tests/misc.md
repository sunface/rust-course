## Development dependencies
Sometimes there is a need to have dependencies for tests (or examples, or benchmarks) only. Such dependencies are added to Cargo.toml in the [dev-dependencies] section. These dependencies are not propagated to other packages which depend on this package.

One such example is using a crate that extends standard assert! macros.
File Cargo.toml:

```toml
# standard crate data is left out
[dev-dependencies]
pretty_assertions = "0.4.0"
```

File `src/lib.rs`:

```toml
// externing crate for test-only use
#[cfg(test)]
#[macro_use]
extern crate pretty_assertions;

pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_add() {
        assert_eq!(add(2, 3), 5);
    }
}
```