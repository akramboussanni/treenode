package model

// @Description Authentication response containing JWT tokens (for internal use - tokens are set as cookies)
type LoginTokens struct {
	Session string `json:"session" example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMjM0NTY3ODkwLCJ0b2tlbl9pZCI6ImFiY2RlZiIsImlhdCI6MTY0MDk5NTIwMCwiZXhwIjoxNjQwOTk1MjAwLCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20iLCJyb2xlIjoidXNlciJ9.signature" description:"JWT session token valid for 24 hours (set as cookie)"`
	Refresh string `json:"refresh" example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMjM0NTY3ODkwLCJ0b2tlbl9pZCI6ImFiY2RlZiIsImlhdCI6MTY0MDk5NTIwMCwiZXhwIjoxNjQwOTk1MjAwLCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20iLCJyb2xlIjoidXNlciJ9.signature" description:"JWT refresh token valid for 7 days (set as cookie)"`
}
