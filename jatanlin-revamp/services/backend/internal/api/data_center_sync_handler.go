package api

import (
	"context"
	"time"

	"github.com/gofiber/fiber/v2"
)

type dataCenterSyncRangeRequest struct {
	StartDate string `json:"start_date"`
	EndDate   string `json:"end_date"`
	FullSync  bool   `json:"full_sync"`
}

type dataCenterSyncRangeResult struct {
	VehicleActual int64 `json:"vehicle_actual"`
	VehicleStatus int64 `json:"vehicle_status"`
	AnprCapture   int64 `json:"anpr_capture"`
	AxleCapture   int64 `json:"axle_capture"`
	CCTV          int64 `json:"cctv"`
	Dimension     int64 `json:"dimension"`
	Weighing      int64 `json:"weighing"`
	WIMSession    int64 `json:"wim_session"`
}

func (s *Server) TriggerDataCenterSyncRange(c *fiber.Ctx) error {
	var req dataCenterSyncRangeRequest
	if err := c.BodyParser(&req); err != nil {
		return errorResponse(c, fiber.StatusBadRequest, "Invalid request body")
	}

	var startAt, endExclusive time.Time
	if !req.FullSync {
		startDate, err := parseSyncDate(req.StartDate)
		if err != nil {
			return errorResponse(c, fiber.StatusBadRequest, "start_date must use YYYY-MM-DD")
		}
		endDate, err := parseSyncDate(req.EndDate)
		if err != nil {
			return errorResponse(c, fiber.StatusBadRequest, "end_date must use YYYY-MM-DD")
		}
		if endDate.Before(startDate) {
			return errorResponse(c, fiber.StatusBadRequest, "end_date must be greater than or equal to start_date")
		}

		startAt = startDate
		endExclusive = endDate.AddDate(0, 0, 1)
	}

	var result dataCenterSyncRangeResult
	err := s.DB.QueryRowContext(context.Background(), `
		WITH master_role AS (
			UPDATE public.master_role
			SET updated_date = now()
			RETURNING 1
		),
		master_device_type AS (
			UPDATE public.master_device_type
			SET updated_date = now()
			RETURNING 1
		),
		master_vehicle_class AS (
			UPDATE public.master_vehicle_class
			SET updated_date = now()
			RETURNING 1
		),
		master_config AS (
			UPDATE public.master_config
			SET updated_date = now()
			RETURNING 1
		),
		master_device AS (
			UPDATE public.master_device
			SET updated_date = now()
			RETURNING 1
		),
		master_user AS (
			UPDATE public.master_user
			SET updated_date = now()
			RETURNING 1
		),
		actual_scope AS MATERIALIZED (
			SELECT
				id,
				site_id,
				session_id,
				anpr_id,
				axle_id,
				transact_cctv_id,
				transact_dimension_id,
				transact_weighing_id
			FROM public.transact_vehicle_actual
			WHERE ($3::boolean OR COALESCE(is_deleted, false) = false)
			  AND (
			    $3::boolean
			    OR (
			      COALESCE(created_date, updated_date, now()) >= $1
			      AND COALESCE(created_date, updated_date, now()) < $2
			    )
			  )
		),
		u_actual AS (
			UPDATE public.transact_vehicle_actual t
			SET updated_date = now()
			WHERE $3::boolean
			   OR EXISTS (
			     SELECT 1
			     FROM actual_scope s
			     WHERE s.id = t.id
			   )
			RETURNING 1
		),
		u_status AS (
			UPDATE public.transact_vehicle_status t
			SET updated_date = now()
			WHERE $3::boolean
			   OR EXISTS (
			     SELECT 1
			     FROM actual_scope s
			     WHERE s.id = t.transact_vehicle_actual_id
			   )
			RETURNING 1
		),
		u_anpr AS (
			UPDATE public.transact_anpr_capture t
			SET updated_date = now()
			WHERE $3::boolean
			   OR EXISTS (
			     SELECT 1
			     FROM actual_scope s
			     WHERE t.id = s.anpr_id
			        OR (s.session_id IS NOT NULL AND t.session_id = s.session_id)
			   )
			RETURNING 1
		),
		u_axle AS (
			UPDATE public.transact_axle_capture t
			SET updated_date = now()
			WHERE $3::boolean
			   OR EXISTS (
			     SELECT 1
			     FROM actual_scope s
			     WHERE t.id = s.axle_id
			        OR (s.session_id IS NOT NULL AND t.session_id = s.session_id)
			   )
			RETURNING 1
		),
		u_cctv AS (
			UPDATE public.transact_cctv t
			SET updated_date = now()
			WHERE $3::boolean
			   OR EXISTS (
			     SELECT 1
			     FROM actual_scope s
			     WHERE t.id = s.transact_cctv_id
			        OR (s.session_id IS NOT NULL AND t.session_id = s.session_id)
			   )
			RETURNING 1
		),
		u_dimension AS (
			UPDATE public.transact_dimension t
			SET updated_date = now()
			WHERE $3::boolean
			   OR EXISTS (
			     SELECT 1
			     FROM actual_scope s
			     WHERE t.id = s.transact_dimension_id
			        OR (s.session_id IS NOT NULL AND t.session_id = s.session_id)
			   )
			RETURNING 1
		),
		u_weighing AS (
			UPDATE public.transact_weighing t
			SET updated_date = now()
			WHERE $3::boolean
			   OR EXISTS (
			     SELECT 1
			     FROM actual_scope s
			     WHERE t.id = s.transact_weighing_id
			        OR (s.session_id IS NOT NULL AND t.session_id = s.session_id)
			   )
			RETURNING 1
		),
		u_session AS (
			UPDATE public.transact_wim_session t
			SET updated_date = now()
			WHERE $3::boolean
			   OR EXISTS (
			     SELECT 1
			     FROM actual_scope s
			     WHERE t.id = s.session_id
			   )
			RETURNING 1
		)
		SELECT
			(SELECT count(*) FROM u_actual)::bigint,
			(SELECT count(*) FROM u_status)::bigint,
			(SELECT count(*) FROM u_anpr)::bigint,
			(SELECT count(*) FROM u_axle)::bigint,
			(SELECT count(*) FROM u_cctv)::bigint,
			(SELECT count(*) FROM u_dimension)::bigint,
			(SELECT count(*) FROM u_weighing)::bigint,
			(SELECT count(*) FROM u_session)::bigint
	`, startAt, endExclusive, req.FullSync).Scan(
		&result.VehicleActual,
		&result.VehicleStatus,
		&result.AnprCapture,
		&result.AxleCapture,
		&result.CCTV,
		&result.Dimension,
		&result.Weighing,
		&result.WIMSession,
	)
	if err != nil {
		return databaseErrorResponse(c, err)
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Data center sync queued. Sync agent will upsert the selected range on the next run.",
		"data": fiber.Map{
			"start_date": req.StartDate,
			"end_date":   req.EndDate,
			"full_sync":  req.FullSync,
			"counts":     result,
		},
	})
}

func parseSyncDate(value string) (time.Time, error) {
	return time.ParseInLocation("2006-01-02", value, time.Local)
}
