package api

// @Description Standard success response
type SuccessResponse struct {
	Message string `json:"message" example:"Operation completed successfully" description:"Success message"`
}

// @Description Standard error response
type ErrorResponse struct {
	Error string `json:"error" example:"Invalid request format" description:"Error message describing what went wrong"`
}

// @Description Rate limit exceeded response
type RateLimitResponse struct {
	Error      string `json:"error" example:"Rate limit exceeded" description:"Rate limit error message"`
	RetryAfter int    `json:"retry_after" example:"60" description:"Seconds to wait before retrying"`
}
