package manage

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/mafanr/juz/api/manage/audit"
	"github.com/mafanr/juz/api/manage/strategy"
	"github.com/mafanr/juz/misc"

	"github.com/mafanr/g"

	"github.com/labstack/echo"
)

type Manage struct{}

func (m *Manage) Start() {
	g.ETCD.Register(g.APP_JUZ_MANAGE, misc.Conf.Etcd.Addrs, misc.Conf.Manage.Port)

	e := echo.New()
	//api管理
	e.POST("/manage/api/query", m.QueryAPI, auth)
	e.POST("/manage/api/count", m.CountAPI, auth)
	e.POST("/manage/api/define", m.DefineAPI, auth)
	e.POST("/manage/api/delete", m.DeleteAPI, auth)
	e.POST("/manage/api/verifyParamRule", m.VerifyParamRule, auth)

	e.POST("/manage/api/release", m.APIRelease, auth)
	e.POST("/manage/api/batchRelease", m.APIBatchRelease, auth)
	e.POST("/manage/api/offline", m.APIOffline, auth)

	e.POST("/manage/api/batchStrategy", m.APIBatchStrategy, auth)
	e.POST("/manage/api/batchDelStrategy", m.APIBatchDelStrategy, auth)

	//策略管理
	e.POST("/manage/strategy/create", strategy.Create, auth)
	e.POST("/manage/strategy/update", strategy.Update, auth)
	e.POST("/manage/strategy/load", strategy.Load, auth)
	e.POST("/manage/strategy/change", strategy.Change, auth)

	e.POST("/manage/strategy/delete", strategy.Delete, auth)
	e.POST("/manage/strategy/query", strategy.Query, auth)
	// e.POST("/manage/strategy/api", strategy.Api, auth)

	// 审计日志
	e.POST("/manage/auditLog/count", audit.Count, auth)
	e.POST("/manage/auditLog/load", audit.Load, auth)

	e.Logger.Fatal(e.Start(":" + misc.Conf.Manage.Port))
}

func auth(f echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		if c.FormValue("admin_token") != misc.Conf.Common.AdminToken {
			return c.JSON(http.StatusUnauthorized, g.Result{
				Status:  http.StatusUnauthorized,
				ErrCode: g.ForbiddenC,
				Message: g.ForbiddenE,
			})
		}
		return f(c)
	}
}

func validUserID(s string) bool {
	i, err := strconv.Atoi(s)
	if err != nil {
		return false
	}
	if i == 0 {
		return false
	}
	return true
}

func (m *Manage) serviceExist(service string) bool {
	// 验证service是否存在
	var temp interface{}
	query := fmt.Sprintf("select id from service where name ='%s'", service)
	err := g.DB.Get(&temp, query)
	if err != nil {
		return false
	}

	return true
}

func (m *Manage) canView(priv string) bool {
	if priv == g.PRIV_GUEST {
		return false
	}
	return true
}

func (m *Manage) canOperate(priv string) bool {
	if priv == g.PRIV_ADMIN || priv == g.PRIV_OWNER {
		return true
	}

	return false
}

func isServiceCreator(userID string, service string) bool {
	// 验证是否是service创建者
	var temp interface{}
	query := fmt.Sprintf("select id from service where name ='%s' and creator='%s'", service, userID)
	err := g.DB.Get(&temp, query)
	if err == nil {
		// 是创建者
		return true
	}

	return false
}

func getServiceByApiName(apiName string) string {
	return strings.Split(apiName, ".")[0]
}
