# 内联汇编

Rust 提供了 `asm!` 宏，可以让大家在 Rust 代码中嵌入汇编代码，对于一些极致高性能或者底层的场景还是非常有用的，例如操作系统内核开发。但通常来说，大家并不应该在自己的项目中使用到该项技术，它为极客而生！

本章的例子是基于 `x86/x86-64` 汇编的，但是其它架构也是支持的，目前支持的包括：

- x86 和 x86-64
- ARM
- AArch64
- RISC-V

当使用在不支持的平台上时，编译器会给出报错。

> 注意：本章节不负责教大家使用汇编，需要学习的同学请参考相关书籍 


## 基本用法

先从一个简单例子开始：

```rust
use std::arch::asm;

unsafe {
    asm!("nop");
}
```

注意 `unsafe` 语句块依然是必不可少的，因为可能在里面插入危险的指令，最终破坏代码的安全性。

上面代码将插入一个 `NOP` 指令( 空操作 ) 到编译器生成的汇编代码中，其中指令作为 `asn!` 的第一个参数传入。

## 输入和输出

上面的代码有够无聊的，来点实际的:

```rust
use std::arch::asm;

let x: u64;
unsafe {
    asm!("mov {}, 5", out(reg) x);
}
assert_eq!(x, 5);
```

这段代码将 `5` 赋给 `u64` 类型的变量 `x`，值得注意的是 `asm!` 的指令参数实际上是一个格式化字符串。至于传给格式化字符串的参数，看起来还是比较陌生的:

- 首先，需要说明目标变量是作为内联汇编的输入还是输出，在本例中，是一个输出 `out`
- 最后，要指定变量将要使用的寄存器，本例中使用通用寄存器 `reg`，编译器会自动选择合适的寄存器

```rust
use std::arch::asm;

let i: u64 = 3;
let o: u64;
unsafe {
    asm!(
        "mov {0}, {1}",
        "add {0}, 5",
        out(reg) o,
        in(reg) i,
    );
}
assert_eq!(o, 8);
```

上面的代码中进一步使用了输入 `in`，将 `5` 加到输入的变量 `i` 上，然后将结果写到输出变量 `o`。实际的操作方式是首先将 `i` 的值拷贝到输出，然后再加上 `5`。

上例还能看出几点：

- `asm!` 允许使用多个格式化字符串，每一个作为单独一行汇编代码存在，看起来跟阅读真实的汇编代码类似
- 输入变通过 `in` 来声明
- 和以前见过的格式化字符串一样，可以使用多个参数，通过 {0}, {1} 来指定，这种方式特别有用，毕竟在代码中，变量是经常复用的，而这种参数的指定方式刚好可以复用

事实上，还可以进一步优化代码，去掉 `mov` 指令:

```rust
use std::arch::asm;

let mut x: u64 = 3;
unsafe {
    asm!("add {0}, 5", inout(reg) x);
}
assert_eq!(x, 8);
```

又多出一个 `inout` 关键字，但是不难猜，它说明 `x` 即是输入又是输出。与之前的分离方式还有一点很大的区别，这种方式可以保证使用同一个寄存器来完成任务。

当然，你可以在使用 `inout` 的情况下，指定不同的输入和输出:

```rust
use std::arch::asm;

let x: u64 = 3;
let y: u64;
unsafe {
    asm!("add {0}, 5", inout(reg) x => y);
}
assert_eq!(y, 8);
```

## 延迟输出操作数

Rust 编译器对于操作数分配是较为保守的，它会假设 `out` 可以在任何时间被写入，因此 `out` 不会跟其它参数共享它的位置。然而为了保证最佳性能，使用尽量少的寄存器是有必要的，这样它们不必在内联汇编的代码块内保存和重加载。

为了达成这个目标( 共享位置或者说寄存器，以实现减少寄存器使用的性能优化 )，Rust 提供一个 `lateout` 关键字，可以用于任何只在所有输入被消费后才被写入的输出，与之类似的还有一个 `inlateout`。

但是 `inlateout` 在某些场景中是无法使用的，例如下面的例子：

```rust
use std::arch::asm;

let mut a: u64 = 4;
let b: u64 = 4;
let c: u64 = 4;
unsafe {
    asm!(
        "add {0}, {1}",
        "add {0}, {2}",
        inout(reg) a,
        in(reg) b,
        in(reg) c,
    );
}
assert_eq!(a, 12);
```

一旦用了 `inlateout` 后，上面的代码就只能运行在 `Debug` 模式下，原因是 `Debug` 并没有做任何优化，但是 `release` 发布不同，为了性能是要做很多编译优化的。

在编译优化时，编译器可以很容易的为输入 `b` 和 `c` 分配同样的是寄存器，因为它知道它们有同样的值。如果这里使用 `inlateout`， 那么 `a` 和 `c` 就可以被分配到相同的寄存器，在这种情况下，第一条指令将覆盖掉 `c` 的值，最终导致汇编代码产生错误的结果。

因此这里使用 `inout`，那么编译器就会为 `a` 分配一个独立的寄存器.

但是下面的代码又不同，它是可以使用 `inlateout` 的：

```rust
use std::arch::asm;

let mut a: u64 = 4;
let b: u64 = 4;
unsafe {
    asm!("add {0}, {1}", inlateout(reg) a, in(reg) b);
}
assert_eq!(a, 8);
```

原因在于输出只有在所有寄存器都被读取后，才被修改。因此，即使 `a` 和 `b` 被分配了同样的寄存器，代码也会正常工作，不存在之前的覆盖问题。

## 显式指定寄存器

一些指令会要求操作数只能存在特定的寄存器中，因此 Rust 的内联汇编提供了一些限制操作符。

