// 对API接口的QPS进行限制
package traffic

import (
	"sync"
	"time"

	"github.com/mafanr/juz/misc"
)

var apiRates = &sync.Map{}

type apiRate struct {
	concurrent int
	conUpdate  time.Time

	qps       int
	qpsUpdate time.Time

	params *sync.Map
}

type param struct {
	times    int
	lastTime time.Time
}

// 能调用此函数，说明qps、并发至少有一项受到了限制
func (rl *RateLimiter) IncApiRate(req misc.TrafficConReq, reply *misc.TrafficConRes) error {
	reply.Suc = true

	si, ok := traffic.Strategies.Load(req.StrategyID)
	if !ok {
		// 不存在策略，就没有限制
		return nil
	}
	s := si.(*misc.TrafficStrategy)

	ari, ok := apiRates.Load(req.ApiName)
	now := time.Now()
	if !ok {
		// 之前没有数据,初始化数据
		ar := apiRate{1, now, 1, now, &sync.Map{}}
		apiRates.Store(req.ApiName, &ar)
		return nil
	}
	ar := ari.(*apiRate)

	// QPS限制
	if s.QPS != misc.STRATEGY_NO_LIMIT {
		//要检查一下时间，如果超过一秒，则重新初始化数据
		if now.Sub(ar.qpsUpdate) > 1e9 {
			ar.qps = 1
			ar.qpsUpdate = now
			return nil
		}

		// 没超过一秒,超出限制，返回失败
		if ar.qps >= s.QPS {
			reply.Suc = false
			return nil
		}

		// 没超过一秒，每超出，更新数据
		ar.qps++
	}

	// 对并发进行限制
	if s.Concurrent != misc.STRATEGY_NO_LIMIT {
		// 这里要做一个防BUG设置，防止某些情况下，并发数到了最大值，结果不能减少或者归零
		if ar.concurrent >= s.Concurrent {
			// 如果当前时间距离上次更新并发时间，大于5秒，则认为出现了bug，重置并发
			if now.Sub(ar.conUpdate) > 1e9 {
				ar.concurrent = 0
				ar.conUpdate = now
				return nil
			}

			// 当前数量已经超过了并发数
			reply.Suc = false
			return nil
		}

		ar.concurrent++
		ar.conUpdate = now
	}

	// 用户流量，访问次数限制
	if req.ParamVal != "" {
		pi, ok := ar.params.Load(req.ParamVal)
		if !ok {
			// 不存在记录，初始化
			ar.params.Store(req.ParamVal, &param{1, now})
			return nil
		}

		// 存在记录
		p := pi.(*param)
		// 判断当前时间和上次初始化的时间的跨度
		if now.Sub(p.lastTime) > time.Duration(s.Span)*1e9 {
			// 时间跨度已经超出，重新初始化
			p.times = 1
			p.lastTime = now
			return nil
		}

		// 还在限制时间范围内,判断请求次数是否超出
		if p.times >= s.Times {
			reply.Suc = false
			return nil
		}
		p.times++
	}
	return nil
}

func (rl *RateLimiter) DecApiRate(req misc.TrafficConReq, reply *misc.TrafficConRes) error {
	reply.Suc = true
	// 获取该api之前的计数
	ari, ok := apiRates.Load(req.ApiName)
	if !ok {
		return nil
	}

	ar := ari.(*apiRate)
	if ar.concurrent == 0 {
		return nil
	}
	if ar.concurrent > 0 && ar.concurrent-1 <= 0 {
		ar.concurrent = 0
		return nil
	}

	ar.concurrent--

	return nil
}
