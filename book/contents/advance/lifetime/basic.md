# 认识生命周期

生命周期，简而言之就是引用的有效作用域。在大多数时候，我们无需手动的声明生命周期，因为编译器可以自动进行推导，用类型来类比下：
- 就像编译器大部分时候可以自动推导类型 <-> 一样，编译器大多数时候也可以自动推导生命周期
- 在多种类型存在时，编译器往往要求我们手动标明类型 <-> 当多个生命周期存在，且编译器无法推导出某个引用的生命周期时，就需要我们手动标明生命周期

Rust 生命周期之所以难，是因为这个概念对于我们来说是全新的，没有其它编程语言的经验可以借鉴。当你觉得难的时候，不用过于担心，这个难对于所有人都是平等的，多点付出就能早点解决此拦路虎，同时本书也会尽力帮助大家减少学习难度(生命周期很可能是Rust中最难的部分)。

## 悬垂指针和生命周期
生命周期的主要作用是避免悬垂引用，它会导致程序引用了本不该引用的数据：
```rust
{
    let r;

    {
        let x = 5;
        r = &x;
    }

    println!("r: {}", r);
}
```

这段代码有几点值得注意:
- `let r;` 的声明方式貌似存在使用 `null` 的风险，实际上，当我们不初始化它就使用时，编译器会给予报错
- `r` 引用了内部花括号中的 `x` 变量，但是 `x` 会在内部花括号 `}` 处被释放，因此回到外部花括号后，`r` 会引用一个无效的 `x`

此处 `r` 就是一个悬垂指针，它引用了提前被释放的变量 `x`，可以预料到，这段代码会报错：
```console
error[E0597]: `x` does not live long enough // x活得不够久
  --> src/main.rs:7:17
   |
7  |             r = &x;
   |                 ^^ borrowed value does not live long enough // 被借用的x活得不够久
8  |         }
   |         - `x` dropped here while still borrowed // x在这里被丢弃，但是它依然还在被借用
9  |  
10 |         println!("r: {}", r); 
   |                           - borrow later used here // 对x的借用在此处被使用
```

在这里 `r` 拥有更大的作用域，或者说**活得更久**。如果 Rust 不阻止该垂悬引用的发生，那么当 `x` 被释放后，`r` 所引用的值就不再是合法的，会导致我们程序发生异常行为，且该异常行为有时候会很难被发现。

## 借用检查
为了保证 Rust 的所有权和借用的正确性，Rust 使用了一个借用检查器(Borrow checker)，来检查我们程序的借用正确性：
```rust
{
    let r;                // ---------+-- 'a
                          //          |
    {                     //          |
        let x = 5;        // -+-- 'b  |
        r = &x;           //  |       |
    }                     // -+       |
                          //          |
    println!("r: {}", r); //          |
}  
```

这段代码和之前的一模一样，唯一的区别在于增加了对变量生命周期的注释。这里，`r` 变量被赋予了生命周期 `'a`，`x` 被赋予了生命周期 `'b`，从图示上可以明显看出生命周期 `'b` 比 `'a` 小很多。

在编译期，Rust 会比较两个变量的生命周期，结果发现 `r` 明明拥有生命周期 `'a`，但是却引用了一个小得多的生命周期 `'b`，在这种情况下，编译器会认为我们的程序存在风险，因此拒绝运行。

如果想要编译通过，也很简单，只要 `'b` 比 `'a` 大就好。总之，`x` 变量只要比 `r` 活得久，那么 `r` 就能随意引用 `x` 且不会存在危险：
```rust
{
    let x = 5;            // ----------+-- 'b
                          //           |
    let r = &x;           // --+-- 'a  |
                          //   |       |
    println!("r: {}", r); //   |       |
                          // --+       |
}                         // ----------+
```

根据之前的结论，我们重新实现了代码，现在 `x` 的生命周期 `'b` 大于 `r` 的生命周期 `'a`，因此 `r` 对 `x` 的引用是安全的。

