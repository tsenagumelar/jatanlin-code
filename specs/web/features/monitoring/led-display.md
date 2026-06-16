# Monitoring - LED Display

## Route

`/v3/monitoring/led-display`

## Access

Private.

## Purpose

LED Display is used to monitor and control the LED display related to vehicle
process results.

## Main Content

- LED display preview.
- Status koneksi LED.
- Last sent data.
- Test display command if available.
- Riwayat update LED.

## Data Request

GraphQL Hasura:

- Configuration LED.
- Latest transaction/session data if stored in Hasura.

REST API:

- Send command ke LED.
- LED health check.
- Test display.

## Redux

Slice:

- `monitoringSlice`
- `notificationSlice`

State:

- selected LED device.
- preview mode.
- command feedback.

## UI Components

Molecules:

- StatusItem
- CommandButtonGroup

Organisms:

- LedPreviewPanel
- LedDeviceStatusPanel
- LedCommandPanel
- ActivityList

Templates:

- MonitoringTemplate

## States

- LED online.
- LED offline.
- Sending command.
- Command success.
- Command failed.
- No device configured.

## Acceptance Criteria

- Preview LED terlihat jelas.
- Commands have loading and result feedback.
- LED connection status is not ambiguous.
