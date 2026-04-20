# Backend Feature: ANPR Watcher

## Source Area

- `cmd/anpr-watcher/main.go`
- `internal/handler/anpr_handler.go`
- `internal/handler/anpr_queue.go`
- `internal/handler/session_service.go`

## Current Behavior dari Code

- Connect FTP dari env ANPR.
- Poll interval dari `ANPR_FTP_INTERVAL_SEC`.
- Proses file `.xml` saja, image dicari berdasarkan pasangan XML.
- Parse XML fields: plate, frame time, location, camera ID, confidence, external ID.
- Jika `SessionService` aktif, watcher hanya memproses file dalam session `IN_PROGRESS` dan window `SESSION_WINDOW_SECONDS`.
- Upload XML, full image, dan plate image ke MinIO bucket ANPR.
- Enqueue payload ke NATS subject `anpr.insert`.
- NATS consumer insert ke `transact_anpr_capture`.
- Insert ANPR idempotent dengan `ON CONFLICT (external_id) DO NOTHING`.
- Saat session aktif, ANPR payload/insert membawa `session_id`.
- Legacy behavior: ANPR watcher dapat trigger weighing ke `WEIGHING_TRIGGER_URL`, trigger CCTV recorder ke `CCTV_TRIGGER_URL`, dan optional dimension detection.

## Target Behavior Paralel

- ANPR watcher hanya bertanggung jawab pada capture ANPR dan penyimpanan data ANPR.
- ANPR sukses/gagal tidak boleh menjadi syarat mulai weighing, AXLE, dimension, atau CCTV.
- Trigger WB/CCTV dari ANPR handler harus dianggap legacy dan dipindahkan ke orchestration berbasis session.
- Jika ANPR missing sampai window/timeout selesai, session tetap valid dan source lain tetap diproses.
- Jika ANPR missing, tetap buat placeholder `transact_anpr_capture` dengan `id` dan `session_id`; `plate_no`, `external_id`, file MinIO, confidence, dan camera data boleh `NULL`.
- ANPR record harus selalu memakai `session_id` saat active session tersedia.

## Rules

- Jangan proses file di luar session aktif kecuali fallback eksplisit.
- External trigger legacy harus non-blocking dan punya timeout sampai refactor selesai.
- Insert harus idempotent berdasarkan `external_id`; untuk flow baru idealnya dedup juga mempertimbangkan `session_id`.
- Confidence rendah atau plate gagal dibaca harus masuk sebagai data invalid/missing untuk verifikasi, bukan menggagalkan session.
