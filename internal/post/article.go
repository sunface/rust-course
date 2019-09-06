package post

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/labstack/echo"
	"github.com/thinkindev/im.dev/internal/ecode"
	"github.com/thinkindev/im.dev/internal/misc"
	"github.com/thinkindev/im.dev/internal/session"
	"github.com/thinkindev/im.dev/internal/utils"
	"go.uber.org/zap"
)

// ArContent represent article content
type ArContent struct {
	ID     string   `json:"id"`
	Title  string   `json:"title"`
	Tags   []string `json:"tags"`
	MD     string   `json:"md"`
	Render string   `json:"render"`
	Lang   string   `json:"lang"`
	Status int      `json:"status"`
}

// NewArticle create a new article
func NewArticle(c echo.Context) error {
	opType := c.FormValue("type")
	if opType != "1" && opType != "2" {
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

	sess := session.Get(c)

	// generate id for article
	ar.ID = misc.GenID()

	// modify render
	ar.Render = modify(ar.Render)

	err = misc.CQL.Query(`INSERT INTO article (id,uid,title,tags,md,render,status,edit_date,lang) 
	VALUES (?,?,?,?,?,?,?,?,?)`, ar.ID, sess.ID, ar.Title, ar.Tags, ar.MD, ar.Render, opType, time.Now().Unix(), ar.Lang).Exec()
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
	err := misc.CQL.Query(`SELECT uid,title,tags,render,status,publish_date,edit_date,lang FROM article WHERE id=?`, arID).Scan(
		&detail.UID, &detail.Title, &detail.Tags, &detail.Render, &detail.Status, &detail.pubDate, &detail.editDate, &detail.Lang,
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
		detail.PublishDate = utils.Time2ReadableString(time.Unix(detail.pubDate, 0))
	}
	if detail.editDate != 0 {
		detail.EditDate = utils.Time2ReadableString(time.Unix(detail.editDate, 0))
	}
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

	sess := session.Get(c)

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
	sess := session.Get(c)
	if sess.ID != uid {
		return c.JSON(http.StatusInternalServerError, misc.HTTPResp{
			ErrCode: ecode.NoPermission,
			Message: ecode.NoPermissionMsg,
		})
	}

	// modify render
	ar.Render = modify(ar.Render)

	err = misc.CQL.Query(`UPDATE  article SET title=?,tags=?,md=?,render=?,edit_date=?,lang=? WHERE id=?`,
		ar.Title, ar.Tags, ar.MD, ar.Render, time.Now().Unix(), ar.Lang, ar.ID).Exec()
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
