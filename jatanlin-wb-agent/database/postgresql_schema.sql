-- =====================================================
-- WIM (Weigh In Motion) Database Schema for PostgreSQL
-- =====================================================
-- Based on WAPI DLL v2.5 specification
-- Reference: NAV19-005 - WAPI DLL EN v 2.5.pdf
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Table: transact_wim_vehicle
-- Description: Stores vehicle weighing records from WServerAPI
-- =====================================================
CREATE TABLE public.transact_wim_vehicle (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),

    -- WServer identification
    record_id integer NOT NULL,                     -- RECID from WSERVER (may reset on device reboot)
    ws_code varchar(10) NULL,                       -- WS: weighing system identifier number

    -- Weighing timestamp
    timestamp timestamptz NOT NULL,                 -- TIME field from WSERVER (converted to UTC)

    -- Vehicle information
    direction varchar(10) NOT NULL,                 -- DIR: LEFT, RIGHT, or UNKNOWN
    total_weight integer NOT NULL,                  -- WEIGHT in kg (total vehicle weight/GVW)
    speed numeric(5, 2) NOT NULL,                   -- SPEED in km/h
    axle_count integer NOT NULL,                    -- AXLECOUNT: number of axles detected

    -- Result and status
    result_code integer NOT NULL,                   -- RES: 0=OK, others=error codes (see WAPI spec)
    info_text text NULL,                            -- INFOTEXT: error description or additional info

    -- Raw data for debugging
    raw_message text NOT NULL,                      -- Full #MSG OBJECT:VEHICLE for debugging

    -- Metadata
    location_code varchar(100) NULL,                -- Optional: location/gate code
    site_id uuid NULL,                              -- Site where this weighing occurred

    -- Audit fields
    is_active bool NULL DEFAULT true,
    is_deleted bool NULL DEFAULT false,
    created_by uuid NULL,
    created_date timestamptz NULL DEFAULT now(),
    updated_by uuid NULL,
    updated_date timestamptz NULL DEFAULT now(),

    -- Constraints
    CONSTRAINT transact_wim_vehicle_pkey PRIMARY KEY (id),
    CONSTRAINT fk_wim_vehicle_site FOREIGN KEY (site_id)
        REFERENCES public.master_site(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    -- Check constraints
    CONSTRAINT chk_result_code CHECK (result_code >= 0 AND result_code <= 99),
    CONSTRAINT chk_direction CHECK (direction IN ('Left', 'Right', 'Unknown')),
    CONSTRAINT chk_axle_count CHECK (axle_count > 0 AND axle_count <= 20),
    CONSTRAINT chk_total_weight CHECK (total_weight >= 0)
);

-- Indexes for performance
CREATE INDEX idx_wim_vehicle_timestamp ON public.transact_wim_vehicle USING btree (timestamp DESC);
CREATE INDEX idx_wim_vehicle_record_id ON public.transact_wim_vehicle USING btree (record_id);
CREATE INDEX idx_wim_vehicle_result_code ON public.transact_wim_vehicle USING btree (result_code);
CREATE INDEX idx_wim_vehicle_site ON public.transact_wim_vehicle USING btree (site_id);
CREATE INDEX idx_wim_vehicle_location ON public.transact_wim_vehicle USING btree (location_code);
CREATE INDEX idx_wim_vehicle_created_date ON public.transact_wim_vehicle USING btree (created_date DESC);

-- Composite index for common queries
CREATE INDEX idx_wim_vehicle_site_timestamp ON public.transact_wim_vehicle USING btree (site_id, timestamp DESC);

-- Comment on table
COMMENT ON TABLE public.transact_wim_vehicle IS 'Vehicle weighing records from WIM (Weigh In Motion) system';
COMMENT ON COLUMN public.transact_wim_vehicle.record_id IS 'RECID from WSERVER - may reset on device reboot, not guaranteed to be unique';
COMMENT ON COLUMN public.transact_wim_vehicle.result_code IS 'Result code: 0=OK, 1-49=operational errors, 50-99=hardware/system errors';
COMMENT ON COLUMN public.transact_wim_vehicle.direction IS 'Vehicle travel direction: Left (from left), Right (from right), Unknown';
COMMENT ON COLUMN public.transact_wim_vehicle.total_weight IS 'Total vehicle weight (GVW - Gross Vehicle Weight) in kilograms';
COMMENT ON COLUMN public.transact_wim_vehicle.speed IS 'Vehicle speed in km/h';
COMMENT ON COLUMN public.transact_wim_vehicle.raw_message IS 'Full #MSG packet from WSERVER for debugging and audit trail';

