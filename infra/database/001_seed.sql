CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO public.master_role (code, role_name, description, is_active, is_deleted)
VALUES
  ('MRL-ADMIN', 'ADMIN', 'Full access administrator role', true, false),
  ('MRL-OPERATOR', 'OPERATOR', 'Operator role for daily weighing operations', true, false)
ON CONFLICT (code) DO UPDATE
SET role_name = EXCLUDED.role_name,
    description = EXCLUDED.description,
    is_active = true,
    is_deleted = false,
    updated_date = now();

WITH canonical_roles AS (
  SELECT
    (SELECT id FROM public.master_role WHERE code = 'MRL-ADMIN' LIMIT 1) AS admin_role_id,
    (SELECT id FROM public.master_role WHERE code = 'MRL-OPERATOR' LIMIT 1) AS operator_role_id
)
UPDATE public.master_user u
SET role_id = CASE
      WHEN lower(r.role_name) LIKE '%admin%' OR lower(r.code) LIKE '%admin%' THEN canonical_roles.admin_role_id
      ELSE canonical_roles.operator_role_id
    END,
    updated_date = now()
FROM public.master_role r, canonical_roles
WHERE u.role_id = r.id
  AND r.code NOT IN ('MRL-ADMIN', 'MRL-OPERATOR');

DELETE FROM public.master_role
WHERE code NOT IN ('MRL-ADMIN', 'MRL-OPERATOR');

INSERT INTO public.master_site (
  id,
  code,
  site_name,
  site_location,
  site_region,
  site_address,
  site_city,
  site_province,
  site_timezone,
  contact_name,
  contact_phone,
  operational_status,
  description,
  is_active,
  is_deleted
)
VALUES
  (:'site_id', :'site_code', :'site_name', :'site_location', :'site_region', :'site_address', :'site_city', :'site_province', :'site_timezone', :'site_contact_name', :'site_contact_phone', 'offline', 'Primary local revamp site', true, false)
ON CONFLICT (code) DO UPDATE
SET id = EXCLUDED.id,
    site_name = EXCLUDED.site_name,
    site_location = EXCLUDED.site_location,
    site_region = EXCLUDED.site_region,
    site_address = EXCLUDED.site_address,
    site_city = EXCLUDED.site_city,
    site_province = EXCLUDED.site_province,
    site_timezone = EXCLUDED.site_timezone,
    contact_name = EXCLUDED.contact_name,
    contact_phone = EXCLUDED.contact_phone,
    description = EXCLUDED.description,
    is_active = true,
    is_deleted = false,
    updated_date = now();

UPDATE public.master_site
SET is_active = false,
    is_deleted = true,
    updated_date = now()
WHERE code IN ('JTN-LOCAL-02');

INSERT INTO public.master_device_type (code, type_name, description, is_active, is_deleted)
VALUES
  ('MDT-WIM', 'WIM', 'Weigh in Motion controller or scale bridge integration', true, false),
  ('MDT-ANPR', 'ANPR', 'Automatic Number Plate Recognition camera', true, false),
  ('MDT-AXLE', 'AXLE', 'Axle counter or vehicle axle classifier', true, false),
  ('MDT-CCTV', 'CCTV', 'Evidence and monitoring camera', true, false),
  ('MDT-GATEWAY', 'GATEWAY', 'Local network gateway or edge computer', true, false),
  ('MDT-LED', 'LED', 'Outdoor LED display panel', true, false)
ON CONFLICT (code) DO UPDATE
SET type_name = EXCLUDED.type_name,
    description = EXCLUDED.description,
    is_active = true,
    is_deleted = false,
    updated_date = now();

