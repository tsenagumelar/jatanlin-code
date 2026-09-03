-- Add explicit violation flags and integration result codes to verification rows.
-- is_violation / overload_percentage are computed at verification time (see apps/web/src/utils/odol.ts),
-- the *_status_code columns record the outcome of pushing that verification to the Data Center and ETLE.

ALTER TABLE public.transact_vehicle_status
  ADD COLUMN IF NOT EXISTS is_violation bool NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS overload_percentage numeric(6, 2) NULL,
  ADD COLUMN IF NOT EXISTS dc_sync_status_code int4 NULL,
  ADD COLUMN IF NOT EXISTS dc_sync_message text NULL,
  ADD COLUMN IF NOT EXISTS dc_synced_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS etle_status_code int4 NULL,
  ADD COLUMN IF NOT EXISTS etle_message text NULL,
  ADD COLUMN IF NOT EXISTS etle_sent_at timestamptz NULL;

COMMENT ON COLUMN public.transact_vehicle_status.is_violation IS 'True when the verification result is any ODOL violation (result <> Normal)';
COMMENT ON COLUMN public.transact_vehicle_status.overload_percentage IS 'Overweight percentage against the pure class limit (without TOLERANCE_WEIGHT), null when not overweight';
COMMENT ON COLUMN public.transact_vehicle_status.dc_sync_status_code IS 'HTTP status code returned by the Data Center sync endpoint on verification';
COMMENT ON COLUMN public.transact_vehicle_status.etle_status_code IS 'Status code returned by the ETLE violation/insert API';

CREATE INDEX IF NOT EXISTS idx_vehicle_status_is_violation
  ON public.transact_vehicle_status USING btree (is_violation);
