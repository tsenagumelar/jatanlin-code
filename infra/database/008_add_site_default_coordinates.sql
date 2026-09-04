ALTER TABLE public.master_site
  ADD COLUMN IF NOT EXISTS default_latitude numeric(9, 6),
  ADD COLUMN IF NOT EXISTS default_longitude numeric(10, 6);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_master_site_default_latitude') THEN
    ALTER TABLE public.master_site ADD CONSTRAINT ck_master_site_default_latitude
      CHECK (default_latitude IS NULL OR default_latitude BETWEEN -90 AND 90);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_master_site_default_longitude') THEN
    ALTER TABLE public.master_site ADD CONSTRAINT ck_master_site_default_longitude
      CHECK (default_longitude IS NULL OR default_longitude BETWEEN -180 AND 180);
  END IF;
END $$;

COMMENT ON COLUMN public.master_site.default_latitude IS
  'Configured fallback latitude used when mobile enforcement GPS is unavailable.';
COMMENT ON COLUMN public.master_site.default_longitude IS
  'Configured fallback longitude used when mobile enforcement GPS is unavailable.';
