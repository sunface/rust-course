package post

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/gocql/gocql"
	"github.com/labstack/echo"
	"github.com/thinkindev/im.dev/internal/ecode"
	"github.com/thinkindev/im.dev/internal/misc"
	"github.com/thinkindev/im.dev/internal/user"
	"github.com/thinkindev/im.dev/internal/utils"
	"go.uber.org/zap"
)

// ArContent represent article content
type ArContent struct {
	ID         string   `json:"id"`
	Title      string   `json:"title"`
	Tags       []string `json:"tags"`
	MD         string   `json:"md"`
	Render     string   `json:"render"`
	Lang       string   `json:"lang"`
	Status     int      `json:"status"`
	CoverImage string   `json:"cover_image"`
}

// NewArticle create a new article
func NewArticle(c echo.Context) error {
	opType, _ := strconv.Atoi(c.FormValue("type"))
	if opType != PostDraft && opType != PostPublished {
		return c.JSON(http.StatusBadRequest, misc.HTTPResp{
			ErrCode: ecode.ParamInvalid,
			Message: ecode.ParamInvalidMsg,
		})
	}

	content := c.FormValue("content")
	ar := &ArContent{}
	err := json.Unmarshal([]byte(content), &ar)
	if err != nil {
		return c.JSON(http.StatusBadRequest, misc.HTTPResp{
			ErrCode: ecode.ParamInvalid,
			Message: ecode.ParamInvalidMsg,
		})
	}

	sess := user.GetSession(c)

	// generate id for article
	ar.ID = misc.GenID()

	// modify render
	ar.Render = modify(ar.Render)

	words := countWords(ar.MD)
	var q *gocql.Query
	if opType == PostDraft {
		q = misc.CQL.Query(`INSERT INTO article (id,uid,title,tags,md,render,words,status,edit_date,lang,cover_image) 
		VALUES (?,?,?,?,?,?,?,?,?,?,?)`, ar.ID, sess.ID, ar.Title, ar.Tags, ar.MD, ar.Render, words, PostDraft, time.Now().Unix(), ar.Lang, ar.CoverImage)
	} else { // publish
		q = misc.CQL.Query(`INSERT INTO article (id,uid,title,tags,md,render,words,status,publish_date,edit_date,lang,cover_image) 
		VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`, ar.ID, sess.ID, ar.Title, ar.Tags, ar.MD, ar.Render, words, PostPublished, time.Now().Unix(), 0, ar.Lang, ar.CoverImage)
	}
	err = q.Exec()
	if err != nil {
		misc.Log.Warn("access database error", zap.Error(err))
		return c.JSON(http.StatusInternalServerError, misc.HTTPResp{
			ErrCode: ecode.DatabaseError,
			Message: ecode.CommonErrorMsg,
		})
	}

	saveTags(ar.ID, ar.Tags)
	return c.JSON(http.StatusOK, misc.HTTPResp{
		Data: sess.Name + "/" + ar.ID,
	})
}

// ArticleDetail contains detail data of article
type ArticleDetail struct {
	ID          string   `json:"id"`
	UID         string   `json:"uid"`
	Title       string   `json:"title"`
	Tags        []string `json:"tags"`
	Render      string   `json:"render"`
	Status      int      `json:"status"`
	PublishDate string   `json:"publish_date"`
	EditDate    string   `json:"edit_date"`
	Lang        string   `json:"lang"`
	Words       int      `json:"words"`
	Likes       int      `json:"likes"` // all likes of this article
	Liked       bool     `json:"liked"` // current user liked this article
	CoverImage  string   `json:"cover_image"`
	pubDate     int64
	editDate    int64
}

