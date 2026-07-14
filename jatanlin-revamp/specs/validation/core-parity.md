# Core Function Parity Validation

Tanggal validasi: 2026-07-14

## Scope

Validasi ini membandingkan implementasi lama dengan implementasi revamp untuk memastikan refactor tidak mengubah kontrak utama:

- API service endpoints
- ANPR FTP watcher cron/job
- AXLE FTP watcher cron/job
- CCTV streamer cron/job
- WB agent endpoints dan background services
- Jalur integrasi device, FTP, object storage, queue, dan database

Baseline lama hanya dibaca dari folder lama. Perubahan tetap berada di `jatanlin-revamp`.

## Hasil Ringkas

Status: parity statis OK.

Build/test:

- `go test ./...` di `jatanlin-revamp/services/backend`: pass.
- `dotnet build WServerApi.csproj` di `jatanlin-revamp/services/wb-agent`: pass, 0 error.
- Warning `.NET` hanya `NU1900` karena metadata vulnerability NuGet tidak bisa diambil dari network.

Catatan batasan:

- Validasi ini belum membuktikan koneksi runtime ke device/FTP/database live karena belum menjalankan stack melawan perangkat dan credential production.
- Smoke test integrasi tetap perlu dilakukan bersama setelah service dijalankan local/staging.

## API Service

Endpoint parity OK. Route lama di `internal/api/server.go` dipindah ke register function modular di `internal/api/routes.go`, tanpa perubahan path/method.

Endpoint yang tetap tersedia:

- `GET /health`
- `POST /api/auth/login`
- `GET /api/auth/profile`
- `POST /api/attachment/upload`
- `POST /api/users`
- `POST /api/users/`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`
- `GET /veam/scan-license`
- `GET /veam/status`
- `POST /veam/activate`
- `POST /veam/activate-usb`
- `DELETE /veam/license`

Integrasi yang tetap sama:

- PostgreSQL connection tetap dari `internal/config`.
- Attachment upload tetap memakai MinIO config yang sama.
- Auth/JWT flow tetap sama.
- VEAM/license service tetap sama.

## ANPR Watcher

Entrypoint parity OK. Diff pada `cmd/anpr-watcher/main.go` hanya perubahan package import/type karena handler dipecah ke domain:

- `handler.NewFileProcessor` menjadi `anpr.NewFileProcessor`
- `handler.NewDimensionHandler` menjadi `dimension.NewDimensionHandler`
- `handler.NewSessionService` menjadi `session.NewSessionService`
- trigger config pindah ke package `anpr`

Flow yang tetap sama:

- Load config dan database.
- Optional dimension detection.
- FTP watcher dengan `ftpwatcher.New(...)`.
- Active session lookup.
- `is_dummy=true` memproses dummy session.
- `is_dummy=false` polling FTP.
- Upload object ke MinIO.
- Insert queue via NATS JetStream.
- Trigger weighing/WB dan CCTV tetap dipasang dari config.

## AXLE Watcher

Entrypoint parity OK. Diff pada `cmd/axle-watcher/main.go` hanya perubahan package import/type:

- `handler.NewAxleProcessor` menjadi `axle.NewAxleProcessor`
- `handler.NewSessionService` menjadi `session.NewSessionService`

Flow yang tetap sama:

- Load config dan database.
- FTP watcher dengan `ftpwatcher.New(...)`.
- Active session lookup.
- `is_dummy=true` memproses dummy session.
- `is_dummy=false` polling FTP.
- Upload object ke MinIO.
- Insert queue via NATS JetStream.
- Insert final ke database tetap melalui processor/queue yang sama secara fungsi.

## CCTV Streamer

Entrypoint parity OK. Diff pada `cmd/cctv-streamer/main.go` hanya perubahan package import/type:

- `handler.NewSessionService` menjadi `session.NewSessionService`
- `*handler.SessionService` menjadi `*session.SessionService`

Flow yang tetap sama:

- Load config dan database.
- Resolve active session.
- Dummy/live session branching tetap sama.
- RTSP/device capture flow tetap berada di entrypoint yang sama.
- Upload/recording metadata insert tetap melalui logic lama yang dipertahankan.

## WB Agent

Endpoint parity OK. Endpoint lama di `Program.cs` dipisah sebagian ke:

- `Endpoints/RootEndpoints.cs`
- `Endpoints/VehicleEndpoints.cs`
- `Configuration/ServiceCollectionExtensions.cs`
- `Services/WimFrameHelpers.cs`
- `Services/WimSessionResolver.cs`

Endpoint yang tetap tersedia:

- `GET /`
- `POST /ws/login`
- `POST /ws/mode/static`
- `POST /ws/mode/wim`
- `GET /ws/msgs`
- `GET /ws/stream`
- `POST /ws/wim/start`
- `GET /ws/wim/data`
- `GET /ws/wim/live`
- `POST /ws/wim/stop`
- `POST /ws/wim/capture`
- `POST /ws/wim/capture-stream`
- `POST /ws/wim/trigger`
- `POST /ws/wim/anpr-capture`
- `POST /ws/wim/insert-test`
- `POST /capture`
- `GET /ws/latest-vehicle`
- `GET /ws/vehicles/{id:guid}`
- `GET /ws/vehicles`
- `GET /ws/vehicles/stats`
- `GET /ws/vehicles/recid/{recid:int}`

Integrasi yang tetap sama:

- `WsClient` tetap TCP client ke WServer/device.
- `WeighingInsertService` tetap insert ke PostgreSQL dengan Npgsql.
- `SessionCaptureService` tetap membaca active session dari PostgreSQL.
- `NatsCacheService` dan retry service tetap memakai NATS.
- Models lama sama, tidak berubah.
- Service lama sama; tambahan file hanya helper hasil ekstraksi.

## Smoke Test Yang Masih Perlu

Checklist runtime saat test bersama:

- Jalankan infra: `make infra-bootstrap`.
- Jalankan backend API dan cek `GET /health`.
- Test login/profile dengan auth config yang sama.
- Test upload attachment ke MinIO.
- Jalankan ANPR watcher dengan sample FTP file dan cek object + database/queue.
- Jalankan AXLE watcher dengan sample FTP file dan cek object + database/queue.
- Jalankan CCTV streamer dengan RTSP/device config dan cek record insert.
- Jalankan WB agent, cek device TCP connect, stream endpoint, trigger/capture, dan insert weighing.
