package jwt

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"strings"
	"time"

	"github.com/akramboussanni/treenode/config"
	"github.com/akramboussanni/treenode/internal/model"
	"github.com/akramboussanni/treenode/internal/repo"
	"github.com/google/uuid"
)

func (jwt Jwt) GenerateToken() string {
	header, _ := json.Marshal(jwt.Header)
	payload, _ := json.Marshal(jwt.Payload)

	data := base64.URLEncoding.EncodeToString(header) + "." + base64.URLEncoding.EncodeToString(payload)

	h := hmac.New(sha256.New, config.JwtSecretBytes)
	h.Write([]byte(data))
	rawSig := h.Sum(nil)

	return data + "." + base64.URLEncoding.EncodeToString(rawSig)
}

func ValidateToken(token string, secret []byte, tr *repo.TokenRepo) (*Claims, error) {
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return nil, errors.New("invalid token format")
	}

	data := parts[0] + "." + parts[1]
	signature, err := base64.URLEncoding.DecodeString(parts[2])
	if err != nil {
		return nil, errors.New("invalid signature encoding")
	}

	h := hmac.New(sha256.New, secret)
	h.Write([]byte(data))
	expectedSig := h.Sum(nil)

	if !hmac.Equal(signature, expectedSig) {
		return nil, errors.New("invalid token signature")
	}

	payloadBytes, err := base64.URLEncoding.DecodeString(parts[1])
	if err != nil {
		return nil, errors.New("invalid payload encoding")
	}

	var claims Claims
	if err := json.Unmarshal(payloadBytes, &claims); err != nil {
		return nil, errors.New("invalid payload json")
	}

	now := time.Now().UTC().Unix()
	if claims.Expiration != 0 && now > claims.Expiration {
		return nil, errors.New("token expired")
	}
	if claims.IssuedAt != 0 && now < claims.IssuedAt {
		return nil, errors.New("token not valid yet")
	}
	revoked, err := tr.IsTokenRevoked(claims.TokenID)
	if err != nil || revoked {
		return nil, errors.New("token revoked")
	}

	return &claims, nil
}

func CreateJwt(claims Claims) Jwt {
	return Jwt{
		Header: Header{
			Algorithm: "HS256",
			Type:      "JWT",
		},
		Payload: claims,
	}
}

func CreateJwtFromUser(user *model.User) Jwt {
	now := time.Now().UTC().Unix()
	claims := Claims{
		UserID:    user.ID,
		TokenID:   uuid.New().String(),
		IssuedAt:  now,
		Email:     user.Email,
		Role:      user.Role,
		SessionID: user.JwtSessionID,
	}

	return CreateJwt(claims)
}