通过之前的内容，我们了解了何为生命周期，也了解了 Rust 如何利用生命周期来确保引用是合法的，下面来看看函数中的生命周期。

## 函数中的生命周期
先来考虑一个例子 - 返回两个字符串切片中较长的那个，该函数的参数是两个字符串切片，返回值也是字符串切片：
```rust
fn main() {
    let string1 = String::from("abcd");
    let string2 = "xyz";

    let result = longest(string1.as_str(), string2);
    println!("The longest string is {}", result);
}
```

```rust
fn longest(x: &str, y: &str) -> &str {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}
```

这段 `longest` 实现，非常标准优美，就连多余的 `return` 和分号都没有，可是现实总是给我们重重一击：
```console
error[E0106]: missing lifetime specifier
 --> src/main.rs:9:33
  |
9 | fn longest(x: &str, y: &str) -> &str {
  |               ----     ----     ^ expected named lifetime parameter // 参数需要一个生命周期
  |
  = help: this function's return type contains a borrowed value, but the signature does not say whether it is 
  borrowed from `x` or `y`
  = 帮助： 该函数的返回值是一个引用类型，但是函数签名无法说明，该引用是借用自 `x` 还是 `y`
help: consider introducing a named lifetime parameter // 考虑引入一个生命周期
  |
9 | fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
  |           ^^^^    ^^^^^^^     ^^^^^^^     ^^^
```

喔，这真是一个复杂的提示，那感觉就好像是生命周期去非诚勿扰相亲，结果在初印象环节就23盏灯全灭。等等，先别急，如果你仔细阅读，就会发现，其实主要是编译器无法知道该函数的返回值到底引用 `x` 还是 `y` ，**因为编译器需要知道这些，来确保函数调用后的引用生命周期分析**。

不过说来尴尬，就这个函数而言，我们也不知道返回值到底引用哪个，因为一个分支返回 `x`，另一个分支返回 `y`...这可咋办？先来分析下。

我们在定义该函数时，首先无法知道传递给函数的具体值，因此到底是 `if` 还是 `else` 被执行，无从得知。其次，传入引用的具体生命周期也无法知道，因此也不能像之前的例子那样通过分析生命周期来确定引用是否有效。同时，编译器的借用检查也无法推导出返回值的生命周期，因为它不知道 `x` 和 `y` 的生命周期跟返回值的生命周期之间的关系是怎样的(说实话，人都搞不清，何况编译器这个大聪明)。

因此，这时就回到了文章开头说的内容：在存在多个引用时，编译器有时会无法自动推导生命周期，此时就需要我们手动去标注，通过为参数标注合适的生命周期来帮助编译器进行借用检查的分析。

## 生命周期标注语法
> 生命周期标注并不会改变任何引用的实际作用域 - 鲁迅

鲁迅说过的话，总是值得重点标注，当你未来更加理解生命周期时，你才会发现这句话的精髓和重要！现在先简单记住，**标记的生命周期只是为了取悦编译器，让编译器不要难为我们**，记住了吗？没记住，再回头看一遍，这对未来你遇到生命周期问题时会有很大的帮助！

在很多时候编译器是很聪明的，但是总有些时候，它会化身大聪明，自以为什么都很懂，然后去拒绝我们代码的执行，此时，就需要我们通过生命周期标注来告诉这个大聪明：别自作聪明了，听我的就好。

例如一个变量，只能活一个花括号，那么就算你给它标注一个活全局的生命周期，它还是会在前面的花括号结束处被释放掉，并不会真的全局存活。

生命周期的语法也颇为与众不同，以 `'` 开头，名称往往是一个单独的小写字母，大多数人都用 `'a` 来作为生命周期的名称。 如果是引用类型的参数，那么生命周期会位于引用符号 `&` 之后，并用一个空格来将生命周期和引用参数分隔开:
```rust
&i32        // 一个引用
&'a i32     // 具有显式生命周期的引用
&'a mut i32 // 具有显式生命周期的可变引用
```

