# App Structure

## Target Folder

V3 is created under:

```text
jatanlin-web-apps/app/v3
```

Route group:

```text
app/v3/
  layout.tsx
  page.tsx

  (public)/
    layout.tsx
    login/page.tsx
    register/page.tsx
    reset-password/page.tsx

  (private)/
    layout.tsx
    dashboard/page.tsx
    monitoring/
      processing/page.tsx
      live-view/page.tsx
      led-display/page.tsx
    transaction/
      jatanlin/page.tsx
      data-center/page.tsx
    master-data/
      user/page.tsx
      vehicle-classes/page.tsx
    system/
      admin-setting/page.tsx
      configuration-device-registration/page.tsx
      license/page.tsx
      guideline/page.tsx
```

## URL Structure

Public:

- `/v3/login`
- `/v3/register`
- `/v3/reset-password`

Private:

- `/v3/dashboard`
- `/v3/monitoring/processing`
- `/v3/monitoring/live-view`
- `/v3/monitoring/led-display`
- `/v3/transaction/jatanlin`
- `/v3/transaction/data-center`
- `/v3/master-data/user`
- `/v3/master-data/vehicle-classes`
- `/v3/system/admin-setting`
- `/v3/system/configuration-device-registration`
- `/v3/system/license`
- `/v3/system/guideline`

## Source Structure

```text
src/
  components/
    atoms/
    molecules/
    organisms/
    templates/

  modules/
    v3/
      public/
        login/
          index.tsx
          hooks.ts
          types.ts
          slices/
        register/
          index.tsx
          hooks.ts
          types.ts
          slices/
        reset-password/
          index.tsx
          hooks.ts
          types.ts
          slices/
      dashboard/
        index.tsx
        hooks.ts
        types.ts
        slices/
      monitoring/
        processing/
          index.tsx
          hooks.ts
          types.ts
          slices/
        live-view/
          index.tsx
          hooks.ts
          types.ts
          slices/
        led-display/
          index.tsx
          hooks.ts
          types.ts
          slices/
      transaction/
        jatanlin/
          index.tsx
          hooks.ts
          types.ts
          slices/
        data-center/
          index.tsx
          hooks.ts
          types.ts
          slices/
      master-data/
        user/
          index.tsx
          hooks.ts
          types.ts
          slices/
        vehicle-classes/
          index.tsx
          hooks.ts
          types.ts
          slices/
      system/
        admin-setting/
          index.tsx
          hooks.ts
          types.ts
          slices/
        configuration-device-registration/
          index.tsx
          hooks.ts
          types.ts
          slices/
        license/
          index.tsx
          hooks.ts
          types.ts
          slices/
        guideline/
          index.tsx
          hooks.ts
          types.ts
          slices/
      layout/
        index.tsx
        hooks.ts
        types.ts
        slices/
      shared/

  graphql/
    queries/
    mutations/
    hooks/

  services/
    rest/

  redux/
    slices/
    store.ts
    hooks.ts
```

## Route Adapter Rule

`page.tsx` only acts as an adapter:

```tsx
import { ProcessingPage } from "@/src/modules/v3/monitoring/processing";

export default function Page() {
  return <ProcessingPage />;
}
```

Business UI is not written directly in `app/v3/**/page.tsx`.

## Module File Rules

Each feature module in `src/modules/v3/**` follows this structure:

```text
feature-name/
  index.tsx
  hooks.ts
  types.ts
  slices/
```

File responsibilities:

- `index.tsx`: main feature view and UI composition.
- `hooks.ts`: functions, data fetching orchestration, handlers, and feature logic.
- `types.ts`: types/interfaces specific to the feature.
- `slices/`: Redux Toolkit slices for global feature state when needed.

If the feature does not need a Redux slice yet, the `slices/` folder may remain
with `.gitkeep` until the slice is created.

## Layout Rules

Public layout:

- Does not use the private sidebar.
- Centered auth layout.
- Redirects authenticated users to the dashboard.

Private layout:

- Auth guard.
- Sidebar.
- Topbar.
- Content shell.
- Global notification area.
