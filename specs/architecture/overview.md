# Architecture Overview

Source aktif Jatanlin berada langsung di root repository setelah hasil revamp dipromosikan dari workspace sementara.

## Boundary

- Read/copy dari folder lama diperbolehkan.
- Edit langsung di folder lama tidak diperbolehkan.
- Semua perubahan implementasi dilakukan dari root repository.
- Makefile, env example, compose, scripts, dan dokumentasi runtime berada di root repository.

## Komponen

```text
apps/web
```

Next.js app baru untuk revamp. UI dan flow mengikuti v3. Kode dari web lama boleh dicopy sebagai referensi atau starter, tetapi setelah masuk revamp harus dirapikan sesuai struktur baru.

```text
services/backend
```

Go backend. Menangani API/domain backend seperti ANPR, AXLE, CCTV, dimension, dan integrasi non-WB.

```text
services/wb-agent
```

.NET backend service untuk WIM/WServer. Service ini masuk backend karena berkomunikasi dengan device/database, bukan UI.

```text
infra
```

Local compose, portainer/deploy material, dan dependency runtime untuk dev/test lokal.

## UI Direction

- V3 menjadi primary surface.
- LED compact menggunakan basis LED v1/lama.
- Route lama di luar revamp tidak diubah.
- Semua route revamp harus bisa diuji dari Next app di `apps/web`.

## Runtime Direction

- `make dev` menyalakan dependency dan service yang diperlukan untuk local development.
- `make web`, `make backend`, dan `make wb-agent` bisa dijalankan terpisah.
- `make test` dan `make build` menjadi gate sebelum test bersama.
