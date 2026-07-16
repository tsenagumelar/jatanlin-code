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
  ('MST-25-00001', 'Mampang', 'Central Office', 'Jakarta Selatan', 'DKI Jakarta', 'online', 'Bripka Agus Setiawan', now() - interval '3 minutes', now() - interval '2 minutes', 'revamp-site-0.1.0', 'backend-0.1.0'),
  ('MST-25-00002', 'Cikampek', 'Gerbang Tol Cikampek', 'Karawang', 'Jawa Barat', 'warning', 'Briptu Rini Wahyuni', now() - interval '18 minutes', now() - interval '16 minutes', 'revamp-site-0.1.0', 'backend-0.1.0'),
  ('MST-25-00003', 'Semarang Barat', 'Tol Semarang KM 15', 'Semarang', 'Jawa Tengah', 'online', 'Aipda Dwi Pranoto', now() - interval '5 minutes', now() - interval '4 minutes', 'revamp-site-0.1.0', 'backend-0.1.0'),
  ('MST-25-00004', 'Gresik', 'Tol Surabaya - Gresik KM 9', 'Surabaya', 'Jawa Timur', 'online', 'Bripka Ignatius W.', now() - interval '8 minutes', now() - interval '7 minutes', 'revamp-site-0.1.0', 'backend-0.1.0'),
  ('MST-25-00005', 'Balikpapan', 'Tol Balikpapan - Samarinda KM 3', 'Balikpapan', 'Kalimantan Timur', 'offline', NULL, now() - interval '3 hours', now() - interval '3 hours', 'revamp-site-0.1.0', 'backend-0.1.0'),
  ('MST-25-00006', 'Makassar', 'Pelabuhan Soekarno Hatta Gate B', 'Makassar', 'Sulawesi Selatan', 'online', 'Ipda Naufal Rasyid', now() - interval '11 minutes', now() - interval '9 minutes', 'revamp-site-0.1.0', 'backend-0.1.0')
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

