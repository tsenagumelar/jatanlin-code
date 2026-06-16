# System - Configuration & Device Registration

## Route

`/v3/system/configuration-device-registration`

## Access

Private.

Permission: system admin or device admin.

## Purpose

Configuration & Device Registration is used to manage application
configuration and device registration such as ANPR, WIM, AXLE, CCTV, LED, or
other integration devices.

## Main Content

- Configuration list.
- Device list.
- Register device.
- Edit device.
- Device status.
- Test connection.
- Sync/apply configuration.

## Data Request

GraphQL Hasura:

- Configuration data.
- Device metadata.
- Mutation create/update configuration.
- Mutation to register/update device metadata if stored in Hasura.

REST API:

- Test device connection.
- Apply configuration.
- Device command.
- Backend integration health.

## Redux

Slice:

- `notificationSlice`
- `monitoringSlice` if the selected device is used across monitoring pages.

## UI Components

Molecules:

- FormField
- StatusItem
- CommandButtonGroup
- ConfirmDialog

Organisms:

- ConfigurationTable
- DeviceTable
- DeviceRegistrationForm
- DeviceStatusPanel
- ConnectionTestPanel

Templates:

- SettingsTemplate

## States

- Loading configuration.
- No device registered.
- Registering device.
- Testing connection.
- Connection success.
- Connection failed.
- Save failed.

## Acceptance Criteria

- Admin can manage configuration and devices in one area.
- Test connection uses REST and has clear feedback.
- Configuration changes are not silent.
