package story

import (
	"database/sql"
	"net/http"

	"github.com/imdotdev/im.dev/server/pkg/db"
	"github.com/imdotdev/im.dev/server/pkg/e"
)

func Bookmark(userID int64, storyID string) *e.Error {
	storyExist := Exist(storyID)
	if !storyExist {
		return e.New(http.StatusNotFound, e.NotFound)
	}

	bookmarked, err := Bookmarked(userID, storyID)
	if err != nil {
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	if !bookmarked {
		_, err = db.Conn.Exec("insert into bookmarks (user_id,story_id) values (?,?)", userID, storyID)
		if err != nil {
			logger.Warn("add bookmark error", "error", err)
			return e.New(http.StatusInternalServerError, e.Internal)
		}
	} else {
		_, err = db.Conn.Exec("delete from bookmarks where user_id=? and story_id=?", userID, storyID)
		if err != nil {
			logger.Warn("delete bookmark error", "error", err)
			return e.New(http.StatusInternalServerError, e.Internal)
		}
	}

	return nil
}

func Bookmarked(userID int64, storyID string) (bool, error) {
	var nid string
	err := db.Conn.QueryRow("select story_id from bookmarks where user_id=? and story_id=?", userID, storyID).Scan(&nid)
	if err != nil && err != sql.ErrNoRows {
		logger.Warn("get bookmarked error", "error", err)
		return false, err
	}

	if err == sql.ErrNoRows {
		return false, nil
	}

	return true, nil
}
