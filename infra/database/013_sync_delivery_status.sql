BEGIN;

CREATE TABLE IF NOT EXISTS public.sync_delivery_status (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id uuid NOT NULL REFERENCES public.master_site(id),
  table_name varchar(100) NOT NULL,
  source_id uuid NOT NULL,
  delivery_status varchar(20) NOT NULL,
  attempt_count integer NOT NULL DEFAULT 0,
  source_cursor text,
  last_attempt_at timestamptz NOT NULL DEFAULT now(),
  last_success_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sync_delivery_status_row_unique UNIQUE (site_id, table_name, source_id),
  CONSTRAINT sync_delivery_status_value_check
    CHECK (delivery_status IN ('SUCCESS', 'FAILED'))
);

CREATE INDEX IF NOT EXISTS idx_sync_delivery_status_failed
  ON public.sync_delivery_status (site_id, table_name, last_attempt_at DESC)
  WHERE delivery_status = 'FAILED';

CREATE INDEX IF NOT EXISTS idx_sync_delivery_status_source
  ON public.sync_delivery_status (site_id, source_id);

COMMENT ON TABLE public.sync_delivery_status IS
  'Last confirmed data-center delivery outcome for each site source row.';
COMMENT ON COLUMN public.sync_delivery_status.attempt_count IS
  'Number of HTTP delivery attempts, including idempotent lookback replays.';

COMMIT;
