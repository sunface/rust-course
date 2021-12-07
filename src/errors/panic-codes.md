# 会导致panic的代码


String slice range indices must occur at valid UTF-8 character boundaries. If you attempt to create a string slice in the middle of a multibyte character, your program will exit with an error. For the purposes of introducing string slices, we are assuming ASCII only in this section; a more thorough discussion of UTF-8 handling is in the “Storing UTF-8 Encoded Text with Strings” section of Chapter 8.


>
> 比方说有一个 `u8` ，它可以存放从 0 到 255 的值。那么当你将其修改为范围之外的值，比如 256，则会发生**整型溢出**。关于这一行为 Rust 有一些有趣的规则。当在 debug 模式编译时，Rust 会检查整型溢出若存在这些问题则使程序在编译时 *panic*。Rust 使用这个术语来表明程序因错误而退出。 [该章节](../../errors/panic.md)会详细介绍 panic。
>
> 在当使用 `--release` 参数进行 release 模式构建时，Rust **不**检测溢出。相反当检测到整型溢出时，Rust 会进行一种被称为二进制补码的方式进行（*two’s complement wrapping*）操作。简而言之，大于该类型最大值的数值会被补码转换成该类型能够支持的对应数字的最小值。比如在 `u8` 的情况下，256 变成 0，257 变成 1，依此类推。程序不会 panic，但是该变量的值可能不是你期望的值。依赖整型溢出包裹的行为不是一种正确的做法。
>