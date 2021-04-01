package notification

import (
	"time"

	"github.com/imdotdev/im.dev/server/pkg/db"
	"github.com/imdotdev/im.dev/server/pkg/e"
	"github.com/imdotdev/im.dev/server/pkg/log"
)

var logger = log.RootLogger.New("logger", "notification")

func Send(userID, orgID string, noType int, noID string, operatorID string) {
	if userID != "" {
		_, err := db.Conn.Exec("INSERT INTO user_notification (user_id,operator_id,notifiable_type,notifiable_id,created) VALUES (?,?,?,?,?)",
			userID, operatorID, noType, noID, time.Now())
		if err != nil {
			logger.Warn("send notification error", "error", err)
		}
	}

	if orgID != "" {
		_, err := db.Conn.Exec("INSERT INTO org_notification (user_id,operator_id,notifiable_type,notifiable_id,created) VALUES (?,?,?,?,?)",
			orgID, operatorID, noType, noID, time.Now())
		if err != nil && !e.IsErrUniqueConstraint(err) {
			logger.Warn("send notification error", "error", err)
		}
	}
}
