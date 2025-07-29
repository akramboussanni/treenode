package node

import "github.com/akramboussanni/treenode/internal/model"

type CreateNodeRequest struct {
	SubdomainName string `json:"subdomain_name" binding:"required"`
}

type UpdateNodeRequest struct {
	DisplayName         string `json:"display_name"`
	Description         string `json:"description"`
	BackgroundColor     string `json:"background_color"`
	TitleFontColor      string `json:"title_font_color"`
	CaptionFontColor    string `json:"caption_font_color"`
	AccentColor         string `json:"accent_color"`
	ThemeColor          string `json:"theme_color"`
	ShowShareButton     *bool  `json:"show_share_button"`
	Theme               string `json:"theme"`
	MouseEffectsEnabled *bool  `json:"mouse_effects_enabled"`
	TextShadowsEnabled  *bool  `json:"text_shadows_enabled"`
	SubdomainName       string `json:"subdomain_name"`
	PageTitle           string `json:"page_title"`
	HidePoweredBy       *bool  `json:"hide_powered_by"`
}

type CreateLinkRequest struct {
	Name                          string                   `json:"name"`
	DisplayName                   string                   `json:"display_name" binding:"required"`
	Link                          string                   `json:"link"`
	Description                   string                   `json:"description"`
	Icon                          string                   `json:"icon"`
	Visible                       bool                     `json:"visible"`
	Enabled                       bool                     `json:"enabled"`
	Mini                          bool                     `json:"mini"`
	GradientType                  string                   `json:"gradient_type"`
	GradientAngle                 float64                  `json:"gradient_angle"`
	ColorStops                    []CreateColorStopRequest `json:"color_stops"`
	CustomAccentColorEnabled      *bool                    `json:"custom_accent_color_enabled"`
	CustomAccentColor             string                   `json:"custom_accent_color"`
	CustomTitleColorEnabled       *bool                    `json:"custom_title_color_enabled"`
	CustomTitleColor              string                   `json:"custom_title_color"`
	CustomDescriptionColorEnabled *bool                    `json:"custom_description_color_enabled"`
	CustomDescriptionColor        string                   `json:"custom_description_color"`
	MiniBackgroundEnabled         *bool                    `json:"mini_background_enabled"`
}

type UpdateLinkRequest struct {
	Name                          string                   `json:"name"`
	DisplayName                   string                   `json:"display_name"`
	Link                          string                   `json:"link"`
	Description                   string                   `json:"description"`
	Icon                          string                   `json:"icon"`
	Visible                       bool                     `json:"visible"`
	Enabled                       bool                     `json:"enabled"`
	Mini                          bool                     `json:"mini"`
	GradientType                  string                   `json:"gradient_type"`
	GradientAngle                 float64                  `json:"gradient_angle"`
	ColorStops                    []CreateColorStopRequest `json:"color_stops"`
	CustomAccentColorEnabled      *bool                    `json:"custom_accent_color_enabled"`
	CustomAccentColor             string                   `json:"custom_accent_color"`
	CustomTitleColorEnabled       *bool                    `json:"custom_title_color_enabled"`
	CustomTitleColor              string                   `json:"custom_title_color"`
	CustomDescriptionColorEnabled *bool                    `json:"custom_description_color_enabled"`
	CustomDescriptionColor        string                   `json:"custom_description_color"`
	MiniBackgroundEnabled         *bool                    `json:"mini_background_enabled"`
}

type CreateColorStopRequest struct {
	Color    string  `json:"color"`
	Position float64 `json:"position"`
}

type UpdateColorStopRequest struct {
	Color    string  `json:"color" binding:"required"`
	Position float64 `json:"position,string" binding:"required"`
}

type TransferOwnershipRequest struct {
	NewOwnerID int64 `json:"new_owner_id,string"`
}

type AddCollaboratorRequest struct {
	UserID int64 `json:"user_id,string"`
}

type InviteCollaboratorRequest struct {
	Email   string `json:"email" binding:"required,email"`
	BaseURL string `json:"base_url" binding:"required"`
}

type AcceptInvitationRequest struct {
	Token string `json:"token" binding:"required"`
}

type SharedNodeGroup struct {
	OwnerID   int64        `json:"owner_id,string"`
	OwnerName string       `json:"owner_name"`
	Nodes     []model.Node `json:"nodes"`
}
