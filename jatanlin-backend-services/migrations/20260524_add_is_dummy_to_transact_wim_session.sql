-- Add session-level dummy mode toggle.
ALTER TABLE public.transact_wim_session
  ADD COLUMN IF NOT EXISTS is_dummy boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.transact_wim_session.is_dummy IS
  'If true, services process this session using dummy data instead of real device/FTP sources';
