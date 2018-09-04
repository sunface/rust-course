package filter

import (
	"net/http"
	"net/rpc"

	"github.com/mafanr/juz/api/req"
	"github.com/mafanr/juz/api/stats"

	"github.com/mafanr/g"

	"github.com/prometheus/client_golang/prometheus"
	"go.uber.org/zap"
)

/*
请求拦截过滤插件.
该模块组的核心目的是给网关提供扩展性插件.
我们应该尽量保证网关核心层的不变性，所有的变化的插件都在fileter中实现.
*/

// 可以在以下四个地方添加拦截插件
//1.请求开始前
//2.接受到服务的返回数据，返回给客户端之前
//3.请求失败后

// 拦截器顺序
//1.拦截器分为网关自带和用户定义的
//2.每个拦截器应该具有优先级编号
//3.按照优先级来调用拦截器

type Filter struct {
	Rpc *rpc.Client
}

type Result struct {
	Status int
	Ecode  int
	Emsg   string
}

// 收到请求，路由前的hook
func (f *Filter) BeforeRoute(r *req.Request) Result {
	// 黑白名单
	err := f.checkBW(r)
	if err != nil {
		g.L.Info("BeforeRoute failed", zap.Error(err))
		// 统计被阻挡数
		stats.Limits.With(prometheus.Labels{
			"api_id":  r.Api.APIID,
			"service": r.Api.Service,
			"app":     r.Api.App,
		}).Inc()
		return Result{http.StatusForbidden, g.ForbiddenC, g.ForbiddenE}
	}

	// 参数校验
	err = f.verifyParam(r)
	if err != nil {
		g.L.Info("BeforeRoute failed", zap.Error(err))
		return Result{http.StatusBadRequest, g.ParamInvalidC, g.ParamInvalidE}
	}

	// 流量路由
	f.trafficRoute(r)

	// 检查当
	return Result{}
}

// 调用目标服务前的hook
func (f *Filter) BeforeCall(r *req.Request) Result {
	code, err := f.IncApiRate(r)
	if err != nil {
		// 统计被阻挡数
		stats.Limits.With(prometheus.Labels{
			"api_id":  r.Api.APIID,
			"service": r.Api.Service,
			"app":     r.Api.App,
		}).Inc()
		return Result{code, g.AccessLimitedC, err.Error()}
	}

	return Result{}
}

// 调用目标服务完成后的hook
func (f *Filter) AfterCall(r *req.Request) Result {
	// 并发数减1
	f.DecApiRate(r)
	return Result{}
}

func (f *Filter) RouteFailed(r *req.Request) Result {
	return Result{}
}
