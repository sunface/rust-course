package traffic

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/mafanr/juz/misc"

	"github.com/mafanr/g"

	"github.com/sunface/talent"
	"go.uber.org/zap"
)

func (t *Traffic) loadData() {
	lastLoadTime = time.Now()
	// 加载所有数据
	t.loadAll()

	// 定时加载最新的信息
	go t.loadUpdated()
}

var lastLoadTime time.Time

func (t *Traffic) loadAll() {
	// 加载所有strategy
	strategies := make([]*misc.Strategy, 0)
	err := g.DB.Select(&strategies, "select * from strategy")
	if err != nil {
		g.Fatal("load strategies error!", zap.Error(err))
	}

	for _, s := range strategies {
		if s.Type == misc.STRATEGY_TRAFFIC {
			ts := &misc.TrafficStrategy{}
			json.Unmarshal([]byte(s.Content), &ts)
			t.Strategies.Store(s.ID, ts)
		}
	}
}

func (t *Traffic) loadUpdated() {
	for {
		// 为了防止访问时，恰好在更新数据，这里给出2秒的容忍值
		lastT := talent.Time2String(lastLoadTime.Add(-2 * time.Second))
		lastLoadTime = time.Now()

		// 加载策略

		strategies := make([]*misc.Strategy, 0)
		query := fmt.Sprintf("select * from strategy where modify_date >= '%s'", lastT)
		err := g.DB.Select(&strategies, query)
		if err != nil {
			g.Error("load strategies error!", zap.Error(err), zap.String("query", query))
			return
		}

		for _, s := range strategies {
			if s.Type == misc.STRATEGY_TRAFFIC {
				ts := &misc.TrafficStrategy{}
				json.Unmarshal([]byte(s.Content), &ts)
				t.Strategies.Store(s.ID, ts)
			}
		}

		time.Sleep(10 * time.Second)
	}
}
