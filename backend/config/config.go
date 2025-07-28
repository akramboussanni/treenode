package config

import (
	"encoding/base64"
	"log"

	"github.com/akramboussanni/treenode/internal/applog"
	"github.com/akramboussanni/treenode/internal/mailer"
	"github.com/joho/godotenv"
)

type AppConfig struct {
	AppPort            int    `env:"APP_PORT" default:"9520"`
	JwtSecret          string `env:"JWT_SECRET" panic:"true"`
	DbConnectionString string `env:"DB_CONNECTION_STRING" panic:"warn"`
	TrustIpHeaders     bool   `env:"TRUST_PROXY_IP_HEADERS" default:"false"`

	LockoutCount         int   `env:"LOCKOUT_COUNT" default:"5"`
	LockoutDuration      int64 `env:"LOCKOUT_DURATION" default:"3600"`       // sec (1h)
	FailedLoginBacktrack int64 `env:"FAILED_LOGIN_BACKTRACK" default:"1800"` // sec (30min)
	ForgotPasswordExpiry int64 `env:"FORGOT_PASSWORD_EXPIRY" default:"3600"` // sec (1h)
	EmailConfirmExpiry   int64 `env:"EMAIL_CONFIRM_EXPIRY" default:"86400"`  // sec (24h)

	RecaptchaEnabled   bool    `env:"RECAPTCHA_V3_ENABLED" default:"false"`
	RecaptchaSecret    string  `env:"RECAPTCHA_V3_SECRET"`
	RecaptchaThreshold float32 `env:"RECAPTCHA_THRESHOLD" default:"0.5"`

	CookieDomain string `env:"COOKIE_DOMAIN" panic:"warn" default:"localhost"`
	FrontendCors string `env:"FRONTEND_CORS" panic:"warn" default:"*"`

	TLSEnabled  bool   `env:"TLS_ENABLED" default:"false"`
	TLSCertFile string `env:"TLS_CERT_FILE"`
	TLSKeyFile  string `env:"TLS_KEY_FILE"`

	JwtExpirations map[string]int64 `env:"JWT_EXPIRATIONS" default:"{\"credential\":900,\"refresh\":129600}"` // 15min, 36h
}

var App AppConfig
var JwtSecretBytes []byte

func Init() {
	godotenv.Load()

	App = DeconstructConfigObject[AppConfig]()

	var err error
	JwtSecretBytes, err = base64.StdEncoding.DecodeString(App.JwtSecret)
	if err != nil {
		panic("invalid JWT_SECRET: " + err.Error())
	}

	if len(JwtSecretBytes) < 32 {
		panic("JWT_SECRET must be at least 32 bytes when decoded")
	}

	// services
	if err := mailer.Init(DeconstructConfigObject[mailer.MailerConfig]()); err != nil {
		log.Fatalf("Failed to initialize mailer: %v", err)
	}

	applog.Init(DeconstructConfigObject[applog.LoggerConfig]())
}
