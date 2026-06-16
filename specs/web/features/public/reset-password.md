# Reset Password

## Route

`/v3/reset-password`

## Access

Public.

## Purpose

Reset password is used by users to request an account recovery link or code.

## Main Flow

1. User opens the reset password page.
2. User enters email.
3. App mengirim request reset password ke backend REST.
4. User menerima instruksi lanjutan.
5. If the reset token is used on the same page, the user enters a new password.

## Data Request

REST API:

- `POST /auth/reset-password/request`
- `POST /auth/reset-password/confirm`

## Redux

Global Redux is not required. State can remain local to the page because the
flow is transient.

## UI Components

Atoms:

- Button
- Input
- Label

Molecules:

- FormField
- EmptyState
- ErrorState

Templates:

- AuthTemplate

## Validation

- Email is required.
- Email must be valid.
- New password follows password rules if reset confirmation is done on the web.

## States

- Request form
- Request loading
- Request success
- Invalid/expired token
- Confirm password form
- Confirm success
