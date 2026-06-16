# Login

## Route

`/v3/login`

## Access

Public.

If the user is already authenticated, redirect to `/v3/dashboard`.

## Purpose

Login is used to access the Jatanlin Web Apps as an operator, admin, or
supervisor.

## Main Flow

1. User opens the login page.
2. User enters username/email and password.
3. User submit form.
4. App mengirim request auth ke backend REST.
5. Backend verifikasi `master_user.password_hash`.
6. Backend creates a JWT with Hasura claims.
7. On success, the JWT is stored as `authToken` and the user is stored in Redux.
8. User is redirected to `/v3/dashboard` or the previous intended route.
9. Jika gagal, tampilkan error.

## Data Request

REST API:

- `POST /api/auth/login`

GraphQL is not used for login. Hasura GraphQL is only used after the JWT is
available.

## Redux

Slice:

- `authSlice`

State:

- `isAuthenticated`
- `user`
- `token`
- `permissions`
- `loading`
- `error`

## UI Components

Atoms:

- Button
- Input
- Label
- Spinner

Molecules:

- FormField
- ErrorState

Templates:

- AuthTemplate

## Validation

- Username/email is required.
- Password is required.
- Error credential salah ditampilkan tanpa menghapus semua input.

## States

- Initial
- Loading
- Invalid credential
- Backend unavailable
- Success redirect
