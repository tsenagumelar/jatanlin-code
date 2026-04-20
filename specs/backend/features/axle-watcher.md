# Backend Feature: AXLE Watcher

## Source Area

- `cmd/axle-watcher/main.go`
- `internal/handler/axle_handler.go`
- `internal/handler/axle_queue.go`
- `internal/handler/session_service.go`

## Current Behavior dari Code

- Connect FTP dari env AXLE.
- Poll interval dari `AXLE_FTP_INTERVAL_SEC`.
- Proses file `.xml` saja.
- Parse XML VAC fields: plate, frame time, camera ID, external ID, length mm, total wheels, total axles, category, body type.
- Jika session aktif, collect file dalam session window dan pilih data valid dengan `total_axles > 0`.
- Cari image pasangan XML.
- Upload XML dan image ke MinIO bucket AXLE.
- Enqueue payload ke NATS subject `axle.insert`.
- NATS consumer upsert ke `transact_axle_capture`.
- Insert AXLE memakai `ON CONFLICT (external_id) DO UPDATE`.
- Current gap: session aktif dipakai untuk filter window, tetapi payload/insert AXLE belum konsisten membawa `session_id`.

## Target Behavior Paralel

- AXLE watcher harus berjalan independen saat ada session `IN_PROGRESS`.
- AXLE capture tidak boleh bergantung pada ANPR atau weighing.
- AXLE queue payload harus membawa `session_id` saat active session tersedia.
- Insert/upsert `transact_axle_capture` harus mengisi `session_id` untuk correlation utama.
- Jika AXLE missing atau invalid, status source AXLE harus bisa diverifikasi/adjust tanpa menggagalkan session.
- Jika AXLE missing sampai timeout/window selesai, tetap buat placeholder `transact_axle_capture` dengan `id` dan `session_id`; `external_id`, `total_axles`, file MinIO, dan metadata device boleh `NULL`.

## Rules

- Data dengan `total_axles <= 0` tidak boleh dipakai sebagai capture valid.
- Upsert harus mempertahankan idempotency external ID dan tidak menghilangkan `session_id` yang sudah valid.
- FTP/image readiness harus dilog jelas saat file belum lengkap.
