package admin

import (
	"database/sql"
	"net/http"
	"sort"
	"time"

	"github.com/grafana/grafana/pkg/cmd/grafana-cli/logger"
	"github.com/imdotdev/im.dev/server/pkg/db"
	"github.com/imdotdev/im.dev/server/pkg/e"
	"github.com/imdotdev/im.dev/server/pkg/models"
)

const (
	StatusUndealed = 1
	StatusDealed   = 2
)

func AddReport(targetID string, content string, reporter string) *e.Error {
	_, err := db.Conn.Exec("INSERT INTO report (target_id,type,reporter,status,created) VALUES (?,?,?,?,?)",
		targetID, models.GetIDType(targetID), reporter, StatusUndealed, time.Now())

	if err != nil {
		if e.IsErrUniqueConstraint(err) {
			return e.New(http.StatusConflict, "已提交过report，请勿重复提交")
		}
		logger.Warn("add report error", "error", err)
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	return nil
}

func GetReports(page int) ([]*models.Report, *e.Error) {
	reports := make(models.Reports, 0)
	rows, err := db.Conn.Query("SELECT id,target_id,reporter,status,created FROM report")
	if err != nil && err != sql.ErrNoRows {
		logger.Warn("get reports error", "error", err)
		return nil, e.New(http.StatusInternalServerError, e.Internal)
	}

	if err == sql.ErrNoRows {
		return reports, nil
	}

	for rows.Next() {
		r := &models.Report{
			Reporter: &models.UserSimple{},
		}
		var uid string
		err := rows.Scan(&r.ID, &r.TargetID, &uid, &r.Status, &r.Created)
		if err != nil {
			logger.Warn("scan report error", "error", err)
			continue
		}

		r.Reporter.ID = uid
		r.Reporter.Query()
		reports = append(reports, r)
	}

	sort.Sort(reports)

	return reports, nil
}
