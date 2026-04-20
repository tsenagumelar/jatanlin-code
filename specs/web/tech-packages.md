# Web Tech & Packages

## Tech Stack

- Runtime/build: Node.js dengan Next.js App Router.
- Framework UI: React 19 dan Next.js 16.
- Bahasa: TypeScript 5.9.
- Styling: Tailwind CSS 4 dan Fluent UI React Components.
- State management: Redux Toolkit, React Redux, Redux Persist, dan React Context untuk processing session.
- Data layer: Apollo Client, GraphQL HTTP, GraphQL WebSocket subscription, dan generated hooks dari GraphQL Code Generator.
- Export dokumen: `xlsx`, `jspdf`, dan `jspdf-autotable`.
- Charting/dashboard: Recharts.
- Date/time: Moment dan native `Intl`/`Date` formatting.
- Deployment: Dockerfile dan GitHub Actions docker publish workflow.

## Package Direct Dependencies

- `@apollo/client@^3.14.0`: Apollo GraphQL client, HTTP link, error link, cache, split link, subscriptions.
- `@fluentui/react-components@^9.72.9`: komponen UI utama seperti Button, Card, Spinner, Toast, Dialog.
- `@fluentui/react-icons@^2.0.316`: icon Fluent UI.
- `@reduxjs/toolkit@^2.11.2`: Redux store dan slice.
- `dotenv@^17.2.3`: load env untuk tooling/codegen.
- `graphql@^16.12.0`: GraphQL runtime/types.
- `graphql-ws@^6.0.6`: GraphQL subscription melalui WebSocket.
- `jspdf@^3.0.4`: generate PDF.
- `jspdf-autotable@^5.0.2`: table PDF export.
- `moment@^2.30.1`: formatting timestamp untuk nama file export dan UI.
- `next@16.1.1`: framework aplikasi.
- `react@19.2.3`: React runtime.
- `react-dom@19.2.3`: DOM renderer.
- `react-redux@^9.2.0`: binding Redux ke React.
- `recharts@^3.6.0`: grafik dashboard.
- `redux-persist@^6.0.0`: persist login/session state.
- `xlsx@^0.18.5`: export Excel.

## Package Dev Dependencies

- `@graphql-codegen/cli@^6.0.1`: CLI generate GraphQL artifacts.
- `@graphql-codegen/client-preset@^5.1.1`: preset client GraphQL.
- `@graphql-codegen/introspection@^5.0.0`: introspection output.
- `@graphql-codegen/near-operation-file-preset@^3.1.0`: generated hooks dekat operation file.
- `@graphql-codegen/typescript@^5.0.2`: TypeScript schema types.
- `@graphql-codegen/typescript-operations@^5.0.2`: operation types.
- `@graphql-codegen/typescript-react-apollo@^3.3.7`: React Apollo hooks.
- `@tailwindcss/postcss@^4`: Tailwind PostCSS integration.
- `@types/node@^20`: Node types.
- `@types/react@^19`: React types.
- `@types/react-dom@^19`: React DOM types.
- `eslint@^9`: linting.
- `eslint-config-next@16.1.1`: Next.js ESLint config.
- `tailwindcss@^4`: CSS framework.
- `typescript@5.9.3`: TypeScript compiler.

## Scripts

- `npm run dev`: menjalankan Next.js development server.
- `npm run build`: build production.
- `npm run start`: start production build.
- `npm run lint`: menjalankan ESLint.
- `npm run codegen`: generate GraphQL hooks dari `src/graphql/codegen.js`.
