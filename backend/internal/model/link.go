package model

import "encoding/json"

type Link struct {
	ID     int64 `json:"id,string" db:"id"`
	NodeID int64 `json:"node_id,string" db:"node_id"`

	Name        string `json:"name" db:"name"`
	DisplayName string `json:"display_name" db:"display_name"`
	Link        string `json:"link" db:"link"`
	Description string `json:"description" db:"description"`

	Visible bool `json:"visible" db:"visible"`
	Enabled bool `json:"enabled" db:"enabled"`
	Mini    bool `json:"mini" db:"mini"`

	Icon          string      `json:"icon" db:"icon"`
	Position      int         `json:"position" db:"position"`
	CreatedAt     int64       `json:"created_at,string" db:"created_at"`
	UpdatedAt     int64       `json:"updated_at,string" db:"updated_at"`
	GradientType  string      `json:"gradient_type" db:"gradient_type"`
	GradientAngle float64     `json:"gradient_angle" db:"gradient_angle"`
	ColorStops    []ColorStop `json:"color_stops" safe:"true" db:"-"`

	CustomAccentColorEnabled      bool   `json:"custom_accent_color_enabled" db:"custom_accent_color_enabled"`
	CustomAccentColor             string `json:"custom_accent_color" db:"custom_accent_color"`
	CustomTitleColorEnabled       bool   `json:"custom_title_color_enabled" db:"custom_title_color_enabled"`
	CustomTitleColor              string `json:"custom_title_color" db:"custom_title_color"`
	CustomDescriptionColorEnabled bool   `json:"custom_description_color_enabled" db:"custom_description_color_enabled"`
	CustomDescriptionColor        string `json:"custom_description_color" db:"custom_description_color"`
}

// ensures empty slices are serialized as [] instead of null
func (l *Link) MarshalJSON() ([]byte, error) {
	type Alias Link
	return json.Marshal(&struct {
		*Alias
		ColorStops []ColorStop `json:"color_stops"`
	}{
		Alias:      (*Alias)(l),
		ColorStops: l.ColorStops,
	})
}

type ColorStop struct {
	ID        int64   `json:"id,string" db:"id"`
	LinkID    int64   `json:"link_id,string" db:"link_id"`
	Color     string  `json:"color" db:"color"`
	Position  float64 `json:"position" db:"position"`
	CreatedAt int64   `json:"created_at,string" db:"created_at"`
	UpdatedAt int64   `json:"updated_at,string" db:"updated_at"`
}