大家应该记得之前出现过的 `reg` 是适用于任何架构的通用寄存器，意味着编译器可以自己选择合适的寄存器，但是当你需要显式地指定寄存器时，很可能会变成平台相关的代码，适用移植性会差很多。例如 `x86` 下的寄存器：`eax`, `ebx`, `ecx`, `ebp`, `esi` 等等。

```rust
use std::arch::asm;

let cmd = 0xd1;
unsafe {
    asm!("out 0x64, eax", in("eax") cmd);
}
```

上面的例子调用 `out` 指令将 `cmd` 变量的值输出到 `0x64` 内存地址中。由于 `out` 指令只接收 `eax` 和它的子寄存器，因此我们需要使用 `eax` 来指定特定的寄存器。

> 显式寄存器操作数无法用于格式化字符串中，例如我们之前使用的 {}，只能直接在字符串中使用 `eax`。同时，该操作数只能出现在最后，也就是在其它操作数后面出现

```rust
use std::arch::asm;

fn mul(a: u64, b: u64) -> u128 {
    let lo: u64;
    let hi: u64;

    unsafe {
        asm!(
            // The x86 mul instruction takes rax as an implicit input and writes
            // the 128-bit result of the multiplication to rax:rdx.
            "mul {}",
            in(reg) a,
            inlateout("rax") b => lo,
            lateout("rdx") hi
        );
    }

    ((hi as u128) << 64) + lo as u128
}
```

这段代码使用了 `mul` 指令，将两个 64 位的输入相乘，生成一个 128 位的结果。

首先将变量 `a` 的值存到寄存器 `reg` 中，其次显式使用寄存器 `rax`，它的值来源于变量 `b`。结果的低 64 位存储在 `rax` 中，然后赋给变量 `lo` ，而结果的高 64 位则存在 `rdx` 中，最后赋给 `hi`。

## Clobbered 寄存器

在很多情况下，无需作为输出的状态都会被内联汇编修改，这个状态被称之为 "clobbered"。

我们需要告诉编译器相关的情况，因为编译器需要在内联汇编语句块的附近存储和恢复这种状态。

```rust
use std::arch::asm;

fn main() {
    // three entries of four bytes each
    let mut name_buf = [0_u8; 12];
    // String is stored as ascii in ebx, edx, ecx in order
    // Because ebx is reserved, the asm needs to preserve the value of it.
    // So we push and pop it around the main asm.
    // (in 64 bit mode for 64 bit processors, 32 bit processors would use ebx)

    unsafe {
        asm!(
            "push rbx",
            "cpuid",
            "mov [rdi], ebx",
            "mov [rdi + 4], edx",
            "mov [rdi + 8], ecx",
            "pop rbx",
            // We use a pointer to an array for storing the values to simplify
            // the Rust code at the cost of a couple more asm instructions
            // This is more explicit with how the asm works however, as opposed
            // to explicit register outputs such as `out("ecx") val`
            // The *pointer itself* is only an input even though it's written behind
            in("rdi") name_buf.as_mut_ptr(),
            // select cpuid 0, also specify eax as clobbered
            inout("eax") 0 => _,
            // cpuid clobbers these registers too
            out("ecx") _,
            out("edx") _,
        );
    }

    let name = core::str::from_utf8(&name_buf).unwrap();
    println!("CPU Manufacturer ID: {}", name);
}
```

例子中，我们使用 `cpuid` 指令来读取 CPU ID，该指令会将值写入到 `eax` 、`edx` 和 `ecx` 中。

即使 `eax` 从没有被读取，我们依然需要告知编译器这个寄存器被修改过，这样编译器就可以在汇编代码之前存储寄存器中的值。这个需要通过将输出声明为 `_` 而不是一个具体的变量名，代表着该输出值被丢弃。

这段代码也会绕过一个限制： `ebx` 是一个 LLVM 保留寄存器，意味着 LLVM 会假设它拥有寄存器的全部控制权，并在汇编代码块结束时将寄存器的状态恢复到最开始的状态。由于这个限制，该寄存器无法被用于输入或者输出，除非编译器使用该寄存器的满足一个通用寄存器的需求(例如 `in(reg)` )。 但这样使用后， `reg` 操作数就在使用保留寄存器时变得危险起来，原因是我们可能会无意识的破坏输入或者输出，毕竟它们共享同一个寄存器。

为了解决这个问题，我们使用 `rdi` 来存储指向输出数组的指针，通过 `push` 的方式存储 `ebx`：在汇编代码块的内部读取 `ebx` 的值，然后写入到输出数组。后面再可以通过 `pop` 的方式来回复 `ebx` 到初始的状态。

`push` 和 `pop` 使用完成的 64 位 `rbx` 寄存器，来确保整个寄存器的内容都被保存。如果是在 32 位机器上，代码将使用 `ebx` 替代。

还还可以在汇编代码内部使用通用寄存器:

```rust
use std::arch::asm;

// Multiply x by 6 using shifts and adds
let mut x: u64 = 4;
unsafe {
    asm!(
        "mov {tmp}, {x}",
        "shl {tmp}, 1",
        "shl {x}, 2",
        "add {x}, {tmp}",
        x = inout(reg) x,
        tmp = out(reg) _,
    );
}
assert_eq!(x, 4 * 6);
```


## 总结

由于这块儿内容过于专业，本书毕竟是通用的 Rust 学习书籍，因此关于内联汇编就不再赘述。事实上，如果你要真的写出可用的汇编代码，要学习的还很多...

感兴趣的同学可以看看如下英文资料: [Rust Reference](https://doc.rust-lang.org/reference/inline-assembly.html) 和 [Rust By Example](https://doc.rust-lang.org/rust-by-example/unsafe/asm.html#clobbered-registers)。