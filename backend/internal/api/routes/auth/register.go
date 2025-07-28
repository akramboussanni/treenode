package auth

import (
	"net/http"
	"strings"
	"time"

	"github.com/akramboussanni/treenode/internal/api"
	"github.com/akramboussanni/treenode/internal/applog"
	"github.com/akramboussanni/treenode/internal/model"
	"github.com/akramboussanni/treenode/internal/utils"
)

// @Summary Register new user account
// @Description Register a new user account with email confirmation. The system will validate credentials, check for duplicates, hash the password, and send a confirmation email. Username cannot contain '@' symbol.
// @Tags Authentication
// @Accept json
// @Produce json
// @Param X-Recaptcha-Token header string false "reCAPTCHA verification token (optional if reCAPTCHA is not configured)"
// @Param request body RegisterRequest true "User registration credentials including confirmation URL"
// @Success 200 {object} api.SuccessResponse "User account created successfully - confirmation email sent"
// @Failure 400 {object} api.ErrorResponse "Invalid credentials, duplicate username, or validation errors"
// @Failure 429 {object} api.ErrorResponse "Rate limit exceeded (2 requests per minute)"
// @Failure 500 {object} api.ErrorResponse "Internal server error or email sending failure"
// @Router /auth/register [post]
func (ar *AuthRouter) HandleRegister(w http.ResponseWriter, r *http.Request) {
	applog.Info("HandleRegister called", "remoteAddr:", utils.GetClientIP(r))
	req, err := api.DecodeJSON[RegisterRequest](w, r)
	if err != nil {
		applog.Error("Failed to decode register request:", err)
		return
	}

	if req.Username == "" || req.Email == "" || req.Password == "" {
		applog.Warn("Missing registration fields", "username:", req.Username, "email:", req.Email)
		http.Error(w, "invalid credentials", http.StatusBadRequest)
		return
	}

	if strings.Contains(req.Username, "@") || !utils.IsValidEmail(req.Email) || !utils.IsValidPassword(req.Password) {
		applog.Warn("Invalid registration credentials", "username:", req.Username, "email:", req.Email)
		http.Error(w, "invalid credentials", http.StatusBadRequest)
		return
	}

	duplicate, err := ar.UserRepo.DuplicateName(r.Context(), req.Username)
	if err != nil {
		applog.Error("Failed to check duplicate username:", err)
		api.WriteInternalError(w)
		return
	}

	if duplicate {
		applog.Warn("Duplicate username registration attempt", "username:", req.Username)
		http.Error(w, "invalid credentials", http.StatusBadRequest)
		return
	}

	hash, err := utils.HashPassword(req.Password)
	if err != nil {
		applog.Error("Failed to hash password:", err)
		api.WriteInternalError(w)
		return
	}

	user := &model.User{ID: utils.GenerateSnowflakeID(), Username: req.Username, PasswordHash: hash, Email: req.Email, CreatedAt: time.Now().UTC().Unix(), Role: "user", EmailConfirmed: false}

	if err := ar.UserRepo.CreateUser(r.Context(), user); err != nil {
		applog.Error("Failed to create user:", err)
		api.WriteInternalError(w)
		return
	}

	expiryStr := utils.ExpiryToString(24 * 3600)
	token, err := GenerateTokenAndSendEmail(user.Email, "confirmregister", "Email confirmation", req.Url, map[string]any{"Expiry": expiryStr, "Url": req.Url})
	if err != nil {
		applog.Error("Failed to send confirmation email:", err)
		api.WriteInternalError(w)
		return
	}

	if err := ar.UserRepo.AssignUserConfirmToken(r.Context(), token.Hash, time.Now().UTC().Unix(), user.ID); err != nil {
		applog.Error("Failed to assign confirmation token:", err)
		api.WriteInternalError(w)
		return
	}

	applog.Info("User registered successfully", "userID:", user.ID, "email:", user.Email)
	api.WriteMessage(w, 200, "message", "user created")
}
