package auth

// @Description User registration request with email confirmation
type RegisterRequest struct {
	Username string `json:"username" example:"johndoe" binding:"required" minLength:"3" maxLength:"30" pattern:"^[a-zA-Z0-9_-]+$"`
	Email    string `json:"email" example:"john@example.com" binding:"required" format:"email"`
	Password string `json:"password" example:"SecurePass123!" binding:"required" minLength:"8"`
	Url      string `json:"url" example:"https://example.com/confirm" binding:"required" format:"uri"`
}

// @Description User login credentials
type LoginRequest struct {
	Email    string `json:"email" example:"john@example.com" binding:"required" format:"email"`
	Password string `json:"password" example:"SecurePass123!" binding:"required"`
}

// @Description Email-based request for password reset and email confirmation resend
type EmailRequest struct {
	Email string `json:"email" example:"john@example.com" binding:"required" format:"email"`
	Url   string `json:"url" example:"https://example.com/reset" format:"uri" description:"Optional URL for email templates"`
}

// @Description Token-based request for various operations (email confirmation, password reset, token refresh)
type TokenRequest struct {
	Token string `json:"token" example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." binding:"required" description:"JWT token or base64 encoded token"`
	Url   string `json:"url" example:"https://example.com/reset" format:"uri" description:"Optional URL for email templates"`
}

// @Description Password reset request with token and new password
type PasswordResetRequest struct {
	Token       string `json:"token" example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." binding:"required" description:"Password reset token from email"`
	NewPassword string `json:"new_password" example:"NewSecurePass123!" binding:"required" minLength:"8" description:"New password that meets security requirements"`
}

// @Description Password change request requiring current password verification
type PasswordChangeRequest struct {
	OldPassword string `json:"old_password" example:"SecurePass123!" binding:"required" description:"Current password for verification"`
	NewPassword string `json:"new_password" example:"NewSecurePass123!" binding:"required" minLength:"8" description:"New password that meets security requirements"`
}
