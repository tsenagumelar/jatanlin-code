# Central Feature: Data Center Dashboard (MVP)

## Objective

Menyediakan dashboard terpusat untuk memonitor performa operasional lintas area/site secara near realtime, termasuk KPI nasional, kualitas data source, dan status sinkronisasi area ke data center.

## User Roles

- `CENTRAL_ADMIN`
  - Akses semua area.
- `AREA_SUPERVISOR`
  - Akses area yang diizinkan saja.
- `AUDITOR`
  - Read-only, tanpa aksi perubahan.

## Screen Scope (MVP)

- `Overview Dashboard`
  - KPI nasional/regional + tren + tabel ringkas area.
- `Transactions Monitor`
  - Daftar transaksi lintas area dengan filter lengkap.
- `Sync & Data Quality`
  - Monitoring health sinkronisasi per area.
- `Area Detail`
  - Drill-down per area (KPI area, trend area, issue area).

## Functional Requirements

## A. Overview Dashboard

- Menampilkan KPI utama:
  - total transaksi
  - total ODOL
  - violation rate
  - verified rate
  - avg ingestion latency
- Menampilkan tren volume transaksi (hari/minggu/bulan).
- Menampilkan top 5 area berdasarkan:
  - volume tertinggi
  - violation rate tertinggi
- Menampilkan status health area:
  - `HEALTHY`, `DEGRADED`, `DOWN`

## B. Transactions Monitor

- Tabel transaksi lintas area dengan kolom minimum:
  - waktu transaksi
  - area/site
  - plate_no
  - kelas kendaraan
  - status ODOL
  - status verifikasi
  - source completeness (ANPR/WB/AXLE/CCTV/DIMENSION)
  - ingestion latency
- Fitur:
  - pagination
  - sort per kolom
  - filter: rentang waktu, area, status verifikasi, status ODOL, source missing
  - search: plate / transaction id lokal / session id
- Klik row membuka `Transaction Detail` (fase detail bisa reuse halaman existing di fase berikutnya).

## C. Sync & Data Quality

- Tabel health per area dengan field:
  - last sync success
  - last event ingested
  - p95 latency
  - backlog count
  - fail/retry count (24 jam)
  - health status
- Menyediakan quick filter:
  - only degraded/down
  - latency > threshold
  - backlog > threshold

## D. Area Detail

- Menampilkan:
  - KPI area
  - trend transaksi area
  - trend violation area
  - daftar issue sinkronisasi area
  - recent transactions area

## Non-Functional Requirements

- Dashboard query p95:
  - overview < 2 detik
  - transaksi filter 30 hari semua area < 3 detik
- Freshness data p95 <= 5 menit.
- Semua query harus enforce scope area berdasarkan role claim.
- Semua data tabel harus exportable CSV (MVP minimal pada halaman Transactions).

## Data Contract (Read Model)

- `central_site`
- `central_transaction`
- `central_transaction_source_status`
- `central_sync_health`
- `central_sync_event_log`

Key index minimum:
- `central_transaction(site_id, event_time desc)`
- `central_transaction(plate_no)`
- `central_transaction(status_verification, status_odol)`
- `central_sync_health(site_id, updated_at desc)`

## API/Query Contract (MVP)

- `getCentralOverview(range, site_scope)`
- `getCentralOverviewTrends(range, bucket, site_scope)`
- `listCentralTransactions(filter, pagination, sort, site_scope)`
- `getCentralSyncHealth(filter, site_scope)`
- `getCentralAreaDetail(site_id, range, site_scope)`

## Permissions

- `CENTRAL_ADMIN`: unrestricted `site_scope`.
- `AREA_SUPERVISOR`: query auto-inject `site_scope IN assigned_sites`.
- `AUDITOR`: read-only; disable action buttons jika nanti ada fitur write.

## Edge Cases

- Event out-of-order tidak boleh menimpa data lebih baru.
- Area tanpa traffic harus tetap muncul pada health table.
- Saat source missing (mis. ANPR null), transaksi tetap tampil dan ditandai incomplete.

## Acceptance Criteria

- User dapat melihat KPI lintas area sesuai role scope.
- User dapat memfilter transaksi lintas area dan melihat status source completeness.
- User dapat mendeteksi area yang `DEGRADED`/`DOWN` dari panel sync health.
- User dapat drill-down ke area detail dari overview table.
