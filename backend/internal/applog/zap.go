package applog

import (
	"go.uber.org/zap"
)

type ZapLogger struct {
	logger *zap.SugaredLogger
}

func NewZapLogger() *ZapLogger {
	l, _ := zap.NewProduction()
	return &ZapLogger{logger: l.Sugar()}
}

func (l *ZapLogger) Info(args ...any) {
	l.logger.Infow("", args...)
}

func (l *ZapLogger) Warn(args ...any) {
	l.logger.Warnw("", args...)
}

func (l *ZapLogger) Error(args ...any) {
	l.logger.Errorw("", args...)
}
