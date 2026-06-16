# Transaction - Jatanlin

## Route

`/v3/transaction/jatanlin`

## Access

Private.

## Purpose

Jatanlin shows the vehicle transaction/session list and acts as the entry point
to detail or verification.

## Main Content

- Transaction table.
- Search plat nomor.
- Filter tanggal.
- Filter status.
- Vehicle class filter.
- Location/unit filter if available.
- Export.
- Detail action.

## Data Request

GraphQL Hasura:

- Query transaction list.
- Query transaction count.
- Query filter options.
- Mutation to update status if the action is performed from the list.

REST API:

- Export if processed by the REST backend.
- Attachment URL helper if not served directly from a Hasura/MinIO public URL.

## Redux

Slice:

- `transactionSlice`

State:

- filters.
- sorting.
- selected transaction id.
- table density preference.

## UI Components

Molecules:

- SearchInput
- DateRangePicker
- StatusPill
- Pagination

Organisms:

- PageHeader
- FilterBar
- DataTable
- TransactionTable
- ExportDialog

Templates:

- ListPageTemplate

## States

- Loading list.
- Empty result.
- Error load data.
- Exporting.
- Unauthorized.

## Acceptance Criteria

- User can filter and search transactions.
- Pagination berjalan.
- Export is available if permission allows it.
- Row can open detail.
