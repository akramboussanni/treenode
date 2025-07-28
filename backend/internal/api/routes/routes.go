package routes

import (
	"net/http"

	"github.com/akramboussanni/treenode/internal/api"
	"github.com/akramboussanni/treenode/internal/api/routes/auth"
	"github.com/akramboussanni/treenode/internal/api/routes/node"
	"github.com/akramboussanni/treenode/internal/middleware"
	"github.com/akramboussanni/treenode/internal/repo"
	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
)

func SetupRouter(repos *repo.Repos) http.Handler {
	r := chi.NewRouter()

	r.Use(middleware.SecurityHeaders)
	r.Use(middleware.CORSHeaders)

	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("still love you!"))
	})

	api.AddSwaggerRoutes(r)

	authRouter := auth.NewAuthRouter(repos.User, repos.Token, repos.Lockout)
	nodeRouter := node.NewNodeRouter(repos.User, repos.Token, repos.Lockout, repos.Node, repos.Link, repos.Invitation)

	r.Mount("/auth", authRouter)
	r.Mount("/nodes", nodeRouter)

	return r
}
