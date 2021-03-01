package session

import (
	"strings"

	"github.com/imdotdev/im.dev/server/internal/cache"
	"github.com/imdotdev/im.dev/server/pkg/e"
	"github.com/imdotdev/im.dev/server/pkg/models"
)

func GetUsers(q string) ([]*models.User, *e.Error) {
	allUsers := cache.Users

	users := make([]*models.User, 0)
	for _, u := range allUsers {
		if strings.HasPrefix(strings.ToLower(u.Nickname), strings.ToLower(q)) {
			users = append(users, u)
			continue
		}

		if strings.HasPrefix(strings.ToLower(u.Username), strings.ToLower(q)) {
			users = append(users, u)
			continue
		}
	}

	return users, nil
}
