package log

import (
	"github.com/go-stack/stack"
	log "github.com/inconshreveable/log15"
)

var RootLogger = log.New()

func InitLogger(level string) error {
	l := log.CallerFileHandler(log.StdoutHandler)
	lvl, err := log.LvlFromString(level)
	if err != nil {
		return err
	}

	RootLogger.SetHandler(log.MultiHandler(
		log.LvlFilterHandler(lvl, l),
	))

	return nil
}

func Stack(skip int) string {
	call := stack.Caller(skip)
	s := stack.Trace().TrimBelow(call).TrimRuntime()
	return s.String()
}
