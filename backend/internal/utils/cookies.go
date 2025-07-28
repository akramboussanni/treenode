package utils

import (
	"net/http"

	"github.com/akramboussanni/treenode/config"
	"github.com/akramboussanni/treenode/internal/model"
)

func cookieOp(name, value, path string, maxAge int) *http.Cookie {
	return &http.Cookie{
		Name:     name,
		Value:    value,
		Domain:   config.App.CookieDomain,
		Path:     path,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
		MaxAge:   maxAge,
	}
}

func SetSessionCookie(w http.ResponseWriter, token string) {
	http.SetCookie(w, cookieOp("session", token, "/", int(config.App.JwtExpirations[string(model.CredentialJwt)])))
}

func SetRefreshCookie(w http.ResponseWriter, token string) {
	http.SetCookie(w, cookieOp("refresh", token, "/auth/refresh", int(config.App.JwtExpirations[string(model.RefreshJwt)])))
}

func ClearSessionCookie(w http.ResponseWriter) {
	http.SetCookie(w, cookieOp("session", "", "/", -1))
}

func ClearRefreshCookie(w http.ResponseWriter) {
	http.SetCookie(w, cookieOp("refresh", "", "/auth/refresh", -1))
}

func ClearAllCookies(w http.ResponseWriter) {
	ClearSessionCookie(w)
	ClearRefreshCookie(w)
}
