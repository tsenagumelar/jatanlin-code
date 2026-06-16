# System - Admin Setting

## Route

`/v3/system/admin-setting`

## Access

Private.

Permission: system admin.

## Purpose

Admin Setting contains administrative settings that affect access, system mode,
and application policies.

## Main Content

- Role and permission overview.
- System mode setting.
- User policy.
- Audit-related settings if available.

## Data Request

GraphQL Hasura:

- Query settings stored in Hasura.
- Mutation update setting.

REST API:

- System commands processed by the backend.

## Redux

Menggunakan:

- `authSlice`
- `notificationSlice`
- `appShellSlice` if the mode has a global impact.

## UI Components

Molecules:

- FormField
- Toggle
- ConfirmDialog

Organisms:

- SettingsSection
- PermissionMatrix
- AuditSummary

Templates:

- SettingsTemplate

## States

- Loading settings.
- Save loading.
- Save success.
- Save failed.
- Permission denied.

## Acceptance Criteria

- Important settings cannot change without confirmation.
- Perubahan menampilkan feedback.
- Permission admin diterapkan.
