# Central Dashboard Wireframe (Low Fidelity)

## 1) Overview Dashboard (Desktop)

```text
+--------------------------------------------------------------------------------------------------+
| Top Nav: [Logo] Data Center Dashboard      [Date Range] [Area Filter] [Search Plate/Txn] [User]|
+--------------------------------------------------------------------------------------------------+
| Sidebar:                         | KPI Cards                                                     |
| - Overview (active)              | [Total Txn] [Total ODOL] [Violation Rate] [Verified Rate]    |
| - Transactions                   | [Avg Ingestion Latency]                                       |
| - Sync & Data Quality            +---------------------------------------------------------------+
| - Area Detail                    | Trend Volume (Line/Bar)              | Trend Violation Rate  |
|                                  |                                       |                      |
|                                  +---------------------------------------+----------------------+
|                                  | Top Area by Volume                    | Top Area by Viol.    |
|                                  | (table mini)                          | (table mini)         |
|                                  +---------------------------------------------------------------+
|                                  | Area Health Table                                           |
|                                  | Site | Last Sync | p95 Latency | Backlog | Fail 24h |Status |
|                                  +---------------------------------------------------------------+
```

Interaction:
- Klik baris `Area Health Table` -> buka `Area Detail`.
- Klik KPI/legend chart -> apply filter global.

## 2) Transactions Monitor (Desktop)

```text
+--------------------------------------------------------------------------------------------------+
| Top Nav: [Logo] Transactions Monitor      [Date Range] [Area] [Status ODOL] [Status Verif]     |
+--------------------------------------------------------------------------------------------------+
| Quick Filters: [Missing ANPR] [Missing WB] [Missing AXLE] [Missing CCTV] [Missing DIMENSION]   |
+--------------------------------------------------------------------------------------------------+
| Table                                                                                             |
| Time       | Site   | Plate    | Vehicle Class | ODOL | Verify | Source Completeness | Latency  |
|------------+--------+----------+---------------+------+--------+---------------------+----------|
| ... rows ...                                                                                      |
+--------------------------------------------------------------------------------------------------+
| [Rows per page] [Pagination] [Export CSV]                                                         |
+--------------------------------------------------------------------------------------------------+
```

Interaction:
- Klik row -> `Transaction Detail` (fase berikutnya bisa deep-link ke detail existing).

## 3) Sync & Data Quality (Desktop)

```text
+--------------------------------------------------------------------------------------------------+
| Top Nav: Sync & Data Quality          [Only Degraded/Down] [Latency > x] [Backlog > x]         |
+--------------------------------------------------------------------------------------------------+
| Status Summary: [Healthy count] [Degraded count] [Down count] [Avg Freshness]                   |
+--------------------------------------------------------------------------------------------------+
| Health Table                                                                                        |
| Site | Last Event | Last Success Sync | p95 Latency | Backlog | Retry 24h | Error Last | Status |
+--------------------------------------------------------------------------------------------------+
| Event Failure Timeline (last 24h)                                                                  |
| [time-series chart]                                                                                |
+--------------------------------------------------------------------------------------------------+
```

## 4) Area Detail (Desktop)

```text
+--------------------------------------------------------------------------------------------------+
| Breadcrumb: Overview / Area Detail / {Site Name}            [Date Range] [Compare Prev Period]  |
+--------------------------------------------------------------------------------------------------+
| KPI Area: [Total Txn] [Total ODOL] [Violation Rate] [Verified Rate] [Avg Latency]               |
+--------------------------------------------------------------------------------------------------+
| Trend Txn Area                      | Trend Violation Area                                       |
+-------------------------------------+------------------------------------------------------------+
| Recent Transactions (area scoped table)                                                           |
+--------------------------------------------------------------------------------------------------+
| Open Issues (sync/data quality): [issue list with severity]                                       |
+--------------------------------------------------------------------------------------------------+
```

## 5) Mobile Layout (MVP)

```text
+------------------------------------+
| Top Bar: Data Center [Filter Icon] |
+------------------------------------+
| KPI Carousel                        |
| [Txn] [ODOL] [Viol%] [Latency]      |
+------------------------------------+
| Chart Tabs: [Volume] [Violation]   |
| [single chart area]                |
+------------------------------------+
| Area Health List                   |
| - Site A  DEGRADED  3m latency     |
| - Site B  HEALTHY   40s latency    |
+------------------------------------+
| Bottom Nav                         |
| [Overview] [Txn] [Sync] [Area]     |
+------------------------------------+
```

Mobile principles:
- Prioritaskan ringkasan + status health.
- Tabel penuh tetap di desktop/tablet; mobile pakai list + detail sheet.

## Notes Implementasi UI

- Gunakan status color konsisten:
  - `HEALTHY` = hijau
  - `DEGRADED` = kuning
  - `DOWN` = merah
- Semua angka KPI tampil dengan:
  - absolute value
  - delta vs periode sebelumnya
- Empty/error state wajib eksplisit:
  - `No data in selected range`
  - `Sync data unavailable`
