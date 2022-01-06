// structs3.rs
// 接口既可以包含数据也可以处理逻辑。
// 在这个练习中，我们已经定义了 Package 结构，但我们想测试根据它实现的一些逻辑。
// 让代码通过编译和测试！
// 如果你有问题，可以执行 `rustlings hint structs3` 查看提示

// I AM NOT DONE

#[derive(Debug)]
struct Package {// 译：包裹
    sender_country: String,// 译：寄件人国家
    recipient_country: String,// 译：收件人国家
    weight_in_grams: i32,// 译：重量（克）
}

impl Package {
    fn new(sender_country: String, recipient_country: String, weight_in_grams: i32) -> Package {
        if weight_in_grams <= 0 {
            // 这里需要完成一些东西……
        } else {
            Package {
                sender_country,
                recipient_country,
                weight_in_grams,
            }
        }
    }

    fn is_international(&self) -> ??? {// 译：是否是国际上的
        // 这里需要完成一些东西……
    }

    fn get_fees(&self, cents_per_gram: i32) -> ??? {// 译：获取所需费用
        // 这里需要完成一些东西……
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    #[should_panic]
    fn fail_creating_weightless_package() {// 译：失败地创造失重的包裹（要求不允许负重量的包裹出现）
        let sender_country = String::from("Spain");// 译：西班牙
        let recipient_country = String::from("Austria");// 译：奥地利

        Package::new(sender_country, recipient_country, -2210);
    }

    #[test]
    fn create_international_package() {// 译：创建国际上的包裹
        let sender_country = String::from("Spain");
        let recipient_country = String::from("Russia");

        let package = Package::new(sender_country, recipient_country, 1200);

        assert!(package.is_international());
    }

    #[test]
    fn create_local_package() {
        let sender_country = String::from("Canada");
        let recipient_country = sender_country.clone();

        let package = Package::new(sender_country, recipient_country, 1200);

        assert!(!package.is_international());
    }

    #[test]
    fn calculate_transport_fees() {// 译：计算运输费
        let sender_country = String::from("Spain");
        let recipient_country = String::from("Spain");

        let cents_per_gram = 3;// 译：分/克（一克需要多少分钱）

        let package = Package::new(sender_country, recipient_country, 1500);

        assert_eq!(package.get_fees(cents_per_gram), 4500);
    }
}
