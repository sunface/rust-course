package story

import (
	"database/sql"
	"fmt"
	"net/http"
	"sort"
	"strings"

	"github.com/imdotdev/im.dev/server/internal/interaction"
	"github.com/imdotdev/im.dev/server/pkg/db"
	"github.com/imdotdev/im.dev/server/pkg/e"
	"github.com/imdotdev/im.dev/server/pkg/models"
)

const PostQueryPrefix = "select id,type,slug,title,url,cover,brief,creator,owner,created,updated from story "

func HomePosts(user *models.User, filter string, page int64, perPage int64) (models.Stories, *e.Error) {

	rows, err := db.Conn.Query(PostQueryPrefix+"where status=? ORDER BY created DESC LIMIT ?,?", models.StatusPublished, (page-1)*perPage, perPage)
	if err != nil && err != sql.ErrNoRows {
		logger.Warn("get user posts error", "error", err)
		return nil, e.New(http.StatusInternalServerError, e.Internal)
	}

	posts := GetPosts(user, rows)
	sort.Sort(posts)

	return posts, nil
}

func DashboardPosts(user *models.User) ([]*models.Story, *e.Error) {
	rows, err := db.Conn.Query("SELECT id,title,url,created,views,likes,updated FROM story WHERE creator=? AND status=? ORDER BY created DESC", user.ID, models.StatusPublished)
	if err != nil && err != sql.ErrNoRows {
		logger.Warn("get dashboard posts error", "error", err)
		return nil, e.New(http.StatusInternalServerError, e.Internal)
	}

	stories := make([]*models.Story, 0)
	for rows.Next() {
		story := &models.Story{}
		rows.Scan(&story.ID, &story.Title, &story.URL, &story.Created, &story.Views, &story.Likes, &story.Updated)
		story.Comments = GetCommentCount(story.ID)
		stories = append(stories, story)

		story.Creator = &models.UserSimple{Username: user.Username}
	}

	return stories, nil
}

func UserPosts(tp string, user *models.User, uid string, page int64, perPage int64) (models.Stories, *e.Error) {
	var rows *sql.Rows
	var err error
	if tp == models.IDTypeUndefined {
		if perPage == 0 {
			rows, err = db.Conn.Query(PostQueryPrefix+"where creator=? and status!=?", uid, models.StatusDraft)
		} else {
			rows, err = db.Conn.Query(PostQueryPrefix+"where creator=? and status!=? ORDER BY created DESC LIMIT ?,?", uid, models.StatusDraft, (page-1)*perPage, perPage)
		}
	} else {
		if perPage == 0 {
			rows, err = db.Conn.Query(PostQueryPrefix+"where creator=? and type=? and status!=?", uid, tp, models.StatusDraft)
		} else {
			rows, err = db.Conn.Query(PostQueryPrefix+"where creator=? and type=? and status!=? ORDER BY created DESC LIMIT ?,? ", uid, tp, models.StatusDraft, (page-1)*perPage, perPage)
		}
	}

	if err != nil && err != sql.ErrNoRows {
		logger.Warn("get user posts error", "error", err)
		return nil, e.New(http.StatusInternalServerError, e.Internal)
	}

	posts := GetPosts(user, rows)

	sort.Sort(posts)

	pinned := make([]*models.Story, 0)
	unpinned := make([]*models.Story, 0)

	for _, post := range posts {
		post.Pinned = GetPinned(post.ID, user.ID)
		if post.Pinned {
			pinned = append(pinned, post)
		} else {
			unpinned = append(unpinned, post)
		}
	}

	newPosts := append(pinned, unpinned...)
	return newPosts, nil
}

func UserTagPosts(user *models.User, tid string, uid string, page int64, perPage int64) (models.Stories, *e.Error) {
	ids := make([]string, 0)
	rows, err := db.Conn.Query("SELECT target_id FROM tags_using WHERE tag_id=? and target_creator=? ORDER BY target_created DESC LIMIT ?,?", tid, uid, (page-1)*perPage, perPage)
	if err != nil {
		logger.Warn("get user posts error", "error", err)
		return nil, e.New(http.StatusInternalServerError, e.Internal)
	}

	for rows.Next() {
		var id string
		rows.Scan(&id)
		ids = append(ids, id)
	}

	posts, err1 := GetPostsByIDs(user, ids)
	if err1 != nil {
		return nil, err1
	}

	return posts, nil
}

func OrgPosts(tp string, user *models.User, orgID string, page int64, perPage int64) (models.Stories, *e.Error) {
	var rows *sql.Rows
	var err error

	if tp == models.IDTypeUndefined {
		if perPage == 0 {
			rows, err = db.Conn.Query(PostQueryPrefix+"where owner=? and status=?", orgID, models.StatusPublished)
		} else {
			rows, err = db.Conn.Query(PostQueryPrefix+"where owner=? and status=? ORDER BY created DESC LIMIT ?,?", orgID, models.StatusPublished, (page-1)*perPage, perPage)
		}
	} else {
		if perPage == 0 {
			rows, err = db.Conn.Query(PostQueryPrefix+"where owner=? and type=? and status=?", orgID, tp, models.StatusPublished)
		} else {
			rows, err = db.Conn.Query(PostQueryPrefix+"where owner=? and type=? and status=? ORDER BY created DESC LIMIT ?,? ", orgID, tp, models.StatusPublished, (page-1)*perPage, perPage)
		}
	}

	if err != nil && err != sql.ErrNoRows {
		logger.Warn("get user posts error", "error", err)
		return nil, e.New(http.StatusInternalServerError, e.Internal)
	}

	posts := GetPosts(user, rows)

	sort.Sort(posts)

	pinned := make([]*models.Story, 0)
	unpinned := make([]*models.Story, 0)

	for _, post := range posts {
		post.Pinned = GetPinned(post.ID, post.OwnerID)
		if post.Pinned {
			pinned = append(pinned, post)
		} else {
			unpinned = append(unpinned, post)
		}
	}

	newPosts := append(pinned, unpinned...)
	return newPosts, nil
}

