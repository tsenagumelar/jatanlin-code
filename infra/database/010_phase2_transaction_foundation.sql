BEGIN;

-- Stop before adding uniqueness when legacy rows need an explicit business decision.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.transact_wim_session
    WHERE status IN ('STARTED', 'IN_PROGRESS') AND COALESCE(is_deleted, false) = false
    GROUP BY site_id HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'Phase 2 blocked: multiple active sessions exist for one or more sites';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.transact_vehicle_actual
    WHERE session_id IS NOT NULL
    GROUP BY site_id, session_id HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'Phase 2 blocked: multiple active vehicle_actual rows exist for a site/session';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.transact_anpr_capture
    WHERE external_id IS NOT NULL
    GROUP BY site_id, COALESCE(camera_id, ''), external_id HAVING count(*) > 1
  ) OR EXISTS (
    SELECT 1 FROM public.transact_axle_capture
    WHERE external_id IS NOT NULL
    GROUP BY site_id, COALESCE(camera_id, ''), external_id HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'Phase 2 blocked: duplicate external_id exists within the same site/device scope';
  END IF;
END $$;

ALTER TABLE public.transact_vehicle_actual
  ADD COLUMN IF NOT EXISTS completeness_status varchar(20) NOT NULL DEFAULT 'EMPTY',
  ADD COLUMN IF NOT EXISTS missing_sources text[] NOT NULL DEFAULT ARRAY['ANPR','AXLE','WIM','CCTV','DIMENSION']::text[],
  ADD COLUMN IF NOT EXISTS verification_status varchar(20) NOT NULL DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS verified_by uuid,
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS verification_notes text;

UPDATE public.transact_vehicle_actual
SET missing_sources = ARRAY_REMOVE(ARRAY[
      CASE WHEN anpr_id IS NULL THEN 'ANPR' END,
      CASE WHEN axle_id IS NULL THEN 'AXLE' END,
      CASE WHEN transact_weighing_id IS NULL THEN 'WIM' END,
      CASE WHEN transact_cctv_id IS NULL THEN 'CCTV' END,
      CASE WHEN transact_dimension_id IS NULL THEN 'DIMENSION' END
    ], NULL),
    completeness_status = CASE
      WHEN anpr_id IS NOT NULL
       AND axle_id IS NOT NULL
       AND transact_weighing_id IS NOT NULL
       AND transact_cctv_id IS NOT NULL
       AND transact_dimension_id IS NOT NULL THEN 'COMPLETE'
      WHEN anpr_id IS NULL
       AND axle_id IS NULL
       AND transact_weighing_id IS NULL
       AND transact_cctv_id IS NULL
       AND transact_dimension_id IS NULL THEN 'EMPTY'
      ELSE 'PARTIAL'
    END;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_vehicle_actual_completeness_status') THEN
    ALTER TABLE public.transact_vehicle_actual ADD CONSTRAINT ck_vehicle_actual_completeness_status
      CHECK (completeness_status IN ('EMPTY', 'PARTIAL', 'COMPLETE'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_vehicle_actual_verification_status') THEN
    ALTER TABLE public.transact_vehicle_actual ADD CONSTRAINT ck_vehicle_actual_verification_status
      CHECK (verification_status IN ('PENDING', 'IN_REVIEW', 'VERIFIED', 'REJECTED'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_vehicle_actual_verification_actor') THEN
    ALTER TABLE public.transact_vehicle_actual ADD CONSTRAINT ck_vehicle_actual_verification_actor
      CHECK (
        (verification_status IN ('PENDING', 'IN_REVIEW'))
        OR (verified_by IS NOT NULL AND verified_at IS NOT NULL)
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_vehicle_actual_verified_by') THEN
    ALTER TABLE public.transact_vehicle_actual ADD CONSTRAINT fk_vehicle_actual_verified_by
      FOREIGN KEY (verified_by) REFERENCES public.master_user(id) ON DELETE RESTRICT;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.transact_session_source (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id uuid NOT NULL,
  session_id uuid NOT NULL,
  source_type varchar(20) NOT NULL,
  source_mode varchar(20) NOT NULL DEFAULT 'REAL',
  source_status varchar(20) NOT NULL DEFAULT 'PENDING',
  device_id uuid,
  source_record_id uuid,
  received_at timestamptz,
  timeout_at timestamptz,
  last_attempt_at timestamptz,
  attempt_count int NOT NULL DEFAULT 0,
  error_code varchar(100),
  error_message text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  is_deleted boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_date timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  updated_date timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_transact_session_source UNIQUE (site_id, session_id, source_type),
  CONSTRAINT ck_session_source_type CHECK (source_type IN ('ANPR','AXLE','WIM','CCTV','DIMENSION')),
  CONSTRAINT ck_session_source_mode CHECK (source_mode IN ('REAL','DUMMY','DISABLED')),
  CONSTRAINT ck_session_source_status CHECK (source_status IN ('PENDING','WAITING','RECEIVED','TIMEOUT','FAILED','SKIPPED')),
  CONSTRAINT ck_session_source_attempt_count CHECK (attempt_count >= 0),
  CONSTRAINT fk_session_source_site FOREIGN KEY (site_id) REFERENCES public.master_site(id) ON DELETE RESTRICT,
  CONSTRAINT fk_session_source_session FOREIGN KEY (session_id) REFERENCES public.transact_wim_session(id) ON DELETE CASCADE,
  CONSTRAINT fk_session_source_device FOREIGN KEY (device_id) REFERENCES public.master_device(id) ON DELETE SET NULL,
  CONSTRAINT fk_session_source_created_by FOREIGN KEY (created_by) REFERENCES public.master_user(id) ON DELETE SET NULL,
  CONSTRAINT fk_session_source_updated_by FOREIGN KEY (updated_by) REFERENCES public.master_user(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_session_source_status
  ON public.transact_session_source (site_id, source_status, timeout_at);
CREATE INDEX IF NOT EXISTS idx_session_source_record
  ON public.transact_session_source (source_type, source_record_id)
  WHERE source_record_id IS NOT NULL;

INSERT INTO public.transact_session_source (
  site_id, session_id, source_type, source_mode, source_status,
  source_record_id, received_at, created_by, created_date
)
SELECT s.site_id, s.id, source.source_type,
       CASE WHEN COALESCE(s.is_dummy, false) THEN 'DUMMY' ELSE 'REAL' END,
       CASE WHEN source.record_id IS NULL THEN 'PENDING' ELSE 'RECEIVED' END,
       source.record_id, source.received_at,
       CASE WHEN actor.id IS NOT NULL THEN s.created_by END,
       COALESCE(s.created_date, now())
FROM public.transact_wim_session s
LEFT JOIN public.master_user actor ON actor.id = s.created_by
CROSS JOIN LATERAL (
  (SELECT 'ANPR', a.id, COALESCE(a.captured_at, a.created_date)
    FROM public.transact_anpr_capture a WHERE a.site_id = s.site_id AND a.session_id = s.id ORDER BY a.created_date DESC LIMIT 1)
  UNION ALL (SELECT 'AXLE', a.id, COALESCE(a.captured_at, a.created_date)
    FROM public.transact_axle_capture a WHERE a.site_id = s.site_id AND a.session_id = s.id ORDER BY a.created_date DESC LIMIT 1)
  UNION ALL (SELECT 'WIM', w.id, w.created_date
    FROM public.transact_weighing w WHERE w.site_id = s.site_id AND w.session_id = s.id ORDER BY w.created_date DESC LIMIT 1)
  UNION ALL (SELECT 'CCTV', c.id, c.created_date
    FROM public.transact_cctv c WHERE c.site_id = s.site_id AND c.session_id = s.id ORDER BY c.created_date DESC LIMIT 1)
  UNION ALL (SELECT 'DIMENSION', d.id, d.created_date
    FROM public.transact_dimension d WHERE d.site_id = s.site_id AND d.session_id = s.id ORDER BY d.created_date DESC LIMIT 1)
) source(source_type, record_id, received_at)
ON CONFLICT (site_id, session_id, source_type) DO NOTHING;

-- Ensure all five source-state rows exist even when no device record was received.
INSERT INTO public.transact_session_source (
  site_id, session_id, source_type, source_mode, source_status, created_by, created_date
)
SELECT s.site_id, s.id, source_type,
       CASE WHEN COALESCE(s.is_dummy, false) THEN 'DUMMY' ELSE 'REAL' END,
       'PENDING', CASE WHEN actor.id IS NOT NULL THEN s.created_by END,
       COALESCE(s.created_date, now())
FROM public.transact_wim_session s
LEFT JOIN public.master_user actor ON actor.id = s.created_by
CROSS JOIN unnest(ARRAY['ANPR','AXLE','WIM','CCTV','DIMENSION']) source_type
ON CONFLICT (site_id, session_id, source_type) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.transact_vehicle_revision (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id uuid NOT NULL,
  vehicle_actual_id uuid NOT NULL,
  revision_no int NOT NULL,
  reason text,
  changed_fields text[] NOT NULL DEFAULT '{}'::text[],
  before_data jsonb NOT NULL,
  after_data jsonb NOT NULL,
  changed_by uuid NOT NULL,
  changed_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_vehicle_revision_no UNIQUE (vehicle_actual_id, revision_no),
  CONSTRAINT ck_vehicle_revision_no CHECK (revision_no > 0),
  CONSTRAINT fk_vehicle_revision_site FOREIGN KEY (site_id) REFERENCES public.master_site(id) ON DELETE RESTRICT,
  CONSTRAINT fk_vehicle_revision_actual FOREIGN KEY (vehicle_actual_id) REFERENCES public.transact_vehicle_actual(id) ON DELETE CASCADE,
  CONSTRAINT fk_vehicle_revision_actor FOREIGN KEY (changed_by) REFERENCES public.master_user(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_vehicle_revision_actual_changed
  ON public.transact_vehicle_revision (vehicle_actual_id, changed_at DESC);

DROP TRIGGER IF EXISTS trg_session_source_updated_date ON public.transact_session_source;
CREATE TRIGGER trg_session_source_updated_date
BEFORE UPDATE ON public.transact_session_source
FOR EACH ROW EXECUTE FUNCTION public.set_updated_timestamp();

CREATE OR REPLACE FUNCTION public.prevent_vehicle_revision_change()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'transact_vehicle_revision is immutable';
END;
$$;

DROP TRIGGER IF EXISTS trg_vehicle_revision_immutable ON public.transact_vehicle_revision;
CREATE TRIGGER trg_vehicle_revision_immutable
BEFORE UPDATE OR DELETE ON public.transact_vehicle_revision
FOR EACH ROW EXECUTE FUNCTION public.prevent_vehicle_revision_change();

CREATE UNIQUE INDEX IF NOT EXISTS uq_wim_session_id_site
  ON public.transact_wim_session (id, site_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_vehicle_actual_id_site
  ON public.transact_vehicle_actual (id, site_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_active_wim_session_per_site
  ON public.transact_wim_session (site_id)
  WHERE status IN ('STARTED', 'IN_PROGRESS') AND COALESCE(is_deleted, false) = false;
CREATE UNIQUE INDEX IF NOT EXISTS uq_vehicle_actual_site_session
  ON public.transact_vehicle_actual (site_id, session_id)
  WHERE session_id IS NOT NULL;

DO $$
DECLARE
  child_table text;
  constraint_name text;
BEGIN
  FOREACH child_table IN ARRAY ARRAY[
    'transact_anpr_capture', 'transact_axle_capture', 'transact_cctv',
    'transact_dimension', 'transact_weighing', 'transact_vehicle_actual'
  ] LOOP
    constraint_name := 'fk_' || child_table || '_session_site';
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = constraint_name) THEN
      EXECUTE format(
        'ALTER TABLE public.%I ADD CONSTRAINT %I FOREIGN KEY (session_id, site_id) REFERENCES public.transact_wim_session(id, site_id) ON DELETE RESTRICT',
        child_table, constraint_name
      );
    END IF;
  END LOOP;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_transact_session_source_session_site') THEN
    ALTER TABLE public.transact_session_source ADD CONSTRAINT fk_transact_session_source_session_site
      FOREIGN KEY (session_id, site_id)
      REFERENCES public.transact_wim_session(id, site_id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_vehicle_revision_actual_site') THEN
    ALTER TABLE public.transact_vehicle_revision ADD CONSTRAINT fk_vehicle_revision_actual_site
      FOREIGN KEY (vehicle_actual_id, site_id)
      REFERENCES public.transact_vehicle_actual(id, site_id) ON DELETE CASCADE;
  END IF;
END $$;

ALTER TABLE public.transact_anpr_capture
  DROP CONSTRAINT IF EXISTS transact_anpr_capture_external_id_key;
ALTER TABLE public.transact_axle_capture
  DROP CONSTRAINT IF EXISTS transact_axle_capture_external_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS uq_anpr_external_site_device
  ON public.transact_anpr_capture (site_id, COALESCE(camera_id, ''), external_id)
  WHERE external_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_axle_external_site_device
  ON public.transact_axle_capture (site_id, COALESCE(camera_id, ''), external_id)
  WHERE external_id IS NOT NULL;

COMMENT ON TABLE public.transact_session_source IS
  'Independent per-device source state for a WIM session; missing data is a valid timeout/failed outcome.';
COMMENT ON COLUMN public.transact_vehicle_actual.completeness_status IS
  'EMPTY, PARTIAL, or COMPLETE based on received device source records.';
COMMENT ON COLUMN public.transact_vehicle_actual.missing_sources IS
  'Source types not received when vehicle_actual was finalized; fields remain editable during verification.';
COMMENT ON TABLE public.transact_vehicle_revision IS
  'Immutable before/after audit snapshots for user corrections during verification.';

COMMIT;
