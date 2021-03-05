package story

import (
	"database/sql"
	"fmt"
	"net/http"
	"time"

	"github.com/imdotdev/im.dev/server/pkg/db"
	"github.com/imdotdev/im.dev/server/pkg/e"
)

func Like(storyID string, userId string) *e.Error {
	exist := Exist(storyID)
	if !exist {
		return e.New(http.StatusNotFound, e.NotFound)
	}

	tbl := getStorySqlTable(storyID)
	// 查询当前like状态
	liked := GetLiked(storyID, userId)

	if liked {
		// 已经喜欢过该篇文章，更改为不喜欢
		_, err := db.Conn.Exec("DELETE FROM likes WHERE story_id=? and user_id=?", storyID, userId)
		if err != nil {
			return e.New(http.StatusInternalServerError, e.Internal)
		}

		db.Conn.Exec(fmt.Sprintf("UPDATE %s SET likes=likes-1 WHERE id=?", tbl), storyID)
	} else {
		_, err := db.Conn.Exec("INSERT INTO likes (story_id,user_id,created) VALUES (?,?,?)", storyID, userId, time.Now())
		if err != nil {
			logger.Warn("add like error", "error", err)
			return e.New(http.StatusInternalServerError, e.Internal)
		}
		db.Conn.Exec(fmt.Sprintf("UPDATE %s SET likes=likes+1 WHERE id=?", tbl), storyID)
	}

	return nil
}

func GetLiked(storyID string, userID string) bool {
	liked := false
	var nid string
	err := db.Conn.QueryRow("SELECT story_id FROM likes WHERE story_id=? and user_id=?", storyID, userID).Scan(&nid)
	if err != nil && err != sql.ErrNoRows {
		logger.Warn("query story like error", "error", err)
		return false
	}

	if nid == storyID {
		liked = true
	}

	return liked
}
