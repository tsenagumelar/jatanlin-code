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

CREATE TABLE IF NOT EXISTS public.dc_site_sync_cursor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.dc_site(id),
  sync_type VARCHAR(80) NOT NULL,
  last_source_updated_at TIMESTAMPTZ,
  last_site_sequence BIGINT,
  last_synced_at TIMESTAMPTZ,
  last_error TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT dc_site_sync_cursor_unique UNIQUE (site_id, sync_type)
);

CREATE TABLE IF NOT EXISTS public.dc_vehicle_attachment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.dc_site(id),
  vehicle_actual_id UUID REFERENCES public.dc_vehicle_actual(id),
  site_attachment_id UUID NOT NULL,
  site_transaction_id UUID,
  attachment_type VARCHAR(80) NOT NULL,
  bucket VARCHAR(160) NOT NULL,
  object_key TEXT NOT NULL,
  file_name VARCHAR(255),
  mime_type VARCHAR(120),
  file_size BIGINT,
  checksum VARCHAR(160),
  upload_status VARCHAR(40) NOT NULL DEFAULT 'pending',
  source_created_at TIMESTAMPTZ,
  source_updated_at TIMESTAMPTZ,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT dc_vehicle_attachment_site_unique UNIQUE (site_id, site_attachment_id)
);

CREATE TABLE IF NOT EXISTS public.dc_master_record (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.dc_site(id),
  table_name VARCHAR(80) NOT NULL,
  source_id UUID NOT NULL,
  code VARCHAR(120),
  display_name VARCHAR(240),
  source_created_at TIMESTAMPTZ,
  source_updated_at TIMESTAMPTZ,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT dc_master_record_site_table_source_unique UNIQUE (site_id, table_name, source_id)
);

CREATE TABLE IF NOT EXISTS public.dc_transact_wim_session (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.dc_site(id),
  source_id UUID NOT NULL,
  source_site_id UUID,
  code VARCHAR(50),
  session_name VARCHAR(200),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  status VARCHAR(50),
  total_vehicles INTEGER,
  processed_vehicles INTEGER,
  notes TEXT,
  started_by UUID,
  ended_by UUID,
  is_dummy BOOLEAN,
  is_active BOOLEAN,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  created_date TIMESTAMPTZ,
  updated_by UUID,
  updated_date TIMESTAMPTZ,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT dc_transact_wim_session_site_source_unique UNIQUE (site_id, source_id)
);

CREATE TABLE IF NOT EXISTS public.dc_transact_anpr_capture (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.dc_site(id),
  source_id UUID NOT NULL,
  source_site_id UUID,
  source_session_id UUID,
  external_id VARCHAR(100),
  plate_no VARCHAR(32),
  confidence NUMERIC(5,2),
  captured_at TIMESTAMPTZ,
  location_code VARCHAR(100),
  camera_id VARCHAR(100),
  minio_bucket VARCHAR(100),
  minio_date_folder VARCHAR(8),
  minio_xml_object TEXT,
  minio_full_image_object TEXT,
  minio_plate_image_object TEXT,
  is_active BOOLEAN,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  created_date TIMESTAMPTZ,
  updated_by UUID,
  updated_date TIMESTAMPTZ,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT dc_transact_anpr_capture_site_source_unique UNIQUE (site_id, source_id)
);

CREATE TABLE IF NOT EXISTS public.dc_transact_axle_capture (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.dc_site(id),
  source_id UUID NOT NULL,
  source_site_id UUID,
  source_session_id UUID,
  external_id VARCHAR(100),
  plate_no VARCHAR(32),
  captured_at TIMESTAMPTZ,
  camera_id VARCHAR(100),
  length_mm INTEGER,
  total_wheels INTEGER,
  total_axles INTEGER,
  vehicle_category VARCHAR(50),
  vehicle_body_type VARCHAR(50),
  minio_bucket VARCHAR(100),
  minio_date_folder VARCHAR(8),
  minio_xml_object TEXT,
  minio_image_object TEXT,
  is_active BOOLEAN,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  created_date TIMESTAMPTZ,
  updated_by UUID,
  updated_date TIMESTAMPTZ,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT dc_transact_axle_capture_site_source_unique UNIQUE (site_id, source_id)
);

