-- Runtime configuration maintained from v3 System > Configuration & Device.
-- Track this table in Hasura so it is exposed as system_runtime_config.

CREATE TABLE IF NOT EXISTS public.system_runtime_config (
	id uuid NOT NULL DEFAULT uuid_generate_v4(),
	config_group varchar(100) NOT NULL,
	config_key varchar(150) NOT NULL,
	config_value text NULL,
	value_type varchar(30) NOT NULL DEFAULT 'string',
	label varchar(150) NOT NULL,
	description text NULL,
	is_secret bool NOT NULL DEFAULT false,
	is_runtime_editable bool NOT NULL DEFAULT true,
	sort_order int4 NOT NULL DEFAULT 0,
	is_active bool NOT NULL DEFAULT true,
	is_deleted bool NOT NULL DEFAULT false,
	created_by uuid NULL,
	created_date timestamptz NOT NULL DEFAULT now(),
	updated_by uuid NULL,
	updated_date timestamptz NOT NULL DEFAULT now(),
	CONSTRAINT system_runtime_config_pkey PRIMARY KEY (id),
	CONSTRAINT system_runtime_config_group_key_key UNIQUE (config_group, config_key),
	CONSTRAINT system_runtime_config_value_type_check CHECK (
		value_type IN ('string', 'number', 'boolean', 'url', 'password', 'path')
	)
);

CREATE INDEX IF NOT EXISTS idx_system_runtime_config_group
	ON public.system_runtime_config USING btree (config_group, sort_order);

CREATE INDEX IF NOT EXISTS idx_system_runtime_config_key
	ON public.system_runtime_config USING btree (config_key);

INSERT INTO public.system_runtime_config
	(config_group, config_key, config_value, value_type, label, description, is_secret, sort_order)
