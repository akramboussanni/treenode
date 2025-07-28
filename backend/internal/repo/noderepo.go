package repo

import (
	"context"
	"fmt"

	"github.com/akramboussanni/treenode/internal/model"
	"github.com/jmoiron/sqlx"
)

type NodeRepo struct {
	Columns
	db *sqlx.DB
}

func NewNodeRepo(db *sqlx.DB) *NodeRepo {
	repo := &NodeRepo{db: db}
	repo.Columns = ExtractColumns[model.Node]()
	return repo
}

func (r *NodeRepo) CreateNode(ctx context.Context, node *model.Node) error {
	query := fmt.Sprintf(
		"INSERT INTO nodes (%s) VALUES (%s)",
		r.AllRaw,
		r.AllPrefixed,
	)
	_, err := r.db.NamedExecContext(ctx, query, node)
	return err
}

func (r *NodeRepo) GetNodeByID(ctx context.Context, id int64) (*model.Node, error) {
	var node model.Node
	query := fmt.Sprintf("SELECT %s FROM nodes WHERE id = $1", r.AllRaw)
	err := r.db.GetContext(ctx, &node, query, id)
	return &node, err
}

func (r *NodeRepo) GetNodeByDomain(ctx context.Context, domain string) (*model.Node, error) {
	var node model.Node
	query := fmt.Sprintf("SELECT %s FROM nodes WHERE domain = $1", r.AllRaw)
	err := r.db.GetContext(ctx, &node, query, domain)
	return &node, err
}

func (r *NodeRepo) GetNodesByOwnerID(ctx context.Context, ownerID int64) ([]model.Node, error) {
	var nodes []model.Node
	query := fmt.Sprintf("SELECT %s FROM nodes WHERE owner_id = $1 ORDER BY created_at DESC", r.AllRaw)
	err := r.db.SelectContext(ctx, &nodes, query, ownerID)
	return nodes, err
}

func (r *NodeRepo) UpdateNode(ctx context.Context, node *model.Node) error {
	query := `
		UPDATE nodes 
		SET domain = $1, domain_verified = $2, subdomain_name = $3, display_name = $4, 
		    description = $5, background_color = $6, title_font_color = $7, caption_font_color = $8, 
		    accent_color = $9, theme_color = $10, show_share_button = $11, theme = $12, 
		    mouse_effects_enabled = $13, text_shadows_enabled = $14, page_title = $15, updated_at = $16, hide_powered_by = $17
		WHERE id = $18
	`
	_, err := r.db.ExecContext(ctx, query,
		node.Domain, node.DomainVerified, node.SubdomainName, node.DisplayName,
		node.Description, node.BackgroundColor, node.TitleFontColor, node.CaptionFontColor,
		node.AccentColor, node.ThemeColor, node.ShowShareButton, node.Theme,
		node.MouseEffectsEnabled, node.TextShadowsEnabled, node.PageTitle, node.UpdatedAt, node.HidePoweredBy, node.ID)
	return err
}

func (r *NodeRepo) DeleteNode(ctx context.Context, id int64) error {
	query := `DELETE FROM nodes WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

func (r *NodeRepo) CheckNodeAccess(ctx context.Context, nodeID int64, userID int64) (bool, error) {
	var exists bool
	err := r.db.GetContext(ctx, &exists, `
		SELECT EXISTS(
			SELECT 1 FROM nodes WHERE id = $1 AND owner_id = $2
			UNION
			SELECT 1 FROM node_access WHERE node_id = $1 AND user_id = $2
		)
	`, nodeID, userID)
	return exists, err
}

func (r *NodeRepo) AddNodeAccess(ctx context.Context, nodeID int64, userID int64) error {
	query := `INSERT INTO node_access (node_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`
	_, err := r.db.ExecContext(ctx, query, nodeID, userID)
	return err
}

func (r *NodeRepo) RemoveNodeAccess(ctx context.Context, nodeID int64, userID int64) error {
	query := `DELETE FROM node_access WHERE node_id = $1 AND user_id = $2`
	_, err := r.db.ExecContext(ctx, query, nodeID, userID)
	return err
}

func (r *NodeRepo) LoadCollaborators(ctx context.Context, node *model.Node) error {
	query := `SELECT user_id FROM node_access WHERE node_id = $1`
	err := r.db.SelectContext(ctx, &node.Collaborators, query, node.ID)
	return err
}

func (r *NodeRepo) DuplicateSubdomain(ctx context.Context, subdomainName string) (bool, error) {
	var exists bool
	err := r.db.GetContext(ctx, &exists, "SELECT EXISTS(SELECT 1 FROM nodes WHERE subdomain_name = $1)", subdomainName)
	return exists, err
}

func (r *NodeRepo) DuplicateSubdomainExcludingNode(ctx context.Context, subdomainName string, excludeNodeID int64) (bool, error) {
	var exists bool
	err := r.db.GetContext(ctx, &exists, "SELECT EXISTS(SELECT 1 FROM nodes WHERE subdomain_name = $1 AND id != $2)", subdomainName, excludeNodeID)
	return exists, err
}

func (r *NodeRepo) NodeExists(ctx context.Context, id int64) (bool, error) {
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM nodes WHERE id = $1)`
	err := r.db.GetContext(ctx, &exists, query, id)
	return exists, err
}

func (r *NodeRepo) GetNodeBySubdomain(ctx context.Context, subdomainName string) (*model.Node, error) {
	var node model.Node
	query := fmt.Sprintf("SELECT %s FROM nodes WHERE subdomain_name = $1", r.AllRaw)
	err := r.db.GetContext(ctx, &node, query, subdomainName)
	return &node, err
}

func (r *NodeRepo) GetSharedNodesByUserID(ctx context.Context, userID int64) ([]model.Node, error) {
	var nodes []model.Node
	query := fmt.Sprintf(`
		SELECT DISTINCT n.%s 
		FROM nodes n
		INNER JOIN node_access na ON n.id = na.node_id
		WHERE na.user_id = $1 AND n.owner_id != $1
		ORDER BY n.created_at DESC
	`, r.AllRaw)
	err := r.db.SelectContext(ctx, &nodes, query, userID)
	return nodes, err
}