WITH vehicle_seed (
  site_code,
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
  enforcement_finished_at
) AS (
  VALUES
    ('MST-25-00001', '11111111-1111-1111-1111-111111111101'::uuid, 'TRX-DC-000101', 'B 5421 CDM', 'Golongan III', 'Bripka Agus Setiawan', -6.24452340, 106.82143520, 'Mampang Portable Enforcement Point', 18500, 12200, 2550, 4100, 4, 'violation', 'Over dimension', now() - interval '35 minutes', now() - interval '33 minutes'),
    ('MST-25-00001', '11111111-1111-1111-1111-111111111102'::uuid, 'TRX-DC-000102', 'B 9012 TRK', 'Golongan IV', 'Bripka Agus Setiawan', -6.24381210, 106.82098110, 'Mampang Portable Enforcement Point', 24300, 11800, 2500, 3980, 5, 'violation', 'Over loading', now() - interval '28 minutes', now() - interval '26 minutes'),
    ('MST-25-00001', '11111111-1111-1111-1111-111111111103'::uuid, 'TRX-DC-000103', 'B 7731 KLM', 'Golongan II', 'Bripka Agus Setiawan', -6.24521200, 106.82201200, 'Mampang Portable Enforcement Point', 12500, 8900, 2350, 3300, 3, 'normal', 'Normal', now() - interval '20 minutes', now() - interval '18 minutes'),

    ('MST-25-00002', '22222222-2222-2222-2222-222222222201'::uuid, 'TRX-DC-000201', 'T 1829 BK', 'Golongan V', 'Briptu Rini Wahyuni', -6.40250000, 107.10780000, 'Gerbang Tol Cikampek Portable Point', 27600, 12600, 2600, 4300, 5, 'violation', 'Over loading', now() - interval '1 hour', now() - interval '58 minutes'),
    ('MST-25-00002', '22222222-2222-2222-2222-222222222202'::uuid, 'TRX-DC-000202', 'T 3371 MM', 'Golongan III', 'Briptu Rini Wahyuni', -6.40410000, 107.10810000, 'Gerbang Tol Cikampek Portable Point', 15100, 10400, 2500, 4050, 4, 'violation', 'Over dimension', now() - interval '50 minutes', now() - interval '48 minutes'),
    ('MST-25-00002', '22222222-2222-2222-2222-222222222203'::uuid, 'TRX-DC-000203', 'T 8812 PR', 'Golongan II', 'Briptu Rini Wahyuni', -6.40290000, 107.10690000, 'Gerbang Tol Cikampek Portable Point', 11600, 8500, 2300, 3200, 3, 'normal', 'Normal', now() - interval '2 days', now() - interval '2 days' + interval '3 minutes'),

    ('MST-25-00003', '33333333-3333-3333-3333-333333333301'::uuid, 'TRX-DC-000301', 'H 6721 AD', 'Golongan III', 'Aipda Dwi Pranoto', -7.00510000, 110.43810000, 'Tol Semarang KM 15', 13200, 11200, 2480, 3950, 4, 'violation', 'Over dimension', now() - interval '2 hours', now() - interval '118 minutes'),
    ('MST-25-00003', '33333333-3333-3333-3333-333333333302'::uuid, 'TRX-DC-000302', 'H 4459 PP', 'Golongan II', 'Aipda Dwi Pranoto', -7.00600000, 110.43900000, 'Tol Semarang KM 15', 9800, 7800, 2200, 3100, 2, 'normal', 'Normal', now() - interval '3 hours', now() - interval '178 minutes'),
    ('MST-25-00003', '33333333-3333-3333-3333-333333333303'::uuid, 'TRX-DC-000303', 'H 7201 ZZ', 'Golongan IV', 'Aipda Dwi Pranoto', -7.00450000, 110.43720000, 'Tol Semarang KM 15', 23100, 11900, 2520, 3900, 5, 'violation', 'Over loading', now() - interval '4 days', now() - interval '4 days' + interval '2 minutes'),

    ('MST-25-00004', '44444444-4444-4444-4444-444444444401'::uuid, 'TRX-DC-000401', 'L 9122 DS', 'Golongan IV', 'Bripka Ignatius W.', -7.25750000, 112.75210000, 'Tol Surabaya - Gresik KM 9', 20500, 11600, 2450, 3800, 4, 'normal', 'Normal', now() - interval '15 minutes', now() - interval '13 minutes'),
    ('MST-25-00004', '44444444-4444-4444-4444-444444444402'::uuid, 'TRX-DC-000402', 'W 7019 GG', 'Golongan V', 'Bripka Ignatius W.', -7.25820000, 112.75130000, 'Tol Surabaya - Gresik KM 9', 30100, 12400, 2630, 4260, 6, 'violation', 'Over loading', now() - interval '5 hours', now() - interval '298 minutes'),
    ('MST-25-00004', '44444444-4444-4444-4444-444444444403'::uuid, 'TRX-DC-000403', 'L 2210 QR', 'Golongan III', 'Bripka Ignatius W.', -7.25710000, 112.75340000, 'Tol Surabaya - Gresik KM 9', 14200, 10400, 2460, 3600, 4, 'normal', 'Normal', now() - interval '1 day', now() - interval '1 day' + interval '2 minutes'),

    ('MST-25-00005', '55555555-5555-5555-5555-555555555501'::uuid, 'TRX-DC-000501', 'KT 3451 AB', 'Golongan III', 'Briptu Andi Kurniawan', -1.23790000, 116.85290000, 'Tol Balikpapan - Samarinda KM 3', 16400, 12100, 2550, 4050, 4, 'violation', 'Over dimension', now() - interval '6 days', now() - interval '6 days' + interval '3 minutes'),
    ('MST-25-00005', '55555555-5555-5555-5555-555555555502'::uuid, 'TRX-DC-000502', 'KT 9981 CD', 'Golongan II', 'Briptu Andi Kurniawan', -1.23830000, 116.85350000, 'Tol Balikpapan - Samarinda KM 3', 9100, 7600, 2200, 3000, 2, 'normal', 'Normal', now() - interval '5 days', now() - interval '5 days' + interval '2 minutes'),

    ('MST-25-00006', '66666666-6666-6666-6666-666666666601'::uuid, 'TRX-DC-000601', 'DD 7510 MP', 'Golongan IV', 'Ipda Naufal Rasyid', -5.14770000, 119.43270000, 'Pelabuhan Soekarno Hatta Gate B', 21900, 11300, 2480, 3820, 4, 'violation', 'Over loading', now() - interval '45 minutes', now() - interval '43 minutes'),
    ('MST-25-00006', '66666666-6666-6666-6666-666666666602'::uuid, 'TRX-DC-000602', 'DD 3320 AS', 'Golongan III', 'Ipda Naufal Rasyid', -5.14800000, 119.43190000, 'Pelabuhan Soekarno Hatta Gate B', 13700, 9800, 2350, 3350, 3, 'normal', 'Normal', now() - interval '55 minutes', now() - interval '53 minutes')
),
resolved_vehicle AS (
  SELECT
    s.id AS site_id,
    v.*
  FROM vehicle_seed v
  JOIN public.dc_site s ON s.site_code = v.site_code
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
  enforcement_finished_at,
  jsonb_build_object('source', 'seed', 'site_code', site_code)
FROM resolved_vehicle
ON CONFLICT (site_id, site_transaction_id) DO UPDATE
SET transaction_no = EXCLUDED.transaction_no,
    plate_no = EXCLUDED.plate_no,
    vehicle_class = EXCLUDED.vehicle_class,
    operator_name = EXCLUDED.operator_name,
    location_lat = EXCLUDED.location_lat,
    location_lng = EXCLUDED.location_lng,
    location_address = EXCLUDED.location_address,
    total_weight = EXCLUDED.total_weight,
    length_mm = EXCLUDED.length_mm,
    width_mm = EXCLUDED.width_mm,
    height_mm = EXCLUDED.height_mm,
    axle_count = EXCLUDED.axle_count,
    violation_status = EXCLUDED.violation_status,
    violation_notes = EXCLUDED.violation_notes,
    enforcement_started_at = EXCLUDED.enforcement_started_at,
    enforcement_finished_at = EXCLUDED.enforcement_finished_at,
    source_updated_at = EXCLUDED.source_updated_at,
    raw_payload = EXCLUDED.raw_payload,
    is_deleted = false,
    updated_at = now();