一个生命周期标注，它自身并不具有什么意义，因为生命周期的作用就是告诉编译器多个引用之间的关系。例如，有一个函数，它的第一个参数 `first` 是一个指向 `i32` 类型的引用，具有生命周期 `'a`，该函数还有另一个参数 `second`，它也是指向 `i32` 类型的引用，并且同样具有生命周期 `'a`。此处生命周期标注仅仅说明，**这两个参数 `first` 和 `second` 至少活得和'a一样久，至于到底活多久或者哪个活得更久，抱歉我们都无法得知**：
```rust
fn useless<'a>(first: &'a i32, second: &'a i32) {}
```

#### 函数签名中的生命周期标注
继续之前的 `longest` 函数，从两个字符串切片中返回较长的那个：
```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}
```

需要注意的点如下：
- 和泛型一样，使用生命周期参数，需要先声明 `<'a>`
- `x`、`y` 和返回值至少活得和 `'a` 一样久(因为返回值要么是 `x`，要么是 `y`)

该函数签名表明对于某些生命周期 `'a`，函数的两个参数都至少跟 `'a` 活得一样久，同时函数的返回引用也至少跟 `'a` 活得一样久。实际上，这意味着返回值的生命周期与参数生命周期中的较小值一致：虽然两个参数的生命周期都是标注了 `'a`，但是实际上这两个参数的真实生命周期可能是不一样的(生命周期 `'a` 不代表生命周期等于 `'a`，而是大于等于 `'a`)。

回忆下“鲁迅”说的话，再参考上面的内容，可以得出：**在通过函数签名指定生命周期参数时，我们并没有改变传入引用或者返回引用的真实生命周期，而是告诉编译器当不满足此约束条件时，就拒绝编译通过**。

因此 `longest` 函数并不知道 `x` 和 `y` 具体会活多久，只要知道它们的作用域至少能持续 `'a` 这么长就行。

当把具体的引用传给 `longest` 时，那生命周期 `'a` 的大小就是 `x` 和 `y` 的作用域的重合部分，换句话说，`'a` 的大小将等于 `x` 和 `y` 中较小的那个。由于返回值的生命周期也被标记为 `'a`，因此返回值的生命周期也是 `x` 和 `y` 中作用域较小的那个。

说实话，这段文字我写的都快崩溃了，不知道你们读起来如何，实在***太绕了。。那就干脆用一个例子来解释吧：
```rust
fn main() {
    let string1 = String::from("long string is long");

    {
        let string2 = String::from("xyz");
        let result = longest(string1.as_str(), string2.as_str());
        println!("The longest string is {}", result);
    }
}
```

在上例中，`string1` 的作用域直到 `main` 函数的结束，而 `string2` 的作用域到内部花括号的结束 `}`，那么根据之前的理论，`'a` 是两者中作用域较小的那个，也就是 `'a` 的生命周期等于 `string2` 的生命周期，同理，由于函数返回的生命周期也是 '`a`，可以得出函数返回的生命周期也等于 `string2` 的生命周期。

现在来验证下上面的结论：`result` 的生命周期等于参数中生命周期最小的，因此要等于 `string2` 的生命周期，也就是说，`result` 要活得和 `string2` 一样久，观察下代码的实现，可以发现这个结论是正确的！

因此，在这种情况下，通过生命周期标注，编译器得出了和我们肉眼观察一样的结论，而不再是一个蒙圈的大聪明。

再来看一个例子，该例子证明了 `result` 的生命周期必须等于两个参数中生命周期较小的那个:
```rust
fn main() {
    let string1 = String::from("long string is long");
    let result;
    {
        let string2 = String::from("xyz");
        result = longest(string1.as_str(), string2.as_str());
    }
    println!("The longest string is {}", result);
}
```

