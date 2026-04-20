-- ============================================
-- Migration: Nullable Session Placeholder Rows
-- Date: 2025-01-04
-- Description:
--   Allow each capture/source table to keep a placeholder row for an active
--   WIM session even when the sensor/source does not return data.
--   Placeholder rows may contain only id + session_id, with source fields NULL
--   and later adjusted during verification.
--   Application code must use NULL, not empty string, for missing unique fields.
-- ============================================

-- ANPR placeholder support: ANPR can be missing or unreadable.
ALTER TABLE IF EXISTS public.transact_anpr_capture
	ALTER COLUMN external_id DROP NOT NULL,
	ALTER COLUMN plate_no DROP NOT NULL,
	ALTER COLUMN minio_bucket DROP NOT NULL,
	ALTER COLUMN minio_date_folder DROP NOT NULL,
	ALTER COLUMN minio_xml_object DROP NOT NULL,
	ALTER COLUMN minio_full_image_object DROP NOT NULL,
	ALTER COLUMN minio_plate_image_object DROP NOT NULL;

-- AXLE placeholder support: VAC/AXLE can timeout or return no valid axle count.
ALTER TABLE IF EXISTS public.transact_axle_capture
	ALTER COLUMN external_id DROP NOT NULL,
	ALTER COLUMN minio_bucket DROP NOT NULL,
	ALTER COLUMN minio_date_folder DROP NOT NULL,
	ALTER COLUMN minio_xml_object DROP NOT NULL,
	ALTER COLUMN minio_image_object DROP NOT NULL;

-- Dimension placeholder support: dimension can be missing and may not have ANPR image.
ALTER TABLE IF EXISTS public.transact_dimension
	ALTER COLUMN anpr_id DROP NOT NULL,
	ALTER COLUMN filepath DROP NOT NULL;

-- Vehicle actual placeholder support: verification must not require ANPR as parent.
ALTER TABLE IF EXISTS public.transact_vehicle_actual
	ALTER COLUMN anpr_id DROP NOT NULL;

-- CCTV placeholder support if the table exists in the target database.
DO $$
BEGIN
	IF EXISTS (
		SELECT FROM information_schema.tables
		WHERE table_schema = 'public'
		AND table_name = 'transact_cctv'
	) THEN
		IF EXISTS (
			SELECT FROM information_schema.columns
			WHERE table_schema = 'public'
			AND table_name = 'transact_cctv'
			AND column_name = 'filename'
		) THEN
			ALTER TABLE public.transact_cctv ALTER COLUMN filename DROP NOT NULL;
		END IF;

		IF EXISTS (
			SELECT FROM information_schema.columns
			WHERE table_schema = 'public'
			AND table_name = 'transact_cctv'
			AND column_name = 'filepath'
		) THEN
			ALTER TABLE public.transact_cctv ALTER COLUMN filepath DROP NOT NULL;
		END IF;

		IF EXISTS (
			SELECT FROM information_schema.columns
			WHERE table_schema = 'public'
			AND table_name = 'transact_cctv'
			AND column_name = 'site_id'
		) THEN
			ALTER TABLE public.transact_cctv ALTER COLUMN site_id DROP NOT NULL;
		END IF;
	END IF;
END $$;

-- Add session_id to vehicle actual so a verification aggregate can exist before
-- individual source records are captured or adjusted.
ALTER TABLE IF EXISTS public.transact_vehicle_actual
	ADD COLUMN IF NOT EXISTS session_id uuid NULL;

ALTER TABLE IF EXISTS public.transact_vehicle_actual
	DROP CONSTRAINT IF EXISTS fk_actual_session;

ALTER TABLE IF EXISTS public.transact_vehicle_actual
	ADD CONSTRAINT fk_actual_session FOREIGN KEY (session_id)
	REFERENCES public.transact_wim_session(id) ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS idx_vehicle_actual_session
	ON public.transact_vehicle_actual USING btree (session_id);

COMMENT ON COLUMN public.transact_vehicle_actual.session_id IS
	'WIM session ID for grouping partial source data during verification';

-- Add session_id to CCTV if the table exists and the column has not been added yet.
DO $$
BEGIN
	IF EXISTS (
		SELECT FROM information_schema.tables
		WHERE table_schema = 'public'
		AND table_name = 'transact_cctv'
	) THEN
		ALTER TABLE public.transact_cctv
			ADD COLUMN IF NOT EXISTS session_id uuid NULL;

		ALTER TABLE public.transact_cctv
			DROP CONSTRAINT IF EXISTS fk_cctv_session;

		ALTER TABLE public.transact_cctv
			ADD CONSTRAINT fk_cctv_session FOREIGN KEY (session_id)
			REFERENCES public.transact_wim_session(id) ON DELETE SET NULL ON UPDATE CASCADE;

		CREATE INDEX IF NOT EXISTS idx_cctv_session
			ON public.transact_cctv USING btree (session_id);

		COMMENT ON COLUMN public.transact_cctv.session_id IS
			'WIM session ID when this CCTV capture was processed';
	END IF;
END $$;

-- Document expected placeholder pattern in comments.
COMMENT ON COLUMN public.transact_anpr_capture.session_id IS
	'WIM session ID. Placeholder row may contain only id + session_id when ANPR is missing';
COMMENT ON COLUMN public.transact_axle_capture.session_id IS
	'WIM session ID. Placeholder row may contain only id + session_id when AXLE is missing';
COMMENT ON COLUMN public.transact_dimension.session_id IS
	'WIM session ID. Placeholder row may contain only id + session_id when dimension is missing';
COMMENT ON COLUMN public.transact_weighing.session_id IS
	'WIM session ID. Placeholder row may contain only id + session_id when weighing is missing';
