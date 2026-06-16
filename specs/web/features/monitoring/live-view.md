# Monitoring - Live View

## Route

`/v3/monitoring/live-view`

## Access

Private.

## Purpose

Live View is used to view cameras or CCTV streams related to operational
locations.

## Main Content

- Grid camera.
- Camera selector.
- Stream status.
- Timestamp.
- Fullscreen action if needed.

## Data Request

GraphQL Hasura:

- Camera/device metadata if stored in Hasura.

REST API:

- Stream URL.
- Camera health.
- Start/stop stream command if needed.

## Redux

Slice:

- `monitoringSlice`

State:

- selected camera.
- grid layout preference.
- muted/autoplay preference if needed.

## UI Components

Atoms:

- IconButton
- Badge

Molecules:

- StatusItem
- CameraSelector

Organisms:

- CameraGrid
- StreamPlayer
- SensorStatusPanel

Templates:

- MonitoringTemplate

## States

- Loading stream.
- Stream online.
- Stream offline.
- No camera configured.
- Permission denied.

## Acceptance Criteria

- Operator can select a camera.
- Offline streams do not break the layout.
- Status camera terlihat.