CREATE TABLE IF NOT EXISTS public.dc_transact_cctv (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.dc_site(id),
  source_id UUID NOT NULL,
  source_site_id UUID,
  source_session_id UUID,
  filename TEXT,
  filepath TEXT,
  is_active BOOLEAN,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  created_date TIMESTAMPTZ,
  updated_by UUID,
  updated_date TIMESTAMPTZ,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT dc_transact_cctv_site_source_unique UNIQUE (site_id, source_id)
);

CREATE TABLE IF NOT EXISTS public.dc_transact_dimension (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.dc_site(id),
  source_id UUID NOT NULL,
  source_site_id UUID,
  source_session_id UUID,
  source_anpr_id UUID,
  filepath TEXT,
  length NUMERIC(10,3),
  width NUMERIC(10,3),
  height NUMERIC(10,3),
  is_active BOOLEAN,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  created_date TIMESTAMPTZ,
  updated_by UUID,
  updated_date TIMESTAMPTZ,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT dc_transact_dimension_site_source_unique UNIQUE (site_id, source_id)
);

CREATE TABLE IF NOT EXISTS public.dc_transact_weighing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.dc_site(id),
  source_id UUID NOT NULL,
  source_site_id UUID,
  source_session_id UUID,
  total_axle INTEGER,
  axle_detail JSONB,
  total_weight NUMERIC(12,3),
  is_active BOOLEAN,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  created_date TIMESTAMPTZ,
  updated_by UUID,
  updated_date TIMESTAMPTZ,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT dc_transact_weighing_site_source_unique UNIQUE (site_id, source_id)
);

CREATE TABLE IF NOT EXISTS public.dc_transact_vehicle_actual (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.dc_site(id),
  source_id UUID NOT NULL,
  source_site_id UUID,
  source_session_id UUID,
  source_anpr_id UUID,
  source_axle_id UUID,
  source_dimension_id UUID,
  source_weighing_id UUID,
  source_cctv_id UUID,
  actual_width NUMERIC(10,3),
  actual_length NUMERIC(10,3),
  actual_height NUMERIC(10,3),
  actual_weight NUMERIC(12,3),
  actual_plat_no VARCHAR(32),
  actual_total_axle INTEGER,
  location_lat NUMERIC(10,7),
  location_lng NUMERIC(10,7),
  location_address TEXT,
  is_active BOOLEAN,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  created_date TIMESTAMPTZ,
  updated_by UUID,
  updated_date TIMESTAMPTZ,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT dc_transact_vehicle_actual_site_source_unique UNIQUE (site_id, source_id)
);

CREATE TABLE IF NOT EXISTS public.dc_transact_vehicle_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.dc_site(id),
  source_id UUID NOT NULL,
  source_site_id UUID,
  source_vehicle_actual_id UUID NOT NULL,
  status VARCHAR(50) NOT NULL,
  result VARCHAR(50),
  notes TEXT,
  attachment TEXT[],
  is_active BOOLEAN,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  created_date TIMESTAMPTZ,
  updated_by UUID,
  updated_date TIMESTAMPTZ,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT dc_transact_vehicle_status_site_source_unique UNIQUE (site_id, source_id)
);

