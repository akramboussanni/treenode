package repo

import (
	"context"
	"fmt"

	"github.com/akramboussanni/treenode/internal/model"
	"github.com/jmoiron/sqlx"
)

type UserRepo struct {
	Columns
	db *sqlx.DB
}

func NewUserRepo(db *sqlx.DB) *UserRepo {
	repo := &UserRepo{db: db}
	repo.Columns = ExtractColumns[model.User]()
	return repo
}

func (r *UserRepo) CreateUser(ctx context.Context, user *model.User) error {
	query := fmt.Sprintf(
		"INSERT INTO users (%s) VALUES (%s)",
		r.AllRaw,
		r.AllPrefixed,
	)
	_, err := r.db.NamedExecContext(ctx, query, user)
	return err
}

func (r *UserRepo) GetUserByID(ctx context.Context, id int64) (*model.User, error) {
	var user model.User
	query := fmt.Sprintf("SELECT %s FROM users WHERE id = $1", r.AllRaw)
	err := r.db.GetContext(ctx, &user, query, id)
	return &user, err
}

func (r *UserRepo) GetUserByIDSafe(ctx context.Context, id int64) (*model.User, error) {
	var user model.User
	query := fmt.Sprintf("SELECT %s FROM users WHERE id = $1", r.SafeRaw)
	err := r.db.GetContext(ctx, &user, query, id)
	return &user, err
}

func (r *UserRepo) DuplicateName(ctx context.Context, username string) (bool, error) {
	var exists bool
	err := r.db.GetContext(ctx, &exists, "SELECT EXISTS(SELECT 1 FROM users WHERE username=$1)", username)
	return exists, err
}

func (r *UserRepo) DuplicateEmail(ctx context.Context, email string) (bool, error) {
	var exists bool
	err := r.db.GetContext(ctx, &exists, "SELECT EXISTS(SELECT 1 FROM users WHERE email=$1)", email)
	return exists, err
}

func (r *UserRepo) GetUserByEmail(ctx context.Context, email string) (*model.User, error) {
	var user model.User
	query := fmt.Sprintf("SELECT %s FROM users WHERE email=$1", r.AllRaw)
	err := r.db.GetContext(ctx, &user, query, email)
	return &user, err
}

func (r *UserRepo) DeleteUser(ctx context.Context, id int64) error {
	query := `DELETE FROM users WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

func (r *UserRepo) GetUserByConfirmationToken(ctx context.Context, tokenHash string) (*model.User, error) {
	var user model.User
	query := fmt.Sprintf("SELECT %s FROM users WHERE email_confirm_token = $1", r.AllRaw)
	err := r.db.GetContext(ctx, &user, query, tokenHash)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepo) AssignUserConfirmToken(ctx context.Context, token string, iat int64, userID int64) error {
	query := `
		UPDATE users
		SET email_confirm_token = $1,
		    email_confirm_issuedat = $2
		WHERE id = $3
	`
	_, err := r.db.ExecContext(ctx, query, token, iat, userID)
	return err
}

func (r *UserRepo) MarkUserConfirmed(ctx context.Context, userID int64) error {
	query := `
		UPDATE users
		SET email_confirmed = TRUE,
		    email_confirm_token = '',
		    email_confirm_issuedat = 0
		WHERE id = $1
	`
	_, err := r.db.ExecContext(ctx, query, userID)
	return err
}

func (r *UserRepo) AssignUserResetToken(ctx context.Context, token string, iat int64, userID int64) error {
	query := `
		UPDATE users
		SET password_reset_token = $1,
		    password_reset_issuedat = $2
		WHERE id = $3
	`
	_, err := r.db.ExecContext(ctx, query, token, iat, userID)
	return err
}

func (r *UserRepo) GetUserByResetToken(ctx context.Context, tokenHash string) (*model.User, error) {
	var user model.User
	query := fmt.Sprintf("SELECT %s FROM users WHERE password_reset_token = $1", r.AllRaw)
	err := r.db.GetContext(ctx, &user, query, tokenHash)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepo) ChangeUserPassword(ctx context.Context, newPasswordHash string, userID int64) error {
	query := `
		UPDATE users
		SET password_hash = $1,
			password_reset_token = '',
		    password_reset_issuedat = 0
		WHERE id = $2
	`
	_, err := r.db.ExecContext(ctx, query, newPasswordHash, userID)
	return err
}

func (r *UserRepo) ChangeJwtSessionID(ctx context.Context, userID int64, newID int64) error {
	query := `
		UPDATE users
		SET jwt_session_id = $1
		WHERE id = $2
	`
	_, err := r.db.ExecContext(ctx, query, newID, userID)
	return err
}
