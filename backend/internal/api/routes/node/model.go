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
	Name          string                   `json:"name"`
	DisplayName   string                   `json:"display_name" binding:"required"`
	Link          string                   `json:"link" binding:"required"`
	Icon          string                   `json:"icon"`
	Visible       bool                     `json:"visible"`
	Enabled       bool                     `json:"enabled"`
	Mini          bool                     `json:"mini"`
	GradientType  string                   `json:"gradient_type"`
	GradientAngle float64                  `json:"gradient_angle"`
	ColorStops    []CreateColorStopRequest `json:"color_stops"`
}

type UpdateLinkRequest struct {
	Name          string                   `json:"name"`
	DisplayName   string                   `json:"display_name"`
	Link          string                   `json:"link"`
	Icon          string                   `json:"icon"`
	Visible       *bool                    `json:"visible"`
	Enabled       *bool                    `json:"enabled"`
	Mini          *bool                    `json:"mini"`
	GradientType  string                   `json:"gradient_type"`
	GradientAngle float64                  `json:"gradient_angle"`
	ColorStops    []CreateColorStopRequest `json:"color_stops"`
}

type CreateColorStopRequest struct {
	Color    string `json:"color" binding:"required"`
	Position int    `json:"position" binding:"required"`
}

type UpdateColorStopRequest struct {
	Color    string `json:"color" binding:"required"`
	Position int    `json:"position" binding:"required"`
}

type TransferOwnershipRequest struct {
	NewOwnerID int64 `json:"new_owner_id" binding:"required"`
}

type AddCollaboratorRequest struct {
	UserID int64 `json:"user_id" binding:"required"`
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
