# Master Data - Vehicle Classes

## Route

`/v3/master-data/vehicle-classes`

## Access

Private.

Permission: admin or master data role.

## Purpose

Vehicle Classes is used to manage vehicle class references used in transactions
and ODOL validation.

## Main Content

- Vehicle class table.
- Create class.
- Edit class.
- Disable/delete class sesuai rule.
- Detail parameter kelas.

## Data Request

GraphQL Hasura:

- Query vehicle classes.
- Mutation create/update/delete vehicle class.

REST API:

- Tidak diperlukan kecuali ada sinkronisasi ke device/backend service.

## Redux

Menggunakan:

- `notificationSlice`
- `authSlice` for permissions.

## UI Components

Molecules:

- FormField
- SearchInput
- StatusPill
- ConfirmDialog

Organisms:

- VehicleClassTable
- VehicleClassForm
- FilterBar

Templates:

- ListPageTemplate

## Fields

- Class name.
- Class code.
- Description.
- Weight/dimension threshold if applicable.
- Active status.

## States

- Loading.
- Empty.
- Validation error.
- Save failed.
- Delete blocked because the data is in use.

## Acceptance Criteria

- User can manage vehicle classes.
- Data used by transactions cannot be deleted carelessly.
- Form validation jelas.
