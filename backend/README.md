# treenode
a quick-setup, fast, Go-chi backend example repository with cookie-based JWT authentication

## todo
- redis
- add worker
- rm critical env vars

## developing
### python script
the repo provides a python script to run in dev mode quickly, simply run `python run.py`.
- installs swagger cli
- updates docs
- runs in debug mode

### manual
when testing in dev mode, it is heavily recommended to apply debug tag (done by adding `-tags=debug` in your command, e.g. `go run -tags=debug cmd/server/main.go`). the benefits of doing so are:
- sqlite instead of postgres
- runs a swagger server @ `localhost:9520/swagger/`

### swagger
to update swagger docs, run `swag init -g cmd/server/main.go`

**Note:** The API uses cookie-based JWT authentication. Session and refresh tokens are automatically set as HTTP cookies during login/refresh operations.

## setup
it is recommended that you replace every `github.com/akramboussanni/treenode` to your package name. mailing needs to be configured (see section below)

treenode template supports a .env file to load env vars from.

supported env vars:
```
# ---- required ----
JWT_SECRET=[my jwt secret] - at least 32 chars

-- not required for local development
FRONTEND_CORS=https://example.com # google cors syntax for more info
COOKIE_DOMAIN=.example.com

# mailing (see mailing doc for details, section is below)
MAILER_TYPE=smtp|resend|mock # optional for local dev (uses mock by default)
MAILER_USERNAME=noreply@yourdomain.com
MAILER_HOST=smtp.example.com
MAILER_PORT=587
MAILER_PASSWORD=supersecret
MAILER_API_KEY=your-api-key

DB_CONNECTION_STRING=postgres://user:pass@localhost:5432/dbname # optional for local dev

# ---- optional ----
APP_PORT=9520 # server port
LOGGER_TYPE=std|zap # you should be using zap

# TLS Configuration (for production)
TLS_ENABLED=false # set to true to enable HTTPS
TLS_CERT_FILE=/path/to/cert.pem # path to SSL certificate
TLS_KEY_FILE=/path/to/key.pem # path to SSL private key

# security
RECAPTCHA_V3_ENABLED=false
RECAPTCHA_V3_SECRET=obtain from google website
RECAPTCHA_THRESHOLD=0.5

# rate limiting & lockout
LOCKOUT_COUNT=5
LOCKOUT_DURATION=3600 # seconds (1h)
FAILED_LOGIN_BACKTRACK=1800 # seconds (30min)
FORGOT_PASSWORD_EXPIRY=3600 # seconds (1h)
EMAIL_CONFIRM_EXPIRY=86400 # seconds (24h)

# JWT token expirations (JSON format, values in seconds)
JWT_EXPIRATIONS={"credential":900,"refresh":129600} # 15min session, 36h refresh

# proxy
TRUST_PROXY_IP_HEADERS=false # If true, trust X-Forwarded-For and X-Real-IP headers (only set true if behind a trusted reverse proxy)
```

### mailing
- ‼️ see [Mailing Documentation](internal/mailer/MAILING.md) for detailed configuration options and environment variables.
- see [Templates Documentation](internal/mailer/templates/TEMPLATES.md) for available email templates and customization options.

## deploying
### build the repo
you can build the repo with postgres (highly recommended) using `go build cmd/server/main.go`. this will produce a `main` executable file (`main.exe` on windows) that you can put on the server

### setup env vars
you can use `.env` file or normal env vars for the server. the available env vars are available above.

### reverse proxy config
if you're not using reverse proxy enable TLS by setting these env vars:
```env
TLS_ENABLED=true
TLS_CERT_FILE=/path/to/your/certificate.pem
TLS_KEY_FILE=/path/to/your/private-key.pem
```

if you do use reverse proxy: it **should** provide `X-Forwarded-For` or `X-Real-IP` headers to determine the client IP address (for rate limiting, logging, or security).

if you are doing so, the app provides an env var to trust or not these headers: `TRUST_PROXY_IP_HEADERS`. if set to `false`, ratelimits, logging, etc. will use the `RemoteAddr` supplied instead. if set to `true`, it will refer to those headers.

## warnings
**warning:** this is for my personal use/reference, the repo doesnt have caching, other features that may be necessary for a prod server. it is also not battle-tested, but i did test it myself.

## notes
server can be ran as serverless using the `github.com/apex/gateway` library (1-line switch). i will integrate this into the app at a later date. it will not support filesystem email templates however if ran this way.