INSERT INTO public.master_vehicle_class (
  code,
  "type",
  description,
  total_axle,
  class_2_weight,
  class_3_weight,
  length,
  width,
  height,
  is_active,
  is_deleted
)
VALUES
  ('VC-001', 'Golongan I', 'Sedan, jeep, pickup, bus kecil, and light vehicle', 2, 8000.00, 12000.00, 5.20, 2.10, 2.30, true, false),
  ('VC-002', 'Golongan II', 'Truck two axle or medium bus', 2, 16000.00, 18000.00, 8.50, 2.50, 3.50, true, false),
  ('VC-003', 'Golongan III', 'Truck three axle', 3, 22000.00, 25000.00, 12.00, 2.60, 4.00, true, false),
  ('VC-004', 'Golongan IV', 'Truck four axle', 4, 30000.00, 32000.00, 16.00, 2.60, 4.20, true, false),
  ('VC-005', 'Golongan V', 'Truck five axle or more', 5, 40000.00, 45000.00, 20.00, 2.60, 4.30, true, false)
ON CONFLICT (code) DO UPDATE
SET "type" = EXCLUDED."type",
    description = EXCLUDED.description,
    total_axle = EXCLUDED.total_axle,
    class_2_weight = EXCLUDED.class_2_weight,
    class_3_weight = EXCLUDED.class_3_weight,
    length = EXCLUDED.length,
    width = EXCLUDED.width,
    height = EXCLUDED.height,
    is_active = true,
    is_deleted = false,
    updated_date = now();

INSERT INTO public.master_config (code, config_type, config_key, config_value, description, sort_order, is_active, is_deleted)
VALUES
  ('MCF-SITE-CODE', 'SITE', 'DEFAULT_SITE_CODE', :'site_code', 'Default local site code', 10, true, false),
  ('MCF-SITE-NAME', 'SITE', 'DEFAULT_SITE_NAME', :'site_name', 'Default local site name', 20, true, false),
  ('MCF-DEFAULT-LANE', 'OPERATION', 'DEFAULT_LANE', 'LANE-01', 'Default operational lane', 30, true, false),
  ('MCF-SESSION-WINDOW', 'OPERATION', 'SESSION_WINDOW_SECONDS', '600', 'Default WIM session matching window', 40, true, false),
  ('MCF-DEVICE-TIMEOUT', 'DEVICE', 'DEVICE_CHECK_TIMEOUT_MS', '3000', 'Default device healthcheck timeout', 50, true, false),
  ('MCF-ANPR-BUCKET', 'STORAGE', 'ANPR_BUCKET', 'anpr', 'Default ANPR object storage bucket', 60, true, false),
  ('MCF-AXLE-BUCKET', 'STORAGE', 'AXLE_BUCKET', 'axle', 'Default AXLE object storage bucket', 70, true, false),
  ('MCF-ATTACHMENT-BUCKET', 'STORAGE', 'ATTACHMENT_BUCKET', 'attachment', 'Default attachment object storage bucket', 80, true, false)
ON CONFLICT (config_type, config_key) DO UPDATE
SET config_value = EXCLUDED.config_value,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order,
    is_active = true,
    is_deleted = false,
    updated_date = now();

