-- Test data insert for active WIM session.
-- Purpose:
--   Validate that Hasura subscriptions/UI can receive ANPR, WB/weighing,
--   AXLE, dimension, and CCTV rows correlated by the active session_id.
--
-- Prerequisite:
--   Exactly one target row should exist in transact_wim_session with:
--     status = 'IN_PROGRESS'
--     is_active = true
--     is_deleted = false
--
-- Notes:
--   - This script inserts detected sample data for all sources.
--   - A second block inserts placeholder rows with only session_id for missing data.
--   - Placeholder fields must be NULL, not empty string.
--   - Run in Hasura Console SQL tab or psql against the same PostgreSQL DB.

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.transact_wim_session
    WHERE status = 'IN_PROGRESS'
      AND COALESCE(is_active, true) = true
      AND COALESCE(is_deleted, false) = false
  ) THEN
    RAISE EXCEPTION 'No active IN_PROGRESS transact_wim_session found';
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 1) Insert sample detected data for every source in the latest active session.
-- -----------------------------------------------------------------------------
WITH active_session AS (
  SELECT id AS session_id, site_id
  FROM public.transact_wim_session
  WHERE status = 'IN_PROGRESS'
    AND COALESCE(is_active, true) = true
    AND COALESCE(is_deleted, false) = false
  ORDER BY started_at DESC
  LIMIT 1
), seed AS (
  SELECT
    active_session.session_id,
    active_session.site_id,
    to_char(clock_timestamp(), 'YYYYMMDDHH24MISSMS') AS ts
  FROM active_session
), anpr AS (
  INSERT INTO public.transact_anpr_capture (
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
    site_id,
    session_id
  )
  SELECT
    'TEST-ANPR-' || left(session_id::text, 8),
    'B1234TST',
    98.50,
    now(),
    'TEST-GATE-01',
    'ANPR-CAM-TEST-01',
    'test-anpr',
    to_char(now(), 'YYYYMMDD'),
    'test/' || ts || '/anpr.xml',
    'test/' || ts || '/full.jpg',
    'test/' || ts || '/plate.jpg',
    site_id,
    session_id
  FROM seed
  ON CONFLICT (external_id) DO UPDATE SET
    plate_no = EXCLUDED.plate_no,
    confidence = EXCLUDED.confidence,
    captured_at = EXCLUDED.captured_at,
    site_id = EXCLUDED.site_id,
    session_id = EXCLUDED.session_id,
    updated_date = now()
  RETURNING id, session_id, site_id
), axle AS (
  INSERT INTO public.transact_axle_capture (
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
    site_id,
    session_id
  )
  SELECT
    'TEST-AXLE-' || left(session_id::text, 8),
    'B1234TST',
    now(),
    'AXLE-CAM-TEST-01',
    7200,
    6,
    3,
    'TRUCK',
    'BOX',
    'test-axle',
    to_char(now(), 'YYYYMMDD'),
    'test/' || ts || '/axle.xml',
    'test/' || ts || '/axle.jpg',
    site_id,
    session_id
  FROM seed
  ON CONFLICT (external_id) DO UPDATE SET
    plate_no = EXCLUDED.plate_no,
    captured_at = EXCLUDED.captured_at,
    length_mm = EXCLUDED.length_mm,
    total_wheels = EXCLUDED.total_wheels,
    total_axles = EXCLUDED.total_axles,
    site_id = EXCLUDED.site_id,
    session_id = EXCLUDED.session_id,
    updated_date = now()
  RETURNING id, session_id, site_id
), weighing AS (
  INSERT INTO public.transact_weighing (
    total_axle,
    axle_detail,
    total_weight,
    site_id,
    session_id
  )
  SELECT
    3,
    '[{"axle_number":1,"weight":4200,"gross_weight":4200,"wheel1_weight":2100,"wheel2_weight":2100,"wheelbase":0,"speed":12},{"axle_number":2,"weight":6800,"gross_weight":6800,"wheel1_weight":3400,"wheel2_weight":3400,"wheelbase":3400,"speed":12},{"axle_number":3,"weight":7000,"gross_weight":7000,"wheel1_weight":3500,"wheel2_weight":3500,"wheelbase":1320,"speed":12}]'::jsonb,
    18000.000,
    site_id,
    session_id
  FROM seed
  RETURNING id, session_id, site_id
), cctv AS (
  INSERT INTO public.transact_cctv (
    filename,
    filepath,
    site_id,
    session_id
  )
  SELECT
    'test-cctv-' || ts || '.mp4',
    'test-cctv/test-cctv-' || ts || '.mp4',
    site_id,
    session_id
  FROM seed
  RETURNING id, session_id, site_id
), dimension AS (
  INSERT INTO public.transact_dimension (
    anpr_id,
    filepath,
    length,
    width,
    height,
    site_id,
    session_id
  )
  SELECT
    anpr.id,
    'test-dimension/dimension-' || seed.ts || '.jpg',
    7.200,
    2.400,
    3.200,
    seed.site_id,
    seed.session_id
  FROM seed
  JOIN anpr ON anpr.session_id = seed.session_id
  RETURNING id, session_id, site_id
)
SELECT
  seed.session_id,
  anpr.id AS anpr_id,
  weighing.id AS weighing_id,
  axle.id AS axle_id,
  dimension.id AS dimension_id,
  cctv.id AS cctv_id
