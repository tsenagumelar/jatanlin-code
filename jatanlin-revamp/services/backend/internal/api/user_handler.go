package api

import (
	"database/sql"
	"errors"
	"strings"
	"wim-service/internal/auth"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

type UserHandler struct {
	DB *sql.DB
}

type userPayload struct {
	Username       string `json:"username"`
	FullName       string `json:"full_name"`
	BadgeNo        string `json:"badge_no"`
	Email          string `json:"email"`
	PhoneNumber    string `json:"phone_number"`
	RoleID         string `json:"role_id"`
	Password       string `json:"password"`
	ProfilePicture string `json:"profile_picture"`
	IsActive       *bool  `json:"is_active"`
}

func NewUserHandler(db *sql.DB) *UserHandler {
	return &UserHandler{DB: db}
}

func (h *UserHandler) CreateUser(c *fiber.Ctx) error {
	var req userPayload
	if err := c.BodyParser(&req); err != nil {
		return errorResponse(c, fiber.StatusBadRequest, "Invalid request body")
	}

	if err := validateCreateUser(req); err != nil {
		return errorResponse(c, fiber.StatusBadRequest, err.Error())
	}

	passwordHash, err := hashPassword(req.Password)
	if err != nil {
		return errorResponse(c, fiber.StatusInternalServerError, "Unable to hash password")
	}

	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	actorID, _ := c.Locals("userID").(string)
	user, err := h.insertUser(req, passwordHash, isActive, actorID)
	if err != nil {
		return databaseErrorResponse(c, err)
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "User created successfully",
		"data":    user,
	})
}

func (h *UserHandler) UpdateUser(c *fiber.Ctx) error {
	userID := strings.TrimSpace(c.Params("id"))
	if userID == "" {
		return errorResponse(c, fiber.StatusBadRequest, "User id is required")
	}

	var req userPayload
	if err := c.BodyParser(&req); err != nil {
		return errorResponse(c, fiber.StatusBadRequest, "Invalid request body")
	}

	if err := validateUpdateUser(req); err != nil {
		return errorResponse(c, fiber.StatusBadRequest, err.Error())
	}

	var passwordHash *string
	if strings.TrimSpace(req.Password) != "" {
		hashed, err := hashPassword(req.Password)
		if err != nil {
			return errorResponse(c, fiber.StatusInternalServerError, "Unable to hash password")
		}
		passwordHash = &hashed
	}

	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	actorID, _ := c.Locals("userID").(string)
	user, err := h.updateUser(userID, req, passwordHash, isActive, actorID)
	if err != nil {
		return databaseErrorResponse(c, err)
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "User updated successfully",
		"data":    user,
	})
}

func (h *UserHandler) DeleteUser(c *fiber.Ctx) error {
	userID := strings.TrimSpace(c.Params("id"))
	if userID == "" {
		return errorResponse(c, fiber.StatusBadRequest, "User id is required")
	}

	actorID, _ := c.Locals("userID").(string)
	if err := h.softDeleteUser(userID, actorID); err != nil {
		return databaseErrorResponse(c, err)
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "User deleted successfully",
	})
}

func validateCreateUser(req userPayload) error {
	if strings.TrimSpace(req.Username) == "" {
		return errors.New("Username is required")
	}
	if strings.TrimSpace(req.FullName) == "" {
		return errors.New("Full name is required")
	}
	if strings.TrimSpace(req.RoleID) == "" {
		return errors.New("Role is required")
	}
	if strings.TrimSpace(req.Password) == "" {
		return errors.New("Password is required")
	}
	return nil
}

func validateUpdateUser(req userPayload) error {
	if strings.TrimSpace(req.FullName) == "" {
		return errors.New("Full name is required")
	}
	if strings.TrimSpace(req.RoleID) == "" {
		return errors.New("Role is required")
	}
	return nil
}

func hashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(hash), err
}

func nullableString(value string) any {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return nil
	}
	return trimmed
}

