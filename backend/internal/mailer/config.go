package mailer

type MailerConfig struct {
	Type     MailerType `env:"MAILER_TYPE" panic:"true" default:"mock"`
	Host     string     `env:"MAILER_HOST" panic:"warn" default:"localhost"`
	Port     int        `env:"MAILER_PORT" panic:"warn" default:"587"`
	Username string     `env:"MAILER_USERNAME" panic:"warn" default:""`
	Password string     `env:"MAILER_PASSWORD" panic:"warn" default:""`
	APIKey   string     `env:"MAILER_API_KEY" panic:"warn" default:""`
}