CREATE INDEX IF NOT EXISTS idx_dc_site_status ON public.dc_site (operational_status, last_seen_at);
CREATE INDEX IF NOT EXISTS idx_dc_vehicle_actual_site ON public.dc_vehicle_actual (site_id, enforcement_started_at DESC);
CREATE INDEX IF NOT EXISTS idx_dc_vehicle_actual_violation ON public.dc_vehicle_actual (violation_status, enforcement_started_at DESC);
CREATE INDEX IF NOT EXISTS idx_dc_sync_log_site ON public.dc_sync_log (site_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_dc_site_sync_cursor_site ON public.dc_site_sync_cursor (site_id, sync_type);
CREATE INDEX IF NOT EXISTS idx_dc_vehicle_attachment_vehicle ON public.dc_vehicle_attachment (vehicle_actual_id, attachment_type);
CREATE INDEX IF NOT EXISTS idx_dc_vehicle_attachment_site_transaction ON public.dc_vehicle_attachment (site_id, site_transaction_id);
CREATE INDEX IF NOT EXISTS idx_dc_master_record_site_table ON public.dc_master_record (site_id, table_name);
CREATE INDEX IF NOT EXISTS idx_dc_master_record_code ON public.dc_master_record (table_name, code);
CREATE INDEX IF NOT EXISTS idx_dc_master_record_updated ON public.dc_master_record (table_name, source_updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_dc_transact_wim_session_site_started ON public.dc_transact_wim_session (site_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_dc_transact_anpr_capture_site_session ON public.dc_transact_anpr_capture (site_id, source_session_id);
CREATE INDEX IF NOT EXISTS idx_dc_transact_axle_capture_site_session ON public.dc_transact_axle_capture (site_id, source_session_id);
CREATE INDEX IF NOT EXISTS idx_dc_transact_cctv_site_session ON public.dc_transact_cctv (site_id, source_session_id);
CREATE INDEX IF NOT EXISTS idx_dc_transact_dimension_site_session ON public.dc_transact_dimension (site_id, source_session_id);
CREATE INDEX IF NOT EXISTS idx_dc_transact_weighing_site_session ON public.dc_transact_weighing (site_id, source_session_id);
CREATE INDEX IF NOT EXISTS idx_dc_transact_vehicle_actual_site_session ON public.dc_transact_vehicle_actual (site_id, source_session_id);
CREATE INDEX IF NOT EXISTS idx_dc_transact_vehicle_status_site_actual ON public.dc_transact_vehicle_status (site_id, source_vehicle_actual_id);

CREATE OR REPLACE VIEW public.dc_dashboard_vehicle_actual AS
SELECT
  v.id,
  v.site_id,
  v.site_transaction_id::text AS source_id,
  v.transaction_no,
  v.plate_no,
  v.vehicle_class,
  v.operator_name,
  v.location_lat,
  v.location_lng,
  v.location_address,
  v.total_weight,
  v.length_mm,
  v.width_mm,
  v.height_mm,
  v.axle_count,
  v.violation_status,
  v.violation_notes,
  v.enforcement_started_at,
  v.enforcement_finished_at,
  v.source_updated_at,
  v.synced_at,
  v.created_at,
  v.updated_at,
  v.is_deleted
FROM public.dc_vehicle_actual v
UNION ALL
SELECT
  v.id,
  v.site_id,
  v.source_id::text AS source_id,
  NULL::varchar(120) AS transaction_no,
  v.actual_plat_no AS plate_no,
  NULL::varchar(100) AS vehicle_class,
  NULL::varchar(160) AS operator_name,
  v.location_lat::numeric(11,8) AS location_lat,
  v.location_lng::numeric(11,8) AS location_lng,
  v.location_address,
  v.actual_weight AS total_weight,
  v.actual_length AS length_mm,
  v.actual_width AS width_mm,
  v.actual_height AS height_mm,
  v.actual_total_axle AS axle_count,
  CASE
    WHEN lower(COALESCE(vs.status, '')) = 'verified'
      AND lower(COALESCE(vs.result, '')) LIKE '%normal%' THEN 'normal'
    WHEN lower(COALESCE(vs.status, '')) = 'verified' THEN 'violation'
    WHEN lower(COALESCE(vs.status, '')) = 'rejected' THEN 'normal'
    WHEN vs.id IS NOT NULL THEN lower(COALESCE(vs.status, 'pending'))
    ELSE 'pending'
  END AS violation_status,
  COALESCE(vs.notes, vs.result, vs.status) AS violation_notes,
  COALESCE(ws.started_at, v.created_date, v.synced_at) AS enforcement_started_at,
  ws.ended_at AS enforcement_finished_at,
  v.updated_date AS source_updated_at,
  v.synced_at,
  COALESCE(v.created_date, v.synced_at) AS created_at,
  COALESCE(v.updated_date, v.synced_at) AS updated_at,
  v.is_deleted
FROM public.dc_transact_vehicle_actual v
LEFT JOIN public.dc_transact_wim_session ws
  ON ws.site_id = v.site_id
 AND ws.source_id = v.source_session_id
LEFT JOIN LATERAL (
  SELECT s.*
  FROM public.dc_transact_vehicle_status s
  WHERE s.site_id = v.site_id
    AND s.source_vehicle_actual_id = v.source_id
    AND COALESCE(s.is_deleted, false) = false
  ORDER BY COALESCE(s.updated_date, s.created_date, s.synced_at) DESC
  LIMIT 1
) vs ON true;