func nullableUUID(value string) any {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return nil
	}
	return trimmed
}

func (h *UserHandler) insertUser(req userPayload, passwordHash string, isActive bool, actorID string) (*auth.UserInfo, error) {
	query := `
		INSERT INTO public.master_user (
			code,
			username,
			full_name,
			badge_no,
			email,
			phone_number,
			role_id,
			password_hash,
			profile_picture,
			is_active,
			is_deleted,
			created_by,
			created_date
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7::uuid, $8, $9, $10, false, $11::uuid, now())
		RETURNING id::text
	`

	var userID string
	err := h.DB.QueryRow(
		query,
		strings.TrimSpace(req.Username),
		strings.TrimSpace(req.Username),
		strings.TrimSpace(req.FullName),
		nullableString(req.BadgeNo),
		nullableString(req.Email),
		nullableString(req.PhoneNumber),
		strings.TrimSpace(req.RoleID),
		passwordHash,
		nullableString(req.ProfilePicture),
		isActive,
		nullableUUID(actorID),
	).Scan(&userID)
	if err != nil {
		return nil, err
	}

	return h.getUserInfo(userID)
}

func (h *UserHandler) updateUser(userID string, req userPayload, passwordHash *string, isActive bool, actorID string) (*auth.UserInfo, error) {
	query := `
		UPDATE public.master_user
		SET
			full_name = $2,
			badge_no = $3,
			email = $4,
			phone_number = $5,
			role_id = $6::uuid,
			profile_picture = $7,
			is_active = $8,
			password_hash = COALESCE($9::text, password_hash),
			updated_by = $10::uuid,
			updated_date = now()
		WHERE id = $1::uuid AND COALESCE(is_deleted, false) = false
		RETURNING id::text
	`

	var updatedID string
	err := h.DB.QueryRow(
		query,
		userID,
		strings.TrimSpace(req.FullName),
		nullableString(req.BadgeNo),
		nullableString(req.Email),
		nullableString(req.PhoneNumber),
		strings.TrimSpace(req.RoleID),
		nullableString(req.ProfilePicture),
		isActive,
		passwordHash,
		nullableUUID(actorID),
	).Scan(&updatedID)
	if err != nil {
		return nil, err
	}

	return h.getUserInfo(updatedID)
}

func (h *UserHandler) softDeleteUser(userID string, actorID string) error {
	result, err := h.DB.Exec(
		`
			UPDATE public.master_user
			SET is_deleted = true,
				is_active = false,
				updated_by = $2::uuid,
				updated_date = now()
			WHERE id = $1::uuid AND COALESCE(is_deleted, false) = false
		`,
		userID,
		nullableUUID(actorID),
	)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (h *UserHandler) getUserInfo(userID string) (*auth.UserInfo, error) {
	var user auth.User
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
		WHERE u.id = $1 AND COALESCE(u.is_deleted, false) = false
		LIMIT 1
	`

	err := h.DB.QueryRow(query, userID).Scan(
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

	info := user.ToUserInfo()
	return &info, nil
}

func errorResponse(c *fiber.Ctx, status int, message string) error {
	return c.Status(status).JSON(fiber.Map{
		"success": false,
		"message": message,
	})
}

func databaseErrorResponse(c *fiber.Ctx, err error) error {
	if err == sql.ErrNoRows {
		return errorResponse(c, fiber.StatusNotFound, "User not found")
	}

	message := err.Error()
	if strings.Contains(message, "master_user_username_key") {
		return errorResponse(c, fiber.StatusConflict, "Username already exists")
	}
	if strings.Contains(message, "master_user_code_key") {
		return errorResponse(c, fiber.StatusConflict, "User code already exists")
	}
	if strings.Contains(message, "violates foreign key constraint") {
		return errorResponse(c, fiber.StatusBadRequest, "Invalid role or reference data")
	}

	return errorResponse(c, fiber.StatusInternalServerError, "Database operation failed")
}