-- =====================================================
-- Table: transact_wim_axle
-- Description: Stores individual axle data for each vehicle
-- =====================================================
CREATE TABLE public.transact_wim_axle (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),

    -- Foreign key to vehicle
    vehicle_id uuid NOT NULL,                       -- Reference to transact_wim_vehicle

    -- Axle information
    axle_number integer NOT NULL,                   -- AXLENO: 1, 2, 3, ... (sequential order)
    weight integer NOT NULL,                        -- WEIGHT: axle weight in kg (rounded to increment)
    gross_weight integer NOT NULL,                  -- GWEIGHT: unrounded axle weight in kg

    -- Wheel weights (left and right)
    wheel1_weight integer NOT NULL,                 -- WHEEL1: left wheel weight in kg
    wheel2_weight integer NOT NULL,                 -- WHEEL2: right wheel weight in kg

    -- Axle measurements
    wheelbase numeric(6, 2) NOT NULL,              -- BASE: distance to next axle in meters (0.00 for last axle)
    speed numeric(5, 2) NOT NULL,                  -- SPEED: axle speed in km/h

    -- Audit fields
    is_active bool NULL DEFAULT true,
    is_deleted bool NULL DEFAULT false,
    created_date timestamptz NULL DEFAULT now(),
    updated_date timestamptz NULL DEFAULT now(),

    -- Constraints
    CONSTRAINT transact_wim_axle_pkey PRIMARY KEY (id),
    CONSTRAINT fk_wim_axle_vehicle FOREIGN KEY (vehicle_id)
        REFERENCES public.transact_wim_vehicle(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    -- Unique constraint: one axle number per vehicle
    CONSTRAINT uq_vehicle_axle_number UNIQUE (vehicle_id, axle_number),

    -- Check constraints
    CONSTRAINT chk_axle_number CHECK (axle_number > 0 AND axle_number <= 20),
    CONSTRAINT chk_axle_weight CHECK (weight >= 0),
    CONSTRAINT chk_axle_wheelbase CHECK (wheelbase >= 0 AND wheelbase <= 20)
);

-- Indexes for performance
CREATE INDEX idx_wim_axle_vehicle ON public.transact_wim_axle USING btree (vehicle_id);
CREATE INDEX idx_wim_axle_number ON public.transact_wim_axle USING btree (vehicle_id, axle_number);

-- Comment on table
COMMENT ON TABLE public.transact_wim_axle IS 'Individual axle measurements for each weighed vehicle';
COMMENT ON COLUMN public.transact_wim_axle.axle_number IS 'Sequential axle number: 1=front axle, 2=second axle, etc.';
COMMENT ON COLUMN public.transact_wim_axle.wheelbase IS 'Distance from this axle to the next axle in meters (0.00 for last axle)';
COMMENT ON COLUMN public.transact_wim_axle.weight IS 'Axle weight rounded to weighing increment (d) in kilograms';
COMMENT ON COLUMN public.transact_wim_axle.gross_weight IS 'Unrounded axle weight in kilograms';

-- =====================================================
-- View: v_wim_vehicle_summary
-- Description: Summary view with calculated fields
-- =====================================================
CREATE OR REPLACE VIEW public.v_wim_vehicle_summary AS
SELECT
    v.id,
    v.record_id,
    v.timestamp,
    v.direction,
    v.total_weight,
    v.speed,
    v.axle_count,
    v.result_code,
    v.info_text,
    v.location_code,
    v.site_id,
    v.created_date,

    -- Calculated fields
    CASE
        WHEN v.result_code = 0 THEN true
        ELSE false
    END as is_successful,

    -- Axle statistics
    (SELECT COUNT(*) FROM public.transact_wim_axle a WHERE a.vehicle_id = v.id AND a.is_deleted = false) as actual_axle_count,
    (SELECT SUM(a.weight) FROM public.transact_wim_axle a WHERE a.vehicle_id = v.id AND a.is_deleted = false) as sum_axle_weights,
    (SELECT AVG(a.weight) FROM public.transact_wim_axle a WHERE a.vehicle_id = v.id AND a.is_deleted = false) as avg_axle_weight,
    (SELECT MAX(a.weight) FROM public.transact_wim_axle a WHERE a.vehicle_id = v.id AND a.is_deleted = false) as max_axle_weight,

    -- Vehicle classification hints (based on axle count)
    CASE
        WHEN v.axle_count = 2 THEN 'Light Vehicle (2 axles)'
        WHEN v.axle_count = 3 THEN 'Medium Truck (3 axles)'
        WHEN v.axle_count >= 4 AND v.axle_count <= 5 THEN 'Heavy Truck (4-5 axles)'
        WHEN v.axle_count >= 6 THEN 'Trailer Combination (6+ axles)'
        ELSE 'Unknown'
    END as vehicle_class_hint

