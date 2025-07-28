package auth

import (
	"github.com/akramboussanni/treenode/internal/jwt"
	"github.com/akramboussanni/treenode/internal/mailer"
	"github.com/akramboussanni/treenode/internal/model"
	"github.com/akramboussanni/treenode/internal/utils"
)

func GenerateTokenAndSendEmail(email, templateName, subject, url string, data any) (*model.Token, error) {
	token, err := utils.GetRandomToken(16)
	if err != nil {
		return nil, err
	}

	if dataMap, ok := data.(map[string]any); ok {
		dataMap["Token"] = token.Raw
	} else {
		data = map[string]any{"Token": token.Raw}
	}

	err = mailer.Send(templateName, []string{email}, subject, data)
	if err != nil {
		return nil, err
	}

	return token, nil
}

func GenerateLogin(jwtToken jwt.Jwt) model.LoginTokens {
	sessionToken := jwtToken.WithType(model.CredentialJwt).GenerateToken()
	refreshToken := jwtToken.WithType(model.RefreshJwt).GenerateToken()

	return model.LoginTokens{
		Session: sessionToken,
		Refresh: refreshToken,
	}
}
