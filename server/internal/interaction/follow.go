package interaction

import (
	"database/sql"
	"net/http"
	"sort"
	"time"

	"github.com/imdotdev/im.dev/server/pkg/db"
	"github.com/imdotdev/im.dev/server/pkg/e"
	"github.com/imdotdev/im.dev/server/pkg/models"
)

func Follow(targetID string, userId string) *e.Error {
	exist := models.IdExist(targetID)
	if !exist {
		return e.New(http.StatusNotFound, e.NotFound)
	}

	followed := GetFollowed(targetID, userId)

	var count int
	err := db.Conn.QueryRow("SELECT count FROM follows_count WHERE target_id=?", targetID).Scan(&count)
	if err != nil && err != sql.ErrNoRows {
		logger.Warn("query follows count error", "error", err)
		return e.New(http.StatusInternalServerError, e.Internal)
	}
	exist = !(err == sql.ErrNoRows)

	tx, err := db.Conn.Begin()
	if err != nil {
		logger.Warn("start sql transaction error", "error", err)
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	if followed {
		// 已经喜欢过该篇文章，更改为不喜欢
		_, err := tx.Exec("DELETE FROM follows WHERE user_id=? and target_id=?", userId, targetID)
		if err != nil {
			return e.New(http.StatusInternalServerError, e.Internal)
		}
		count = count - 1
	} else {
		_, err := tx.Exec("INSERT INTO follows (user_id,target_id,target_type,created) VALUES (?,?,?,?)", userId, targetID, models.GetIDType(targetID), time.Now())
		if err != nil {
			logger.Warn("add follows error", "error", err)
			return e.New(http.StatusInternalServerError, e.Internal)
		}
		count = count + 1
	}

	var err0 error
	if !exist {
		_, err0 = tx.Exec("INSERT INTO follows_count (target_id,count) VALUES (?,?)", targetID, count)
	} else {
		_, err0 = tx.Exec("UPDATE follows_count SET count=? WHERE target_id=?", count, targetID)
	}

	if err0 != nil {
		logger.Warn("add follows_count error", "error", err0)
		tx.Rollback()
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	tx.Commit()

	return nil
}

func GetFollowed(targetID string, userID string) bool {
	followed := false
	var nid string
	err := db.Conn.QueryRow("SELECT target_id FROM follows WHERE user_id=? and target_id=?", userID, targetID).Scan(&nid)
	if err != nil && err != sql.ErrNoRows {
		logger.Warn("query folloed error", "error", err)
		return false
	}

	if nid == targetID {
		followed = true
	}

	return followed
}

func GetFollows(targetID string) int {
	var follows int
	err := db.Conn.QueryRow("SELECT count FROM follows_count WHERE target_id=?", targetID).Scan(&follows)
	if err != nil && err != sql.ErrNoRows {
		logger.Warn("get follow count error", "error", err)
	}

	return follows
}

func GetFollowing(userID, targetType string) ([]*models.Following, *e.Error) {
	rows, err := db.Conn.Query("SELECT target_id,weight from follows where user_id=? and target_type=?", userID, targetType)
	if err != nil {
		logger.Warn("get following error", "error", err)
		return nil, e.New(http.StatusInternalServerError, e.Internal)
	}

	following := make(models.Followings, 0)
	for rows.Next() {
		f := &models.Following{}
		rows.Scan(&f.ID, &f.Weight)
		following = append(following, f)
	}

	sort.Sort(following)
	return following, nil
}

func SetFolloingWeight(userID string, f *models.Following) *e.Error {
	_, err := db.Conn.Exec("UPDATE follows SET weight=? WHERE user_id=? and target_id=?", f.Weight, userID, f.ID)
	if err != nil {
		logger.Warn("set following weight error", "error", err)
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	return nil
}
