package utils

import (
	"context"

	"github.com/akramboussanni/treenode/internal/model"
)

type contextKey string

const UserKey contextKey = "user"

func UserFromContext(ctx context.Context) (*model.User, bool) {
	user, ok := ctx.Value(UserKey).(*model.User)
	return user, ok
}
