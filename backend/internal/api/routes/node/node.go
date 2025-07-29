package node

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/akramboussanni/treenode/internal/api"
	"github.com/akramboussanni/treenode/internal/applog"
	"github.com/akramboussanni/treenode/internal/model"
	"github.com/akramboussanni/treenode/internal/utils"
	"github.com/go-chi/chi/v5"
)

// @Summary Create a new node
// @Description Create a new node for the authenticated user
// @Tags nodes
// @Accept json
// @Produce json
// @Param request body CreateNodeRequest true "Create node request"
// @Success 201 {object} model.Node
// @Failure 400 {string} string "Bad request"
// @Failure 401 {string} string "Unauthorized"
// @Failure 409 {object} map[string]string "Subdomain name already exists"
// @Failure 500 {string} string "Internal server error"
// @Router /nodes [post]
func (nr *NodeRouter) HandleCreateNode(w http.ResponseWriter, r *http.Request) {
	user, ok := utils.UserFromContext(r.Context())
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var req CreateNodeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	reservedKeywords := []string{"dashboard", "login", "register", "confirm", "nodes", "api", "admin", "settings", "profile", "account"}
	for _, keyword := range reservedKeywords {
		if strings.EqualFold(req.SubdomainName, keyword) {
			applog.Warn("Reserved keyword used for subdomain name", "subdomain:", req.SubdomainName)
			api.WriteMessage(w, 400, "error", "This name is reserved and cannot be used")
			return
		}
	}

	duplicate, err := nr.NodeRepo.DuplicateSubdomain(r.Context(), req.SubdomainName)
	if err != nil {
		applog.Error("Failed to check duplicate subdomain:", err)
		api.WriteInternalError(w)
		return
	}

	if duplicate {
		applog.Warn("Duplicate subdomain name creation attempt", "subdomain:", req.SubdomainName)
		api.WriteMessage(w, 409, "error", "Subdomain name already exists")
		return
	}

	displayName := user.Username + "'s Links"
	backgroundColor := "#F5F1E8"
	accentColor := "#8B9A47"
	titleFontColor := "#8B7355"
	captionFontColor := "#666666"
	themeColor := "#F5F1E8"
	pageTitle := user.Username + "'s Page"

	node := &model.Node{
		ID:                  utils.GenerateSnowflakeID(),
		OwnerID:             user.ID,
		SubdomainName:       req.SubdomainName,
		DisplayName:         displayName,
		Description:         "",
		BackgroundColor:     backgroundColor,
		TitleFontColor:      titleFontColor,
		CaptionFontColor:    captionFontColor,
		AccentColor:         accentColor,
		ThemeColor:          themeColor,
		PageTitle:           pageTitle,
		Domain:              "",
		DomainVerified:      false,
		MouseEffectsEnabled: true,
		TextShadowsEnabled:  true,
		ShowShareButton:     true,
		CreatedAt:           time.Now().UTC().Unix(),
		UpdatedAt:           time.Now().UTC().Unix(),
	}

	err = nr.NodeRepo.CreateNode(r.Context(), node)
	if err != nil {
		applog.Error("Failed to create node:", err)
		api.WriteInternalError(w)
		return
	}

	api.WriteJSON(w, 201, node)
}

// @Summary Get user's nodes
// @Description Get all nodes owned by the authenticated user
// @Tags nodes
// @Produce json
// @Success 200 {array} model.Node
// @Failure 401 {string} string "Unauthorized"
// @Failure 500 {string} string "Internal server error"
// @Router /nodes [get]
func (nr *NodeRouter) HandleGetUserNodes(w http.ResponseWriter, r *http.Request) {
	user, ok := utils.UserFromContext(r.Context())
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	nodes, err := nr.NodeRepo.GetNodesByOwnerID(r.Context(), user.ID)
	if err != nil {
		applog.Error("Failed to get user nodes:", err)
		api.WriteInternalError(w)
		return
	}

	for i := range nodes {
		err = nr.NodeRepo.LoadCollaborators(r.Context(), &nodes[i])
		if err != nil {
			applog.Error("Failed to load collaborators for node:", nodes[i].ID, err)
		}
	}

	api.WriteJSON(w, 200, nodes)
}

