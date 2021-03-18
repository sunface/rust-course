package admin

import (
	"net/http"

	"github.com/grafana/grafana/pkg/cmd/grafana-cli/logger"
	"github.com/imdotdev/im.dev/server/pkg/db"
	"github.com/imdotdev/im.dev/server/pkg/e"
	"github.com/imdotdev/im.dev/server/pkg/models"
)

func GetUsers() ([]*models.User, *e.Error) {
	users := make([]*models.User, 0)
	rows, err := db.Conn.Query("SELECT id,username,email,role,created FROM user WHERE type=?", models.IDTypeUser)
	if err != nil {
		logger.Warn("get users  error", "error", err)
		return nil, e.New(http.StatusInternalServerError, e.Internal)
	}

	for rows.Next() {
		user := &models.User{}
		rows.Scan(&user.ID, &user.Username, &user.Email, &user.Role, &user.Created)
		users = append(users, user)
	}

	return users, nil
}
