package middleware

import (
	"time"

	"github.com/akramboussanni/treenode/config"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/httprate"
)

func AddRatelimit(r chi.Router, requestLimit int, window time.Duration) {
	if config.App.TrustIpHeaders {
		r.Use(httprate.LimitByRealIP(requestLimit, window))
	} else {
		r.Use(httprate.LimitByIP(requestLimit, window))
	}
}
