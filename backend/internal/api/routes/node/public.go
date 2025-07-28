package node

import (
	"net/http"

	"github.com/akramboussanni/treenode/internal/api"
	"github.com/akramboussanni/treenode/internal/applog"
	"github.com/akramboussanni/treenode/internal/utils"
	"github.com/go-chi/chi/v5"
)

// @Summary Get public node information
// @Description Get public information about a node (no authentication required)
// @Tags public
// @Produce json
// @Param nodeID path string true "Node ID"
// @Success 200 {object} object
// @Failure 404 {string} string "Not found"
// @Router /nodes/{nodeID} [get]
func (nr *NodeRouter) HandleGetPublicNode(w http.ResponseWriter, r *http.Request) {
	nodeIDStr := chi.URLParam(r, "nodeID")
	nodeID, err := utils.ParseID(nodeIDStr)
	if err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	node, err := nr.NodeRepo.GetNodeByID(r.Context(), nodeID)
	if err != nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	utils.StripUnsafeFields(node)
	api.WriteJSON(w, 200, node)
}

// @Summary Get public links for a node
// @Description Get all visible and enabled links for a node (no authentication required)
// @Tags public
// @Produce json
// @Param nodeID path string true "Node ID"
// @Success 200 {array} model.Link
// @Failure 500 {string} string "Internal server error"
// @Router /nodes/{nodeID}/links [get]
func (nr *NodeRouter) HandleGetPublicLinks(w http.ResponseWriter, r *http.Request) {
	nodeIDStr := chi.URLParam(r, "nodeID")
	nodeID, err := utils.ParseID(nodeIDStr)
	if err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	links, err := nr.LinkRepo.GetVisibleLinksByNodeID(r.Context(), nodeID)
	if err != nil {
		api.WriteInternalError(w)
		return
	}

	for i := range links {
		err = nr.LinkRepo.LoadColorStops(r.Context(), &links[i])
		if err != nil {
			applog.Error("Failed to load color stops for link:", links[i].ID, err)
		}
	}

	api.WriteJSON(w, 200, links)
}

// @Summary Get public links for a node
// @Description Get all visible and enabled links for a node (no authentication required)
// @Tags public
// @Produce json
// @Param nodeID path string true "Node ID"
// @Success 200 {array} model.Link
// @Failure 500 {string} string "Internal server error"
// @Router /nodes/{nodeID}/links [get]
func (nr *NodeRouter) HandleGetPublicLink(w http.ResponseWriter, r *http.Request) {
	nodeIDStr := chi.URLParam(r, "nodeID")
	nodeID, err := utils.ParseID(nodeIDStr)
	if err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	linkName := chi.URLParam(r, "linkName")

	link, err := nr.LinkRepo.GetLinkRedirectByNameAndNodeID(r.Context(), linkName, nodeID)
	if err != nil {
		api.WriteInternalError(w)
		return
	}

	http.Redirect(w, r, link, http.StatusTemporaryRedirect)
}

// @Summary Get public node information by subdomain
// @Description Get public information about a node by subdomain (no authentication required)
// @Tags public
// @Produce json
// @Param subdomain path string true "Subdomain name"
// @Success 200 {object} object
// @Failure 404 {string} string "Not found"
// @Router /nodes/public/subdomain/{subdomain} [get]
func (nr *NodeRouter) HandleGetNodeBySubdomain(w http.ResponseWriter, r *http.Request) {
	subdomain := chi.URLParam(r, "subdomain")
	if subdomain == "" {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	node, err := nr.NodeRepo.GetNodeBySubdomain(r.Context(), subdomain)
	if err != nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	utils.StripUnsafeFields(node)
	api.WriteJSON(w, 200, node)
}

// @Summary Get public links for a node by subdomain
// @Description Get all visible and enabled links for a node by subdomain (no authentication required)
// @Tags public
// @Produce json
// @Param subdomain path string true "Subdomain name"
// @Success 200 {array} model.Link
// @Failure 500 {string} string "Internal server error"
// @Router /nodes/public/subdomain/{subdomain}/links [get]
func (nr *NodeRouter) HandleGetPublicLinksBySubdomain(w http.ResponseWriter, r *http.Request) {
	subdomain := chi.URLParam(r, "subdomain")
	if subdomain == "" {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	node, err := nr.NodeRepo.GetNodeBySubdomain(r.Context(), subdomain)
	if err != nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	links, err := nr.LinkRepo.GetVisibleLinksByNodeID(r.Context(), node.ID)
	if err != nil {
		api.WriteInternalError(w)
		return
	}

	for i := range links {
		err = nr.LinkRepo.LoadColorStops(r.Context(), &links[i])
		if err != nil {
			applog.Error("Failed to load color stops for link:", links[i].ID, err)
		}
	}

	api.WriteJSON(w, 200, links)
}

// @Summary Get public node information by name
// @Description Get public information about a node by name (no authentication required)
// @Tags public
// @Produce json
// @Param name path string true "Node name"
// @Success 200 {object} object
// @Failure 404 {string} string "Not found"
// @Router /nodes/public/name/{name} [get]
func (nr *NodeRouter) HandleGetNodeByName(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	if name == "" {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	node, err := nr.NodeRepo.GetNodeBySubdomain(r.Context(), name)
	if err != nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	utils.StripUnsafeFields(node)
	api.WriteJSON(w, 200, node)
}

// @Summary Get public links for a node by name
// @Description Get all visible and enabled links for a node by name (no authentication required)
// @Tags public
// @Produce json
// @Param name path string true "Node name"
// @Success 200 {array} model.Link
// @Failure 500 {string} string "Internal server error"
// @Router /nodes/public/name/{name}/links [get]
func (nr *NodeRouter) HandleGetPublicLinksByName(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	if name == "" {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	node, err := nr.NodeRepo.GetNodeBySubdomain(r.Context(), name)
	if err != nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	links, err := nr.LinkRepo.GetVisibleLinksByNodeID(r.Context(), node.ID)
	if err != nil {
		api.WriteInternalError(w)
		return
	}

	for i := range links {
		err = nr.LinkRepo.LoadColorStops(r.Context(), &links[i])
		if err != nil {
			applog.Error("Failed to load color stops for link:", links[i].ID, err)
		}
	}

	api.WriteJSON(w, 200, links)
}
