package story

import (
	"database/sql"
	"fmt"
	"net/http"
	"sort"
	"strings"

	"github.com/imdotdev/im.dev/server/pkg/db"
	"github.com/imdotdev/im.dev/server/pkg/e"
	"github.com/imdotdev/im.dev/server/pkg/models"
)

func SubmitSeriesPost(seriesID string, posts []*models.SeriesPost) *e.Error {
	_, err := db.Conn.Exec("DELETE FROM series_post WHERE series_id=?", seriesID)
	if err != nil {
		logger.Warn("delete series post error", "error", err)
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	for _, post := range posts {
		_, err = db.Conn.Exec("INSERT INTO series_post (series_id,post_id,priority) VALUES (?,?,?)", seriesID, post.PostID, post.Priority)
		if err != nil {
			logger.Warn("add series post error", "error", err)
		}
	}

	return nil
}

func GetSeriesPost(seriesID string) ([]*models.SeriesPost, *e.Error) {
	posts := make([]*models.SeriesPost, 0)
	rows, err := db.Conn.Query("SELECT post_id,priority FROM series_post WHERE series_id=?", seriesID)
	if err != nil {
		logger.Warn("select series post error", "error", err)
		return nil, e.New(http.StatusInternalServerError, e.Internal)
	}

	for rows.Next() {
		post := &models.SeriesPost{}
		err := rows.Scan(&post.PostID, &post.Priority)
		if err != nil {
			logger.Warn("scan series post error", "error", err)
			continue
		}
		posts = append(posts, post)
	}

	return posts, nil
}

func GetSeriesPosts(user *models.User, seriesID string) ([]*models.Story, *e.Error) {
	rows, err := db.Conn.Query("SELECT post_id,priority FROM series_post WHERE series_id=?", seriesID)
	if err != nil {
		logger.Warn("select series post error", "error", err)
		return nil, e.New(http.StatusInternalServerError, e.Internal)
	}

	seriesPosts := make(models.SeriesPosts, 0)
	seriesPostsMap := make(map[string]*models.SeriesPost)
	postIDs := make([]string, 0)

	for rows.Next() {
		post := &models.SeriesPost{}
		err := rows.Scan(&post.PostID, &post.Priority)
		if err != nil {
			logger.Warn("scan series post error", "error", err)
			continue
		}
		seriesPosts = append(seriesPosts, post)
		seriesPostsMap[post.PostID] = post
		postIDs = append(postIDs, post.PostID)
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
		p, ok := seriesPostsMap[post.ID]
		if ok {
			post.Priority = p.Priority
		}
	}

	sort.Sort(models.PriorityStories(posts))
	return posts, nil
}

func DeleteSeriesPost(id string) *e.Error {
	_, err := db.Conn.Exec("DELETE FROM series_post WHERE series_id=?", id)
	if err != nil {
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	return nil
}

func GetPostSeries(postID string) ([]string, *e.Error) {
	series := make([]string, 0)
	rows, err := db.Conn.Query("SELECT series_id FROM series_post WHERE post_id=?", postID)
	if err != nil {
		logger.Warn("get post series error", "error", err)
		return nil, e.New(http.StatusInternalServerError, e.Internal)
	}

	for rows.Next() {
		var id string
		rows.Scan(&id)
		series = append(series, id)
	}

	return series, nil
}

func GetSeries(user *models.User, seriesIds []string) ([]*models.Story, *e.Error) {
	ids := strings.Join(seriesIds, "','")
	q := fmt.Sprintf(PostQueryPrefix+"where id in ('%s')", ids)
	rows, err := db.Conn.Query(q)
	if err != nil && err != sql.ErrNoRows {
		logger.Warn("get user posts error", "error", err)
		return nil, e.New(http.StatusInternalServerError, e.Internal)
	}

	series := GetPosts(user, rows)

	return series, nil
}
