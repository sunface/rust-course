package post

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/gocql/gocql"
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
	PID         string `json:"pid"`
	Depth       int    `json:"depth"`
	MD          string `json:"md"`
	Render      string `json:"render"`
	UID         string `json:"uid"`
	UName       string `json:"uname"`
	UNickname   string `json:"unickname"`
	PublishDate string `json:"date"`
	publishDate int64

	EditDate string `json:"edit_date,omitempty"`
	editDate int64

	Likes int `json:"likes"`
	Liked int `json:"liked"` // current login user's liked to the comment, 0 normal, 1 liked, 2 disliked

	Status int `json:"status"`
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
	return a[i].publishDate >= a[j].publishDate
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
	cc.UName = sess.Name
	cc.UNickname = sess.NickName
	// modify render
	cc.Render = modify(cc.Render)
	cc.publishDate = time.Now().Unix()
	cc.PublishDate = utils.Time2ReadableString(time.Unix(cc.publishDate, 0))

	err = misc.CQL.Query("INSERT INTO comment (id,uid,post_id,post_type,md,render,publish_date) VALUES (?,?,?,?,?,?,?)",
		cc.ID, sess.ID, postID, postType, cc.MD, cc.Render, cc.publishDate).Exec()
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

// CommentReply is the action that user make commention to one post
func CommentReply(c echo.Context) error {
	pid := c.FormValue("pid")
	postID := c.FormValue("post_id")
	postType, _ := strconv.Atoi(c.FormValue("post_type"))
	content := c.FormValue("content")

	if pid == "" || postID == "" || postType != ArticleType || content == "" {
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
	cc.UName = sess.Name
	cc.UNickname = sess.NickName
	// modify render
	cc.Render = modify(cc.Render)
	cc.publishDate = time.Now().Unix()
	cc.PublishDate = utils.Time2ReadableString(time.Unix(cc.publishDate, 0))
	cc.PID = pid
	err = misc.CQL.Query("INSERT INTO comment (id,pid,uid,post_id,post_type,md,render,publish_date) VALUES (?,?,?,?,?,?,?,?)",
		cc.ID, pid, sess.ID, postID, postType, cc.MD, cc.Render, cc.publishDate).Exec()
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

// EditComment edit the comment
func EditComment(c echo.Context) error {
	id := c.FormValue("id")
	content := c.FormValue("content")

	if id == "" || content == "" {
		return c.JSON(http.StatusBadRequest, misc.HTTPResp{
			ErrCode: ecode.ParamInvalid,
			Message: ecode.ParamInvalidMsg,
		})
	}

	sess := session.Get(c)

	// check permission
	q := misc.CQL.Query(`SELECT uid FROM comment WHERE id=?`, id)
	var uid string
	err := q.Scan(&uid)
	if err != nil {
		misc.Log.Warn("access database error", zap.Error(err), zap.String("query", q.String()))
		return c.JSON(http.StatusInternalServerError, misc.HTTPResp{
			ErrCode: ecode.DatabaseError,
			Message: ecode.CommonErrorMsg,
		})
	}
	if uid != sess.ID {
		return c.JSON(http.StatusUnauthorized, misc.HTTPResp{
			ErrCode: ecode.NoPermission,
			Message: ecode.NoPermissionMsg,
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

	cc.Render = modify(cc.Render)

	q = misc.CQL.Query(`UPDATE comment SET md=?,render=?,edit_date=? WHERE id=?`, cc.MD, cc.Render, time.Now().Unix(), id)
	err = q.Exec()
	if err != nil {
		misc.Log.Warn("access database error", zap.Error(err), zap.String("query", q.String()))
		return c.JSON(http.StatusInternalServerError, misc.HTTPResp{
			ErrCode: ecode.DatabaseError,
			Message: ecode.CommonErrorMsg,
		})
	}

	return c.JSON(http.StatusOK, misc.HTTPResp{
		Data: cc.Render,
	})
}

// DeleteComment delete the comment
// Only comment author can do this
func DeleteComment(c echo.Context) error {
	id := c.FormValue("id")
	if id == "" {
		return c.JSON(http.StatusBadRequest, misc.HTTPResp{
			ErrCode: ecode.ParamInvalid,
			Message: ecode.ParamInvalidMsg,
		})
	}

	sess := session.Get(c)
	// check comment exists and this user has permission
	var uid string
	q := misc.CQL.Query(`SELECT uid FROM comment WHERE id=?`, id)
	err := q.Scan(&uid)
	if err != nil {
		misc.Log.Warn("access database error", zap.Error(err), zap.String("query", q.String()))
		return c.JSON(http.StatusInternalServerError, misc.HTTPResp{
			ErrCode: ecode.DatabaseError,
			Message: ecode.CommonErrorMsg,
		})
	}

	if sess.ID != uid {
		return c.JSON(http.StatusUnauthorized, misc.HTTPResp{
			ErrCode: ecode.NoPermission,
			Message: ecode.NoPermissionMsg,
		})
	}

	// set comment to delete status
	q = misc.CQL.Query(`UPDATE comment SET status=? WHERE id=?`, StatusDeleted, id)
	err = q.Exec()
	if err != nil {
		misc.Log.Warn("access database error", zap.Error(err), zap.String("query", q.String()))
		return c.JSON(http.StatusInternalServerError, misc.HTTPResp{
			ErrCode: ecode.DatabaseError,
			Message: ecode.CommonErrorMsg,
		})
	}

	return c.JSON(http.StatusOK, misc.HTTPResp{})
}

// RevertComment revert the comment from delete status
// Only comment owner and post author can do this
func RevertComment(c echo.Context) error {
	id := c.FormValue("id")
	if id == "" {
		return c.JSON(http.StatusBadRequest, misc.HTTPResp{
			ErrCode: ecode.ParamInvalid,
			Message: ecode.ParamInvalidMsg,
		})
	}

	sess := session.Get(c)
	// check comment exists and this user has permission
	var uid, md, render string

	q := misc.CQL.Query(`SELECT uid,md,render FROM comment WHERE id=?`, id)
	err := q.Scan(&uid, &md, &render)
	if err != nil {
		misc.Log.Warn("access database error", zap.Error(err), zap.String("query", q.String()))
		return c.JSON(http.StatusInternalServerError, misc.HTTPResp{
			ErrCode: ecode.DatabaseError,
			Message: ecode.CommonErrorMsg,
		})
	}

	if sess.ID != uid {
		return c.JSON(http.StatusUnauthorized, misc.HTTPResp{
			ErrCode: ecode.NoPermission,
			Message: ecode.NoPermissionMsg,
		})
	}

	// set comment to delete status
	q = misc.CQL.Query(`UPDATE comment SET status=? WHERE id=?`, StatusNormal, id)
	err = q.Exec()
	if err != nil {
		misc.Log.Warn("access database error", zap.Error(err), zap.String("query", q.String()))
		return c.JSON(http.StatusInternalServerError, misc.HTTPResp{
			ErrCode: ecode.DatabaseError,
			Message: ecode.CommonErrorMsg,
		})
	}

	comment := &CommentContent{}
	comment.MD = md
	comment.Render = render
	u := session.GetUserByID(uid)
	if u == nil {
		comment.UName = "[404]"
		comment.UNickname = "[404]"
	} else {
		comment.UName = u.Name
		comment.UNickname = u.NickName
	}

	return c.JSON(http.StatusOK, misc.HTTPResp{
		Data: comment,
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

	q := misc.CQL.Query(`SELECT id,pid,uid,md,render,publish_date,edit_date,status FROM comment WHERE post_id=?`, postID)
	iter := q.Iter()

	// comment map
	cMap := make(map[string]*CommentContent)
	// parent -> child map
	pMap := make(map[string][]string)
	// no parent list
	nopList := make([]string, 0)

	var cid, uid, md, render, pid string
	var pdate, edate int64
	var status int
	for iter.Scan(&cid, &pid, &uid, &md, &render, &pdate, &edate, &status) {
		comment := &CommentContent{
			ID:          cid,
			PID:         pid,
			UID:         uid,
			MD:          md,
			Render:      render,
			publishDate: pdate,
			editDate:    edate,
			Status:      status,
		}
		u := session.GetUserByID(comment.UID)
		if u == nil {
			continue
		}
		if status == StatusDeleted {
			comment.MD = "[deleted]"
			comment.Render = "[deleted]"
			comment.UName = "[deleted]"
			comment.UNickname = "[deleted]"
		} else {
			comment.UName = u.Name
			comment.UNickname = u.NickName
		}

		comment.PublishDate = utils.Time2ReadableString(time.Unix(comment.publishDate, 0))
		if comment.editDate != 0 {
			comment.EditDate = utils.Time2ReadableString(time.Unix(comment.editDate, 0))
		}
		cMap[comment.ID] = comment
		if comment.PID == "" {
			nopList = append(nopList, comment.ID)
		} else {
			childs, ok := pMap[comment.PID]
			if !ok {
				pMap[comment.PID] = []string{comment.ID}
			} else {
				pMap[comment.PID] = append(childs, comment.ID)
			}
		}
	}

	if err := iter.Close(); err != nil {
		misc.Log.Warn("access database error", zap.Error(err), zap.String("query", q.String()))
		return c.JSON(http.StatusInternalServerError, misc.HTTPResp{
			ErrCode: ecode.DatabaseError,
			Message: ecode.CommonErrorMsg,
		})
	}

	// defualt sort based on time ascending
	sort.Strings(nopList)
	for _, childs := range pMap {
		sort.Strings(childs)
	}

	comments := make([]*CommentContent, 0)

	for _, nop := range nopList {
		// add first level comment to final list
		comment := cMap[nop]
		comment.Depth = 0
		comments = append(comments, comment)

		// recursively find his childs
		findCommentChilds(&comments, nop, pMap, cMap, 1)
	}

	var b strings.Builder
	b.WriteString(`SELECT id,likes FROM comment_counter WHERE id in (`)

	var b1 strings.Builder
	sess := session.Get(c)
	if sess != nil {
		b1.WriteString(`SELECT comment_id,type  FROM comment_like WHERE uid=? and comment_id in (`)
	}
	for i, c := range comments {
		if i == len(comments)-1 {
			b.WriteString(fmt.Sprintf("'%s')", c.ID))
			if sess != nil {
				b1.WriteString(fmt.Sprintf("'%s')", c.ID))
			}
		} else {
			b.WriteString(fmt.Sprintf("'%s',", c.ID))
			if sess != nil {
				b1.WriteString(fmt.Sprintf("'%s',", c.ID))
			}
		}
	}

	if len(comments) != 0 {
		q = misc.CQL.Query(b.String())
		iter = q.Iter()

		var id string
		var likes int
		likesMap := make(map[string]int)
		for iter.Scan(&id, &likes) {
			likesMap[id] = likes
		}

		if err := iter.Close(); err != nil {
			misc.Log.Warn("access database error", zap.Error(err), zap.String("query", q.String()))
			return c.JSON(http.StatusInternalServerError, misc.HTTPResp{
				ErrCode: ecode.DatabaseError,
				Message: ecode.CommonErrorMsg,
			})
		}

		likedMap := make(map[string]int)
		if sess != nil {
			q := misc.CQL.Query(b1.String(), sess.ID)
			iter := q.Iter()
			var liked int
			var postID string
			for iter.Scan(&postID, &liked) {
				likedMap[postID] = liked
			}

			if err := iter.Close(); err != nil {
				misc.Log.Warn("access database error", zap.Error(err), zap.String("query", q.String()))
				return c.JSON(http.StatusInternalServerError, misc.HTTPResp{
					ErrCode: ecode.DatabaseError,
					Message: ecode.CommonErrorMsg,
				})
			}
		}
		for _, c := range comments {
			c.Likes = likesMap[c.ID]
			if sess != nil {
				c.Liked = likedMap[c.ID]
			}
		}
	}

	return c.JSON(http.StatusOK, misc.HTTPResp{
		Data: comments,
	})
}

func findCommentChilds(comments *([]*CommentContent), pid string, pMap map[string][]string, cMap map[string]*CommentContent, depth int) {
	childs, ok := pMap[pid]
	if !ok {
		return
	}

	for _, child := range childs {
		comment := cMap[child]
		comment.Depth = depth
		*comments = append(*comments, comment)
		// findCommentChilds
		findCommentChilds(comments, child, pMap, cMap, depth+1)
	}
}

// CommentLike indicates that a user like/dislike a Comment
func CommentLike(c echo.Context) error {
	postID := c.FormValue("id")
	if postID == "" {
		return c.JSON(http.StatusBadRequest, misc.HTTPResp{
			ErrCode: ecode.ParamInvalid,
			Message: ecode.ParamInvalidMsg,
		})
	}

	sess := session.Get(c)

	// check whether you already liked this comment
	status, err := commentLikeStatus(postID, sess.ID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, misc.HTTPResp{
			ErrCode: ecode.DatabaseError,
			Message: ecode.CommonErrorMsg,
		})
	}

	if status == OpCommentLike {
		err = commentLike(postID, sess.ID, OpCommentLike, OpDelete)
	} else {
		err = commentLike(postID, sess.ID, OpCommentLike, OpUpdate)
	}
	if err != nil {
		return c.JSON(http.StatusInternalServerError, misc.HTTPResp{
			ErrCode: ecode.DatabaseError,
			Message: ecode.CommonErrorMsg,
		})
	}

	var q *gocql.Query
	if status == OpCommentLike { // from like to normal, -1
		q = misc.CQL.Query(`UPDATE comment_counter SET likes=likes-1 WHERE id=?`, postID)
	} else if status == OpCommentDislike { // from dislike to like , + 2
		q = misc.CQL.Query(`UPDATE comment_counter SET likes=likes+2 WHERE id=?`, postID)
	} else { // from normal to like, + 1
		q = misc.CQL.Query(`UPDATE comment_counter SET likes=likes+1 WHERE id=?`, postID)
	}

	err = q.Exec()
	if err != nil {
		misc.Log.Warn("access database error", zap.Error(err), zap.String("query", q.String()))
	}

	return c.JSON(http.StatusOK, misc.HTTPResp{})
}

// CommentDislike indicates that a user dislike a Comment
func CommentDislike(c echo.Context) error {
	postID := c.FormValue("id")
	if postID == "" {
		return c.JSON(http.StatusBadRequest, misc.HTTPResp{
			ErrCode: ecode.ParamInvalid,
			Message: ecode.ParamInvalidMsg,
		})
	}

	sess := session.Get(c)

	// check whether you already liked this comment
	status, err := commentLikeStatus(postID, sess.ID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, misc.HTTPResp{
			ErrCode: ecode.DatabaseError,
			Message: ecode.CommonErrorMsg,
		})
	}

	if status == OpCommentDislike {
		err = commentLike(postID, sess.ID, OpCommentDislike, OpDelete)
	} else {
		err = commentLike(postID, sess.ID, OpCommentDislike, OpUpdate)
	}

	if err != nil {
		return c.JSON(http.StatusInternalServerError, misc.HTTPResp{
			ErrCode: ecode.DatabaseError,
			Message: ecode.CommonErrorMsg,
		})
	}

	var q *gocql.Query
	if status == OpCommentLike { // from like to dislike, -2
		q = misc.CQL.Query(`UPDATE comment_counter SET likes=likes-2 WHERE id=?`, postID)
	} else if status == OpCommentDislike { // from dislike to normal + 1
		q = misc.CQL.Query(`UPDATE comment_counter SET likes=likes+1 WHERE id=?`, postID)
	} else { // from normal to dislike -1
		q = misc.CQL.Query(`UPDATE comment_counter SET likes=likes-1 WHERE id=?`, postID)
	}

	err = q.Exec()
	if err != nil {
		misc.Log.Warn("access database error", zap.Error(err), zap.String("query", q.String()))
	}

	return c.JSON(http.StatusOK, misc.HTTPResp{})
}

func commentLikeStatus(id string, uid string) (int, error) {
	var tp int
	q := misc.CQL.Query(`SELECT type FROM comment_like WHERE uid=? and comment_id=?`, uid, id)
	err := q.Scan(&tp)
	if err != nil {
		if err.Error() == misc.CQLNotFound {
			return 0, nil
		}
		misc.Log.Warn("access database error", zap.Error(err), zap.String("query", q.String()))
		return 0, err
	}
	return tp, nil
}

// postLike is the action that a user click like or dislike on a post/comment
func commentLike(id string, uid string, tp int, op int) error {
	var q *gocql.Query
	switch op {
	case OpUpdate:
		q = misc.CQL.Query(`UPDATE comment_like SET type=?,input_date=? WHERE uid=? and comment_id=?`, tp, time.Now().Unix(), uid, id)
	case OpDelete:
		q = misc.CQL.Query(`DELETE FROM comment_like WHERE uid=? and comment_id=?`, uid, id)
	}

	err := q.Exec()
	if err != nil {
		misc.Log.Warn("access database error", zap.Error(err), zap.String("query", q.String()))
		return err
	}

	return nil
}
