-- Mirror the violation flags and integration result codes added to the site-side
-- public.transact_vehicle_status (see infra/database/007_add_verification_violation_etle_fields.sql).

ALTER TABLE public.dc_transact_vehicle_status
  ADD COLUMN IF NOT EXISTS is_violation bool NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS overload_percentage numeric(6, 2) NULL,
  ADD COLUMN IF NOT EXISTS etle_status_code int4 NULL,
  ADD COLUMN IF NOT EXISTS etle_sent_at timestamptz NULL;

CREATE INDEX IF NOT EXISTS idx_dc_transact_vehicle_status_violation
  ON public.dc_transact_vehicle_status USING btree (site_id, is_violation);
