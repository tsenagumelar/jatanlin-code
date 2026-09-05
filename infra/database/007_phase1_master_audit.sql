-- Phase 1: enforce valid audit actors for active master-data write paths.
-- NULL remains allowed for legacy/system-owned rows, but zero and orphan UUIDs
-- are normalized before foreign keys are installed.

DO $$
DECLARE
  audit_table text;
  audit_column text;
BEGIN
  FOREACH audit_table IN ARRAY ARRAY['master_user', 'master_vehicle_class']
  LOOP
    FOREACH audit_column IN ARRAY ARRAY['created_by', 'updated_by']
    LOOP
      EXECUTE format(
        'UPDATE public.%I target
         SET %I = NULL
         WHERE %I = %L::uuid
            OR (%I IS NOT NULL AND NOT EXISTS (
              SELECT 1 FROM public.master_user actor WHERE actor.id = target.%I
            ))',
        audit_table,
        audit_column,
        audit_column,
        '00000000-0000-0000-0000-000000000000',
        audit_column,
        audit_column
      );
    END LOOP;
  END LOOP;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_master_user_created_by') THEN
    ALTER TABLE public.master_user ADD CONSTRAINT fk_master_user_created_by
      FOREIGN KEY (created_by) REFERENCES public.master_user(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_master_user_updated_by') THEN
    ALTER TABLE public.master_user ADD CONSTRAINT fk_master_user_updated_by
      FOREIGN KEY (updated_by) REFERENCES public.master_user(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_master_user_created_by_not_nil') THEN
    ALTER TABLE public.master_user ADD CONSTRAINT ck_master_user_created_by_not_nil
      CHECK (created_by IS NULL OR created_by <> '00000000-0000-0000-0000-000000000000'::uuid);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_master_user_updated_by_not_nil') THEN
    ALTER TABLE public.master_user ADD CONSTRAINT ck_master_user_updated_by_not_nil
      CHECK (updated_by IS NULL OR updated_by <> '00000000-0000-0000-0000-000000000000'::uuid);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_master_vehicle_class_created_by') THEN
    ALTER TABLE public.master_vehicle_class ADD CONSTRAINT fk_master_vehicle_class_created_by
      FOREIGN KEY (created_by) REFERENCES public.master_user(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_master_vehicle_class_updated_by') THEN
    ALTER TABLE public.master_vehicle_class ADD CONSTRAINT fk_master_vehicle_class_updated_by
      FOREIGN KEY (updated_by) REFERENCES public.master_user(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_master_vehicle_class_created_by_not_nil') THEN
    ALTER TABLE public.master_vehicle_class ADD CONSTRAINT ck_master_vehicle_class_created_by_not_nil
      CHECK (created_by IS NULL OR created_by <> '00000000-0000-0000-0000-000000000000'::uuid);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_master_vehicle_class_updated_by_not_nil') THEN
    ALTER TABLE public.master_vehicle_class ADD CONSTRAINT ck_master_vehicle_class_updated_by_not_nil
      CHECK (updated_by IS NULL OR updated_by <> '00000000-0000-0000-0000-000000000000'::uuid);
  END IF;
END $$;