// GetArticleDetail return detail data of the article
func GetArticleDetail(c echo.Context) error {
	arID := c.FormValue("article_id")
	if arID == "" {
		return c.JSON(http.StatusBadRequest, misc.HTTPResp{
			ErrCode: ecode.ParamInvalid,
			Message: ecode.ParamInvalidMsg,
		})
	}

	detail := &ArticleDetail{ID: arID}
	err := misc.CQL.Query(`SELECT uid,title,tags,render,words,status,publish_date,edit_date,lang,cover_image FROM article WHERE id=?`, arID).Scan(
		&detail.UID, &detail.Title, &detail.Tags, &detail.Render, &detail.Words, &detail.Status, &detail.pubDate, &detail.editDate, &detail.Lang, &detail.CoverImage,
	)
	if err != nil {
		if err.Error() == misc.CQLNotFound {
			return c.JSON(http.StatusNotFound, misc.HTTPResp{
				ErrCode: ecode.ArticleNotFound,
				Message: ecode.ArticleNotFoundMsg,
			})
		}
		misc.Log.Warn("access database error", zap.Error(err))
		return c.JSON(http.StatusInternalServerError, misc.HTTPResp{
			ErrCode: ecode.DatabaseError,
			Message: ecode.CommonErrorMsg,
		})
	}

	if detail.pubDate != 0 {
		detail.PublishDate = utils.Time2EnglishString(time.Unix(detail.pubDate, 0))
	}
	if detail.editDate != 0 {
		detail.EditDate = utils.Time2EnglishString(time.Unix(detail.editDate, 0))
	}

	// if user signin, get his liked about this article
	sess := user.GetSession(c)
	if sess != nil {
		var date int64
		q := misc.CQL.Query("SELECT input_date FROM post_like WHERE post_id=? and uid=?", arID, sess.ID)
		q.Scan(&date)
		if date != 0 {
			detail.Liked = true
		}
	}

	// get how many user like this article
	misc.CQL.Query("SELECT likes FROM post_counter WHERE id=?", arID).Scan(&detail.Likes)

	return c.JSON(http.StatusOK, misc.HTTPResp{
		Data: detail,
	})
}

// BeforeEditAr deal some pre-things before editing article
func BeforeEditAr(c echo.Context) error {
	arID := c.FormValue("article_id")
	if arID == "" {
		return c.JSON(http.StatusBadRequest, misc.HTTPResp{
			ErrCode: ecode.ParamInvalid,
			Message: ecode.ParamInvalidMsg,
		})
	}

	var uid, title, md, lang string
	var tags []string
	var status int
	err := misc.CQL.Query(`SELECT uid,title,tags,md,lang,status FROM article WHERE id=?`, arID).Scan(
		&uid, &title, &tags, &md, &lang, &status,
	)
	if err != nil {
		if err.Error() == misc.CQLNotFound {
			return c.JSON(http.StatusNotFound, misc.HTTPResp{
				ErrCode: ecode.ArticleNotFound,
				Message: ecode.ArticleNotFoundMsg,
			})
		}
		misc.Log.Warn("access database error", zap.Error(err))
		return c.JSON(http.StatusInternalServerError, misc.HTTPResp{
			ErrCode: ecode.DatabaseError,
			Message: ecode.CommonErrorMsg,
		})
	}

	sess := user.GetSession(c)

	// check whether user has permission to do so
	if uid != sess.ID {
		return c.JSON(http.StatusInternalServerError, misc.HTTPResp{
			ErrCode: ecode.NoPermission,
			Message: ecode.NoPermissionMsg,
		})
	}

	ar := &ArContent{
		ID:     arID,
		Title:  title,
		MD:     md,
		Tags:   tags,
		Lang:   lang,
		Status: status,
	}

	return c.JSON(http.StatusOK, misc.HTTPResp{
		Data: ar,
	})
}

// SaveArticleChanges save changes when edit article
func SaveArticleChanges(c echo.Context) error {
	content := c.FormValue("content")
	ar := &ArContent{}
	err := json.Unmarshal([]byte(content), &ar)
	if err != nil {
		return c.JSON(http.StatusBadRequest, misc.HTTPResp{
			ErrCode: ecode.ParamInvalid,
			Message: ecode.ParamInvalidMsg,
		})
	}

	// check the article is exist and user has permission
	var uid string
	err = misc.CQL.Query(`SELECT uid FROM article WHERE id=?`, ar.ID).Scan(&uid)
	if err != nil {
		if err.Error() == misc.CQLNotFound {
			return c.JSON(http.StatusNotFound, misc.HTTPResp{
				ErrCode: ecode.ArticleNotFound,
				Message: ecode.ArticleNotFoundMsg,
			})
		}
		misc.Log.Warn("access database error", zap.Error(err))
		return c.JSON(http.StatusInternalServerError, misc.HTTPResp{
			ErrCode: ecode.DatabaseError,
			Message: ecode.CommonErrorMsg,
		})
	}
	sess := user.GetSession(c)
	if sess.ID != uid {
		return c.JSON(http.StatusInternalServerError, misc.HTTPResp{
			ErrCode: ecode.NoPermission,
			Message: ecode.NoPermissionMsg,
		})
	}

	// modify render
	ar.Render = modify(ar.Render)

	words := countWords(ar.MD)
	err = misc.CQL.Query(`UPDATE  article SET title=?,tags=?,md=?,render=?,words=?,edit_date=?,lang=? WHERE id=?`,
		ar.Title, ar.Tags, ar.MD, ar.Render, words, time.Now().Unix(), ar.Lang, ar.ID).Exec()
	if err != nil {
		misc.Log.Warn("access database error", zap.Error(err))
		return c.JSON(http.StatusInternalServerError, misc.HTTPResp{
			ErrCode: ecode.DatabaseError,
			Message: ecode.CommonErrorMsg,
		})
	}

	saveTags(ar.ID, ar.Tags)
	return c.JSON(http.StatusOK, misc.HTTPResp{
		Data: sess.Name + "/" + ar.ID,
	})
}

