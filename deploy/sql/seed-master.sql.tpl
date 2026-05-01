CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO public.master_role (role_name, description, is_active, is_deleted)
VALUES ('ADMIN', 'Default administrator role', true, false)
ON CONFLICT DO NOTHING;

INSERT INTO public.master_site (code, site_name, site_location, site_region, description, is_active, is_deleted)
VALUES ('${SITE_CODE}', '${SITE_NAME}', '${SERVICE_SITE_LOCATION}', '${SITE_REGION}', 'Seeded by one-click deployment', true, false)
ON CONFLICT (code) DO UPDATE
SET site_name = EXCLUDED.site_name,
    site_location = EXCLUDED.site_location,
    site_region = EXCLUDED.site_region,
    is_active = true,
    is_deleted = false,
    updated_date = now();

WITH admin_role AS (
  SELECT id FROM public.master_role WHERE role_name = 'ADMIN' AND is_deleted = false ORDER BY created_date ASC LIMIT 1
)
INSERT INTO public.master_user (
  username,
  password_hash,
  full_name,
  badge_no,
  phone_number,
  email,
  role_id,
  is_active,
  is_deleted
)
SELECT
  '${DEFAULT_ADMIN_USERNAME}',
  crypt('${DEFAULT_ADMIN_PASSWORD}', gen_salt('bf')),
  '${DEFAULT_ADMIN_FULL_NAME}',
  '${DEFAULT_ADMIN_BADGE_NO}',
  NULLIF('${DEFAULT_ADMIN_PHONE}', ''),
  NULLIF('${DEFAULT_ADMIN_EMAIL}', ''),
  admin_role.id,
  true,
  false
FROM admin_role
ON CONFLICT (username) DO UPDATE
SET password_hash = EXCLUDED.password_hash,
    full_name = EXCLUDED.full_name,
    badge_no = EXCLUDED.badge_no,
    phone_number = EXCLUDED.phone_number,
    email = EXCLUDED.email,
    role_id = EXCLUDED.role_id,
    is_active = true,
    is_deleted = false,
    updated_date = now();

-- Legacy auth table used by current backend login endpoint.
CREATE TABLE IF NOT EXISTS public.users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO public.users (username, email, password, role, is_active, updated_at)
VALUES (
  '${DEFAULT_ADMIN_USERNAME}',
  COALESCE(NULLIF('${DEFAULT_ADMIN_EMAIL}', ''), '${DEFAULT_ADMIN_USERNAME}@local'),
  crypt('${DEFAULT_ADMIN_PASSWORD}', gen_salt('bf')),
  'admin',
  true,
  now()
)
ON CONFLICT (username) DO UPDATE
SET email = EXCLUDED.email,
    password = EXCLUDED.password,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = now();
