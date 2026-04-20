# Backend General

## Lokasi

`jatanlin-backend-services`

## Ringkasan Area

Backend Go untuk Jatanlin/WIM. Area ini berisi REST API kecil, ANPR FTP watcher, AXLE FTP watcher, CCTV streamer/recorder, dimension detection, MinIO upload, NATS JetStream queue insert, session-based processing, dan migration/schema database.

## Entrypoint

- `cmd/api/main.go`: API server untuk auth/profile/upload.
- `cmd/anpr-watcher/main.go`: ANPR FTP watcher, session-aware processing, MinIO upload, NATS enqueue, legacy WIM/CCTV trigger, optional dimension detection.
- `cmd/axle-watcher/main.go`: AXLE/VAC FTP watcher, session-aware processing, MinIO upload, NATS enqueue.
- `cmd/cctv-streamer/main.go`: CCTV RTSP/ONVIF streamer, record-on-demand, upload video, insert transact CCTV via queue.
- `cmd/dimension-sample/main.go`: sample runner untuk dimension detection/calibration.

## Session Behavior

- Session aktif dibaca dari PostgreSQL table `transact_wim_session` melalui `SessionService.GetActiveSession()`.
- Backend saat ini tidak subscribe langsung ke Hasura; Hasura hanya layer GraphQL untuk web di atas PostgreSQL.
- Target backend adalah paralel per source: ANPR, AXLE, CCTV, dan dimension tidak boleh bergantung pada keberhasilan source lain.
- Legacy behavior yang masih ada: ANPR watcher dapat trigger WB agent dan CCTV setelah ANPR valid. Ini harus dipindah ke orchestration berbasis session agar ANPR tidak menjadi gate.

## Main Database Tables

- `master_site`
- `master_user`
- `transact_wim_session`
- `transact_anpr_capture`
- `transact_axle_capture`
- `transact_dimension`
- `transact_weighing`
- `transact_cctv`

## Code Rules Backend

- Semua service harus fail fast jika `DATABASE_URL` kosong atau DB tidak bisa diping.
- Secret default tidak boleh hardcoded; pass/minio/jwt harus dari env/secret manager.
- Session-based processing wajib dipertahankan dengan `session_id` sebagai correlation key utama.
- Source capture tidak boleh saling memblokir; ANPR gagal tidak boleh menghentikan AXLE, CCTV, dimension, atau WB trigger/orchestration.
- Insert dari source eksternal wajib idempotent berdasarkan `session_id` dan `external_id` atau key lain yang stabil.
- NATS queue consumer harus `Ack` hanya setelah DB insert/upsert sukses.
- External trigger HTTP harus punya timeout dan tidak boleh memblokir watcher lama.
- Log connection string, password, token, MinIO secret, dan FTP password dilarang.
- API production harus set `AUTH_ENABLED=true` dan JWT secret kuat.
- CORS `AllowOrigins=*` harus diganti origin eksplisit untuk production.
- File runtime besar seperti video recording, local DB, cache, dan build output tidak boleh di-commit.
