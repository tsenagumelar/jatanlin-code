\set admin_username `echo ${ADMIN_USERNAME:-admin}`
\set admin_password `echo ${ADMIN_PASSWORD:-admin123}`
\set admin_email `echo ${ADMIN_EMAIL:-admin@datacenter.local}`
\set admin_full_name `echo ${ADMIN_FULL_NAME:-Data Center Administrator}`
\set admin_badge_no `echo ${ADMIN_BADGE_NO:-ADM-001}`

CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO public.master_role (code, role_name, description, is_active, is_deleted)
VALUES
  ('MRL-ADMIN', 'ADMIN', 'Full access administrator role', true, false),
  ('MRL-OPERATOR', 'OPERATOR', 'Operator role for daily operations', true, false)
ON CONFLICT (code) DO UPDATE
SET role_name = EXCLUDED.role_name,
    description = EXCLUDED.description,
    is_active = true,
    is_deleted = false,
    updated_at = now();

WITH admin_role AS (
  SELECT id
  FROM public.master_role
  WHERE code = 'MRL-ADMIN'
    AND is_deleted = false
  LIMIT 1
)
INSERT INTO public.master_user (
  code,
  username,
  email,
  password_hash,
  full_name,
  badge_no,
  role_id,
  is_active,
  is_deleted
)
SELECT
  'MUS-ADMIN',
  :'admin_username',
  :'admin_email',
  crypt(:'admin_password', gen_salt('bf')),
  :'admin_full_name',
  :'admin_badge_no',
  admin_role.id,
  true,
  false
FROM admin_role
ON CONFLICT (username) DO UPDATE
SET email = EXCLUDED.email,
    password_hash = EXCLUDED.password_hash,
    full_name = EXCLUDED.full_name,
    badge_no = EXCLUDED.badge_no,
    role_id = EXCLUDED.role_id,
    is_active = true,
    is_deleted = false,
    updated_at = now();

WITH operator_role AS (
  SELECT id
  FROM public.master_role
  WHERE code = 'MRL-OPERATOR'
    AND is_deleted = false
  LIMIT 1
)
INSERT INTO public.master_user (
  code,
  username,
  email,
  password_hash,
  full_name,
  badge_no,
  role_id,
  is_active,
  is_deleted
)
SELECT
  'MUS-OPERATOR',
  'operator',
  'operator@datacenter.local',
  crypt('operator123', gen_salt('bf')),
  'Data Center Operator',
  'OPR-001',
  operator_role.id,
  true,
  false
FROM operator_role
ON CONFLICT (username) DO UPDATE
SET email = EXCLUDED.email,
    password_hash = EXCLUDED.password_hash,
    full_name = EXCLUDED.full_name,
    badge_no = EXCLUDED.badge_no,
    role_id = EXCLUDED.role_id,
    is_active = true,
    is_deleted = false,
    updated_at = now();

UPDATE public.master_user
SET is_active = false,
    is_deleted = true,
    updated_at = now()
WHERE username NOT IN (:'admin_username', 'operator');

UPDATE public.master_role
SET is_active = false,
    is_deleted = true,
    updated_at = now()
WHERE code NOT IN ('MRL-ADMIN', 'MRL-OPERATOR');