INSERT INTO public.system_runtime_config (
  config_group,
  config_key,
  config_value,
  value_type,
  label,
  description,
  is_secret,
  is_runtime_editable,
  sort_order,
  is_active,
  is_deleted
)
VALUES
  ('SITE', 'SITE_ID', :'site_id', 'string', 'Site ID', 'Unique UUID for this operating site', false, true, 1, true, false),
  ('SITE', 'SITE_CODE', :'site_code', 'string', 'Site Code', 'Site code used by local and central systems', false, true, 2, true, false),
  ('SITE', 'SITE_NAME', :'site_name', 'string', 'Site Name', 'Human readable site name', false, true, 3, true, false),
  ('SERVICE', 'NATS_URL', 'nats://nats:4222', 'url', 'NATS URL', 'Docker NATS endpoint for queue/cache integration', false, true, 10, true, false),
  ('ANPR_FTP', 'ANPR_FTP_HOST', 'localhost:10021', 'string', 'ANPR FTP Host', 'Local FTP endpoint for ANPR watcher', false, true, 20, true, false),
  ('ANPR_FTP', 'ANPR_FTP_USER', 'ftpuser', 'string', 'ANPR FTP User', 'Local FTP username for ANPR watcher', false, true, 30, true, false),
  ('ANPR_FTP', 'ANPR_FTP_PASS', 'ftppass', 'password', 'ANPR FTP Password', 'Local FTP password for ANPR watcher', true, true, 40, true, false),
  ('ANPR_FTP', 'ANPR_FTP_DIR', '/anpr', 'path', 'ANPR FTP Directory', 'Local FTP directory for ANPR files', false, true, 50, true, false),
  ('AXLE_FTP', 'AXLE_FTP_HOST', 'localhost:10021', 'string', 'AXLE FTP Host', 'Local FTP endpoint for AXLE watcher', false, true, 60, true, false),
  ('AXLE_FTP', 'AXLE_FTP_USER', 'ftpuser', 'string', 'AXLE FTP User', 'Local FTP username for AXLE watcher', false, true, 70, true, false),
  ('AXLE_FTP', 'AXLE_FTP_PASS', 'ftppass', 'password', 'AXLE FTP Password', 'Local FTP password for AXLE watcher', true, true, 80, true, false),
  ('AXLE_FTP', 'AXLE_FTP_DIR', '/axle', 'path', 'AXLE FTP Directory', 'Local FTP directory for AXLE files', false, true, 90, true, false),
  ('MINIO', 'ANPR_MINIO_ENDPOINT', 'minio:9000', 'string', 'ANPR MinIO Endpoint', 'Docker MinIO endpoint for ANPR bucket', false, true, 100, true, false),
  ('MINIO', 'ANPR_MINIO_ACCESS_KEY', 'admin', 'string', 'ANPR MinIO Access Key', 'Local MinIO access key for ANPR bucket', false, true, 110, true, false),
  ('MINIO', 'ANPR_MINIO_SECRET_KEY', 'admin12345', 'password', 'ANPR MinIO Secret Key', 'Local MinIO secret key for ANPR bucket', true, true, 120, true, false),
  ('MINIO', 'ANPR_MINIO_BUCKET', 'anpr', 'string', 'ANPR MinIO Bucket', 'Local MinIO ANPR bucket', false, true, 130, true, false),
  ('MINIO', 'ANPR_MINIO_USE_SSL', 'false', 'boolean', 'ANPR MinIO SSL', 'Disable SSL for local MinIO', false, true, 140, true, false),
  ('MINIO', 'AXLE_MINIO_ENDPOINT', 'minio:9000', 'string', 'AXLE MinIO Endpoint', 'Docker MinIO endpoint for AXLE bucket', false, true, 150, true, false),
  ('MINIO', 'AXLE_MINIO_ACCESS_KEY', 'admin', 'string', 'AXLE MinIO Access Key', 'Local MinIO access key for AXLE bucket', false, true, 160, true, false),
  ('MINIO', 'AXLE_MINIO_SECRET_KEY', 'admin12345', 'password', 'AXLE MinIO Secret Key', 'Local MinIO secret key for AXLE bucket', true, true, 170, true, false),
  ('MINIO', 'AXLE_MINIO_BUCKET', 'axle', 'string', 'AXLE MinIO Bucket', 'Local MinIO AXLE bucket', false, true, 180, true, false),
  ('MINIO', 'AXLE_MINIO_USE_SSL', 'false', 'boolean', 'AXLE MinIO SSL', 'Disable SSL for local MinIO', false, true, 190, true, false),
  ('MINIO', 'ATTACHMENT_MINIO_ENDPOINT', 'minio:9000', 'string', 'Attachment MinIO Endpoint', 'Docker MinIO endpoint for attachment bucket', false, true, 200, true, false),
  ('MINIO', 'ATTACHMENT_MINIO_ACCESS_KEY', 'admin', 'string', 'Attachment MinIO Access Key', 'Local MinIO access key for attachment bucket', false, true, 210, true, false),
  ('MINIO', 'ATTACHMENT_MINIO_SECRET_KEY', 'admin12345', 'password', 'Attachment MinIO Secret Key', 'Local MinIO secret key for attachment bucket', true, true, 220, true, false),
  ('MINIO', 'ATTACHMENT_MINIO_BUCKET', 'attachment', 'string', 'Attachment MinIO Bucket', 'Local MinIO attachment bucket', false, true, 230, true, false),
  ('MINIO', 'ATTACHMENT_MINIO_USE_SSL', 'false', 'boolean', 'Attachment MinIO SSL', 'Disable SSL for local MinIO', false, true, 240, true, false),
  ('WEIGHING', 'WEIGHING_TRIGGER_URL', 'http://wb-agent:5001/ws/wim/anpr-capture', 'url', 'Weighing Trigger URL', 'Docker WB agent trigger endpoint', false, true, 250, true, false),
  ('WEIGHING', 'WEIGHING_TRIGGER_TIMEOUT_SECONDS', '60', 'number', 'Weighing Timeout Seconds', 'Timeout for weighing trigger calls', false, true, 260, true, false),
  ('WEIGHING', 'WIM_STREAM_URL', '/api/wim-live', 'url', 'WIM Live Stream URL', 'Same-origin SSE proxy endpoint for real-time WIM connection and weighing status', false, true, 270, true, false),
  ('CCTV', 'CCTV_TRIGGER_URL', 'http://cctv-streamer:8090/record', 'url', 'CCTV Trigger URL', 'Endpoint called by backend when evidence recording is needed', false, true, 280, true, false),
  ('CCTV', 'CCTV_TRIGGER_SECONDS', '30', 'number', 'CCTV Trigger Seconds', 'Recording duration in seconds', false, true, 290, true, false),
  ('VEAM', 'VEAM_PUBLIC_KEY_B64', 'nO0iENG73vxSfIx8p6uj5qa2S1SkXwk9rHEt5TyA+XA=', 'password', 'VEAM Public Key', 'Public key used to validate VEAM2 license signatures', true, true, 300, true, false),
  ('VEAM', 'VEAM_LICENSE_PATH', './data/license.veam', 'path', 'VEAM License Path', 'Local path where active license is stored', false, true, 310, true, false),
  ('VEAM', 'VEAM_HARDWARE_ID', '', 'string', 'VEAM Hardware ID', 'Optional hardware binding value for license validation', false, true, 320, true, false),
  ('VEAM', 'VEAM_USB_SCAN_PATHS', '/host/usb,/host/Volumes,/Volumes', 'string', 'VEAM USB Scan Paths', 'Comma separated mount roots used to find USB license files', false, true, 330, true, false),
  ('VEAM', 'VEAM_LOGIN_USB_CHECK_ENABLED', 'true', 'boolean', 'VEAM USB Login Fallback', 'Allow login when stored license is inactive but a valid USB license is present', false, true, 340, true, false)
