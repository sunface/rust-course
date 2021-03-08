package models

const (
	FilterBest      = "best"
	FilterFeature   = "feature"
	FilterRecent    = "recent"
	FilterFavorites = "favorites"
)

func ValidSearchFilter(f string) bool {
	if f == FilterBest || f == FilterFeature || f == FilterRecent || f == FilterFavorites {
		return true
	}

	return false
}
