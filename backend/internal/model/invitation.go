package model

type Invitation struct {
	ID        int64  `json:"id,string" db:"id"`
	NodeID    int64  `json:"node_id,string" db:"node_id"`
	UserID    int64  `json:"user_id,string" db:"user_id"`
	Email     string `json:"email" db:"email"`
	Token     string `json:"token" db:"token"`
	Accepted  bool   `json:"accepted" db:"accepted"`
	ExpiresAt int64  `json:"expires_at,string" db:"expires_at"`
	CreatedAt int64  `json:"created_at,string" db:"created_at"`
	UpdatedAt int64  `json:"updated_at,string" db:"updated_at"`
}
