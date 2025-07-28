package auth

import (
	"math"
	"net/http"

	"github.com/akramboussanni/treenode/config"
	"github.com/akramboussanni/treenode/internal/api"
	"github.com/akramboussanni/treenode/internal/applog"
	"github.com/akramboussanni/treenode/internal/middleware"
	"github.com/akramboussanni/treenode/internal/model"
	"github.com/akramboussanni/treenode/internal/utils"
)

// @Summary Logout user and revoke session
// @Description Logout the current user by revoking their JWT session token and clearing cookies. The token will be added to the blacklist and cannot be used again.
// @Tags Account
// @Accept json
// @Produce json
// @Success 200 {string} string "Logout successful - session token revoked and cookies cleared"
// @Failure 401 {object} api.ErrorResponse "Unauthorized - invalid or missing session cookie"
// @Failure 429 {object} api.ErrorResponse "Rate limit exceeded (8 requests per minute)"
// @Failure 500 {object} api.ErrorResponse "Internal server error during token revocation"
// @Router /api/auth/logout [post]
func (ar *AuthRouter) HandleLogout(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetClaimsFromCookie(w, r, config.JwtSecretBytes, ar.UserRepo, ar.TokenRepo)
	if claims == nil || claims.Type != model.CredentialJwt {
		return
	}

	err := ar.TokenRepo.RevokeToken(r.Context(), model.JwtBlacklist{
		TokenID:   claims.TokenID,
		UserID:    claims.UserID,
		ExpiresAt: math.MaxInt64,
	})

	if err != nil {
		applog.Error("Failed to revoke token during logout:", err)
		api.WriteInternalError(w)
		return
	}

	utils.ClearAllCookies(w)

	applog.Info("User logged out successfully", "userID:", claims.UserID, "tokenID:", claims.TokenID)
	api.WriteMessage(w, 200, "message", "logout successful")
}

// @Summary Logout user from all devices
// @Description Logout the current user from all devices by invalidating all active JWT sessions and clearing cookies. This revokes all tokens by incrementing the user's session ID, making all previously issued tokens invalid.
// @Tags Account
// @Accept json
// @Produce json
// @Success 200 {string} string "Logout from all devices successful - all sessions revoked and cookies cleared"
// @Failure 401 {object} api.ErrorResponse "Unauthorized - invalid or missing session cookie"
// @Failure 429 {object} api.ErrorResponse "Rate limit exceeded (8 requests per minute)"
// @Failure 500 {object} api.ErrorResponse "Internal server error during session revocation"
// @Router /api/auth/logout-all [post]
func (ar *AuthRouter) HandleLogoutEverywhere(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetClaimsFromCookie(w, r, config.JwtSecretBytes, ar.UserRepo, ar.TokenRepo)
	if claims == nil || claims.Type != model.CredentialJwt {
		return
	}

	err := ar.UserRepo.ChangeJwtSessionID(r.Context(), claims.UserID, utils.GenerateSnowflakeID())

	if err != nil {
		applog.Error("Failed to revoke all sessions during logout everywhere:", err)
		api.WriteInternalError(w)
		return
	}

	utils.ClearAllCookies(w)

	applog.Info("User logged out from all devices", "userID:", claims.UserID)
	api.WriteMessage(w, 200, "message", "logout from all devices successful")
}
