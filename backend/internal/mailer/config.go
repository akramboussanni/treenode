package mailer

type MailerConfig struct {
	Type     MailerType `env:"MAILER_TYPE" panic:"true" default:"mock"`
	Host     string     `env:"MAILER_HOST" panic:"warn"`
	Port     int        `env:"MAILER_PORT" panic:"warn"`
	Username string     `env:"MAILER_USERNAME" panic:"warn"`
	Password string     `env:"MAILER_PASSWORD" panic:"warn"`
	APIKey   string     `env:"MAILER_API_KEY" panic:"warn"`
}
