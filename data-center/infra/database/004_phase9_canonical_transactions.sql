BEGIN;

-- The lossless site-schema mirror is the only transaction read model.
-- The legacy table remains available for rollback/audit but is not queried.
DROP VIEW IF EXISTS public.dc_dashboard_vehicle_actual;

CREATE VIEW public.dc_dashboard_vehicle_actual AS
SELECT
  v.id, v.site_id, v.source_id::text AS source_id,
  NULL::varchar(120) AS transaction_no,
  v.actual_plat_no AS plate_no,
  NULL::varchar(100) AS vehicle_class,
  NULL::varchar(160) AS operator_name,
  v.location_lat::numeric(11,8) AS location_lat,
  v.location_lng::numeric(11,8) AS location_lng,
  v.location_address, v.actual_weight AS total_weight,
  v.actual_length AS length_mm, v.actual_width AS width_mm,
  v.actual_height AS height_mm, v.actual_total_axle AS axle_count,
  CASE
    WHEN lower(COALESCE(vs.status, v.verification_status, '')) = 'verified'
      AND lower(COALESCE(vs.result, '')) LIKE '%normal%' THEN 'normal'
    WHEN lower(COALESCE(vs.status, v.verification_status, '')) = 'verified' THEN 'violation'
    WHEN lower(COALESCE(vs.status, v.verification_status, '')) = 'rejected' THEN 'rejected'
    WHEN vs.id IS NOT NULL THEN lower(COALESCE(vs.status, 'pending'))
    ELSE lower(COALESCE(v.verification_status, 'pending'))
  END AS violation_status,
  COALESCE(vs.notes, vs.result, v.verification_notes, vs.status) AS violation_notes,
  COALESCE(ws.started_at, v.created_date, v.synced_at) AS enforcement_started_at,
  ws.ended_at AS enforcement_finished_at,
  v.updated_date AS source_updated_at, v.synced_at,
  COALESCE(v.created_date, v.synced_at) AS created_at,
  COALESCE(v.updated_date, v.synced_at) AS updated_at,
  v.is_deleted
FROM public.dc_transact_vehicle_actual v
LEFT JOIN public.dc_transact_wim_session ws
  ON ws.site_id = v.site_id AND ws.source_id = v.source_session_id
LEFT JOIN LATERAL (
  SELECT s.* FROM public.dc_transact_vehicle_status s
  WHERE s.site_id = v.site_id
    AND s.source_vehicle_actual_id = v.source_id
    AND COALESCE(s.is_deleted, false) = false
  ORDER BY COALESCE(s.updated_date, s.created_date, s.synced_at) DESC
  LIMIT 1
) vs ON true
WHERE COALESCE(v.is_deleted, false) = false;

COMMENT ON VIEW public.dc_dashboard_vehicle_actual IS
  'Canonical Phase 9 transaction read model backed only by dc_transact_vehicle_actual.';

COMMIT;
