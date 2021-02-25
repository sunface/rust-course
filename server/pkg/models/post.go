package models

import "time"

type Post struct {
	ID         int64       `json:"id"`
	Creator    *UserSimple `json:"creator"`
	CreatorID  int64       `json:"creatorId"`
	Title      string      `json:"title"`
	Slug       string      `json:"slug"`
	Md         string      `json:"md"`
	URL        string      `json:"url"`
	Cover      string      `json:"cover"`
	Brief      string      `json:"brief"`
	Tags       []int64     `json:"tags"`
	Likes      int         `json:"likes"`
	Liked      bool        `json:"liked"`
	Recommands int         `json:"recommands"`
	Created    time.Time   `json:"created"`
	Updated    time.Time   `json:"updated"`
}

type Posts []*Post

func (ar Posts) Len() int      { return len(ar) }
func (ar Posts) Swap(i, j int) { ar[i], ar[j] = ar[j], ar[i] }
func (ar Posts) Less(i, j int) bool {
	return ar[i].Created.Unix() > ar[j].Created.Unix()
}
