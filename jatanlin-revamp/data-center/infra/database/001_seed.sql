\set admin_username `echo ${ADMIN_USERNAME:-admin}`
\set admin_password `echo ${ADMIN_PASSWORD:-admin123}`
\set admin_email `echo ${ADMIN_EMAIL:-admin@datacenter.local}`
\set admin_full_name `echo ${ADMIN_FULL_NAME:-Data Center Administrator}`

INSERT INTO public.master_role (code, role_name, description)
VALUES
  ('DC_ADMIN', 'Data Center Admin', 'Full access for data center operation'),
  ('DC_OPERATOR', 'Data Center Operator', 'Read-only data center operator')
ON CONFLICT (code) DO UPDATE
SET role_name = EXCLUDED.role_name,
    description = EXCLUDED.description,
    updated_at = now();

WITH admin_role AS (
  SELECT id FROM public.master_role WHERE code = 'DC_ADMIN' LIMIT 1
)
INSERT INTO public.master_user (
  code,
  username,
  email,
  password_hash,
  full_name,
  badge_no,
  role_id
)
SELECT
  'DC-ADMIN',
  :'admin_username',
  :'admin_email',
  crypt(:'admin_password', gen_salt('bf')),
  :'admin_full_name',
  'DC-0001',
  admin_role.id
FROM admin_role
ON CONFLICT (username) DO UPDATE
SET email = EXCLUDED.email,
    password_hash = EXCLUDED.password_hash,
    full_name = EXCLUDED.full_name,
    role_id = EXCLUDED.role_id,
    is_active = true,
    is_deleted = false,
    updated_at = now();

INSERT INTO public.dc_site (
  site_code,
  site_name,
  site_address,
  city,
  province,
  operational_status,
  active_operator_name,
  last_seen_at,
  last_sync_at,
  app_version,
  service_version
)
VALUES
  ('MST-25-00001', 'Mampang', 'Central Office', 'Jakarta Selatan', 'DKI Jakarta', 'online', 'Administrator', now() - interval '3 minutes', now() - interval '2 minutes', 'revamp-site-0.1.0', 'backend-0.1.0'),
  ('MST-25-00002', 'Cikampek', 'Gerbang Tol Cikampek', 'Karawang', 'Jawa Barat', 'offline', NULL, now() - interval '2 hours', now() - interval '2 hours', 'revamp-site-0.1.0', 'backend-0.1.0')
ON CONFLICT (site_code) DO UPDATE
SET site_name = EXCLUDED.site_name,
    site_address = EXCLUDED.site_address,
    city = EXCLUDED.city,
    province = EXCLUDED.province,
    operational_status = EXCLUDED.operational_status,
    active_operator_name = EXCLUDED.active_operator_name,
    last_seen_at = EXCLUDED.last_seen_at,
    last_sync_at = EXCLUDED.last_sync_at,
    app_version = EXCLUDED.app_version,
    service_version = EXCLUDED.service_version,
    updated_at = now();

WITH mampang AS (
  SELECT id FROM public.dc_site WHERE site_code = 'MST-25-00001'
)
INSERT INTO public.dc_vehicle_actual (
  site_id,
  site_transaction_id,
  transaction_no,
  plate_no,
  vehicle_class,
  operator_name,
  location_lat,
  location_lng,
  location_address,
  total_weight,
  length_mm,
  width_mm,
  height_mm,
  axle_count,
  violation_status,
  violation_notes,
  enforcement_started_at,
  enforcement_finished_at,
  source_updated_at,
  raw_payload
)
SELECT
  mampang.id,
  '11111111-1111-1111-1111-111111111111',
  'TRX-DC-SAMPLE-001',
  'B 1234 CD',
  'Golongan III',
  'Administrator',
  -6.24452340,
  106.82143520,
  'Mampang Portable Enforcement Point',
  18500,
  12200,
  2550,
  4100,
  4,
  'violation',
  'Over dimension',
  now() - interval '35 minutes',
  now() - interval '33 minutes',
  now() - interval '33 minutes',
  '{"source":"seed"}'::jsonb
FROM mampang
ON CONFLICT (site_id, site_transaction_id) DO UPDATE
SET transaction_no = EXCLUDED.transaction_no,
    plate_no = EXCLUDED.plate_no,
    violation_status = EXCLUDED.violation_status,
    updated_at = now();
