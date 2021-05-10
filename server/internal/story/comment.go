package story

import (
	"database/sql"
	"errors"
	"net/http"
	"sort"
	"time"

	"github.com/imdotdev/im.dev/server/internal/interaction"
	"github.com/imdotdev/im.dev/server/internal/notification"
	"github.com/imdotdev/im.dev/server/pkg/db"
	"github.com/imdotdev/im.dev/server/pkg/e"
	"github.com/imdotdev/im.dev/server/pkg/models"
	"github.com/imdotdev/im.dev/server/pkg/utils"
)

func AddComment(c *models.Comment) *e.Error {
	md := utils.Compress(c.Md)

	now := time.Now()
	_, err := db.Conn.Exec("INSERT INTO comments (id,story_id,creator,md,created,updated) VALUES(?,?,?,?,?,?)",
		c.ID, c.TargetID, c.CreatorID, md, now, now)
	if err != nil {
		logger.Warn("add comment error", "error", err)
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	// 更新story的comment数量
	// 查询到该comment所属的story id
	var storyID string
	err = db.Conn.QueryRow("select story_id from comments where id=?", c.TargetID).Scan(&storyID)
	if err != nil && err != sql.ErrNoRows {
		logger.Warn("select comment error", "error", err)
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	if storyID == "" {
		storyID = c.TargetID
	}

	var nid string
	err = db.Conn.QueryRow("SELECT story_id FROM comments_count WHERE story_id=?", storyID).Scan(&nid)
	if err != nil && err != sql.ErrNoRows {
		logger.Warn("select from comments_count error", "error", err)
		return nil
	}

	if err == sql.ErrNoRows {
		_, err := db.Conn.Exec("INSERT INTO comments_count (story_id,count) VALUES(?,?)", storyID, 1)
		if err != nil {
			logger.Warn("insert into comments_count error", "error", err)
		}
	} else {
		_, err := db.Conn.Exec("UPDATE comments_count SET count=count+1 WHERE story_id=?", storyID)
		if err != nil {
			logger.Warn("update comments_count error", "error", err)
		}
	}

	// send notification to story creator and org
	creator, owner := models.GetStoryCreatorAndOrg(c.TargetID)
	if creator != "" && creator != c.CreatorID {
		if models.GetIDType(c.TargetID) == models.IDTypeComment {
			// reply
			notification.Send(creator, owner, models.NotificationReply, storyID, c.CreatorID)
		} else {
			// comment
			notification.Send(creator, owner, models.NotificationComment, storyID, c.CreatorID)
		}
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

func GetComments(storyID string, sorter string) ([]*models.Comment, *e.Error) {
	comments := make([]*models.Comment, 0)
	rows, err := db.Conn.Query("SELECT id,story_id,creator,md,created,updated FROM comments WHERE story_id=?", storyID)
	if err != nil && err != sql.ErrNoRows {
		logger.Warn("get comments error", "error", err)
		return comments, e.New(http.StatusInternalServerError, e.Internal)
	}

	for rows.Next() {
		c := &models.Comment{}
		var rawMd []byte
		err := rows.Scan(&c.ID, &c.TargetID, &c.CreatorID, &rawMd, &c.Created, &c.Updated)
		if err != nil {
			logger.Warn("scan comment error", "error", err)
			continue
		}

		md, _ := utils.Uncompress(rawMd)
		c.Md = string(md)

		c.Creator = &models.UserSimple{ID: c.CreatorID}
		err = c.Creator.Query()

		c.Likes = interaction.GetLikes(c.ID)

		comments = append(comments, c)
	}

	if sorter == models.FilterFavorites {
		sort.Sort(models.FavorComments(comments))
	} else {
		sort.Sort(models.Comments(comments))
	}

	return comments, nil
}

func GetComment(id string) (*models.Comment, *e.Error) {
	c := &models.Comment{}
	var rawMd []byte
	err := db.Conn.QueryRow("SELECT id,story_id,creator,md,created,updated FROM comments WHERE id=?", id).Scan(
		&c.ID, &c.TargetID, &c.CreatorID, &rawMd, &c.Created, &c.Updated,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, e.New(http.StatusNotFound, "评论不存在")
		}
		logger.Warn("get comment error", "error", err)
		return nil, e.New(http.StatusInternalServerError, e.Internal)
	}

	md, _ := utils.Uncompress(rawMd)
	c.Md = string(md)

	c.Likes = interaction.GetLikes(c.ID)
	return c, nil
}

func DeleteComment(id string) *e.Error {
	// 更新story的comment数量
	// 查询到该comment所属的story id
	storyID, isComment, err := GetStoryIDByCommentID(id)
	if err != nil {
		logger.Warn("delete comment  error", "error", err)
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	count := 0
	if isComment {
		// 如果是评论，我们要计算replies的数量，因为会一起删除
		err := db.Conn.QueryRow("select count(*) from comments where story_id=?", id).Scan(&count)
		if err != nil && err != sql.ErrNoRows {
			logger.Warn("select  comment  error", "error", err)
			return e.New(http.StatusInternalServerError, e.Internal)
		}

	}
	count += 1

	tx, err := db.Conn.Begin()
	if err != nil {
		logger.Warn("start sql transaction error", "error", err)
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	_, err = tx.Exec("UPDATE comments_count SET count=count-? WHERE story_id=?", count, storyID)
	if err != nil {
		logger.Warn("update  comments_count  error", "error", err)
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	// delete children replies
	_, err = tx.Exec("DELETE FROM comments WHERE story_id=?", id)
	if err != nil {
		logger.Warn("delete comment replies error", "error", err)
		tx.Rollback()
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	_, err = tx.Exec("DELETE FROM comments WHERE id=?", id)
	if err != nil {
		logger.Warn("delete comment error", "error", err)
		tx.Rollback()
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	tx.Commit()

	return nil
}

func GetCommentCount(storyID string) int {
	count := 0
	err := db.Conn.QueryRow("SELECT count from comments_count WHERE story_id=?", storyID).Scan(&count)
	if err != nil && err != sql.ErrNoRows {
		logger.Warn("query comment count error", "error", err)
	}

	return count
}

func GetStoryIDByCommentID(cid string) (string, bool, error) {
	var targetID string
	err := db.Conn.QueryRow("select story_id from comments where id=?", cid).Scan(&targetID)
	if err != nil {
		return "", false, err
	}

	switch targetID[:1] {
	case models.IDTypePost:
		return targetID, true, nil
	case models.IDTypeComment:
		var nid string
		err := db.Conn.QueryRow("select story_id from comments where id=?", targetID).Scan(&nid)
		if err != nil {
			return "", false, err
		}

		return nid, false, nil
	default:
		return "", false, errors.New("bad comment id")
	}
}
