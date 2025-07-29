package repo

import (
	"context"
	"fmt"
	"time"

	"github.com/akramboussanni/treenode/internal/model"
	"github.com/jmoiron/sqlx"
)

type LinkRepo struct {
	linkColumns      Columns
	colorStopColumns Columns
	db               *sqlx.DB
}

func NewLinkRepo(db *sqlx.DB) *LinkRepo {
	repo := &LinkRepo{db: db}
	repo.linkColumns = ExtractColumns[model.Link]()
	repo.colorStopColumns = ExtractColumns[model.ColorStop]()
	return repo
}

func (r *LinkRepo) CreateLink(ctx context.Context, link *model.Link) error {
	// Get the next position value for this node
	var maxPosition int
	query := `SELECT COALESCE(MAX(position), -1) FROM links WHERE node_id = $1`
	err := r.db.GetContext(ctx, &maxPosition, query, link.NodeID)
	if err != nil {
		return err
	}

	// Set the position to the next available position
	link.Position = maxPosition + 1

	insertQuery := fmt.Sprintf(
		"INSERT INTO links (%s) VALUES (%s)",
		r.linkColumns.AllRaw,
		r.linkColumns.AllPrefixed,
	)
	_, err = r.db.NamedExecContext(ctx, insertQuery, link)
	return err
}

func (r *LinkRepo) GetLinkByID(ctx context.Context, id int64) (*model.Link, error) {
	var link model.Link
	query := fmt.Sprintf("SELECT %s FROM links WHERE id = $1", r.linkColumns.AllRaw)
	err := r.db.GetContext(ctx, &link, query, id)
	return &link, err
}

func (r *LinkRepo) GetLinksByNodeID(ctx context.Context, nodeID int64) ([]model.Link, error) {
	var links []model.Link
	query := fmt.Sprintf("SELECT %s FROM links WHERE node_id = $1 ORDER BY position ASC, created_at ASC", r.linkColumns.AllRaw)
	err := r.db.SelectContext(ctx, &links, query, nodeID)
	return links, err
}

func (r *LinkRepo) DeleteLink(ctx context.Context, id int64) error {
	query := `DELETE FROM links WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

func (r *LinkRepo) DeleteLinksByNodeID(ctx context.Context, nodeID int64) error {
	query := `DELETE FROM links WHERE node_id = $1`
	_, err := r.db.ExecContext(ctx, query, nodeID)
	return err
}

func (r *LinkRepo) CreateColorStop(ctx context.Context, colorStop *model.ColorStop) error {
	query := fmt.Sprintf(
		"INSERT INTO color_stops (%s) VALUES (%s)",
		r.colorStopColumns.AllRaw,
		r.colorStopColumns.AllPrefixed,
	)
	_, err := r.db.NamedExecContext(ctx, query, colorStop)
	return err
}

func (r *LinkRepo) GetColorStopByID(ctx context.Context, id int64) (*model.ColorStop, error) {
	var colorStop model.ColorStop
	query := fmt.Sprintf("SELECT %s FROM color_stops WHERE id = $1", r.colorStopColumns.AllRaw)
	err := r.db.GetContext(ctx, &colorStop, query, id)
	return &colorStop, err
}

func (r *LinkRepo) GetColorStopsByLinkID(ctx context.Context, linkID int64) ([]model.ColorStop, error) {
	var colorStops []model.ColorStop
	query := fmt.Sprintf("SELECT %s FROM color_stops WHERE link_id = $1 ORDER BY position ASC", r.colorStopColumns.AllRaw)
	err := r.db.SelectContext(ctx, &colorStops, query, linkID)
	return colorStops, err
}

func (r *LinkRepo) LoadColorStops(ctx context.Context, link *model.Link) error {
	colorStops, err := r.GetColorStopsByLinkID(ctx, link.ID)
	if err != nil {
		return err
	}
	link.ColorStops = colorStops
	return nil
}

func (r *LinkRepo) DeleteColorStop(ctx context.Context, id int64) error {
	query := `DELETE FROM color_stops WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

func (r *LinkRepo) DeleteColorStopsByLinkID(ctx context.Context, linkID int64) error {
	query := `DELETE FROM color_stops WHERE link_id = $1`
	_, err := r.db.ExecContext(ctx, query, linkID)
	return err
}

func (r *LinkRepo) UpdateLinkName(ctx context.Context, linkID int64, name string) error {
	query := `UPDATE links SET name = $1 WHERE id = $2`
	_, err := r.db.ExecContext(ctx, query, name, linkID)
	return err
}

func (r *LinkRepo) CheckNameExists(ctx context.Context, name string) (bool, error) {
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM links WHERE name = $1)`
	err := r.db.GetContext(ctx, &exists, query, name)
	return exists, err
}

func (r *LinkRepo) CheckNameExistsInNode(ctx context.Context, name string, nodeID int64) (bool, error) {
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM links WHERE name = $1 AND node_id = $2)`
	err := r.db.GetContext(ctx, &exists, query, name, nodeID)
	return exists, err
}

