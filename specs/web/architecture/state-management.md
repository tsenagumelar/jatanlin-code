# State Management

## Library

State management uses Redux.

Redux is used for:

- Auth state.
- User profile.
- App preferences.
- Sidebar state.
- Global notification.
- Selected operational context.
- Temporary UI workflow state used across pages.

Redux is not used for:

- Duplicating all GraphQL data without a need.
- Storing large tables.
- Storing long-running raw stream data.

## Store Structure

```text
src/redux/
  store.ts
  hooks.ts
  slices/
    authSlice.ts
    appShellSlice.ts
    notificationSlice.ts
    monitoringSlice.ts
    transactionSlice.ts
```

Feature-level slices are placed in the related module:

```text
src/modules/v3/{section}/{feature}/slices/
  {feature}Slice.ts
```

Slices used globally must be registered in `src/redux/store.ts`. Slices that
are not registered must not be used by the UI.

## Slice Guidelines

Auth:

- token/session state.
- user profile.
- login/logout.
- permission summary.

App shell:

- sidebar collapsed.
- active section if needed.
- theme density.

Notification:

- toast queue.
- global alert.
- command result feedback.

Monitoring:

- selected camera.
- selected lane/device.
- fullscreen preferences.

Transaction:

- selected filters that need to persist across routes.
- current transaction context if needed.

## Persistence

State that may persist:

- Auth/session.
- Sidebar preference.
- Lightweight user preferences.
- Last filters if they help operators.

State that must not persist:

- Loading state.
- Error state transient.
- Form draft sensitif.
- Data stream.
