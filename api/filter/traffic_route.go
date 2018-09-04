package filter

import (
	"math/rand"
	"strings"

	"github.com/mafanr/juz/api/req"
	"github.com/mafanr/juz/misc"

	"github.com/mafanr/g"

	"go.uber.org/zap"
)

// 检查是否触发traffic route
// 一旦触发，把本次请求的api name换成触发后的结果
func (f *Filter) trafficRoute(r *req.Request) {
	if r.Api.TrafficOn == misc.TRAFFIC_OFF {
		// 流量路由未开启，返回
		return
	}

	if r.Api.TrafficAPI == "" {
		// 路由到的api name为空，返回
		return
	}

	apiI, ok := misc.Apis.Load(r.Api.TrafficAPI)
	if !ok {
		// api不存在，返回
		return
	}
	api := apiI.(*misc.API)
	// 是否在路由ip列表中，如果在，直接路由
	if strings.Contains(r.Api.TrafficIPs, r.ClientIP) {
		g.Debug(r.DebugOn, "Canary by ip", zap.String("old_api", r.Api.APIID), zap.String("new_api", api.APIID), zap.String("client_ip", r.ClientIP))
		r.Api = api
		return
	}

	// 是否进行流量路由,落到了[0,trafficRatio]的区间，才进行路由
	n := rand.Intn(101)
	if n > r.Api.TrafficRatio {
		return
	}
	g.Debug(r.DebugOn, "Canary by random", zap.String("old_api", r.Api.APIID), zap.String("new_api", api.APIID))
	r.Api = api
}
