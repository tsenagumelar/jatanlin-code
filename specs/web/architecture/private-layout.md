# Private Layout

## Purpose

Private layout is the main shell for all pages after the user signs in to Web
Apps v3.

The layout follows the v2 pattern:

- Left: sidebar.
- Right: navbar on top and content below.

## Route Scope

Used by:

```text
app/v3/(private)/layout.tsx
```

All routes inside `(private)` automatically use this layout.

## Structure

```text
V3AppShell
  Sidebar
    Brand
    Menu Sections
    Site Info
    Copyright

  Main Area
    Navbar
      Burger Button
      Date Time Info
      Notification Button
      User Info
      User Menu
    Content
      Page Header
      Breadcrumb
      Page Body
```

## Sidebar

The sidebar has two modes:

- Expanded: shows menu icons and labels.
- Collapsed: shows only menu icons.

Menu:

- Dashboard
- Monitoring
  - Processing
  - Live View
  - LED Display
- Transaction
  - Jatanlin
  - Data Center
- Master Data
  - User
  - Vehicle Classes
- System
  - Admin Setting
  - Configuration & Device Registration
  - License
  - Guideline

Bottom sidebar content:

- Site name.
- Site code and location.
- Copyright.

When the sidebar is collapsed, site information is replaced with a small
indicator with a tooltip/title.

## Navbar

Navbar is located at the top of the right area.

Content:

- Burger button to expand/collapse the sidebar.
- Day, date, and time information.
- Notification icon.
- User info: photo, username/full name, role.

User menu:

- Profile.
- Logout.

Behavior:

- Clicking the burger button changes the sidebar state.
- Clicking user info opens the popup menu.
- Clicking Profile opens the user detail popup.
- Clicking Logout clears the session and redirects to `/v3/login`.

## Content Area

The content area is located below the navbar on the right side.

Rules:

- Content uses the full available width of the right area.
- Top, bottom, left, and right margin/padding must be consistent.
- Content area scrolls vertically on its own.
- Sidebar and navbar do not scroll.
- Avoid a global `max-width` in the content shell, except for specific pages
  that need a constrained layout such as small forms.

Default page header:

- Breadcrumb above the title.
- Title is placed at the top-left of the content.
- Body content is placed below the header.

All v3 menu routes must have at least a page with title and breadcrumb, even if
the feature is not fully implemented yet.

## Profile Popup

Profile popup shows:

- User photo.
- Full name.
- Role.
- Email.
- Username.
- Badge number.
- Role code.

The popup can be closed with the close button.

## Implementation Rules

File module:

```text
src/modules/v3/layout/
  index.tsx
  hooks.ts
  types.ts
  slices/
```

Responsibilities:

- `index.tsx`: renders sidebar, navbar, content, popup menu, and profile modal.
- `hooks.ts`: handles collapse state, user menu, profile modal, realtime clock,
  and logout handler.
- `types.ts`: defines props contracts and menu items.
- `slices/`: prepared for Redux Toolkit if shell state needs to be persisted.

## Routes

Required routes:

```text
/v3/dashboard
/v3/monitoring/processing
/v3/monitoring/live-view
/v3/monitoring/led-display
/v3/transaction/jatanlin
/v3/transaction/data-center
/v3/master-data/user
/v3/master-data/vehicle-classes
/v3/system/admin-setting
/v3/system/configuration-device-registration
/v3/system/license
/v3/system/guideline
```
