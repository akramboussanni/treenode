package repo

import (
	"context"

	"github.com/akramboussanni/treenode/internal/model"
	"github.com/jmoiron/sqlx"
)

type TokenRepo struct {
	db *sqlx.DB
}

func NewTokenRepo(db *sqlx.DB) *TokenRepo {
	return &TokenRepo{db: db}
}

func (r *TokenRepo) RevokeToken(ctx context.Context, token model.JwtBlacklist) error {
	query := `
		INSERT INTO jwt_blacklist (jti, user_id, expires_at)
		VALUES (:jti, :user_id, :expires_at)
		ON CONFLICT(jti) DO NOTHING
	`
	_, err := r.db.NamedExecContext(ctx, query, token)
	return err
}

func (r *TokenRepo) IsTokenRevoked(jti string) (bool, error) {
	var exists bool
	err := r.db.Get(&exists, `
		SELECT EXISTS(SELECT 1 FROM jwt_blacklist WHERE jti = $1)
	`, jti)
	return exists, err
}

func (r *TokenRepo) CleanupTokens(ctx context.Context) error {
	_, err := r.db.ExecContext(ctx, `
		DELETE FROM jwt_blacklist WHERE expires_at < CURRENT_TIMESTAMP
	`)
	return err
}
