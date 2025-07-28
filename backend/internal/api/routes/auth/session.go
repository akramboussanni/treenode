package auth

import (
	"math"
	"net/http"
	"time"

	"github.com/akramboussanni/treenode/config"
	"github.com/akramboussanni/treenode/internal/api"
	"github.com/akramboussanni/treenode/internal/applog"
	"github.com/akramboussanni/treenode/internal/jwt"
	"github.com/akramboussanni/treenode/internal/middleware"
	"github.com/akramboussanni/treenode/internal/model"
	"github.com/akramboussanni/treenode/internal/utils"
)

// @Summary Authenticate user and set session cookies
// @Description Authenticate user with email and password, setting session and refresh cookies. User must have confirmed their email address.
// @Tags Authentication
// @Accept json
// @Produce json
// @Param X-Recaptcha-Token header string false "reCAPTCHA verification token (optional if reCAPTCHA is not configured)"
// @Param request body LoginRequest true "User login credentials"
// @Success 200 {object} api.SuccessResponse "Authentication successful - session and refresh cookies set"
// @Failure 400 {object} api.ErrorResponse "Invalid request format or missing required fields"
// @Failure 401 {object} api.ErrorResponse "Invalid credentials or email not confirmed"
// @Failure 429 {object} api.ErrorResponse "Rate limit exceeded (8 requests per minute)"
// @Failure 500 {object} api.ErrorResponse "Internal server error"
// @Router /auth/login [post]
func (ar *AuthRouter) HandleLogin(w http.ResponseWriter, r *http.Request) {
	ip := utils.GetClientIP(r)
	applog.Info("HandleLogin called", "remoteAddr:", ip)
	cred, err := api.DecodeJSON[LoginRequest](w, r)
	if err != nil {
		applog.Error("Failed to decode login request:", err)
		return
	}

	user, err := ar.UserRepo.GetUserByEmail(r.Context(), cred.Email)
	if err != nil || user == nil {
		applog.Warn("Login failed: user not found or db error", "email:", cred.Email, "err:", err)
		api.WriteInvalidCredentials(w)
		return
	}

	lockedOut, err := ar.LockoutRepo.IsLockedOut(r.Context(), user.ID, ip)
	if err != nil {
		applog.Error("Error checking lockout:", err)
		api.WriteInternalError(w)
		return
	}

	if lockedOut {
		applog.Warn("Account locked out", "userID:", user.ID, "ip:", ip)
		api.WriteMessage(w, 423, "error", "account locked")
		return
	}

	if !utils.ComparePassword(user.PasswordHash, cred.Password) {
		now := time.Now().UTC().Unix()
		nowMicro := time.Now().UTC().UnixMicro()
		err := ar.LockoutRepo.AddFailedLogin(r.Context(), model.FailedLogin{ID: nowMicro, UserID: user.ID, IPAddress: ip, AttemptedAt: now, Active: true})

		if err != nil {
			applog.Error("Failed to add failed login:", err)
			api.WriteInternalError(w)
			return
		}

		count, err := ar.LockoutRepo.CountRecentFailures(r.Context(), user.ID, ip)
		if err != nil {
			applog.Error("Failed to count recent failures:", err)
			api.WriteInternalError(w)
			return
		}

		if count > config.App.LockoutCount {
			err := ar.LockoutRepo.AddLockout(r.Context(), model.Lockout{
				ID:          nowMicro,
				UserID:      user.ID,
				IPAddress:   ip,
				LockedUntil: now + config.App.LockoutDuration,
				Reason:      "failed logins",
				Active:      true,
			})

			if err != nil {
				applog.Error("Failed to add lockout:", err)
				api.WriteInternalError(w)
				return
			}

			applog.Warn("User locked out due to failed logins", "userID:", user.ID, "ip:", ip)
			api.WriteMessage(w, 423, "error", "account locked")
			return
		}

		applog.Warn("Invalid password for user", "userID:", user.ID)
		api.WriteInvalidCredentials(w)
		return
	}

	if !user.EmailConfirmed {
		applog.Warn("Login attempt with unconfirmed email", "userID:", user.ID)
		api.WriteInvalidCredentials(w)
		return
	}

	loginTokens := GenerateLogin(jwt.CreateJwtFromUser(user))

	utils.ClearAllCookies(w)
	utils.SetSessionCookie(w, loginTokens.Session)
	utils.SetRefreshCookie(w, loginTokens.Refresh)

	applog.Info("User login successful", "userID:", user.ID)
	api.WriteMessage(w, 200, "message", "login successful")
}

// @Summary Refresh session cookies
// @Description Refresh user's session cookies using a valid refresh cookie. The old refresh token will be revoked and new session/refresh cookies will be set.
// @Tags Authentication
// @Accept json
// @Produce json
// @Param X-Recaptcha-Token header string false "reCAPTCHA verification token (optional if reCAPTCHA is not configured)"
// @Success 200 {object} api.SuccessResponse "Token refresh successful - new session and refresh cookies set"
// @Failure 401 {object} api.ErrorResponse "Invalid, expired, or revoked refresh token"
// @Failure 429 {object} api.ErrorResponse "Rate limit exceeded (8 requests per minute)"
// @Failure 500 {object} api.ErrorResponse "Internal server error"
// @Router /auth/refresh [post]
func (ar *AuthRouter) HandleRefresh(w http.ResponseWriter, r *http.Request) {
	applog.Info("HandleRefresh called")

	refreshCookie, err := r.Cookie("refresh")
	if err != nil {
		applog.Warn("No refresh cookie found")
		api.WriteInvalidCredentials(w)
		return
	}

	claims := middleware.GetClaims(w, r, refreshCookie.Value, config.JwtSecretBytes, ar.TokenRepo)
	if claims == nil || claims.Type != model.RefreshJwt {
		applog.Warn("Invalid or missing refresh token")
		api.WriteInvalidCredentials(w)
		return
	}

	user, err := ar.UserRepo.GetUserByID(r.Context(), claims.UserID)
	if err != nil || user == nil {
		applog.Warn("Refresh failed: user not found or db error", "userID:", claims.UserID, "err:", err)
		api.WriteInvalidCredentials(w)
		return
	}

	blacklist := model.JwtBlacklist{
		TokenID:   claims.TokenID,
		UserID:    claims.UserID,
		ExpiresAt: math.MaxInt64,
	}

	err = ar.TokenRepo.RevokeToken(r.Context(), blacklist)
	if err != nil {
		applog.Error("Failed to revoke old refresh token:", err)
	}

	loginTokens := GenerateLogin(jwt.CreateJwtFromUser(user))

	utils.SetSessionCookie(w, loginTokens.Session)
	utils.SetRefreshCookie(w, loginTokens.Refresh)

	applog.Info("Refresh token successful", "userID:", user.ID)
	api.WriteMessage(w, 200, "message", "tokens refreshed")
}
