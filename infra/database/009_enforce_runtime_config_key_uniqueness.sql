-- Runtime consumers address configuration by config_key, not by group + key.
-- Enforce the same contract in the database to avoid nondeterministic overrides.
DO $$
BEGIN
  IF EXISTS (
    SELECT config_key
    FROM public.system_runtime_config
    GROUP BY config_key
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION
      'Duplicate system_runtime_config.config_key values must be resolved before migration 009';
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_system_runtime_config_key
  ON public.system_runtime_config (config_key);
