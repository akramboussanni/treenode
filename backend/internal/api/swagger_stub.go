//go:build !debug
// +build !debug

package api

import (
	"github.com/go-chi/chi/v5"
)

func AddSwaggerRoutes(r chi.Router) {
	// no swagger ui in prod
}
