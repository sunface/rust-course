package models

const (
	NavbarTypeLink   = 1
	NavbarTypeSeries = 2
)

type Navbar struct {
	ID     int    `json:"id"`
	UserID string `json:"userID"`
	Label  string `json:"label"`
	Type   int    `json:"type"`
	Value  string `json:"value"`
	Weight int    `json:"weight"`
}

type Navbars []*Navbar

func (t Navbars) Len() int      { return len(t) }
func (t Navbars) Swap(i, j int) { t[i], t[j] = t[j], t[i] }
func (t Navbars) Less(i, j int) bool {
	return t[i].Weight > t[j].Weight
}

func ValidNavbarType(tp int) bool {
	if tp == NavbarTypeLink || tp == NavbarTypeSeries {
		return true
	}

	return false
}
