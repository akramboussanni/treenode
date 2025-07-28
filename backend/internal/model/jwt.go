package model

type JwtType string

const (
	CredentialJwt JwtType = "credential"
	RefreshJwt    JwtType = "refresh"
)

type JwtBlacklist struct {
	TokenID   string `db:"jti"`
	UserID    int64  `db:"user_id"`
	ExpiresAt int64  `db:"expires_at"`
}
