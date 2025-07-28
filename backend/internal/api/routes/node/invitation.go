package node

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/akramboussanni/treenode/internal/api"
	"github.com/akramboussanni/treenode/internal/applog"
	"github.com/akramboussanni/treenode/internal/mailer"
	"github.com/akramboussanni/treenode/internal/model"
	"github.com/akramboussanni/treenode/internal/utils"
	"github.com/go-chi/chi/v5"
)

// @Summary Invite collaborator by email
// @Description Send an email invitation to collaborate on a node. If an invitation already exists, it will be resent.
// @Tags nodes
// @Accept json
// @Produce json
// @Param nodeID path string true "Node ID"
// @Param request body InviteCollaboratorRequest true "Invite collaborator request"
// @Success 200 {object} map[string]string
// @Failure 400 {string} string "Bad request"
// @Failure 401 {string} string "Unauthorized"
// @Failure 403 {string} string "Forbidden"
// @Failure 404 {string} string "Not found"
// @Failure 500 {string} string "Internal server error"
// @Router /nodes/{nodeID}/invite [post]
func (nr *NodeRouter) HandleInviteCollaborator(w http.ResponseWriter, r *http.Request) {
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

	var req InviteCollaboratorRequest
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

	invitedUser, err := nr.UserRepo.GetUserByEmail(r.Context(), req.Email)
	if err != nil || invitedUser == nil {
		api.WriteMessage(w, 404, "error", "User with this email not found. They must register first.")
		return
	}

	hasAccess, err := nr.NodeRepo.CheckNodeAccess(r.Context(), nodeID, invitedUser.ID)
	if err != nil {
		applog.Error("Failed to check node access:", err)
		api.WriteInternalError(w)
		return
	}

	if hasAccess {
		api.WriteMessage(w, 409, "error", "User already has access to this node")
		return
	}

	existingInvitation, err := nr.InvitationRepo.GetInvitationByNodeAndUser(r.Context(), nodeID, invitedUser.ID)
	if err != nil {
		applog.Error("Failed to check existing invitation:", err)
		api.WriteInternalError(w)
		return
	}

	var invitation *model.Invitation
	var isResend bool

	if existingInvitation != nil && !existingInvitation.Accepted && existingInvitation.ExpiresAt > time.Now().UTC().Unix() {
		invitation = existingInvitation
		invitation.Token = utils.GenerateSecureToken()
		invitation.ExpiresAt = time.Now().UTC().Add(7 * 24 * time.Hour).Unix() // 7 days
		invitation.UpdatedAt = time.Now().UTC().Unix()

		err = nr.InvitationRepo.UpdateInvitationForResend(r.Context(), invitation)
		if err != nil {
			applog.Error("Failed to update invitation for resend:", err)
			api.WriteInternalError(w)
			return
		}
		isResend = true
	} else {
		invitation = &model.Invitation{
			ID:        utils.GenerateSnowflakeID(),
			NodeID:    nodeID,
			UserID:    invitedUser.ID,
			Email:     req.Email,
			Token:     utils.GenerateSecureToken(),
			Accepted:  false,
			ExpiresAt: time.Now().UTC().Add(7 * 24 * time.Hour).Unix(), // 7 days
			CreatedAt: time.Now().UTC().Unix(),
			UpdatedAt: time.Now().UTC().Unix(),
		}

		err = nr.InvitationRepo.CreateInvitation(r.Context(), invitation)
		if err != nil {
			applog.Error("Failed to create invitation:", err)
			api.WriteInternalError(w)
			return
		}
		isResend = false
	}

	acceptURL := req.BaseURL + "/invite/accept?token=" + invitation.Token
	emailData := map[string]string{
		"InviterName": user.Username,
		"PageName":    node.DisplayName,
		"AcceptURL":   acceptURL,
	}

	err = mailer.Send("collaboratorinvitation", []string{req.Email}, "Collaboration Invitation - Treenode", emailData)
	if err != nil {
		applog.Error("Failed to send invitation email:", err)
	}

	message := "Invitation sent successfully"
	if isResend {
		message = "Invitation resent successfully"
	}

	api.WriteMessage(w, 200, "message", message)
}

// @Summary Accept invitation
// @Description Accept a collaborator invitation (requires authentication)
// @Tags nodes
// @Accept json
// @Produce json
// @Security CookieAuth
// @Param request body AcceptInvitationRequest true "Accept invitation request"
// @Success 200 {object} map[string]string
// @Failure 400 {string} string "Bad request"
// @Failure 401 {string} string "Unauthorized"
// @Failure 403 {string} string "Forbidden - email mismatch"
// @Failure 404 {string} string "Invitation not found"
// @Failure 410 {string} string "Invitation expired"
// @Failure 409 {string} string "Invitation already accepted"
// @Failure 500 {string} string "Internal server error"
// @Router /nodes/api/acceptinvitation [post]
func (nr *NodeRouter) HandleAcceptInvitation(w http.ResponseWriter, r *http.Request) {
	user, ok := utils.UserFromContext(r.Context())
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var req AcceptInvitationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	invitation, err := nr.InvitationRepo.GetInvitationByToken(r.Context(), req.Token)
	if err != nil {
		api.WriteMessage(w, 404, "error", "Invitation not found")
		return
	}

	if invitation.Accepted {
		api.WriteMessage(w, 409, "error", "Invitation has already been accepted")
		return
	}

	if invitation.ExpiresAt < time.Now().UTC().Unix() {
		api.WriteMessage(w, 410, "error", "Invitation has expired")
		return
	}

	if user.ID != invitation.UserID {
		applog.Warn("Invitation user ID mismatch", "invitation_user_id:", invitation.UserID, "current_user_id:", user.ID, "user_email:", user.Email)
		api.WriteMessage(w, 403, "error", "This invitation was sent to a different user")
		return
	}

	err = nr.NodeRepo.AddNodeAccess(r.Context(), invitation.NodeID, user.ID)
	if err != nil {
		applog.Error("Failed to add node access:", err)
		api.WriteInternalError(w)
		return
	}

	invitation.Accepted = true
	invitation.UpdatedAt = time.Now().UTC().Unix()
	err = nr.InvitationRepo.UpdateInvitation(r.Context(), invitation)
	if err != nil {
		applog.Error("Failed to update invitation:", err)
	}

	applog.Info("Invitation accepted successfully", "user_id:", user.ID, "node_id:", invitation.NodeID)
	api.WriteMessage(w, 200, "message", "Invitation accepted successfully")
}

// @Summary Get invitations for a node
// @Description Get all invitations for a node (owner only)
// @Tags nodes
// @Produce json
// @Param nodeID path string true "Node ID"
// @Success 200 {array} model.Invitation
// @Failure 401 {string} string "Unauthorized"
// @Failure 403 {string} string "Forbidden"
// @Failure 404 {string} string "Not found"
// @Router /nodes/{nodeID}/invitations [get]
func (nr *NodeRouter) HandleGetInvitations(w http.ResponseWriter, r *http.Request) {
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

	invitations, err := nr.InvitationRepo.GetInvitationsByNodeID(r.Context(), nodeID)
	if err != nil {
		applog.Error("Failed to get invitations:", err)
		api.WriteInternalError(w)
		return
	}

	api.WriteJSON(w, 200, invitations)
}
