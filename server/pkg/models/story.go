package models

import (
	"time"

	"github.com/imdotdev/im.dev/server/pkg/db"
)

const (
	StatusDraft     = 1
	StatusPublished = 2
	StatusHidden    = 3
)

type Story struct {
	ID         string      `json:"id"`
	Type       string      `json:"type"`
	Creator    *UserSimple `json:"creator"`
	CreatorID  string      `json:"creatorId"`
	Owner      *UserSimple `json:"owner"`
	OwnerID    string      `json:"ownerId"`
	Title      string      `json:"title"`
	Slug       string      `json:"slug"`
	Md         string      `json:"md"`
	URL        string      `json:"url"`
	Cover      string      `json:"cover"`
	Brief      string      `json:"brief"`
	Tags       []string    `json:"tags"`
	RawTags    []*Tag      `json:"rawTags"`
	Likes      int         `json:"likes"`
	Liked      bool        `json:"liked"`
	Pinned     bool        `json:"pinned,omitempty"`
	Comments   int         `json:"comments"`
	Views      int         `json:"views"`
	Bookmarked bool        `json:"bookmarked"`
	Status     int         `json:"status"`
	Created    time.Time   `json:"created"`
	Updated    time.Time   `json:"updated"`

	Priority int `json:"-"`
}

type Stories []*Story

func (s Stories) Len() int      { return len(s) }
func (s Stories) Swap(i, j int) { s[i], s[j] = s[j], s[i] }
func (s Stories) Less(i, j int) bool {
	return s[i].Created.Unix() > s[j].Created.Unix()
}

type FavorStories []*Story

func (s FavorStories) Len() int      { return len(s) }
func (s FavorStories) Swap(i, j int) { s[i], s[j] = s[j], s[i] }
func (s FavorStories) Less(i, j int) bool {
	return s[i].Likes > s[j].Likes
}

type PriorityStories []*Story

func (s PriorityStories) Len() int      { return len(s) }
func (s PriorityStories) Swap(i, j int) { s[i], s[j] = s[j], s[i] }
func (s PriorityStories) Less(i, j int) bool {
	return s[i].Priority < s[j].Priority
}

type SeriesPost struct {
	PostID   string `json:"id"`
	Priority int    `json:"priority"`
}

type SeriesPosts []*SeriesPost

func (s SeriesPosts) Len() int      { return len(s) }
func (s SeriesPosts) Swap(i, j int) { s[i], s[j] = s[j], s[i] }
func (s SeriesPosts) Less(i, j int) bool {
	return s[i].Priority < s[j].Priority
}

func IsStoryCreator(userID string, storyID string) bool {
	var nid string
	err := db.Conn.QueryRow("SELECT creator FROM story WHERE id=?", storyID).Scan(&nid)
	if err != nil {
		return false
	}

	if nid == userID {
		return true
	}

	return false
}
