package storage

import (
	"database/sql"
	"fmt"

	"github.com/imdotdev/im.dev/server/pkg/db"
	"github.com/imdotdev/im.dev/server/pkg/log"
)

func CreateTables(names []string) {
	defer func() {
		if err := recover(); err != nil {
			DropTables(names)
		}
	}()
	err := connectDatabase()
	if err != nil {
		panic(err)
	}

	for _, tbl := range names {
		q, ok := sqlTables[tbl]
		if !ok {
			log.RootLogger.Crit("target sql table not exist", "table_name", tbl)
			panic("create sql of '" + tbl + "' table not exist")
		}

		// check table already exists
		_, err := db.Conn.Query(fmt.Sprintf("SELECT * from %s LIMIT 1", tbl))
		if err == nil || err == sql.ErrNoRows {
			log.RootLogger.Info("Table already exist,skip creating", "table_name", tbl)
			continue
		}

		_, err = db.Conn.Exec(q)
		if err != nil {
			log.RootLogger.Crit("database error", "error", err.Error())
			panic(err.Error())
		}

		log.RootLogger.Info("sql table created ok", "table_name", tbl)
	}
}

func DropTables(names []string) {
	err := connectDatabase()
	if err != nil {
		panic(err)
	}

	for _, tbl := range names {
		q := fmt.Sprintf("DROP TABLE IF EXISTS %s", tbl)
		_, err := db.Conn.Exec(q)
		if err != nil {
			log.RootLogger.Warn("drop table error", "error", err, "query", q)
		}
		log.RootLogger.Info("sql table dropped ok", "table_name", tbl)
	}
}
