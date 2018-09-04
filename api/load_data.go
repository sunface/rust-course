package api

import (
	"encoding/json"
	"fmt"
	"regexp"
	"sync"
	"time"

	"github.com/mafanr/juz/misc"

	"github.com/mafanr/g"

	"github.com/sunface/talent"
	"go.uber.org/zap"
)

func (p *ApiServer) loadData() {
	// 插入一条Test数据
	now := time.Now()
	date := talent.Time2StringSecond(time.Now())
	version := talent.Time2Version(now)
	g.DB.Exec(fmt.Sprintf("insert into api_release (service,api_id,description,mock_data,route_type,route_addr,app,create_date) values('admin','admin.test.get.v1','','',1,'http://httpbin.org/get','admin','%s')", date))
	g.DB.Exec(fmt.Sprintf("insert into api_define (service,api_id,description,mock_data,route_type,route_addr,revise_version,release_version,app,create_date) values('admin','admin.test.get.v1','','',1,'http://httpbin.org/get','%s','%s','admin','%s')", version, version, date))

	lastLoadTime = time.Now()
	// 加载所有数据
	p.loadAll()

	// 定时加载最新的信息
	go p.loadUpdated()
}

var lastLoadTime time.Time

func (p *ApiServer) loadAll() {
	// 加载所有apis
	apisS := make([]*misc.API, 0)
	err := g.DB.Select(&apisS, "select * from api_release")
	if err != nil {
		g.L.Fatal("load apis error!", zap.Error(err))
	}

	an := make([]string, 0, len(apisS))
	for _, api := range apisS {
		api.ParamRules = &sync.Map{}
		an = append(an, api.APIID)

		if api.ParamTable != nil {
			d, _ := g.B64.DecodeString(*api.ParamTable)
			// 解析param rules
			var prs []*misc.ParamRule
			json.Unmarshal(d, &prs)

			for _, pr := range prs {
				reg, _ := regexp.Compile(pr.ParamRule)
				api.ParamRules.Store(pr.Param, reg)
			}
		}

	}

	for _, api := range apisS {
		misc.Apis.Store(api.APIID, api)
	}

	// 加载所有strategy
	strategies := make([]*misc.Strategy, 0)
	err = g.DB.Select(&strategies, "select * from strategy")
	if err != nil {
		g.L.Fatal("load strategies error!", zap.Error(err))
	}

	for _, s := range strategies {
		// 生成具体的策略内容
		switch s.Type {
		case misc.STRATEGY_BWLIST:
			t := &misc.BwStrategy{
				Type:   s.Type,
				BwList: make([]*misc.BW, 0),
			}
			json.Unmarshal([]byte(s.Content), &t.BwList)
			s.DetailContent = t
		case misc.STRATEGY_RETRY:
			t := &misc.RetryStrategy{}
			json.Unmarshal([]byte(s.Content), &t)
			s.DetailContent = t
		case misc.STRATEGY_TRAFFIC:
			t := &misc.TrafficStrategy{}
			json.Unmarshal([]byte(s.Content), &t)
			s.DetailContent = t
		}

		misc.Strategies.Store(s.ID, s)
	}
}

func (p *ApiServer) loadUpdated() {
	wg := &sync.WaitGroup{}
	for {
		wg.Add(2)
		// 为了防止访问时，恰好在更新数据，这里给出2秒的容忍值
		lastT := talent.Time2String(lastLoadTime.Add(-2 * time.Second))
		lastLoadTime = time.Now()

		// 加载apis
		go func() {
			defer wg.Done()
			apisS := make([]*misc.API, 0)

			err := g.DB.Select(&apisS, fmt.Sprintf("select * from api_release where modify_date >= '%s'", lastT))
			if err != nil {
				g.L.Error("load apis error!", zap.Error(err))
				return
			}

			if len(apisS) == 0 {
				return
			}

			// 加载参数规则
			an := make([]string, 0, len(apisS))
			for _, api := range apisS {
				api.ParamRules = &sync.Map{}
				an = append(an, api.APIID)
				if api.ParamTable != nil {
					d, _ := g.B64.DecodeString(*api.ParamTable)
					// 解析param rules
					var prs []*misc.ParamRule
					json.Unmarshal(d, &prs)

					for _, pr := range prs {
						reg, _ := regexp.Compile(pr.ParamRule)
						api.ParamRules.Store(pr.Param, reg)
					}
				}
			}

			for _, api := range apisS {
				misc.Apis.Store(api.APIID, api)
			}
		}()

		// 加载策略
		go func() {
			defer wg.Done()

			strategies := make([]*misc.Strategy, 0)
			query := fmt.Sprintf("select * from strategy where modify_date >= '%s'", lastT)
			err := g.DB.Select(&strategies, query)
			if err != nil {
				g.L.Error("load strategies error!", zap.Error(err), zap.String("query", query))
				return
			}

			for _, s := range strategies {
				// 生成具体的策略内容
				switch s.Type {
				case misc.STRATEGY_BWLIST:
					t := &misc.BwStrategy{
						Type:   s.Type,
						BwList: make([]*misc.BW, 0),
					}
					json.Unmarshal([]byte(s.Content), &t.BwList)
					s.DetailContent = t
				case misc.STRATEGY_RETRY:
					t := &misc.RetryStrategy{}
					json.Unmarshal([]byte(s.Content), &t)
					s.DetailContent = t
				case misc.STRATEGY_TRAFFIC:
					t := &misc.TrafficStrategy{}
					json.Unmarshal([]byte(s.Content), &t)
					s.DetailContent = t
				}
				misc.Strategies.Store(s.ID, s)
			}
		}()

		wg.Wait()
		time.Sleep(10 * time.Second)
	}
}