// @Summary Get shared nodes
// @Description Get all nodes shared with the authenticated user, grouped by owner
// @Tags nodes
// @Produce json
// @Success 200 {array} SharedNodeGroup
// @Failure 401 {string} string "Unauthorized"
// @Failure 500 {string} string "Internal server error"
// @Router /nodes/api/shared [get]
func (nr *NodeRouter) HandleGetSharedNodes(w http.ResponseWriter, r *http.Request) {
	user, ok := utils.UserFromContext(r.Context())
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	// Get all nodes where the user has access but is not the owner
	sharedNodes, err := nr.NodeRepo.GetSharedNodesByUserID(r.Context(), user.ID)
	if err != nil {
		applog.Error("Failed to get shared nodes:", err)
		api.WriteInternalError(w)
		return
	}

	// Group nodes by owner
	nodeGroups := make(map[int64]*SharedNodeGroup)

	for _, node := range sharedNodes {
		// Get owner information
		owner, err := nr.UserRepo.GetUserByID(r.Context(), node.OwnerID)
		if err != nil {
			applog.Error("Failed to get owner for node:", node.ID, err)
			continue
		}

		if nodeGroups[node.OwnerID] == nil {
			nodeGroups[node.OwnerID] = &SharedNodeGroup{
				OwnerID:   node.OwnerID,
				OwnerName: owner.Username,
				Nodes:     []model.Node{},
			}
		}

		nodeGroups[node.OwnerID].Nodes = append(nodeGroups[node.OwnerID].Nodes, node)
	}

	// Convert map to slice
	var result []*SharedNodeGroup
	for _, group := range nodeGroups {
		result = append(result, group)
	}

	api.WriteJSON(w, 200, result)
}

