package story

import (
	"database/sql"
	"net/http"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/asaskevich/govalidator"
	"github.com/gin-gonic/gin"
	"github.com/imdotdev/im.dev/server/internal/interaction"
	"github.com/imdotdev/im.dev/server/internal/notification"
	"github.com/imdotdev/im.dev/server/internal/org"
	"github.com/imdotdev/im.dev/server/internal/tags"
	"github.com/imdotdev/im.dev/server/internal/top"
	"github.com/imdotdev/im.dev/server/internal/user"
	"github.com/imdotdev/im.dev/server/pkg/config"
	"github.com/imdotdev/im.dev/server/pkg/db"
	"github.com/imdotdev/im.dev/server/pkg/e"
	"github.com/imdotdev/im.dev/server/pkg/models"
	"github.com/imdotdev/im.dev/server/pkg/utils"
)

func SubmitStory(c *gin.Context) (map[string]string, *e.Error) {
	user := user.CurrentUser(c)

	post := &models.Story{}
	err := c.Bind(&post)
	if err != nil {
		return nil, e.New(http.StatusBadRequest, e.ParamInvalid)
	}

	if !models.ValidStoryIDType(post.Type) {
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
		// external post, need editor role
		if !user.Role.IsEditor() {
			return nil, e.New(http.StatusForbidden, e.NoEditorPermission)
		}
	} else {
		// internal post, need creator role
		if !user.Role.IsCreator() {
			return nil, e.New(http.StatusForbidden, e.NoEditorPermission)
		}

		if post.Type == models.IDTypePost {
			if len(post.Md) <= config.Data.Posts.BriefMaxLen {
				post.Brief = post.Md
			} else {
				post.Brief = string([]rune(post.Md)[:config.Data.Posts.BriefMaxLen])
			}
		}
	}

	post.CreatorID = user.ID
	// check user is in org exist
	if post.OwnerID != "" {
		if models.GetIDType(post.ID) == models.IDTypeSeries {
			// 组织的series所有权和创作权都归组织所有
			post.CreatorID = post.OwnerID
			if !org.IsOrgAdmin(user.ID, post.OwnerID) {
				return nil, e.New(http.StatusForbidden, e.NoAdminPermission)
			}
		} else {
			if !org.UserInOrg(user.ID, post.OwnerID) {
				return nil, e.New(http.StatusForbidden, e.NoEditorPermission)
			}
		}
	}

	now := time.Now()

	md := utils.Compress(post.Md)

	setSlug(user.ID, post)

	exist := models.IdExist(post.ID)
	if !exist {
		if post.ID == "" {
			post.ID = utils.GenID(post.Type)
		}

		post.Created = now
		//create
		_, err := db.Conn.Exec("INSERT INTO story (id,type,creator,owner,slug, title, md, url, cover, brief,status, created, updated) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)",
			post.ID, post.Type, post.CreatorID, post.OwnerID, post.Slug, post.Title, md, post.URL, post.Cover, post.Brief, models.StatusPublished, post.Created, post.Created)
		if err != nil {
			logger.Warn("submit post error", "error", err)
			return nil, e.New(http.StatusInternalServerError, e.Internal)
		}

	} else {
		post.Updated = now
		// 只有创建者自己才能更新内容
		creator, _ := GetPostCreator(post.ID)
		if creator != post.CreatorID {
			return nil, e.New(http.StatusForbidden, e.NoEditorPermission)
		}

		if post.Status == models.StatusDraft {
			post.Created = now
			// 首次发布，需要更新创建时间
			_, err = db.Conn.Exec("UPDATE story SET owner=?, slug=?, title=?, md=?, url=?, cover=?, brief=?,created=?,updated=?,status=? WHERE id=?",
				post.OwnerID, post.Slug, post.Title, md, post.URL, post.Cover, post.Brief, post.Created, post.Updated, models.StatusPublished, post.ID)

			// send notification to creator followers and org followers
			followers, err1 := interaction.GetFollowerIDs(post.CreatorID)
			if err1 == nil {
				for _, f := range followers {
					notification.Send(f, "", models.NotificationPublish, post.ID, post.CreatorID)
				}
			}

			if post.OwnerID != "" {
				followers, err1 = interaction.GetFollowerIDs(post.OwnerID)
				if err1 == nil {
					for _, f := range followers {
						notification.Send("", f, models.NotificationPublish, post.ID, post.CreatorID)
					}
				}
			}

		} else {
			_, err = db.Conn.Exec("UPDATE story SET owner=?, slug=?, title=?, md=?, url=?, cover=?, brief=?, updated=? WHERE id=?",
				post.OwnerID, post.Slug, post.Title, md, post.URL, post.Cover, post.Brief, post.Updated, post.ID)
		}

		if err != nil {
			logger.Warn("upate post error", "error", err)
			return nil, e.New(http.StatusInternalServerError, e.Internal)
		}
	}

	//update tags
	top.RemoveTagTop(post.ID)
	err = tags.UpdateTargetTags(user.ID, post.ID, post.Tags, post.Created, post.OwnerID)
	if err != nil {
		logger.Warn("upate tags error", "error", err)
		return nil, e.New(http.StatusInternalServerError, e.Internal)
	}
	likes := interaction.GetLikes(post.ID)
	top.Update(post.ID, likes)

	return map[string]string{
		"username": user.Username,
		"id":       post.ID,
	}, nil
}

