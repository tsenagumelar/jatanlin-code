INSERT INTO public.master_site (
  id, code, site_name, site_location, site_region, site_address, site_city,
  site_province, site_timezone, contact_name, contact_phone,
  default_latitude, default_longitude, operational_status, is_active, is_deleted
)
VALUES (
  :'site_id', :'site_code', :'site_name', NULLIF(:'site_location', ''),
  NULLIF(:'site_region', ''), NULLIF(:'site_address', ''), NULLIF(:'site_city', ''),
  NULLIF(:'site_province', ''), :'site_timezone', NULLIF(:'site_contact_name', ''),
  NULLIF(:'site_contact_phone', ''), :'site_latitude', :'site_longitude',
  'offline', true, false
)
ON CONFLICT (code) DO UPDATE
SET site_name = EXCLUDED.site_name,
    site_location = EXCLUDED.site_location,
    site_region = EXCLUDED.site_region,
    site_address = EXCLUDED.site_address,
    site_city = EXCLUDED.site_city,
    site_province = EXCLUDED.site_province,
    site_timezone = EXCLUDED.site_timezone,
    contact_name = EXCLUDED.contact_name,
    contact_phone = EXCLUDED.contact_phone,
    default_latitude = EXCLUDED.default_latitude,
    default_longitude = EXCLUDED.default_longitude,
    is_active = true,
    is_deleted = false,
    updated_date = now();