VALUES
	('SITE', 'SITE_ID', 'e1123daf-a4db-4ee1-88da-ba9bff382f45', 'string', 'Site ID', 'Unique UUID for this operating site.', false, 10),
	('SITE', 'SITE_CODE', 'MST-25-00001', 'string', 'Site Code', 'Site code used by local and central systems.', false, 20),
	('SITE', 'SITE_NAME', 'Mampang', 'string', 'Site Name', 'Human readable site name.', false, 30),
	('SITE', 'SITE_LOCATION', 'Central Office', 'string', 'Site Location', 'Site location label shown in the UI.', false, 40),
	('SITE', 'SITE_REGION', 'Default', 'string', 'Site Region', 'Regional grouping for reporting and synchronization.', false, 50),

	('API', 'API_PORT', '4000', 'number', 'API Port', 'Port used by the local backend API service.', false, 110),
	('API', 'AUTH_ENABLED', 'false', 'boolean', 'Authorization Enabled', 'Enable backend JWT authorization enforcement.', false, 120),
	('API', 'JWT_SECRET', '', 'password', 'JWT Secret', 'Secret used to sign backend JWT tokens.', true, 130),

	('SERVICE', 'SERVICE', 'api', 'string', 'Service Role', 'Backend process role: api, anpr-watcher, axle-watcher, or cctv-streamer.', false, 210),
	('SERVICE', 'SYNC_ENABLED', 'false', 'boolean', 'Central Sync Enabled', 'Enable synchronization to central database.', false, 220),
	('SERVICE', 'NATS_URL', 'nats://51.79.173.213:4222', 'url', 'NATS URL', 'NATS broker URL used by queue workers.', false, 230),

	('DEVICE_IP', 'WIM_IP', '10.0.43.10', 'string', 'WIM IP', 'Weight in Motion device IP or hostname.', false, 310),
	('DEVICE_IP', 'ANPR_IP', '10.0.43.30', 'string', 'ANPR Camera IP', 'ANPR camera IP or hostname.', false, 320),
	('DEVICE_IP', 'AXLE_IP', '10.0.43.40', 'string', 'AXLE/VAC IP', 'Axle counting camera or VAC device IP.', false, 330),
	('DEVICE_IP', 'CCTV_IP', '10.0.43.20', 'string', 'CCTV Camera IP', 'CCTV camera IP or hostname.', false, 340),
	('DEVICE_IP', 'GATEWAY_IP', '10.0.43.100', 'string', 'Gateway IP', 'Router, modem, or network gateway IP.', false, 350),

	('ANPR_FTP', 'ANPR_FTP_HOST', '10.0.43.100:10021', 'string', 'ANPR FTP Host', 'FTP host and port for ANPR files.', false, 410),
	('ANPR_FTP', 'ANPR_FTP_USER', 'ftpuser', 'string', 'ANPR FTP Username', 'Username for ANPR FTP access.', false, 420),
	('ANPR_FTP', 'ANPR_FTP_PASS', '', 'password', 'ANPR FTP Password', 'Password for ANPR FTP access.', true, 430),
	('ANPR_FTP', 'ANPR_FTP_DIR', '/ftp/ftpuser/anpr/', 'path', 'ANPR FTP Directory', 'Directory where ANPR XML/image files are stored.', false, 440),
	('ANPR_FTP', 'ANPR_FTP_INTERVAL_SEC', '5', 'number', 'ANPR FTP Interval', 'Polling interval in seconds for ANPR watcher.', false, 450),
	('ANPR_FTP', 'ANPR_DUMMY_ENABLED', 'true', 'boolean', 'ANPR Dummy Enabled', 'Use dummy ANPR input instead of physical integration.', false, 460),

	('AXLE_FTP', 'AXLE_FTP_HOST', '10.0.43.100:10021', 'string', 'AXLE FTP Host', 'FTP host and port for axle capture files.', false, 510),
	('AXLE_FTP', 'AXLE_FTP_USER', 'ftpuser', 'string', 'AXLE FTP Username', 'Username for axle FTP access.', false, 520),
	('AXLE_FTP', 'AXLE_FTP_PASS', '', 'password', 'AXLE FTP Password', 'Password for axle FTP access.', true, 530),
	('AXLE_FTP', 'AXLE_FTP_DIR', '/ftp/ftpuser/axle/', 'path', 'AXLE FTP Directory', 'Directory where axle XML/image files are stored.', false, 540),
	('AXLE_FTP', 'AXLE_FTP_INTERVAL_SEC', '5', 'number', 'AXLE FTP Interval', 'Polling interval in seconds for axle watcher.', false, 550),
	('AXLE_FTP', 'AXLE_DUMMY_ENABLED', 'true', 'boolean', 'AXLE Dummy Enabled', 'Use dummy axle input instead of physical integration.', false, 560),

	('MINIO', 'ANPR_MINIO_ENDPOINT', '51.79.173.213:9000', 'string', 'ANPR MinIO Endpoint', 'Object storage endpoint for ANPR assets.', false, 610),
	('MINIO', 'ANPR_MINIO_ACCESS_KEY', 'admin', 'string', 'ANPR MinIO Access Key', 'Access key for ANPR object storage.', false, 620),
	('MINIO', 'ANPR_MINIO_SECRET_KEY', '', 'password', 'ANPR MinIO Secret Key', 'Secret key for ANPR object storage.', true, 630),
	('MINIO', 'ANPR_MINIO_BUCKET', 'anpr', 'string', 'ANPR MinIO Bucket', 'Bucket for ANPR assets.', false, 640),
	('MINIO', 'ANPR_MINIO_USE_SSL', 'false', 'boolean', 'ANPR MinIO Use SSL', 'Use SSL when connecting to ANPR MinIO.', false, 650),
	('MINIO', 'AXLE_MINIO_ENDPOINT', '51.79.173.213:9000', 'string', 'AXLE MinIO Endpoint', 'Object storage endpoint for axle assets.', false, 660),
	('MINIO', 'AXLE_MINIO_ACCESS_KEY', 'admin', 'string', 'AXLE MinIO Access Key', 'Access key for axle object storage.', false, 670),
	('MINIO', 'AXLE_MINIO_SECRET_KEY', '', 'password', 'AXLE MinIO Secret Key', 'Secret key for axle object storage.', true, 680),
	('MINIO', 'AXLE_MINIO_BUCKET', 'axle', 'string', 'AXLE MinIO Bucket', 'Bucket for axle assets.', false, 690),
	('MINIO', 'AXLE_MINIO_USE_SSL', 'false', 'boolean', 'AXLE MinIO Use SSL', 'Use SSL when connecting to axle MinIO.', false, 700),
	('MINIO', 'ATTACHMENT_MINIO_ENDPOINT', '51.79.173.213:9000', 'string', 'Attachment MinIO Endpoint', 'Object storage endpoint for attachments.', false, 710),
	('MINIO', 'ATTACHMENT_MINIO_ACCESS_KEY', 'admin', 'string', 'Attachment MinIO Access Key', 'Access key for attachment object storage.', false, 720),
	('MINIO', 'ATTACHMENT_MINIO_SECRET_KEY', '', 'password', 'Attachment MinIO Secret Key', 'Secret key for attachment object storage.', true, 730),
	('MINIO', 'ATTACHMENT_MINIO_BUCKET', 'attachment', 'string', 'Attachment MinIO Bucket', 'Bucket for uploaded attachments and evidence.', false, 740),
	('MINIO', 'ATTACHMENT_MINIO_USE_SSL', 'false', 'boolean', 'Attachment MinIO Use SSL', 'Use SSL when connecting to attachment MinIO.', false, 750),

	('CCTV', 'CCTV_MODE', 'rtsp', 'string', 'CCTV Mode', 'CCTV integration mode: rtsp or onvif.', false, 710),
	('CCTV', 'CCTV_RTSP_URL', 'rtsp://admin:P@ssw0rd@10.0.43.20:554/profile1', 'url', 'CCTV RTSP URL', 'Direct RTSP URL used when CCTV mode is rtsp.', true, 720),
	('CCTV', 'ONVIF_ENDPOINT', 'http://10.0.43.20/onvif/device_service', 'url', 'ONVIF Endpoint', 'ONVIF device service endpoint.', false, 730),
	('CCTV', 'ONVIF_USERNAME', 'admin', 'string', 'ONVIF Username', 'Username for ONVIF access.', false, 740),
	('CCTV', 'ONVIF_PASSWORD', '', 'password', 'ONVIF Password', 'Password for ONVIF access.', true, 750),
	('CCTV', 'ONVIF_TIMEOUT_SECONDS', '15', 'number', 'ONVIF Timeout Seconds', 'Timeout for ONVIF calls.', false, 760),
	('CCTV', 'RECORD_SECONDS', '20', 'number', 'Record Seconds', 'Default recording duration.', false, 770),
	('CCTV', 'RECORD_DIR', './recordings', 'path', 'Record Directory', 'Local recording output directory.', false, 780),
	('CCTV', 'CCTV_HTTP_PORT', '8090', 'number', 'CCTV HTTP Port', 'Local HTTP recording API port.', false, 790),
	('CCTV', 'CCTV_TRIGGER_ENABLED', 'true', 'boolean', 'CCTV Trigger Enabled', 'Enable external CCTV recording trigger.', false, 800),
	('CCTV', 'CCTV_TRIGGER_URL', 'http://localhost:8090/record', 'url', 'CCTV Trigger URL', 'Endpoint called by backend when evidence recording is needed.', false, 810),
	('CCTV', 'CCTV_TRIGGER_SECONDS', '20', 'number', 'CCTV Trigger Seconds', 'Recording duration in seconds.', false, 820),
	('CCTV', 'CCTV_TRIGGER_DUMMY', 'true', 'boolean', 'CCTV Trigger Dummy', 'Use dummy CCTV evidence output.', false, 830),

	('DIMENSION', 'DIMENSION_ENABLED', 'true', 'boolean', 'Dimension Enabled', 'Enable vehicle dimension detection.', false, 810),
	('DIMENSION', 'DIMENSION_DUMMY_ENABLED', 'true', 'boolean', 'Dimension Dummy Enabled', 'Use dummy dimension data for testing.', false, 820),
	('DIMENSION', 'DIMENSION_THRESHOLD', '0.5', 'number', 'Dimension Threshold', 'Detection confidence threshold.', false, 830),
	('DIMENSION', 'DIMENSION_MODEL_PATH', '', 'path', 'Dimension Model Path', 'Optional path to dimension model.', false, 840),
	('DIMENSION', 'DIMENSION_PROFILE_NAME', 'anpr-empirical-profile', 'string', 'Dimension Profile Name', 'Active dimension calibration profile.', false, 850),
	('DIMENSION', 'DIMENSION_MIN_CONFIDENCE', '0.45', 'number', 'Dimension Minimum Confidence', 'Minimum confidence for dimension processing.', false, 860),
	('DIMENSION', 'DIMENSION_ENABLE_POSE_FILTER', 'true', 'boolean', 'Dimension Pose Filter', 'Enable camera pose filtering.', false, 870),

	('CALIBRATION', 'CAMERA_IMAGE_WIDTH', '2432', 'number', 'Camera Image Width', 'Operational ANPR image width in pixels.', false, 880),
	('CALIBRATION', 'CAMERA_IMAGE_HEIGHT', '2080', 'number', 'Camera Image Height', 'Operational ANPR image height in pixels.', false, 890),
	('CALIBRATION', 'CAMERA_FOCAL_LENGTH', '1000.0', 'number', 'Camera Focal Length', 'Camera focal length in pixels.', false, 900),
	('CALIBRATION', 'CAMERA_HEIGHT_METERS', '5.0', 'number', 'Camera Height Meters', 'Camera height from road surface.', false, 910),
	('CALIBRATION', 'CAMERA_TILT_ANGLE', '25.0', 'number', 'Camera Tilt Angle', 'Camera downward tilt angle in degrees.', false, 920),
	('CALIBRATION', 'CAMERA_REF_PIXEL_LENGTH', '960', 'number', 'Reference Pixel Length', 'Measured pixel length of reference object.', false, 930),
	('CALIBRATION', 'CAMERA_REF_REAL_LENGTH', '4.7', 'number', 'Reference Real Length', 'Real length of reference object in meters.', false, 940),

	('WEIGHING', 'WEIGHING_TRIGGER_URL', 'http://localhost:5000/ws/wim/anpr-capture', 'url', 'Weighing Trigger URL', 'Endpoint used to trigger weighing capture.', false, 950),
	('WEIGHING', 'WEIGHING_TRIGGER_DIRECTION', 'RIGHT', 'string', 'Weighing Direction', 'Default capture direction.', false, 960),
	('WEIGHING', 'WEIGHING_TRIGGER_TIMEOUT_SECONDS', '25', 'number', 'Weighing Timeout Seconds', 'Timeout for weighing trigger calls.', false, 970),
	('WEIGHING', 'WEIGHING_TRIGGER_SAVE', 'true', 'boolean', 'Weighing Trigger Save', 'Save capture result from weighing trigger.', false, 980),
	('WEIGHING', 'WEIGHING_TRIGGER_DUMMY', 'false', 'boolean', 'Weighing Trigger Dummy', 'Use dummy weighing trigger mode.', false, 990),

	('VEAM', 'VEAM_PUBLIC_KEY_B64', '', 'password', 'VEAM Public Key', 'Public key used to validate VEAM2 license signatures.', true, 910),
	('VEAM', 'VEAM_LICENSE_PATH', './data/license.veam', 'path', 'VEAM License Path', 'Local path where active license is stored.', false, 920),
	('VEAM', 'VEAM_HARDWARE_ID', '', 'string', 'VEAM Hardware ID', 'Optional hardware binding value for license validation.', false, 930)
ON CONFLICT (config_group, config_key) DO UPDATE SET
	label = EXCLUDED.label,
	description = EXCLUDED.description,
	value_type = EXCLUDED.value_type,
	is_secret = EXCLUDED.is_secret,
	sort_order = EXCLUDED.sort_order,
	updated_date = now();
