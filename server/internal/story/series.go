package story

import (
	"net/http"

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

func DeleteSeriesPost(id string) *e.Error {
	_, err := db.Conn.Exec("DELETE FROM series_post WHERE series_id=?", id)
	if err != nil {
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	return nil
}
