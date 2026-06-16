# Style Implementation Guideline

## Core Rule

Styling uses Tailwind CSS. Avoid custom CSS when Tailwind utilities are enough.

Custom CSS is only used for:

- Token global.
- Reset or base styles.
- Layout cases that are inefficient with utilities.
- Third-party component integration.

## Visual Direction

UI must be:

- Clean.
- Operational.
- Dense but readable.
- Light-first.
- Status-forward.
- Not overly decorative.

Avoid:

- Large gradients as the main visual element.
- Stacked cards without function.
- Heavy shadows.
- Colors that are too dark for every background.
- Fonts that are too large for operational dashboards.
- Inline styles without a reason.

## Tailwind Token Direction

Use semantic tokens through consistent classes:

```text
background app: bg-slate-50
surface: bg-white
surface subtle: bg-slate-100
border: border-slate-200
text primary: text-slate-950
text secondary: text-slate-600
text muted: text-slate-400
brand: blue
success: emerald
warning: amber
danger: red
info: sky
offline: slate
```

## Layout

Private shell:

- Sidebar width expanded: 256px.
- Sidebar width collapsed: 64px.
- Topbar height: 48px.
- Page padding: 16px or 24px.
- Content max width only if the page is not a monitoring page.

Monitoring pages:

- Use grid.
- Sensor status is visible in the first viewport.
- Avoid layouts that force operators to scroll to see the main status.

Form pages:

- Use max width so forms do not become too wide.
- Labels are always visible.
- Error per field.
- Submit action is sticky or clearly visible.

## Component Styling

Button:

- Primary for main actions.
- Secondary for supporting actions.
- Danger for destructive actions.
- Disabled state must be clear.

Badge/StatusPill:

- Must include a text label.
- Do not rely on color only.
- Use consistent colors per status.

Table:

- Header is sticky when scrolling.
- Row density compact.
- Action column on the right.
- Empty state in the table area.

Dialog:

- Use for short actions.
- For long forms, use a drawer or dedicated page.

## Responsive

Main targets:

- 1366x768.
- 1920x1080.
- 1024px tablet.

Mobile:

- Login, register, and reset password must be comfortable to use.
- Private pages must not overlap, but monitoring does not need to be fully
  featured on mobile.

## State Styling

Each page must design:

- Loading.
- Empty.
- Error.
- Unauthorized.
- Offline/degraded state if related to devices or streams.

## Implementation Notes

- Create small class compositions with helpers if classes become too long.
- Do not create ad hoc component variants in each feature.
- Atomic components must accept `className` for limited extension.
- Use the standard Tailwind spacing scale.
