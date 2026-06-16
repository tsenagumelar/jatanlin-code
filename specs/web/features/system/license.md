# System - License

## Route

`/v3/system/license`

## Access

Private.

Permission: system admin.

## Purpose

License is used to view license status, activation, and license validation for
applications/devices.

## Main Content

- Current license status.
- Expiry date.
- Licensed device/unit.
- Activation form.
- License validation history.

## Data Request

GraphQL Hasura:

- License history if stored in Hasura.
- Device/license metadata if available.

REST API:

- Validate license.
- Activate license.
- Refresh license status.

## Redux

Menggunakan:

- `notificationSlice`

License detail does not need to persist globally unless it is used for an
app-wide guard.

## UI Components

Molecules:

- StatusPill
- FormField
- ConfirmDialog

Organisms:

- LicenseStatusPanel
- LicenseActivationForm
- ActivationHistoryTable

Templates:

- SettingsTemplate

## States

- Loading license.
- Active.
- Expired.
- Invalid.
- Activating.
- Activation success.
- Activation failed.

## Acceptance Criteria

- Status lisensi terlihat jelas.
- Aktivasi memakai REST command.
- Error aktivasi mudah dipahami.
