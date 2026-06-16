# Transaction - Data Center

## Route

`/v3/transaction/data-center`

## Access

Private.

## Purpose

Data Center provides cross-unit/location monitoring and recaps for supervisor
or central needs.

## Main Content

- Daftar unit/lokasi.
- Status koneksi per unit.
- Summary transaksi per unit.
- Violation trend.
- Drilldown ke transaksi unit.

## Data Request

GraphQL Hasura:

- Unit/location data.
- Aggregated transaction metrics.
- Latest transaction by unit.

REST API:

- Health check service per unit if available from the backend.

## Redux

Slice:

- `transactionSlice`

State:

- selected unit.
- selected period.
- selected metric.

## UI Components

Molecules:

- MetricCard
- StatusItem
- FilterField

Organisms:

- UnitStatusGrid
- DataCenterMap
- TrendChart
- DataTable

Templates:

- DashboardTemplate

## States

- Loading.
- No unit configured.
- Partial unit offline.
- Error aggregation.

## Acceptance Criteria

- Supervisor can see the status of all units.
- Unit offline terlihat jelas.
- User can drill down to related transactions.
