package models

const (
	FilterBest      = "Best"
	FilterFeature   = "Feature"
	FilterRecent    = "Recent"
	FilterFavorites = "Favorites"
	FilterWeek      = "Week"
	FilterMonth     = "Month"
	FilterYear      = "Year"
	FilterLatest    = "Latest"
)

func ValidSearchFilter(f string) bool {
	if f == FilterBest || f == FilterFeature || f == FilterRecent || f == FilterFavorites {
		return true
	}

	return false
}
