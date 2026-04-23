-- Session ownership validation helpers
-- Purpose:
--   Validate the new session-aware ownership-row behavior for ANPR and AXLE.
--
-- How to use:
--   1. Run section A to inspect the latest active session.
--   2. Start ANPR/AXLE watchers.
--   3. Trigger dummy mode or feed real FTP files.
--   4. Run section B/C/D repeatedly to verify row ownership and update behavior.

-- -----------------------------------------------------------------------------
-- A) Inspect the latest active session
-- -----------------------------------------------------------------------------
SELECT
  id,
  code,
  site_id,
  status,
  started_at,
  ended_at,
  created_date
FROM public.transact_wim_session
WHERE status = 'IN_PROGRESS'
  AND COALESCE(is_active, true) = true
  AND COALESCE(is_deleted, false) = false
ORDER BY started_at DESC
LIMIT 1;

-- -----------------------------------------------------------------------------
-- B) Check ANPR and AXLE rows bound to the latest active session
-- Expected:
--   - max 1 ANPR row
--   - max 1 AXLE row
-- -----------------------------------------------------------------------------
WITH active_session AS (
  SELECT id AS session_id
  FROM public.transact_wim_session
  WHERE status = 'IN_PROGRESS'
    AND COALESCE(is_active, true) = true
    AND COALESCE(is_deleted, false) = false
  ORDER BY started_at DESC
  LIMIT 1
)
SELECT
  s.session_id,
  (SELECT count(*) FROM public.transact_anpr_capture a WHERE a.session_id = s.session_id) AS anpr_rows,
  (SELECT count(*) FROM public.transact_axle_capture x WHERE x.session_id = s.session_id) AS axle_rows
FROM active_session s;

-- -----------------------------------------------------------------------------
-- C) Inspect the actual ANPR ownership row for the latest active session
-- -----------------------------------------------------------------------------
WITH active_session AS (
  SELECT id AS session_id
  FROM public.transact_wim_session
  WHERE status = 'IN_PROGRESS'
    AND COALESCE(is_active, true) = true
    AND COALESCE(is_deleted, false) = false
  ORDER BY started_at DESC
  LIMIT 1
)
SELECT
  a.id,
  a.session_id,
  a.external_id,
  a.plate_no,
  a.confidence,
  a.captured_at,
  a.location_code,
  a.camera_id,
  a.minio_xml_object,
  a.minio_full_image_object,
  a.minio_plate_image_object,
  a.created_date,
  a.updated_date
FROM public.transact_anpr_capture a
JOIN active_session s ON s.session_id = a.session_id
ORDER BY a.created_date ASC;

-- -----------------------------------------------------------------------------
-- D) Inspect the actual AXLE ownership row for the latest active session
-- -----------------------------------------------------------------------------
WITH active_session AS (
  SELECT id AS session_id
  FROM public.transact_wim_session
  WHERE status = 'IN_PROGRESS'
    AND COALESCE(is_active, true) = true
    AND COALESCE(is_deleted, false) = false
  ORDER BY started_at DESC
  LIMIT 1
)
SELECT
  x.id,
  x.session_id,
  x.external_id,
  x.plate_no,
  x.captured_at,
  x.camera_id,
  x.length_mm,
  x.total_wheels,
  x.total_axles,
  x.vehicle_category,
  x.vehicle_body_type,
  x.minio_xml_object,
  x.minio_image_object,
  x.created_date,
  x.updated_date
FROM public.transact_axle_capture x
JOIN active_session s ON s.session_id = x.session_id
ORDER BY x.created_date ASC;

-- -----------------------------------------------------------------------------
-- E) Show duplicate risk by session historically
-- Expected after new behavior:
--   no new session should show count > 1 for ANPR/AXLE
-- -----------------------------------------------------------------------------
SELECT 'ANPR' AS source, session_id, count(*) AS row_count
FROM public.transact_anpr_capture
WHERE session_id IS NOT NULL
GROUP BY session_id
HAVING count(*) > 1
UNION ALL
SELECT 'AXLE' AS source, session_id, count(*) AS row_count
FROM public.transact_axle_capture
WHERE session_id IS NOT NULL
GROUP BY session_id
HAVING count(*) > 1
ORDER BY source, row_count DESC;
