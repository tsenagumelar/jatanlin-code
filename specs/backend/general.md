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
- Target backend adalah paralel per source: ANPR, WB, AXLE, dan CCTV harus berjalan independen saat session aktif.
- Dimension adalah source turunan yang tetap bergantung pada data/image ANPR dalam `session_id` yang sama.
- Legacy behavior yang masih ada: ANPR watcher dapat trigger WB agent dan CCTV setelah ANPR valid. Ini harus dipindah ke orchestration berbasis session agar ANPR tidak menjadi gate.
- Implementasi ANPR dan AXLE saat ini sudah sama-sama memakai batas bawah `session.started_at` untuk memilih data source yang valid selama session masih `IN_PROGRESS`.
- Implementasi ANPR dan AXLE juga sudah memiliki dummy mode berbasis session aktif untuk development/testing.

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
- Setiap source backend wajib menerapkan ownership row tunggal per `session_id`.
- Retry polling, FTP re-scan, queue redelivery, dan klik `Mulai Ulang` dari web tidak boleh menghasilkan row source kedua untuk `session_id` yang sama.
- Pola tulis utama untuk flow baru adalah `ensure row exists by session_id -> update row with incoming data`.
- Source capture tidak boleh saling memblokir; ANPR gagal tidak boleh menghentikan AXLE, CCTV, atau WB trigger/orchestration.
- Dependency dimension ke ANPR image harus diperlakukan sebagai dependency source data, bukan dependency urutan proses session secara keseluruhan.
- Insert/update dari source eksternal wajib idempotent berdasarkan ownership row `session_id` dan key source yang stabil.
- Update tidak boleh menimpa data existing yang valid dengan payload retry yang lebih kosong, kecuali memang ada rule eksplisit untuk koreksi data.
- NATS queue consumer harus `Ack` hanya setelah DB insert/upsert sukses.
- External trigger HTTP harus punya timeout dan tidak boleh memblokir watcher lama.
- Log connection string, password, token, MinIO secret, dan FTP password dilarang.
- API production harus set `AUTH_ENABLED=true` dan JWT secret kuat.
- CORS `AllowOrigins=*` harus diganti origin eksplisit untuk production.
- File runtime besar seperti video recording, local DB, cache, dan build output tidak boleh di-commit.
