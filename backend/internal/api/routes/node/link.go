package node

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/akramboussanni/treenode/internal/api"
	"github.com/akramboussanni/treenode/internal/applog"
	"github.com/akramboussanni/treenode/internal/model"
	"github.com/akramboussanni/treenode/internal/utils"
	"github.com/go-chi/chi/v5"
)

// @Summary Create a new link
// @Description Create a new link for a node
// @Tags links
// @Accept json
// @Produce json
// @Param nodeID path string true "Node ID"
// @Param request body CreateLinkRequest true "Create link request"
// @Success 201 {object} model.Link
// @Failure 400 {string} string "Bad request"
// @Failure 401 {string} string "Unauthorized"
// @Failure 403 {string} string "Forbidden"
// @Failure 409 {object} map[string]string "Link name already exists"
// @Failure 500 {string} string "Internal server error"
// @Router /nodes/{nodeID}/links [post]
func (nr *NodeRouter) HandleCreateLink(w http.ResponseWriter, r *http.Request) {
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

	var req CreateLinkRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	hasAccess, err := nr.NodeRepo.CheckNodeAccess(r.Context(), nodeID, user.ID)
	if err != nil || !hasAccess {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	// Validate that at least one of name or link is provided
	if req.Name == "" && req.Link == "" {
		api.WriteMessage(w, 400, "error", "Please provide either a link name or URL")
		return
	}

	if req.Name != "" {
		exists, err := nr.LinkRepo.CheckNameExistsInNode(r.Context(), req.Name, nodeID)
		if err != nil {
			applog.Error("Failed to check name existence:", err)
			api.WriteInternalError(w)
			return
		}
		if exists {
			api.WriteMessage(w, 409, "error", "Link name already exists in this node")
			return
		}
	}

	link := &model.Link{
		ID:                            utils.GenerateSnowflakeID(),
		NodeID:                        nodeID,
		Name:                          req.Name,
		DisplayName:                   req.DisplayName,
		Link:                          req.Link,
		Description:                   req.Description,
		Icon:                          req.Icon,
		Visible:                       req.Visible,
		Enabled:                       req.Enabled,
		Mini:                          req.Mini,
		CreatedAt:                     time.Now().UTC().Unix(),
		GradientType:                  req.GradientType,
		GradientAngle:                 req.GradientAngle,
		CustomAccentColorEnabled:      req.CustomAccentColorEnabled != nil && *req.CustomAccentColorEnabled,
		CustomAccentColor:             req.CustomAccentColor,
		CustomTitleColorEnabled:       req.CustomTitleColorEnabled != nil && *req.CustomTitleColorEnabled,
		CustomTitleColor:              req.CustomTitleColor,
		CustomDescriptionColorEnabled: req.CustomDescriptionColorEnabled != nil && *req.CustomDescriptionColorEnabled,
		CustomDescriptionColor:        req.CustomDescriptionColor,
		MiniBackgroundEnabled:         req.MiniBackgroundEnabled != nil && *req.MiniBackgroundEnabled,
	}

	err = nr.LinkRepo.CreateLink(r.Context(), link)
	if err != nil {
		applog.Error("Failed to create link:", err)
		api.WriteInternalError(w)
		return
	}

	if len(req.ColorStops) > 0 {
		for _, colorStop := range req.ColorStops {
			stop := &model.ColorStop{
				ID:        utils.GenerateSnowflakeID(),
				LinkID:    link.ID,
				Color:     colorStop.Color,
				Position:  colorStop.Position,
				CreatedAt: time.Now().UTC().Unix(),
				UpdatedAt: time.Now().UTC().Unix(),
			}

			err = nr.LinkRepo.CreateColorStop(r.Context(), stop)
			if err != nil {
				applog.Error("Failed to create color stop:", err)
			}
		}

		err = nr.LinkRepo.LoadColorStops(r.Context(), link)
		if err != nil {
			applog.Error("Failed to load color stops:", err)
		}
	}

	err = nr.LinkRepo.LoadColorStops(r.Context(), link)
	if err != nil {
		applog.Error("Failed to load color stops:", err)
	}

	api.WriteJSON(w, 201, link)
}

// @Summary Get all links for a node
// @Description Get all links for a node (including disabled ones for management)
// @Tags links
// @Produce json
// @Param nodeID path string true "Node ID"
// @Success 200 {array} model.Link
// @Failure 401 {string} string "Unauthorized"
// @Failure 403 {string} string "Forbidden"
// @Failure 500 {string} string "Internal server error"
// @Router /nodes/{nodeID}/links [get]
func (nr *NodeRouter) HandleGetLinks(w http.ResponseWriter, r *http.Request) {
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

	hasAccess, err := nr.NodeRepo.CheckNodeAccess(r.Context(), nodeID, user.ID)
	if err != nil || !hasAccess {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	links, err := nr.LinkRepo.GetLinksByNodeID(r.Context(), nodeID)
	if err != nil {
		applog.Error("Failed to get links:", err)
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

// @Summary Get a specific link
// @Description Get a specific link by ID
// @Tags links
// @Produce json
// @Param nodeID path string true "Node ID"
// @Param linkID path string true "Link ID"
// @Success 200 {object} model.Link
// @Failure 401 {string} string "Unauthorized"
// @Failure 403 {string} string "Forbidden"
// @Failure 404 {string} string "Not found"
// @Router /nodes/{nodeID}/links/{linkID} [get]
func (nr *NodeRouter) HandleGetLink(w http.ResponseWriter, r *http.Request) {
	nodeIDStr := chi.URLParam(r, "nodeID")
	nodeID, err := utils.ParseID(nodeIDStr)
	if err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	linkIDStr := chi.URLParam(r, "linkID")
	linkID, err := utils.ParseID(linkIDStr)
	if err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	user, ok := utils.UserFromContext(r.Context())
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	hasAccess, err := nr.NodeRepo.CheckNodeAccess(r.Context(), nodeID, user.ID)
	if err != nil || !hasAccess {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	link, err := nr.LinkRepo.GetLinkByID(r.Context(), linkID)
	if err != nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	if link.NodeID != nodeID {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	err = nr.LinkRepo.LoadColorStops(r.Context(), link)
	if err != nil {
		applog.Error("Failed to load color stops:", err)
	}

	api.WriteJSON(w, 200, link)
}

// @Summary Update a link
// @Description Update a link (not implemented)
// @Tags links
// @Accept json
// @Produce json
// @Param nodeID path string true "Node ID"
// @Param linkID path string true "Link ID"
// @Param request body UpdateLinkRequest true "Update link request"
// @Success 200 {object} map[string]string
// @Failure 400 {string} string "Bad request"
// @Failure 401 {string} string "Unauthorized"
// @Failure 403 {string} string "Forbidden"
// @Failure 404 {string} string "Not found"
// @Router /nodes/{nodeID}/links/{linkID} [put]
func (nr *NodeRouter) HandleUpdateLink(w http.ResponseWriter, r *http.Request) {
	nodeIDStr := chi.URLParam(r, "nodeID")
	nodeID, err := utils.ParseID(nodeIDStr)
	if err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	linkIDStr := chi.URLParam(r, "linkID")
	linkID, err := utils.ParseID(linkIDStr)
	if err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	user, ok := utils.UserFromContext(r.Context())
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var req UpdateLinkRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	hasAccess, err := nr.NodeRepo.CheckNodeAccess(r.Context(), nodeID, user.ID)
	if err != nil || !hasAccess {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	link, err := nr.LinkRepo.GetLinkByID(r.Context(), linkID)
	if err != nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	if link.NodeID != nodeID {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	if req.Name != "" {
		link.Name = req.Name
	}
	if req.DisplayName != "" {
		link.DisplayName = req.DisplayName
	}
	link.Link = req.Link
	link.Description = req.Description
	if req.Icon != "" {
		link.Icon = req.Icon
	}
	link.Visible = req.Visible
	link.Enabled = req.Enabled
	link.Mini = req.Mini
	if req.GradientType != "" {
		link.GradientType = req.GradientType
	}
	if req.GradientAngle != 0 {
		link.GradientAngle = req.GradientAngle
	}
	if req.CustomAccentColorEnabled != nil {
		link.CustomAccentColorEnabled = *req.CustomAccentColorEnabled
	}
	if req.CustomAccentColor != "" {
		link.CustomAccentColor = req.CustomAccentColor
	}
	if req.CustomTitleColorEnabled != nil {
		link.CustomTitleColorEnabled = *req.CustomTitleColorEnabled
	}
	if req.CustomTitleColor != "" {
		link.CustomTitleColor = req.CustomTitleColor
	}
	if req.CustomDescriptionColorEnabled != nil {
		link.CustomDescriptionColorEnabled = *req.CustomDescriptionColorEnabled
	}
	if req.CustomDescriptionColor != "" {
		link.CustomDescriptionColor = req.CustomDescriptionColor
	}
	if req.MiniBackgroundEnabled != nil {
		link.MiniBackgroundEnabled = *req.MiniBackgroundEnabled
	}

	if len(req.ColorStops) > 0 {
		err = nr.LinkRepo.DeleteColorStopsByLinkID(r.Context(), linkID)
		if err != nil {
			applog.Error("Failed to delete existing color stops:", err)
		}

		for _, colorStop := range req.ColorStops {
			stop := &model.ColorStop{
				ID:        utils.GenerateSnowflakeID(),
				LinkID:    link.ID,
				Color:     colorStop.Color,
				Position:  colorStop.Position,
				CreatedAt: time.Now().UTC().Unix(),
				UpdatedAt: time.Now().UTC().Unix(),
			}

			err = nr.LinkRepo.CreateColorStop(r.Context(), stop)
			if err != nil {
				applog.Error("Failed to create color stop:", err)
			}
		}

		err = nr.LinkRepo.LoadColorStops(r.Context(), link)
		if err != nil {
			applog.Error("Failed to load color stops:", err)
		}
	}

	err = nr.LinkRepo.UpdateLink(r.Context(), link)
	if err != nil {
		applog.Error("Failed to update link:", err)
		api.WriteInternalError(w)
		return
	}

	err = nr.LinkRepo.LoadColorStops(r.Context(), link)
	if err != nil {
		applog.Error("Failed to load color stops:", err)
	}

	api.WriteJSON(w, 200, link)
}

// @Summary Delete a link
// @Description Delete a link and all its color stops
// @Tags links
// @Produce json
// @Param nodeID path string true "Node ID"
// @Param linkID path string true "Link ID"
// @Success 200 {object} map[string]string
// @Failure 401 {string} string "Unauthorized"
// @Failure 403 {string} string "Forbidden"
// @Failure 404 {string} string "Not found"
// @Failure 500 {string} string "Internal server error"
// @Router /nodes/{nodeID}/links/{linkID} [delete]
func (nr *NodeRouter) HandleDeleteLink(w http.ResponseWriter, r *http.Request) {
	nodeIDStr := chi.URLParam(r, "nodeID")
	nodeID, err := utils.ParseID(nodeIDStr)
	if err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	linkIDStr := chi.URLParam(r, "linkID")
	linkID, err := utils.ParseID(linkIDStr)
	if err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	user, ok := utils.UserFromContext(r.Context())
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	hasAccess, err := nr.NodeRepo.CheckNodeAccess(r.Context(), nodeID, user.ID)
	if err != nil || !hasAccess {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	link, err := nr.LinkRepo.GetLinkByID(r.Context(), linkID)
	if err != nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	if link.NodeID != nodeID {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	err = nr.LinkRepo.DeleteColorStopsByLinkID(r.Context(), linkID)
	if err != nil {
		applog.Error("Failed to delete color stops:", err)
	}

	err = nr.LinkRepo.DeleteLink(r.Context(), linkID)
	if err != nil {
		applog.Error("Failed to delete link:", err)
		api.WriteInternalError(w)
		return
	}

	api.WriteMessage(w, 200, "message", "Link deleted successfully")
}

// @Summary Update link name
// @Description Update the name of a link (for URL shortener functionality)
// @Tags links
// @Accept json
// @Produce json
// @Param nodeID path string true "Node ID"
// @Param linkID path string true "Link ID"
// @Param request body object true "Name request" schema="{name: string}"
// @Success 200 {object} map[string]string
// @Failure 400 {string} string "Bad request"
// @Failure 401 {string} string "Unauthorized"
// @Failure 403 {string} string "Forbidden"
// @Failure 404 {string} string "Not found"
// @Failure 409 {object} map[string]string "Link name already exists"
// @Failure 500 {string} string "Internal server error"
// @Router /nodes/{nodeID}/links/{linkID}/name [put]
func (nr *NodeRouter) HandleUpdateLinkName(w http.ResponseWriter, r *http.Request) {
	nodeIDStr := chi.URLParam(r, "nodeID")
	nodeID, err := utils.ParseID(nodeIDStr)
	if err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	linkIDStr := chi.URLParam(r, "linkID")
	linkID, err := utils.ParseID(linkIDStr)
	if err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	user, ok := utils.UserFromContext(r.Context())
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var req struct {
		Name string `json:"name" binding:"required"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	hasAccess, err := nr.NodeRepo.CheckNodeAccess(r.Context(), nodeID, user.ID)
	if err != nil || !hasAccess {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	link, err := nr.LinkRepo.GetLinkByID(r.Context(), linkID)
	if err != nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	if link.NodeID != nodeID {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	exists, err := nr.LinkRepo.CheckNameExists(r.Context(), req.Name)
	if err != nil {
		applog.Error("Failed to check name existence:", err)
		api.WriteInternalError(w)
		return
	}
	if exists {
		api.WriteMessage(w, 409, "error", "Link name already exists")
		return
	}

	err = nr.LinkRepo.UpdateLinkName(r.Context(), linkID, req.Name)
	if err != nil {
		applog.Error("Failed to update link name:", err)
		api.WriteInternalError(w)
		return
	}

	api.WriteMessage(w, 200, "message", "Link name updated")
}

// @Summary Reorder a link
// @Description Move a link to a new position
// @Tags links
// @Accept json
// @Produce json
// @Param nodeID path string true "Node ID"
// @Param linkID path string true "Link ID"
// @Param request body object true "Reorder link request" schema="{new_position: integer}"
// @Success 200 {object} map[string]string "Link reordered successfully"
// @Failure 400 {string} string "Bad request"
// @Failure 401 {string} string "Unauthorized"
// @Failure 403 {string} string "Forbidden"
// @Failure 404 {string} string "Not found"
// @Failure 500 {string} string "Internal server error"
// @Router /nodes/{nodeID}/links/{linkID}/reorder [post]
func (nr *NodeRouter) HandleReorderLink(w http.ResponseWriter, r *http.Request) {
	nodeIDStr := chi.URLParam(r, "nodeID")
	nodeID, err := utils.ParseID(nodeIDStr)
	if err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	linkIDStr := chi.URLParam(r, "linkID")
	linkID, err := utils.ParseID(linkIDStr)
	if err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	user, ok := utils.UserFromContext(r.Context())
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var req struct {
		NewPosition int `json:"new_position"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	if req.NewPosition < 0 {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	hasAccess, err := nr.NodeRepo.CheckNodeAccess(r.Context(), nodeID, user.ID)
	if err != nil || !hasAccess {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	link, err := nr.LinkRepo.GetLinkByID(r.Context(), linkID)
	if err != nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	if link.NodeID != nodeID {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	links, err := nr.LinkRepo.GetLinksByNodeID(r.Context(), nodeID)
	if err != nil {
		applog.Error("Failed to get links:", err)
		api.WriteInternalError(w)
		return
	}

	if req.NewPosition >= len(links) {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	err = nr.LinkRepo.UpdateLinkOrder(r.Context(), linkID, req.NewPosition)
	if err != nil {
		applog.Error("Failed to update link order:", err)
		api.WriteInternalError(w)
		return
	}

	api.WriteMessage(w, 200, "message", "Link reordered successfully")
}
