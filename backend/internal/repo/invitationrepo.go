package repo

import (
	"context"
	"fmt"
	"time"

	"github.com/akramboussanni/treenode/internal/model"
	"github.com/jmoiron/sqlx"
)

type InvitationRepo struct {
	Columns
	db *sqlx.DB
}

func NewInvitationRepo(db *sqlx.DB) *InvitationRepo {
	repo := &InvitationRepo{db: db}
	repo.Columns = ExtractColumns[model.Invitation]()
	return repo
}

func (ir *InvitationRepo) CreateInvitation(ctx context.Context, invitation *model.Invitation) error {
	query := fmt.Sprintf(
		"INSERT INTO invitations (%s) VALUES (%s)",
		ir.AllRaw,
		ir.AllPrefixed,
	)
	_, err := ir.db.NamedExecContext(ctx, query, invitation)
	return err
}

func (ir *InvitationRepo) GetInvitationByToken(ctx context.Context, token string) (*model.Invitation, error) {
	var invitation model.Invitation
	query := fmt.Sprintf("SELECT %s FROM invitations WHERE token = $1", ir.AllRaw)
	err := ir.db.GetContext(ctx, &invitation, query, token)
	return &invitation, err
}

func (ir *InvitationRepo) GetInvitationsByNodeID(ctx context.Context, nodeID int64) ([]*model.Invitation, error) {
	var invitations []*model.Invitation
	query := fmt.Sprintf("SELECT %s FROM invitations WHERE node_id = $1 ORDER BY created_at DESC", ir.AllRaw)
	err := ir.db.SelectContext(ctx, &invitations, query, nodeID)
	return invitations, err
}

func (ir *InvitationRepo) UpdateInvitation(ctx context.Context, invitation *model.Invitation) error {
	query := `
		UPDATE invitations
		SET accepted = $1, updated_at = $2
		WHERE id = $3
	`

	_, err := ir.db.ExecContext(ctx, query,
		invitation.Accepted,
		invitation.UpdatedAt,
		invitation.ID,
	)

	return err
}

func (ir *InvitationRepo) DeleteExpiredInvitations(ctx context.Context) error {
	query := `
		DELETE FROM invitations
		WHERE expires_at < $1
	`

	_, err := ir.db.ExecContext(ctx, query, time.Now().UTC().Unix())
	return err
}

func (ir *InvitationRepo) CheckExistingInvitation(ctx context.Context, nodeID int64, userID int64) (bool, error) {
	query := `
		SELECT EXISTS(
			SELECT 1 FROM invitations
			WHERE node_id = $1 AND user_id = $2 AND accepted = false AND expires_at > $3
		)
	`

	var exists bool
	err := ir.db.QueryRowContext(ctx, query, nodeID, userID, time.Now().UTC().Unix()).Scan(&exists)
	return exists, err
}

func (ir *InvitationRepo) GetInvitationByNodeAndUser(ctx context.Context, nodeID int64, userID int64) (*model.Invitation, error) {
	var invitation model.Invitation
	query := fmt.Sprintf("SELECT %s FROM invitations WHERE node_id = $1 AND user_id = $2 ORDER BY created_at DESC LIMIT 1", ir.AllRaw)
	err := ir.db.GetContext(ctx, &invitation, query, nodeID, userID)
	if err != nil {
		return nil, err
	}
	return &invitation, nil
}

func (ir *InvitationRepo) UpdateInvitationForResend(ctx context.Context, invitation *model.Invitation) error {
	query := `
		UPDATE invitations
		SET token = $1, expires_at = $2, updated_at = $3
		WHERE id = $4
	`

	_, err := ir.db.ExecContext(ctx, query,
		invitation.Token,
		invitation.ExpiresAt,
		invitation.UpdatedAt,
		invitation.ID,
	)

	return err
}
