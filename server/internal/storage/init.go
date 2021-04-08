package storage

import (
	"database/sql"
	"encoding/json"
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
	var id string
	err = db.Conn.QueryRow("select id from user where username=?", config.Data.User.SuperAdminUsername).Scan(&id)
	if err != nil && !strings.Contains(err.Error(), "no such table") && err != sql.ErrNoRows {
		return err
	}

	if err != nil {
		log.RootLogger.Info("Database tables have not been created, start creating")
		err = initTables()
		if err != nil {
			return err
		}
		log.RootLogger.Info("Create database tables ok!")
	}

	return nil
}

var navbars = []*models.Navbar{
	&models.Navbar{Label: "主页", Value: "/", Weight: 2},
	&models.Navbar{Label: "标签", Value: "/tags", Weight: 1},
	&models.Navbar{Label: "Search", Value: "/search/posts", Weight: 0},
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
	_, err := db.Conn.Exec(`INSERT INTO user (id,type,username,nickname,email,role,nickname,avatar,created,updated) VALUES (?,?,?,?,?,?,?,?,?,?)`,
		utils.GenID(models.IDTypeUser), models.IDTypeUser, config.Data.User.SuperAdminUsername, "Admin", config.Data.User.SuperAdminEmail, models.ROLE_SUPER_ADMIN, "", "", now, now)
	if err != nil {
		log.RootLogger.Crit("init super admin error", "error:", err)
		return err
	}

	// insert init navbars
	err = initNavbars()
	if err != nil {
		log.RootLogger.Crit("init navbar error", "error:", err)
		return err
	}

	// init online configs
	c := map[string]interface{}{
		"posts": map[string]interface{}{
			"titleMaxLen":    128,
			"briefMaxLen":    128,
			"writingEnabled": true,
		},
		"smtp": map[string]interface{}{
			"addr":         "",
			"fromAddress":  "",
			"fromName":     "",
			"authUsername": "",
			"authPassword": "",
		},
	}

	b, _ := json.Marshal(c)

	_, err = db.Conn.Exec(`INSERT INTO config (id,data,updated) VALUES (?,?,?)`, 1, string(b), now)
	return nil
}

func initNavbars() error {
	for _, nv := range navbars {
		_, err := db.Conn.Exec(`INSERT INTO navbar (label,value,weight) VALUES (?,?,?)`,
			nv.Label, nv.Value, nv.Weight)
		if err != nil {
			return err
		}
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
