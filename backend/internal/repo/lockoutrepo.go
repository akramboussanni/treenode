package repo

import (
	"context"
	"fmt"
	"time"

	"github.com/akramboussanni/treenode/config"
	"github.com/akramboussanni/treenode/internal/model"
	"github.com/jmoiron/sqlx"
)

type LockoutRepo struct {
	attemptColumns Columns
	lockoutColumns Columns
	db             *sqlx.DB
}

func NewLockoutRepo(db *sqlx.DB) *LockoutRepo {
	repo := &LockoutRepo{db: db}
	repo.attemptColumns = ExtractColumns[model.FailedLogin]()
	repo.lockoutColumns = ExtractColumns[model.Lockout]()
	return repo
}

func (r *LockoutRepo) IsLockedOut(ctx context.Context, userID int64, ipAddress string) (bool, error) {
	now := time.Now().UTC().Unix()

	var exists bool
	err := r.db.GetContext(ctx, &exists, `
		SELECT EXISTS(
			SELECT 1 FROM lockouts 
			WHERE user_id = $1 AND ip_address = $2 AND locked_until > $3 AND active = TRUE
		)
	`, userID, ipAddress, now)
	return exists, err
}

func (r *LockoutRepo) AddLockout(ctx context.Context, lockout model.Lockout) error {
	query := fmt.Sprintf(
		"INSERT INTO lockouts (%s) VALUES (%s)",
		r.lockoutColumns.AllRaw,
		r.lockoutColumns.AllPrefixed,
	)
	_, err := r.db.NamedExecContext(ctx, query, lockout)
	return err
}

func (r *LockoutRepo) UnlockAccount(ctx context.Context, userID int64, ipAddress string) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return err
	}

	_, err = tx.ExecContext(ctx, `
		UPDATE failed_logins
		SET active = FALSE
		WHERE user_id = $1 AND ip_address = $2;
	`, userID, ipAddress)
	if err != nil {
		tx.Rollback()
		return err
	}

	_, err = tx.ExecContext(ctx, `
		UPDATE lockouts
		SET active = FALSE
		WHERE user_id = $1 AND ip_address = $2;
	`, userID, ipAddress)
	if err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit()
}

func (r *LockoutRepo) AddFailedLogin(ctx context.Context, failedLogin model.FailedLogin) error {
	query := fmt.Sprintf(
		"INSERT INTO failed_logins (%s) VALUES (%s)",
		r.attemptColumns.AllRaw,
		r.attemptColumns.AllPrefixed,
	)
	_, err := r.db.NamedExecContext(ctx, query, failedLogin)
	return err
}

func (r *LockoutRepo) CountRecentFailures(ctx context.Context, userID int64, ipAddress string) (int, error) {
	now := time.Now().UTC().Unix()
	ago := now - config.App.FailedLoginBacktrack

	var count int
	err := r.db.GetContext(ctx, &count, `
		SELECT COUNT(*) FROM failed_logins
		WHERE user_id = $1 AND ip_address = $2 AND attempted_at > $3 AND active = TRUE
	`, userID, ipAddress, ago)
	return count, err
}
