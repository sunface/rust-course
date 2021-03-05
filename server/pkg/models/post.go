package models

import "time"

const (
	StatusDraft     = 1
	StatusPublished = 2
	StatusHidden    = 3
)

type Post struct {
	ID         string      `json:"id"`
	Creator    *UserSimple `json:"creator"`
	CreatorID  string      `json:"creatorId"`
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
	Comments   int         `json:"comments"`
	Views      int         `json:"views"`
	Bookmarked bool        `json:"bookmarked"`
	Status     int         `json:"status"`
	Created    time.Time   `json:"created"`
	Updated    time.Time   `json:"updated"`
}

type Posts []*Post

func (ar Posts) Len() int      { return len(ar) }
func (ar Posts) Swap(i, j int) { ar[i], ar[j] = ar[j], ar[i] }
func (ar Posts) Less(i, j int) bool {
	return ar[i].Created.Unix() > ar[j].Created.Unix()
}
