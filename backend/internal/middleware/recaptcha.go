package middleware

import (
	"encoding/json"
	"net/http"

	"github.com/akramboussanni/treenode/config"
	"github.com/akramboussanni/treenode/internal/api"
	"github.com/akramboussanni/treenode/internal/model"
	"github.com/akramboussanni/treenode/internal/utils"
	"github.com/go-chi/chi/v5"
	"github.com/google/go-querystring/query"
)

func AddRecaptcha(r chi.Router) {
	if config.App.RecaptchaEnabled && config.App.RecaptchaSecret != "" {
		r.Use(validateRecaptcha)
	}
}

func validateRecaptcha(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token := r.Header.Get("X-Recaptcha-Token")
		ip := utils.GetClientIP(r)

		if token == "" {
			http.Error(w, "invalid request", http.StatusBadRequest)
			return
		}

		req := model.RecaptchaVerificationPayload{
			Secret:   config.App.RecaptchaSecret,
			Response: token,
			RemoteIP: ip,
		}

		values, err := query.Values(req)
		if err != nil {
			api.WriteInternalError(w)
			return
		}

		resp, err := http.PostForm("https://www.google.com/recaptcha/api/siteverify", values)
		if err != nil {
			api.WriteInternalError(w)
			return
		}
		defer resp.Body.Close()

		var recaptchaResp model.RecaptchaVerificationResponse
		if err := json.NewDecoder(resp.Body).Decode(&recaptchaResp); err != nil {
			api.WriteInternalError(w)
			return
		}

		if recaptchaResp.Score < config.App.RecaptchaThreshold || !recaptchaResp.Success {
			http.Error(w, "recaptcha fail", http.StatusForbidden)
			return
		}

		next.ServeHTTP(w, r)
	})
}
