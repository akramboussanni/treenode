package model

import "encoding/json"

type Node struct {
	ID                  int64   `json:"id,string" safe:"true" db:"id"`
	OwnerID             int64   `json:"owner_id,string" safe:"true" db:"owner_id"`
	DisplayName         string  `json:"display_name" safe:"true" db:"display_name"`
	SubdomainName       string  `json:"subdomain_name" safe:"true"db:"subdomain_name"`
	Description         string  `json:"description" safe:"true" db:"description"`
	BackgroundColor     string  `json:"background_color" safe:"true" db:"background_color"`
	TitleFontColor      string  `json:"title_font_color" safe:"true" db:"title_font_color"`
	CaptionFontColor    string  `json:"caption_font_color" safe:"true" db:"caption_font_color"`
	AccentColor         string  `json:"accent_color" safe:"true" db:"accent_color"`
	ThemeColor          string  `json:"theme_color" safe:"true" db:"theme_color"`
	ShowShareButton     bool    `json:"show_share_button" safe:"true" db:"show_share_button"`
	Theme               string  `json:"theme" safe:"true" db:"theme"`
	MouseEffectsEnabled bool    `json:"mouse_effects_enabled" safe:"true" db:"mouse_effects_enabled"`
	TextShadowsEnabled  bool    `json:"text_shadows_enabled" safe:"true" db:"text_shadows_enabled"`
	HidePoweredBy       bool    `json:"hide_powered_by" safe:"true" db:"hide_powered_by"`
	PageTitle           string  `json:"page_title" safe:"true" db:"page_title"`
	Domain              string  `json:"domain" safe:"true" db:"domain"`
	DomainVerified      bool    `json:"domain_verified" safe:"true" db:"domain_verified"`
	CreatedAt           int64   `json:"created_at" safe:"true" db:"created_at"`
	UpdatedAt           int64   `json:"updated_at" safe:"true" db:"updated_at"`
	Collaborators       []int64 `json:"collaborators,omitempty" safe:"true" db:"-"`
}

// ensures empty slices are serialized as [] instead of null
func (n *Node) MarshalJSON() ([]byte, error) {
	type Alias Node
	return json.Marshal(&struct {
		*Alias
		Collaborators []int64 `json:"collaborators"`
	}{
		Alias:         (*Alias)(n),
		Collaborators: n.Collaborators,
	})
}
