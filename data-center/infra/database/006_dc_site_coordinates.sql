BEGIN;

ALTER TABLE public.dc_site
  ADD COLUMN IF NOT EXISTS site_location VARCHAR(200),
  ADD COLUMN IF NOT EXISTS latitude NUMERIC(9,6),
  ADD COLUMN IF NOT EXISTS longitude NUMERIC(10,6);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_dc_site_latitude') THEN
    ALTER TABLE public.dc_site ADD CONSTRAINT ck_dc_site_latitude
      CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_dc_site_longitude') THEN
    ALTER TABLE public.dc_site ADD CONSTRAINT ck_dc_site_longitude
      CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180);
  END IF;
END $$;

COMMENT ON COLUMN public.dc_site.latitude IS 'Site profile latitude received from the site heartbeat.';
COMMENT ON COLUMN public.dc_site.longitude IS 'Site profile longitude received from the site heartbeat.';
COMMENT ON COLUMN public.dc_site.site_location IS 'Site location label received from the site heartbeat.';

COMMIT;
