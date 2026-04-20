# Backend Tech & Packages

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

## Config Area

- Site: `SITE_CODE`, `SITE_NAME`, `SITE_LOCATION`, `SITE_REGION`.
- Database: `DATABASE_URL`, optional `CENTRAL_DATABASE_URL`, `SYNC_ENABLED`.
- API: `API_PORT`, `JWT_SECRET`, `AUTH_ENABLED`.
- ANPR FTP: `ANPR_FTP_HOST`, `ANPR_FTP_USER`, `ANPR_FTP_PASS`, `ANPR_FTP_DIR`, `ANPR_FTP_INTERVAL_SEC`.
- AXLE FTP: `AXLE_FTP_HOST`, `AXLE_FTP_USER`, `AXLE_FTP_PASS`, `AXLE_FTP_DIR`, `AXLE_FTP_INTERVAL_SEC`.
- MinIO variables per ANPR, AXLE, and attachment buckets.
- Dimension and camera calibration variables.
- NATS, weighing trigger, and CCTV trigger variables.
