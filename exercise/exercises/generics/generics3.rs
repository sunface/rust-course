// 一所想象的魔法学院有一个采用 Rust 编写的新版成绩单生成系统！
// 目前该系统仅支持创建以数字表示的成绩单（如 1.0 -> 5.5）。
// 然而，学校也发布用字母表示的成绩（A+ -> F-），所以需要能够打印两种成绩单。

// 在 ReportCard 结构定义和 impl 块中进行必要的代码修改，以支持用字母表示的成绩单。
// 将第二个测试的 grade 改为 "A+"，用来表明代码已允许按字母表示成绩。

// 执行 'rustlings hint generics3' 获取提示！

// I AM NOT DONE

pub struct ReportCard {
    pub grade: f32,
    pub student_name: String,
    pub student_age: u8,
}

impl ReportCard {
    pub fn print(&self) -> String {
        format!("{} ({}) - achieved a grade of {}",// 译：{} ({}) - 成绩为 {}"
            &self.student_name, &self.student_age, &self.grade)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn generate_numeric_report_card() {
        let report_card = ReportCard {
            grade: 2.1,
            student_name: "Tom Wriggle".to_string(),
            student_age: 12,
        };
        assert_eq!(
            report_card.print(),
            "Tom Wriggle (12) - achieved a grade of 2.1"
        );
    }

    #[test]
    fn generate_alphabetic_report_card() {
        // TODO：完成练习后，在这里更改 grade 的值。
        let report_card = ReportCard {
            grade: 2.1,
            student_name: "Gary Plotter".to_string(),
            student_age: 11,
        };
        assert_eq!(
            report_card.print(),
            "Gary Plotter (11) - achieved a grade of A+"
        );
    }
}
