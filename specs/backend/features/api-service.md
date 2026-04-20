# Backend Feature: API Service

## Source Area

- `cmd/api/main.go`
- `internal/api/*`
- `internal/auth/*`
- `internal/handler/attachment_handler.go`

## Endpoints

- `GET /health`: health response `{status: ok, service: wim-service}`.
- `POST /api/auth/login`: login user dengan username/password dan JWT response.
- `GET /api/auth/profile`: profile user dari token, protected jika `AUTH_ENABLED=true`.
- `POST /api/attachment/upload`: upload image attachment ke MinIO, protected jika `AUTH_ENABLED=true`.

## Behavior

- Fiber middleware: recover, logger, dan CORS.
- Auth middleware aktif jika `AUTH_ENABLED=true`.
- JWT secret dari env `JWT_SECRET`.
- Attachment upload memakai MinIO attachment bucket.

## Rules

- Production wajib `AUTH_ENABLED=true`.
- CORS wildcard harus diganti origin eksplisit untuk production.
- Upload harus validasi file type dan ukuran.