// @Summary Get a specific node
// @Description Get a specific node by ID (requires access)
// @Tags nodes
// @Produce json
// @Param nodeID path string true "Node ID"
// @Success 200 {object} model.Node
// @Failure 401 {string} string "Unauthorized"
// @Failure 403 {string} string "Forbidden"
// @Failure 404 {string} string "Not found"
// @Router /nodes/{nodeID} [get]
func (nr *NodeRouter) HandleGetNode(w http.ResponseWriter, r *http.Request) {
	nodeIDStr := chi.URLParam(r, "nodeID")
	nodeID, err := utils.ParseID(nodeIDStr)
	if err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	user, ok := utils.UserFromContext(r.Context())
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	node, err := nr.NodeRepo.GetNodeByID(r.Context(), nodeID)
	if err != nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	hasAccess, err := nr.NodeRepo.CheckNodeAccess(r.Context(), nodeID, user.ID)
	if err != nil || !hasAccess {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	err = nr.NodeRepo.LoadCollaborators(r.Context(), node)
	if err != nil {
		applog.Error("Failed to load collaborators:", err)
	}

	api.WriteJSON(w, 200, node)
}

// @Summary Update a node
// @Description Update a node (owner only)
// @Tags nodes
// @Accept json
// @Produce json
// @Param nodeID path string true "Node ID"
// @Param request body UpdateNodeRequest true "Update node request"
// @Success 200 {object} model.Node
// @Failure 400 {string} string "Bad request"
// @Failure 401 {string} string "Unauthorized"
// @Failure 403 {string} string "Forbidden"
// @Failure 404 {string} string "Not found"
// @Failure 409 {object} map[string]string "Subdomain name already exists"
// @Failure 500 {string} string "Internal server error"
// @Router /nodes/{nodeID} [put]
func (nr *NodeRouter) HandleUpdateNode(w http.ResponseWriter, r *http.Request) {
	nodeIDStr := chi.URLParam(r, "nodeID")
	nodeID, err := utils.ParseID(nodeIDStr)
	if err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	user, ok := utils.UserFromContext(r.Context())
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var req UpdateNodeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	node, err := nr.NodeRepo.GetNodeByID(r.Context(), nodeID)
	if err != nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	if user.ID != node.OwnerID {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	if req.SubdomainName != "" && req.SubdomainName != node.SubdomainName {
		reservedKeywords := []string{"dashboard", "login", "register", "confirm", "nodes", "api", "admin", "settings", "profile", "account"}
		for _, keyword := range reservedKeywords {
			if strings.EqualFold(req.SubdomainName, keyword) {
				applog.Warn("Reserved keyword used for subdomain name update", "subdomain:", req.SubdomainName)
				api.WriteMessage(w, 400, "error", "This name is reserved and cannot be used")
				return
			}
		}

		duplicate, err := nr.NodeRepo.DuplicateSubdomainExcludingNode(r.Context(), req.SubdomainName, nodeID)
		if err != nil {
			applog.Error("Failed to check duplicate subdomain:", err)
			api.WriteInternalError(w)
			return
		}

		if duplicate {
			applog.Warn("Duplicate subdomain name update attempt", "subdomain:", req.SubdomainName)
			api.WriteMessage(w, 409, "error", "Subdomain name already exists")
			return
		}
	}

	// i will have to rework it someday
	if req.SubdomainName != "" {
		node.SubdomainName = req.SubdomainName
	}
	if req.DisplayName != "" {
		node.DisplayName = req.DisplayName
	}
	if req.Description != "" {
		node.Description = req.Description
	}
	if req.BackgroundColor != "" {
		node.BackgroundColor = req.BackgroundColor
	}
	if req.TitleFontColor != "" {
		node.TitleFontColor = req.TitleFontColor
	}
	if req.CaptionFontColor != "" {
		node.CaptionFontColor = req.CaptionFontColor
	}
	if req.AccentColor != "" {
		node.AccentColor = req.AccentColor
	}
	if req.ThemeColor != "" {
		node.ThemeColor = req.ThemeColor
	}
	if req.ShowShareButton != nil {
		node.ShowShareButton = *req.ShowShareButton
	}
	if req.Theme != "" {
		node.Theme = req.Theme
	}
	if req.MouseEffectsEnabled != nil {
		node.MouseEffectsEnabled = *req.MouseEffectsEnabled
	}
	if req.TextShadowsEnabled != nil {
		node.TextShadowsEnabled = *req.TextShadowsEnabled
	}
	if req.PageTitle != "" {
		node.PageTitle = req.PageTitle
	}
	if req.HidePoweredBy != nil {
		node.HidePoweredBy = *req.HidePoweredBy
	}
	node.UpdatedAt = time.Now().UTC().Unix()

	err = nr.NodeRepo.UpdateNode(r.Context(), node)
	if err != nil {
		applog.Error("Failed to update node:", err)
		api.WriteInternalError(w)
		return
	}

	api.WriteJSON(w, 200, node)
}

// @Summary Delete a node
// @Description Delete a node and all its links (owner only)
// @Tags nodes
// @Produce json
// @Param nodeID path string true "Node ID"
// @Success 200 {object} map[string]string
// @Failure 401 {string} string "Unauthorized"
// @Failure 403 {string} string "Forbidden"
// @Failure 404 {string} string "Not found"
// @Failure 500 {string} string "Internal server error"
// @Router /nodes/{nodeID} [delete]
func (nr *NodeRouter) HandleDeleteNode(w http.ResponseWriter, r *http.Request) {
	nodeIDStr := chi.URLParam(r, "nodeID")
	nodeID, err := utils.ParseID(nodeIDStr)
	if err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	user, ok := utils.UserFromContext(r.Context())
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	node, err := nr.NodeRepo.GetNodeByID(r.Context(), nodeID)
	if err != nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	if user.ID != node.OwnerID {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	err = nr.LinkRepo.DeleteLinksByNodeID(r.Context(), nodeID)
	if err != nil {
		applog.Error("Failed to delete links:", err)
		api.WriteInternalError(w)
		return
	}

	err = nr.NodeRepo.DeleteNode(r.Context(), nodeID)
	if err != nil {
		applog.Error("Failed to delete node:", err)
		api.WriteInternalError(w)
		return
	}

	api.WriteMessage(w, 200, "message", "Node deleted successfully")
}

// @Summary Transfer node ownership
// @Description Transfer ownership of a node to another user (owner only)
// @Tags nodes
// @Accept json
// @Produce json
// @Param nodeID path string true "Node ID"
// @Param request body TransferOwnershipRequest true "Transfer ownership request"
// @Success 200 {object} map[string]string
// @Failure 400 {string} string "Bad request"
// @Failure 401 {string} string "Unauthorized"
// @Failure 403 {string} string "Forbidden"
// @Failure 404 {string} string "Not found"
// @Failure 500 {string} string "Internal server error"
// @Router /nodes/{nodeID}/transfer [post]
func (nr *NodeRouter) HandleTransferOwnership(w http.ResponseWriter, r *http.Request) {
	nodeIDStr := chi.URLParam(r, "nodeID")
	nodeID, err := utils.ParseID(nodeIDStr)
	if err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	user, ok := utils.UserFromContext(r.Context())
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var req TransferOwnershipRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	node, err := nr.NodeRepo.GetNodeByID(r.Context(), nodeID)
	if err != nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	if user.ID != node.OwnerID {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	newOwner, err := nr.UserRepo.GetUserByID(r.Context(), req.NewOwnerID)
	if err != nil || newOwner == nil {
		api.WriteMessage(w, 404, "error", "New owner not found")
		return
	}

	node.OwnerID = req.NewOwnerID
	node.UpdatedAt = time.Now().UTC().Unix()

	err = nr.NodeRepo.UpdateNode(r.Context(), node)
	if err != nil {
		applog.Error("Failed to transfer ownership:", err)
		api.WriteInternalError(w)
		return
	}

	api.WriteMessage(w, 200, "message", "Ownership transferred successfully")
}

// @Summary Add collaborator to node
// @Description Add a user as a collaborator to a node (owner only)
// @Tags nodes
// @Accept json
// @Produce json
// @Param nodeID path string true "Node ID"
// @Param request body AddCollaboratorRequest true "Add collaborator request"
// @Success 200 {object} map[string]string
// @Failure 400 {string} string "Bad request"
// @Failure 401 {string} string "Unauthorized"
// @Failure 403 {string} string "Forbidden"
// @Failure 404 {string} string "Not found"
// @Router /nodes/{nodeID}/collaborators [post]
func (nr *NodeRouter) HandleAddCollaborator(w http.ResponseWriter, r *http.Request) {
	nodeIDStr := chi.URLParam(r, "nodeID")
	nodeID, err := utils.ParseID(nodeIDStr)
	if err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	user, ok := utils.UserFromContext(r.Context())
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var req AddCollaboratorRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	node, err := nr.NodeRepo.GetNodeByID(r.Context(), nodeID)
	if err != nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	if user.ID != node.OwnerID {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	collaborator, err := nr.UserRepo.GetUserByID(r.Context(), req.UserID)
	if err != nil || collaborator == nil {
		api.WriteMessage(w, 404, "error", "User not found")
		return
	}

	err = nr.NodeRepo.AddNodeAccess(r.Context(), nodeID, req.UserID)
	if err != nil {
		applog.Error("Failed to add collaborator:", err)
		api.WriteInternalError(w)
		return
	}

	api.WriteMessage(w, 200, "message", "Collaborator added successfully")
}

// @Summary Remove collaborator from node
// @Description Remove a user as a collaborator from a node (owner only)
// @Tags nodes
// @Produce json
// @Param nodeID path string true "Node ID"
// @Param userID path string true "User ID"
// @Success 200 {object} map[string]string
// @Failure 400 {string} string "Bad request"
// @Failure 401 {string} string "Unauthorized"
// @Failure 403 {string} string "Forbidden"
// @Failure 404 {string} string "Not found"
// @Router /nodes/{nodeID}/collaborators/{userID} [delete]
func (nr *NodeRouter) HandleRemoveCollaborator(w http.ResponseWriter, r *http.Request) {
	nodeIDStr := chi.URLParam(r, "nodeID")
	nodeID, err := utils.ParseID(nodeIDStr)
	if err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	collaboratorIDStr := chi.URLParam(r, "userID")
	user, ok := utils.UserFromContext(r.Context())
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	collaboratorID, err := strconv.ParseInt(collaboratorIDStr, 10, 64)
	if err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	node, err := nr.NodeRepo.GetNodeByID(r.Context(), nodeID)
	if err != nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	if user.ID != node.OwnerID {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	err = nr.NodeRepo.RemoveNodeAccess(r.Context(), nodeID, collaboratorID)
	if err != nil {
		applog.Error("Failed to remove collaborator:", err)
		api.WriteInternalError(w)
		return
	}

	api.WriteMessage(w, 200, "message", "Collaborator removed successfully")
}

// @Summary Get node collaborators
// @Description Get all collaborators for a node
// @Tags nodes
// @Produce json
// @Param nodeID path string true "Node ID"
// @Success 200 {array} object
// @Failure 401 {string} string "Unauthorized"
// @Failure 403 {string} string "Forbidden"
// @Failure 404 {string} string "Not found"
// @Router /nodes/{nodeID}/collaborators [get]
func (nr *NodeRouter) HandleGetCollaborators(w http.ResponseWriter, r *http.Request) {
	nodeIDStr := chi.URLParam(r, "nodeID")
	nodeID, err := utils.ParseID(nodeIDStr)
	if err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	user, ok := utils.UserFromContext(r.Context())
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	node, err := nr.NodeRepo.GetNodeByID(r.Context(), nodeID)
	if err != nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	hasAccess, err := nr.NodeRepo.CheckNodeAccess(r.Context(), nodeID, user.ID)
	if err != nil || !hasAccess {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	err = nr.NodeRepo.LoadCollaborators(r.Context(), node)
	if err != nil {
		applog.Error("Failed to load collaborators:", err)
		api.WriteInternalError(w)
		return
	}
	collaborators := node.Collaborators

	var collaboratorUsers []map[string]interface{}
	for _, collaboratorID := range collaborators {
		user, err := nr.UserRepo.GetUserByIDSafe(r.Context(), collaboratorID)
		if err != nil {
			applog.Error("Failed to get collaborator user:", collaboratorID, err)
			continue
		}
		collaboratorUsers = append(collaboratorUsers, map[string]interface{}{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
		})
	}

	api.WriteJSON(w, 200, collaboratorUsers)
}
