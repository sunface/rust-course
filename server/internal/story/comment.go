package story

import (
	"database/sql"
	"net/http"
	"sort"
	"time"

	"github.com/imdotdev/im.dev/server/pkg/db"
	"github.com/imdotdev/im.dev/server/pkg/e"
	"github.com/imdotdev/im.dev/server/pkg/models"
	"github.com/imdotdev/im.dev/server/pkg/utils"
)

func AddComment(c *models.Comment) *e.Error {
	md := utils.Compress(c.Md)

	now := time.Now()
	_, err := db.Conn.Exec("INSERT INTO comments (id,target_id,creator,md,created,updated) VALUES(?,?,?,?,?,?)",
		c.ID, c.TargetID, c.CreatorID, md, now, now)
	if err != nil {
		logger.Warn("add comment error", "error", err)
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	return nil
}

func EditComment(c *models.Comment) *e.Error {
	md := utils.Compress(c.Md)

	now := time.Now()
	_, err := db.Conn.Exec("UPDATE comments SET md=?,updated=? WHERE id=?",
		md, now, c.ID)
	if err != nil {
		logger.Warn("update comment error", "error", err)
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	return nil
}

func GetComments(storyID string) (models.Comments, *e.Error) {
	comments := make(models.Comments, 0)
	rows, err := db.Conn.Query("SELECT id,target_id,creator,md,likes,created,updated FROM comments WHERE target_id=?", storyID)
	if err != nil && err != sql.ErrNoRows {
		logger.Warn("get comments error", "error", err)
		return comments, e.New(http.StatusInternalServerError, e.Internal)
	}

	for rows.Next() {
		c := &models.Comment{}
		var rawMd []byte
		err := rows.Scan(&c.ID, &c.TargetID, &c.CreatorID, &rawMd, &c.Likes, &c.Created, &c.Updated)
		if err != nil {
			logger.Warn("scan comment error", "error", err)
			continue
		}

		md, _ := utils.Uncompress(rawMd)
		c.Md = string(md)

		c.Creator = &models.UserSimple{ID: c.CreatorID}
		err = c.Creator.Query()

		comments = append(comments, c)
	}

	sort.Sort(comments)

	return comments, nil
}

func GetComment(id string) (*models.Comment, *e.Error) {
	c := &models.Comment{}
	var rawMd []byte
	err := db.Conn.QueryRow("SELECT id,target_id,creator,md,likes,created,updated FROM comments WHERE id=?", id).Scan(
		&c.ID, &c.TargetID, &c.CreatorID, &rawMd, &c.Likes, &c.Created, &c.Updated,
	)
	if err != nil {
		logger.Warn("get comment error", "error", err)
		return nil, e.New(http.StatusInternalServerError, e.Internal)
	}

	md, _ := utils.Uncompress(rawMd)
	c.Md = string(md)

	return c, nil
}

func DeleteComment(id string) *e.Error {
	_, err := db.Conn.Exec("DELETE FROM comments WHERE id=?", id)
	if err != nil {
		logger.Warn("delete comment error", "error", err)
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	return nil
}

func commentExist(id string) bool {
	var nid string
	err := db.Conn.QueryRow("SELECT id FROM comments WHERE id=?", id).Scan(&nid)
	if err != nil && err != sql.ErrNoRows {
		logger.Warn("query comment error", "error", err)
		return false
	}

	if nid == id {
		return true
	}

	return false
}
