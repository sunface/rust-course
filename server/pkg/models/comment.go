package models

import "time"

type Comment struct {
	ID        string      `json:"id"`
	TargetID  string      `json:"targetID"` // 被评论的文章、书籍等ID
	CreatorID string      `json:"creatorID"`
	Creator   *UserSimple `json:"creator"`
	Md        string      `json:"md"`
	Likes     int         `json:"likes"`
	Liked     bool        `json:"liked"`
	Replies   []*Comment  `json:"replies"`
	Created   time.Time   `json:"created"`
	Updated   time.Time   `json:"updated"`
}

type Comments []*Comment

func (ar Comments) Len() int      { return len(ar) }
func (ar Comments) Swap(i, j int) { ar[i], ar[j] = ar[j], ar[i] }
func (ar Comments) Less(i, j int) bool {
	return ar[i].Created.Unix() > ar[j].Created.Unix()
}
