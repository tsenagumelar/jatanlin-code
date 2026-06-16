# Monitoring - Processing

## Route

`/v3/monitoring/processing`

## Access

Private.

## Purpose

Processing is used to monitor the vehicle process flow from capture until the
session result is created.

## Main Flow

1. System waits for vehicle capture.
2. ANPR menerima data plat/gambar.
3. WIM menerima berat.
4. Axle or dimension data is received if available.
5. Session diproses.
6. Vehicle status is displayed.
7. Operator can open transaction details.

## Data Request

GraphQL Hasura:

- Active session.
- Latest capture.
- Transaction/session status.

REST API:

- Capture trigger if available.
- Device health.
- Operational command ke backend processing.

## Redux

Slice:

- `monitoringSlice`

State:

- selected lane/device.
- processing view mode.
- last selected active session.

## UI Components

Molecules:

- StatusItem
- MetricCard
- TimelineItem

Organisms:

- ProcessingStatusPanel
- ActiveVehiclePanel
- SensorStatusPanel
- ProcessTimeline
- CapturePreview

Templates:

- MonitoringTemplate

## States

- Waiting vehicle.
- Capturing.
- Processing.
- Completed.
- Failed.
- Sensor offline.
- Backend unavailable.

## Acceptance Criteria

- Status tiap sensor terlihat jelas.
- Active vehicle is the main focus.
- Operator can navigate to Jatanlin details from the active session.
