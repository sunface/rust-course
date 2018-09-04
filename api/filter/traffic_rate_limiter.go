package filter

import (
	"errors"
	"net/http"
	"strings"

	"github.com/mafanr/juz/api/req"
	"github.com/mafanr/juz/misc"

	"github.com/mafanr/g"

	"go.uber.org/zap"
)

func (f *Filter) DecApiRate(r *req.Request) {
	// 并发控制减1
	if r.Api.TrafficStrategy != 0 {
		if r.TrafficStrategy.Concurrent != misc.STRATEGY_NO_LIMIT {
			res := &misc.TrafficConRes{}
			err := f.Rpc.Call("RateLimiter.DecApiRate", &misc.TrafficConReq{r.Api.APIID, r.Api.TrafficStrategy, ""}, &res)
			if err != nil {
				if !strings.Contains(err.Error(), "shut down") {
					g.Warn("rpc出错了", zap.Error(err))
				}
			}
		}
	}

}

func (f *Filter) IncApiRate(r *req.Request) (int, error) {
	if r.Api.TrafficStrategy != 0 {
		// 获取用户流量控制的参数和值
		var val string
		param := r.TrafficStrategy.Param
		if param != "" {
			// 找到该参数对应的值，传给traffic服务，进行限制
			for k, v := range r.Params {
				if k == param {
					val = v
				}
			}
		}

		if r.TrafficStrategy.QPS != misc.STRATEGY_NO_LIMIT || r.TrafficStrategy.Concurrent != misc.STRATEGY_NO_LIMIT || val != "" { // 至少有一项受到限制
			res := &misc.TrafficConRes{}
			err := f.Rpc.Call("RateLimiter.IncApiRate", &misc.TrafficConReq{r.Api.APIID, r.Api.TrafficStrategy, val}, &res)
			if err != nil {
				if !strings.Contains(err.Error(), "shut down") {
					g.Warn("rpc出错了", zap.Error(err))
				}
				return 0, nil
			}

			if !res.Suc {
				return http.StatusTooManyRequests, errors.New("当前访问数过多，超过了预设的阀值")
			}
		}
	}

	return 0, nil
}
