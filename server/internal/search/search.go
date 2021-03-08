package search

import (
	"sort"
	"strings"

	"github.com/imdotdev/im.dev/server/internal/cache"
	"github.com/imdotdev/im.dev/server/internal/interaction"
	"github.com/imdotdev/im.dev/server/internal/story"
	"github.com/imdotdev/im.dev/server/pkg/db"
	"github.com/imdotdev/im.dev/server/pkg/log"
	"github.com/imdotdev/im.dev/server/pkg/models"
)

var logger = log.RootLogger.New("logger", "search")

func Posts(user *models.User, filter, query string) models.Posts {
	posts := make(models.Posts, 0)

	// postsMap := make(map[string]*models.Post)

	// search by title
	rows, err := db.Conn.Query("select id,slug,title,url,cover,brief,creator,created,updated from posts where title LIKE ?", "%"+query+"%")
	if err != nil {
		logger.Warn("get user posts error", "error", err)
		return posts
	}

	posts = story.GetPosts(user, rows)
	sort.Sort(posts)

	return posts
}

func Users(user *models.User, filter, query string) []*models.User {
	allUsers := cache.Users

	users := make([]*models.User, 0)
	for _, u := range allUsers {
		if strings.Contains(strings.ToLower(u.Nickname), strings.ToLower(query)) {
			users = append(users, u)
			continue
		}

		if strings.Contains(strings.ToLower(u.Username), strings.ToLower(query)) {
			users = append(users, u)
			continue
		}
	}

	for _, u := range users {
		u.Followed = interaction.GetFollowed(u.ID, user.ID)
	}

	return users
}
