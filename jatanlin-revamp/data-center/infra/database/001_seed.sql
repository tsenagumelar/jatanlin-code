\set admin_username `echo ${ADMIN_USERNAME:-admin}`
\set admin_password `echo ${ADMIN_PASSWORD:-admin123}`
\set admin_email `echo ${ADMIN_EMAIL:-admin@datacenter.local}`
\set admin_full_name `echo ${ADMIN_FULL_NAME:-Data Center Administrator}`

TRUNCATE TABLE
  public.dc_vehicle_attachment,
  public.dc_transact_vehicle_status,
  public.dc_transact_vehicle_actual,
  public.dc_transact_weighing,
  public.dc_transact_dimension,
  public.dc_transact_cctv,
  public.dc_transact_axle_capture,
  public.dc_transact_anpr_capture,
  public.dc_transact_wim_session,
  public.dc_site_sync_cursor,
  public.dc_sync_log,
  public.dc_vehicle_actual,
  public.dc_site,
  public.master_user,
  public.master_role
RESTART IDENTITY CASCADE;

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
FROM admin_role;

WITH operator_role AS (
  SELECT id FROM public.master_role WHERE code = 'DC_OPERATOR' LIMIT 1
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
SELECT *
FROM (
  VALUES
    ('DC-OPS-001', 'ops.mampang', 'ops.mampang@datacenter.local', crypt('ops123', gen_salt('bf')), 'Operator Mampang', 'OPS-001'),
    ('DC-OPS-002', 'ops.cikampek', 'ops.cikampek@datacenter.local', crypt('ops123', gen_salt('bf')), 'Operator Cikampek', 'OPS-002'),
    ('DC-OPS-003', 'ops.semarang', 'ops.semarang@datacenter.local', crypt('ops123', gen_salt('bf')), 'Operator Semarang', 'OPS-003')
) AS seed(code, username, email, password_hash, full_name, badge_no)
CROSS JOIN operator_role;

INSERT INTO public.dc_site (
  id,
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
  ('aaaaaaaa-0000-0000-0000-000000000001', 'MST-25-00001', 'Mampang', 'Central Office', 'Jakarta Selatan', 'DKI Jakarta', 'online', 'Bripka Agus Setiawan', now() - interval '3 minutes', now() - interval '2 minutes', 'revamp-site-0.2.0', 'sync-agent-0.1.0'),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'MST-25-00002', 'Cikampek', 'Gerbang Tol Cikampek', 'Karawang', 'Jawa Barat', 'warning', 'Briptu Rini Wahyuni', now() - interval '19 minutes', now() - interval '17 minutes', 'revamp-site-0.2.0', 'sync-agent-0.1.0'),
  ('aaaaaaaa-0000-0000-0000-000000000003', 'MST-25-00003', 'Semarang Barat', 'Tol Semarang KM 15', 'Semarang', 'Jawa Tengah', 'online', 'Aipda Dwi Pranoto', now() - interval '5 minutes', now() - interval '4 minutes', 'revamp-site-0.2.0', 'sync-agent-0.1.0'),
  ('aaaaaaaa-0000-0000-0000-000000000004', 'MST-25-00004', 'Gresik', 'Tol Surabaya - Gresik KM 9', 'Surabaya', 'Jawa Timur', 'online', 'Bripka Ignatius W.', now() - interval '8 minutes', now() - interval '7 minutes', 'revamp-site-0.2.0', 'sync-agent-0.1.0'),
  ('aaaaaaaa-0000-0000-0000-000000000005', 'MST-25-00005', 'Balikpapan', 'Tol Balikpapan - Samarinda KM 3', 'Balikpapan', 'Kalimantan Timur', 'offline', NULL, now() - interval '3 hours', now() - interval '3 hours', 'revamp-site-0.2.0', 'sync-agent-0.1.0'),
  ('aaaaaaaa-0000-0000-0000-000000000006', 'MST-25-00006', 'Makassar', 'Pelabuhan Soekarno Hatta Gate B', 'Makassar', 'Sulawesi Selatan', 'online', 'Ipda Naufal Rasyid', now() - interval '12 minutes', now() - interval '10 minutes', 'revamp-site-0.2.0', 'sync-agent-0.1.0');

WITH session_seed AS (
  SELECT *
  FROM (VALUES
    ('MST-25-00001', '10000000-0000-0000-0001-000000000001'::uuid, 'WIM-MPG-0001', now() - interval '55 minutes', now() - interval '18 minutes', 'COMPLETED', 3, 3, false),
    ('MST-25-00002', '10000000-0000-0000-0002-000000000001'::uuid, 'WIM-CKP-0001', now() - interval '78 minutes', now() - interval '48 minutes', 'COMPLETED', 2, 2, false),
    ('MST-25-00003', '10000000-0000-0000-0003-000000000001'::uuid, 'WIM-SMG-0001', now() - interval '3 hours', now() - interval '2 hours', 'COMPLETED', 2, 2, false),
    ('MST-25-00004', '10000000-0000-0000-0004-000000000001'::uuid, 'WIM-GRK-0001', now() - interval '5 hours', now() - interval '4 hours', 'COMPLETED', 2, 2, false),
    ('MST-25-00005', '10000000-0000-0000-0005-000000000001'::uuid, 'WIM-BPN-0001', now() - interval '6 days', now() - interval '6 days' + interval '30 minutes', 'COMPLETED', 2, 2, false),
    ('MST-25-00006', '10000000-0000-0000-0006-000000000001'::uuid, 'WIM-MKS-0001', now() - interval '66 minutes', now() - interval '42 minutes', 'COMPLETED', 2, 2, false)
  ) AS seed(site_code, source_id, code, started_at, ended_at, status, total_vehicles, processed_vehicles, is_dummy)
)
INSERT INTO public.dc_transact_wim_session (
  site_id,
  source_id,
  source_site_id,
  code,
  started_at,
  ended_at,
  status,
  total_vehicles,
  processed_vehicles,
  is_dummy,
  is_active,
  is_deleted,
  created_date,
  updated_date,
  raw_payload
)
SELECT
  s.id,
  seed.source_id,
  s.id,
  seed.code,
  seed.started_at,
  seed.ended_at,
  seed.status,
  seed.total_vehicles,
  seed.processed_vehicles,
  seed.is_dummy,
  true,
  false,
  seed.started_at,
  seed.ended_at,
  to_jsonb(seed)
FROM session_seed seed
JOIN public.dc_site s ON s.site_code = seed.site_code;

WITH vehicle_seed AS (
  SELECT *
  FROM (VALUES
    ('MST-25-00001', '10000000-0000-0000-0001-000000000001'::uuid, '20000000-0000-0000-0001-000000000101'::uuid, '30000000-0000-0000-0001-000000000101'::uuid, '40000000-0000-0000-0001-000000000101'::uuid, '50000000-0000-0000-0001-000000000101'::uuid, '60000000-0000-0000-0001-000000000101'::uuid, '70000000-0000-0000-0001-000000000101'::uuid, 'B 5421 CDM', 'Golongan III', 'Bripka Agus Setiawan', -6.2445234, 106.8214352, 'Mampang Portable Enforcement Point', 18.5, 12.2, 2.55, 4.10, 4, 'VIOLATION', 'Over Dimension', now() - interval '35 minutes'),
    ('MST-25-00001', '10000000-0000-0000-0001-000000000001'::uuid, '20000000-0000-0000-0001-000000000102'::uuid, '30000000-0000-0000-0001-000000000102'::uuid, '40000000-0000-0000-0001-000000000102'::uuid, '50000000-0000-0000-0001-000000000102'::uuid, '60000000-0000-0000-0001-000000000102'::uuid, '70000000-0000-0000-0001-000000000102'::uuid, 'B 9012 TRK', 'Golongan IV', 'Bripka Agus Setiawan', -6.2438121, 106.8209811, 'Mampang Portable Enforcement Point', 24.3, 11.8, 2.50, 3.98, 5, 'VIOLATION', 'Over Loading', now() - interval '28 minutes'),
    ('MST-25-00001', '10000000-0000-0000-0001-000000000001'::uuid, '20000000-0000-0000-0001-000000000103'::uuid, '30000000-0000-0000-0001-000000000103'::uuid, '40000000-0000-0000-0001-000000000103'::uuid, '50000000-0000-0000-0001-000000000103'::uuid, '60000000-0000-0000-0001-000000000103'::uuid, '70000000-0000-0000-0001-000000000103'::uuid, 'B 7731 KLM', 'Golongan II', 'Bripka Agus Setiawan', -6.2452120, 106.8220120, 'Mampang Portable Enforcement Point', 12.5, 8.9, 2.35, 3.30, 3, 'NORMAL', 'Normal', now() - interval '20 minutes'),

    ('MST-25-00002', '10000000-0000-0000-0002-000000000001'::uuid, '20000000-0000-0000-0002-000000000201'::uuid, '30000000-0000-0000-0002-000000000201'::uuid, '40000000-0000-0000-0002-000000000201'::uuid, '50000000-0000-0000-0002-000000000201'::uuid, '60000000-0000-0000-0002-000000000201'::uuid, '70000000-0000-0000-0002-000000000201'::uuid, 'T 1829 BK', 'Golongan V', 'Briptu Rini Wahyuni', -6.4025000, 107.1078000, 'Gerbang Tol Cikampek Portable Point', 27.6, 12.6, 2.60, 4.30, 5, 'VIOLATION', 'Over Loading', now() - interval '1 hour'),
    ('MST-25-00002', '10000000-0000-0000-0002-000000000001'::uuid, '20000000-0000-0000-0002-000000000202'::uuid, '30000000-0000-0000-0002-000000000202'::uuid, '40000000-0000-0000-0002-000000000202'::uuid, '50000000-0000-0000-0002-000000000202'::uuid, '60000000-0000-0000-0002-000000000202'::uuid, '70000000-0000-0000-0002-000000000202'::uuid, 'T 3371 MM', 'Golongan III', 'Briptu Rini Wahyuni', -6.4041000, 107.1081000, 'Gerbang Tol Cikampek Portable Point', 15.1, 10.4, 2.50, 4.05, 4, 'VIOLATION', 'Over Dimension', now() - interval '50 minutes'),

    ('MST-25-00003', '10000000-0000-0000-0003-000000000001'::uuid, '20000000-0000-0000-0003-000000000301'::uuid, '30000000-0000-0000-0003-000000000301'::uuid, '40000000-0000-0000-0003-000000000301'::uuid, '50000000-0000-0000-0003-000000000301'::uuid, '60000000-0000-0000-0003-000000000301'::uuid, '70000000-0000-0000-0003-000000000301'::uuid, 'H 6721 AD', 'Golongan III', 'Aipda Dwi Pranoto', -7.0051000, 110.4381000, 'Tol Semarang KM 15', 13.2, 11.2, 2.48, 3.95, 4, 'VIOLATION', 'Over Dimension', now() - interval '2 hours'),
    ('MST-25-00003', '10000000-0000-0000-0003-000000000001'::uuid, '20000000-0000-0000-0003-000000000302'::uuid, '30000000-0000-0000-0003-000000000302'::uuid, '40000000-0000-0000-0003-000000000302'::uuid, '50000000-0000-0000-0003-000000000302'::uuid, '60000000-0000-0000-0003-000000000302'::uuid, '70000000-0000-0000-0003-000000000302'::uuid, 'H 4459 PP', 'Golongan II', 'Aipda Dwi Pranoto', -7.0060000, 110.4390000, 'Tol Semarang KM 15', 9.8, 7.8, 2.20, 3.10, 2, 'NORMAL', 'Normal', now() - interval '3 hours'),

    ('MST-25-00004', '10000000-0000-0000-0004-000000000001'::uuid, '20000000-0000-0000-0004-000000000401'::uuid, '30000000-0000-0000-0004-000000000401'::uuid, '40000000-0000-0000-0004-000000000401'::uuid, '50000000-0000-0000-0004-000000000401'::uuid, '60000000-0000-0000-0004-000000000401'::uuid, '70000000-0000-0000-0004-000000000401'::uuid, 'L 9122 DS', 'Golongan IV', 'Bripka Ignatius W.', -7.2575000, 112.7521000, 'Tol Surabaya - Gresik KM 9', 20.5, 11.6, 2.45, 3.80, 4, 'NORMAL', 'Normal', now() - interval '15 minutes'),
    ('MST-25-00004', '10000000-0000-0000-0004-000000000001'::uuid, '20000000-0000-0000-0004-000000000402'::uuid, '30000000-0000-0000-0004-000000000402'::uuid, '40000000-0000-0000-0004-000000000402'::uuid, '50000000-0000-0000-0004-000000000402'::uuid, '60000000-0000-0000-0004-000000000402'::uuid, '70000000-0000-0000-0004-000000000402'::uuid, 'W 7019 GG', 'Golongan V', 'Bripka Ignatius W.', -7.2582000, 112.7513000, 'Tol Surabaya - Gresik KM 9', 30.1, 12.4, 2.63, 4.26, 6, 'VIOLATION', 'Over Loading', now() - interval '5 hours'),

    ('MST-25-00005', '10000000-0000-0000-0005-000000000001'::uuid, '20000000-0000-0000-0005-000000000501'::uuid, '30000000-0000-0000-0005-000000000501'::uuid, '40000000-0000-0000-0005-000000000501'::uuid, '50000000-0000-0000-0005-000000000501'::uuid, '60000000-0000-0000-0005-000000000501'::uuid, '70000000-0000-0000-0005-000000000501'::uuid, 'KT 3451 AB', 'Golongan III', 'Briptu Andi Kurniawan', -1.2379000, 116.8529000, 'Tol Balikpapan - Samarinda KM 3', 16.4, 12.1, 2.55, 4.05, 4, 'VIOLATION', 'Over Dimension', now() - interval '6 days'),
    ('MST-25-00005', '10000000-0000-0000-0005-000000000001'::uuid, '20000000-0000-0000-0005-000000000502'::uuid, '30000000-0000-0000-0005-000000000502'::uuid, '40000000-0000-0000-0005-000000000502'::uuid, '50000000-0000-0000-0005-000000000502'::uuid, '60000000-0000-0000-0005-000000000502'::uuid, '70000000-0000-0000-0005-000000000502'::uuid, 'KT 9981 CD', 'Golongan II', 'Briptu Andi Kurniawan', -1.2383000, 116.8535000, 'Tol Balikpapan - Samarinda KM 3', 9.1, 7.6, 2.20, 3.00, 2, 'NORMAL', 'Normal', now() - interval '5 days'),

    ('MST-25-00006', '10000000-0000-0000-0006-000000000001'::uuid, '20000000-0000-0000-0006-000000000601'::uuid, '30000000-0000-0000-0006-000000000601'::uuid, '40000000-0000-0000-0006-000000000601'::uuid, '50000000-0000-0000-0006-000000000601'::uuid, '60000000-0000-0000-0006-000000000601'::uuid, '70000000-0000-0000-0006-000000000601'::uuid, 'DD 7510 MP', 'Golongan IV', 'Ipda Naufal Rasyid', -5.1477000, 119.4327000, 'Pelabuhan Soekarno Hatta Gate B', 21.9, 11.3, 2.48, 3.82, 4, 'VIOLATION', 'Over Loading', now() - interval '45 minutes'),
    ('MST-25-00006', '10000000-0000-0000-0006-000000000001'::uuid, '20000000-0000-0000-0006-000000000602'::uuid, '30000000-0000-0000-0006-000000000602'::uuid, '40000000-0000-0000-0006-000000000602'::uuid, '50000000-0000-0000-0006-000000000602'::uuid, '60000000-0000-0000-0006-000000000602'::uuid, '70000000-0000-0000-0006-000000000602'::uuid, 'DD 3320 AS', 'Golongan III', 'Ipda Naufal Rasyid', -5.1480000, 119.4319000, 'Pelabuhan Soekarno Hatta Gate B', 13.7, 9.8, 2.35, 3.35, 3, 'NORMAL', 'Normal', now() - interval '55 minutes')
  ) AS seed(site_code, session_id, actual_id, anpr_id, axle_id, dimension_id, weighing_id, cctv_id, plate_no, vehicle_class, operator_name, lat, lng, address, weight_ton, length_m, width_m, height_m, axle_count, status, result, event_at)
),
resolved_vehicle AS (
  SELECT s.id AS dc_site_id, seed.*
  FROM vehicle_seed seed
  JOIN public.dc_site s ON s.site_code = seed.site_code
)
INSERT INTO public.dc_transact_anpr_capture (
  site_id,
  source_id,
  source_site_id,
  source_session_id,
  external_id,
  plate_no,
  confidence,
  captured_at,
  location_code,
  camera_id,
  minio_bucket,
  minio_date_folder,
  minio_xml_object,
  minio_full_image_object,
  minio_plate_image_object,
  is_active,
  is_deleted,
  created_date,
  updated_date,
  raw_payload
)
SELECT
  dc_site_id,
  anpr_id,
  dc_site_id,
  session_id,
  'ANPR-' || replace(anpr_id::text, '-', ''),
  plate_no,
  94.5,
  event_at,
  site_code,
  'ANPR-CAM-01',
  'jatanlin-data-center-attachments',
  to_char(event_at, 'YYYYMMDD'),
  site_code || '/anpr/xml/' || anpr_id || '.xml',
  site_code || '/anpr/full/' || anpr_id || '.jpg',
  site_code || '/anpr/plate/' || anpr_id || '.jpg',
  true,
  false,
  event_at,
  event_at + interval '1 minute',
  to_jsonb(resolved_vehicle)
FROM resolved_vehicle;

WITH vehicle_seed AS (
  SELECT *
  FROM public.dc_transact_anpr_capture a
  JOIN public.dc_site s ON s.id = a.site_id
)
INSERT INTO public.dc_transact_axle_capture (
  site_id,
  source_id,
  source_site_id,
  source_session_id,
  external_id,
  plate_no,
  captured_at,
  camera_id,
  length_mm,
  total_wheels,
  total_axles,
  vehicle_category,
  vehicle_body_type,
  minio_bucket,
  minio_date_folder,
  minio_xml_object,
  minio_image_object,
  is_active,
  is_deleted,
  created_date,
  updated_date,
  raw_payload
)
SELECT
  a.site_id,
  ('40000000-' || substring(a.source_id::text from 10))::uuid,
  a.site_id,
  a.source_session_id,
  'AXLE-' || replace(a.source_id::text, '-', ''),
  a.plate_no,
  a.captured_at + interval '20 seconds',
  'AXLE-CAM-01',
  CASE WHEN a.plate_no LIKE '%TRK%' THEN 11800 ELSE 10400 END,
  10,
  4,
  'Truck',
  'Box',
  'jatanlin-data-center-attachments',
  to_char(a.captured_at, 'YYYYMMDD'),
  s.site_code || '/axle/xml/' || a.source_id || '.xml',
  s.site_code || '/axle/image/' || a.source_id || '.jpg',
  true,
  false,
  a.created_date,
  a.updated_date,
  jsonb_build_object('source', 'mirror-seed', 'plate_no', a.plate_no)
FROM public.dc_transact_anpr_capture a
JOIN public.dc_site s ON s.id = a.site_id;

INSERT INTO public.dc_transact_weighing (
  site_id,
  source_id,
  source_site_id,
  source_session_id,
  total_axle,
  axle_detail,
  total_weight,
  is_active,
  is_deleted,
  created_date,
  updated_date,
  raw_payload
)
SELECT
  a.site_id,
  ('60000000-' || substring(a.source_id::text from 10))::uuid,
  a.site_id,
  a.source_session_id,
  CASE WHEN a.plate_no LIKE '%TRK%' OR a.plate_no LIKE '%BK%' OR a.plate_no LIKE '%GG%' OR a.plate_no LIKE '%MP%' THEN 5 ELSE 4 END,
  jsonb_build_array(
    jsonb_build_object('axle', 1, 'weight', 4200),
    jsonb_build_object('axle', 2, 'weight', 5100),
    jsonb_build_object('axle', 3, 'weight', 5300),
    jsonb_build_object('axle', 4, 'weight', 4800)
  ),
  CASE WHEN a.plate_no LIKE '%TRK%' OR a.plate_no LIKE '%BK%' OR a.plate_no LIKE '%GG%' OR a.plate_no LIKE '%MP%' THEN 24500 ELSE 14200 END,
  true,
  false,
  a.created_date,
  a.updated_date,
  jsonb_build_object('source', 'mirror-seed', 'plate_no', a.plate_no)
FROM public.dc_transact_anpr_capture a;

INSERT INTO public.dc_transact_dimension (
  site_id,
  source_id,
  source_site_id,
  source_session_id,
  source_anpr_id,
  filepath,
  length,
  width,
  height,
  is_active,
  is_deleted,
  created_date,
  updated_date,
  raw_payload
)
SELECT
  a.site_id,
  ('50000000-' || substring(a.source_id::text from 10))::uuid,
  a.site_id,
  a.source_session_id,
  a.source_id,
  'dimension/' || a.source_id || '.json',
  CASE WHEN a.plate_no LIKE '%CDM%' OR a.plate_no LIKE '%MM%' OR a.plate_no LIKE '%AD%' OR a.plate_no LIKE '%AB%' THEN 12.2 ELSE 9.8 END,
  2.55,
  CASE WHEN a.plate_no LIKE '%CDM%' OR a.plate_no LIKE '%MM%' OR a.plate_no LIKE '%AD%' OR a.plate_no LIKE '%AB%' THEN 4.15 ELSE 3.35 END,
  true,
  false,
  a.created_date,
  a.updated_date,
  jsonb_build_object('source', 'mirror-seed', 'plate_no', a.plate_no)
FROM public.dc_transact_anpr_capture a;

INSERT INTO public.dc_transact_cctv (
  site_id,
  source_id,
  source_site_id,
  source_session_id,
  filename,
  filepath,
  is_active,
  is_deleted,
  created_date,
  updated_date,
  raw_payload
)
SELECT
  a.site_id,
  ('70000000-' || substring(a.source_id::text from 10))::uuid,
  a.site_id,
  a.source_session_id,
  a.plate_no || '-evidence.mp4',
  'cctv/' || a.source_id || '.mp4',
  true,
  false,
  a.created_date,
  a.updated_date,
  jsonb_build_object('source', 'mirror-seed', 'plate_no', a.plate_no)
FROM public.dc_transact_anpr_capture a;

INSERT INTO public.dc_transact_vehicle_actual (
  site_id,
  source_id,
  source_site_id,
  source_session_id,
  source_anpr_id,
  source_axle_id,
  source_dimension_id,
  source_weighing_id,
  source_cctv_id,
  actual_width,
  actual_length,
  actual_height,
  actual_weight,
  actual_plat_no,
  actual_total_axle,
  location_lat,
  location_lng,
  location_address,
  is_active,
  is_deleted,
  created_date,
  updated_date,
  raw_payload
)
SELECT
  a.site_id,
  ('20000000-' || substring(a.source_id::text from 10))::uuid,
  a.site_id,
  a.source_session_id,
  a.source_id,
  ax.source_id,
  dim.source_id,
  wg.source_id,
  cctv.source_id,
  dim.width,
  dim.length,
  dim.height,
  wg.total_weight,
  a.plate_no,
  wg.total_axle,
  CASE s.site_code
    WHEN 'MST-25-00001' THEN -6.2445234
    WHEN 'MST-25-00002' THEN -6.4025000
    WHEN 'MST-25-00003' THEN -7.0051000
    WHEN 'MST-25-00004' THEN -7.2575000
    WHEN 'MST-25-00005' THEN -1.2379000
    ELSE -5.1477000
  END,
  CASE s.site_code
    WHEN 'MST-25-00001' THEN 106.8214352
    WHEN 'MST-25-00002' THEN 107.1078000
    WHEN 'MST-25-00003' THEN 110.4381000
    WHEN 'MST-25-00004' THEN 112.7521000
    WHEN 'MST-25-00005' THEN 116.8529000
    ELSE 119.4327000
  END,
  s.site_address,
  true,
  false,
  a.created_date,
  a.updated_date,
  jsonb_build_object('source', 'mirror-seed', 'plate_no', a.plate_no)
FROM public.dc_transact_anpr_capture a
JOIN public.dc_site s ON s.id = a.site_id
JOIN public.dc_transact_axle_capture ax ON ax.site_id = a.site_id AND ax.plate_no = a.plate_no
JOIN public.dc_transact_dimension dim ON dim.site_id = a.site_id AND dim.source_anpr_id = a.source_id
JOIN public.dc_transact_weighing wg ON wg.site_id = a.site_id AND wg.source_session_id = a.source_session_id AND wg.raw_payload->>'plate_no' = a.plate_no
JOIN public.dc_transact_cctv cctv ON cctv.site_id = a.site_id AND cctv.source_session_id = a.source_session_id AND cctv.filename LIKE a.plate_no || '%';

INSERT INTO public.dc_transact_vehicle_status (
  site_id,
  source_id,
  source_site_id,
  source_vehicle_actual_id,
  status,
  result,
  notes,
  attachment,
  is_active,
  is_deleted,
  created_date,
  updated_date,
  raw_payload
)
SELECT
  v.site_id,
  ('80000000-' || substring(v.source_id::text from 10))::uuid,
  v.site_id,
  v.source_id,
  CASE
    WHEN v.actual_plat_no IN ('B 7731 KLM', 'H 4459 PP', 'L 9122 DS', 'KT 9981 CD', 'DD 3320 AS') THEN 'NORMAL'
    ELSE 'VIOLATION'
  END,
  CASE
    WHEN v.actual_plat_no IN ('B 9012 TRK', 'T 1829 BK', 'W 7019 GG', 'DD 7510 MP') THEN 'Over Loading'
    WHEN v.actual_plat_no IN ('B 7731 KLM', 'H 4459 PP', 'L 9122 DS', 'KT 9981 CD', 'DD 3320 AS') THEN 'Normal'
    ELSE 'Over Dimension'
  END,
  CASE
    WHEN v.actual_plat_no IN ('B 9012 TRK', 'T 1829 BK', 'W 7019 GG', 'DD 7510 MP') THEN 'Berat kendaraan melebihi batas.'
    WHEN v.actual_plat_no IN ('B 7731 KLM', 'H 4459 PP', 'L 9122 DS', 'KT 9981 CD', 'DD 3320 AS') THEN 'Tidak ada pelanggaran.'
    ELSE 'Dimensi kendaraan melebihi batas.'
  END,
  ARRAY['anpr_plate', 'vehicle_overview'],
  true,
  false,
  v.created_date,
  v.updated_date,
  jsonb_build_object('source', 'mirror-seed', 'plate_no', v.actual_plat_no)
FROM public.dc_transact_vehicle_actual v;

INSERT INTO public.dc_vehicle_attachment (
  site_id,
  vehicle_actual_id,
  site_attachment_id,
  site_transaction_id,
  attachment_type,
  bucket,
  object_key,
  file_name,
  mime_type,
  file_size,
  checksum,
  upload_status,
  source_created_at,
  source_updated_at,
  raw_payload
)
SELECT
  v.site_id,
  NULL,
  ('90000000-' || substring(v.source_id::text from 10))::uuid,
  v.source_id,
  'anpr_plate',
  'jatanlin-data-center-attachments',
  s.site_code || '/anpr/plate/' || v.source_id || '.jpg',
  v.actual_plat_no || '-plate.jpg',
  'image/jpeg',
  128000,
  md5(v.source_id::text),
  'completed',
  v.created_date,
  v.updated_date,
  jsonb_build_object('source', 'mirror-seed', 'plate_no', v.actual_plat_no)
FROM public.dc_transact_vehicle_actual v
JOIN public.dc_site s ON s.id = v.site_id;

INSERT INTO public.dc_site_sync_cursor (
  site_id,
  sync_type,
  last_source_updated_at,
  last_synced_at,
  retry_count
)
SELECT
  id,
  sync_type,
  now() - interval '1 minute',
  now(),
  0
FROM public.dc_site
CROSS JOIN (
  VALUES
    ('transact_wim_session'),
    ('transact_anpr_capture'),
    ('transact_axle_capture'),
    ('transact_dimension'),
    ('transact_weighing'),
    ('transact_cctv'),
    ('transact_vehicle_actual'),
    ('transact_vehicle_status'),
    ('attachment')
) AS sync_types(sync_type);
