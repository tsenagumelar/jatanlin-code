CREATE EXTENSION IF NOT EXISTS pgcrypto;

WITH seed_context AS (
  SELECT
    :'site_id'::uuid AS site_id,
    (SELECT id FROM public.master_user WHERE username = :'admin_username' LIMIT 1) AS admin_id
)
INSERT INTO public.transact_wim_session (
  id,
  code,
  session_name,
  site_id,
  started_at,
  ended_at,
  status,
  total_vehicles,
  processed_vehicles,
  notes,
  started_by,
  ended_by,
  is_active,
  is_deleted
)
SELECT
  '8f32fc90-25c7-4c55-8bfb-fc88d83c7001'::uuid,
  'DEMO-WIM-2026-0001',
  'Demo development transaction',
  seed_context.site_id,
  now() - interval '2 hours',
  now() - interval '1 hour 45 minutes',
  'COMPLETED',
  1,
  1,
  'Development seed transaction. Do not use for production site bootstrap.',
  seed_context.admin_id,
  seed_context.admin_id,
  true,
  false
FROM seed_context
ON CONFLICT (code) DO UPDATE
SET session_name = EXCLUDED.session_name,
    site_id = EXCLUDED.site_id,
    started_at = EXCLUDED.started_at,
    ended_at = EXCLUDED.ended_at,
    status = EXCLUDED.status,
    total_vehicles = EXCLUDED.total_vehicles,
    processed_vehicles = EXCLUDED.processed_vehicles,
    notes = EXCLUDED.notes,
    started_by = EXCLUDED.started_by,
    ended_by = EXCLUDED.ended_by,
    is_active = true,
    is_deleted = false,
    updated_date = now();

WITH seed_context AS (
  SELECT :'site_id'::uuid AS site_id
)
INSERT INTO public.transact_anpr_capture (
  id,
  external_id,
  plate_no,
  confidence,
  captured_at,
  location_code,
  camera_id,
  minio_bucket,
  minio_date_folder,
  minio_full_image_object,
  minio_plate_image_object,
  site_id,
  session_id,
  is_active,
  is_deleted
)
SELECT
  '2c548038-3f47-44ef-b5f8-5840487d0001'::uuid,
  'DEMO-ANPR-2026-0001',
  'B1234DEMO',
  98.75,
  now() - interval '1 hour 58 minutes',
  'LANE-01',
  'ANPR-LOCAL-01',
  'anpr',
  to_char(now(), 'YYYYMMDD'),
  'demo/full/B1234DEMO.jpg',
  'demo/plate/B1234DEMO.jpg',
  seed_context.site_id,
  '8f32fc90-25c7-4c55-8bfb-fc88d83c7001'::uuid,
  true,
  false
FROM seed_context
ON CONFLICT (external_id) DO UPDATE
SET plate_no = EXCLUDED.plate_no,
    confidence = EXCLUDED.confidence,
    captured_at = EXCLUDED.captured_at,
    location_code = EXCLUDED.location_code,
    camera_id = EXCLUDED.camera_id,
    minio_bucket = EXCLUDED.minio_bucket,
    minio_date_folder = EXCLUDED.minio_date_folder,
    minio_full_image_object = EXCLUDED.minio_full_image_object,
    minio_plate_image_object = EXCLUDED.minio_plate_image_object,
    site_id = EXCLUDED.site_id,
    session_id = EXCLUDED.session_id,
    is_active = true,
    is_deleted = false,
    updated_date = now();

WITH seed_context AS (
  SELECT :'site_id'::uuid AS site_id
)
INSERT INTO public.transact_axle_capture (
  id,
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
  minio_image_object,
  site_id,
  session_id,
  is_active,
  is_deleted
)
SELECT
  '35539909-b3cf-456c-a77f-7195a1a30001'::uuid,
  'DEMO-AXLE-2026-0001',
  'B1234DEMO',
  now() - interval '1 hour 57 minutes',
  'AXLE-LOCAL-01',
  11800,
  10,
  3,
  'Truck',
  'Box',
  'axle',
  to_char(now(), 'YYYYMMDD'),
  'demo/axle/B1234DEMO.jpg',
  seed_context.site_id,
  '8f32fc90-25c7-4c55-8bfb-fc88d83c7001'::uuid,
  true,
  false
FROM seed_context
ON CONFLICT (external_id) DO UPDATE
SET plate_no = EXCLUDED.plate_no,
    captured_at = EXCLUDED.captured_at,
    camera_id = EXCLUDED.camera_id,
    length_mm = EXCLUDED.length_mm,
    total_wheels = EXCLUDED.total_wheels,
    total_axles = EXCLUDED.total_axles,
    vehicle_category = EXCLUDED.vehicle_category,
    vehicle_body_type = EXCLUDED.vehicle_body_type,
    minio_bucket = EXCLUDED.minio_bucket,
    minio_date_folder = EXCLUDED.minio_date_folder,
    minio_image_object = EXCLUDED.minio_image_object,
    site_id = EXCLUDED.site_id,
    session_id = EXCLUDED.session_id,
    is_active = true,
    is_deleted = false,
    updated_date = now();

WITH seed_context AS (
  SELECT :'site_id'::uuid AS site_id
)
INSERT INTO public.transact_weighing (
  id,
  total_axle,
  axle_detail,
  total_weight,
  site_id,
  session_id,
  is_active,
  is_deleted
)
SELECT
  '3c524d87-2c2c-45cf-a2e2-9ef3dd1f0001'::uuid,
  3,
  '[{"axle":1,"weight":6500},{"axle":2,"weight":12500},{"axle":3,"weight":12100}]'::jsonb,
  31100,
  seed_context.site_id,
  '8f32fc90-25c7-4c55-8bfb-fc88d83c7001'::uuid,
  true,
  false
