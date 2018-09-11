package audit

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/mafanr/g"

	"github.com/sunface/talent"

	"github.com/labstack/echo"
	"go.uber.org/zap"
)

const (
	TypeService   = 1
	TypeApi       = 2
	TypeStrategy  = 3
	TypePrivilegy = 4
	TypeBatch     = 5

	OpCreate  = 1
	OpEdit    = 2
	OpRelease = 3
	OpOffline = 4
	OpDelete  = 5
)

func Log(userID string, service string, targetType int, targetID string, opType int, content string, desc string) {
	newc := g.B64.EncodeToString(talent.String2Bytes(content))
	query := fmt.Sprintf("insert into audit_log (user_id,service,target_type,target_id,op_type,content,description) values ('%s','%s','%d','%s','%d','%s','%s')",
		userID, service, targetType, targetID, opType, newc, desc)
	_, err := g.DB.Exec(query)
	if err != nil {
		g.L.Info("record audit log error", zap.Error(err), zap.String("query", query))
	}
}

func Count(c echo.Context) error {
	tt := c.FormValue("target_type")
	tid := c.FormValue("target_id")
	if tt == "" || tid == "" {
		return c.JSON(http.StatusBadRequest, g.Result{
			Status:  http.StatusBadRequest,
			ErrCode: g.ParamEmptyC,
			Message: g.ParamEmptyE,
		})
	}

	var query string
	if tt == "0" {
		query = fmt.Sprintf("select count(1) from audit_log where service in (%s)", tid)
	} else {
		query = fmt.Sprintf("select count(1) from audit_log where target_id='%s' and target_type='%s'", tid, tt)
	}
	rows, err := g.DB.Query(query)
	if err != nil {
		g.L.Info("access database error", zap.Error(err), zap.String("query", query))
		return c.JSON(http.StatusInternalServerError, g.Result{
			Status:  http.StatusInternalServerError,
			ErrCode: g.DatabaseC,
			Message: g.DatabaseE,
		})
	}

	var total int
	rows.Next()
	rows.Scan(&total)

	return c.JSON(http.StatusOK, g.Result{
		Status: http.StatusOK,
		Data:   total,
	})
}

type AuditLog struct {
	ID         int    `db:"id" json:"-"`
	UserID     string `db:"user_id" json:"user_id"`
	Service    string `db:"service" json:"service"`
	TargetType string `db:"target_type" json:"target_type"`
	TargetID   string `db:"target_id" json:"target_id"`
	OpType     string `db:"op_type" json:"op_type"`
	Content    string `db:"content" json:"content"`
	Desc       string `db:"description" json:"desc"`
	ModifyDate string `db:"modify_date" json:"modify_date"`
}

func Load(c echo.Context) error {
	tt := c.FormValue("target_type")
	tid := c.FormValue("target_id")
	pageS := c.FormValue("page")

	if tt == "" || tid == "" || pageS == "" {
		return c.JSON(http.StatusBadRequest, g.Result{
			Status:  http.StatusBadRequest,
			ErrCode: g.ParamEmptyC,
			Message: g.ParamEmptyE,
		})
	}
	page, _ := strconv.Atoi(pageS)
	if page <= 0 {
		return c.JSON(http.StatusBadRequest, g.Result{
			Status:  http.StatusBadRequest,
			ErrCode: g.ParamInvalidC,
			Message: g.ParamInvalidE,
		})
	}

	rs := make([]AuditLog, 0)
	var query string
	if tt == "0" {
		query = fmt.Sprintf("select * from audit_log where service in (%s) order by modify_date desc limit %d offset %d", tid, g.PER_PAGE, g.PER_PAGE*(page-1))
	} else {
		query = fmt.Sprintf("select * from audit_log where target_id='%s' and target_type='%s' order by modify_date desc limit %d offset %d", tid, tt, g.PER_PAGE, g.PER_PAGE*(page-1))
	}
	err := g.DB.Select(&rs, query)
	if err != nil {
		g.L.Info("access database error", zap.Error(err), zap.String("query", query))
		return c.JSON(http.StatusInternalServerError, g.Result{
			Status:  http.StatusInternalServerError,
			ErrCode: g.DatabaseC,
			Message: g.DatabaseE,
		})
	}

	for i, l := range rs {
		b, _ := g.B64.DecodeString(l.Content)
		rs[i].Content = talent.Bytes2String(b)
	}

	return c.JSON(http.StatusOK, g.Result{
		Status: http.StatusOK,
		Data:   rs,
	})
}