func SubmitPostDraft(c *gin.Context) (map[string]string, *e.Error) {
	user := user.CurrentUser(c)

	post := &models.Story{}
	err := c.Bind(&post)
	if err != nil {
		return nil, e.New(http.StatusBadRequest, e.ParamInvalid)
	}

	if !user.Role.IsCreator() {
		return nil, e.New(http.StatusForbidden, e.NoEditorPermission)
	}

	md := utils.Compress(post.Md)

	now := time.Now()

	if len(post.Md) <= config.Data.Posts.BriefMaxLen {
		post.Brief = post.Md
	} else {
		post.Brief = string([]rune(post.Md)[:config.Data.Posts.BriefMaxLen])
	}

	if post.ID == "" {
		post.ID = utils.GenID(models.IDTypePost)
		//create
		_, err := db.Conn.Exec("INSERT INTO story (id,type,creator,slug, title, md, url, cover, brief,status, created, updated) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
			post.ID, models.IDTypePost, user.ID, post.Slug, post.Title, md, post.URL, post.Cover, post.Brief, models.StatusDraft, now, now)
		if err != nil {
			logger.Warn("submit post draft error", "error", err)
			return nil, e.New(http.StatusInternalServerError, e.Internal)
		}
	} else {
		// 只有创建者自己才能更新内容
		creator, _ := GetPostCreator(post.ID)
		if creator != user.ID {
			return nil, e.New(http.StatusForbidden, e.NoEditorPermission)
		}

		_, err = db.Conn.Exec("UPDATE story SET slug=?, title=?, md=?, url=?, cover=?, brief=?, updated=? WHERE id=?",
			post.Slug, post.Title, md, post.URL, post.Cover, post.Brief, now, post.ID)
		if err != nil {
			logger.Warn("upate post draft error", "error", err)
			return nil, e.New(http.StatusInternalServerError, e.Internal)
		}
	}

	return map[string]string{
		"id": post.ID,
	}, nil
}

func DeletePost(id string) *e.Error {
	tx, err := db.Conn.Begin()
	if err != nil {
		logger.Warn("start sql transaction error", "error", err)
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	_, err = tx.Exec("DELETE FROM story WHERE id=?", id)
	if err != nil {
		logger.Warn("delete post error", "error", err)
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	// delete tags
	err = tags.DeleteTargetTags(tx, id)
	if err != nil {
		logger.Warn("delete post tags error", "error", err)
		tx.Rollback()
	}

	tx.Commit()

	top.Update(id, 0)
	return nil
}

func GetStory(id string, slug string) (*models.Story, *e.Error) {
	ar := &models.Story{}
	var rawmd []byte
	err := db.Conn.QueryRow("select id,type,slug,title,md,url,cover,brief,creator,owner,status,created,updated from story where id=?", id).Scan(
		&ar.ID, &ar.Type, &ar.Slug, &ar.Title, &rawmd, &ar.URL, &ar.Cover, &ar.Brief, &ar.CreatorID, &ar.OwnerID, &ar.Status, &ar.Created, &ar.Updated,
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
	if ar.OwnerID != "" {
		ar.Owner = &models.UserSimple{ID: ar.OwnerID}
		err = ar.Owner.Query()
	}

	// get tags
	t, rawTags, err := models.GetTargetTags(ar.ID)
	if err != nil {
		return nil, e.New(http.StatusInternalServerError, e.Internal)
	}
	ar.Tags = t
	ar.RawTags = rawTags

	ar.Likes = interaction.GetLikes(ar.ID)
	return ar, nil
}

func GetPostCreator(id string) (string, *e.Error) {
	var uid string
	err := db.Conn.QueryRow("SELECT creator FROM story WHERE id=?", id).Scan(&uid)
	if err != nil {
		if err == sql.ErrNoRows {
			return "", e.New(http.StatusNotFound, e.NotFound)
		}
		logger.Warn("get post creator error", "error", err)
		return "", e.New(http.StatusInternalServerError, e.Internal)
	}

	return uid, nil
}

func UpdateViews(storyID string) {
	db.Conn.Exec("UPDATE story SET views=views+1 WHERE id=?", storyID)
}

//slug有三个规则
// 1. 长度不能超过127
// 2. 每次title更新，都要重新生成slug
// 3. 单个用户下的slug不能重复，如果已经存在，需要加上-1这种字符
func setSlug(creator string, post *models.Story) error {
	slug := utils.Slugify(post.Title)
	if len(slug) > 100 {
		slug = slug[:100]
	}

	post.Slug = slug

	return nil
}
