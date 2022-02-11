// modules2.rs
// 你可以把模块引入作用域，并使用 'use' 和 'as' 关键字给它们取个别称.
// 修复 'use' 语句的相关代码以通过编译。
// 让我能够编译！执行 `rustex hint modules2` 获取提示 :)

// I AM NOT DONE

mod delicious_snacks {

    // TODO: 修复这些 'use' 语句
    use self::fruits::PEAR as ???
    use self::veggies::CUCUMBER as ???

    mod fruits {
        pub const PEAR: &'static str = "Pear";
        pub const APPLE: &'static str = "Apple";
    }

    mod veggies {
        pub const CUCUMBER: &'static str = "Cucumber";
        pub const CARROT: &'static str = "Carrot";
    }
}

fn main() {
    println!(
        "favorite snacks: {} and {}",
        delicious_snacks::fruit,
        delicious_snacks::veggie
    );
}
