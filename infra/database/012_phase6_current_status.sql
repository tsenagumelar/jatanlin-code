BEGIN;

-- Only one status represents the current enforcement state. Older rows remain
-- available as history but must not influence list/report filters.
WITH ranked AS (
  SELECT id, row_number() OVER (
    PARTITION BY transact_vehicle_actual_id
    ORDER BY created_date DESC NULLS LAST, id DESC
  ) AS position
  FROM public.transact_vehicle_status
  WHERE COALESCE(is_deleted, false) = false
)
UPDATE public.transact_vehicle_status status
SET is_active = (ranked.position = 1)
FROM ranked
WHERE status.id = ranked.id
  AND status.is_active IS DISTINCT FROM (ranked.position = 1);

CREATE UNIQUE INDEX IF NOT EXISTS uq_vehicle_status_current
  ON public.transact_vehicle_status (transact_vehicle_actual_id)
  WHERE COALESCE(is_active, false) = true AND COALESCE(is_deleted, false) = false;

COMMENT ON INDEX public.uq_vehicle_status_current IS
  'Guarantees one current status per vehicle; inactive rows remain immutable business history.';

COMMIT;
