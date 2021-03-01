package cache

import (
	"time"

	"github.com/imdotdev/im.dev/server/pkg/db"
	"github.com/imdotdev/im.dev/server/pkg/log"
	"github.com/imdotdev/im.dev/server/pkg/models"
)

var logger = log.RootLogger.New("logger", "cache")
var Users []*models.User

func Init() {
	for {
		// load users
		rows, err := db.Conn.Query(`SELECT id,username,role,nickname,email,avatar,last_seen_at,created FROM user`)
		if err != nil {
			logger.Error("load users error", "error", err)
			time.Sleep(60 * time.Second)
			continue
		}

		var users []*models.User
		for rows.Next() {
			user := &models.User{}
			err := rows.Scan(&user.ID, &user.Username, &user.Role, &user.Nickname, &user.Email, &user.Avatar, &user.LastSeenAt, &user.Created)
			if err != nil {
				logger.Warn("scan user error", "error", err)
				continue
			}
			users = append(users, user)
		}

		Users = users

		time.Sleep(60 * time.Second)
	}
}
