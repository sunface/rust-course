package tags

import (
	"database/sql"
	"net/http"
	"sort"
	"strings"
	"time"

	"github.com/asaskevich/govalidator"
	"github.com/imdotdev/im.dev/server/internal/interaction"
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
			tag.ID, tag.Creator, tag.Name, tag.Title, md, tag.Icon, tag.Cover, now, now)
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

func DeleteTag(id int64) *e.Error {
	_, err := db.Conn.Exec("DELETE FROM tags WHERE id=?", id)
	if err != nil {
		logger.Warn("delete post error", "error", err)
		return e.New(http.StatusInternalServerError, e.Internal)
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
			return nil, e.New(http.StatusNotFound, e.NotFound)
		}
		logger.Warn("get post error", "error", err)
		return nil, e.New(http.StatusInternalServerError, e.Internal)
	}

	md, _ := utils.Uncompress(rawmd)
	tag.Md = string(md)

	db.Conn.QueryRow("SELECT count(*) FROM tags_using WHERE tag_id=? and target_type !=?", tag.ID, models.IDTypeUser).Scan(&tag.Posts)

	tag.SetCover()
	tag.Follows = interaction.GetFollows(tag.ID)

	return tag, nil
}

func UpdateTargetTags(targetCreator string, targetID string, tags []string, targetCreated time.Time) error {
	_, err := db.Conn.Exec("DELETE FROM tags_using WHERE target_id=?", targetID)
	if err != nil {
		return err
	}

	for _, tag := range tags {
		_, err = db.Conn.Exec("INSERT INTO tags_using (tag_id,target_type,target_id,target_creator,target_created) VALUES (?,?,?,?,?)", tag, models.GetIDType(targetID), targetID, targetCreator, targetCreated)
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

	rows, err := db.Conn.Query("SELECT tag_id from tags_using where target_creator=?", userID)
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
