# Web Feature: GraphQL Data Layer

## Source Area

- `src/graphql/apollo-client.ts`
- `src/graphql/codegen.js`
- `src/graphql/queries/*.graphql`
- `src/graphql/hooks/*`
- `src/graphql/schema/types.ts`

## Integration

- Hasura HTTP endpoint dari `NEXT_PUBLIC_HASURA_URL`.
- Hasura WebSocket endpoint dari `NEXT_PUBLIC_HASURA_WS_IP`.
- Hasura admin secret dibaca dari `NEXT_PUBLIC_HASURA_SECRET`; ini hanya aman untuk local/dev.
- Auth cookie `authToken` dipakai oleh Apollo auth link.
- Site context dibaca dari `NEXT_PUBLIC_SITE_ID`.

## Operation Areas

- Auth: `Login`.
- Master role/user/vehicle class/configuration: CRUD, restore, soft delete, uniqueness checks.
- ANPR capture: list, by ID, by plate, date range, insert, update, soft delete, latest subscription.
- AXLE capture: list, by ID, by plate, date range, insert, update, soft delete, latest subscription.
- Weighing: list, by ID, by site, date range, insert, update, soft delete, latest subscription.
- Dimension: list, by ID, by ANPR, by site, insert, update, soft delete, latest subscription.
- CCTV: latest CCTV subscription.
- Vehicle actual: full relation fragment, list/detail/history/date-range, insert/update/soft delete, subscriptions.
- Vehicle status: full relation fragment, list/statistics, insert/batch/update/delete, subscriptions.
- WIM session: insert and update session.

## Rules

- Operation baru wajib diikuti `npm run codegen`.
- Jangan edit generated hooks manual.
- Production harus mengganti admin secret browser dengan JWT/role-based auth.
