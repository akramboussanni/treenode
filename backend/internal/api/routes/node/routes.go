package node

import (
	"net/http"
	"time"

	"github.com/akramboussanni/treenode/internal/middleware"
	"github.com/akramboussanni/treenode/internal/repo"
	"github.com/go-chi/chi/v5"
)

type NodeRouter struct {
	UserRepo       *repo.UserRepo
	TokenRepo      *repo.TokenRepo
	LockoutRepo    *repo.LockoutRepo
	NodeRepo       *repo.NodeRepo
	LinkRepo       *repo.LinkRepo
	InvitationRepo *repo.InvitationRepo
}

func NewNodeRouter(userRepo *repo.UserRepo, tokenRepo *repo.TokenRepo, lockoutRepo *repo.LockoutRepo, nodeRepo *repo.NodeRepo, linkRepo *repo.LinkRepo, invitationRepo *repo.InvitationRepo) http.Handler {
	nr := &NodeRouter{UserRepo: userRepo, TokenRepo: tokenRepo, LockoutRepo: lockoutRepo, NodeRepo: nodeRepo, LinkRepo: linkRepo, InvitationRepo: invitationRepo}
	r := chi.NewRouter()

	r.Use(middleware.MaxBytesMiddleware(1 << 20))

	r.Route("/public", func(r chi.Router) {
		middleware.AddRatelimit(r, 60, 1*time.Minute) // 60/min

		r.Get("/{nodeID}", nr.HandleGetPublicNode)
		r.Get("/{nodeID}/links", nr.HandleGetPublicLinks)
		r.Get("/{nodeID}/links/{linkName}", nr.HandleGetPublicLink)
		r.Get("/subdomain/{subdomain}", nr.HandleGetNodeBySubdomain)
		r.Get("/subdomain/{subdomain}/links", nr.HandleGetPublicLinksBySubdomain)
		r.Get("/name/{name}", nr.HandleGetNodeByName)
		r.Get("/name/{name}/links", nr.HandleGetPublicLinksByName)
	})

	r.Route("/api", func(r chi.Router) {
		middleware.AddAuth(r, nr.UserRepo, nr.TokenRepo)

		r.Group(func(r chi.Router) {
			middleware.AddRatelimit(r, 30, 1*time.Minute) // 30/min

			r.Post("/", nr.HandleCreateNode)
			r.Get("/", nr.HandleGetUserNodes)
			r.Get("/shared", nr.HandleGetSharedNodes)
			r.Get("/{nodeID}", nr.HandleGetNode)
			r.Put("/{nodeID}", nr.HandleUpdateNode)
			r.Delete("/{nodeID}", nr.HandleDeleteNode)
			r.Post("/{nodeID}/transfer", nr.HandleTransferOwnership)
		})

		r.Group(func(r chi.Router) {
			middleware.AddRatelimit(r, 20, 1*time.Minute) // 20/min

			r.Post("/{nodeID}/collaborators", nr.HandleAddCollaborator)
			r.Delete("/{nodeID}/collaborators/{userID}", nr.HandleRemoveCollaborator)
			r.Get("/{nodeID}/collaborators", nr.HandleGetCollaborators)
		})

		r.Group(func(r chi.Router) {
			middleware.AddRatelimit(r, 10, 1*time.Minute) // 10/min
			middleware.AddRecaptcha(r)

			r.Post("/{nodeID}/invite", nr.HandleInviteCollaborator)
			r.Get("/{nodeID}/invitations", nr.HandleGetInvitations)
			r.Post("/acceptinvitation", nr.HandleAcceptInvitation)
		})

		r.Group(func(r chi.Router) {
			middleware.AddRatelimit(r, 40, 1*time.Minute) // 40/min

			r.Post("/{nodeID}/links", nr.HandleCreateLink)
			r.Get("/{nodeID}/links", nr.HandleGetLinks)
			r.Get("/{nodeID}/links/{linkID}", nr.HandleGetLink)
			r.Put("/{nodeID}/links/{linkID}", nr.HandleUpdateLink)
			r.Delete("/{nodeID}/links/{linkID}", nr.HandleDeleteLink)
			r.Post("/{nodeID}/links/{linkID}/reorder", nr.HandleReorderLink)
			r.Put("/{nodeID}/links/{linkID}/name", nr.HandleUpdateLinkName)
		})

		r.Group(func(r chi.Router) {
			middleware.AddRatelimit(r, 50, 1*time.Minute) // 50/min

			r.Post("/{nodeID}/links/{linkID}/color-stops", nr.HandleCreateColorStop)
			r.Put("/{nodeID}/links/{linkID}/color-stops/{colorStopID}", nr.HandleUpdateColorStop)
			r.Delete("/{nodeID}/links/{linkID}/color-stops/{colorStopID}", nr.HandleDeleteColorStop)
		})
	})

	return r
}
