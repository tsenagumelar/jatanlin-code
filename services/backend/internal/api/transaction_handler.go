package api

import (
	"database/sql"
	"errors"
	"strings"
	"wim-service/internal/orchestrator"

	"github.com/gofiber/fiber/v2"
)

type TransactionHandler struct{ service *orchestrator.Service }

func NewTransactionHandler(service *orchestrator.Service) *TransactionHandler {
	return &TransactionHandler{service: service}
}

func (h *TransactionHandler) Start(c *fiber.Ctx) error {
	actorID, err := authenticatedActorID(c)
	if err != nil {
		return errorResponse(c, fiber.StatusUnauthorized, err.Error())
	}
	var req orchestrator.StartRequest
	if len(c.Body()) > 0 {
		if err := c.BodyParser(&req); err != nil {
			return errorResponse(c, fiber.StatusBadRequest, "Invalid request body")
		}
	}
	session, recovered, err := h.service.Start(c.UserContext(), actorID, req)
	if err != nil {
		return transactionError(c, err)
	}
	status, message := fiber.StatusCreated, "Transaction session started"
	if recovered {
		status, message = fiber.StatusOK, "Active transaction session recovered"
	}
	return c.Status(status).JSON(fiber.Map{"success": true, "message": message, "data": session})
}

func (h *TransactionHandler) Active(c *fiber.Ctx) error {
	session, err := h.service.Active(c.UserContext())
	if errors.Is(err, orchestrator.ErrNoActiveSession) {
		return c.JSON(fiber.Map{"success": true, "message": "No active transaction session", "data": nil})
	}
	if err != nil {
		return transactionError(c, err)
	}
	return c.JSON(fiber.Map{"success": true, "data": session})
}

func (h *TransactionHandler) Finalize(c *fiber.Ctx) error {
	actorID, err := authenticatedActorID(c)
	if err != nil {
		return errorResponse(c, fiber.StatusUnauthorized, err.Error())
	}
	var req orchestrator.FinalizeRequest
	if len(c.Body()) > 0 {
		if err := c.BodyParser(&req); err != nil {
			return errorResponse(c, fiber.StatusBadRequest, "Invalid request body")
		}
	}
	result, err := h.service.Finalize(c.UserContext(), actorID, c.Params("id"), req)
	if err != nil {
		return transactionError(c, err)
	}
	return c.JSON(fiber.Map{"success": true, "message": "Transaction session finalized", "data": result})
}

func transactionError(c *fiber.Ctx, err error) error {
	if errors.Is(err, sql.ErrNoRows) {
		return errorResponse(c, fiber.StatusNotFound, "Transaction session not found")
	}
	message := err.Error()
	if strings.HasPrefix(message, "invalid ") || strings.Contains(message, "must be") {
		return errorResponse(c, fiber.StatusBadRequest, message)
	}
	return errorResponse(c, fiber.StatusInternalServerError, "Transaction operation failed")
}
