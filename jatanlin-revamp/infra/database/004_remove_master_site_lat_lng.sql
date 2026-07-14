-- Site coordinates are intentionally not stored on master_site because devices can be portable.
-- Per-enforcement coordinates live on transact_vehicle_actual.location_lat/location_lng.

ALTER TABLE public.master_site
  DROP COLUMN IF EXISTS site_lat,
  DROP COLUMN IF EXISTS site_lng;
