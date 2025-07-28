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

// @Summary Create a new color stop
// @Description Create a new color stop for a link
// @Tags color-stops
// @Accept json
// @Produce json
// @Param nodeID path string true "Node ID"
// @Param linkID path string true "Link ID"
// @Param request body CreateColorStopRequest true "Create color stop request"
// @Success 201 {object} model.ColorStop
// @Failure 400 {string} string "Bad request"
// @Failure 401 {string} string "Unauthorized"
// @Failure 403 {string} string "Forbidden"
// @Failure 404 {string} string "Not found"
// @Failure 500 {string} string "Internal server error"
// @Router /nodes/{nodeID}/links/{linkID}/color-stops [post]
func (nr *NodeRouter) HandleCreateColorStop(w http.ResponseWriter, r *http.Request) {
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

	var req CreateColorStopRequest
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

	colorStop := &model.ColorStop{
		ID:        utils.GenerateSnowflakeID(),
		LinkID:    linkID,
		Color:     req.Color,
		Position:  req.Position,
		CreatedAt: time.Now().UTC().Unix(),
	}

	err = nr.LinkRepo.CreateColorStop(r.Context(), colorStop)
	if err != nil {
		applog.Error("Failed to create color stop:", err)
		api.WriteInternalError(w)
		return
	}

	api.WriteJSON(w, 201, colorStop)
}

// @Summary Update a color stop
// @Description Update a color stop (not implemented)
// @Tags color-stops
// @Accept json
// @Produce json
// @Param nodeID path string true "Node ID"
// @Param linkID path string true "Link ID"
// @Param colorStopID path string true "Color Stop ID"
// @Param request body UpdateColorStopRequest true "Update color stop request"
// @Success 200 {object} map[string]string
// @Failure 400 {string} string "Bad request"
// @Failure 401 {string} string "Unauthorized"
// @Failure 403 {string} string "Forbidden"
// @Failure 404 {string} string "Not found"
// @Router /nodes/{nodeID}/links/{linkID}/color-stops/{colorStopID} [put]
func (nr *NodeRouter) HandleUpdateColorStop(w http.ResponseWriter, r *http.Request) {
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

	colorStopIDStr := chi.URLParam(r, "colorStopID")
	colorStopID, err := utils.ParseID(colorStopIDStr)
	if err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	user, ok := utils.UserFromContext(r.Context())
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var req UpdateColorStopRequest
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

	colorStop, err := nr.LinkRepo.GetColorStopByID(r.Context(), colorStopID)
	if err != nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	if colorStop.LinkID != linkID {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	colorStop.Color = req.Color
	colorStop.Position = req.Position

	err = nr.LinkRepo.UpdateColorStop(r.Context(), colorStop)
	if err != nil {
		applog.Error("Failed to update color stop:", err)
		api.WriteInternalError(w)
		return
	}

	api.WriteJSON(w, 200, colorStop)
}

// @Summary Delete a color stop
// @Description Delete a color stop
// @Tags color-stops
// @Produce json
// @Param nodeID path string true "Node ID"
// @Param linkID path string true "Link ID"
// @Param colorStopID path string true "Color Stop ID"
// @Success 200 {object} map[string]string
// @Failure 401 {string} string "Unauthorized"
// @Failure 403 {string} string "Forbidden"
// @Failure 404 {string} string "Not found"
// @Failure 500 {string} string "Internal server error"
// @Router /nodes/{nodeID}/links/{linkID}/color-stops/{colorStopID} [delete]
func (nr *NodeRouter) HandleDeleteColorStop(w http.ResponseWriter, r *http.Request) {
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

	colorStopIDStr := chi.URLParam(r, "colorStopID")
	colorStopID, err := utils.ParseID(colorStopIDStr)
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

	colorStop, err := nr.LinkRepo.GetColorStopByID(r.Context(), colorStopID)
	if err != nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	if colorStop.LinkID != linkID {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	err = nr.LinkRepo.DeleteColorStop(r.Context(), colorStopID)
	if err != nil {
		applog.Error("Failed to delete color stop:", err)
		api.WriteInternalError(w)
		return
	}

	api.WriteMessage(w, 200, "message", "Color stop deleted successfully")
}
