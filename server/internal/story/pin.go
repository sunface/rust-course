package story

import (
	"database/sql"
	"net/http"
	"time"

	"github.com/imdotdev/im.dev/server/pkg/db"
	"github.com/imdotdev/im.dev/server/pkg/e"
)

func PinStory(storyID string, targetID string) *e.Error {
	pinned := false

	var nid string
	err := db.Conn.QueryRow("SELECT target_id FROM pin WHERE target_id=? and story_id=?", targetID, storyID).Scan(&nid)
	if err != nil && err != sql.ErrNoRows {
		logger.Warn("query pinned error", "error", err)
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	if nid == targetID {
		pinned = true
	}

	if pinned {
		_, err = db.Conn.Exec("DELETE FROM pin WHERE target_id=? and story_id=?", targetID, storyID)
		if err != nil {
			logger.Warn("delete pin error", "error", err)
			return e.New(http.StatusInternalServerError, e.Internal)
		}
	} else {
		_, err = db.Conn.Exec("INSERT INTO pin (target_id,story_id,created) VALUES (?,?,?)", targetID, storyID, time.Now())
		if err != nil {
			logger.Warn("add pin error", "error", err)
			return e.New(http.StatusInternalServerError, e.Internal)
		}
	}

	return nil
}

func GetPinned(storyID string, targetID string) bool {
	var nid string
	err := db.Conn.QueryRow("SELECT target_id FROM pin WHERE target_id=? and story_id=?", targetID, storyID).Scan(&nid)
	if err != nil {
		return false
	}

	return true
}
