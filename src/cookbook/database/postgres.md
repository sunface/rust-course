# Postgres

### 在数据库中创建表格
我们通过 [postgres](https://docs.rs/postgres/0.17.2/postgres/) 来操作数据库。下面的例子有一个前提：数据库 `library` 已经存在，其中用户名和密码都是 `postgres`。

```rust,editable
use postgres::{Client, NoTls, Error};

fn main() -> Result<(), Error> {
    // 连接到数据库 library
    let mut client = Client::connect("postgresql://postgres:postgres@localhost/library", NoTls)?;
    
    client.batch_execute("
        CREATE TABLE IF NOT EXISTS author (
            id              SERIAL PRIMARY KEY,
            name            VARCHAR NOT NULL,
            country         VARCHAR NOT NULL
            )
    ")?;

    client.batch_execute("
        CREATE TABLE IF NOT EXISTS book  (
            id              SERIAL PRIMARY KEY,
            title           VARCHAR NOT NULL,
            author_id       INTEGER NOT NULL REFERENCES author
            )
    ")?;

    Ok(())

}
```

### 插入和查询

```rust,editable
use postgres::{Client, NoTls, Error};
use std::collections::HashMap;

struct Author {
    _id: i32,
    name: String,
    country: String
}

fn main() -> Result<(), Error> {
    let mut client = Client::connect("postgresql://postgres:postgres@localhost/library", 
                                    NoTls)?;
    
    let mut authors = HashMap::new();
    authors.insert(String::from("Chinua Achebe"), "Nigeria");
    authors.insert(String::from("Rabindranath Tagore"), "India");
    authors.insert(String::from("Anita Nair"), "India");

    for (key, value) in &authors {
        let author = Author {
            _id: 0,
            name: key.to_string(),
            country: value.to_string()
        };

        // 插入数据
        client.execute(
                "INSERT INTO author (name, country) VALUES ($1, $2)",
                &[&author.name, &author.country],
        )?;
    }

    // 查询数据
    for row in client.query("SELECT id, name, country FROM author", &[])? {
        let author = Author {
            _id: row.get(0),
            name: row.get(1),
            country: row.get(2),
        };
        println!("Author {} is from {}", author.name, author.country);
    }

    Ok(())

}
```

### 聚合数据

下面代码将使用降序的方式列出 [Museum of Modern Art]() 数据库中的前 7999 名艺术家的国籍分布.

```rust,editable
use postgres::{Client, Error, NoTls};

struct Nation {
    nationality: String,
    count: i64,
}

fn main() -> Result<(), Error> {
    let mut client = Client::connect(
        "postgresql://postgres:postgres@127.0.0.1/moma",
        NoTls,
    )?;

    for row in client.query 
    ("SELECT nationality, COUNT(nationality) AS count 
    FROM artists GROUP BY nationality ORDER BY count DESC", &[])? {
        
        let (nationality, count) : (Option<String>, Option<i64>) 
        = (row.get (0), row.get (1));
        
        if nationality.is_some () && count.is_some () {

            let nation = Nation{
                nationality: nationality.unwrap(),
                count: count.unwrap(),
        };
            println!("{} {}", nation.nationality, nation.count);
            
        }
    }

    Ok(())
}
```

