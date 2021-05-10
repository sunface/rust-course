package models

import "time"

type Report struct {
	ID       int         `json:"id"`
	Type     string      `json:"type"`
	Content  string      `json:"content"`
	TargetID string      `json:"target_id"`
	Reporter *UserSimple `json:"reporter"`
	Status   int         `json:"status"`
	Created  time.Time   `json:"created"`
	URL      string      `json:"url"`
}

type Reports []*Report

func (t Reports) Len() int      { return len(t) }
func (t Reports) Swap(i, j int) { t[i], t[j] = t[j], t[i] }
func (t Reports) Less(i, j int) bool {
	return t[i].Created.Unix() > t[j].Created.Unix()
}