Bang，错误冒头了：
```console
error[E0597]: `string2` does not live long enough
 --> src/main.rs:6:44
  |
6 |         result = longest(string1.as_str(), string2.as_str());
  |                                            ^^^^^^^ borrowed value does not live long enough 
7 |     }                                      
  |     - `string2` dropped here while still borrowed
8 |     println!("The longest string is {}", result);
  |                                          ------ borrow later used here
```

在上述代码中，`result` 必须要活到 `println!`处，因为 `result` 的生命周期是 `'a`，因此 `'a` 必须持续到 `println!`。

在 `longest` 函数中，`string2` 的生命周期也是 `'a`，由此说明 `string2` 也必须活到 `println!` 处，可是 `string2` 在代码中实际上只能活到内部语句块的花括号处 `}`，小于它应该具备的生命周期 `'a`，因此编译出错。

作为人类，我们可以很清晰的看出 `result` 实际上引用了 `string1`，因为 `string1` 的长度明显要比 `string2` 长，既然如此，编译器不该如此矫情才对，它应该能认识到 `result` 没有引用 `string2`，让我们这段代码通过。只能说，作为尊贵的人类，编译器的发明者，你高估了这个工具的能力，它真的做不到！而且 Rust 编译器在调教上是非常保守的：当可能出错也可能不出错时，它会选择前者，抛出编译错误。

总之，显式的使用生命周期，可以让编译器正确的认识到多个引用之间的关系，最终帮我们提前规避可能存在的代码风险。

小练习：尝试着去更改 `longest` 函数，例如修改参数、生命周期或者返回值，然后推测结果如何，最后再跟编译器的输出进行印证。

#### 深入思考生命周期标注
使用生命周期的方式往往取决于函数的功能，例如之前的 `longest` 函数，如果它永远只返回第一个参数 `x`，生命周期的标注该如何修改(该例子就是上面的小练习结果之一)?
```rust
fn longest<'a>(x: &'a str, y: &str) -> &'a str {
    x
}
```

在此例中，`y` 完全没有被使用，因此 `y` 的生命周期与 `x` 和返回值的生命周期没有任何关系，意味着我们也不必再为 `y` 标注生命周期，只需要标注 `x` 参数和返回值即可。

**函数的返回值如果是一个引用类型，那么它的生命周期只会来源于**：
- 函数参数的生命周期
- 函数体中某个新建引用的生命周期

若是后者情况，就是典型的悬垂引用场景：
```rust
fn longest<'a>(x: &str, y: &str) -> &'a str {
    let result = String::from("really long string");
    result.as_str()
}
```

上面的函数的返回值就和参数 `x`，`y` 没有任何关系，而是引用了函数体内创建的字符串，那么很显然，该函数会报错：
```console
error[E0515]: cannot return value referencing local variable `result` // 返回值result引用了本地的变量
  --> src/main.rs:11:5
   |
11 |     result.as_str()
   |     ------^^^^^^^^^
   |     |
   |     returns a value referencing data owned by the current function
   |     `result` is borrowed here
```

主要问题就在于，`result` 在函数结束后就被释放，但是在函数结束后，对 `result` 的引用依然在继续。在这种情况下，没有办法指定合适的生命周期来让编译通过，因此我们也就在 Rust 中避免了悬垂引用。

那遇到这种情况该怎么办？最好的办法就是返回内部字符串的所有权，然后把字符串的所有权转移给调用者：
```rust
fn longest<'a>(_x: &str, _y: &str) -> String {
    String::from("really long string")
}

fn main() {
   let s = longest("not", "important");
}
```

至此，可以对生命周期进行下总结：生命周期语法用来将函数的多个引用参数和返回值的作用域关联到一起，一旦关联到一起后，Rust就拥有充分的信息来确保我们的操作是内存安全的。

