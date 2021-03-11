package models

type Following struct {
	ID     string `json:"id"`
	Weight int    `json:"weight"`
}

type Followings []*Following

func (s Followings) Len() int      { return len(s) }
func (s Followings) Swap(i, j int) { s[i], s[j] = s[j], s[i] }
func (s Followings) Less(i, j int) bool {
	return s[i].Weight > s[j].Weight
}
