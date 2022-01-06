// structs1.rs
// 解决所有的 TODO ，通过测试！

// I AM NOT DONE

struct ColorClassicStruct {
    // TODO: 一些东西需要在这里
}

struct ColorTupleStruct(/* TODO: 一些东西需要在这里 */);

#[derive(Debug)]
struct UnitStruct;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn classic_c_structs() {
        // TODO: 实例化一个经典的 C 结构体！
        // let green =

        assert_eq!(green.name, "green");
        assert_eq!(green.hex, "#00FF00");
    }

    #[test]
    fn tuple_structs() {
        // TODO: 实例化一个元组结构！
        // let green =

        assert_eq!(green.0, "green");
        assert_eq!(green.1, "#00FF00");
    }

    #[test]
    fn unit_structs() {
        // TODO: 实例化一个单元结构！
        // let unit_struct =
        let message = format!("{:?}s are fun!", unit_struct);

        assert_eq!(message, "UnitStructs are fun!");
    }
}
