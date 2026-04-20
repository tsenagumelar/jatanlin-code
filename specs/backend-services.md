# Spesifikasi Backend Services

## Lokasi

`jatanlin-backend-services`

## Ringkasan Area

Backend Go untuk Jatanlin/WIM. Area ini berisi REST API kecil, ANPR FTP watcher, AXLE FTP watcher, CCTV streamer/recorder, dimension detection, MinIO upload, NATS JetStream queue insert, session-based processing, trigger weighing ke `jatanlin-wb-agent`, trigger CCTV, dan migration/schema database.

## Tech Stack

- Bahasa/runtime: Go `1.24.0`, toolchain `go1.24.11`.
- Web framework API: Fiber v2.
- Database: PostgreSQL via pgx stdlib.
- Auth: JWT v5 dan bcrypt/crypto.
- FTP integration: `jlaffaye/ftp`.
- Object storage: MinIO Go SDK.
- Queue: NATS JetStream.
- CCTV/streaming: ONVIF, RTSP client `gortsplib`, RTP `pion/rtp`, dan ffmpeg command-line untuk recording.
- Config: env dan `.env` via `godotenv`.
- Deployment: Dockerfile, Portainer stack templates, GitHub Actions docker publish workflow.

## Direct Go Packages

- `github.com/0x524a/onvif-go@v1.1.4`: ONVIF camera integration untuk resolve stream URI.
- `github.com/bluenviron/gortsplib/v4@v4.16.2`: RTSP client untuk CCTV stream.
- `github.com/gofiber/fiber/v2@v2.52.10`: REST API server dan middleware.
- `github.com/golang-jwt/jwt/v5@v5.3.0`: JWT create/verify.
- `github.com/google/uuid@v1.6.0`: UUID handling.
- `github.com/jackc/pgx/v5@v5.7.6`: PostgreSQL driver/stdlib.
- `github.com/jlaffaye/ftp@v0.2.0`: FTP watcher connection/list/retrieve.
- `github.com/joho/godotenv@v1.5.1`: load `.env`.
- `github.com/minio/minio-go/v7@v7.0.97`: MinIO/S3 compatible upload.
- `github.com/nats-io/nats.go@v1.48.0`: NATS JetStream queue.
- `github.com/pion/rtp@v1.10.0`: RTP packet handling.
- `golang.org/x/crypto@v0.46.0`: crypto helpers, termasuk password hashing support.

## Indirect Go Packages

- `github.com/andybalholm/brotli@v1.1.0`
- `github.com/bluenviron/mediacommon/v2@v2.4.1`
- `github.com/dustin/go-humanize@v1.0.1`
- `github.com/go-ini/ini@v1.67.0`
- `github.com/hashicorp/errwrap@v1.0.0`
- `github.com/hashicorp/go-multierror@v1.1.1`
- `github.com/jackc/pgpassfile@v1.0.0`
- `github.com/jackc/pgservicefile@v0.0.0-20240606120523-5a60cdf6a761`
- `github.com/jackc/puddle/v2@v2.2.2`
- `github.com/klauspost/compress@v1.18.0`
- `github.com/klauspost/cpuid/v2@v2.2.11`
- `github.com/klauspost/crc32@v1.3.0`
- `github.com/kr/text@v0.2.0`
- `github.com/mattn/go-colorable@v0.1.13`
- `github.com/mattn/go-isatty@v0.0.20`
- `github.com/mattn/go-runewidth@v0.0.16`
- `github.com/minio/crc64nvme@v1.1.0`
- `github.com/minio/md5-simd@v1.1.2`
- `github.com/nats-io/nkeys@v0.4.11`
- `github.com/nats-io/nuid@v1.0.1`
- `github.com/philhofer/fwd@v1.2.0`
- `github.com/pion/logging@v0.2.3`
- `github.com/pion/randutil@v0.1.0`
- `github.com/pion/rtcp@v1.2.15`
- `github.com/pion/sdp/v3@v3.0.15`
- `github.com/pion/srtp/v3@v3.0.6`
- `github.com/pion/transport/v3@v3.0.7`
- `github.com/rivo/uniseg@v0.2.0`
- `github.com/rogpeppe/go-internal@v1.14.1`
- `github.com/rs/xid@v1.6.0`
- `github.com/tinylib/msgp@v1.3.0`
- `github.com/valyala/bytebufferpool@v1.0.0`
- `github.com/valyala/fasthttp@v1.51.0`
- `github.com/valyala/tcplisten@v1.0.0`
- `golang.org/x/net@v0.47.0`
- `golang.org/x/sync@v0.19.0`
- `golang.org/x/sys@v0.39.0`
- `golang.org/x/text@v0.32.0`
- `gopkg.in/yaml.v3@v3.0.1`

