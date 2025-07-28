package applog

type LoggerType string

const (
	LoggerStd LoggerType = "std"
	LoggerZap LoggerType = "zap"
)

type LoggerConfig struct {
	Type LoggerType `env:"LOGGER_TYPE" default:"zap"`
}
