# Jatanlin Data Center

Stack ini terpisah dari site/local revamp. Fokus awalnya hanya:

- PostgreSQL data center
- Hasura data center
- Backend API untuk login dan overview data center
- MinIO untuk attachment dari site
- Web data center dengan route `/login` dan `/data-center`

## Default Local Ports

- Web: `http://localhost:3001`
- Backend API: `http://localhost:28001`
- Hasura Console: `http://localhost:28080`
- PostgreSQL: `localhost:25432`
- MinIO API: `http://localhost:29000`
- MinIO Console: `http://localhost:29001`

## Default Login

- Username: `admin`
- Password: `admin123`

## Commands

```sh
make env-init
make docker-bootstrap
```

Untuk menjalankan API dan web di luar Docker:

```sh
make env-init
make infra-up
make infra-migrate
make infra-seed
make dev
```

`make infra-migrate` menjalankan semua SQL migration di `infra/database/*.sql` kecuali file `*_seed.sql`. `make infra-seed` menjalankan semua file `*_seed.sql`.

## Structure

```text
data-center/
  infra/
    compose/              # Postgres, Hasura, MinIO, backend API
    database/             # Schema dan seed data center
  services/
    backend/              # Go API auth + overview
  apps/
    web/                  # Next web login + data center page
  scripts/                # Migration dan seed runner
```

## Site Sync Design

Site mengirim data ke data center dengan model push-based. Ini lebih aman untuk site yang berada di jaringan lokal/NAT karena data center tidak perlu melakukan polling ke jaringan site.

Semua request sync memakai header:

```http
X-Site-Sync-Key: jatanlin-site-sync-key-2026
```

Endpoint awal:

- `POST /api/sync/heartbeat`
  - Upsert site, status online/warning/offline, operator aktif, versi app/service.
- `POST /api/sync/vehicle-actual/batch`
  - Endpoint legacy dihentikan dan mengembalikan `410 Gone`; gunakan mirror batch.
- `POST /api/sync/mirror/batch`
  - Upsert mirror table dari schema site dengan key unik `(site_id, source_id)`.
- `POST /api/sync/attachments/prepare`
  - Generate target bucket/object key untuk attachment.
- `POST /api/sync/attachments/complete`
  - Upsert metadata attachment dengan key unik `(site_id, site_attachment_id)`.
- `POST /api/sync/cursor`
  - Simpan cursor sync terakhir per site dan sync type.

Retry aman karena data center memakai upsert idempotent. Jika jaringan putus, sync-agent di site cukup mengirim ulang batch yang sama sampai mendapat respons sukses. Cursor baru boleh dinaikkan setelah batch transaksi dan attachment terkait berhasil dikirim.

Mirror table yang sudah disiapkan:

- `transact_wim_session` -> `dc_transact_wim_session`
- `transact_anpr_capture` -> `dc_transact_anpr_capture`
- `transact_axle_capture` -> `dc_transact_axle_capture`
- `transact_cctv` -> `dc_transact_cctv`
- `transact_dimension` -> `dc_transact_dimension`
- `transact_weighing` -> `dc_transact_weighing`
- `transact_vehicle_actual` -> `dc_transact_vehicle_actual`
- `transact_vehicle_status` -> `dc_transact_vehicle_status`

Urutan sync yang direkomendasikan dari site:

```text
heartbeat
transact_wim_session
transact_anpr_capture
transact_axle_capture
transact_cctv
transact_dimension
transact_weighing
transact_vehicle_actual
transact_vehicle_status
attachments prepare/upload/complete
cursor
```

Sejak Phase 9, `dc_transact_vehicle_actual` adalah canonical transaction store. View `dc_dashboard_vehicle_actual` hanya membaca mirror tersebut agar satu transaksi site muncul tepat satu kali. Tabel `dc_vehicle_actual` dipertahankan sementara sebagai data legacy/rollback dan tidak lagi menerima ingest atau ikut query dashboard.
