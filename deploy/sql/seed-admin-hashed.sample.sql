-- Sample admin seed for Hasura/PostgreSQL master_user.
-- Password: Admin@12345
-- Hash verified with Go bcrypt.CompareHashAndPassword.

WITH admin_role AS (
  SELECT id
  FROM public.master_role
  WHERE role_name = 'ADMIN'
    AND COALESCE(is_deleted, false) = false
  ORDER BY created_date ASC NULLS LAST
  LIMIT 1
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
  'admin',
  '$2a$10$gPJsxFC1Kc2nBg0SO2kv8.Zxuikaf6ctusw1r78bi8QnmnWUztZBi',
  'Default Administrator',
  'ADM-001',
  NULL,
  'admin@jatanlin.local',
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