func (r *LinkRepo) GetVisibleLinksByNodeID(ctx context.Context, nodeID int64) ([]model.Link, error) {
	var links []model.Link
	query := fmt.Sprintf("SELECT %s FROM links WHERE node_id = $1 AND visible = true AND enabled = true ORDER BY position ASC, created_at ASC", r.linkColumns.AllRaw)
	err := r.db.SelectContext(ctx, &links, query, nodeID)
	return links, err
}

func (r *LinkRepo) GetLinkRedirectByNameAndNodeID(ctx context.Context, name string, nodeID int64) (string, error) {
	var link string
	query := `SELECT link FROM links WHERE name = $1 AND node_id = $2 AND visible = true AND enabled = true`
	err := r.db.GetContext(ctx, &link, query, name, nodeID)
	return link, err
}

func (r *LinkRepo) GetLinkByNameAndNodeID(ctx context.Context, name string, nodeID int64) (*model.Link, error) {
	var link model.Link
	query := fmt.Sprintf("SELECT %s FROM links WHERE name = $1 AND node_id = $2", r.linkColumns.AllRaw)
	err := r.db.GetContext(ctx, &link, query, name, nodeID)
	return &link, err
}

func (r *LinkRepo) UpdateLink(ctx context.Context, link *model.Link) error {
	query := `
		UPDATE links 
		SET name = $1, display_name = $2, link = $3, description = $4, icon = $5, visible = $6, enabled = $7, mini = $8,
		    gradient_type = $9, gradient_angle = $10, custom_accent_color_enabled = $11, custom_accent_color = $12, 
		    custom_title_color_enabled = $13, custom_title_color = $14, custom_description_color_enabled = $15, 
		    custom_description_color = $16, updated_at = $17
		WHERE id = $18
	`
	_, err := r.db.ExecContext(ctx, query,
		link.Name, link.DisplayName, link.Link, link.Description, link.Icon, link.Visible, link.Enabled, link.Mini,
		link.GradientType, link.GradientAngle, link.CustomAccentColorEnabled, link.CustomAccentColor,
		link.CustomTitleColorEnabled, link.CustomTitleColor, link.CustomDescriptionColorEnabled, link.CustomDescriptionColor,
		time.Now().UTC().Unix(), link.ID)
	return err
}

func (r *LinkRepo) UpdateColorStop(ctx context.Context, colorStop *model.ColorStop) error {
	query := `
		UPDATE color_stops 
		SET color = $1, position = $2, updated_at = $3
		WHERE id = $4
	`
	_, err := r.db.ExecContext(ctx, query,
		colorStop.Color, colorStop.Position, time.Now().UTC().Unix(), colorStop.ID)
	return err
}

func (r *LinkRepo) UpdateLinkOrder(ctx context.Context, linkID int64, newPosition int) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	var link model.Link
	query := fmt.Sprintf("SELECT %s FROM links WHERE id = $1", r.linkColumns.AllRaw)
	err = tx.GetContext(ctx, &link, query, linkID)
	if err != nil {
		return err
	}

	var links []model.Link
	query = fmt.Sprintf("SELECT %s FROM links WHERE node_id = $1 ORDER BY position ASC", r.linkColumns.AllRaw)
	err = tx.SelectContext(ctx, &links, query, link.NodeID)
	if err != nil {
		return err
	}

	currentIndex := -1
	for i, l := range links {
		if l.ID == linkID {
			currentIndex = i
			break
		}
	}

	if currentIndex == -1 {
		return fmt.Errorf("link not found")
	}

	if newPosition < 0 || newPosition >= len(links) {
		return fmt.Errorf("invalid position")
	}

	if currentIndex == newPosition {
		return tx.Commit()
	}

	newOrder := make([]int, len(links))

	for i := range links {
		newOrder[i] = i
	}

	removed := newOrder[currentIndex]
	copy(newOrder[currentIndex:], newOrder[currentIndex+1:])
	newOrder = newOrder[:len(newOrder)-1]

	if newPosition > currentIndex {
		newPosition--
	}

	newOrder = append(newOrder[:newPosition], append([]int{removed}, newOrder[newPosition:]...)...)

	for i, linkItem := range links {
		updateQuery := `UPDATE links SET position = $1 WHERE id = $2`
		_, err = tx.ExecContext(ctx, updateQuery, newOrder[i], linkItem.ID)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}
