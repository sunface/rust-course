package admin

import (
	"net/http"
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
		logger.Warn("add report error", "error", err)
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	return nil
}