FROM public.transact_wim_vehicle v
WHERE v.is_deleted = false;

COMMENT ON VIEW public.v_wim_vehicle_summary IS 'Vehicle weighing summary with calculated statistics';

-- =====================================================
-- View: v_wim_daily_statistics
-- Description: Daily statistics for monitoring
-- =====================================================
CREATE OR REPLACE VIEW public.v_wim_daily_statistics AS
SELECT
    DATE(timestamp) as weighing_date,
    site_id,
    location_code,

    -- Counts
    COUNT(*) as total_vehicles,
    COUNT(*) FILTER (WHERE result_code = 0) as successful_weighings,
    COUNT(*) FILTER (WHERE result_code != 0) as failed_weighings,

    -- Weight statistics
    SUM(total_weight) FILTER (WHERE result_code = 0) as total_weight_sum,
    AVG(total_weight) FILTER (WHERE result_code = 0) as avg_vehicle_weight,
    MIN(total_weight) FILTER (WHERE result_code = 0) as min_vehicle_weight,
    MAX(total_weight) FILTER (WHERE result_code = 0) as max_vehicle_weight,

    -- Speed statistics
    AVG(speed) FILTER (WHERE result_code = 0) as avg_speed,
    MIN(speed) FILTER (WHERE result_code = 0) as min_speed,
    MAX(speed) FILTER (WHERE result_code = 0) as max_speed,

    -- Axle statistics
    AVG(axle_count) FILTER (WHERE result_code = 0) as avg_axle_count,

    -- Direction breakdown
    COUNT(*) FILTER (WHERE direction = 'Left' AND result_code = 0) as left_direction_count,
    COUNT(*) FILTER (WHERE direction = 'Right' AND result_code = 0) as right_direction_count,

    -- Time range
    MIN(timestamp) as first_weighing_time,
    MAX(timestamp) as last_weighing_time

FROM public.transact_wim_vehicle
WHERE is_deleted = false
GROUP BY DATE(timestamp), site_id, location_code
ORDER BY weighing_date DESC, site_id;

COMMENT ON VIEW public.v_wim_daily_statistics IS 'Daily statistics for WIM weighing operations';

-- =====================================================
-- Function: fn_get_vehicle_with_axles
-- Description: Get complete vehicle data with all axles
-- =====================================================
CREATE OR REPLACE FUNCTION public.fn_get_vehicle_with_axles(
    p_vehicle_id uuid
)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
    v_result json;
BEGIN
    SELECT json_build_object(
        'id', v.id,
        'recordId', v.record_id,
        'timestamp', v.timestamp,
        'direction', v.direction,
        'totalWeight', v.total_weight,
        'speed', v.speed,
        'resultCode', v.result_code,
        'infoText', v.info_text,
        'axleCount', v.axle_count,
        'locationCode', v.location_code,
        'siteId', v.site_id,
        'isSuccessful', (v.result_code = 0),
        'axles', (
            SELECT json_agg(
                json_build_object(
                    'axleNumber', a.axle_number,
                    'weight', a.weight,
                    'grossWeight', a.gross_weight,
                    'wheel1Weight', a.wheel1_weight,
                    'wheel2Weight', a.wheel2_weight,
                    'wheelbase', a.wheelbase,
                    'speed', a.speed
                ) ORDER BY a.axle_number
            )
            FROM public.transact_wim_axle a
            WHERE a.vehicle_id = v.id AND a.is_deleted = false
        )
    )
    INTO v_result
    FROM public.transact_wim_vehicle v
    WHERE v.id = p_vehicle_id AND v.is_deleted = false;

    RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.fn_get_vehicle_with_axles IS 'Get complete vehicle weighing data with all axle details as JSON';

