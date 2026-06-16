# Register

## Route

`/v3/register`

## Access

Public.

## Purpose

Register is used to create a new account when self-registration is enabled. If
the organization decides that registration is admin-only, this page shows that
public registration is not available.

## Main Flow

1. User opens the register page.
2. User enters identity data.
3. User submit form.
4. App mengirim request register ke backend REST.
5. On success, the user is redirected to login or waits for approval according
   to configuration.

## Data Request

REST API:

- `POST /auth/register`

GraphQL can be used after the account is created to read additional profile
data if needed.

## Redux

Slice:

- `authSlice` for transient register status if needed.

State does not need to persist before the user logs in.

## UI Components

Atoms:

- Button
- Input
- Select
- Label

Molecules:

- FormField
- PasswordStrength
- ErrorState

Templates:

- AuthTemplate

## Fields

- Full name
- Email
- Phone number optional
- Password
- Confirm password
- Organization/unit optional sesuai kebutuhan

## Validation

- Email valid.
- Password memenuhi minimum rule.
- Confirm password must match.
- Required fields must be filled.

## States

- Initial
- Loading
- Validation error
- Registration disabled
- Waiting approval
- Success
