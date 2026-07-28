-- DROP SCHEMA public;

CREATE SCHEMA public AUTHORIZATION pg_database_owner;

COMMENT ON SCHEMA public IS 'standard public schema';
-- public.master_device_type definition

-- Drop table

-- DROP TABLE public.master_device_type;

CREATE TABLE public.master_device_type (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	code varchar(50) NOT NULL,
	type_name varchar(100) NOT NULL,
	description text NULL,
	is_active bool DEFAULT true NULL,
	is_deleted bool DEFAULT false NULL,
	created_by uuid NULL,
	created_date timestamptz DEFAULT now() NULL,
	updated_by uuid NULL,
	updated_date timestamptz DEFAULT now() NULL,
	CONSTRAINT master_device_type_code_key UNIQUE (code),
	CONSTRAINT master_device_type_pkey PRIMARY KEY (id)
);

-- Table Triggers

create trigger trigger_generate_device_type_code before
insert
    on
    public.master_device_type for each row execute function auto_generate_device_type_code();


-- public.master_role definition

-- Drop table

-- DROP TABLE public.master_role;

CREATE TABLE public.master_role (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	code varchar(50) NOT NULL,
	role_name varchar(100) NOT NULL,
	description text NULL,
	is_active bool DEFAULT true NULL,
	is_deleted bool DEFAULT false NULL,
	created_by uuid NULL,
	created_date timestamptz DEFAULT now() NULL,
	updated_by uuid NULL,
	updated_date timestamptz DEFAULT now() NULL,
	CONSTRAINT master_role_code_key UNIQUE (code),
	CONSTRAINT master_role_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_master_role_active ON public.master_role USING btree (is_active) WHERE (is_deleted = false);

-- Table Triggers

create trigger trigger_generate_role_code before
insert
    on
    public.master_role for each row execute function auto_generate_role_code();


-- public.master_site definition

-- Drop table

-- DROP TABLE public.master_site;

CREATE TABLE public.master_site (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	code varchar(50) NOT NULL, -- Unique site code identifier (e.g., SITE001, JKT-TOLL-01)
	site_name varchar(200) NOT NULL,
	site_location varchar(200) NULL,
	site_region varchar(100) NULL, -- Region/area of the site for grouping
	site_address text NULL,
	site_city varchar(100) NULL,
	site_province varchar(100) NULL,
	site_timezone varchar(64) DEFAULT 'Asia/Jakarta'::character varying NOT NULL,
	contact_name varchar(150) NULL,
	contact_phone varchar(30) NULL,
	operational_status varchar(30) DEFAULT 'offline'::character varying NOT NULL,
	last_seen_at timestamptz NULL,
	last_sync_at timestamptz NULL,
	active_operator_id uuid NULL,
	active_operator_name varchar(150) NULL,
	app_version varchar(50) NULL,
	service_version varchar(50) NULL,
	description text NULL,
	is_active bool DEFAULT true NULL,
	is_deleted bool DEFAULT false NULL,
	created_by uuid NULL,
	created_date timestamptz DEFAULT now() NULL,
	updated_by uuid NULL,
	updated_date timestamptz DEFAULT now() NULL,
	CONSTRAINT master_site_code_key UNIQUE (code),
	CONSTRAINT master_site_operational_status_check CHECK (((operational_status)::text = ANY ((ARRAY['online'::character varying, 'offline'::character varying, 'warning'::character varying, 'maintenance'::character varying])::text[]))),
	CONSTRAINT master_site_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_master_site_active ON public.master_site USING btree (is_active) WHERE (is_deleted = false);
CREATE INDEX idx_master_site_last_seen ON public.master_site USING btree (last_seen_at DESC);
CREATE INDEX idx_master_site_operational_status ON public.master_site USING btree (operational_status);
CREATE INDEX idx_master_site_region ON public.master_site USING btree (site_region);
COMMENT ON TABLE public.master_site IS 'Master data for all sites in the multi-site architecture';

-- Column comments

COMMENT ON COLUMN public.master_site.code IS 'Unique site code identifier (e.g., SITE001, JKT-TOLL-01)';
COMMENT ON COLUMN public.master_site.site_region IS 'Region/area of the site for grouping';
COMMENT ON COLUMN public.master_site.operational_status IS 'Latest site runtime status reported by the local site';
COMMENT ON COLUMN public.master_site.last_seen_at IS 'Latest heartbeat timestamp from this site';
COMMENT ON COLUMN public.master_site.last_sync_at IS 'Latest successful sync timestamp from this site';
COMMENT ON COLUMN public.master_site.active_operator_id IS 'Currently active local operator, if reported by the site runtime heartbeat';


-- public.master_vehicle_class definition

-- Drop table

-- DROP TABLE public.master_vehicle_class;

CREATE TABLE public.master_vehicle_class (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	code varchar(50) NOT NULL,
	"type" varchar(100) NOT NULL,
	description varchar(150) NOT NULL,
	total_axle int4 NOT NULL,
	class_2_weight numeric(10, 2) NOT NULL,
	class_3_weight numeric(10, 2) NOT NULL,
	length numeric(10, 2) NOT NULL,
	width numeric(10, 2) NOT NULL,
	height numeric(10, 2) NOT NULL,
	image text NULL,
	is_active bool DEFAULT true NULL,
	is_deleted bool DEFAULT false NULL,
	created_by uuid NULL,
	created_date timestamptz DEFAULT now() NOT NULL,
	updated_by uuid NULL,
	updated_date timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT ck_axle_positive CHECK (((total_axle >= 1) AND (total_axle <= 20))),
	CONSTRAINT ck_dim_positive CHECK (((length > (0)::numeric) AND (width > (0)::numeric) AND (height > (0)::numeric))),
	CONSTRAINT ck_dim_reasonable CHECK (((length <= (40)::numeric) AND (width <= (5)::numeric) AND (height <= (6)::numeric))),
	CONSTRAINT ck_weight_positive CHECK (((class_2_weight >= (0)::numeric) AND (class_3_weight >= (0)::numeric))),
	CONSTRAINT master_vehicle_class_pkey PRIMARY KEY (id),
	CONSTRAINT uq_master_vehicle_class_code UNIQUE (code),
	CONSTRAINT uq_master_vehicle_class_type UNIQUE (type)
);
CREATE INDEX idx_vehicle_class_active ON public.master_vehicle_class USING btree (is_active) WHERE (is_active = true);
CREATE INDEX idx_vehicle_class_axle ON public.master_vehicle_class USING btree (total_axle);
CREATE INDEX idx_vehicle_class_type ON public.master_vehicle_class USING btree (type);

-- Table Triggers

create trigger trg_master_vehicle_class_updated before
update
    on
    public.master_vehicle_class for each row execute function set_updated_timestamp();
create trigger trigger_generate_vehicle_class_code before
insert
    on
    public.master_vehicle_class for each row execute function auto_generate_vehicle_class_code();


-- public.master_config definition

-- Drop table

-- DROP TABLE public.master_config;

CREATE TABLE public.master_config (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	code varchar(100) NOT NULL,
	config_type varchar(100) NOT NULL,
	config_key varchar(100) NOT NULL,
	config_value varchar(255) NULL,
	description text NULL,
	sort_order int4 DEFAULT 0 NULL,
	parent_code varchar(100) NULL,
	is_active bool DEFAULT true NULL,
	is_deleted bool DEFAULT false NULL,
	created_by uuid NULL,
	created_date timestamptz DEFAULT now() NULL,
	updated_by uuid NULL,
	updated_date timestamptz DEFAULT now() NULL,
	CONSTRAINT master_config_code_key UNIQUE (code),
	CONSTRAINT master_config_config_type_config_key_key UNIQUE (config_type, config_key),
	CONSTRAINT master_config_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_master_config_parent_code ON public.master_config USING btree (parent_code);
CREATE INDEX idx_master_config_type_key ON public.master_config USING btree (config_type, config_key);

-- Table Triggers

create trigger trigger_generate_config_code before
insert
    on
    public.master_config for each row execute function auto_generate_config_code();


-- public.master_device definition

-- Drop table

-- DROP TABLE public.master_device;

CREATE TABLE public.master_device (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	code varchar(100) NOT NULL,
	device_name varchar(150) NOT NULL,
	device_type_id uuid NOT NULL,
	model varchar(100) NULL,
	serial_number varchar(100) NULL,
	description text NULL,
	"location" text NULL,
	status varchar(20) DEFAULT 'ACTIVE'::character varying NULL,
	ip_address varchar(50) NULL,
	mac_address varchar(50) NULL,
	is_active bool DEFAULT true NULL,
	is_deleted bool DEFAULT false NULL,
	created_by uuid NULL,
	created_date timestamptz DEFAULT now() NULL,
	updated_by uuid NULL,
	updated_date timestamptz DEFAULT now() NULL,
	CONSTRAINT master_device_code_key UNIQUE (code),
	CONSTRAINT master_device_pkey PRIMARY KEY (id),
	CONSTRAINT master_device_status_check CHECK (((status)::text = ANY (ARRAY[('ACTIVE'::character varying)::text, ('MAINTENANCE'::character varying)::text, ('RETIRED'::character varying)::text])))
);
CREATE INDEX idx_master_device_active ON public.master_device USING btree (is_active) WHERE (is_deleted = false);
CREATE INDEX idx_master_device_type ON public.master_device USING btree (device_type_id);

-- Table Triggers

create trigger trigger_generate_device_code before
insert
    on
    public.master_device for each row execute function auto_generate_device_code();


-- public.master_user definition

-- Drop table

-- DROP TABLE public.master_user;

CREATE TABLE public.master_user (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	code varchar(50) NOT NULL,
	username varchar(100) NOT NULL,
	password_hash text NOT NULL,
	full_name varchar(150) NOT NULL,
	badge_no varchar(50) NULL,
	phone_number varchar(30) NULL,
	email varchar(150) NULL,
	role_id uuid NOT NULL,
	profile_picture text NULL,
	is_active bool DEFAULT true NULL,
	is_deleted bool DEFAULT false NULL,
	created_by uuid NULL,
	created_date timestamptz DEFAULT now() NULL,
	updated_by uuid NULL,
	updated_date timestamptz DEFAULT now() NULL,
	CONSTRAINT master_user_code_key UNIQUE (code),
	CONSTRAINT master_user_pkey PRIMARY KEY (id),
	CONSTRAINT master_user_username_key UNIQUE (username)
);
CREATE INDEX idx_master_user_role ON public.master_user USING btree (role_id);

-- Table Triggers

create trigger trigger_generate_user_code before
insert
    on
    public.master_user for each row execute function auto_generate_user_code();


-- public.transact_anpr_capture definition

-- Drop table

-- DROP TABLE public.transact_anpr_capture;

CREATE TABLE public.transact_anpr_capture (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	external_id varchar(100) NULL,
	plate_no varchar(32) NULL,
	confidence numeric(5, 2) NULL,
	captured_at timestamptz NULL,
	location_code varchar(100) NULL,
	camera_id varchar(100) NULL,
	minio_bucket varchar(100) NULL,
	minio_date_folder varchar(8) NULL,
	minio_xml_object text NULL,
	minio_full_image_object text NULL,
	minio_plate_image_object text NULL,
	is_active bool DEFAULT true NULL,
	is_deleted bool DEFAULT false NULL,
	created_by uuid NULL,
	created_date timestamptz DEFAULT now() NULL,
	updated_by uuid NULL,
	updated_date timestamptz DEFAULT now() NULL,
	site_id uuid NOT NULL, -- Site where this capture occurred
	session_id uuid NULL, -- WIM session ID. Placeholder row may contain only id + session_id when ANPR is missing
	CONSTRAINT transact_anpr_capture_external_id_key UNIQUE (external_id),
	CONSTRAINT transact_anpr_capture_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_anpr_session ON public.transact_anpr_capture USING btree (session_id);
CREATE INDEX idx_anpr_site ON public.transact_anpr_capture USING btree (site_id);

-- Column comments

COMMENT ON COLUMN public.transact_anpr_capture.site_id IS 'Site where this capture occurred';
COMMENT ON COLUMN public.transact_anpr_capture.session_id IS 'WIM session ID. Placeholder row may contain only id + session_id when ANPR is missing';


-- public.transact_axle_capture definition

-- Drop table

-- DROP TABLE public.transact_axle_capture;

CREATE TABLE public.transact_axle_capture (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	external_id varchar(100) NULL,
	plate_no varchar(32) NULL,
	captured_at timestamptz NULL,
	camera_id varchar(100) NULL,
	length_mm int4 NULL,
	total_wheels int4 NULL,
	total_axles int4 NULL,
	vehicle_category varchar(50) NULL,
	vehicle_body_type varchar(50) NULL,
	minio_bucket varchar(100) NULL,
	minio_date_folder varchar(8) NULL,
	minio_xml_object text NULL,
	minio_image_object text NULL,
	is_active bool DEFAULT true NULL,
	is_deleted bool DEFAULT false NULL,
	created_by uuid NULL,
	created_date timestamptz DEFAULT now() NULL,
	updated_by uuid NULL,
	updated_date timestamptz DEFAULT now() NULL,
	site_id uuid NOT NULL, -- Site where this measurement occurred
	session_id uuid NULL, -- WIM session ID. Placeholder row may contain only id + session_id when AXLE is missing
	CONSTRAINT transact_axle_capture_external_id_key UNIQUE (external_id),
	CONSTRAINT transact_axle_capture_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_axle_session ON public.transact_axle_capture USING btree (session_id);
CREATE INDEX idx_axle_site ON public.transact_axle_capture USING btree (site_id);

-- Column comments

COMMENT ON COLUMN public.transact_axle_capture.site_id IS 'Site where this measurement occurred';
COMMENT ON COLUMN public.transact_axle_capture.session_id IS 'WIM session ID. Placeholder row may contain only id + session_id when AXLE is missing';


-- public.transact_cctv definition

-- Drop table

-- DROP TABLE public.transact_cctv;

CREATE TABLE public.transact_cctv (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	filename text NULL,
	filepath text NULL,
	is_active bool DEFAULT true NULL,
	is_deleted bool DEFAULT false NULL,
	created_by uuid NULL,
	created_date timestamptz DEFAULT now() NULL,
	updated_by uuid NULL,
	updated_date timestamptz DEFAULT now() NULL,
	site_id uuid NOT NULL,
	session_id uuid NULL, -- WIM session ID when this CCTV capture was processed
	CONSTRAINT transact_cctv_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_cctv_session ON public.transact_cctv USING btree (session_id);
CREATE INDEX idx_transact_cctv_site ON public.transact_cctv USING btree (site_id);

-- Column comments

COMMENT ON COLUMN public.transact_cctv.session_id IS 'WIM session ID when this CCTV capture was processed';


-- public.transact_dimension definition

-- Drop table

-- DROP TABLE public.transact_dimension;

CREATE TABLE public.transact_dimension (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	anpr_id uuid NULL,
	filepath text NULL,
	length numeric(10, 3) NULL,
	width numeric(10, 3) NULL,
	height numeric(10, 3) NULL,
	is_active bool DEFAULT true NULL,
	is_deleted bool DEFAULT false NULL,
	created_by uuid NULL,
	created_date timestamptz DEFAULT now() NULL,
	updated_by uuid NULL,
	updated_date timestamptz DEFAULT now() NULL,
	site_id uuid NOT NULL,
	session_id uuid NULL, -- WIM session ID. Placeholder row may contain only id + session_id when dimension is missing
	CONSTRAINT transact_dimension_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_dimension_session ON public.transact_dimension USING btree (session_id);
CREATE INDEX idx_transact_dimension_anpr ON public.transact_dimension USING btree (anpr_id);
CREATE INDEX idx_transact_dimension_site ON public.transact_dimension USING btree (site_id);

-- Column comments

COMMENT ON COLUMN public.transact_dimension.session_id IS 'WIM session ID. Placeholder row may contain only id + session_id when dimension is missing';


-- public.transact_vehicle_actual definition

-- Drop table

-- DROP TABLE public.transact_vehicle_actual;

CREATE TABLE public.transact_vehicle_actual (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	anpr_id uuid NULL,
	axle_id uuid NULL,
	transact_dimension_id uuid NULL,
	transact_weighing_id uuid NULL,
	actual_width numeric(10, 3) NULL,
	actual_length numeric(10, 3) NULL,
	actual_height numeric(10, 3) NULL,
	actual_weight numeric(12, 3) NULL,
	is_active bool DEFAULT true NULL,
	is_deleted bool DEFAULT false NULL,
	created_by uuid NULL,
	created_date timestamptz DEFAULT now() NULL,
	updated_by uuid NULL,
	updated_date timestamptz DEFAULT now() NULL,
	site_id uuid NOT NULL,
	actual_plat_no varchar(32) NULL,
	actual_total_axle int4 NULL,
	location_lat numeric(10, 7) NULL,
	location_lng numeric(10, 7) NULL,
	location_address text NULL,
	transact_cctv_id uuid NULL,
	session_id uuid NULL, -- WIM session ID for grouping partial source data during verification
	CONSTRAINT transact_vehicle_actual_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_transact_vehicle_actual_anpr ON public.transact_vehicle_actual USING btree (anpr_id);
CREATE INDEX idx_transact_vehicle_actual_axle ON public.transact_vehicle_actual USING btree (axle_id);
CREATE INDEX idx_transact_vehicle_actual_cctv ON public.transact_vehicle_actual USING btree (transact_cctv_id);
CREATE INDEX idx_transact_vehicle_actual_dimension ON public.transact_vehicle_actual USING btree (transact_dimension_id);
CREATE INDEX idx_transact_vehicle_actual_site ON public.transact_vehicle_actual USING btree (site_id);
CREATE INDEX idx_transact_vehicle_actual_weighing ON public.transact_vehicle_actual USING btree (transact_weighing_id);
CREATE INDEX idx_vehicle_actual_session ON public.transact_vehicle_actual USING btree (session_id);

-- Column comments

COMMENT ON COLUMN public.transact_vehicle_actual.session_id IS 'WIM session ID for grouping partial source data during verification';


-- public.transact_vehicle_status definition

-- Drop table

-- DROP TABLE public.transact_vehicle_status;

CREATE TABLE public.transact_vehicle_status (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	is_active bool DEFAULT true NULL,
	is_deleted bool DEFAULT false NULL,
	created_by uuid NULL,
	created_date timestamptz DEFAULT now() NULL,
	updated_by uuid NULL,
	updated_date timestamptz DEFAULT now() NULL,
	site_id uuid NOT NULL,
	transact_vehicle_actual_id uuid NOT NULL,
	status varchar(50) NOT NULL,
	"result" varchar(50) NULL,
	notes text NULL,
	attachment _text NULL,
	CONSTRAINT transact_vehicle_status_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_vehicle_status_actual ON public.transact_vehicle_status USING btree (transact_vehicle_actual_id);
CREATE INDEX idx_vehicle_status_site ON public.transact_vehicle_status USING btree (site_id);
CREATE INDEX idx_vehicle_status_status ON public.transact_vehicle_status USING btree (status);


-- public.transact_weighing definition

-- Drop table

-- DROP TABLE public.transact_weighing;

CREATE TABLE public.transact_weighing (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	total_axle int4 NULL,
	axle_detail jsonb NULL,
	total_weight numeric(12, 3) NULL,
	is_active bool DEFAULT true NULL,
	is_deleted bool DEFAULT false NULL,
	created_by uuid NULL,
	created_date timestamptz DEFAULT now() NULL,
	updated_by uuid NULL,
	updated_date timestamptz DEFAULT now() NULL,
	site_id uuid NOT NULL,
	session_id uuid NULL, -- WIM session ID. Placeholder row may contain only id + session_id when weighing is missing
	CONSTRAINT transact_weighing_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_transact_weighing_axle_detail_gin ON public.transact_weighing USING gin (axle_detail);
CREATE INDEX idx_transact_weighing_site ON public.transact_weighing USING btree (site_id);
CREATE INDEX idx_weighing_session ON public.transact_weighing USING btree (session_id);

-- Column comments

COMMENT ON COLUMN public.transact_weighing.session_id IS 'WIM session ID. Placeholder row may contain only id + session_id when weighing is missing';


-- public.transact_wim_session definition

-- Drop table

-- DROP TABLE public.transact_wim_session;

CREATE TABLE public.transact_wim_session (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	code varchar(50) NOT NULL, -- Unique session code identifier (e.g., WIM-2025-0001)
	session_name varchar(200) NULL,
	site_id uuid NOT NULL,
	started_at timestamptz DEFAULT now() NOT NULL, -- Timestamp when session was started
	ended_at timestamptz NULL, -- Timestamp when session was ended/completed
	status varchar(50) DEFAULT 'STARTED'::character varying NOT NULL, -- Session status: STARTED, IN_PROGRESS, COMPLETED, CANCELLED, ERROR
	total_vehicles int4 DEFAULT 0 NULL, -- Total number of vehicles expected in this session
	processed_vehicles int4 DEFAULT 0 NULL, -- Number of vehicles processed so far
	notes text NULL,
	started_by uuid NULL,
	ended_by uuid NULL,
	is_active bool DEFAULT true NULL,
	is_deleted bool DEFAULT false NULL,
	created_by uuid NULL,
	created_date timestamptz DEFAULT now() NULL,
	updated_by uuid NULL,
	updated_date timestamptz DEFAULT now() NULL,
	CONSTRAINT transact_wim_session_code_key UNIQUE (code),
	CONSTRAINT transact_wim_session_pkey PRIMARY KEY (id),
	CONSTRAINT transact_wim_session_status_check CHECK (((status)::text = ANY ((ARRAY['STARTED'::character varying, 'IN_PROGRESS'::character varying, 'COMPLETED'::character varying, 'CANCELLED'::character varying, 'ERROR'::character varying])::text[])))
);
CREATE INDEX idx_wim_session_active ON public.transact_wim_session USING btree (is_active) WHERE (is_deleted = false);
CREATE INDEX idx_wim_session_site ON public.transact_wim_session USING btree (site_id);
CREATE INDEX idx_wim_session_started_at ON public.transact_wim_session USING btree (started_at DESC);
CREATE INDEX idx_wim_session_status ON public.transact_wim_session USING btree (status);
COMMENT ON TABLE public.transact_wim_session IS 'Transaction table for tracking WIM (Weigh In Motion) process sessions';

-- Column comments

COMMENT ON COLUMN public.transact_wim_session.code IS 'Unique session code identifier (e.g., WIM-2025-0001)';
COMMENT ON COLUMN public.transact_wim_session.started_at IS 'Timestamp when session was started';
COMMENT ON COLUMN public.transact_wim_session.ended_at IS 'Timestamp when session was ended/completed';
COMMENT ON COLUMN public.transact_wim_session.status IS 'Session status: STARTED, IN_PROGRESS, COMPLETED, CANCELLED, ERROR';
COMMENT ON COLUMN public.transact_wim_session.total_vehicles IS 'Total number of vehicles expected in this session';
COMMENT ON COLUMN public.transact_wim_session.processed_vehicles IS 'Number of vehicles processed so far';

-- Table Triggers

create trigger trigger_generate_wim_session_code before
insert
    on
    public.transact_wim_session for each row
    when (((new.code is null)
        or ((new.code)::text = ''::text))) execute function auto_generate_wim_session_code();


-- public.user_login_history definition

-- Drop table

-- DROP TABLE public.user_login_history;

CREATE TABLE public.user_login_history (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	user_id uuid NOT NULL,
	login_time timestamptz DEFAULT now() NULL,
	logout_time timestamptz NULL,
	ip_address varchar(100) NULL,
	user_agent text NULL,
	device_info text NULL,
	token_id text NULL,
	is_active bool DEFAULT true NULL,
	is_deleted bool DEFAULT false NULL,
	created_by uuid NULL,
	created_date timestamptz DEFAULT now() NULL,
	updated_by uuid NULL,
	updated_date timestamptz DEFAULT now() NULL,
	CONSTRAINT user_login_history_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_login_history_time ON public.user_login_history USING btree (login_time DESC);
CREATE INDEX idx_login_history_user ON public.user_login_history USING btree (user_id);


-- public.master_config foreign keys

ALTER TABLE public.master_config ADD CONSTRAINT master_config_parent_code_fkey FOREIGN KEY (parent_code) REFERENCES public.master_config(code) ON DELETE SET NULL ON UPDATE CASCADE;


-- public.master_device foreign keys

ALTER TABLE public.master_device ADD CONSTRAINT master_device_device_type_id_fkey FOREIGN KEY (device_type_id) REFERENCES public.master_device_type(id) ON DELETE RESTRICT ON UPDATE CASCADE;


-- public.master_user foreign keys

ALTER TABLE public.master_user ADD CONSTRAINT master_user_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.master_role(id) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE public.master_site ADD CONSTRAINT master_site_active_operator_id_fkey FOREIGN KEY (active_operator_id) REFERENCES public.master_user(id) ON DELETE SET NULL ON UPDATE CASCADE;


-- public.transact_anpr_capture foreign keys

ALTER TABLE public.transact_anpr_capture ADD CONSTRAINT fk_anpr_session FOREIGN KEY (session_id) REFERENCES public.transact_wim_session(id) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE public.transact_anpr_capture ADD CONSTRAINT fk_anpr_site FOREIGN KEY (site_id) REFERENCES public.master_site(id) ON DELETE RESTRICT ON UPDATE CASCADE;


-- public.transact_axle_capture foreign keys

ALTER TABLE public.transact_axle_capture ADD CONSTRAINT fk_axle_session FOREIGN KEY (session_id) REFERENCES public.transact_wim_session(id) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE public.transact_axle_capture ADD CONSTRAINT fk_axle_site FOREIGN KEY (site_id) REFERENCES public.master_site(id) ON DELETE RESTRICT ON UPDATE CASCADE;


-- public.transact_cctv foreign keys

ALTER TABLE public.transact_cctv ADD CONSTRAINT fk_cctv_session FOREIGN KEY (session_id) REFERENCES public.transact_wim_session(id) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE public.transact_cctv ADD CONSTRAINT fk_cctv_site FOREIGN KEY (site_id) REFERENCES public.master_site(id) ON DELETE RESTRICT ON UPDATE CASCADE;


-- public.transact_dimension foreign keys

ALTER TABLE public.transact_dimension ADD CONSTRAINT fk_dimension_anpr FOREIGN KEY (anpr_id) REFERENCES public.transact_anpr_capture(id) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE public.transact_dimension ADD CONSTRAINT fk_dimension_session FOREIGN KEY (session_id) REFERENCES public.transact_wim_session(id) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE public.transact_dimension ADD CONSTRAINT fk_dimension_site FOREIGN KEY (site_id) REFERENCES public.master_site(id) ON DELETE RESTRICT ON UPDATE CASCADE;


-- public.transact_vehicle_actual foreign keys

ALTER TABLE public.transact_vehicle_actual ADD CONSTRAINT fk_actual_anpr FOREIGN KEY (anpr_id) REFERENCES public.transact_anpr_capture(id) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE public.transact_vehicle_actual ADD CONSTRAINT fk_actual_axle FOREIGN KEY (axle_id) REFERENCES public.transact_axle_capture(id) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE public.transact_vehicle_actual ADD CONSTRAINT fk_actual_cctv FOREIGN KEY (transact_cctv_id) REFERENCES public.transact_cctv(id) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE public.transact_vehicle_actual ADD CONSTRAINT fk_actual_dimension FOREIGN KEY (transact_dimension_id) REFERENCES public.transact_dimension(id) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE public.transact_vehicle_actual ADD CONSTRAINT fk_actual_session FOREIGN KEY (session_id) REFERENCES public.transact_wim_session(id) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE public.transact_vehicle_actual ADD CONSTRAINT fk_actual_site FOREIGN KEY (site_id) REFERENCES public.master_site(id) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE public.transact_vehicle_actual ADD CONSTRAINT fk_actual_weighing FOREIGN KEY (transact_weighing_id) REFERENCES public.transact_weighing(id) ON DELETE SET NULL ON UPDATE CASCADE;


-- public.transact_vehicle_status foreign keys

ALTER TABLE public.transact_vehicle_status ADD CONSTRAINT fk_vehicle_status_actual FOREIGN KEY (transact_vehicle_actual_id) REFERENCES public.transact_vehicle_actual(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE public.transact_vehicle_status ADD CONSTRAINT fk_vehicle_status_site FOREIGN KEY (site_id) REFERENCES public.master_site(id) ON DELETE RESTRICT ON UPDATE CASCADE;


-- public.transact_weighing foreign keys

ALTER TABLE public.transact_weighing ADD CONSTRAINT fk_weighing_session FOREIGN KEY (session_id) REFERENCES public.transact_wim_session(id) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE public.transact_weighing ADD CONSTRAINT fk_weighing_site FOREIGN KEY (site_id) REFERENCES public.master_site(id) ON DELETE RESTRICT ON UPDATE CASCADE;


-- public.transact_wim_session foreign keys

ALTER TABLE public.transact_wim_session ADD CONSTRAINT fk_wim_session_ended_by FOREIGN KEY (ended_by) REFERENCES public.master_user(id) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE public.transact_wim_session ADD CONSTRAINT fk_wim_session_site FOREIGN KEY (site_id) REFERENCES public.master_site(id) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE public.transact_wim_session ADD CONSTRAINT fk_wim_session_started_by FOREIGN KEY (started_by) REFERENCES public.master_user(id) ON DELETE SET NULL ON UPDATE CASCADE;


-- public.user_login_history foreign keys

ALTER TABLE public.user_login_history ADD CONSTRAINT user_login_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.master_user(id) ON DELETE CASCADE ON UPDATE CASCADE;



-- DROP FUNCTION public.armor(bytea, _text, _text);

CREATE OR REPLACE FUNCTION public.armor(bytea, text[], text[])
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_armor$function$
;

-- DROP FUNCTION public.armor(bytea);

CREATE OR REPLACE FUNCTION public.armor(bytea)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_armor$function$
;

-- DROP FUNCTION public.auto_generate_config_code();

CREATE OR REPLACE FUNCTION public.auto_generate_config_code()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF NEW.code IS NULL OR NEW.code = '' THEN
        NEW.code := generate_code('MCF', 'master_config');
    END IF;
    RETURN NEW;
END;
$function$
;

-- DROP FUNCTION public.auto_generate_device_code();

CREATE OR REPLACE FUNCTION public.auto_generate_device_code()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF NEW.code IS NULL OR NEW.code = '' THEN
        NEW.code := generate_code('MDV', 'master_device');
    END IF;
    RETURN NEW;
END;
$function$
;

-- DROP FUNCTION public.auto_generate_device_type_code();

CREATE OR REPLACE FUNCTION public.auto_generate_device_type_code()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF NEW.code IS NULL OR NEW.code = '' THEN
        NEW.code := generate_code('MDT', 'master_device_type');
    END IF;
    RETURN NEW;
END;
$function$
;

-- DROP FUNCTION public.auto_generate_role_code();

CREATE OR REPLACE FUNCTION public.auto_generate_role_code()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF NEW.code IS NULL OR NEW.code = '' THEN
        NEW.code := generate_code('MRL', 'master_role');
    END IF;
    RETURN NEW;
END;
$function$
;

-- DROP FUNCTION public.auto_generate_user_code();

CREATE OR REPLACE FUNCTION public.auto_generate_user_code()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Hanya generate code jika code masih NULL atau empty
    IF NEW.code IS NULL OR NEW.code = '' THEN
        NEW.code := generate_code('MUS', 'master_user');
    END IF;
    
    RETURN NEW;
END;
$function$
;

-- DROP FUNCTION public.auto_generate_vehicle_class_code();

CREATE OR REPLACE FUNCTION public.auto_generate_vehicle_class_code()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF NEW.code IS NULL OR NEW.code = '' THEN
        NEW.code := generate_code('MVC', 'master_vehicle_class');
    END IF;
    RETURN NEW;
END;
$function$
;

-- DROP FUNCTION public.auto_generate_wim_session_code();

CREATE OR REPLACE FUNCTION public.auto_generate_wim_session_code()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
	year_str VARCHAR(4);
	seq_num INT;
	new_code VARCHAR(50);
BEGIN
	-- Get current year
	year_str := TO_CHAR(CURRENT_DATE, 'YYYY');

	-- Get next sequence number for this year
	SELECT COALESCE(MAX(
		CASE
			WHEN code ~ ('^WIM-' || year_str || '-[0-9]+$')
			THEN CAST(SUBSTRING(code FROM '[0-9]+$') AS INTEGER)
			ELSE 0
		END
	), 0) + 1
	INTO seq_num
	FROM transact_wim_session;

	-- Generate new code: WIM-YYYY-NNNN (e.g., WIM-2025-0001)
	new_code := 'WIM-' || year_str || '-' || LPAD(seq_num::TEXT, 4, '0');

	NEW.code := new_code;
	RETURN NEW;
END;
$function$
;

-- DROP FUNCTION public.crypt(text, text);

CREATE OR REPLACE FUNCTION public.crypt(text, text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_crypt$function$
;

-- DROP FUNCTION public.dearmor(text);

CREATE OR REPLACE FUNCTION public.dearmor(text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_dearmor$function$
;

-- DROP FUNCTION public.decrypt(bytea, bytea, text);

CREATE OR REPLACE FUNCTION public.decrypt(bytea, bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_decrypt$function$
;

-- DROP FUNCTION public.decrypt_iv(bytea, bytea, bytea, text);

CREATE OR REPLACE FUNCTION public.decrypt_iv(bytea, bytea, bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_decrypt_iv$function$
;

-- DROP FUNCTION public.digest(text, text);

CREATE OR REPLACE FUNCTION public.digest(text, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_digest$function$
;

-- DROP FUNCTION public.digest(bytea, text);

CREATE OR REPLACE FUNCTION public.digest(bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_digest$function$
;

-- DROP FUNCTION public.encrypt(bytea, bytea, text);

CREATE OR REPLACE FUNCTION public.encrypt(bytea, bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_encrypt$function$
;

-- DROP FUNCTION public.encrypt_iv(bytea, bytea, bytea, text);

CREATE OR REPLACE FUNCTION public.encrypt_iv(bytea, bytea, bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_encrypt_iv$function$
;

-- DROP FUNCTION public.gen_random_bytes(int4);

CREATE OR REPLACE FUNCTION public.gen_random_bytes(integer)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_random_bytes$function$
;

-- DROP FUNCTION public.gen_random_uuid();

CREATE OR REPLACE FUNCTION public.gen_random_uuid()
 RETURNS uuid
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/pgcrypto', $function$pg_random_uuid$function$
;

-- DROP FUNCTION public.gen_salt(text);

CREATE OR REPLACE FUNCTION public.gen_salt(text)
 RETURNS text
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_gen_salt$function$
;

-- DROP FUNCTION public.gen_salt(text, int4);

CREATE OR REPLACE FUNCTION public.gen_salt(text, integer)
 RETURNS text
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_gen_salt_rounds$function$
;

-- DROP FUNCTION public.generate_code(text, text);

CREATE OR REPLACE FUNCTION public.generate_code(prefix_code text, table_name text)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
    current_year text;          -- 2 digit tahun sekarang (25 untuk 2025)
    next_number integer;        -- Nomor urut berikutnya
    formatted_number text;      -- Nomor urut dengan format 5 digit
    new_code text;              -- Code yang akan di-generate
    total_records integer;      -- Total records di tabel
BEGIN
    -- Ambil 2 digit tahun berjalan (misal: 2025 -> 25)
    current_year := TO_CHAR(CURRENT_DATE, 'YY');
    
    -- Hitung total records di tabel untuk mendapatkan nomor urut berikutnya
    EXECUTE format('SELECT COUNT(*) FROM %I', table_name)
    INTO total_records;
    
    -- Nomor urut = total records + 1
    next_number := COALESCE(total_records, 0) + 1;
    
    -- Format nomor urut menjadi 5 digit (00001, 00002, dst)
    formatted_number := LPAD(next_number::text, 5, '0');
    
    -- Gabungkan menjadi format: PREFIX-YY-NNNNN
    new_code := prefix_code || '-' || current_year || '-' || formatted_number;
    
    RETURN new_code;
END;
$function$
;

-- DROP FUNCTION public.hmac(text, text, text);

CREATE OR REPLACE FUNCTION public.hmac(text, text, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_hmac$function$
;

-- DROP FUNCTION public.hmac(bytea, bytea, text);

CREATE OR REPLACE FUNCTION public.hmac(bytea, bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_hmac$function$
;

-- DROP FUNCTION public.pgp_armor_headers(in text, out text, out text);

CREATE OR REPLACE FUNCTION public.pgp_armor_headers(text, OUT key text, OUT value text)
 RETURNS SETOF record
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_armor_headers$function$
;

-- DROP FUNCTION public.pgp_key_id(bytea);

CREATE OR REPLACE FUNCTION public.pgp_key_id(bytea)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_key_id_w$function$
;

-- DROP FUNCTION public.pgp_pub_decrypt(bytea, bytea);

CREATE OR REPLACE FUNCTION public.pgp_pub_decrypt(bytea, bytea)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_decrypt_text$function$
;

-- DROP FUNCTION public.pgp_pub_decrypt(bytea, bytea, text, text);

CREATE OR REPLACE FUNCTION public.pgp_pub_decrypt(bytea, bytea, text, text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_decrypt_text$function$
;

-- DROP FUNCTION public.pgp_pub_decrypt(bytea, bytea, text);

CREATE OR REPLACE FUNCTION public.pgp_pub_decrypt(bytea, bytea, text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_decrypt_text$function$
;

-- DROP FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea, text);

CREATE OR REPLACE FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_decrypt_bytea$function$
;

-- DROP FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea);

CREATE OR REPLACE FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_decrypt_bytea$function$
;

-- DROP FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea, text, text);

CREATE OR REPLACE FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea, text, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_decrypt_bytea$function$
;

-- DROP FUNCTION public.pgp_pub_encrypt(text, bytea, text);

CREATE OR REPLACE FUNCTION public.pgp_pub_encrypt(text, bytea, text)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_encrypt_text$function$
;

-- DROP FUNCTION public.pgp_pub_encrypt(text, bytea);

CREATE OR REPLACE FUNCTION public.pgp_pub_encrypt(text, bytea)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_encrypt_text$function$
;

-- DROP FUNCTION public.pgp_pub_encrypt_bytea(bytea, bytea);

CREATE OR REPLACE FUNCTION public.pgp_pub_encrypt_bytea(bytea, bytea)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_encrypt_bytea$function$
;

-- DROP FUNCTION public.pgp_pub_encrypt_bytea(bytea, bytea, text);

CREATE OR REPLACE FUNCTION public.pgp_pub_encrypt_bytea(bytea, bytea, text)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_encrypt_bytea$function$
;

-- DROP FUNCTION public.pgp_sym_decrypt(bytea, text);

CREATE OR REPLACE FUNCTION public.pgp_sym_decrypt(bytea, text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_decrypt_text$function$
;

-- DROP FUNCTION public.pgp_sym_decrypt(bytea, text, text);

CREATE OR REPLACE FUNCTION public.pgp_sym_decrypt(bytea, text, text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_decrypt_text$function$
;

-- DROP FUNCTION public.pgp_sym_decrypt_bytea(bytea, text, text);

CREATE OR REPLACE FUNCTION public.pgp_sym_decrypt_bytea(bytea, text, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_decrypt_bytea$function$
;

-- DROP FUNCTION public.pgp_sym_decrypt_bytea(bytea, text);

CREATE OR REPLACE FUNCTION public.pgp_sym_decrypt_bytea(bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_decrypt_bytea$function$
;

-- DROP FUNCTION public.pgp_sym_encrypt(text, text);

CREATE OR REPLACE FUNCTION public.pgp_sym_encrypt(text, text)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_encrypt_text$function$
;

-- DROP FUNCTION public.pgp_sym_encrypt(text, text, text);

CREATE OR REPLACE FUNCTION public.pgp_sym_encrypt(text, text, text)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_encrypt_text$function$
;

-- DROP FUNCTION public.pgp_sym_encrypt_bytea(bytea, text);

CREATE OR REPLACE FUNCTION public.pgp_sym_encrypt_bytea(bytea, text)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_encrypt_bytea$function$
;

-- DROP FUNCTION public.pgp_sym_encrypt_bytea(bytea, text, text);

CREATE OR REPLACE FUNCTION public.pgp_sym_encrypt_bytea(bytea, text, text)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_encrypt_bytea$function$
;

-- DROP FUNCTION public.set_updated_timestamp();

CREATE OR REPLACE FUNCTION public.set_updated_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_date = now();
  RETURN NEW;
END;
$function$
;

-- DROP FUNCTION public.uuid_generate_v1();

CREATE OR REPLACE FUNCTION public.uuid_generate_v1()
 RETURNS uuid
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_generate_v1$function$
;

-- DROP FUNCTION public.uuid_generate_v1mc();

CREATE OR REPLACE FUNCTION public.uuid_generate_v1mc()
 RETURNS uuid
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_generate_v1mc$function$
;

-- DROP FUNCTION public.uuid_generate_v3(uuid, text);

CREATE OR REPLACE FUNCTION public.uuid_generate_v3(namespace uuid, name text)
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_generate_v3$function$
;

-- DROP FUNCTION public.uuid_generate_v4();

CREATE OR REPLACE FUNCTION public.uuid_generate_v4()
 RETURNS uuid
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_generate_v4$function$
;

-- DROP FUNCTION public.uuid_generate_v5(uuid, text);

CREATE OR REPLACE FUNCTION public.uuid_generate_v5(namespace uuid, name text)
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_generate_v5$function$
;

-- DROP FUNCTION public.uuid_nil();

CREATE OR REPLACE FUNCTION public.uuid_nil()
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_nil$function$
;

-- DROP FUNCTION public.uuid_ns_dns();

CREATE OR REPLACE FUNCTION public.uuid_ns_dns()
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_ns_dns$function$
;

-- DROP FUNCTION public.uuid_ns_oid();

CREATE OR REPLACE FUNCTION public.uuid_ns_oid()
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_ns_oid$function$
;

-- DROP FUNCTION public.uuid_ns_url();

CREATE OR REPLACE FUNCTION public.uuid_ns_url()
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_ns_url$function$
;

-- DROP FUNCTION public.uuid_ns_x500();

CREATE OR REPLACE FUNCTION public.uuid_ns_x500()
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_ns_x500$function$
;

-- Add session-level dummy mode toggle.
ALTER TABLE public.transact_wim_session
  ADD COLUMN IF NOT EXISTS is_dummy boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.transact_wim_session.is_dummy IS
  'If true, services process this session using dummy data instead of real device/FTP sources';

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
	('SITE', 'SITE_ID', '628f033e-49b2-4ba0-b1e8-12af4b3895ee', 'string', 'Site ID', 'Unique UUID for this operating site.', false, 10),
	('SITE', 'SITE_CODE', 'MST-25-00001', 'string', 'Site Code', 'Site code used by local and central systems.', false, 20),
	('SITE', 'SITE_NAME', 'Mampang Revamp Local', 'string', 'Site Name', 'Human readable site name.', false, 30),
	('SITE', 'SITE_LOCATION', 'Central Office', 'string', 'Site Location', 'Site location label shown in the UI.', false, 40),
	('SITE', 'SITE_REGION', 'Default', 'string', 'Site Region', 'Regional grouping for reporting and synchronization.', false, 50),

	('API', 'API_PORT', '4000', 'number', 'API Port', 'Port used by the local backend API service.', false, 110),
	('API', 'AUTH_ENABLED', 'false', 'boolean', 'Authorization Enabled', 'Enable backend JWT authorization enforcement.', false, 120),
	('API', 'JWT_SECRET', '', 'password', 'JWT Secret', 'Secret used to sign backend JWT tokens.', true, 130),

	('SERVICE', 'SERVICE', 'api', 'string', 'Service Role', 'Backend process role: api, anpr-watcher, axle-watcher, or cctv-streamer.', false, 210),
	('SERVICE', 'SYNC_ENABLED', 'false', 'boolean', 'Central Sync Enabled', 'Enable synchronization to central database.', false, 220),
	('SERVICE', 'NATS_URL', 'nats://localhost:14222', 'url', 'NATS URL', 'NATS broker URL used by queue workers.', false, 230),

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
	('ANPR_FTP', 'ANPR_STREAM_URL', 'http://10.0.43.30:9901/video.mjpeg', 'url', 'ANPR Direct Stream URL', 'Direct browser-playable stream URL, for example MJPEG/HLS/MP4 over HTTP. RTSP is not browser-playable.', false, 470),

	('AXLE_FTP', 'AXLE_FTP_HOST', '10.0.43.100:10021', 'string', 'AXLE FTP Host', 'FTP host and port for axle capture files.', false, 510),
	('AXLE_FTP', 'AXLE_FTP_USER', 'ftpuser', 'string', 'AXLE FTP Username', 'Username for axle FTP access.', false, 520),
	('AXLE_FTP', 'AXLE_FTP_PASS', '', 'password', 'AXLE FTP Password', 'Password for axle FTP access.', true, 530),
	('AXLE_FTP', 'AXLE_FTP_DIR', '/ftp/ftpuser/axle/', 'path', 'AXLE FTP Directory', 'Directory where axle XML/image files are stored.', false, 540),
	('AXLE_FTP', 'AXLE_FTP_INTERVAL_SEC', '5', 'number', 'AXLE FTP Interval', 'Polling interval in seconds for axle watcher.', false, 550),
	('AXLE_FTP', 'AXLE_DUMMY_ENABLED', 'true', 'boolean', 'AXLE Dummy Enabled', 'Use dummy axle input instead of physical integration.', false, 560),
	('AXLE_FTP', 'AXLE_STREAM_URL', 'http://10.0.43.40:9901/video.mjpeg', 'url', 'AXLE Direct Stream URL', 'Direct browser-playable stream URL, for example MJPEG/HLS/MP4 over HTTP. RTSP is not browser-playable.', false, 570),

	('MINIO', 'ANPR_MINIO_ENDPOINT', 'localhost:19000', 'string', 'ANPR MinIO Endpoint', 'Object storage endpoint for ANPR assets.', false, 610),
	('MINIO', 'ANPR_MINIO_ACCESS_KEY', 'admin', 'string', 'ANPR MinIO Access Key', 'Access key for ANPR object storage.', false, 620),
	('MINIO', 'ANPR_MINIO_SECRET_KEY', '', 'password', 'ANPR MinIO Secret Key', 'Secret key for ANPR object storage.', true, 630),
	('MINIO', 'ANPR_MINIO_BUCKET', 'anpr', 'string', 'ANPR MinIO Bucket', 'Bucket for ANPR assets.', false, 640),
	('MINIO', 'ANPR_MINIO_USE_SSL', 'false', 'boolean', 'ANPR MinIO Use SSL', 'Use SSL when connecting to ANPR MinIO.', false, 650),
	('MINIO', 'AXLE_MINIO_ENDPOINT', 'localhost:19000', 'string', 'AXLE MinIO Endpoint', 'Object storage endpoint for axle assets.', false, 660),
	('MINIO', 'AXLE_MINIO_ACCESS_KEY', 'admin', 'string', 'AXLE MinIO Access Key', 'Access key for axle object storage.', false, 670),
	('MINIO', 'AXLE_MINIO_SECRET_KEY', '', 'password', 'AXLE MinIO Secret Key', 'Secret key for axle object storage.', true, 680),
	('MINIO', 'AXLE_MINIO_BUCKET', 'axle', 'string', 'AXLE MinIO Bucket', 'Bucket for axle assets.', false, 690),
	('MINIO', 'AXLE_MINIO_USE_SSL', 'false', 'boolean', 'AXLE MinIO Use SSL', 'Use SSL when connecting to axle MinIO.', false, 700),
	('MINIO', 'ATTACHMENT_MINIO_ENDPOINT', 'localhost:19000', 'string', 'Attachment MinIO Endpoint', 'Object storage endpoint for attachments.', false, 710),
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
	('CCTV', 'CCTV_STREAM_URL', 'rtsp://10.0.43.20:554/profile1', 'url', 'CCTV Direct Stream URL', 'RTSP or browser-playable stream URL. RTSP is transcoded by the web stream proxy.', false, 840),

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

	('WEIGHING', 'WEIGHING_TRIGGER_URL', 'http://localhost:5001/ws/wim/anpr-capture', 'url', 'Weighing Trigger URL', 'Endpoint used to trigger weighing capture.', false, 950),
	('WEIGHING', 'WEIGHING_TRIGGER_DIRECTION', 'RIGHT', 'string', 'Weighing Direction', 'Default capture direction.', false, 960),
	('WEIGHING', 'WEIGHING_TRIGGER_TIMEOUT_SECONDS', '25', 'number', 'Weighing Timeout Seconds', 'Timeout for weighing trigger calls.', false, 970),
	('WEIGHING', 'WEIGHING_TRIGGER_SAVE', 'true', 'boolean', 'Weighing Trigger Save', 'Save capture result from weighing trigger.', false, 980),
	('WEIGHING', 'WEIGHING_TRIGGER_DUMMY', 'false', 'boolean', 'Weighing Trigger Dummy', 'Use dummy weighing trigger mode.', false, 990),
	('WEIGHING', 'WIM_STREAM_URL', '/api/wim-live', 'url', 'WIM Live Stream URL', 'Same-origin SSE proxy endpoint for real-time WIM connection and weighing status.', false, 1000),

	('VEAM', 'VEAM_PUBLIC_KEY_B64', 'nO0iENG73vxSfIx8p6uj5qa2S1SkXwk9rHEt5TyA+XA=', 'password', 'VEAM Public Key', 'Public key used to validate VEAM2 license signatures.', true, 910),
	('VEAM', 'VEAM_LICENSE_PATH', './data/license.veam', 'path', 'VEAM License Path', 'Local path where active license is stored.', false, 920),
	('VEAM', 'VEAM_HARDWARE_ID', '', 'string', 'VEAM Hardware ID', 'Optional hardware binding value for license validation.', false, 930),
	('VEAM', 'VEAM_USB_SCAN_PATHS', '/Volumes,/host/Volumes', 'string', 'VEAM USB Scan Paths', 'Comma separated mount roots used to find USB license files.', false, 940),
	('VEAM', 'VEAM_LOGIN_USB_CHECK_ENABLED', 'true', 'boolean', 'VEAM USB Login Fallback', 'Allow login when stored license is inactive but a valid USB license is present.', false, 950)
ON CONFLICT (config_group, config_key) DO UPDATE SET
	label = EXCLUDED.label,
	description = EXCLUDED.description,
	value_type = EXCLUDED.value_type,
	is_secret = EXCLUDED.is_secret,
	sort_order = EXCLUDED.sort_order,
	updated_date = now();
