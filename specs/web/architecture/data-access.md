# Data Access

## Rules

- All requests to Hasura use GraphQL.
- All requests to backend services other than Hasura use REST API.
- Features must not perform direct requests without a hook/service abstraction.
- Query, mutation, loading state, error state, and retry behavior must be clear.

## GraphQL For Hasura

Used for:

- User data from Hasura.
- Master data.
- Transaction Jatanlin.
- Vehicle classes.
- Configuration stored in Hasura.
- Dashboard metrics if the source is Hasura.

Structure:

```text
src/graphql/
  queries/
  mutations/
  hooks/
  schema/
```

Pattern:

```ts
const { data, loading, error, refetch } = useGetJatanlinTransactionsQuery();
```

Requirements:

- Queries and mutations are stored as `.graphql` files.
- Generated hooks or wrapper hooks are used in modules.
- Pagination uses GraphQL variables.
- Filters and sorting are sent through variables.
- After login, Hasura requests use `Authorization: Bearer <jwt>` from the
  backend service.
- `x-hasura-admin-secret` is only a development fallback when JWT is not yet
  available, not the user login mechanism.

## Auth JWT For Hasura

User login must not query `master_user` directly from the frontend.

Flow:

1. Frontend sends username/email and password to the REST backend.
2. Backend reads `master_user` and verifies `password_hash`.
3. Backend creates a JWT with Hasura claims.
4. Frontend stores the JWT as `authToken`.
5. Apollo Client sends the JWT to Hasura for subsequent queries/mutations.

Required JWT claim:

```json
{
  "https://hasura.io/jwt/claims": {
    "x-hasura-allowed-roles": ["admin"],
    "x-hasura-default-role": "admin",
    "x-hasura-user-id": "<master_user.id>",
    "x-hasura-role-id": "<master_role.id>",
    "x-hasura-role-code": "<master_role.code>"
  }
}
```

## REST API For Backend Services

Used for:

- Auth endpoint when not handled through Hasura.
- Device registration.
- License activation/validation.
- CCTV/live stream control.
- LED control.
- Capture trigger or operational command.
- Backend utility endpoint.

Structure:

```text
src/services/rest/
  client.ts
  auth.ts
  devices.ts
  license.ts
  led.ts
  live-view.ts
```

Requirements:

- REST client has a base URL from environment variables.
- Error responses are normalized.
- Command requests must have timeout handling.
- Endpoints that change state must show feedback to the user.

## Data Ownership

- Hasura is the main source for relational and transactional data.
- Backend REST is the source for commands, device operations, license, and
  integration actions.
- Redux stores application state, not a replacement for server state.