## Entrypoint dan Feature

- `cmd/api/main.go`: API server untuk auth/profile/upload.
- `cmd/anpr-watcher/main.go`: ANPR FTP watcher, session-aware processing, MinIO upload, NATS enqueue, WIM trigger, CCTV trigger, optional dimension detection.
- `cmd/axle-watcher/main.go`: AXLE/VAC FTP watcher, session-aware processing, MinIO upload, NATS enqueue.
- `cmd/cctv-streamer/main.go`: CCTV RTSP/ONVIF streamer, record-on-demand, upload video, insert transact CCTV via queue.
- `cmd/dimension-sample/main.go`: sample runner untuk dimension detection/calibration.

## API Service Feature

- `GET /health`: health response `{status: ok, service: wim-service}`.
- `POST /api/auth/login`: login user dengan username/password dan JWT response.
- `GET /api/auth/profile`: profile user dari token, protected jika `AUTH_ENABLED=true`.
- `POST /api/attachment/upload`: upload image attachment ke MinIO, protected jika `AUTH_ENABLED=true`.
- Middleware: recover, logger, CORS allow all origin/methods configured in code.
- Auth can be disabled by env `AUTH_ENABLED=false`; production harus true.

## ANPR Watcher Feature

- Connect FTP dari env ANPR.
- Poll interval dari `ANPR_FTP_INTERVAL_SEC`.
- Proses file `.xml` saja, image dicari berdasarkan pasangan XML.
- Parse XML fields: plate, frame time, location, camera ID, confidence, external ID.
- Jika `SessionService` aktif, watcher hanya memproses file dalam session `IN_PROGRESS` dan window `SESSION_WINDOW_SECONDS`.
- Upload XML, full image, dan plate image ke MinIO bucket ANPR.
- Insert tidak langsung ke DB dari handler utama; handler enqueue payload ke NATS subject `anpr.insert`.
- NATS consumer insert ke `transact_anpr_capture`.
- Insert ANPR idempotent dengan `ON CONFLICT (external_id) DO NOTHING`.
- Optional trigger weighing ke URL `WEIGHING_TRIGGER_URL`, default mengarah ke `jatanlin-wb-agent` endpoint `/ws/wim/anpr-capture`.
- Optional trigger CCTV recorder ke `CCTV_TRIGGER_URL`.
- Optional dimension detection jika `DIMENSION_ENABLED=true`.

## AXLE Watcher Feature

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

## CCTV Streamer Feature

- Mode stream `rtsp` atau `onvif`.
- `rtsp`: baca URL dari `RTSP_URL` atau `CCTV_RTSP_URL`.
- `onvif`: resolve stream URI dari endpoint ONVIF, username/password, timeout, dan profile token.
- Dapat record on demand via HTTP server atau signal `SIGUSR1`.
- Dapat dummy mode via `CCTV_TRIGGER_DUMMY`.
- Upload recording ke MinIO dan enqueue insert `transact_cctv` via NATS subject `cctv.insert`.
- Menyimpan site/session ID jika diberikan oleh trigger.
- Redact RTSP URL saat logging.

## Dimension Feature

- `DimensionHandler` menggunakan `vision.DimensionService`.
- Camera calibration dari env: focal length, image size, camera height, tilt angle, reference pixel/real length, reference distance.
- Dapat process image standalone atau ANPR image.
- Hasil dimension berisi length, width, height, distance, confidence, center point, class info.
- Untuk ANPR image, handler mencari `transact_anpr_capture` dari `external_id` dan insert ke `transact_dimension`.
- Ada fallback table `vehicle_dimensions` untuk save result generic.
- Detector saat ini masih perlu validasi production sesuai catatan code/README.

## Queue Feature

- ANPR stream: `ANPR_INSERT`, subject `anpr.insert`, consumer `anpr-insert-worker`.
- AXLE stream: `AXLE_INSERT`, subject `axle.insert`, consumer `axle-insert-worker`.
- CCTV stream: `CCTV_INSERT`, subject `cctv.insert`, consumer `cctv-insert-worker`.
- JetStream storage: file storage.
- Consumer: pull subscribe, fetch 1, manual ack, `Nak` saat gagal agar retry.
- Message ID header dipakai untuk ANPR/AXLE external ID agar duplicate publish lebih terkendali.

## Config Area

