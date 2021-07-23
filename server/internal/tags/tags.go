package tags

import (
	"database/sql"
	"net/http"
	"sort"
	"strings"
	"time"

	"github.com/asaskevich/govalidator"
	"github.com/imdotdev/im.dev/server/internal/interaction"
	"github.com/imdotdev/im.dev/server/internal/top"
	"github.com/imdotdev/im.dev/server/pkg/db"
	"github.com/imdotdev/im.dev/server/pkg/e"
	"github.com/imdotdev/im.dev/server/pkg/log"
	"github.com/imdotdev/im.dev/server/pkg/models"
	"github.com/imdotdev/im.dev/server/pkg/utils"
)

var logger = log.RootLogger.New("logger", "tags")

func SubmitTag(tag *models.Tag) *e.Error {
	if strings.TrimSpace(tag.Title) == "" {
		return e.New(http.StatusBadRequest, "title格式不合法")
	}

	if strings.TrimSpace(tag.Name) == "" {
		return e.New(http.StatusBadRequest, "name格式不合法")
	}

	if strings.TrimSpace(tag.Name) == "new" {
		return e.New(http.StatusBadRequest, "name不能为new")
	}

	if strings.TrimSpace(tag.Cover) != "" && !govalidator.IsURL(tag.Cover) {
		return e.New(http.StatusBadRequest, "图片链接格式不正确")
	}

	if strings.TrimSpace(tag.Icon) != "" && !govalidator.IsURL(tag.Icon) {
		return e.New(http.StatusBadRequest, "图片链接格式不正确")
	}

	now := time.Now()

	md := utils.Compress(tag.Md)

	if tag.ID == "" {
		tag.ID = utils.GenID(models.IDTypeTag)
		//create
		_, err := db.Conn.Exec("INSERT INTO tags (id,creator,name, title, md, icon, cover, created, updated) VALUES(?,?,?,?,?,?,?,?,?)",
			tag.ID, tag.Creator, tag.Name, tag.Title, string(md), tag.Icon, tag.Cover, now, now)
		if err != nil {
			if e.IsErrUniqueConstraint(err) {
				return e.New(http.StatusConflict, "同样的Tag name已存在")
			}

			logger.Warn("submit post error", "error", err)
			return e.New(http.StatusInternalServerError, e.Internal)
		}
	} else {
		_, err := db.Conn.Exec("UPDATE tags SET name=?, title=?, md=?, icon=?, cover=?, updated=? WHERE id=?",
			tag.Name, tag.Title, md, tag.Icon, tag.Cover, now, tag.ID)
		if err != nil {
			logger.Warn("upate post error", "error", err)
			return e.New(http.StatusInternalServerError, e.Internal)
		}
	}

	return nil
}

func GetTagsByIDs(ids []string) ([]*models.Tag, *e.Error) {
	tags := make([]*models.Tag, 0, len(ids))
	for _, id := range ids {
		tag, err := models.GetSimpleTag(id, "")
		if err != nil {
			logger.Warn("get tag error", "error", err)
			continue
		}
		tags = append(tags, tag)
	}

	return tags, nil
}

