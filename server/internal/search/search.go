package search

import (
	"database/sql"
	"sort"
	"strings"

	"github.com/imdotdev/im.dev/server/internal/interaction"
	"github.com/imdotdev/im.dev/server/internal/story"
	"github.com/imdotdev/im.dev/server/pkg/db"
	"github.com/imdotdev/im.dev/server/pkg/log"
	"github.com/imdotdev/im.dev/server/pkg/models"
)

var logger = log.RootLogger.New("logger", "search")

func Posts(user *models.User, filter, query string, page, perPage int64) []*models.Story {
	posts := make([]*models.Story, 0)

	// postsMap := make(map[string]*models.Post)

	// search by title
	sqlq := "%" + query + "%"
	var rows *sql.Rows
	var err error
	if filter == models.FilterFavorites {
		rows, err = db.Conn.Query(story.PostQueryPrefix+"where status=? and  (title LIKE ? or brief LIKE ?) ORDER BY likes DESC LIMIT ?,?", models.StatusPublished, sqlq, sqlq, (page-1)*perPage, perPage)
	} else {
		rows, err = db.Conn.Query(story.PostQueryPrefix+"where status=? and  (title LIKE ? or brief LIKE ?) ORDER BY created DESC LIMIT ?,?", models.StatusPublished, sqlq, sqlq, (page-1)*perPage, perPage)
	}

	if err != nil {
		logger.Warn("get user posts error", "error", err)
		return posts
	}

	posts = story.GetPosts(user, rows)

	return posts
}

func Users(user *models.User, filter, query string) []*models.User {
	users := make(models.Users, 0)
	for _, u := range models.UsersCache {
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

	sort.Sort(users)
	return users
}
