# Backend Feature: CCTV Streamer

## Source Area

- `cmd/cctv-streamer/main.go`

## Current Behavior dari Code

- Mode stream `rtsp` atau `onvif`.
- `rtsp`: baca URL dari `RTSP_URL` atau `CCTV_RTSP_URL`.
- `onvif`: resolve stream URI dari endpoint ONVIF, username/password, timeout, dan profile token.
- Dapat record on demand via HTTP server atau signal `SIGUSR1`.
- Dapat dummy mode via `CCTV_TRIGGER_DUMMY`.
- Upload recording ke MinIO dan enqueue insert `transact_cctv` via NATS subject `cctv.insert`.
- Endpoint record menerima `site_id` dan `session_id`; insert CCTV dapat menyimpan session ID jika diberikan trigger.
- Current legacy trigger dapat berasal dari ANPR handler setelah ANPR valid.
- Current code juga sudah memiliki jalur dummy yang dapat memastikan satu row dummy CCTV per session aktif saat mode dummy diaktifkan.
- Current code sekarang juga memiliki session listener mode real yang memonitor session `IN_PROGRESS` dan memulai recording otomatis tanpa menunggu trigger ANPR.

## Target Behavior Paralel

- CCTV recorder harus berjalan dari listener session aktif/database, bukan hanya setelah ANPR sukses.
- CCTV service harus memonitor `transact_wim_session` untuk `status = 'IN_PROGRESS'` pada site yang sama.
- Saat session aktif terdeteksi, CCTV service mulai tugas record untuk session tersebut.
- Selama task record untuk session itu masih berjalan, polling berikutnya tidak boleh memulai record kedua untuk `session_id` yang sama.
- Jika session selesai, service berhenti mengaitkan record baru ke session tersebut.
- Record request untuk flow session wajib membawa `session_id`.
- CCTV missing/timeout hanya memengaruhi status CCTV, bukan session secara keseluruhan.
- Jika CCTV gagal record atau timeout, tetap buat placeholder `transact_cctv` dengan `id` dan `session_id`; `filename`, `filepath`, dan metadata file boleh `NULL`.
- Rekaman late-arrival harus tetap dikaitkan ke session jika masih dalam batas window yang disepakati.
- CCTV target harus mulai bekerja berdasarkan session aktif, independen dari capture ANPR.
- Untuk satu `session_id`, hanya boleh ada satu row CCTV operasional.
- Metadata rekaman, file upload, dan hasil record final harus meng-update row CCTV session yang sama.

## Dummy Mode

- Dummy mode CCTV boleh diaktifkan untuk development/testing melalui config/env khusus.
- Jika dummy mode aktif, CCTV tetap harus menunggu session aktif atau trigger record berbasis session, tetapi tidak membaca stream kamera asli.
- Service membuat dummy output metadata/record ke `transact_cctv` dengan schema yang sama seperti mode real.
- Field file seperti `filename` dan `filepath` boleh memakai nilai dummy stabil atau `NULL`, sesuai tujuan test.
- Dummy insert CCTV harus idempotent per session/source agar tidak membuat duplicate saat service polling/retry.

## Rules

- Jangan log RTSP credential.
- Recording file runtime tidak boleh di-commit.
- HTTP record endpoint harus punya durasi/timeout yang jelas.
- Session listener CCTV harus menjaga hanya satu task recording aktif per `session_id`.
- Insert CCTV harus idempotent berbasis ownership row `session_id`; filename/path hanya key pendukung.
- Retry record atau rekaman ulang dalam session yang sama tidak boleh membuat row CCTV tambahan kecuali memang ada desain multi-record yang berbeda dan terdokumentasi.
- Jika dummy mode aktif, stream/record real tidak boleh ikut dijalankan pada session yang sama.
- Env runtime session listener CCTV:
  - `CCTV_SESSION_INTERVAL_SEC`
  - `CCTV_SESSION_RECORD_SECONDS`
  - `CCTV_TRIGGER_DUMMY`
  - `CCTV_DUMMY_INTERVAL_SEC`
