package api

import "github.com/imdotdev/im.dev/server/pkg/log"

var logger = log.RootLogger.New("logger", "api")

/* 鉴权、数据合法性验证都在api模块进行处理 */
