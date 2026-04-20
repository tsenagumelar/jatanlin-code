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

## Target Behavior Paralel

- CCTV recorder harus bisa dipicu oleh session start/orchestration paralel, bukan hanya setelah ANPR sukses.
- Record request untuk flow session wajib membawa `session_id`.
- CCTV missing/timeout hanya memengaruhi status CCTV, bukan session secara keseluruhan.
- Jika CCTV gagal record atau timeout, tetap buat placeholder `transact_cctv` dengan `id` dan `session_id`; `filename`, `filepath`, dan metadata file boleh `NULL`.
- Rekaman late-arrival harus tetap dikaitkan ke session jika masih dalam batas window yang disepakati.

## Rules

- Jangan log RTSP credential.
- Recording file runtime tidak boleh di-commit.
- HTTP record endpoint harus punya durasi/timeout yang jelas.
- Insert CCTV harus idempotent atau punya key dedup yang stabil untuk retry queue.
