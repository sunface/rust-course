package post

import (
	"encoding/json"
	"net/http"
	"sort"
	"strconv"
	"time"

	"github.com/labstack/echo"
	"github.com/thinkindev/im.dev/internal/ecode"
	"github.com/thinkindev/im.dev/internal/misc"
	"github.com/thinkindev/im.dev/internal/session"
	"github.com/thinkindev/im.dev/internal/utils"
	"go.uber.org/zap"
)

// CommentContent holds the comment content
type CommentContent struct {
	ID          string `json:"id"`
	MD          string `json:"md"`
	Render      string `json:"render"`
	UID         string `json:"uid"`
	UName       string `json:"uname"`
	UNickname   string `json:"unickname"`
	UAvatar     string `json:"uavatar"`
	PublishDate string `json:"date"`
	publishDate int64
}

// Comments is the list of comment
type Comments []*CommentContent

func (a Comments) Len() int { // 重写 Len() 方法
	return len(a)
}
func (a Comments) Swap(i, j int) { // 重写 Swap() 方法
	a[i], a[j] = a[j], a[i]
}
func (a Comments) Less(i, j int) bool { // 重写 Less() 方法， 从小到大排序
	return a[i].publishDate < a[j].publishDate
}

// Comment is the action that user make commention to one post
func Comment(c echo.Context) error {
	postID := c.FormValue("post_id")
	postType, _ := strconv.Atoi(c.FormValue("post_type"))
	content := c.FormValue("content")

	if postID == "" || postType != ArticleType || content == "" {
		return c.JSON(http.StatusBadRequest, misc.HTTPResp{
			ErrCode: ecode.ParamInvalid,
			Message: ecode.ParamInvalidMsg,
		})
	}

	// check whether target post exist
	var title string
	var err error
	switch postType {
	case ArticleType:
		err = misc.CQL.Query("SELECT title FROM article WHERE id=?", postID).Scan(&title)
	}
	if err != nil {
		if err.Error() == misc.CQLNotFound {
			return c.JSON(http.StatusNotFound, misc.HTTPResp{
				ErrCode: ecode.PostNotFound,
				Message: ecode.PostNotFoundMsg,
			})
		}
		misc.Log.Warn("access database error", zap.Error(err))
		return c.JSON(http.StatusInternalServerError, misc.HTTPResp{
			ErrCode: ecode.DatabaseError,
			Message: ecode.CommonErrorMsg,
		})
	}

	cc := &CommentContent{}
	err = json.Unmarshal([]byte(content), &cc)
	if err != nil {
		return c.JSON(http.StatusBadRequest, misc.HTTPResp{
			ErrCode: ecode.ParamInvalid,
			Message: ecode.ParamInvalidMsg,
		})
	}

	sess := session.Get(c)

	cc.UID = sess.ID
	// generate id for article
	cc.ID = misc.GenID()
	// modify render
	cc.Render = modify(cc.Render)

	err = misc.CQL.Query("INSERT INTO comment (id,uid,post_id,post_type,md,render,publish_date) VALUES (?,?,?,?,?,?,?)",
		cc.ID, sess.ID, postID, postType, cc.MD, cc.Render, time.Now().Unix()).Exec()
	if err != nil {
		misc.Log.Warn("access database error", zap.Error(err))
		return c.JSON(http.StatusInternalServerError, misc.HTTPResp{
			ErrCode: ecode.DatabaseError,
			Message: ecode.CommonErrorMsg,
		})
	}

	// update post comment count
	switch postType {
	case ArticleType:
		err = misc.CQL.Query("UPDATE post_counter SET comments=comments + 1 WHERE id=?", postID).Exec()
	}
	if err != nil {
		misc.Log.Warn("access database error", zap.Error(err))
	}

	return c.JSON(http.StatusOK, misc.HTTPResp{
		Data: cc,
	})
}

// QueryComments return the comments by post id
func QueryComments(c echo.Context) error {
	postID := c.FormValue("post_id")
	if postID == "" {
		return c.JSON(http.StatusBadRequest, misc.HTTPResp{
			ErrCode: ecode.ParamInvalid,
			Message: ecode.ParamInvalidMsg,
		})
	}

	q := misc.CQL.Query(`SELECT id,uid,md,render,publish_date FROM comment WHERE post_id=?`, postID)
	iter := q.Iter()

	comments := make(Comments, 0)
	var cid, uid, md, render string
	var pdate int64
	for iter.Scan(&cid, &uid, &md, &render, &pdate) {
		comment := &CommentContent{
			ID:          cid,
			UID:         uid,
			MD:          md,
			Render:      render,
			publishDate: pdate,
		}
		u := session.GetUserByID(comment.UID)
		if u == nil {
			continue
		}
		comment.UName = u.Name
		comment.UNickname = u.NickName
		comment.UAvatar = u.Avatar
		comment.PublishDate = utils.Time2ReadableString(time.Unix(comment.publishDate, 0))

		comments = append(comments, comment)
	}

	sort.Sort(comments)

	if err := iter.Close(); err != nil {
		misc.Log.Warn("access database error", zap.Error(err), zap.String("query", q.String()))
		return c.JSON(http.StatusInternalServerError, misc.HTTPResp{
			ErrCode: ecode.DatabaseError,
			Message: ecode.CommonErrorMsg,
		})
	}

	return c.JSON(http.StatusOK, misc.HTTPResp{
		Data: comments,
	})
}
