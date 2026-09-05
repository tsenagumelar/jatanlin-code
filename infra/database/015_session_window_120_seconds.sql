BEGIN;

UPDATE public.system_runtime_config
SET config_value = '120',
    updated_date = now()
WHERE config_group = 'OPERATION'
  AND config_key = 'SESSION_WINDOW_SECONDS'
  AND is_deleted = false;

UPDATE public.master_config
SET config_value = '120',
    updated_date = now()
WHERE config_type = 'OPERATION'
  AND config_key = 'SESSION_WINDOW_SECONDS'
  AND is_deleted = false;

COMMIT;
