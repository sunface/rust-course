package posts

import (
	"errors"
	"sort"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/asaskevich/govalidator"
	"github.com/gin-gonic/gin"
	"github.com/imdotdev/im.dev/server/internal/session"
	"github.com/imdotdev/im.dev/server/pkg/config"
	"github.com/imdotdev/im.dev/server/pkg/db"
	"github.com/imdotdev/im.dev/server/pkg/errcode"
	"github.com/imdotdev/im.dev/server/pkg/models"
)

func UserArticles(uid int64) (models.Articles, error) {
	ars := make(models.Articles, 0)
	rows, err := db.Conn.Query("select id,title,url,cover,brief,created,updated from articles where creator=?", uid)
	if err != nil {
		return ars, err
	}

	creator := &models.UserSimple{ID: uid}
	creator.Query()
	for rows.Next() {
		ar := &models.Article{}
		err := rows.Scan(&ar.ID, &ar.Title, &ar.URL, &ar.Cover, &ar.Brief, &ar.Created, &ar.Updated)
		if err != nil {
			logger.Warn("scan articles error", "error", err)
			continue
		}

		ar.Creator = creator
		ars = append(ars, ar)
	}

	sort.Sort(ars)
	return ars, nil
}

func PostArticle(c *gin.Context) error {
	user := session.CurrentUser(c)
	if !user.Role.IsEditor() {
		return errors.New(errcode.NoEditorPermission)
	}

	ar := &models.Article{}
	err := c.Bind(&ar)
	if err != nil {
		return err
	}

	if strings.TrimSpace(ar.Title) == "" || utf8.RuneCountInString(ar.Brief) > config.Data.Posts.BriefMaxLen || !govalidator.IsURL(ar.URL) || !govalidator.IsURL(ar.Cover) {
		return errors.New(errcode.ParamInvalid)
	}

	now := time.Now()
	if ar.ID == 0 {
		//create
		_, err = db.Conn.Exec("INSERT INTO articles (creator, title, url, cover, brief, created, updated) VALUES(?,?,?,?,?,?,?)",
			user.ID, ar.Title, ar.URL, ar.Cover, ar.Brief, now, now)
		return err
	}

	_, err = db.Conn.Exec("UPDATE articles SET title=?, url=?, cover=?, brief=?, updated=? WHERE id=?",
		ar.Title, ar.URL, ar.Cover, ar.Brief, now, ar.ID)
	return err
}

func DeleteArticle(c *gin.Context) error {
	user := session.CurrentUser(c)
	if !user.Role.IsEditor() {
		return errors.New(errcode.NoEditorPermission)
	}

	id := c.Param("id")
	_, err := db.Conn.Exec("DELETE FROM articles WHERE id=?", id)
	return err
}
