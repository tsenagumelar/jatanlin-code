# Spesifikasi Backend Services

## Lokasi

`jatanlin-backend-services`

## Tujuan

`wim-service` adalah backend Go untuk API pendukung, FTP watcher ANPR/AXLE, upload file ke MinIO, queue insert ke PostgreSQL via NATS JetStream, session-based processing, trigger weighing ke `jatanlin-wb-agent`, dan trigger CCTV recorder.

## Stack

- Go `1.24`
- Fiber untuk REST API
- PostgreSQL via `pgx`
- FTP client `jlaffaye/ftp`
- MinIO SDK
- NATS JetStream
- JWT auth

## Binary/Entrypoint

- `cmd/api/main.go`: REST API.
- `cmd/anpr-watcher/main.go`: watcher FTP ANPR.
- `cmd/axle-watcher/main.go`: watcher FTP AXLE/VAC.
- `cmd/cctv-streamer/main.go`: CCTV streamer/recorder helper.
- `cmd/dimension-sample/main.go`: sample dimension detection.

## API Service

Endpoint:

- `GET /health`: health check.
- `POST /api/auth/login`: login user.
- `GET /api/auth/profile`: profile user, protected jika `AUTH_ENABLED=true`.
- `POST /api/attachment/upload`: upload image ke MinIO attachment bucket, protected jika `AUTH_ENABLED=true`.

Catatan:

- CORS saat ini allow all origin.
- `AUTH_ENABLED` default `false`; production harus explicitly `true`.
- JWT secret wajib kuat dan berasal dari environment.

## Konfigurasi Utama

- Site: `SITE_CODE`, `SITE_NAME`, `SITE_LOCATION`, `SITE_REGION`.
- Database: `DATABASE_URL`, optional `CENTRAL_DATABASE_URL`, `SYNC_ENABLED`.
- API: `API_PORT`, `JWT_SECRET`, `AUTH_ENABLED`.
- ANPR FTP: `ANPR_FTP_HOST`, user, password, dir, interval.
- AXLE FTP: `AXLE_FTP_HOST`, user, password, dir, interval.
- MinIO: bucket/endpoint/access/secret untuk ANPR, AXLE, attachment.
- Dimension: `DIMENSION_ENABLED`, model path, threshold, camera calibration.
- Session: `SESSION_WINDOW_SECONDS`.
- NATS: `NATS_URL`.
- Weighing trigger: `WEIGHING_TRIGGER_URL`, direction, timeout, save, dummy.
- CCTV trigger: enable, URL, seconds, dummy.

## Session-Based Processing

- `SessionService` membaca session aktif dari `transact_wim_session`.
- Session aktif adalah row dengan:
  - `site_id` sesuai site service.
  - `status = 'IN_PROGRESS'`.
  - `is_active = true`.
  - `is_deleted = false`.
- Window processing dihitung dari `started_at` sampai `started_at + SESSION_WINDOW_SECONDS`.
- ANPR/AXLE watcher skip file jika tidak ada session aktif.

## ANPR Watcher

Flow:

1. Watch FTP ANPR dan hanya proses file `.xml`.
2. Parse metadata XML: plate, frame time, location, camera ID, confidence, external ID.
3. Jika session aktif, collect batch file dalam window session.
4. Cari image pasangan XML.
5. Upload XML/full image/plate image ke MinIO.
6. Enqueue insert ke NATS JetStream subject `anpr.insert`.
7. Consumer insert ke `transact_anpr_capture`.
8. Optional trigger `jatanlin-wb-agent` melalui `WEIGHING_TRIGGER_URL`.
9. Optional trigger CCTV recorder.
10. Optional dimension detection jika `DIMENSION_ENABLED=true`.

Insert ANPR bersifat idempotent via `ON CONFLICT (external_id) DO NOTHING`.

## AXLE Watcher

Flow:

1. Watch FTP AXLE dan hanya proses file `.xml`.
2. Parse XML VAC: plate, frame time, camera ID, external ID, length, wheels, axles, category, body type.
3. Jika session aktif, collect file dalam window session.
4. Pilih data valid dengan `total_axles > 0`.
5. Cari image pasangan XML.
6. Upload XML/image ke MinIO.
7. Enqueue insert ke NATS JetStream subject `axle.insert`.
8. Consumer upsert ke `transact_axle_capture`.

Insert AXLE memakai `ON CONFLICT (external_id) DO UPDATE` agar metadata terbaru bisa memperbarui record.

## Queue

- ANPR stream: `ANPR_INSERT`, subject `anpr.insert`, consumer `anpr-insert-worker`.
- AXLE stream: `AXLE_INSERT`, subject `axle.insert`, consumer `axle-insert-worker`.
- Storage JetStream memakai file storage.
- Consumer pull fetch 1 message, manual ack, dan `Nak` saat insert gagal.

## MinIO Object

Object path memakai bucket dan date folder dari handler.

- ANPR menyimpan XML, full image, dan plate image.
- AXLE menyimpan XML dan image.
- Attachment API menyimpan upload user ke bucket attachment.

## Known Issues / Target Refactor

- Default credential dan endpoint di config loader harus diganti menjadi required env untuk production.
- FTP watcher perlu exponential backoff dan reconnect behavior yang lebih eksplisit.
- MinIO config perlu validasi startup jika upload wajib aktif.
- Search/filter data besar harus berada di Hasura/PostgreSQL, bukan frontend client-side.
- Correlation dan session lifecycle perlu dokumentasi schema yang disatukan dengan migration.
- Test otomatis belum terlihat di service; minimal perlu unit test parser XML, queue payload, trigger URL, dan auth.

## Aturan Perubahan

- Jangan mengubah format insert tabel tanpa migration dan update GraphQL query frontend terkait.
- Jangan membuat watcher memproses file di luar active session kecuali mode fallback sengaja diaktifkan.
- Semua trigger eksternal harus punya timeout agar watcher tidak blocking.
- Semua insert dari FTP/device harus tahan duplicate data.
