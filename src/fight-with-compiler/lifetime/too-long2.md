# 生命周期过大-02

继上篇文章后，我们再来看一段**可能**涉及生命周期过大导致的无法编译问题:
```rust
fn bar(writer: &mut Writer) {
    baz(writer.indent());
    writer.write("world");
}

fn baz(writer: &mut Writer) {
    writer.write("hello");
}

pub struct Writer<'a> {
    target: &'a mut String,
    indent: usize,
}

impl<'a> Writer<'a> {
    fn indent(&'a mut self) -> &'a mut Self {
        &mut Self {
            target: self.target,
            indent: self.indent + 1,
        }
    }

    fn write(&mut self, s: &str) {
        for _ in 0..self.indent {
            self.target.push(' ');
        }
        self.target.push_str(s);
        self.target.push('\n');
    }
}

fn main() {}
```

报错如下：
```console
error[E0623]: lifetime mismatch
 --> src/main.rs:2:16
  |
1 | fn bar(writer: &mut Writer) {
  |                -----------
  |                |
  |                these two types are declared with different lifetimes...
2 |     baz(writer.indent());
  |                ^^^^^^ ...but data from `writer` flows into `writer` here
```

WTF，这什么报错，之前都没有见过，而且很难理解，什么叫`writer`滑入了另一个`writer`？

别急，我们先来仔细看下代码，注意这一段：
```rust
impl<'a> Writer<'a> {
    fn indent(&'a mut self) -> &'a mut Self {
        &mut Self {
            target: self.target,
            indent: self.indent + 1,
        }
    }
```
这里的生命周期定义说明`indent`方法使用的。。。等等！你的代码错了，你怎么能在一个函数中返回一个新创建实例的引用？！！最重要的是，编译器不提示这个错误，竟然提示一个莫名其妙看不懂的东东。

行，那我们先解决这个问题，将该方法修改为:
```rust
fn indent(&'a mut self) -> Writer<'a> {
    Writer {
        target: self.target,
        indent: self.indent + 1,
    }
}
```

怀着惴惴这心，再一次运行程序，果不其然，编译器又朝我们扔了一坨错误：
```console
error[E0308]: mismatched types
 --> src/main.rs:2:9
  |
2 |     baz(writer.indent());
  |         ^^^^^^^^^^^^^^^
  |         |
  |         expected `&mut Writer<'_>`, found struct `Writer`
  |         help: consider mutably borrowing here: `&mut writer.indent()`
```

哦，这次错误很明显，因为`baz`需要`&mut Writer`，但是咱们`writer.indent`返回了一个`Writer`，因此修改下即可:
```rust
fn bar(writer: &mut Writer) {
    baz(&mut writer.indent());
    writer.write("world");
}
```

这次总该成功了吧？再次心慌慌的运行编译器，哐：
```console
error[E0623]: lifetime mismatch
 --> src/main.rs:2:21
  |
1 | fn bar(writer: &mut Writer) {
  |                -----------
  |                |
  |                these two types are declared with different lifetimes...
2 |     baz(&mut writer.indent());
  |                     ^^^^^^ ...but data from `writer` flows into `writer` here
```

可恶，还是这个看不懂的错误，仔细检查了下代码，这次真的没有其他错误了，只能硬着头皮上。

大概的意思可以分析，生命周期范围不匹配，说明一个大一个小，然后一个`writer`中流入到另一个`writer`说明，两个`writer`的生命周期定义错了，既然这里提到了`indent`方法调用，那么我们再去仔细看一眼：
```rust
impl<'a> Writer<'a> {
    fn indent(&'a mut self) -> Writer<'a> {
        Writer {
            target: self.target,
            indent: self.indent + 1,
        }
    }
    ...
}
```
好像有点问题，`indent`返回的`Writer`的生命周期和外面的`Writer`的生命周期一模一样，这很不合理，一眼就能看出前者远小于后者,那我们尝试着修改下`indent`:
```rust
 fn indent<'b>(&'b mut self) -> Writer<'b> {
    Writer {
        target: self.target,
        indent: self.indent + 1,
    }
}
```

Bang! 编译成功，不过稍等，回想下生命周期消除的规则，我们还可以实现的更优雅：
```rust
fn bar(writer: &mut Writer) {
    baz(&mut writer.indent());
    writer.write("world");
}

fn baz(writer: &mut Writer) {
    writer.write("hello");
}

pub struct Writer<'a> {
    target: &'a mut String,
    indent: usize,
}

impl<'a> Writer<'a> {
    fn indent(&mut self) -> Writer {
        Writer {
            target: self.target,
            indent: self.indent + 1,
        }
    }

    fn write(&mut self, s: &str) {
        for _ in 0..self.indent {
            self.target.push(' ');
        }
        self.target.push_str(s);
        self.target.push('\n');
    }
}

fn main() {}
```

至此，问题彻底解决，太好了，我感觉我又变强了。可是默默看了眼自己的头发，只能以`哎～`一声叹息结束本章内容。