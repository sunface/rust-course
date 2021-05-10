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

func ForbiddenStory(id string) *e.Error {
	var status int
	err := db.Conn.QueryRow("SELECT status FROM story WHERE id=?", id).Scan(&status)
	if err != nil {
		logger.Warn("get story status  error", "error", err)
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	var newStatus int
	if status != models.StatusForbidden {
		newStatus = models.StatusForbidden
	} else {
		newStatus = models.StatusDraft
	}

	_, err = db.Conn.Exec("UPDATE story SET status=? WHERE id=?", newStatus, id)
	if err != nil {
		logger.Warn("update story status  error", "error", err)
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	return nil
}
