CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.master_role (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  role_name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.master_user (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  username VARCHAR(80) NOT NULL UNIQUE,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(160) NOT NULL,
  badge_no VARCHAR(80),
  profile_picture TEXT,
  role_id UUID NOT NULL REFERENCES public.master_role(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.dc_site (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_code VARCHAR(80) NOT NULL UNIQUE,
  site_name VARCHAR(160) NOT NULL,
  site_address TEXT,
  city VARCHAR(100),
  province VARCHAR(100),
  timezone VARCHAR(80) NOT NULL DEFAULT 'Asia/Jakarta',
  operational_status VARCHAR(40) NOT NULL DEFAULT 'offline',
  active_operator_id UUID,
  active_operator_name VARCHAR(160),
  last_seen_at TIMESTAMPTZ,
  last_sync_at TIMESTAMPTZ,
  app_version VARCHAR(80),
  service_version VARCHAR(80),
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.dc_vehicle_actual (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.dc_site(id),
  site_transaction_id UUID NOT NULL,
  transaction_no VARCHAR(120),
  plate_no VARCHAR(40),
  vehicle_class VARCHAR(100),
  operator_name VARCHAR(160),
  location_lat NUMERIC(11,8),
  location_lng NUMERIC(11,8),
  location_address TEXT,
  total_weight NUMERIC(14,2),
  length_mm NUMERIC(14,2),
  width_mm NUMERIC(14,2),
  height_mm NUMERIC(14,2),
  axle_count INTEGER,
  violation_status VARCHAR(40) NOT NULL DEFAULT 'pending',
  violation_notes TEXT,
  enforcement_started_at TIMESTAMPTZ,
  enforcement_finished_at TIMESTAMPTZ,
  source_updated_at TIMESTAMPTZ,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT dc_vehicle_actual_site_unique UNIQUE (site_id, site_transaction_id)
);

CREATE TABLE IF NOT EXISTS public.dc_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES public.dc_site(id),
  sync_type VARCHAR(80) NOT NULL,
  status VARCHAR(40) NOT NULL,
  records_total INTEGER NOT NULL DEFAULT 0,
  records_success INTEGER NOT NULL DEFAULT 0,
  records_failed INTEGER NOT NULL DEFAULT 0,
  message TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_dc_site_status ON public.dc_site (operational_status, last_seen_at);
CREATE INDEX IF NOT EXISTS idx_dc_vehicle_actual_site ON public.dc_vehicle_actual (site_id, enforcement_started_at DESC);
CREATE INDEX IF NOT EXISTS idx_dc_vehicle_actual_violation ON public.dc_vehicle_actual (violation_status, enforcement_started_at DESC);
CREATE INDEX IF NOT EXISTS idx_dc_sync_log_site ON public.dc_sync_log (site_id, started_at DESC);
