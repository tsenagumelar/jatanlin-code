-- Read-only preflight. Any returned row requires review before migration 010.

SELECT 'multiple_active_sessions' AS issue, site_id::text AS scope, count(*) AS row_count
FROM public.transact_wim_session
WHERE status IN ('STARTED', 'IN_PROGRESS') AND COALESCE(is_deleted, false) = false
GROUP BY site_id HAVING count(*) > 1;

SELECT 'multiple_vehicle_actual' AS issue,
       site_id::text || '/' || session_id::text AS scope,
       count(*) AS row_count
FROM public.transact_vehicle_actual
WHERE session_id IS NOT NULL
GROUP BY site_id, session_id HAVING count(*) > 1;

SELECT 'session_site_mismatch' AS issue, child_table, child_id, child_site_id, session_site_id
FROM (
  SELECT 'anpr' child_table, t.id child_id, t.site_id child_site_id, s.site_id session_site_id
    FROM public.transact_anpr_capture t JOIN public.transact_wim_session s ON s.id = t.session_id WHERE t.site_id <> s.site_id
  UNION ALL SELECT 'axle', t.id, t.site_id, s.site_id
    FROM public.transact_axle_capture t JOIN public.transact_wim_session s ON s.id = t.session_id WHERE t.site_id <> s.site_id
  UNION ALL SELECT 'cctv', t.id, t.site_id, s.site_id
    FROM public.transact_cctv t JOIN public.transact_wim_session s ON s.id = t.session_id WHERE t.site_id <> s.site_id
  UNION ALL SELECT 'dimension', t.id, t.site_id, s.site_id
    FROM public.transact_dimension t JOIN public.transact_wim_session s ON s.id = t.session_id WHERE t.site_id <> s.site_id
  UNION ALL SELECT 'weighing', t.id, t.site_id, s.site_id
    FROM public.transact_weighing t JOIN public.transact_wim_session s ON s.id = t.session_id WHERE t.site_id <> s.site_id
  UNION ALL SELECT 'vehicle_actual', t.id, t.site_id, s.site_id
    FROM public.transact_vehicle_actual t JOIN public.transact_wim_session s ON s.id = t.session_id WHERE t.site_id <> s.site_id
) mismatch;

SELECT source, site_id, device_scope, external_id, row_count
FROM (
  SELECT 'ANPR' source, site_id, COALESCE(camera_id, '') device_scope, external_id, count(*) row_count
  FROM public.transact_anpr_capture WHERE external_id IS NOT NULL
  GROUP BY site_id, COALESCE(camera_id, ''), external_id HAVING count(*) > 1
  UNION ALL
  SELECT 'AXLE', site_id, COALESCE(camera_id, ''), external_id, count(*)
  FROM public.transact_axle_capture WHERE external_id IS NOT NULL
  GROUP BY site_id, COALESCE(camera_id, ''), external_id HAVING count(*) > 1
) duplicate_external;

SELECT table_name, audit_column, orphan_count
FROM (
  SELECT 'transact_wim_session' table_name, 'created_by' audit_column, count(*) orphan_count
  FROM public.transact_wim_session t LEFT JOIN public.master_user u ON u.id = t.created_by
  WHERE t.created_by IS NOT NULL AND u.id IS NULL
  UNION ALL SELECT 'transact_vehicle_actual', 'created_by', count(*)
  FROM public.transact_vehicle_actual t LEFT JOIN public.master_user u ON u.id = t.created_by
  WHERE t.created_by IS NOT NULL AND u.id IS NULL
  UNION ALL SELECT 'transact_vehicle_actual', 'updated_by', count(*)
  FROM public.transact_vehicle_actual t LEFT JOIN public.master_user u ON u.id = t.updated_by
  WHERE t.updated_by IS NOT NULL AND u.id IS NULL
) audit
WHERE orphan_count > 0;