## 结构体中的生命周期
不仅仅函数具有生命周期，结构体其实也有这个概念，只不过我们之前对结构体的使用都停留在非引用类型字段上。细心的同学应该能回想起来，之前为什么不在结构体中使用字符串字面量或者字符串切片，而是统一使用 `String` 类型？原因很简单，后者在结构体初始化时，只要转移所有权即可，而前者，抱歉，它们是引用，它们不能为所欲为。

既然之前已经理解了生命周期，那么意味着在结构体中使用引用也变得可能：只要为结构体中的**每一个引用标注上生命周期**即可：
```rust
struct ImportantExcerpt<'a> {
    part: &'a str,
}

fn main() {
    let novel = String::from("Call me Ishmael. Some years ago...");
    let first_sentence = novel.split('.').next().expect("Could not find a '.'");
    let i = ImportantExcerpt {
        part: first_sentence,
    };
}
```

`ImportantExcerpt` 结构体中有一个引用类型的字段 `part`，因此需要为它标注上生命周期。结构体的生命周期标注语法跟泛型参数语法很像，需要对生命周期参数进行声明 `<'a>`。该生命周期标注说明，**结构体 `ImportantExcerpt` 所引用的字符串 `str` 必须比该结构体活得更久**。

从 `main` 函数实现来看，`ImportantExcerpt` 的生命周期从第4行开始，到 `main` 函数末尾结束，而该结构体引用的字符串从第一行开始，也是到 `main` 函数末尾结束，可以得出结论**结构体引用的字符串活得比结构体久**，这符合了编译器对生命周期的要求，因此编译通过。

与之相反，下面的代码就无法通过编译：
```rust
#[derive(Debug)]
struct ImportantExcerpt<'a> {
    part: &'a str,
}

fn main() {
    let i;
    {
        let novel = String::from("Call me Ishmael. Some years ago...");
        let first_sentence = novel.split('.').next().expect("Could not find a '.'");
        i = ImportantExcerpt {
            part: first_sentence,
        };
    }
    println!("{:?}",i);
}
```

观察代码，**可以看出结构体比它引用的字符串活得更久**，引用字符串在内部语句块末尾 `}` 被释放后，`println!` 依然在外面使用了该结构体，因此会导致无效的引用，不出所料，编译报错：
```console
error[E0597]: `novel` does not live long enough
  --> src/main.rs:10:30
   |
10 |         let first_sentence = novel.split('.').next().expect("Could not find a '.'");
   |                              ^^^^^^^^^^^^^^^^ borrowed value does not live long enough
...
14 |     }
   |     - `novel` dropped here while still borrowed
15 |     println!("{:?}",i);
   |                     - borrow later used here
```

## 生命周期消除
实际上，对于编译器来说，每一个引用类型都有一个生命周期，那么为什么我们在使用过程中，很多时候无需标注生命周期？例如：
```rust
fn first_word(s: &str) -> &str {
    let bytes = s.as_bytes();

    for (i, &item) in bytes.iter().enumerate() {
        if item == b' ' {
            return &s[0..i];
        }
    }

    &s[..]
}
```

该函数的参数和返回值都是引用类型，尽管我们没有显式的为其标注生命周期，编译依然可以通过。其实原因不复杂，**编译器为了简化用户的使用，运用了生命周期消除大法**。

对于 `first_word` 函数，它的返回值是一个引用类型，那么该引用只有两种情况：
- 从参数获取
- 从函数体内部新创建的变量获取

如果是后者，就会出现悬垂引用，最终被编译器拒绝，因此只剩一种情况：返回值的引用是获取自参数，这就意味着参数和返回值的生命周期是一样的。道理很简单，我们能看出来，编译器自然也能看出来，因此，就算我们不标注生命周期，也不会产生歧义。

实际上，在 Rust 1.0 版本之前，这种代码果断不给通过，因为 Rust 要求必须显式的为所有引用标注生命周期：
```rust
fn first_word<'a>(s: &'a str) -> &'a str {
```

