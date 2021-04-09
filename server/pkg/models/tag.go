package models

import (
	"database/sql"
	"net/http"
	"sort"

	"github.com/imdotdev/im.dev/server/pkg/db"
	"github.com/imdotdev/im.dev/server/pkg/e"
	"github.com/imdotdev/im.dev/server/pkg/utils"
)

type Tag struct {
	ID      string `json:"id"`
	Creator string `json:"creator,omitempty"`
	Title   string `json:"title"`
	Name    string `json:"name,omitempty"`
	Md      string `json:"md"`
	Cover   string `json:"cover,omitempty"`
	Icon    string `json:"icon"`
	Posts   int    `json:"posts"`
	Follows int    `json:"follows"`
	// Created time.Time `json:"created,omitempty"`
	// Updated time.Time `json:"updated,omitempty"`
}

func (t *Tag) SetCover() {
	if t.Cover == "" {
		t.Cover = DefaultTagCover
	}
}

type Tags []*Tag

func (t Tags) Len() int      { return len(t) }
func (t Tags) Swap(i, j int) { t[i], t[j] = t[j], t[i] }
func (t Tags) Less(i, j int) bool {
	return t[i].Posts > t[j].Posts
}

func GetTargetTags(targetID string) ([]string, []*Tag, error) {
	ids := make([]string, 0)
	rows, err := db.Conn.Query("SELECT tag_id FROM tags_using WHERE target_id=?", targetID)
	if err != nil {
		return nil, nil, err
	}

	rawTags := make([]*Tag, 0)
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

func GetSimpleTag(id string, name string) (*Tag, *e.Error) {
	tag := &Tag{}
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

func GetTags() (Tags, *e.Error) {
	tags := make(Tags, 0)

	rows, err := db.Conn.Query("SELECT id,creator,title,md,name,icon,cover from tags")
	if err != nil {
		if err == sql.ErrNoRows {
			return tags, nil
		}
		logger.Warn("get tags error", "error", err)
		return tags, e.New(http.StatusInternalServerError, e.Internal)
	}

	for rows.Next() {
		var rawMd []byte
		tag := &Tag{}
		err := rows.Scan(&tag.ID, &tag.Creator, &tag.Title, &rawMd, &tag.Name, &tag.Icon, &tag.Cover)
		if err != nil {
			logger.Warn("scan tags error", "error", err)
			continue
		}

		md, _ := utils.Uncompress(rawMd)
		tag.Md = string(md)

		tag.SetCover()
		tags = append(tags, tag)

		db.Conn.QueryRow("SELECT count(*) FROM tags_using WHERE tag_id=? and target_type != ?", tag.ID, IDTypeUser).Scan(&tag.Posts)
	}

	sort.Sort(tags)

	return tags, nil
}
