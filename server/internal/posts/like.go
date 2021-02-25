package posts

import (
	"database/sql"
	"net/http"

	"github.com/imdotdev/im.dev/server/pkg/db"
	"github.com/imdotdev/im.dev/server/pkg/e"
)

func Like(postId int64, userId int64) *e.Error {
	// 判断文章是否存在
	exist := postExist(postId)
	if !exist {
		return e.New(http.StatusNotFound, e.NotFound)
	}

	// 查询当前like状态
	liked := GetLiked(postId, userId)

	if liked {
		// 已经喜欢过该篇文章，更改为不喜欢
		_, err := db.Conn.Exec("DELETE FROM post_like WHERE post_id=? and user_id=?", postId, userId)
		if err != nil {
			return e.New(http.StatusInternalServerError, e.Internal)
		}
		db.Conn.Exec("UPDATE posts SET like_count=like_count-1 WHERE id=?", postId)
	} else {
		_, err := db.Conn.Exec("INSERT INTO post_like (post_id,user_id) VALUES (?,?)", postId, userId)
		if err != nil {
			return e.New(http.StatusInternalServerError, e.Internal)
		}
		db.Conn.Exec("UPDATE posts SET like_count=like_count+1 WHERE id=?", postId)
	}

	return nil
}

func GetLiked(postID, userID int64) bool {
	liked := false
	var nid int64
	err := db.Conn.QueryRow("SELECT post_id FROM post_like WHERE post_id=? and user_id=?", postID, userID).Scan(&nid)
	if err != nil && err != sql.ErrNoRows {
		logger.Warn("query post like error", "error", err)
		return false
	}

	if nid != 0 {
		liked = true
	}

	return liked
}
