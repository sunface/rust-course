package misc

import (
	"os"
	"strings"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

// InitLog the logger interface
func InitLog(level string) {
	var lv zapcore.Level
	switch strings.ToLower(level) {
	case "debug":
		lv = zap.DebugLevel
	case "info":
		lv = zap.InfoLevel
	case "warn":
		lv = zap.WarnLevel
	case "error":
		lv = zap.ErrorLevel
	}

	atom := zap.NewAtomicLevel()

	// To keep the example deterministic, disable timestamps in the output.
	encoderCfg := zap.NewProductionEncoderConfig()
	encoderCfg.EncodeTime = zapcore.ISO8601TimeEncoder
	l := zap.New(zapcore.NewCore(
		zapcore.NewConsoleEncoder(encoderCfg),

		zapcore.Lock(os.Stdout),
		atom,
	), zap.AddCaller())

	atom.SetLevel(lv)

	Log = l
}
