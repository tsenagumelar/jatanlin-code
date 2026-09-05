BEGIN;

ALTER TABLE public.transact_vehicle_actual
  ADD COLUMN IF NOT EXISTS actual_data_origin varchar(20) NOT NULL DEFAULT 'REAL';

UPDATE public.transact_vehicle_actual
SET actual_data_origin = 'REAL'
WHERE actual_data_origin IS NULL OR actual_data_origin NOT IN ('REAL','DUMMY','MANUAL');

-- ADD COLUMN ... DEFAULT labels existing rows REAL first, so dummy backfill must
-- explicitly include those rows while preserving values already marked MANUAL.
UPDATE public.transact_vehicle_actual actual
SET actual_data_origin = 'DUMMY'
WHERE actual.actual_data_origin = 'REAL'
  AND EXISTS (
    SELECT 1 FROM public.transact_session_source source
    WHERE source.site_id=actual.site_id AND source.session_id=actual.session_id
      AND source.source_mode='DUMMY' AND source.source_status='RECEIVED'
  );

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='ck_vehicle_actual_data_origin') THEN
    ALTER TABLE public.transact_vehicle_actual ADD CONSTRAINT ck_vehicle_actual_data_origin
      CHECK (actual_data_origin IN ('REAL','DUMMY','MANUAL'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_vehicle_status_created_by') THEN
    ALTER TABLE public.transact_vehicle_status ADD CONSTRAINT fk_vehicle_status_created_by
      FOREIGN KEY (created_by) REFERENCES public.master_user(id) ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_vehicle_status_updated_by') THEN
    ALTER TABLE public.transact_vehicle_status ADD CONSTRAINT fk_vehicle_status_updated_by
      FOREIGN KEY (updated_by) REFERENCES public.master_user(id) ON DELETE RESTRICT;
  END IF;
END $$;

COMMENT ON COLUMN public.transact_vehicle_actual.actual_data_origin IS
  'REAL or DUMMY describes source-derived actual values; MANUAL means a verifier changed actual values.';

COMMIT;
