# Atomic Design System

## Methodology

Reusable components follow Atomic Design:

- Atoms
- Molecules
- Organisms
- Templates
- Pages

The goal is to keep the v3 design consistent, maintainable, and free from
duplicated components across features.

## Atoms

Smallest reusable components.

Examples:

- Button
- IconButton
- Input
- Textarea
- Select
- Checkbox
- Radio
- Toggle
- Badge
- StatusPill
- Spinner
- Label
- Avatar
- Divider

Rules:

- No business domain knowledge.
- No data fetching.
- Simple props.
- Styling follows Tailwind tokens.

## Molecules

Combinations of atoms for small functions.

Examples:

- SearchInput
- FilterField
- DateRangePicker
- FormField
- StatusItem
- MetricCard
- EmptyState
- ErrorState
- Pagination
- ConfirmDialog

Rules:

- May have local UI state.
- Does not make direct server requests.
- Domain knowledge minimal.

## Organisms

Large components that form sections of a page.

Examples:

- Sidebar
- Topbar
- DataTable
- FilterBar
- PageHeader
- TransactionTable
- SensorStatusPanel
- EvidenceViewer
- DeviceRegistrationForm

Rules:

- May receive domain data from modules.
- May dispatch Redux for global UI state.
- Data fetching remains controlled in the module/page hook.

## Templates

Reusable layouts for composing pages.

Examples:

- AuthTemplate
- PrivateAppTemplate
- ListPageTemplate
- DetailPageTemplate
- MonitoringTemplate
- SettingsTemplate

Rules:

- Controls layout.
- Does not contain feature business logic.
- Receives slots or children.

## Pages

Page is the final composition for a feature.

Rules:

- Gets data through the module `hooks.ts`.
- Manages mutations/actions.
- Sends props to organisms.
- Defines loading, empty, and error states.

## Feature Module Contract

Each feature module must separate view, logic, types, and Redux state:

```text
feature/
  index.tsx
  hooks.ts
  types.ts
  slices/
```

- `index.tsx`: renders UI and composes atomic components.
- `hooks.ts`: event handlers, request orchestration, and data mapping.
- `types.ts`: props contracts, response mapping, and state shape.
- `slices/`: Redux Toolkit state for global or cross-route needs.
