package misc

// HTTPResp is the structure for http response
type HTTPResp struct {
	ErrCode int `json:"err_code"`

	Message string `json:"message"`

	Data interface{} `json:"data"`
}
