# Web Apps Specification

This document is the new reference for the Jatanlin Web Apps refactor.

V3 is built as a new design while preserving the existing process flow as much
as possible. The technical implementation uses Next.js, Tailwind CSS, Redux,
GraphQL for Hasura, and REST API for non-Hasura backend needs.

## Technology Rules

- Framework: Next.js App Router.
- Language: TypeScript.
- Styling: Tailwind CSS.
- Component methodology: Atomic Design System.
- State management: Redux.
- Hasura data request: GraphQL.
- Backend service request: REST API.
- Routing target: `jatanlin-web-apps/app/v3`.

## Feature Map

Public:

- [Login](./features/public/login.md)
- [Register](./features/public/register.md)
- [Reset Password](./features/public/reset-password.md)

After Login:

- [Dashboard](./features/dashboard/dashboard.md)
- Monitoring
  - [Processing](./features/monitoring/processing.md)
  - [Live View](./features/monitoring/live-view.md)
  - [LED Display](./features/monitoring/led-display.md)
- Transaction
  - [Jatanlin](./features/transaction/jatanlin.md)
  - [Data Center](./features/transaction/data-center.md)
- Master Data
  - [User](./features/master-data/user.md)
  - [Vehicle Classes](./features/master-data/vehicle-classes.md)
- System
  - [Admin Setting](./features/system/admin-setting.md)
  - [Configuration & Device Registration](./features/system/configuration-device-registration.md)
  - [License](./features/system/license.md)
  - [Guideline](./features/system/guideline.md)

## Foundation Docs

- [General](./general.md)
- [App Structure](./architecture/app-structure.md)
- [Data Access](./architecture/data-access.md)
- [State Management](./architecture/state-management.md)
- [Atomic Design System](./architecture/atomic-design-system.md)
- [Private Layout](./architecture/private-layout.md)
- [Style Implementation Guideline](./guidelines/style-implementation.md)
