// modules1.rs
// 让我能够编译！执行 `rustex hint modules1` 获取提示 :)

// I AM NOT DONE

mod sausage_factory {
    // 确保它仅在当前模块可见。
    fn get_secret_recipe() -> String {
        String::from("Ginger")
    }

    fn make_sausage() {
        get_secret_recipe();
        println!("sausage!");
    }
}

fn main() {
    sausage_factory::make_sausage();
}
