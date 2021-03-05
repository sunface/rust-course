package story

import (
	"database/sql"
	"fmt"
	"net/http"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/asaskevich/govalidator"
	"github.com/gin-gonic/gin"
	"github.com/imdotdev/im.dev/server/internal/tags"
	"github.com/imdotdev/im.dev/server/internal/user"
	"github.com/imdotdev/im.dev/server/pkg/config"
	"github.com/imdotdev/im.dev/server/pkg/db"
	"github.com/imdotdev/im.dev/server/pkg/e"
	"github.com/imdotdev/im.dev/server/pkg/models"
	"github.com/imdotdev/im.dev/server/pkg/utils"
)

func SubmitPost(c *gin.Context) (map[string]string, *e.Error) {
	user := user.CurrentUser(c)

	post := &models.Post{}
	err := c.Bind(&post)
	if err != nil {
		return nil, e.New(http.StatusBadRequest, e.ParamInvalid)
	}

	if strings.TrimSpace(post.Title) == "" || utf8.RuneCountInString(post.Brief) > config.Data.Posts.BriefMaxLen {
		return nil, e.New(http.StatusBadRequest, "标题格式不合法")
	}

	if strings.TrimSpace(post.URL) != "" && !govalidator.IsURL(post.URL) {
		return nil, e.New(http.StatusBadRequest, "URL格式不正确")
	}

	if strings.TrimSpace(post.Cover) != "" && !govalidator.IsURL(post.Cover) {
		return nil, e.New(http.StatusBadRequest, "图片链接格式不正确")
	}

	isExternal := true
	if strings.TrimSpace(post.URL) == "" {
		isExternal = false
	}

	if isExternal {
		// internal post, need creator role
		if !user.Role.IsCreator() {
			return nil, e.New(http.StatusForbidden, e.NoEditorPermission)
		}
	} else {
		// external post, need editor role
		if !user.Role.IsEditor() {
			return nil, e.New(http.StatusForbidden, e.NoEditorPermission)
		}

		if len(post.Md) <= config.Data.Posts.BriefMaxLen {
			post.Brief = post.Md
		} else {
			post.Brief = string([]rune(post.Md)[:config.Data.Posts.BriefMaxLen])
		}
	}

	now := time.Now()

	md := utils.Compress(post.Md)

	setSlug(user.ID, post)

	if post.ID == "" {
		post.ID = utils.GenID(models.IDTypePost)
		//create
		_, err := db.Conn.Exec("INSERT INTO posts (id,creator,slug, title, md, url, cover, brief,status, created, updated) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
			post.ID, user.ID, post.Slug, post.Title, md, post.URL, post.Cover, post.Brief, models.StatusPublished, now, now)
		if err != nil {
			logger.Warn("submit post error", "error", err)
			return nil, e.New(http.StatusInternalServerError, e.Internal)
		}
	} else {
		// 只有创建者自己才能更新内容
		creator, _ := GetPostCreator(post.ID)
		if creator != user.ID {
			return nil, e.New(http.StatusForbidden, e.NoEditorPermission)
		}

		_, err = db.Conn.Exec("UPDATE posts SET slug=?, title=?, md=?, url=?, cover=?, brief=?, updated=? WHERE id=?",
			post.Slug, post.Title, md, post.URL, post.Cover, post.Brief, now, post.ID)
		if err != nil {
			logger.Warn("upate post error", "error", err)
			return nil, e.New(http.StatusInternalServerError, e.Internal)
		}
	}

	//update tags
	err = tags.UpdateTargetTags(post.ID, post.Tags)
	if err != nil {
		logger.Warn("upate tags error", "error", err)
		return nil, e.New(http.StatusInternalServerError, e.Internal)
	}

	return map[string]string{
		"username": user.Username,
		"id":       post.ID,
	}, nil
}

func DeletePost(id string) *e.Error {
	_, err := db.Conn.Exec("DELETE FROM posts WHERE id=?", id)
	if err != nil {
		logger.Warn("delete post error", "error", err)
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	// delete tags
	err = tags.DeleteTargetTags(id)
	if err != nil {
		logger.Warn("delete post tags error", "error", err)
	}

	return nil
}

func GetPost(id string, slug string) (*models.Post, *e.Error) {
	ar := &models.Post{}
	var rawmd []byte
	err := db.Conn.QueryRow("select id,slug,title,md,url,cover,brief,creator,likes,views,created,updated from posts where id=? or slug=?", id, slug).Scan(
		&ar.ID, &ar.Slug, &ar.Title, &rawmd, &ar.URL, &ar.Cover, &ar.Brief, &ar.CreatorID, &ar.Likes, &ar.Views, &ar.Created, &ar.Updated,
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

	// get tags
	t, rawTags, err := tags.GetTargetTags(ar.ID)
	if err != nil {
		return nil, e.New(http.StatusInternalServerError, e.Internal)
	}
	ar.Tags = t
	ar.RawTags = rawTags

	// add views count
	_, err = db.Conn.Exec("UPDATE posts SET views=? WHERE id=?", ar.Views+1, ar.ID)
	if err != nil {
		logger.Warn("update post view count error", "error", err)
	}

	//get bookmared
	return ar, nil
}

func GetPostCreator(id string) (string, *e.Error) {
	var uid string
	err := db.Conn.QueryRow("SELECT creator FROM posts WHERE id=?", id).Scan(&uid)
	if err != nil {
		if err == sql.ErrNoRows {
			return "", e.New(http.StatusNotFound, e.NotFound)
		}
		logger.Warn("get post creator error", "error", err)
		return "", e.New(http.StatusInternalServerError, e.Internal)
	}

	return uid, nil
}

func postExist(id string) bool {
	var nid string
	err := db.Conn.QueryRow("SELECT id from posts WHERE id=?", id).Scan(&nid)
	if err != nil {
		logger.Warn("query post error", "error", err)
		return false
	}

	if nid != id {
		return false
	}

	return true
}

//slug有三个规则
// 1. 长度不能超过127
// 2. 每次title更新，都要重新生成slug
// 3. 单个用户下的slug不能重复，如果已经存在，需要加上-1这种字符
func setSlug(creator string, post *models.Post) error {
	slug := utils.Slugify(post.Title)
	if len(slug) > 100 {
		slug = slug[:100]
	}

	count := 0
	err := db.Conn.QueryRow("SELECT count(*) FROM posts WHERE creator=? and title=?", creator, post.Title).Scan(&count)
	if err != nil {
		logger.Warn("count slug error", "error", err)
		return err
	}

	if count == 0 {
		post.Slug = slug
	} else {
		post.Slug = fmt.Sprintf("%s-%d", slug, count)
	}

	return nil
}
