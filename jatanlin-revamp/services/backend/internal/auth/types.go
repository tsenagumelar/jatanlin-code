package auth

import (
	"time"

	"wim-service/internal/license"
)

type User struct {
	ID             string  `json:"id"`
	Code           string  `json:"code"`
	Username       string  `json:"username"`
	Email          *string `json:"email"`
	PasswordHash   string  `json:"-"`
	FullName       string  `json:"full_name"`
	BadgeNo        *string `json:"badge_no"`
	ProfilePicture *string `json:"profile_picture"`
	IsActive       bool    `json:"is_active"`
	RoleID         string  `json:"role_id"`
	RoleCode       string  `json:"role_code"`
	RoleName       string  `json:"role_name"`
	RoleDesc       *string `json:"role_description"`
}

type LoginRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Token          string              `json:"token"`
	ExpiresAt      time.Time           `json:"expires_at"`
	User           UserInfo            `json:"user"`
	LicenseChecked license.CheckResult `json:"license_checked"`
}

type UserRoleInfo struct {
	ID          string  `json:"id"`
	Code        string  `json:"code"`
	RoleName    string  `json:"role_name"`
	Description *string `json:"description"`
}

type UserInfo struct {
	ID             string       `json:"id"`
	Code           string       `json:"code"`
	BadgeNo        *string      `json:"badge_no"`
	Username       string       `json:"username"`
	Email          *string      `json:"email"`
	FullName       string       `json:"full_name"`
	ProfilePicture *string      `json:"profile_picture"`
	IsActive       bool         `json:"is_active"`
	MasterRole     UserRoleInfo `json:"master_role"`
}