func DeleteTag(id string) *e.Error {
	tag, err0 := models.GetSimpleTag(id, "")
	if err0 != nil {
		return err0
	}

	tx, err := db.Conn.Begin()
	if err != nil {
		logger.Warn("start transaction error", "error", err)
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	// 删除tags表的数据
	_, err = tx.Exec("DELETE FROM tags WHERE id=?", id)
	if err != nil {
		logger.Warn("delete tag error", "error", err)
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	// 删除关联的tag数据
	_, err = tx.Exec("DELETE FROM tags_using WHERE tag_id=?", id)
	if err != nil {
		logger.Warn("delete tag error", "error", err)
		tx.Rollback()
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	// 删除home sidebar的引用
	_, err = tx.Exec("DELETE FROM home_sidebar WHERE tag_name=?", tag.Name)
	if err != nil {
		logger.Warn("delete tag error", "error", err)
		tx.Rollback()
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	// 删除follows
	_, err = tx.Exec("DELETE FROM follows WHERE target_id=?", id)
	if err != nil {
		logger.Warn("delete tag error", "error", err)
		tx.Rollback()
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	tx.Commit()

	// 删除top里的tag列表
	err = top.RemoveTag(id)
	if err != nil {
		logger.Warn("delete top error", "error", err)
	}

	return nil
}

func GetTag(id string, name string) (*models.Tag, *e.Error) {
	tag := &models.Tag{}
	var rawmd []byte
	err := db.Conn.QueryRow("SELECT id,creator,title,name,icon,cover,md from tags where id=? or name=?", id, name).Scan(
		&tag.ID, &tag.Creator, &tag.Title, &tag.Name, &tag.Icon, &tag.Cover, &rawmd,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, e.New(http.StatusNotFound, "Tag不存在")
		}
		logger.Warn("get post error", "error", err)
		return nil, e.New(http.StatusInternalServerError, e.Internal)
	}

	md, err := utils.Uncompress(rawmd)
	tag.Md = string(md)

	db.Conn.QueryRow("SELECT count(*) FROM tags_using WHERE tag_id=? and target_type !=?", tag.ID, models.IDTypeUser).Scan(&tag.Posts)

	tag.SetCover()
	tag.Follows = interaction.GetFollows(tag.ID)

	return tag, nil
}

func UpdateTargetTags(targetCreator string, targetID string, tags []string, targetCreated time.Time, targetOwner string) error {
	_, err := db.Conn.Exec("DELETE FROM tags_using WHERE target_id=?", targetID)
	if err != nil {
		return err
	}

	for _, tag := range tags {
		_, err = db.Conn.Exec("INSERT INTO tags_using (tag_id,target_type,target_id,target_creator,target_created,target_owner) VALUES (?,?,?,?,?,?)", tag, models.GetIDType(targetID), targetID, targetCreator, targetCreated, targetOwner)
		if err != nil {
			logger.Warn("add post tag error", "error", err)
		}
	}

	return nil
}

func DeleteTargetTags(tx *sql.Tx, targetID string) error {
	var err error
	if tx != nil {
		_, err = tx.Exec("DELETE FROM tags_using WHERE target_id=?", targetID)
	} else {
		_, err = db.Conn.Exec("DELETE FROM tags_using WHERE target_id=?", targetID)
	}

	if err != nil {
		return err
	}

	return nil
}

func GetTargetIDs(tagID string) ([]string, error) {
	rows, err := db.Conn.Query("select target_id from tags_using where tag_id=?", tagID)
	if err != nil {
		return nil, err
	}

	ids := make([]string, 0)
	for rows.Next() {
		var id string
		rows.Scan(&id)
		ids = append(ids, id)
	}

	return ids, nil
}

func GetUserTags(userID string) ([]*models.Tag, *e.Error) {
	tagsMap := make(map[string]*models.Tag)
	var rows *sql.Rows
	var err error

	if models.GetIDType(userID) == models.IDTypeUser {
		rows, err = db.Conn.Query("SELECT tag_id from tags_using where target_creator=?", userID)
	} else {
		rows, err = db.Conn.Query("SELECT tag_id from tags_using where target_owner=?", userID)
	}
	if err != nil {
		logger.Warn("get tag error", "error", err)
		return nil, e.New(http.StatusInternalServerError, e.Internal)
	}

	var tagID string
	for rows.Next() {
		rows.Scan(&tagID)
		tag, ok := tagsMap[tagID]
		if !ok {
			tagsMap[tagID] = &models.Tag{ID: tagID, Posts: 1}
		} else {
			tag.Posts = tag.Posts + 1
		}
	}

	tags := make(models.Tags, 0)
	for _, t := range tagsMap {
		tag, err := models.GetSimpleTag(t.ID, "")
		if err != nil {
			logger.Warn("get simple tag error", "error", err)
			continue
		}
		tag.Posts = t.Posts
		tags = append(tags, tag)
	}

	sort.Sort(tags)

	return tags, nil
}

func GetModerators(id string) ([]*models.UserSimple, *e.Error) {
	users := make([]*models.UserSimple, 0)
	rows, err := db.Conn.Query("SELECT user_id FROM tag_moderators WHERE tag_id=?", id)
	if err != nil {
		logger.Warn("get tag moderators error", "error", err)
		return nil, e.New(http.StatusInternalServerError, e.Internal)
	}

	for rows.Next() {
		var uid string
		rows.Scan(&uid)

		u := &models.UserSimple{
			ID: uid,
		}

		err = u.Query()
		if err != nil {
			logger.Warn("query user error", "error", err)
			continue
		}
		users = append(users, u)
	}

	return users, nil
}

func AddModerator(tagID, username string) *e.Error {
	var userID string
	err := db.Conn.QueryRow("SELECT id FROM user WHERE username=?", username).Scan(&userID)
	if err != nil {
		if err == sql.ErrNoRows {
			return e.New(http.StatusNotFound, e.NotFound)
		}
		logger.Warn("add tag moderator error", "error", err)
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	_, err = db.Conn.Exec("INSERT INTO tag_moderators (tag_id,user_id,created) VALUES (?,?,?)", tagID, userID, time.Now())
	if err != nil {
		if e.IsErrUniqueConstraint(err) {
			return e.New(http.StatusConflict, e.AlreadyExist)
		}

		logger.Warn("add tag moderator error", "error", err)
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	return nil
}

func DeleteModerator(tagID, userID string) *e.Error {
	_, err := db.Conn.Exec("DELETE FROM tag_moderators WHERE tag_id=? and user_id=?", tagID, userID)
	if err != nil {
		logger.Warn("add tag moderator error", "error", err)
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	return nil
}

func IsModerator(tagID string, user *models.User) bool {
	if user.Role.IsAdmin() {
		return true
	}

	var uid string
	db.Conn.QueryRow("SELECT user_id FROM tag_moderators WHERE tag_id=? and user_id=?", tagID, user.ID).Scan(&uid)
	if uid == user.ID {
		return true
	}

	return false
}

func RemoveTagStory(tagID, storyID string) *e.Error {
	_, err := db.Conn.Exec("DELETE FROM tags_using WHERE tag_id=? and target_id=?", tagID, storyID)
	if err != nil {
		logger.Warn("remove  tag story error", "error", err)
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	return nil
}

func DisableTagStory(tagID, storyID string) *e.Error {
	_, err := db.Conn.Exec("INSERT INTO tag_story_disabled (tag_id,story_id,created) VALUES (?,?,?)", tagID, storyID, time.Now())
	if err != nil {
		logger.Warn("disable  tag story error", "error", err)
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	return nil
}

func IsStoryDisabled(tagID, storyID string) (bool, error) {
	var sid string
	err := db.Conn.QueryRow("SELECT story_id FROM tag_story_disabled WHERE tag_id=? and story_id=?", tagID, storyID).Scan(&sid)
	if err == sql.ErrNoRows {
		return false, nil
	}

	if err != nil {
		return false, err
	}

	return true, nil
}

func GetDisabledStroies(tagID string) (models.Stories, *e.Error) {
	stories := make(models.Stories, 0)

	rows, err := db.Conn.Query("SELECT story_id,created FROM tag_story_disabled WHERE tag_id=?", tagID)
	if err != nil {
		logger.Warn("query  disabled tag story error", "error", err)
		return nil, e.New(http.StatusInternalServerError, e.Internal)
	}

	for rows.Next() {
		var id string
		var t time.Time
		rows.Scan(&id, &t)
		s, err := models.GetSimpleStory(id)
		if err != nil {
			logger.Warn("query  disabled tag story error", "error", err)
			continue
		}
		s.Created = t
		stories = append(stories, s)
	}

	sort.Sort(stories)
	return stories, nil
}

func GetTagListByUserModeratorRole(userID string) ([]*models.Tag, *e.Error) {
	tags := make([]*models.Tag, 0)
	rows, err := db.Conn.Query("SELECT tag_id FROM tag_moderators WHERE user_id=?", userID)
	if err != nil {
		logger.Warn("get tag moderators error", "error", err)
		return nil, e.New(http.StatusInternalServerError, e.Internal)
	}

	for rows.Next() {
		var tid string
		rows.Scan(&tid)

		t, err := GetTag(tid, "")
		if err != nil {
			logger.Warn("query tag error", "error", err)
			continue
		}
		tags = append(tags, t)
	}

	return tags, nil
}
