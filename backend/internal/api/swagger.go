//go:build debug
// +build debug

package api

import (
	_ "github.com/akramboussanni/treenode/docs"
	"github.com/go-chi/chi/v5"
	httpSwagger "github.com/swaggo/http-swagger"
)

func AddSwaggerRoutes(r chi.Router) {
	r.Get("/swagger/*", httpSwagger.Handler(
		httpSwagger.URL("/swagger/doc.json"),
	))
}
