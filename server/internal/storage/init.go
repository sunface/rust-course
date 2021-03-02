package storage

import (
	"database/sql"
	"errors"
	"os"
	"strings"
	"time"

	"github.com/imdotdev/im.dev/server/pkg/config"
	"github.com/imdotdev/im.dev/server/pkg/db"
	"github.com/imdotdev/im.dev/server/pkg/log"
	"github.com/imdotdev/im.dev/server/pkg/models"
	"github.com/imdotdev/im.dev/server/pkg/utils"
	_ "github.com/mattn/go-sqlite3"
)

func Init() error {
	err := connectDatabase()
	if err != nil {
		return err
	}

	// check whether tables have been created
	var id int64
	err = db.Conn.QueryRow("select id from user where id=?", 1).Scan(&id)
	if err != nil && !strings.Contains(err.Error(), "no such table") && err != sql.ErrNoRows {
		return err
	}

	if id != 1 {
		log.RootLogger.Info("Database tables have not been created, start creating")
		err = initTables()
		if err != nil {
			return err
		}
		log.RootLogger.Info("Create database tables ok!")
	}

	return nil
}

func initTables() error {
	// create tables
	for _, q := range sqlTables {
		_, err := db.Conn.Exec(q)
		if err != nil {
			log.RootLogger.Crit("sqlite create table error", "error:", err, "sql:", q)
			return err
		}
	}

	// insert super admin user
	if config.Data.User.SuperAdminUsername == "" {
		return errors.New("super admin name cant be empty, must be a valid github name")
	}

	now := time.Now()
	_, err := db.Conn.Exec(`INSERT INTO user (id,username,email,role,nickname,avatar,created,updated) VALUES (?,?,?,?,?,?,?,?)`,
		1, config.Data.User.SuperAdminUsername, config.Data.User.SuperAdminEmail, models.ROLE_SUPER_ADMIN, "", "", now, now)
	if err != nil {
		log.RootLogger.Crit("init super admin error", "error:", err)
		return err
	}

	return nil
}

func connectDatabase() error {
	var path string
	dataPath := strings.TrimSpace(config.Data.Paths.Data)
	if dataPath == "" {
		path = "data.db"
	} else {
		exist, _ := utils.FileExists(dataPath)
		if !exist {
			err := os.MkdirAll(dataPath, os.ModePerm)
			if err != nil {
				log.RootLogger.Error("create data dir error", "data_path", dataPath, "error", err)
				return err
			}
		}

		path = dataPath + "/data.db"
	}

	d, err := sql.Open("sqlite3", path)
	if err != nil {
		log.RootLogger.Crit("open sqlite error", "error:", err)
		return err
	}
	db.Conn = d

	return nil
}
