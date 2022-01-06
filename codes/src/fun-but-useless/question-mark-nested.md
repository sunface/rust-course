# ?嵌套

```rust
pub fn parse_items<I, O, E>(input: I) -> impl Iterator<Item = io::Result<Result<O, E>>>
where
    I: BufRead,
    O: FromStr<Err = E>,
{
    input.lines().filter_map(|line| {
        let line = match line {
            Ok(line) => line,
            Err(e) => return Some(Err(e)),
        };
        let line = line.trim();
        if line.is_empty() {
            None
        } else {
            Some(Ok(line.parse()))
        }
    })
}
```

然后下面的用法是完全合法的，注意`??`的使用:

```rust
let numbers: io::Result<Result<Vec<Line>, Error>> = aoc::parse_items(input).collect();
let numbers = numbers??;
```

考虑到`FromIterator`的实现，好像这样使用也是有道理的：

```rust
impl<A, E, V> FromIterator<Result<A, E>> for Result<V, E> where
    V: FromIterator<A>,
```

这是因为`Result<Vec<Line>>`实现了`FromIterator<Result<Line>>`，所以`io::Result<Result<Vec<Line>>>`就实现了`FromIterator<io::Result<Result<Line>>`

虽然上面的代码很酷，但是仔细想起来还是怪怪的，是不？最主要是难以理解，所以不建议大家使用。