在写了大量的类似代码后，Rust社区抱怨声四起，包括开发者自己都忍不了了，最终揭锅而起，这才有了我们今日的幸福。

生命周期消除的规则不是一蹴而就，而是伴随着 `总结-改善` 流程的周而复始，一步一步走到今天，这也意味着，该规则以后可能也会进一步增加，我们需要手动标注生命周期的时候也会越来越少，hooray!

在开始之前有几点需要注意：
- 消除规则不是万能的，若编译器不能确定某件事是正确时，会直接判为不正确，那么你还是需要手动标注生命周期
- **函数或者方法中，参数的生命周期被称为 `输入生命周期`，返回值的生命周期被称为 `输出生命周期`**

#### 三条消除规则
编译器使用三条消除规则来确定哪些场景不需要显式地去标注生命周期。其中第一条规则应用在输入生命周期上，第二、三条应用在输出生命周期上。若编译器发现三条规则都不适用时，就会报错，提示你需要手动标注生命周期。

1. **每一个引用参数都会获得独自的生命周期**

    例如一个引用参数的函数就有一个生命周期标注: `fn foo<'a>(x: &'a i32)`，两个引用参数的有两个生命周期标注:`fn foo<'a, 'b>(x: &'a i32, y: &'b i32)`, 依此类推。

2. **若只有一个输入生命周期(函数参数中只有一个引用类型)，那么该生命周期会被赋给所有的输出生命周期**，也就是所有返回值的生命周期都等于该输入生命周期

    例如函数 `fn foo(x: &i32) -> &i32`，`x` 参数的生命周期会被自动赋给返回值 `&i32`，因此该函数等同于 `fn foo<'a>(x: &'a i32) -> &'a i32`

3. **若存在多个输入生命周期，且其中一个是 `&self` 或 `&mut self`，则 `&self` 的生命周期被赋给所有的输出生命周期**

    拥有 `&self` 形式的参数，说明该函数是一个 `方法`，该规则让方法的使用便利度大幅提升。
    
    
规则其实很好理解，但是，爱思考的读者肯定要发问了，例如第三条规则，若一个方法，它的返回值的生命周期就是跟参数 `&self` 的不一样怎么办？总不能强迫我返回的值总是和 `&self` 活得一样久吧？! 问得好，答案很简单：手动标注生命周期，因为这些规则只是编译器发现你没有标注生命周期时默认去使用的，当你标注生命周期后，编译器自然会乖乖听你的话。

让我们假装自己是编译器，然后看下以下的函数该如何应用这些规则：

**例子1**
```rust
fn first_word(s: &str) -> &str { // 实际项目中的手写代码
```

首先，我们手写的代码如上所示时，编译器会先应用第一条规则，为每个参数标注一个生命周期：
```rust
fn first_word<'a>(s: &'a str) -> &str { // 编译器自动为参数添加生命周期
```

此时，第二条规则就可以进行应用，因为函数只有一个输入生命周期，因此该生命周期会被赋予所有的输出生命周期：
```rust
fn first_word<'a>(s: &'a str) -> &'a str { // 编译器自动为返回值添加生命周期
```

此时，编译器为函数签名中的所有引用都自动添加了具体的生命周期，因此编译通过，且用户无需手动去标注生命周期，只要按照 `fn first_word(s: &str) -> &str { ` 的形式写代码即可。

**例子2**
再来看一个例子：
```rust
fn longest(x: &str, y: &str) -> &str { // 实际项目中的手写代码
```

首先，编译器会应用第一条规则，为每个参数都标注生命周期：
```rust
fn longest<'a, 'b>(x: &'a str, y: &'b str) -> &str {
```