ON CONFLICT (config_group, config_key) DO UPDATE
SET config_value = EXCLUDED.config_value,
    value_type = EXCLUDED.value_type,
    label = EXCLUDED.label,
    description = EXCLUDED.description,
    is_secret = EXCLUDED.is_secret,
    is_runtime_editable = EXCLUDED.is_runtime_editable,
    sort_order = EXCLUDED.sort_order,
    is_active = true,
    is_deleted = false,
    updated_date = now();

WITH device_types AS (
  SELECT type_name, id
  FROM public.master_device_type
  WHERE is_deleted = false
)
INSERT INTO public.master_device (
  code,
  device_name,
  device_type_id,
  model,
  serial_number,
  description,
  "location",
  status,
  ip_address,
  mac_address,
  is_active,
  is_deleted
)
VALUES
  ('MDV-WIM-LOCAL', 'Local WIM Controller', (SELECT id FROM device_types WHERE type_name = 'WIM'), 'WIM-SIM', 'WIM-LOCAL-001', 'Local sample WIM controller', 'Lane 1', 'ACTIVE', '10.0.43.10', NULL, true, false),
  ('MDV-ANPR-LOCAL', 'Local ANPR Camera', (SELECT id FROM device_types WHERE type_name = 'ANPR'), 'ANPR-SIM', 'ANPR-LOCAL-001', 'Local sample ANPR camera', 'Lane 1 Front', 'ACTIVE', '10.0.43.30', NULL, true, false),
  ('MDV-AXLE-LOCAL', 'Local AXLE Camera', (SELECT id FROM device_types WHERE type_name = 'AXLE'), 'AXLE-SIM', 'AXLE-LOCAL-001', 'Local sample axle camera', 'Lane 1 Side', 'ACTIVE', '10.0.43.40', NULL, true, false),
  ('MDV-CCTV-LOCAL', 'Local CCTV Camera', (SELECT id FROM device_types WHERE type_name = 'CCTV'), 'CCTV-SIM', 'CCTV-LOCAL-001', 'Local sample evidence CCTV', 'Lane 1 Overview', 'ACTIVE', '10.0.43.20', NULL, true, false),
  ('MDV-GATEWAY-LOCAL', 'Local Gateway', (SELECT id FROM device_types WHERE type_name = 'GATEWAY'), 'EDGE-SIM', 'GW-LOCAL-001', 'Local sample gateway', 'Control Room', 'ACTIVE', '10.0.43.100', NULL, true, false),
  ('MDV-LED-LOCAL', 'Local LED Display', (SELECT id FROM device_types WHERE type_name = 'LED'), 'LED-SIM', 'LED-LOCAL-001', 'Local sample LED display', 'Exit Gate', 'ACTIVE', '10.0.43.50', NULL, true, false)
