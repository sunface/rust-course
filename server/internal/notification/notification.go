package notification

import (
	"database/sql"
	"net/http"
	"time"

	"github.com/imdotdev/im.dev/server/pkg/db"
	"github.com/imdotdev/im.dev/server/pkg/e"
	"github.com/imdotdev/im.dev/server/pkg/log"
	"github.com/imdotdev/im.dev/server/pkg/models"
)

var logger = log.RootLogger.New("logger", "notification")

func Send(userID, orgID string, noType int, noID string, noTitle string, operatorID string) {
	if userID != "" {
		_, err := db.Conn.Exec("INSERT INTO user_notification (user_id,operator_id,notifiable_type,notifiable_id,no_title,created) VALUES (?,?,?,?,?,?)",
			userID, operatorID, noType, noID, noTitle, time.Now())
		if err != nil {
			logger.Warn("send notification error", "error", err)
		}
	}

	if orgID != "" {
		_, err := db.Conn.Exec("INSERT INTO org_notification (user_id,operator_id,notifiable_type,notifiable_id,no_title,created) VALUES (?,?,?,?,?,?)",
			orgID, operatorID, noType, noID, noTitle, time.Now())
		if err != nil && !e.IsErrUniqueConstraint(err) {
			logger.Warn("send notification error", "error", err)
		}
	}
}

const perPage = 10

func Query(user *models.User, tp int, page int) ([]*models.Notification, *e.Error) {
	var rows *sql.Rows
	var err error
	if tp == 0 {
		rows, err = db.Conn.Query("SELECT operator_id,notifiable_type,notifiable_id,no_title,read,created FROM user_notification WHERE user_id=? ORDER BY created DESC LIMIT ?,?", user.ID, (page-1)*perPage, page*perPage)
	} else if tp == models.NotificationComment {
		rows, err = db.Conn.Query("SELECT operator_id,notifiable_type,notifiable_id,no_title,read,created FROM user_notification WHERE user_id=? and notifiable_type in ('1','6') ORDER BY created DESC LIMIT ?,?", user.ID, (page-1)*perPage, page*perPage)
	} else {
		rows, err = db.Conn.Query("SELECT operator_id,notifiable_type,notifiable_id,no_title,read,created FROM user_notification WHERE user_id=? and notifiable_type=? ORDER BY created DESC  LIMIT ?,?", user.ID, tp, (page-1)*perPage, page*perPage)
	}

	if err != nil {
		logger.Warn("query notification", "error", err)
		return nil, e.New(http.StatusInternalServerError, e.Internal)
	}

	nos := make([]*models.Notification, 0)
	for rows.Next() {
		var operatorID string
		var noType int
		var noID string
		var read bool
		var created time.Time
		var title string
		err := rows.Scan(&operatorID, &noType, &noID, &title, &read, &created)
		if err != nil {
			logger.Warn("scan notification", "error", err)
			continue
		}

		operator := &models.UserSimple{ID: operatorID}
		err = operator.Query()

		no := &models.Notification{Created: created, Type: noType, User: operator, Read: read, Title: title}

		switch no.Type {
		case models.NotificationComment, models.NotificationSystem:
			no.SubTitle = models.GetStoryTitle(noID)
			no.StoryID = noID
		case models.NotificationReply:
			no.SubTitle = models.GetStoryTitle(noID)
			no.StoryID = noID
		case models.NotificationLike:
			if models.GetIDType(noID) == models.IDTypeComment {
				id := models.GetCommentStoryID(noID)
				if id != "" {
					no.SubTitle = models.GetStoryTitle(id)
					no.StoryID = id
				}
			} else {
				no.SubTitle = models.GetStoryTitle(noID)
				no.StoryID = noID
			}
		case models.NotificationPublish:
			no.SubTitle = models.GetStoryTitle(noID)
			no.StoryID = noID
		}
		nos = append(nos, no)
	}

	return nos, nil
}

func QueryUnRead(userID string) int {
	var count int
	err := db.Conn.QueryRow("SELECT count(1) FROM user_notification WHERE user_id=? and read=?", userID, false).Scan(&count)
	if err != nil {
		logger.Warn("query unread error", "error", err)
	}
	return count
}

func ResetUnRead(userID string) *e.Error {
	_, err := db.Conn.Exec("UPDATE user_notification SET read=? WHERE user_id=? and read=?", true, userID, false)
	if err != nil {
		logger.Warn("query notification", "error", err)
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	return nil
}
