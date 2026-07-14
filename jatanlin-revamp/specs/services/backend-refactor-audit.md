# Backend Refactor Audit

Audit ini dilakukan setelah backend Go dicopy ke `jatanlin-revamp/services/backend`.

## Fokus Awal

- Pastikan build awal sama dengan baseline.
- Pisahkan config/env loading yang tersebar.
- Rapikan package besar secara bertahap.
- Tambah test pada logic yang disentuh.
- Jangan ubah behavior sebelum ada test atau smoke check.

## Struktur Revamp Saat Ini

Backend revamp menggunakan satu Go module dengan multi-entrypoint di `cmd/`, lalu domain dipisah di `internal/`.

```text
services/backend/
├── cmd/
│   ├── api/
│   ├── anpr-watcher/
│   ├── axle-watcher/
│   ├── cctv-streamer/
│   ├── dimension-sample/
│   └── session-simulator/
└── internal/
    ├── anpr/
    ├── api/
    ├── attachment/
    ├── auth/
    ├── axle/
    ├── config/
    ├── dimension/
    ├── ftpwatcher/
    ├── ingest/
    ├── license/
    ├── session/
    ├── veam/
    └── vision/
```

Endpoint dan behavior publik tetap dipertahankan. Perubahan saat ini hanya memindahkan package dari `internal/handler` ke domain yang lebih eksplisit.

## Kandidat Refactor

- Session/auth helper bila masih bercampur dengan handler.
- Device integration client.
- Storage/MinIO helper.
- Route registration.
- DTO dan response mapper.

## Gate

- `go test ./...` di `services/backend`.
- `make test-backend` dari root revamp.
- Smoke endpoint healthcheck.