-- =====================================================
-- Sample data for testing (commented out)
-- =====================================================
/*
-- Insert sample vehicle
INSERT INTO public.transact_wim_vehicle
(record_id, ws_code, timestamp, direction, total_weight, speed, axle_count, result_code, info_text, raw_message, location_code)
VALUES
(7, '0', '2025-01-15 11:21:55+07', 'Unknown', 4140, 4.99, 2, 0, '',
 '#MSG OBJECT:VEHICLE RES:0 RECID:7 TIME:"2025-01-15 11:21:55" DIR:0 WEIGHT:4140 SPEED:4.99 INFOTEXT:"" WS:"0" AXLECOUNT:2',
 'GATE-A')
RETURNING id;

-- Insert axles for the vehicle (replace vehicle_id with actual UUID from above)
INSERT INTO public.transact_wim_axle
(vehicle_id, axle_number, weight, gross_weight, wheel1_weight, wheel2_weight, wheelbase, speed)
VALUES
('REPLACE_WITH_VEHICLE_ID', 1, 2760, 2755, 1378, 1378, 1.84, 4.82),
('REPLACE_WITH_VEHICLE_ID', 2, 1380, 1377, 688, 688, 0.00, 5.17);
*/

-- =====================================================
-- Result code reference table (optional)
-- =====================================================
CREATE TABLE public.master_wim_result_code (
    code integer NOT NULL,
    category varchar(20) NOT NULL,
    description text NOT NULL,
    is_error bool NOT NULL DEFAULT false,

    CONSTRAINT master_wim_result_code_pkey PRIMARY KEY (code)
);

-- Insert standard result codes from WAPI specification
INSERT INTO public.master_wim_result_code (code, category, description, is_error) VALUES
(0, 'SUCCESS', 'OK - Weighing successful', false),
(1, 'OPERATIONAL', 'Impossible to start WIM weighing', true),
(2, 'OPERATIONAL', 'Vehicle with too many axles', true),
(3, 'OPERATIONAL', 'Weighing terminated manually', true),
(4, 'OPERATIONAL', 'Vehicle did not come in time limit', true),
(5, 'OPERATIONAL', 'Vehicle with only one axle', true),
(6, 'OPERATIONAL', 'Underspeeding vehicle (buffer overflow)', true),
(7, 'OPERATIONAL', 'Vehicle stopped on weighbridge (no return to zero)', true),
(8, 'OPERATIONAL', 'Overspeeding vehicle', true),
(9, 'OPERATIONAL', 'Weighing out of tolerance', true),
(10, 'OPERATIONAL', 'Load over weighing range', true),
(11, 'OPERATIONAL', 'Load under weighing range', true),
(12, 'OPERATIONAL', 'Weighbridge 1 is not empty', true),
(13, 'OPERATIONAL', 'Weighbridge 2 is not empty', true),
(14, 'OPERATIONAL', 'Weighbridge is not empty', true),
(32, 'HARDWARE', 'Low zero level', true),
(33, 'HARDWARE', 'High zero level', true),
(34, 'HARDWARE', 'Communication error (no samples received)', true),
(38, 'HARDWARE', 'Weighing system in wrong mode', true),
(39, 'HARDWARE', 'Buffer overflow', true),
(40, 'HARDWARE', 'Buffer underflow', true),
(41, 'HARDWARE', 'High side unevenness of load', true),
(42, 'HARDWARE', 'Temperature out of range', true),
(43, 'DATA_PROTECTION', 'Insufficient permission level for the operation', true),
(44, 'DATA_PROTECTION', 'CRC error', true),
(45, 'DATA_PROTECTION', 'Packet timestamp mismatch error', true),
(46, 'DATA_PROTECTION', 'Packet order mismatch error', true),
(47, 'OPERATIONAL', 'Time for command execution elapsed', true),
(48, 'HARDWARE', 'No control data available', true),
(49, 'OPERATIONAL', 'Calibration switch is not active', true),
(99, 'UNKNOWN', 'Other unspecified error', true);

COMMENT ON TABLE public.master_wim_result_code IS 'Standard result codes from WAPI DLL specification';

-- Grant permissions (adjust as needed)
-- GRANT SELECT, INSERT, UPDATE ON public.transact_wim_vehicle TO your_application_user;
-- GRANT SELECT, INSERT, UPDATE ON public.transact_wim_axle TO your_application_user;
-- GRANT SELECT ON public.v_wim_vehicle_summary TO your_application_user;
-- GRANT SELECT ON public.v_wim_daily_statistics TO your_application_user;
