# Dashboard

## Route

`/v3/dashboard`

## Access

Private.

## Purpose

The dashboard provides a summary of Jatanlin operational conditions after the
user signs in.

## Main Content

- Top metric cards:
  - ODOL vehicles.
  - Total violations.
  - Normal vehicles.
  - Today's violations.
- Today's transaction summary.
- Total vehicles.
- Total potential violations.
- Total verified and pending records.
- Main device status.
- Line chart for enforcement totals over the last 7 days with 3 series:
  - Over Dimension.
  - Over Loading.
  - Normal.
- Donut chart for violation distribution:
  - Over Dimension.
  - Over Loading.
  - Normal.
- Summary table for the latest 10 violation records with columns:
  - No.
  - Time.
  - Plat No.
  - Location.
  - Violation type.
  - Article.
  - Officer.
  - Status.
  - Action: View and Edit.
- Top violations:
  - Heaviest violating vehicle.
  - Violating vehicle dimensions: L x W x H.
  - Most frequent violation by article.
- Activity trend.
- Latest activity.

## Data Request

GraphQL Hasura:

- Query transaction metrics.
- Query latest transactions.
- Query device/config status if stored in Hasura.

REST API:

- Device health check if the status comes from the backend service.

## Redux

Uses:

- `authSlice` for user and permission data.
- `appShellSlice` for shell preferences.
- `notificationSlice` for error/action feedback.

Dashboard data is not stored globally unless it is needed across pages.

## UI Components

Molecules:

- MetricCard
- StatusItem
- ErrorState
- EmptyState

Organisms:

- PageHeader
- SensorStatusPanel
- ActivityList
- TrendChart

Templates:

- PrivateDashboardTemplate

## States

- Loading dashboard.
- Empty data.
- Partial data unavailable.
- Device health unavailable.
- Unauthorized.

## Acceptance Criteria

- Users can see the main operational status in the first viewport.
- Errors in one widget do not make the entire dashboard blank.
- Quick links to monitoring and transaction pages are available.
