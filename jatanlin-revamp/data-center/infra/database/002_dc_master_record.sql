CREATE TABLE IF NOT EXISTS public.dc_master_record (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.dc_site(id),
  table_name VARCHAR(80) NOT NULL,
  source_id UUID NOT NULL,
  code VARCHAR(120),
  display_name VARCHAR(240),
  source_created_at TIMESTAMPTZ,
  source_updated_at TIMESTAMPTZ,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT dc_master_record_site_table_source_unique UNIQUE (site_id, table_name, source_id)
);

CREATE INDEX IF NOT EXISTS idx_dc_master_record_site_table ON public.dc_master_record (site_id, table_name);
CREATE INDEX IF NOT EXISTS idx_dc_master_record_code ON public.dc_master_record (table_name, code);
CREATE INDEX IF NOT EXISTS idx_dc_master_record_updated ON public.dc_master_record (table_name, source_updated_at DESC);
