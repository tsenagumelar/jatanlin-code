package auth

import (
	"database/sql"
	"errors"
	"log"
	"os"
	"strings"

	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	DB        *sql.DB
	SecretKey string
}

func NewAuthService(db *sql.DB, secretKey string) *AuthService {
	return &AuthService{
		DB:        db,
		SecretKey: secretKey,
	}
}

func (s *AuthService) Authenticate(username, password string) (*LoginResponse, error) {
	user, err := s.getUserByUsernameOrEmail(username)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("invalid username or password")
		}
		return nil, err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return nil, errors.New("invalid username or password")
	}

	token, expiresAt, err := GenerateToken(user, s.SecretKey)
	if err != nil {
		return nil, err
	}

	if err := s.updateActiveSiteOperator(user); err != nil {
		log.Printf("[AUTH] failed to update active site operator for user_id=%s: %v", user.ID, err)
	}

	return &LoginResponse{
		Token:     token,
		ExpiresAt: expiresAt,
		User:      user.ToUserInfo(),
	}, nil
}

func (s *AuthService) updateActiveSiteOperator(user *User) error {
	siteID := strings.TrimSpace(os.Getenv("SITE_ID"))
	if siteID == "" {
		siteID = strings.TrimSpace(os.Getenv("NEXT_PUBLIC_SITE_ID"))
	}
	siteCode := strings.TrimSpace(os.Getenv("SITE_CODE"))
	if siteCode == "" {
		siteCode = strings.TrimSpace(os.Getenv("WB_SITE_CODE"))
	}

	var result sql.Result
	var err error

	if siteID != "" {
		result, err = s.DB.Exec(`
			UPDATE public.master_site
			SET active_operator_id = $1,
			    active_operator_name = $2,
			    operational_status = 'online',
			    last_seen_at = now(),
			    updated_by = $1,
			    updated_date = now()
			WHERE id = $3::uuid
			  AND COALESCE(is_deleted, false) = false
		`, user.ID, user.FullName, siteID)
	} else if siteCode != "" {
		result, err = s.DB.Exec(`
			UPDATE public.master_site
			SET active_operator_id = $1,
			    active_operator_name = $2,
			    operational_status = 'online',
			    last_seen_at = now(),
			    updated_by = $1,
			    updated_date = now()
			WHERE code = $3
			  AND COALESCE(is_deleted, false) = false
		`, user.ID, user.FullName, siteCode)
	} else {
		result, err = s.DB.Exec(`
			UPDATE public.master_site
			SET active_operator_id = $1,
			    active_operator_name = $2,
			    operational_status = 'online',
			    last_seen_at = now(),
			    updated_by = $1,
			    updated_date = now()
			WHERE id = (
				SELECT id
				FROM public.master_site
				WHERE COALESCE(is_active, false) = true
				  AND COALESCE(is_deleted, false) = false
				ORDER BY created_date ASC
				LIMIT 1
			)
		`, user.ID, user.FullName)
	}
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		if siteID != "" {
			return errors.New("site not found for SITE_ID")
		}
		if siteCode != "" {
			return errors.New("site not found for SITE_CODE")
		}
		return errors.New("no active site found")
	}

	log.Printf("[AUTH] Active site operator updated: user_id=%s full_name=%s", user.ID, user.FullName)
	return nil
}

func (s *AuthService) getUserByUsernameOrEmail(usernameOrEmail string) (*User, error) {
	user := &User{}
	query := `
		SELECT
			u.id::text,
			u.code,
			u.username,
			u.email,
			u.password_hash,
			u.full_name,
			u.badge_no,
			u.profile_picture,
			COALESCE(u.is_active, false),
			r.id::text,
			r.code,
			r.role_name,
			r.description
		FROM public.master_user u
		JOIN public.master_role r ON r.id = u.role_id
		WHERE
			(u.username = $1 OR u.email = $1)
			AND COALESCE(u.is_active, false) = true
			AND COALESCE(u.is_deleted, false) = false
			AND COALESCE(r.is_active, false) = true
			AND COALESCE(r.is_deleted, false) = false
		LIMIT 1
	`

	err := s.DB.QueryRow(query, usernameOrEmail).Scan(
		&user.ID,
		&user.Code,
		&user.Username,
		&user.Email,
		&user.PasswordHash,
		&user.FullName,
		&user.BadgeNo,
		&user.ProfilePicture,
		&user.IsActive,
		&user.RoleID,
		&user.RoleCode,
		&user.RoleName,
		&user.RoleDesc,
	)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (u *User) ToUserInfo() UserInfo {
	return UserInfo{
		ID:             u.ID,
		Code:           u.Code,
		BadgeNo:        u.BadgeNo,
		Username:       u.Username,
		Email:          u.Email,
		FullName:       u.FullName,
		ProfilePicture: u.ProfilePicture,
		IsActive:       u.IsActive,
		MasterRole: UserRoleInfo{
			ID:          u.RoleID,
			Code:        u.RoleCode,
			RoleName:    u.RoleName,
			Description: u.RoleDesc,
		},
	}
}

func (s *AuthService) CreateUser(username, email, password, role string) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	createTableQuery := `
		CREATE TABLE IF NOT EXISTS users (
id SERIAL PRIMARY KEY,
username VARCHAR(50) UNIQUE NOT NULL,
email VARCHAR(100) UNIQUE NOT NULL,
password VARCHAR(255) NOT NULL,
role VARCHAR(20) DEFAULT 'user',
is_active BOOLEAN DEFAULT true,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
	`

	if _, err := s.DB.Exec(createTableQuery); err != nil {
		return err
	}

	insertQuery := `INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)`
	_, err = s.DB.Exec(insertQuery, username, email, string(hashedPassword), role)
	if err != nil {
		return err
	}

	log.Printf("[AUTH] User created: %s (%s)", username, role)
	return nil
}

func (s *AuthService) GetUserByID(userID int) (*UserInfo, error) {
	return nil, errors.New("GetUserByID with integer id is deprecated; use GetUserByUUID")
}

func (s *AuthService) GetUserByUUID(userID string) (*UserInfo, error) {
	user, err := s.getUserByID(userID)
	if err != nil {
		return nil, err
	}

	info := user.ToUserInfo()
	return &info, nil
}

func (s *AuthService) getUserByID(userID string) (*User, error) {
	user := &User{}
	query := `
		SELECT
			u.id::text,
			u.code,
			u.username,
			u.email,
			u.password_hash,
			u.full_name,
			u.badge_no,
			u.profile_picture,
			COALESCE(u.is_active, false),
			r.id::text,
			r.code,
			r.role_name,
			r.description
		FROM public.master_user u
		JOIN public.master_role r ON r.id = u.role_id
		WHERE
			u.id = $1
			AND COALESCE(u.is_active, false) = true
			AND COALESCE(u.is_deleted, false) = false
		LIMIT 1
	`

	err := s.DB.QueryRow(query, userID).Scan(
		&user.ID,
		&user.Code,
		&user.Username,
		&user.Email,
		&user.PasswordHash,
		&user.FullName,
		&user.BadgeNo,
		&user.ProfilePicture,
		&user.IsActive,
		&user.RoleID,
		&user.RoleCode,
		&user.RoleName,
		&user.RoleDesc,
	)
	if err != nil {
		return nil, err
	}

	return user, nil
}
