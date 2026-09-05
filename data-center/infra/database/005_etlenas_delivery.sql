BEGIN;

CREATE TABLE IF NOT EXISTS public.dc_etlenas_delivery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.dc_site(id) ON DELETE RESTRICT,
  vehicle_actual_id UUID NOT NULL REFERENCES public.dc_transact_vehicle_actual(id) ON DELETE RESTRICT,
  source_vehicle_actual_id UUID NOT NULL,
  source_vehicle_status_id UUID NOT NULL,
  delivery_status VARCHAR(20) NOT NULL,
  http_status INTEGER,
  etlenas_status_code INTEGER,
  request_payload JSONB,
  response_payload JSONB,
  response_body TEXT,
  error_message TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_dc_etlenas_delivery_status CHECK (delivery_status IN ('PROCESSING','SUCCESS','FAILED'))
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_dc_etlenas_delivery_success
  ON public.dc_etlenas_delivery(site_id, source_vehicle_actual_id)
  WHERE delivery_status = 'SUCCESS';
CREATE INDEX IF NOT EXISTS idx_dc_etlenas_delivery_source
  ON public.dc_etlenas_delivery(site_id, source_vehicle_actual_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_dc_etlenas_delivery_status
  ON public.dc_etlenas_delivery(delivery_status, started_at DESC);

COMMENT ON TABLE public.dc_etlenas_delivery IS
  'Append-only trace of Data Center delivery attempts for verified violations sent to ETLENAS.';

COMMIT;
