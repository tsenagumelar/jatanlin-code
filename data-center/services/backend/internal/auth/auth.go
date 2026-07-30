package auth

import (
	"database/sql"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type Service struct {
	DB        *sql.DB
	JWTSecret string
}

type User struct {
	ID       string `json:"id"`
	Code     string `json:"code"`
	Username string `json:"username"`
	Email    string `json:"email"`
	FullName string `json:"full_name"`
	BadgeNo  string `json:"badge_no"`
	RoleCode string `json:"role_code"`
	RoleName string `json:"role_name"`
}

type LoginResponse struct {
	Token     string    `json:"token"`
	ExpiresAt time.Time `json:"expires_at"`
	User      User      `json:"user"`
}

func NewService(db *sql.DB, jwtSecret string) *Service {
	return &Service{DB: db, JWTSecret: jwtSecret}
}

func (s *Service) Login(username, password string) (*LoginResponse, error) {
	var user User
	var passwordHash string

	err := s.DB.QueryRow(`
		SELECT
			u.id::text,
			u.code,
			u.username,
			u.email,
			u.password_hash,
			u.full_name,
			COALESCE(u.badge_no, ''),
			r.code,
			r.role_name
		FROM public.master_user u
		JOIN public.master_role r ON r.id = u.role_id
		WHERE (u.username = $1 OR u.email = $1)
		  AND COALESCE(u.is_active, false) = true
		  AND COALESCE(u.is_deleted, false) = false
		  AND COALESCE(r.is_active, false) = true
		  AND COALESCE(r.is_deleted, false) = false
		LIMIT 1
	`, username).Scan(
		&user.ID,
		&user.Code,
		&user.Username,
		&user.Email,
		&passwordHash,
		&user.FullName,
		&user.BadgeNo,
		&user.RoleCode,
		&user.RoleName,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("invalid username or password")
		}
		return nil, err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(password)); err != nil {
		return nil, errors.New("invalid username or password")
	}

	_, _ = s.DB.Exec(`UPDATE public.master_user SET last_login_at = now(), updated_at = now() WHERE id = $1::uuid`, user.ID)

	expiresAt := time.Now().Add(12 * time.Hour)
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":       user.ID,
		"username":  user.Username,
		"role_code": user.RoleCode,
		"exp":       expiresAt.Unix(),
		"iat":       time.Now().Unix(),
	})
	tokenString, err := token.SignedString([]byte(s.JWTSecret))
	if err != nil {
		return nil, err
	}

	return &LoginResponse{Token: tokenString, ExpiresAt: expiresAt, User: user}, nil
}

func (s *Service) ValidateToken(tokenString string) (*jwt.Token, error) {
	return jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(s.JWTSecret), nil
	})
}
