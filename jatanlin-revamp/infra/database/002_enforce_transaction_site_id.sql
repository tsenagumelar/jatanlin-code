-- Ensure every local transaction row is explicitly scoped to a site.
-- Existing partial rows are backfilled from their WIM session/vehicle actual before enforcing NOT NULL.

UPDATE public.transact_anpr_capture t
SET site_id = s.site_id,
    updated_date = now()
FROM public.transact_wim_session s
WHERE t.site_id IS NULL
  AND t.session_id = s.id;

UPDATE public.transact_axle_capture t
SET site_id = s.site_id,
    updated_date = now()
FROM public.transact_wim_session s
WHERE t.site_id IS NULL
  AND t.session_id = s.id;

UPDATE public.transact_cctv t
SET site_id = s.site_id,
    updated_date = now()
FROM public.transact_wim_session s
WHERE t.site_id IS NULL
  AND t.session_id = s.id;

UPDATE public.transact_dimension t
SET site_id = s.site_id,
    updated_date = now()
FROM public.transact_wim_session s
WHERE t.site_id IS NULL
  AND t.session_id = s.id;

UPDATE public.transact_weighing t
SET site_id = s.site_id,
    updated_date = now()
FROM public.transact_wim_session s
WHERE t.site_id IS NULL
  AND t.session_id = s.id;

UPDATE public.transact_vehicle_actual t
SET site_id = COALESCE(
      (SELECT s.site_id FROM public.transact_wim_session s WHERE s.id = t.session_id),
      (SELECT a.site_id FROM public.transact_anpr_capture a WHERE a.id = t.anpr_id),
      (SELECT a.site_id FROM public.transact_axle_capture a WHERE a.id = t.axle_id),
      (SELECT d.site_id FROM public.transact_dimension d WHERE d.id = t.transact_dimension_id),
      (SELECT w.site_id FROM public.transact_weighing w WHERE w.id = t.transact_weighing_id),
      (SELECT c.site_id FROM public.transact_cctv c WHERE c.id = t.transact_cctv_id)
    ),
    updated_date = now()
WHERE t.site_id IS NULL;

UPDATE public.transact_vehicle_status s
SET site_id = a.site_id,
    updated_date = now()
FROM public.transact_vehicle_actual a
WHERE s.site_id IS NULL
  AND s.transact_vehicle_actual_id = a.id;

DO $$
DECLARE
  missing_table text;
  missing_count bigint;
BEGIN
  FOR missing_table, missing_count IN
    SELECT table_name, null_count
    FROM (
      SELECT 'transact_anpr_capture' AS table_name, count(*) FILTER (WHERE site_id IS NULL) AS null_count FROM public.transact_anpr_capture
      UNION ALL SELECT 'transact_axle_capture', count(*) FILTER (WHERE site_id IS NULL) FROM public.transact_axle_capture
      UNION ALL SELECT 'transact_cctv', count(*) FILTER (WHERE site_id IS NULL) FROM public.transact_cctv
      UNION ALL SELECT 'transact_dimension', count(*) FILTER (WHERE site_id IS NULL) FROM public.transact_dimension
      UNION ALL SELECT 'transact_vehicle_actual', count(*) FILTER (WHERE site_id IS NULL) FROM public.transact_vehicle_actual
      UNION ALL SELECT 'transact_vehicle_status', count(*) FILTER (WHERE site_id IS NULL) FROM public.transact_vehicle_status
      UNION ALL SELECT 'transact_weighing', count(*) FILTER (WHERE site_id IS NULL) FROM public.transact_weighing
      UNION ALL SELECT 'transact_wim_session', count(*) FILTER (WHERE site_id IS NULL) FROM public.transact_wim_session
    ) checks
    WHERE null_count > 0
  LOOP
    RAISE EXCEPTION 'Cannot enforce site_id NOT NULL: %.site_id still has % NULL rows', missing_table, missing_count;
  END LOOP;
END $$;

ALTER TABLE public.transact_anpr_capture ALTER COLUMN site_id SET NOT NULL;
ALTER TABLE public.transact_axle_capture ALTER COLUMN site_id SET NOT NULL;
ALTER TABLE public.transact_cctv ALTER COLUMN site_id SET NOT NULL;
ALTER TABLE public.transact_dimension ALTER COLUMN site_id SET NOT NULL;
ALTER TABLE public.transact_vehicle_actual ALTER COLUMN site_id SET NOT NULL;
ALTER TABLE public.transact_vehicle_status ALTER COLUMN site_id SET NOT NULL;
ALTER TABLE public.transact_weighing ALTER COLUMN site_id SET NOT NULL;
ALTER TABLE public.transact_wim_session ALTER COLUMN site_id SET NOT NULL;
