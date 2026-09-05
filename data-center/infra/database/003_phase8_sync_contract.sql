BEGIN;

ALTER TABLE public.dc_transact_vehicle_actual
  ADD COLUMN IF NOT EXISTS completeness_status varchar(20) NOT NULL DEFAULT 'EMPTY',
  ADD COLUMN IF NOT EXISTS missing_sources text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS verification_status varchar(20) NOT NULL DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS verified_by uuid,
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS verification_notes text,
  ADD COLUMN IF NOT EXISTS actual_data_origin varchar(20) NOT NULL DEFAULT 'REAL';

CREATE TABLE IF NOT EXISTS public.dc_transact_session_source (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES public.dc_site(id),
  source_id uuid NOT NULL,
  source_site_id uuid,
  source_session_id uuid NOT NULL,
  source_type varchar(20) NOT NULL,
  source_mode varchar(20) NOT NULL,
  source_status varchar(20) NOT NULL,
  device_id uuid,
  source_record_id uuid,
  received_at timestamptz,
  timeout_at timestamptz,
  last_attempt_at timestamptz,
  attempt_count int NOT NULL DEFAULT 0,
  error_code varchar(100),
  error_message text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_date timestamptz,
  updated_by uuid,
  updated_date timestamptz,
  synced_at timestamptz NOT NULL DEFAULT now(),
  raw_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT dc_session_source_site_source_unique UNIQUE (site_id, source_id)
);

CREATE TABLE IF NOT EXISTS public.dc_transact_vehicle_revision (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES public.dc_site(id),
  source_id uuid NOT NULL,
  source_site_id uuid,
  source_vehicle_actual_id uuid NOT NULL,
  revision_no int NOT NULL,
  reason text,
  changed_fields text[] NOT NULL DEFAULT '{}'::text[],
  before_data jsonb NOT NULL,
  after_data jsonb NOT NULL,
  changed_by uuid NOT NULL,
  changed_at timestamptz NOT NULL,
  synced_at timestamptz NOT NULL DEFAULT now(),
  raw_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT dc_vehicle_revision_site_source_unique UNIQUE (site_id, source_id)
);

CREATE INDEX IF NOT EXISTS idx_dc_session_source_site_session
  ON public.dc_transact_session_source (site_id, source_session_id, source_type);
CREATE INDEX IF NOT EXISTS idx_dc_vehicle_revision_site_actual
  ON public.dc_transact_vehicle_revision (site_id, source_vehicle_actual_id, revision_no);

COMMIT;
