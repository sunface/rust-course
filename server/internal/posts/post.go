package posts

import (
	"database/sql"
	"fmt"
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
	rows, err := db.Conn.Query("select id,slug,title,url,cover,brief,created,updated from posts where creator=?", uid)
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
		err := rows.Scan(&ar.ID, &ar.Slug, &ar.Title, &ar.URL, &ar.Cover, &ar.Brief, &ar.Created, &ar.Updated)
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

func SubmitPost(c *gin.Context) (map[string]string, *e.Error) {
	user := session.CurrentUser(c)

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

	if post.ID == 0 {
		//create
		res, err := db.Conn.Exec("INSERT INTO posts (creator,slug, title, md, url, cover, brief, created, updated) VALUES(?,?,?,?,?,?,?,?,?)",
			user.ID, post.Slug, post.Title, md, post.URL, post.Cover, post.Brief, now, now)
		if err != nil {
			logger.Warn("submit post error", "error", err)
			return nil, e.New(http.StatusInternalServerError, e.Internal)
		}

		post.ID, _ = res.LastInsertId()
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
	// "tag_post": `CREATE TABLE IF NOT EXISTS tag_post (
	// 	tag_id           INTEGER,
	// 	post_id          INTEGER
	// );
	_, err = db.Conn.Exec("DELETE FROM tag_post WHERE post_id=?", post.ID)
	if err != nil {
		logger.Warn("delete post tags error", "error", err)
	}

	for _, tag := range post.Tags {
		_, err = db.Conn.Exec("INSERT INTO tag_post (tag_id,post_id) VALUES (?,?)", tag, post.ID)
		if err != nil {
			logger.Warn("add post tag error", "error", err)
		}
	}

	return map[string]string{
		"username": user.Username,
		"slug":     post.Slug,
	}, nil
}

func DeletePost(id int64) *e.Error {
	_, err := db.Conn.Exec("DELETE FROM posts WHERE id=?", id)
	if err != nil {
		logger.Warn("delete post error", "error", err)
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	return nil
}

func GetPost(id int64, slug string) (*models.Post, *e.Error) {
	ar := &models.Post{}
	var rawmd []byte
	err := db.Conn.QueryRow("select id,slug,title,md,url,cover,brief,creator,like_count,created,updated from posts where id=? or slug=?", id, slug).Scan(
		&ar.ID, &ar.Slug, &ar.Title, &rawmd, &ar.URL, &ar.Cover, &ar.Brief, &ar.CreatorID, &ar.Likes, &ar.Created, &ar.Updated,
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
	tags := make([]int64, 0)
	rows, err := db.Conn.Query("SELECT tag_id FROM tag_post WHERE post_id=?", id)
	if err != nil && err != sql.ErrNoRows {
		return nil, e.New(http.StatusInternalServerError, e.Internal)
	}
	for rows.Next() {
		var tag int64
		err = rows.Scan(&tag)
		tags = append(tags, tag)
	}
	ar.Tags = tags

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

func postExist(id int64) bool {
	var nid int64
	err := db.Conn.QueryRow("SELECT id from posts WHERE id=?", id).Scan(&nid)
	if err != nil {
		logger.Warn("query post error", "error", err)
		return false
	}

	if nid == 0 {
		return false
	}

	return true
}

//slug有三个规则
// 1. 长度不能超过127
// 2. 每次title更新，都要重新生成slug
// 3. 单个用户下的slug不能重复，如果已经存在，需要加上-1这种字符
func setSlug(creator int64, post *models.Post) error {
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
