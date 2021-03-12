package user

import (
	"net/http"
	"sort"

	"github.com/imdotdev/im.dev/server/pkg/db"
	"github.com/imdotdev/im.dev/server/pkg/e"
	"github.com/imdotdev/im.dev/server/pkg/models"
)

func AddNavbar(nav *models.Navbar) *e.Error {
	_, err := db.Conn.Exec("INSERT INTO user_navbar (user_id,label,type,value,weight) VALUES (?,?,?,?,?)",
		nav.UserID, nav.Label, nav.Type, nav.Value, nav.Weight)
	if err != nil {
		logger.Warn("add user navbar error", "error", err)
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	return nil
}

func GetNavbars(userID string) (models.Navbars, *e.Error) {
	rows, err := db.Conn.Query("SELECT label,type,value,weight FROM navbar WHERE user_id=?", userID)
	if err != nil {
		logger.Warn("get user navbar error", "error", err)
		return nil, e.New(http.StatusInternalServerError, e.Internal)
	}

	navs := make(models.Navbars, 0)
	for rows.Next() {
		nav := &models.Navbar{}
		rows.Scan(&nav.Label, &nav.Type, &nav.Value, &nav.Weight)
		navs = append(navs, nav)
	}

	sort.Sort(navs)

	return navs, nil
}