- Site: `SITE_CODE`, `SITE_NAME`, `SITE_LOCATION`, `SITE_REGION`.
- Database: `DATABASE_URL`, optional `CENTRAL_DATABASE_URL`, `SYNC_ENABLED`.
- API: `API_PORT`, `JWT_SECRET`, `AUTH_ENABLED`.
- ANPR FTP: `ANPR_FTP_HOST`, `ANPR_FTP_USER`, `ANPR_FTP_PASS`, `ANPR_FTP_DIR`, `ANPR_FTP_INTERVAL_SEC`.
- AXLE FTP: `AXLE_FTP_HOST`, `AXLE_FTP_USER`, `AXLE_FTP_PASS`, `AXLE_FTP_DIR`, `AXLE_FTP_INTERVAL_SEC`.
- ANPR MinIO: `ANPR_MINIO_ENDPOINT`, `ANPR_MINIO_ACCESS_KEY`, `ANPR_MINIO_SECRET_KEY`, `ANPR_MINIO_BUCKET`, `ANPR_MINIO_USE_SSL`.
- AXLE MinIO: `AXLE_MINIO_ENDPOINT`, `AXLE_MINIO_ACCESS_KEY`, `AXLE_MINIO_SECRET_KEY`, `AXLE_MINIO_BUCKET`, `AXLE_MINIO_USE_SSL`.
- Attachment MinIO: `ATTACHMENT_MINIO_ENDPOINT`, `ATTACHMENT_MINIO_ACCESS_KEY`, `ATTACHMENT_MINIO_SECRET_KEY`, `ATTACHMENT_MINIO_BUCKET`, `ATTACHMENT_MINIO_USE_SSL`.
- Dimension: `DIMENSION_ENABLED`, `DIMENSION_MODEL_PATH`, `DIMENSION_THRESHOLD`.
- Camera calibration: `CAMERA_FOCAL_LENGTH`, `CAMERA_IMAGE_WIDTH`, `CAMERA_IMAGE_HEIGHT`, `CAMERA_HEIGHT_METERS`, `CAMERA_TILT_ANGLE`, `CAMERA_REF_PIXEL_LENGTH`, `CAMERA_REF_REAL_LENGTH`, `CAMERA_REF_DISTANCE`.
- Session: `SESSION_WINDOW_SECONDS`.
- NATS: `NATS_URL`.
- Weighing trigger: `WEIGHING_TRIGGER_URL`, `WEIGHING_TRIGGER_DIRECTION`, `WEIGHING_TRIGGER_TIMEOUT_SECONDS`, `WEIGHING_TRIGGER_SAVE`, `WEIGHING_TRIGGER_DUMMY`.
- CCTV trigger: `CCTV_TRIGGER_ENABLED`, `CCTV_TRIGGER_URL`, `CCTV_TRIGGER_SECONDS`, `CCTV_TRIGGER_DUMMY`.

## Database/Migration Area

- `migrations/ddl.sql`: base schema dump/DDL.
- `migrations/20250103_add_wim_session.sql`: session table addition.
- `migrations/20250103_drop_master_wim_session.sql`: drop legacy master session.
- Main tables touched by code: `master_site`, `master_user`, `transact_wim_session`, `transact_anpr_capture`, `transact_axle_capture`, `transact_dimension`, `transact_weighing`, `transact_cctv`.

## Code Rules Backend

- Semua service harus fail fast jika `DATABASE_URL` kosong atau DB tidak bisa diping.
- Secret default tidak boleh hardcoded; pass/minio/jwt harus dari env/secret manager.
- FTP watcher harus hanya memproses `.xml` dan menunggu image pasangan siap sebelum enqueue.
- Session-based processing wajib dipertahankan; jangan proses file di luar session aktif kecuali fallback eksplisit dan terdokumentasi.
- Insert dari source eksternal wajib idempotent berdasarkan `external_id` atau key lain yang stabil.
- NATS queue consumer harus `Ack` hanya setelah DB insert/upsert sukses.
- External trigger HTTP harus punya timeout dan tidak boleh memblokir watcher lama.
- MinIO upload error harus dilog dan tidak boleh mencetak secret/key.
- Log connection string, password, token, MinIO secret, dan FTP password dilarang.
- API production harus set `AUTH_ENABLED=true` dan JWT secret kuat.
- CORS `AllowOrigins=*` harus diganti origin eksplisit untuk production.
- File runtime besar seperti video recording, local DB, cache, dan build output tidak boleh di-commit.
- Untuk dependency baru, tambahkan alasan package di spec ini dan jalankan `go mod tidy`.
- Untuk migration baru, dokumentasikan tabel/kolom dan dampaknya ke GraphQL/frontend.
