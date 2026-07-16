# Jatanlin Revamp

Folder ini adalah workspace baru untuk refactor Jatanlin. Kode lama di luar folder ini tidak boleh diubah selama proses revamp.

## Prinsip

- `jatanlin-web-apps`, `jatanlin-backend-services`, `jatanlin-wb-agent`, `deploy`, dan `specs` lama tetap berada di lokasi aslinya.
- Revamp hanya bekerja di dalam `jatanlin-revamp`.
- Bila perlu memakai kode lama, kode tersebut dicopy ke folder revamp lalu dirapikan di sana.
- Tampilan dan flow utama mengikuti v3.
- LED memakai basis v1/lama, tetapi dibuat lebih compact dan masuk ke flow v3.
- WB agent ditempatkan di `services/wb-agent` karena dia backend service.
- Local run harus cukup lewat Makefile di dalam folder revamp.

## Target Struktur

```text
jatanlin-revamp/
├── Makefile
├── README.md
├── .env.example
├── apps/
│   └── web/
├── services/
│   ├── backend/
│   └── wb-agent/
├── infra/
│   ├── compose/
│   └── portainer/
├── scripts/
└── specs/
```

## Cara Kerja

1. Selesaikan specs dan task list di folder ini.
2. Scaffold struktur revamp tanpa menyentuh folder lama.
3. Copy kode lama yang diperlukan ke dalam revamp.
4. Rapikan Makefile, env, dan compose agar semua service local bisa dijalankan dari revamp.
5. Test bersama sebelum ada keputusan mengganti struktur lama.

## Infra Local

Target infra hanya menjalankan dependency lokal. Web, backend Go, dan WB agent tidak ikut dijalankan.

```bash
cd jatanlin-revamp
make infra-up
make infra-bootstrap
make infra-ps
make infra-logs
make infra-down
```

Infra yang disiapkan:

- PostgreSQL: `localhost:15432`
- Hasura console: `http://localhost:18080`
- MinIO API: `http://localhost:19000`
- MinIO console: `http://localhost:19001`
- NATS: `localhost:14222`
- Redis: `localhost:16379`
- FTP sample: `localhost:10021`

Database bootstrap:

- `make infra-migrate` apply schema final dari `infra/database/001_schema.sql`.
- `make infra-seed` isi master data, sample device/site/user, dan admin lokal dari `infra/database/001_seed.sql`.
- `make infra-bootstrap` menjalankan `infra-up`, `infra-migrate`, dan `infra-seed`.

## Data Center Sync Agent

Sync agent mengirim data transaksi dari site lokal ke data center dengan retry aman. Cursor hanya naik setelah data center membalas sukses, jadi kalau jaringan putus batch yang sama akan dikirim ulang.

Aktifkan di `.env`:

```bash
DATA_CENTER_SYNC_ENABLED=true
DATA_CENTER_API_URL=http://localhost:28001
DATA_CENTER_SYNC_KEY=jatanlin-site-sync-key-2026
DATA_CENTER_SYNC_INTERVAL_SEC=30
DATA_CENTER_SYNC_BATCH_SIZE=100
DATA_CENTER_SYNC_CURSOR_FILE=./data/sync-agent-cursors.json
```

Jalankan manual:

```bash
make sync-agent
```

Untuk tes satu siklus:

```bash
DATA_CENTER_SYNC_ENABLED=true DATA_CENTER_SYNC_ONCE=true make sync-agent
```
