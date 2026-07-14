-- Add site profile and runtime fields needed before syncing sites into Data Center.

ALTER TABLE public.master_site
  ADD COLUMN IF NOT EXISTS site_address text NULL,
  ADD COLUMN IF NOT EXISTS site_city varchar(100) NULL,
  ADD COLUMN IF NOT EXISTS site_province varchar(100) NULL,
  ADD COLUMN IF NOT EXISTS site_timezone varchar(64) NOT NULL DEFAULT 'Asia/Jakarta',
  ADD COLUMN IF NOT EXISTS contact_name varchar(150) NULL,
  ADD COLUMN IF NOT EXISTS contact_phone varchar(30) NULL,
  ADD COLUMN IF NOT EXISTS operational_status varchar(30) NOT NULL DEFAULT 'offline',
  ADD COLUMN IF NOT EXISTS last_seen_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS last_sync_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS active_operator_id uuid NULL,
  ADD COLUMN IF NOT EXISTS active_operator_name varchar(150) NULL,
  ADD COLUMN IF NOT EXISTS app_version varchar(50) NULL,
  ADD COLUMN IF NOT EXISTS service_version varchar(50) NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'master_site_operational_status_check'
      AND conrelid = 'public.master_site'::regclass
  ) THEN
    ALTER TABLE public.master_site
      ADD CONSTRAINT master_site_operational_status_check
      CHECK (operational_status IN ('online', 'offline', 'warning', 'maintenance'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'master_site_active_operator_id_fkey'
      AND conrelid = 'public.master_site'::regclass
  ) THEN
    ALTER TABLE public.master_site
      ADD CONSTRAINT master_site_active_operator_id_fkey
      FOREIGN KEY (active_operator_id)
      REFERENCES public.master_user(id)
      ON DELETE SET NULL
      ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_master_site_operational_status
  ON public.master_site USING btree (operational_status);

CREATE INDEX IF NOT EXISTS idx_master_site_last_seen
  ON public.master_site USING btree (last_seen_at DESC);

COMMENT ON COLUMN public.master_site.operational_status IS
  'Latest site runtime status reported by the local site';
COMMENT ON COLUMN public.master_site.last_seen_at IS
  'Latest heartbeat timestamp from this site';
COMMENT ON COLUMN public.master_site.last_sync_at IS
  'Latest successful sync timestamp from this site';
COMMENT ON COLUMN public.master_site.active_operator_id IS
  'Currently active local operator, if reported by the site runtime heartbeat';
