package misc

type TrafficConReq struct {
	ApiName    string
	StrategyID int
	ParamVal   string // 用户流量限定中对应的参数值，例如限定了mobile，则对应的值为15880261185
}
type TrafficConRes struct {
	Suc   bool
	Error string
}
