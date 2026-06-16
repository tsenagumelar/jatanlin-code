# Master Data - User

## Route

`/v3/master-data/user`

## Access

Private.

Permission: admin or user management role.

## Purpose

User is used to manage user accounts, roles, active status, and profiles.

## Main Content

- User table.
- Search user.
- Filter role/status.
- Create user.
- Edit user.
- Disable/enable user.
- Reset password action if allowed.

## Data Request

GraphQL Hasura:

- Query user list.
- Query role options.
- Mutation to create/update users if users are stored in Hasura.

REST API:

- Reset password command.
- Invite user.
- Auth-specific operation if handled by the backend auth service.

## Redux

Menggunakan:

- `notificationSlice`
- `authSlice` for permissions.

List data does not need global Redux.

## UI Components

Molecules:

- SearchInput
- FormField
- ConfirmDialog
- StatusPill

Organisms:

- UserTable
- UserForm
- FilterBar
- DrawerForm

Templates:

- ListPageTemplate

## States

- Loading.
- Empty users.
- Validation error.
- Save loading.
- Save success.
- Save failed.
- Permission denied.

## Acceptance Criteria

- Admin can create/edit users.
- Role and status are visible.
- Destructive action memakai confirm dialog.
