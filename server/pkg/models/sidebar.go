package models

type Sidebar struct {
	ID           int    `json:"id"`
	TagName      string `json:"tagName"`
	Sort         string `json:"sort"`
	DisplayCount int    `json:"displayCount"`
	Weight       int    `json:"weight"`
}

type Sidebars []*Sidebar

func (t Sidebars) Len() int      { return len(t) }
func (t Sidebars) Swap(i, j int) { t[i], t[j] = t[j], t[i] }
func (t Sidebars) Less(i, j int) bool {
	return t[i].Weight > t[j].Weight
}
