package applog

import (
	"errors"
	"os"
)

var ErrLoggerNotInitialized = errors.New("logger not initialized")

var globalLogger Logger

type Logger interface {
	Info(args ...any)
	Warn(args ...any)
	Error(args ...any)
}

func Init(config LoggerConfig) {
	switch config.Type {
	case LoggerStd:
		globalLogger = NewStdLogger()
	case LoggerZap:
		globalLogger = NewZapLogger()
	}
}

func Info(args ...any) {
	globalLogger.Info(args...)
}

func Warn(args ...any) {
	globalLogger.Warn(args...)
}

func Error(args ...any) {
	globalLogger.Error(args...)
}

func Fatal(v ...any) {
	globalLogger.Error(v...)
	os.Exit(1)
}