func saveTags(arID string, tags []string) {
	for _, tag := range tags {
		err := misc.CQL.Query(`INSERT INTO tags (name,article_id) VALUES (?,?)`, tag, arID).Exec()
		if err != nil {
			misc.Log.Warn("access database error", zap.Error(err))
		}
	}
}

// ArticleLike means a user like this article
func ArticleLike(c echo.Context) error {
	id := c.FormValue("id")
	tp := c.FormValue("type")
	if id == "" || (tp != "1" && tp != "2") {
		return c.JSON(http.StatusBadRequest, misc.HTTPResp{
			ErrCode: ecode.ParamInvalid,
			Message: ecode.ParamInvalidMsg,
		})
	}

	sess := user.GetSession(c)

	// check already liked
	var pid string
	q := misc.CQL.Query("SELECT post_id FROM post_like WHERE post_id=? and uid=?", id, sess.ID)
	err := q.Scan(&pid)
	if err != nil {
		if err.Error() != misc.CQLNotFound {
			misc.Log.Warn("access database error", zap.Error(err))
			return c.JSON(http.StatusInternalServerError, misc.HTTPResp{
				ErrCode: ecode.DatabaseError,
				Message: ecode.CommonErrorMsg,
			})
		}
	}

	if tp == "1" { // like
		if pid == id {
			misc.Log.Info("someone is try to attack imdev server", zap.String("remote_ip", c.RealIP()))
			return c.JSON(http.StatusInternalServerError, misc.HTTPResp{
				ErrCode: ecode.DatabaseError,
				Message: ecode.CommonErrorMsg,
			})
		}

		q = misc.CQL.Query("INSERT INTO post_like (post_id,uid,type,input_date) VALUES (?,?,?,?)",
			id, sess.ID, OpPostLike, time.Now().Unix())
		err = q.Exec()
		if err != nil {
			misc.Log.Warn("access database error", zap.Error(err))
			return c.JSON(http.StatusInternalServerError, misc.HTTPResp{
				ErrCode: ecode.DatabaseError,
				Message: ecode.CommonErrorMsg,
			})
		}

		q = misc.CQL.Query("UPDATE post_counter SET likes=likes + 1 WHERE id=?", id)
		err = q.Exec()
		if err != nil {
			misc.Log.Warn("access database error", zap.Error(err))
		}
	} else { // cancel like
		if pid != id {
			misc.Log.Info("someone is try to attack imdev server", zap.String("remote_ip", c.RealIP()))
			return c.JSON(http.StatusInternalServerError, misc.HTTPResp{
				ErrCode: ecode.DatabaseError,
				Message: ecode.CommonErrorMsg,
			})
		}

		q = misc.CQL.Query("DELETE FROM post_like WHERE post_id=? and uid=?",
			id, sess.ID)
		err = q.Exec()
		if err != nil {
			misc.Log.Warn("access database error", zap.Error(err))
			return c.JSON(http.StatusInternalServerError, misc.HTTPResp{
				ErrCode: ecode.DatabaseError,
				Message: ecode.CommonErrorMsg,
			})
		}

		q = misc.CQL.Query("UPDATE post_counter SET likes=likes - 1 WHERE id=?", id)
		err = q.Exec()
		if err != nil {
			misc.Log.Warn("access database error", zap.Error(err))
		}
	}

	return c.JSON(http.StatusOK, misc.HTTPResp{})
}
