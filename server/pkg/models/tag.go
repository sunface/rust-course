package models

import "time"

type Tag struct {
	ID        int64     `json:"id"`
	Creator   int64     `json:"creator"`
	Title     string    `json:"title"`
	Name      string    `json:"name"`
	Md        string    `json:"md"`
	Cover     string    `json:"cover"`
	Icon      string    `json:"icon"`
	PostCount int       `json:"postCount"`
	Created   time.Time `json:"created"`
	Updated   time.Time `json:"updated"`
}

type Tags []*Tag

func (t Tags) Len() int      { return len(t) }
func (t Tags) Swap(i, j int) { t[i], t[j] = t[j], t[i] }
func (t Tags) Less(i, j int) bool {
	return t[i].Created.Unix() > t[j].Created.Unix()
}
