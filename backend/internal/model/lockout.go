package model

type FailedLogin struct {
	ID          int64  `db:"id"`
	UserID      int64  `db:"user_id"`
	IPAddress   string `db:"ip_address"`
	AttemptedAt int64  `db:"attempted_at"`
	Active      bool   `db:"active"`
}

type Lockout struct {
	ID          int64  `db:"id"`
	UserID      int64  `db:"user_id"`
	IPAddress   string `db:"ip_address"`
	LockedUntil int64  `db:"locked_until"`
	Reason      string `db:"reason"`
	Active      bool   `db:"active"`
}
