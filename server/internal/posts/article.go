package posts

import (
	"database/sql"
	"net/http"
	"sort"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/asaskevich/govalidator"
	"github.com/gin-gonic/gin"
	"github.com/imdotdev/im.dev/server/internal/session"
	"github.com/imdotdev/im.dev/server/pkg/config"
	"github.com/imdotdev/im.dev/server/pkg/db"
	"github.com/imdotdev/im.dev/server/pkg/e"
	"github.com/imdotdev/im.dev/server/pkg/models"
	"github.com/imdotdev/im.dev/server/pkg/utils"
)

func UserPosts(uid int64) (models.Posts, *e.Error) {
	ars := make(models.Posts, 0)
	rows, err := db.Conn.Query("select id,title,url,cover,brief,created,updated from posts where creator=?", uid)
	if err != nil {
		if err == sql.ErrNoRows {
			return ars, e.New(http.StatusNotFound, e.NotFound)
		}
		logger.Warn("get user posts error", "error", err)
		return ars, e.New(http.StatusInternalServerError, e.Internal)
	}

	creator := &models.UserSimple{ID: uid}
	creator.Query()
	for rows.Next() {
		ar := &models.Post{}
		err := rows.Scan(&ar.ID, &ar.Title, &ar.URL, &ar.Cover, &ar.Brief, &ar.Created, &ar.Updated)
		if err != nil {
			logger.Warn("scan post error", "error", err)
			continue
		}

		ar.Creator = creator
		ars = append(ars, ar)
	}

	sort.Sort(ars)
	return ars, nil
}

func SubmitPost(c *gin.Context) *e.Error {
	user := session.CurrentUser(c)
	if !user.Role.IsEditor() {
		return e.New(http.StatusForbidden, e.NoEditorPermission)
	}

	ar := &models.Post{}
	err := c.Bind(&ar)
	if err != nil {
		return e.New(http.StatusBadRequest, e.ParamInvalid)
	}

	if strings.TrimSpace(ar.Title) == "" || utf8.RuneCountInString(ar.Brief) > config.Data.Posts.BriefMaxLen {
		return e.New(http.StatusBadRequest, e.ParamInvalid)
	}

	if strings.TrimSpace(ar.URL) != "" && !govalidator.IsURL(ar.URL) {
		return e.New(http.StatusBadRequest, e.ParamInvalid)
	}

	if strings.TrimSpace(ar.Cover) != "" && !govalidator.IsURL(ar.Cover) {
		return e.New(http.StatusBadRequest, e.ParamInvalid)
	}

	now := time.Now()

	md := utils.Compress(ar.Md)
	if ar.ID == 0 {
		//create
		_, err = db.Conn.Exec("INSERT INTO posts (creator, title, md, url, cover, brief, created, updated) VALUES(?,?,?,?,?,?,?,?)",
			user.ID, ar.Title, md, ar.URL, ar.Cover, ar.Brief, now, now)
		if err != nil {
			logger.Warn("submit post error", "error", err)
			return e.New(http.StatusInternalServerError, e.Internal)
		}
	} else {
		_, err = db.Conn.Exec("UPDATE posts SET title=?, md=?, url=?, cover=?, brief=?, updated=? WHERE id=?",
			ar.Title, md, ar.URL, ar.Cover, ar.Brief, now, ar.ID)
		if err != nil {
			logger.Warn("upate post error", "error", err)
			return e.New(http.StatusInternalServerError, e.Internal)
		}
	}

	return nil
}

func DeletePost(id int64) *e.Error {
	_, err := db.Conn.Exec("DELETE FROM posts WHERE id=?", id)
	if err != nil {
		logger.Warn("delete post error", "error", err)
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	return nil
}

func GetPost(id int64) (*models.Post, *e.Error) {
	ar := &models.Post{}
	var rawmd []byte
	err := db.Conn.QueryRow("select id,title,md,url,cover,brief,creator,created,updated from posts where id=?", id).Scan(
		&ar.ID, &ar.Title, &rawmd, &ar.URL, &ar.Cover, &ar.Brief, &ar.CreatorID, &ar.Created, &ar.Updated,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, e.New(http.StatusNotFound, e.NotFound)
		}
		logger.Warn("get post error", "error", err)
		return nil, e.New(http.StatusInternalServerError, e.Internal)
	}

	md, _ := utils.Uncompress(rawmd)
	ar.Md = string(md)
	ar.Creator = &models.UserSimple{ID: ar.CreatorID}
	err = ar.Creator.Query()

	return ar, nil
}

func GetPostCreator(id int64) (int64, *e.Error) {
	var uid int64
	err := db.Conn.QueryRow("SELECT creator FROM posts WHERE id=?", id).Scan(&uid)
	if err != nil {
		if err == sql.ErrNoRows {
			return 0, e.New(http.StatusNotFound, e.NotFound)
		}
		logger.Warn("get post creator error", "error", err)
		return 0, e.New(http.StatusInternalServerError, e.Internal)
	}

	return uid, nil
}