FROM seed_context
ON CONFLICT (id) DO UPDATE
SET total_axle = EXCLUDED.total_axle,
    axle_detail = EXCLUDED.axle_detail,
    total_weight = EXCLUDED.total_weight,
    site_id = EXCLUDED.site_id,
    session_id = EXCLUDED.session_id,
    is_active = true,
    is_deleted = false,
    updated_date = now();

WITH seed_context AS (
  SELECT :'site_id'::uuid AS site_id
)
INSERT INTO public.transact_dimension (
  id,
  anpr_id,
  filepath,
  length,
  width,
  height,
  site_id,
  session_id,
  is_active,
  is_deleted
)
SELECT
  '9399bd48-273f-49f0-8867-adf125a10001'::uuid,
  '2c548038-3f47-44ef-b5f8-5840487d0001'::uuid,
  'demo/dimension/B1234DEMO.json',
  11.80,
  2.55,
  3.90,
  seed_context.site_id,
  '8f32fc90-25c7-4c55-8bfb-fc88d83c7001'::uuid,
  true,
  false
FROM seed_context
ON CONFLICT (id) DO UPDATE
SET anpr_id = EXCLUDED.anpr_id,
    filepath = EXCLUDED.filepath,
    length = EXCLUDED.length,
    width = EXCLUDED.width,
    height = EXCLUDED.height,
    site_id = EXCLUDED.site_id,
    session_id = EXCLUDED.session_id,
    is_active = true,
    is_deleted = false,
    updated_date = now();

WITH seed_context AS (
  SELECT :'site_id'::uuid AS site_id
)
INSERT INTO public.transact_cctv (
  id,
  filename,
  filepath,
  site_id,
  session_id,
  is_active,
  is_deleted
)
SELECT
  'b653804f-d42e-45c5-9d9c-a2952c330001'::uuid,
  'B1234DEMO.mp4',
  'demo/cctv/B1234DEMO.mp4',
  seed_context.site_id,
  '8f32fc90-25c7-4c55-8bfb-fc88d83c7001'::uuid,
  true,
  false
FROM seed_context
ON CONFLICT (id) DO UPDATE
SET filename = EXCLUDED.filename,
    filepath = EXCLUDED.filepath,
    site_id = EXCLUDED.site_id,
    session_id = EXCLUDED.session_id,
    is_active = true,
    is_deleted = false,
    updated_date = now();

WITH seed_context AS (
  SELECT :'site_id'::uuid AS site_id
)
INSERT INTO public.transact_vehicle_actual (
  id,
  anpr_id,
  axle_id,
  transact_dimension_id,
  transact_weighing_id,
  transact_cctv_id,
  session_id,
  site_id,
  actual_plat_no,
  actual_total_axle,
  actual_length,
  actual_width,
  actual_height,
  actual_weight,
  location_lat,
  location_lng,
  location_address,
  is_active,
  is_deleted
)
SELECT
  'a38e9243-902d-4d17-89a4-c4e193940001'::uuid,
  '2c548038-3f47-44ef-b5f8-5840487d0001'::uuid,
  '35539909-b3cf-456c-a77f-7195a1a30001'::uuid,
  '9399bd48-273f-49f0-8867-adf125a10001'::uuid,
  '3c524d87-2c2c-45cf-a2e2-9ef3dd1f0001'::uuid,
  'b653804f-d42e-45c5-9d9c-a2952c330001'::uuid,
  '8f32fc90-25c7-4c55-8bfb-fc88d83c7001'::uuid,
  seed_context.site_id,
  'B1234DEMO',
  3,
  11.80,
  2.55,
  3.90,
  31100,
  -6.2609000,
  106.8218000,
  'Mampang Revamp Local Lane 1',
  true,
  false
FROM seed_context
ON CONFLICT (id) DO UPDATE
SET anpr_id = EXCLUDED.anpr_id,
    axle_id = EXCLUDED.axle_id,
    transact_dimension_id = EXCLUDED.transact_dimension_id,
    transact_weighing_id = EXCLUDED.transact_weighing_id,
    transact_cctv_id = EXCLUDED.transact_cctv_id,
    session_id = EXCLUDED.session_id,
    site_id = EXCLUDED.site_id,
    actual_plat_no = EXCLUDED.actual_plat_no,
    actual_total_axle = EXCLUDED.actual_total_axle,
    actual_length = EXCLUDED.actual_length,
    actual_width = EXCLUDED.actual_width,
    actual_height = EXCLUDED.actual_height,
    actual_weight = EXCLUDED.actual_weight,
    location_lat = EXCLUDED.location_lat,
    location_lng = EXCLUDED.location_lng,
    location_address = EXCLUDED.location_address,
    is_active = true,
    is_deleted = false,
    updated_date = now();

WITH seed_context AS (
  SELECT :'site_id'::uuid AS site_id
)
INSERT INTO public.transact_vehicle_status (
  id,
  site_id,
  transact_vehicle_actual_id,
  status,
  result,
  notes,
  is_active,
  is_deleted
)
SELECT
  '16d03332-d2f0-4e35-8806-f8210a510001'::uuid,
  seed_context.site_id,
  'a38e9243-902d-4d17-89a4-c4e193940001'::uuid,
  'verified',
  'ODOL',
  'Development seed transaction with overweight and overdimension sample.',
  true,
  false
FROM seed_context
ON CONFLICT (id) DO UPDATE
SET site_id = EXCLUDED.site_id,
    transact_vehicle_actual_id = EXCLUDED.transact_vehicle_actual_id,
    status = EXCLUDED.status,
    result = EXCLUDED.result,
    notes = EXCLUDED.notes,
    is_active = true,
    is_deleted = false,
    updated_date = now();
