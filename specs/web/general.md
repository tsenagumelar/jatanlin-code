# General Web Specification

## Objective

Rebuild the Jatanlin Web Apps with a new design, clearer feature structure, and
reusable components. The existing main process flow must be preserved,
especially for monitoring, Jatanlin transactions, verification, and device
integration.

## Scope

In scope:

- New routes and modules for Web Apps v3.
- Public features: login, register, reset password.
- Authenticated features: dashboard, monitoring, transaction, master data, system.
- Tailwind CSS as the main styling system.
- Atomic Design System for reusable components.
- Redux as state management.
- GraphQL for requests to Hasura.
- REST API for requests to backend services other than Hasura.

Out of initial scope:

- Database schema changes without a feature need.
- Full backend service replacement.
- Removing legacy routes before v3 is ready.
- Mobile-first implementation for all monitoring pages. Mobile must remain
  usable, but the primary target is operational desktop/tablet usage.

## Target User

- Operator: monitors processing, live view, LED, and vehicle transactions.
- Admin: manages users, vehicle classes, configuration, devices, and licenses.
- Supervisor: monitors dashboard, data center, and transaction summaries.

## Design Direction

The Web Apps should feel like an operational application that is quick to read
and easy to use. The UI must prioritize status, data, and actions over
decoration.

Principles:

- Clear hierarchy.
- Dense but readable.
- Fast action.
- Stable layout.
- Consistent component behavior.
- Explicit loading, empty, error, and offline states.

## App Sections

```text
Public
  Login
  Register
  Reset Password

Private
  Dashboard
  Monitoring
    Processing
    Live View
    LED Display
  Transaction
    Jatanlin
    Data Center
  Master Data
    User
    Vehicle Classes
  System
    Admin Setting
    Configuration & Device Registration
    License
    Guideline
```

## Definition of Done

A feature is considered complete when:

- The route is available.
- The UI follows the style guideline.
- Components use the appropriate atomic design level.
- Data requests follow GraphQL or REST rules.
- Local and global state are clear.
- Loading, empty, error, and unauthorized states are available.
- Permissions and auth guards are applied for private features.
- There is no direct coupling to legacy components except documented
  transitional adapters.