func OrgTagPosts(user *models.User, tid string, orgID string, page int64, perPage int64) (models.Stories, *e.Error) {
	ids := make([]string, 0)
	rows, err := db.Conn.Query("SELECT target_id FROM tags_using WHERE tag_id=? and target_owner=? ORDER BY target_created DESC LIMIT ?,?", tid, orgID, (page-1)*perPage, perPage)
	if err != nil {
		logger.Warn("get user posts error", "error", err)
		return nil, e.New(http.StatusInternalServerError, e.Internal)
	}

	for rows.Next() {
		var id string
		rows.Scan(&id)
		ids = append(ids, id)
	}

	posts, err1 := GetPostsByIDs(user, ids)
	if err1 != nil {
		return nil, err1
	}

	return posts, nil
}

func UserDrafts(user *models.User, uid string) (models.Stories, *e.Error) {
	rows, err := db.Conn.Query(PostQueryPrefix+"where creator=? and status=?", uid, models.StatusDraft)
	if err != nil && err != sql.ErrNoRows {
		logger.Warn("get user drafts error", "error", err)
		return nil, e.New(http.StatusInternalServerError, e.Internal)
	}

	posts := GetPosts(user, rows)

	sort.Sort(posts)
	return posts, nil
}

func TagPosts(user *models.User, tagID string, page, perPage int64) (models.Stories, *e.Error) {
	ids := make([]string, 0)
	rows, err := db.Conn.Query("SELECT target_id FROM tags_using WHERE tag_id=?  and target_creator != ? ORDER BY target_created DESC LIMIT ?,?", tagID, "", (page-1)*perPage, perPage)
	if err != nil {
		logger.Warn("get user posts error", "error", err)
		return nil, e.New(http.StatusInternalServerError, e.Internal)
	}

	for rows.Next() {
		var id string
		rows.Scan(&id)
		ids = append(ids, id)
	}

	posts, err1 := GetPostsByIDs(user, ids)
	if err1 != nil {
		return nil, err1
	}

	return posts, nil
}

func BookmarkPosts(user *models.User, filter string) (models.Stories, *e.Error) {
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

	q := fmt.Sprintf(PostQueryPrefix+"where id in ('%s')", ids)
	rows, err = db.Conn.Query(q)
	if err != nil && err != sql.ErrNoRows {
		logger.Warn("get user posts error", "error", err)
		return nil, e.New(http.StatusInternalServerError, e.Internal)
	}

	posts := GetPosts(user, rows)

	for _, post := range posts {
		_, rawTags, err := models.GetTargetTags(post.ID)
		if err != nil {
			logger.Warn("get story tags error", "error", err)
			continue
		}

		post.RawTags = rawTags
	}

	sort.Sort(posts)
	return posts, nil
}

func GetPostsByIDs(user *models.User, ids []string) ([]*models.Story, *e.Error) {
	posts := make([]*models.Story, 0)
	for _, id := range ids {
		post, err := GetStory(id, "")
		if err != nil {
			continue
		}

		// 获取当前登录用户的like
		if user != nil {
			post.Liked = interaction.GetLiked(post.ID, user.ID)
			// 获取当前登录用户的bookmark
			post.Bookmarked, _ = Bookmarked(user.ID, post.ID)
		}

		posts = append(posts, post)
	}

	return posts, nil
}
func GetPosts(user *models.User, rows *sql.Rows) models.Stories {
	posts := make(models.Stories, 0)
	for rows.Next() {
		ar := &models.Story{}
		err := rows.Scan(&ar.ID, &ar.Type, &ar.Slug, &ar.Title, &ar.URL, &ar.Cover, &ar.Brief, &ar.CreatorID, &ar.OwnerID, &ar.Created, &ar.Updated)
		if err != nil {
			logger.Warn("scan post error", "error", err)
			continue
		}

		// 获取作者信息
		creator := &models.UserSimple{ID: ar.CreatorID}
		creator.Query()
		ar.Creator = creator

		if ar.OwnerID != "" {
			owner := &models.UserSimple{ID: ar.OwnerID}
			owner.Query()
			ar.Owner = owner
		}

		// 获取评论信息
		ar.Comments = GetCommentCount(ar.ID)

		// 获取当前登录用户的like
		if user != nil {
			ar.Liked = interaction.GetLiked(ar.ID, user.ID)
			// 获取当前登录用户的bookmark
			ar.Bookmarked, _ = Bookmarked(user.ID, ar.ID)
		}
		ar.Likes = interaction.GetLikes(ar.ID)

		tags, rawTags, err := models.GetTargetTags(ar.ID)
		if err != nil {
			logger.Warn("get tags error", "error", err)
		}
		ar.Tags = tags
		ar.RawTags = rawTags

		posts = append(posts, ar)
	}

	return posts
}