ON CONFLICT (code) DO UPDATE
SET device_name = EXCLUDED.device_name,
    device_type_id = EXCLUDED.device_type_id,
    model = EXCLUDED.model,
    serial_number = EXCLUDED.serial_number,
    description = EXCLUDED.description,
    "location" = EXCLUDED."location",
    status = EXCLUDED.status,
    ip_address = EXCLUDED.ip_address,
    mac_address = EXCLUDED.mac_address,
    is_active = true,
    is_deleted = false,
    updated_date = now();

WITH admin_role AS (
  SELECT id
  FROM public.master_role
  WHERE role_name = 'ADMIN'
    AND is_deleted = false
  ORDER BY created_date ASC
  LIMIT 1
)
INSERT INTO public.master_user (
  code,
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
  'MUS-ADMIN',
  :'admin_username',
  crypt(:'admin_password', gen_salt('bf')),
  :'admin_full_name',
  :'admin_badge_no',
  NULLIF(:'admin_phone', ''),
  NULLIF(:'admin_email', ''),
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

WITH operator_role AS (
  SELECT id
  FROM public.master_role
  WHERE role_name = 'OPERATOR'
    AND is_deleted = false
  ORDER BY created_date ASC
  LIMIT 1
)
INSERT INTO public.master_user (
  code,
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
  'MUS-OPERATOR',
  'operator',
  crypt('operator123', gen_salt('bf')),
  'Local Operator',
  'OPR-001',
  NULL,
  'operator@local.test',
  operator_role.id,
  true,
  false
FROM operator_role
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

DELETE FROM public.master_user
WHERE username IN ('admin@mampang.local', 'super', 'superadmin', 'supervisor', 'operatorsystem');

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
VALUES
  (
    :'admin_username',
    COALESCE(NULLIF(:'admin_email', ''), :'admin_username' || '@local'),
    crypt(:'admin_password', gen_salt('bf')),
    'admin',
    true,
    now()
  ),
  (
    'operator',
    'operator@local.test',
    crypt('operator123', gen_salt('bf')),
    'operator',
    true,
    now()
  )
ON CONFLICT (username) DO UPDATE
SET email = EXCLUDED.email,
    password = EXCLUDED.password,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = now();

DELETE FROM public.users
WHERE username NOT IN (:'admin_username', 'operator');
