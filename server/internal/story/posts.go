package story

import (
	"database/sql"
	"fmt"
	"net/http"
	"sort"
	"strings"

	"github.com/imdotdev/im.dev/server/internal/interaction"
	"github.com/imdotdev/im.dev/server/internal/tags"
	"github.com/imdotdev/im.dev/server/pkg/db"
	"github.com/imdotdev/im.dev/server/pkg/e"
	"github.com/imdotdev/im.dev/server/pkg/models"
)

func HomePosts(user *models.User, filter string) (models.Posts, *e.Error) {

	rows, err := db.Conn.Query("select id,slug,title,url,cover,brief,creator,created,updated from posts")
	if err != nil && err != sql.ErrNoRows {
		logger.Warn("get user posts error", "error", err)
		return nil, e.New(http.StatusInternalServerError, e.Internal)
	}

	posts := getPosts(user, rows)
	sort.Sort(posts)

	return posts, nil
}

func UserPosts(user *models.User, uid string) (models.Posts, *e.Error) {
	rows, err := db.Conn.Query("select id,slug,title,url,cover,brief,creator,created,updated from posts where creator=?", uid)
	if err != nil && err != sql.ErrNoRows {
		logger.Warn("get user posts error", "error", err)
		return nil, e.New(http.StatusInternalServerError, e.Internal)
	}

	posts := getPosts(user, rows)

	sort.Sort(posts)
	return posts, nil
}

func TagPosts(user *models.User, tagID string) (models.Posts, *e.Error) {
	// get post ids
	postIDs, err := tags.GetTargetIDs(tagID)
	if err != nil {
		logger.Warn("get user posts error", "error", err)
		return nil, e.New(http.StatusInternalServerError, e.Internal)
	}

	ids := strings.Join(postIDs, "','")

	q := fmt.Sprintf("select id,slug,title,url,cover,brief,creator,created,updated from posts where id in ('%s')", ids)
	rows, err := db.Conn.Query(q)
	if err != nil && err != sql.ErrNoRows {
		logger.Warn("get user posts error", "error", err)
		return nil, e.New(http.StatusInternalServerError, e.Internal)
	}

	posts := getPosts(user, rows)

	sort.Sort(posts)
	return posts, nil
}

func BookmarkPosts(user *models.User, filter string) (models.Posts, *e.Error) {
	// get post ids
	rows, err := db.Conn.Query("select story_id from bookmarks where user_id=?", user.ID)
	if err != nil {
		logger.Warn("get bookmarks  error", "error", err)
		return nil, e.New(http.StatusInternalServerError, e.Internal)
	}

	postIDs := make([]string, 0)
	for rows.Next() {
		var id string
		rows.Scan(&id)
		postIDs = append(postIDs, id)
	}

	ids := strings.Join(postIDs, "','")

	q := fmt.Sprintf("select id,slug,title,url,cover,brief,creator,created,updated from posts where id in ('%s')", ids)
	rows, err = db.Conn.Query(q)
	if err != nil && err != sql.ErrNoRows {
		logger.Warn("get user posts error", "error", err)
		return nil, e.New(http.StatusInternalServerError, e.Internal)
	}

	posts := getPosts(user, rows)

	for _, post := range posts {
		_, rawTags, err := tags.GetTargetTags(post.ID)
		if err != nil {
			logger.Warn("get story tags error", "error", err)
			continue
		}

		post.RawTags = rawTags
	}

	sort.Sort(posts)
	return posts, nil
}

func getPosts(user *models.User, rows *sql.Rows) models.Posts {
	posts := make(models.Posts, 0)
	for rows.Next() {
		ar := &models.Post{}
		err := rows.Scan(&ar.ID, &ar.Slug, &ar.Title, &ar.URL, &ar.Cover, &ar.Brief, &ar.CreatorID, &ar.Created, &ar.Updated)
		if err != nil {
			logger.Warn("scan post error", "error", err)
			continue
		}

		// 获取作者信息
		creator := &models.UserSimple{ID: ar.CreatorID}
		creator.Query()
		ar.Creator = creator

		// 获取评论信息
		ar.Comments = GetCommentCount(ar.ID)

		// 获取当前登录用户的like
		if user != nil {
			ar.Liked = interaction.GetLiked(ar.ID, user.ID)
			// 获取当前登录用户的bookmark
			ar.Bookmarked, _ = Bookmarked(user.ID, ar.ID)
		}
		ar.Likes = interaction.GetLikes(ar.ID)

		posts = append(posts, ar)
	}

	return posts
}
