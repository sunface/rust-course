# 生命周期声明的范围过大

## 例子1
```rust
struct Interface<'a> {
    manager: &'a mut Manager<'a>
}

impl<'a> Interface<'a> {
    pub fn noop(self) {
        println!("interface consumed");
    }
}

struct Manager<'a> {
    text: &'a str    
}

struct List<'a> {
    manager: Manager<'a>,
}

impl<'a> List<'a> {
    pub fn get_interface(&'a mut self) -> Interface {
        Interface {
            manager: &mut self.manager
        }
    }
} 

fn main() {
    let mut list = List {
        manager: Manager {
            text: "hello"
        }
    };
    
    list.get_interface().noop();
    
    println!("Interface should be dropped here and the borrow released");
    
    // this fails because inmutable/mutable borrow
    // but Interface should be already dropped here and the borrow released
    use_list(&list);
}

fn use_list(list: &List) {
    println!("{}", list.manager.text);
}
```
运行后报错：
```console
error[E0502]: cannot borrow `list` as immutable because it is also borrowed as mutable // `list`无法被借用，因为已经被可变借用
  --> src/main.rs:40:14
   |
34 |     list.get_interface().noop();
   |     ---- mutable borrow occurs here // 可变借用发生在这里
...
40 |     use_list(&list);
   |              ^^^^^
   |              |
   |              immutable borrow occurs here // 新的不可变借用发生在这
   |              mutable borrow later used here // 可变借用在这里结束
```

这段代码看上去并不复杂，实际上难度挺高的，首先在直觉上，`list.get_interface()`借用的可变引用，按理来说应该在这行代码结束后，就归还了，为何能持续到`use_list(&list)`后面呢？

这是因为我们在`get_interface`方法中声明的`lifetime`有问题，该方法的参数的生明周期是`'a`，而`List`的生命周期也是`'a`，说明该方法至少活得跟`List`一样久，再回到`main`函数中，`list`可以活到`main`函数的结束，因此`list.get_interface()`借用的可变引用也会活到`main`函数的结束，在此期间，自然无法再进行借用了。

要解决这个问题，我们需要为`get_interface`方法的参数给予一个不同于`List<'a>`的生命周期`'b`，最终代码如下：
```rust
struct Interface<'b, 'a: 'b> {
    manager: &'b mut Manager<'a>
}

impl<'b, 'a: 'b> Interface<'b, 'a> {
    pub fn noop(self) {
        println!("interface consumed");
    }
}

struct Manager<'a> {
    text: &'a str    
}

struct List<'a> {
    manager: Manager<'a>,
}

impl<'a> List<'a> {
    pub fn get_interface<'b>(&'b mut self) -> Interface<'b, 'a>
    where 'a: 'b {
        Interface {
            manager: &mut self.manager
        }
    }
} 

fn main() {

    let mut list = List {
        manager: Manager {
            text: "hello"
        }
    };
    
    list.get_interface().noop();
    
    println!("Interface should be dropped here and the borrow released");
    
    // this fails because inmutable/mutable borrow
    // but Interface should be already dropped here and the borrow released
    use_list(&list);
}

fn use_list(list: &List) {
    println!("{}", list.manager.text);
}
```

当然，咱还可以给生命周期给予更有意义的名称：
```rust
struct Interface<'text, 'manager> {
    manager: &'manager mut Manager<'text>
}

impl<'text, 'manager> Interface<'text, 'manager> {
    pub fn noop(self) {
        println!("interface consumed");
    }
}

struct Manager<'text> {
    text: &'text str    
}

struct List<'text> {
    manager: Manager<'text>,
}

impl<'text> List<'text> {
    pub fn get_interface<'manager>(&'manager mut self) -> Interface<'text, 'manager> {
        Interface {
            manager: &mut self.manager
        }
    }
} 

fn main() {
    let mut list = List {
        manager: Manager {
            text: "hello"
        }
    };
    
    list.get_interface().noop();
    
    println!("Interface should be dropped here and the borrow released");
    
    // this fails because inmutable/mutable borrow
    // but Interface should be already dropped here and the borrow released
    use_list(&list);
}

fn use_list(list: &List) {
    println!("{}", list.manager.text);
}
```