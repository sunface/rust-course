package tags

import (
	"database/sql"
	"net/http"
	"sort"
	"strings"
	"time"

	"github.com/asaskevich/govalidator"
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

func GetTags() (models.Tags, *e.Error) {
	tags := make(models.Tags, 0)

	rows, err := db.Conn.Query("SELECT id,creator,title,md,name,icon,cover,created,updated from tags")
	if err != nil {
		if err == sql.ErrNoRows {
			return tags, nil
		}
		logger.Warn("get tags error", "error", err)
		return tags, e.New(http.StatusInternalServerError, e.Internal)
	}

	for rows.Next() {
		var rawMd []byte
		tag := &models.Tag{}
		err := rows.Scan(&tag.ID, &tag.Creator, &tag.Title, &rawMd, &tag.Name, &tag.Icon, &tag.Cover, &tag.Created, &tag.Updated)
		if err != nil {
			logger.Warn("scan tags error", "error", err)
			continue
		}

		md, _ := utils.Uncompress(rawMd)
		tag.Md = string(md)

		tag.SetCover()
		tags = append(tags, tag)

		db.Conn.QueryRow("SELECT count(*) FROM tags_using WHERE tag_id=?", tag.ID).Scan(&tag.PostCount)
	}

	sort.Sort(tags)

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
	err := db.Conn.QueryRow("SELECT id,creator,title,name,icon,cover,created,updated,md from tags where id=? or name=?", id, name).Scan(
		&tag.ID, &tag.Creator, &tag.Title, &tag.Name, &tag.Icon, &tag.Cover, &tag.Created, &tag.Updated, &rawmd,
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

	db.Conn.QueryRow("SELECT count(*) FROM tags_using WHERE tag_id=?", tag.ID).Scan(&tag.PostCount)

	tag.SetCover()
	return tag, nil
}

func GetSimpleTag(id string, name string) (*models.Tag, *e.Error) {
	tag := &models.Tag{}
	err := db.Conn.QueryRow("SELECT id,name,title,icon from tags where id=? or name=?", id, name).Scan(
		&tag.ID, &tag.Name, &tag.Title, &tag.Icon,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, e.New(http.StatusNotFound, e.NotFound)
		}
		logger.Warn("get tag error", "error", err)
		return nil, e.New(http.StatusInternalServerError, e.Internal)
	}

	return tag, nil
}

func GetTargetTags(targetID string) ([]string, []*models.Tag, error) {
	ids := make([]string, 0)
	rows, err := db.Conn.Query("SELECT tag_id FROM tags_using WHERE target_id=?", targetID)
	if err != nil {
		return nil, nil, err
	}

	rawTags := make([]*models.Tag, 0)
	for rows.Next() {
		var id string
		err = rows.Scan(&id)
		ids = append(ids, id)

		rawTag, err := GetSimpleTag(id, "")
		if err == nil {
			rawTags = append(rawTags, rawTag)
		}
	}

	return ids, rawTags, nil
}

func UpdateTargetTags(targetID string, tags []string) error {
	_, err := db.Conn.Exec("DELETE FROM tags_using WHERE target_id=?", targetID)
	if err != nil {
		return err
	}

	for _, tag := range tags {
		_, err = db.Conn.Exec("INSERT INTO tags_using (tag_id,target_type,target_id) VALUES (?,?,?)", tag, models.GetIDType(targetID), targetID)
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