但是此时，第二条规则却无法被使用，因为输入生命周期有两个，第三条规则也不符合，因为它是函数，不是方法，因此没有 `&self` 参数。在套用所有规则后，编译器依然无法为返回值标注合适的生命周期，因此，编译器就会报错，提示我们需要手动标注生命周期：
```console
error[E0106]: missing lifetime specifier
 --> src/main.rs:1:47
  |
1 | fn longest<'a, 'b>(x: &'a str, y: &'b str) -> &str {
  |                       -------     -------     ^ expected named lifetime parameter
  |
  = help: this function's return type contains a borrowed value, but the signature does not say whether it is borrowed from `x` or `y`
note: these named lifetimes are available to use
 --> src/main.rs:1:12
  |
1 | fn longest<'a, 'b>(x: &'a str, y: &'b str) -> &str {
  |            ^^  ^^
help: consider using one of the available lifetimes here
  |
1 | fn longest<'a, 'b>(x: &'a str, y: &'b str) -> &'lifetime str {
  |                                                +++++++++
```

不得不说，Rust 编译器真的很强大，还贴心的给我们提示了该如何修改，虽然。。。好像。。。。它的提示貌似不太准确。这里我们更希望参数和返回值都是 `'a` 命周期。

## 方法中的生命周期
先来回忆下泛型的语法：
```rust
struct Point<T> {
    x: T,
    y: T,
}

impl<T> Point<T> {
    fn x(&self) -> &T {
        &self.x
    }
}
```

实际上，为具有生命周期的结构体实现方法时，我们使用的语法跟泛型参数语法很相似：
```rust
struct ImportantExcerpt<'a> {
    part: &'a str,
}

impl<'a> ImportantExcerpt<'a> {
    fn level(&self) -> i32 {
        3
    }
}
```

其中有几点需要注意的：
- `impl` 中必须使用结构体的完整名称，包括 `<'a>`，因为*生命周期标注也是结构体类型的一部分*！
- 方法签名中，往往不需要标注生命周期，得益于生命周期消除的第一和第三规则

下面的例子展示了第三规则应用的场景：
```rust
impl<'a> ImportantExcerpt<'a> {
    fn announce_and_return_part(&self, announcement: &str) -> &str {
        println!("Attention please: {}", announcement);
        self.part
    }
}
```

首先，编译器应用第一规则，给予每个输入参数一个生命周期:
```rust
impl<'a> ImportantExcerpt<'a> {
    fn announce_and_return_part<'b>(&'a self, announcement: &'b str) -> &str {
        println!("Attention please: {}", announcement);
        self.part
    }
}
```

需要注意的是，编译器不知道 `announcement` 的生命周期到底多长，因此它无法简单的给予它生命周期 `'a`，而是重新声明了一个全新的生命周期 `'b`。 

接着，编译器应用第三规则，将 `&self` 的生命周期赋给返回值 `&str`：
```rust
impl<'a> ImportantExcerpt<'a> {
    fn announce_and_return_part<'b>(&'a self, announcement: &'b str) -> &'a str {
        println!("Attention please: {}", announcement);
        self.part
    }
}
```

Bingo，最开始的代码，尽管我们没有给方法标注生命周期，但是在第一和第三规则的配合下，编译器依然完美的为我们亮起了绿灯。

在结束这块儿内容之前，再来做一个有趣的修改，将方法返回的生命周期改为`'b`：
```rust
impl<'a> ImportantExcerpt<'a> {
    fn announce_and_return_part<'b>(&'a self, announcement: &'b str) -> &'b str {
        println!("Attention please: {}", announcement);
        self.part
    }
}
```

此时，编译器会报错，因为编译器无法知道 `'a` 和 `'b` 的关系。 `&self` 生命周期是 `'a`，那么 `self.part` 的生命周期也是 `'a`，但是好巧不巧的是，我们手动为返回值 `self.part` 标注了生命周期 `'b`，因此编译器需要知道 `'a` 和 `'b` 的关系。

