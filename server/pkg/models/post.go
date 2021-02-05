package models

import "time"

type Article struct {
	ID      int64       `json:"id"`
	Creator *UserSimple `json:"creator"`
	Title   string      `json:"title"`
	URL     string      `json:"url"`
	Cover   string      `json:"cover"`
	Brief   string      `json:"brief"`
	Created time.Time   `json:"created"`
	Updated time.Time   `json:"updated"`
}

type Articles []*Article

func (ar Articles) Len() int      { return len(ar) }
func (ar Articles) Swap(i, j int) { ar[i], ar[j] = ar[j], ar[i] }
func (ar Articles) Less(i, j int) bool {
	return ar[i].Created.Unix() > ar[j].Created.Unix()
}
