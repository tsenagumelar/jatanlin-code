CREATE OR REPLACE FUNCTION public.set_updated_timestamp()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_date = now();
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  tbl text;
  tables text[] := ARRAY[
    'master_role',
    'master_site',
    'master_device_type',
    'master_vehicle_class',
    'master_config',
    'master_device',
    'master_user',
    'transact_wim_session',
    'transact_anpr_capture',
    'transact_axle_capture',
    'transact_cctv',
    'transact_dimension',
    'transact_weighing',
    'transact_vehicle_actual',
    'transact_vehicle_status',
    'user_login_history',
    'system_runtime_config'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = tbl
        AND column_name = 'updated_date'
    ) THEN
      EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I', 'trg_' || tbl || '_updated_date', tbl);
      EXECUTE format(
        'CREATE TRIGGER %I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_timestamp()',
        'trg_' || tbl || '_updated_date',
        tbl
      );
    END IF;
  END LOOP;
END $$;
