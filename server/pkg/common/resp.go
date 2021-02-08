package common

import "github.com/imdotdev/im.dev/server/pkg/e"

type Resp struct {
	Status  string      `json:"status"`
	Data    interface{} `json:"data,omitempty"`
	Message string      `json:"message,omitempty"`
}

func RespSuccess(data interface{}) *Resp {
	r := &Resp{}
	r.Status = Success
	r.Data = data

	return r
}

func RespError(msg string) *Resp {
	r := &Resp{}
	r.Status = Error
	r.Message = msg

	return r
}

func RespInternalError() *Resp {
	r := &Resp{}
	r.Status = Error
	r.Message = e.Internal

	return r
}
