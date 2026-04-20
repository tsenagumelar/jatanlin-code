-- ============================================
-- Migration: Add WIM Session Tracking
-- Date: 2025-01-03
-- Description:
--   1. Create transact_wim_session table for tracking WIM process sessions
--   2. Add session_id column to transact tables
-- ============================================

-- ============================================
-- 1. CREATE TABLE: transact_wim_session
-- ============================================

CREATE TABLE IF NOT EXISTS public.transact_wim_session (
	id uuid NOT NULL DEFAULT uuid_generate_v4(),
	code varchar(50) NOT NULL,
	session_name varchar(200) NULL,
	site_id uuid NOT NULL,
	started_at timestamptz NOT NULL DEFAULT now(),
	ended_at timestamptz NULL,
	status varchar(50) NOT NULL DEFAULT 'STARTED',
	total_vehicles int4 NULL DEFAULT 0,
	processed_vehicles int4 NULL DEFAULT 0,
	notes text NULL,
	started_by uuid NULL,
	ended_by uuid NULL,
	is_active bool NULL DEFAULT true,
	is_deleted bool NULL DEFAULT false,
	created_by uuid NULL,
	created_date timestamptz NULL DEFAULT now(),
	updated_by uuid NULL,
	updated_date timestamptz NULL DEFAULT now(),
	CONSTRAINT transact_wim_session_pkey PRIMARY KEY (id),
	CONSTRAINT transact_wim_session_code_key UNIQUE (code),
	CONSTRAINT transact_wim_session_status_check CHECK (
		status IN ('STARTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ERROR')
	),
	CONSTRAINT fk_wim_session_site FOREIGN KEY (site_id)
		REFERENCES public.master_site(id) ON DELETE RESTRICT ON UPDATE CASCADE,
	CONSTRAINT fk_wim_session_started_by FOREIGN KEY (started_by)
		REFERENCES public.master_user(id) ON DELETE SET NULL ON UPDATE CASCADE,
	CONSTRAINT fk_wim_session_ended_by FOREIGN KEY (ended_by)
		REFERENCES public.master_user(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create indexes for transact_wim_session
CREATE INDEX idx_wim_session_site ON public.transact_wim_session USING btree (site_id);
CREATE INDEX idx_wim_session_status ON public.transact_wim_session USING btree (status);
CREATE INDEX idx_wim_session_started_at ON public.transact_wim_session USING btree (started_at DESC);
CREATE INDEX idx_wim_session_active ON public.transact_wim_session USING btree (is_active)
	WHERE (is_deleted = false);

-- Add table and column comments
COMMENT ON TABLE public.transact_wim_session IS
	'Transaction table for tracking WIM (Weigh In Motion) process sessions';
COMMENT ON COLUMN public.transact_wim_session.code IS
	'Unique session code identifier (e.g., WIM-2025-0001)';
COMMENT ON COLUMN public.transact_wim_session.status IS
	'Session status: STARTED, IN_PROGRESS, COMPLETED, CANCELLED, ERROR';
COMMENT ON COLUMN public.transact_wim_session.started_at IS
	'Timestamp when session was started';
COMMENT ON COLUMN public.transact_wim_session.ended_at IS
	'Timestamp when session was ended/completed';
COMMENT ON COLUMN public.transact_wim_session.total_vehicles IS
	'Total number of vehicles expected in this session';
COMMENT ON COLUMN public.transact_wim_session.processed_vehicles IS
	'Number of vehicles processed so far';

-- ============================================
-- 2. ADD session_id COLUMN to transact tables
-- ============================================

-- Add session_id to transact_anpr_capture
ALTER TABLE public.transact_anpr_capture
	ADD COLUMN IF NOT EXISTS session_id uuid NULL;

ALTER TABLE public.transact_anpr_capture
	ADD CONSTRAINT fk_anpr_session FOREIGN KEY (session_id)
	REFERENCES public.transact_wim_session(id) ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS idx_anpr_session
	ON public.transact_anpr_capture USING btree (session_id);

COMMENT ON COLUMN public.transact_anpr_capture.session_id IS
	'WIM session ID when this capture was processed';

-- Add session_id to transact_axle_capture
ALTER TABLE public.transact_axle_capture
	ADD COLUMN IF NOT EXISTS session_id uuid NULL;

ALTER TABLE public.transact_axle_capture
	ADD CONSTRAINT fk_axle_session FOREIGN KEY (session_id)
	REFERENCES public.transact_wim_session(id) ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS idx_axle_session
	ON public.transact_axle_capture USING btree (session_id);

COMMENT ON COLUMN public.transact_axle_capture.session_id IS
	'WIM session ID when this measurement was processed';

-- Add session_id to transact_dimension
ALTER TABLE public.transact_dimension
	ADD COLUMN IF NOT EXISTS session_id uuid NULL;

ALTER TABLE public.transact_dimension
	ADD CONSTRAINT fk_dimension_session FOREIGN KEY (session_id)
	REFERENCES public.transact_wim_session(id) ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS idx_dimension_session
	ON public.transact_dimension USING btree (session_id);

COMMENT ON COLUMN public.transact_dimension.session_id IS
	'WIM session ID when this dimension was calculated';

-- Add session_id to transact_weighing
ALTER TABLE public.transact_weighing
	ADD COLUMN IF NOT EXISTS session_id uuid NULL;

ALTER TABLE public.transact_weighing
	ADD CONSTRAINT fk_weighing_session FOREIGN KEY (session_id)
	REFERENCES public.transact_wim_session(id) ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS idx_weighing_session
	ON public.transact_weighing USING btree (session_id);

COMMENT ON COLUMN public.transact_weighing.session_id IS
	'WIM session ID when this weighing was processed';

-- Add session_id to transact_vehicle_matched (if exists)
-- Check if table exists first
DO $$
BEGIN
	IF EXISTS (
		SELECT FROM information_schema.tables
		WHERE table_schema = 'public'
		AND table_name = 'transact_vehicle_matched'
	) THEN
		ALTER TABLE public.transact_vehicle_matched
			ADD COLUMN IF NOT EXISTS session_id uuid NULL;

		ALTER TABLE public.transact_vehicle_matched
			ADD CONSTRAINT fk_matched_session FOREIGN KEY (session_id)
			REFERENCES public.transact_wim_session(id) ON DELETE SET NULL ON UPDATE CASCADE;

		CREATE INDEX IF NOT EXISTS idx_matched_session
			ON public.transact_vehicle_matched USING btree (session_id);

		COMMENT ON COLUMN public.transact_vehicle_matched.session_id IS
			'WIM session ID when this matching was processed';
	END IF;
END $$;

-- ============================================
-- 3. CREATE TRIGGER for auto-generating session code
-- ============================================

-- Create function to auto-generate session code
CREATE OR REPLACE FUNCTION auto_generate_wim_session_code()
RETURNS TRIGGER AS $$
DECLARE
	year_str VARCHAR(4);
	seq_num INT;
	new_code VARCHAR(50);
BEGIN
	-- Get current year
	year_str := TO_CHAR(CURRENT_DATE, 'YYYY');

	-- Get next sequence number for this year
	SELECT COALESCE(MAX(
		CASE
			WHEN code ~ ('^WIM-' || year_str || '-[0-9]+$')
			THEN CAST(SUBSTRING(code FROM '[0-9]+$') AS INTEGER)
			ELSE 0
		END
	), 0) + 1
	INTO seq_num
	FROM transact_wim_session;

	-- Generate new code: WIM-YYYY-NNNN (e.g., WIM-2025-0001)
	new_code := 'WIM-' || year_str || '-' || LPAD(seq_num::TEXT, 4, '0');

	NEW.code := new_code;
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_generate_wim_session_code ON public.transact_wim_session;

CREATE TRIGGER trigger_generate_wim_session_code
	BEFORE INSERT ON public.transact_wim_session
	FOR EACH ROW
	WHEN (NEW.code IS NULL OR NEW.code = '')
	EXECUTE FUNCTION auto_generate_wim_session_code();

-- ============================================
-- 4. GRANT PERMISSIONS (if needed)
-- ============================================

-- Grant permissions to application user (adjust as needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON public.transact_wim_session TO your_app_user;

-- ============================================
-- END OF MIGRATION
-- ============================================
