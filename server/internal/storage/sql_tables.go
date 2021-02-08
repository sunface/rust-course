package storage

var sqlTables = map[string]string{
	"user": `CREATE TABLE IF NOT EXISTS user (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		username VARCHAR(255) NOT NULL UNIQUE,
		nickname VARCHAR(255) DEFAULT '',
		avatar VARCHAR(255) DEFAULT '',
		email VARCHAR(255) UNIQUE DEFAULT '',
		role  VARCHAR(20) NOT NULL,

		last_seen_at DATETIME DEFAULT CURRENT_DATETIME,
		is_diabled BOOL NOT NULL DEFAULT 'false',

		created DATETIME NOT NULL,
		updated DATETIME NOT NULL
	);
	CREATE INDEX IF NOT EXISTS user_username
		ON user (username);
	CREATE INDEX IF NOT EXISTS user_role
		ON user (role);
	CREATE INDEX IF NOT EXISTS user_email
		ON user (email);`,

	"sessions": `CREATE TABLE IF NOT EXISTS sessions (
			sid              VARCHAR(255) primary key,   
			user_id          INTEGER
		);
	`,

	"posts": `CREATE TABLE IF NOT EXISTS posts (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		creator INTEGER NOT NULL,

		title VARCHAR(255) NOT NULL,
		md   TEXT,
		url  VARCHAR(255),
		cover VARCHAR(255),
		brief TEXT,

		created DATETIME NOT NULL,
		updated DATETIME
	);
	CREATE INDEX IF NOT EXISTS posts_creator
		ON posts (creator);
	CREATE INDEX IF NOT EXISTS posts_created
		ON posts (created);
`,
}
