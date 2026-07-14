package auth

import (
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type JWTClaims struct {
	UserID       string         `json:"user_id"`
	Username     string         `json:"username"`
	Email        string         `json:"email,omitempty"`
	Role         string         `json:"role"`
	HasuraClaims map[string]any `json:"https://hasura.io/jwt/claims"`
	jwt.RegisteredClaims
}

func GenerateToken(user *User, secretKey string) (string, time.Time, error) {
	expirationTime := time.Now().Add(72 * time.Hour)
	hasuraRole := normalizeHasuraRole(user)
	email := ""
	if user.Email != nil {
		email = *user.Email
	}

	claims := &JWTClaims{
		UserID:   user.ID,
		Username: user.Username,
		Email:    email,
		Role:     hasuraRole,
		HasuraClaims: map[string]any{
			"x-hasura-allowed-roles": []string{hasuraRole},
			"x-hasura-default-role":  hasuraRole,
			"x-hasura-user-id":       user.ID,
			"x-hasura-role-id":       user.RoleID,
			"x-hasura-role-code":     user.RoleCode,
		},
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Subject:   user.ID,
			Issuer:    "jatanlin-backend-services",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(secretKey))
	if err != nil {
		return "", time.Time{}, err
	}

	return tokenString, expirationTime, nil
}

func normalizeHasuraRole(user *User) string {
	roleName := strings.ToLower(strings.TrimSpace(user.RoleName))
	roleCode := strings.ToLower(strings.TrimSpace(user.RoleCode))

	if strings.Contains(roleName, "admin") || strings.Contains(roleCode, "admin") {
		return "admin"
	}

	role := roleName
	if role == "" {
		role = roleCode
	}
	if role == "" {
		return "user"
	}

	role = strings.ReplaceAll(role, " ", "_")
	role = strings.ReplaceAll(role, "-", "_")
	return role
}

func ValidateToken(tokenString string, secretKey string) (*JWTClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(secretKey), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, jwt.ErrSignatureInvalid
}