有一点很容易推理出来：由于 `&'a self` 是被引用的一方，因此引用它的 `&'b str` 必须要活得比它短，否则会出现悬垂引用。因此说明生命周期 `'b` 必须要比 `'a` 小，只要满足了这一点，编译器就不会再报错：
```rust
impl<'a: 'b, 'b> ImportantExcerpt<'a> {
    fn announce_and_return_part(&'a self, announcement: &'b str) -> &'b str {
        println!("Attention please: {}", announcement);
        self.part
    }
}
```

Bang，一个复杂的玩意儿被甩到了你面前，就问怕不怕？

就关键点稍微解释下：
- `'a: 'b`，是生命周期约束语法，跟泛型约束非常相似，用于说明`'a`必须比`'b`活得久
- 为了实现这一点，必须把`'a`和`'b`都在同一个地方声明，你不能把`'a`在`impl`后面声明，而把`'b`在方法中声明

总之，实现方法比想象中简单：加一个约束，就能暗示编译器，尽管引用吧，反正我想引用的内容比我活得久，爱咋咋地，我怎么都不会引用到无效的内容！

## 静态生命周期
在Rust中有一个非常特殊的生命周期，那就是 `'static`，该生命周期意味着被它标注的引用**在编译器看来**可以和整个程序活得一样久(强烈建议再看看这句[名言](#生命周期标注语法)！)。

在之前我们学过字符串字面量，提到过它是被硬编码进 Rust 的二进制文件中，因此这些字符串变量全部具有 `'static` 的生命周期：
```rust
let s: &'static str = "我没啥优点，就是活得久，嘿嘿";
```

这时候，有些聪明的小脑瓜就开始开动了：当生命周期不知道怎么标时，标一个 `'static` 是不是很爽？这样我和编译器再也不用操心它到底活多久了。

嗯，只能说，这个想法是对的，在不少情况下，标注为 `'static` 确实可以解决生命周期编译不通过的问题，但是问题来了：本来该引用没有活那么久，但是你非要说它活那么久，万一引入了潜在的BUG怎么办？

因此，遇到因为生命周期导致的编译不通过问题，首先想的应该是：是否是我们试图创建一个悬垂引用，或者是试图匹配不一致的生命周期，而不是简单粗暴的用 `'static` 来解决问题。

但是，话说回来，存在即合理，有时候，`'static` 确实可以帮助我们解决非常复杂的生命周期问题甚至是无法被手动解决的生命周期问题，那么此时就应该放心大胆的用，只要你确定：**你的所有引用的生命周期都是正确的，只是编译器太笨不懂罢了**。

总结下：
- 字符串字面量的生命周期都是 `'static`
- 当你要为某个引用标注 `'static` 时，请确保它真的活得那么久
- 实在遇到解决不了的生命周期标注问题，可以尝试 `'static`，有时候它会给你奇迹


## 一个复杂例子: 泛型、特征约束
手指已经疲软无力，我好想停止，但是华丽的开场都要有与之匹配的谢幕，那我们就用一个稍微复杂点的例子来结束：
```rust
use std::fmt::Display;

fn longest_with_an_announcement<'a, T>(
    x: &'a str,
    y: &'a str,
    ann: T,
) -> &'a str
where
    T: Display,
{
    println!("Announcement! {}", ann);
    if x.len() > y.len() {
        x
    } else {
        y
    }
}
```

依然是熟悉的配方 `longest`，但是多了一段废话： `ann`，因为要用格式化 `{}` 来输出 `ann`，因此需要它实现 `Display` 特征。

## 总结
我不知道支撑我一口气写完的勇气是什么，也许是不做完不爽夫斯基，也许是一些读者对本书的期待，不管如何，这章足足写了17000字，可惜不是写小说，不然肯定可以获取很多月票 :) 

从本章开始，最大的收获就是可以在结构体中使用引用类型了，说实话，为了引入这个特性，我已经憋了足足30章节。。

但是，还没完，是的，就算是将近2万字，生命周期的旅程依然没有完结，下一节将介绍一些关于生命周期的高级特性，这些特性你在其它中文书中目前还看不到的。