FROM seed
LEFT JOIN anpr ON anpr.session_id = seed.session_id
LEFT JOIN weighing ON weighing.session_id = seed.session_id
LEFT JOIN axle ON axle.session_id = seed.session_id
LEFT JOIN dimension ON dimension.session_id = seed.session_id
LEFT JOIN cctv ON cctv.session_id = seed.session_id;

-- -----------------------------------------------------------------------------
-- 2) Insert placeholder rows for missing source simulation.
--    These rows intentionally contain only session_id plus optional site_id.
-- -----------------------------------------------------------------------------
WITH active_session AS (
  SELECT id AS session_id, site_id
  FROM public.transact_wim_session
  WHERE status = 'IN_PROGRESS'
    AND COALESCE(is_active, true) = true
    AND COALESCE(is_deleted, false) = false
  ORDER BY started_at DESC
  LIMIT 1
), anpr_missing AS (
  INSERT INTO public.transact_anpr_capture (site_id, session_id)
  SELECT site_id, session_id
  FROM active_session s
  WHERE NOT EXISTS (
    SELECT 1 FROM public.transact_anpr_capture t
    WHERE t.session_id = s.session_id
      AND t.external_id IS NULL
      AND t.plate_no IS NULL
  )
  RETURNING id, session_id
), axle_missing AS (
  INSERT INTO public.transact_axle_capture (site_id, session_id)
  SELECT site_id, session_id
  FROM active_session s
  WHERE NOT EXISTS (
    SELECT 1 FROM public.transact_axle_capture t
    WHERE t.session_id = s.session_id
      AND t.external_id IS NULL
      AND t.total_axles IS NULL
  )
  RETURNING id, session_id
), weighing_missing AS (
  INSERT INTO public.transact_weighing (site_id, session_id)
  SELECT site_id, session_id
  FROM active_session s
  WHERE NOT EXISTS (
    SELECT 1 FROM public.transact_weighing t
    WHERE t.session_id = s.session_id
      AND t.total_axle IS NULL
      AND t.total_weight IS NULL
      AND t.axle_detail IS NULL
  )
  RETURNING id, session_id
), dimension_missing AS (
  INSERT INTO public.transact_dimension (site_id, session_id)
  SELECT site_id, session_id
  FROM active_session s
  WHERE NOT EXISTS (
    SELECT 1 FROM public.transact_dimension t
    WHERE t.session_id = s.session_id
      AND t.anpr_id IS NULL
      AND t.filepath IS NULL
      AND t.length IS NULL
      AND t.width IS NULL
      AND t.height IS NULL
  )
  RETURNING id, session_id
), cctv_missing AS (
  INSERT INTO public.transact_cctv (site_id, session_id)
  SELECT site_id, session_id
  FROM active_session s
  WHERE NOT EXISTS (
    SELECT 1 FROM public.transact_cctv t
    WHERE t.session_id = s.session_id
      AND t.filename IS NULL
      AND t.filepath IS NULL
  )
  RETURNING id, session_id
)
SELECT
  active_session.session_id,
  anpr_missing.id AS missing_anpr_id,
  weighing_missing.id AS missing_weighing_id,
  axle_missing.id AS missing_axle_id,
  dimension_missing.id AS missing_dimension_id,
  cctv_missing.id AS missing_cctv_id
FROM active_session
LEFT JOIN anpr_missing ON anpr_missing.session_id = active_session.session_id
LEFT JOIN weighing_missing ON weighing_missing.session_id = active_session.session_id
LEFT JOIN axle_missing ON axle_missing.session_id = active_session.session_id
LEFT JOIN dimension_missing ON dimension_missing.session_id = active_session.session_id
LEFT JOIN cctv_missing ON cctv_missing.session_id = active_session.session_id;

COMMIT;
