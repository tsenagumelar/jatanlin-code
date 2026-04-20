-- Drop the incorrectly named master_wim_session table
-- This will be replaced with transact_wim_session

-- Drop constraints first
ALTER TABLE public.transact_anpr_capture DROP CONSTRAINT IF EXISTS fk_anpr_session;
ALTER TABLE public.transact_axle_capture DROP CONSTRAINT IF EXISTS fk_axle_session;
ALTER TABLE public.transact_dimension DROP CONSTRAINT IF EXISTS fk_dimension_session;
ALTER TABLE public.transact_weighing DROP CONSTRAINT IF EXISTS fk_weighing_session;

-- Drop indexes
DROP INDEX IF EXISTS idx_anpr_session;
DROP INDEX IF EXISTS idx_axle_session;
DROP INDEX IF EXISTS idx_dimension_session;
DROP INDEX IF EXISTS idx_weighing_session;

-- Drop columns
ALTER TABLE public.transact_anpr_capture DROP COLUMN IF EXISTS session_id;
ALTER TABLE public.transact_axle_capture DROP COLUMN IF EXISTS session_id;
ALTER TABLE public.transact_dimension DROP COLUMN IF EXISTS session_id;
ALTER TABLE public.transact_weighing DROP COLUMN IF EXISTS session_id;

-- Drop trigger and function
DROP TRIGGER IF EXISTS trigger_generate_wim_session_code ON public.master_wim_session;
DROP FUNCTION IF EXISTS auto_generate_wim_session_code();

-- Drop table
DROP TABLE IF EXISTS public.master_wim_session;
