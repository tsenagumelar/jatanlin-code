# Central Feature: Multi-Area Central Dashboard

## Objective

Menyediakan dashboard terpusat yang menampilkan data transaksi seluruh area dengan agregasi, analitik, dan drill-down tanpa mengubah alur operasional lokal area.

## Functional Requirements

### 1. Multi-Area Data Consolidation

- Sistem pusat menerima payload transaksi dari tiap area secara near realtime.
- Setiap record wajib membawa identitas asal: `site_id`, `site_code`, `source_system_id`, `event_time`, `ingested_at`.
- Record yang sama dari area yang sama harus di-upsert ke row pusat yang sama (idempotent).

### 2. Unified Transaction View

- Dashboard menampilkan daftar transaksi gabungan lintas area.
- Field minimum tampilan daftar:
  - waktu transaksi
  - area/site
  - nomor polisi (jika tersedia)
  - kelas kendaraan
  - status ODOL
  - status verifikasi
  - status kelengkapan source (ANPR/WB/AXLE/CCTV)
- Mendukung pagination, sorting, filter, dan pencarian.

### 3. KPI & Analytics

- KPI global:
  - total transaksi
  - total pelanggaran ODOL
  - rasio pelanggaran
  - top area by volume
  - top area by violation ratio
- Tren waktu (harian/mingguan/bulanan) untuk volume dan violation rate.
- Breakdown per area dan per kelas kendaraan.

### 4. Drill-Down per Area

- Pengguna dapat masuk ke detail area untuk melihat:
  - statistik area
  - daftar transaksi area
  - kualitas data area (missing source, delay ingestion)
- Pengguna dapat membuka detail transaksi pusat.

### 5. Data Quality & Sync Monitoring

- Dashboard menyediakan panel monitoring sinkronisasi:
  - last successful sync per area
  - latency ingestion per area
  - failure/retry counter
  - backlog event per area
- Alert status minimum: `HEALTHY`, `DEGRADED`, `DOWN`.

### 6. Access Control

- Role `CENTRAL_ADMIN`: akses semua area.
- Role `AREA_SUPERVISOR`: akses terbatas area tertentu.
- Role `AUDITOR`: read-only untuk area sesuai scope.
- Semua query wajib enforce scope area dari role claim.

## Non-Functional Requirements

- Availability central dashboard target: 99.5% (MVP).
- Ingestion harus at-least-once dengan idempotent upsert di pusat.
- Auditability: perubahan status verifikasi pusat harus tercatat actor + timestamp.
- Security: transport terenkripsi TLS, token/JWT antar sistem, tanpa admin secret di browser.
- Scalability: mampu menampung penambahan area tanpa perubahan arsitektur mayor.

## Technical Specification

## A. Topologi Sistem

```text
Area A Local DB ----\
Area B Local DB -----\
Area N Local DB ------> Area Sync Publisher -> Secure Transport -> Central Ingestion API/Queue
                                                              -> Central Normalize/Upsert Worker
                                                              -> Central PostgreSQL (OLTP read model)
                                                              -> Central Dashboard (Web + GraphQL/API)
```

## B. Integration Contract (Area -> Central)

- Opsi kirim data (direkomendasikan):
  - Event-based publish dari area setiap ada perubahan transaksi final/updated.
  - Scheduled backfill job per area (mis. tiap 5 menit) sebagai safety net.
- Payload minimum:
  - `event_id` (unik per event)
  - `event_type` (`TRANSACTION_UPSERT`, `VERIFICATION_UPDATED`, dst)
  - `event_version`
  - `site_id`, `site_code`
  - `transaction_id_local`
  - `session_id`
  - `occurred_at`
  - `payload` (snapshot field transaksi terstandar)
- Idempotency key pusat: `site_id + transaction_id_local` untuk snapshot transaksi, dan `event_id` untuk dedup event delivery.

## C. Central Data Model (MVP)

- `central_site`
  - identitas area/site, region, status aktif, metadata koneksi.
- `central_transaction`
  - satu row per transaksi lokal per site (`site_id + transaction_id_local` unique).
  - menyimpan field harmonisasi dari ANPR/WB/AXLE/CCTV dan status ODOL/verifikasi.
- `central_transaction_source_status`
  - status kelengkapan source per transaksi (`ANPR/WB/AXLE/CCTV/DIMENSION`).
- `central_sync_event_log`
  - log event ingestion, status proses, error message, retry count.
- `central_sync_health`
  - ringkasan health per area (last sync, latency, backlog).

## D. Query/API Layer

- Dashboard pusat dapat memakai stack serupa existing (`Next.js + GraphQL`) untuk efisiensi implementasi.
- Query utama:
  - `getCentralKpi(range, site_scope)`
  - `listCentralTransactions(filter, pagination, sort, site_scope)`
  - `getCentralTransactionDetail(id, site_scope)`
  - `getCentralSyncHealth(site_scope)`
- Semua query harus server-side enforce authorization by site scope.

## E. Sinkronisasi & Konsistensi

- Delivery semantics: at-least-once.
- Central worker wajib idempotent:
  - dedup by `event_id`
  - upsert snapshot by `site_id + transaction_id_local`
- Out-of-order event handling:
  - gunakan `occurred_at` + `version` check agar event lama tidak menimpa data baru.
- Backfill strategy:
  - per area job D-1/D-7 untuk rekonsiliasi completeness.

## F. Security

- Tiap area memiliki credential integrasi unik (client id/secret atau signed JWT).
- Rotasi credential terjadwal dan bisa revoke per area.
- Semua endpoint ingestion hanya menerima TLS + auth valid + signature/timestamp check.
- PII minimization: hanya field yang dibutuhkan dashboard pusat yang dikirim.

## G. Observability

- Metrics minimum:
  - ingestion throughput
  - success/fail rate
  - processing latency
  - dedup hit count
  - per-site last sync age
- Logging terstruktur dengan `site_id`, `event_id`, `transaction_id_local`, `trace_id`.
- Alerting:
  - tidak ada sync > X menit
  - fail rate > threshold
  - backlog meningkat kontinu

## H. Rollout Plan

- Phase 0: finalisasi schema pusat + kontrak payload + auth integrasi.
- Phase 1: pilot 1 area, validasi freshness/completeness.
- Phase 2: tambah 2-3 area, tuning performa query dashboard.
- Phase 3: rollout seluruh area + aktifkan monitoring/alert production.

## Open Decisions (Harus Diputuskan Sebelum Implementasi)

- Transport utama: direct HTTPS ingestion API vs message broker lintas area.
- Model data media bukti: simpan URL signed ke storage area vs replikasi media ke pusat.
- Source of truth verifikasi pusat: read-only mirror dari area atau bisa override di pusat.
- SLA final yang disepakati untuk freshness dan retention data historis.
