package user

import (
	"database/sql"
	"net/http"
	"time"

	"github.com/imdotdev/im.dev/server/pkg/db"
	"github.com/imdotdev/im.dev/server/pkg/e"
	"github.com/imdotdev/im.dev/server/pkg/models"
	"github.com/imdotdev/im.dev/server/pkg/utils"
)

func GenSecret(userID string) (string, *e.Error) {
	secret := utils.GenID(models.IDTypeSecret)
	tx, err := db.Conn.Begin()
	if err != nil {
		logger.Warn("start transaction error", "error", err)
		return "", e.New(http.StatusInternalServerError, e.Internal)
	}

	_, err = tx.Exec("DELETE FROM user_secret WHERE user_id=?", userID)
	if err != nil {
		logger.Warn("delete secret error", "error", err)
		return "", e.New(http.StatusInternalServerError, e.Internal)
	}

	_, err = tx.Exec("INSERT INTO user_secret (user_id,secret,created) VALUES (?,?,?)", userID, secret, time.Now())
	if err != nil {
		logger.Warn("insert secret error", "error", err)
		tx.Rollback()
		return "", e.New(http.StatusInternalServerError, e.Internal)
	}

	tx.Commit()
	return secret, nil
}

func GetSecret(userID string) (string, *e.Error) {
	var secret string
	err := db.Conn.QueryRow("SELECT secret from user_secret WHERE user_id=?", userID).Scan(&secret)
	if err != nil {
		if err == sql.ErrNoRows {
			return "", e.New(http.StatusNotFound, "找不到对应的secret，请重新生成")
		}

		logger.Warn("select secret error", "error", err)
		return "", e.New(http.StatusInternalServerError, e.Internal)
	}

	return secret, nil
}
