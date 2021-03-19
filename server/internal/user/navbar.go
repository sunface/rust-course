package user

import (
	"database/sql"
	"net/http"
	"sort"

	"github.com/imdotdev/im.dev/server/pkg/db"
	"github.com/imdotdev/im.dev/server/pkg/e"
	"github.com/imdotdev/im.dev/server/pkg/models"
)

func SubmitNavbar(nav *models.Navbar) *e.Error {
	var err error
	if nav.ID == 0 {
		_, err = db.Conn.Exec("INSERT INTO user_navbar (user_id,label,type,value,weight) VALUES (?,?,?,?,?)",
			nav.UserID, nav.Label, nav.Type, nav.Value, nav.Weight)
	} else {
		_, err = db.Conn.Exec("UPDATE user_navbar SET label=?,type=?,value=?,weight=? WHERE id=? and user_id=?", nav.Label, nav.Type, nav.Value, nav.Weight, nav.ID, nav.UserID)
	}

	if err != nil {
		logger.Warn("submit user navbar error", "error", err)
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	return nil
}

func GetNavbars(userID string) (models.Navbars, *e.Error) {
	rows, err := db.Conn.Query("SELECT id,label,type,value,weight FROM user_navbar WHERE user_id=?", userID)
	if err != nil {
		logger.Warn("get user navbar error", "error", err)
		return nil, e.New(http.StatusInternalServerError, e.Internal)
	}

	navs := make(models.Navbars, 0)
	for rows.Next() {
		nav := &models.Navbar{}
		rows.Scan(&nav.ID, &nav.Label, &nav.Type, &nav.Value, &nav.Weight)
		navs = append(navs, nav)
	}

	sort.Sort(navs)

	return navs, nil
}

func DeleteNavbar(userID string, id string) *e.Error {
	_, err := db.Conn.Exec("DELETE FROM user_navbar WHERE id=? and user_id=?", id, userID)
	if err != nil {
		logger.Warn("submit user navbar error", "error", err)
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	return nil
}

func GetNavbar(id string) (*models.Navbar, *e.Error) {
	nav := &models.Navbar{}
	err := db.Conn.QueryRow("SELECT user_id,label,type,value,weight FROM user_navbar WHERE id=?", id).Scan(
		&nav.UserID, &nav.Label, &nav.Type, &nav.Value, &nav.Weight,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, e.New(http.StatusNotFound, e.NotFound)
		}
		logger.Warn("select navbar error", "error", err)
		return nil, e.New(http.StatusInternalServerError, e.Internal)
	}

	return nav, nil
}
