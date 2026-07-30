# Jatanlin

Root repository ini berisi source aktif Jatanlin hasil revamp. Kode lama sudah tidak menjadi dependency runtime/build di struktur ini.

## Prinsip

- Source aktif berada langsung di root repository.
- Tampilan dan flow utama mengikuti v3.
- LED memakai basis v1/lama, tetapi dibuat lebih compact dan masuk ke flow v3.
- WB agent ditempatkan di `services/wb-agent` karena dia backend service.
- Local run harus cukup lewat Makefile di root repository.

## Target Struktur

```text
.
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
2. Rapikan Makefile, env, dan compose agar semua service local bisa dijalankan dari root repository.
3. Test bersama sebelum deploy ke environment target.

## Local Run

Semua command dijalankan dari root repository.

File Docker Compose utama ada di `infra/compose/docker-compose.yml`. Compose ini mendukung dua mode: infra only dan full Docker. Web, backend Go, dan WB agent juga masih bisa dijalankan sebagai proses lokal lewat Makefile jika dibutuhkan untuk development.

### 0. Setup environment

Identitas site disimpan di `site.json`. Untuk deploy ke site baru, ubah file ini dulu:

```json
{
  "id": "628f033e-49b2-4ba0-b1e8-12af4b3895ee",
  "code": "MST-25-00001",
  "name": "Mampang Revamp Local",
  "location": "Central Office",
  "region": "Default",
  "address": "Jl. Mampang Prapatan Raya, Jakarta Selatan",
  "city": "Jakarta Selatan",
  "province": "DKI Jakarta",
  "timezone": "Asia/Jakarta"
}
```

Field di `site.json` dipakai untuk:

- `.env` utama dan `.env.example`.
- `apps/web/.env` dan `apps/web/.env.example` (`NEXT_PUBLIC_SITE_*`).
- `services/backend/.env` dan `.env.example`.
- `services/wb-agent/.env`, `.env.example`, dan `appsettings.json`.
- Seed database (`master_site`, `master_config`, `system_runtime_config`).
- Generate/check VEAM license.

Apply nilai `site.json` ke semua env file:

```bash
make site-apply
```

`make env-init`, `make env-force`, `make docker-up`, `make docker-bootstrap`, `make docker-bootstrap-dev`, `make infra-up`, dan `make docker-config` otomatis menjalankan `site-apply` lebih dulu.

Semua template environment disimpan sebagai `.env.example`. Untuk membuat semua `.env` yang dibutuhkan:

```bash
make env-init
```

Target ini membuat `.env` dari `.env.example` jika file `.env` belum ada. File yang dibuat:

- `.env`
- `apps/web/.env`
- `services/backend/.env`
- `services/wb-agent/.env`
- `data-center/.env`
- `data-center/apps/web/.env`

Data-center juga punya target environment sendiri jika command dijalankan dari folder `data-center`:

```bash
cd data-center
make env-init
```

Jika ingin reset dan menimpa semua `.env` dari template:

```bash
make env-force
```

### 1. Semua via Docker: infra, backend services, WB agent, dan web

Untuk pertama kali jalan full Docker:

```bash
make env-init
make docker-bootstrap
```

Untuk run berikutnya, jika database sudah siap:

```bash
make docker-up
```

Jika database sudah pernah di-seed dengan mode lokal dan watcher gagal konek ke `NATS_URL=localhost`, apply runtime config Docker lalu restart app services:

```bash
make docker-config
make docker-restart
```

Full Docker menjalankan:

- `postgres`
- `hasura`
- `minio`
- `minio-init`
- `nats`
- `redis`
- `ftp-local`
- `edge-proxy`
- `backend-api`
- `anpr-watcher`
- `axle-watcher`
- `cctv-streamer`
- `sync-agent`
- `wb-agent`
- `web`

Command Docker langsung:

```bash
docker compose \
  -p jatanlin-revamp \
  --env-file .env \
  -f infra/compose/docker-compose.yml \
  up -d --build
```

Untuk cek dan logs full Docker:

```bash
make docker-ps
make docker-logs
```

Untuk stop full Docker:

```bash
make docker-down
```

URL public tetap lewat nginx local:

- Web: `http://site.jatanlin.test`
- Backend API: `http://api.site.jatanlin.test`
- Hasura: `http://hasura.site.jatanlin.test`
- MinIO API: `http://minio.site.jatanlin.test`
- MinIO console: `http://console.minio.site.jatanlin.test`

Di dalam Docker, service saling terhubung lewat DNS compose:

- Database: `postgres:5432`
- NATS: `nats:4222`
- MinIO: `minio:9000`
- FTP: `ftp-local:21`
- WB agent: `wb-agent:5001`
- CCTV streamer: `cctv-streamer:8090`

`sync-agent` full Docker default aktif lewat `DOCKER_DATA_CENTER_SYNC_ENABLED=true` dan memakai `http://api.dc.jatanlin.test`. Jika data-center belum dijalankan dan tidak ingin melihat retry log sync:

```bash
DOCKER_DATA_CENTER_SYNC_ENABLED=false make docker-up
```

### 2. Semua mode lokal: infra Docker, backend services lokal, WB agent lokal, dan web lokal

Untuk pertama kali jalan, gunakan bootstrap supaya database sudah termigrasi dan terisi seed:

```bash
make infra-bootstrap
make dev
```

Untuk run berikutnya, jika database sudah siap:

```bash
make dev-full
```

Catatan: `make dev-full` menjalankan `infra-up` lalu `dev`, tetapi tidak menjalankan migrate/seed ulang.

`make dev` menjalankan:

- `backend-api`
- `anpr-watcher`
- `axle-watcher`
- `cctv-streamer`
- `sync-agent`
- `wb-agent`
- `web`

### 3. Infra only, tanpa web dan backend services

Gunakan Makefile:

```bash
make infra-up
```

Atau command Docker langsung:

```bash
docker compose \
  -p jatanlin-revamp \
  --env-file .env \
  -f infra/compose/docker-compose.yml \
  up -d
```

Kalau ingin eksplisit memilih service infra:

```bash
docker compose \
  -p jatanlin-revamp \
  --env-file .env \
  -f infra/compose/docker-compose.yml \
  up -d postgres hasura minio minio-init nats redis ftp-local edge-proxy
```

Service infra yang disiapkan:

- PostgreSQL: `localhost:15432`
- Hasura console: `http://localhost:18080`
- MinIO API: `http://localhost:19000`
- MinIO console: `http://localhost:19001`
- NATS: `localhost:14222`
- Redis: `localhost:16379`
- FTP sample: `localhost:10021`
- Nginx edge proxy: `localhost:80`

### 4. Infra plus database bootstrap

Gunakan ini saat setup awal atau saat butuh schema dan data seed lokal:

```bash
make infra-bootstrap
```

Equivalent manual:

```bash
make infra-up
make infra-migrate
make infra-seed
```

Database bootstrap:

- `make infra-migrate` apply schema final dari `infra/database/001_schema.sql`.
- `make infra-seed` isi master data saja dari `infra/database/001_seed.sql`. Gunakan ini untuk site baru/production-like setup supaya tabel transaksi mulai kosong.
- `make infra-bootstrap` menjalankan `infra-up`, `infra-migrate`, dan `infra-seed`.

Seed master data berisi data dasar yang diperlukan untuk site:

- Role canonical hanya 2: `ADMIN` dan `OPERATOR`.
- Site aktif sesuai `site.json` (`SITE_ID`, `SITE_CODE`, `SITE_NAME`, dan metadata lokasi).
- Device type, vehicle class, runtime config, master config, default device lokal, user admin, dan user operator.
- Seed ini juga merapikan legacy seed role/user demo lama supaya dropdown role tidak berisi `VIEWER`, `SUPERVISOR`, `Administrator`, `Supervisor`, atau `Operator` duplikat.

Jika sedang development dan butuh transaksi demo:

```bash
make infra-seed-with-transactions
```

Atau bootstrap infra dari awal dengan transaksi demo:

```bash
make infra-bootstrap-dev
```

Untuk full Docker stack dengan transaksi demo:

```bash
make docker-bootstrap-dev
```

File seed transaksi terpisah ada di `infra/database/002_transaction_seed.sql`, dan tidak ikut `make infra-migrate`.

Jika database lokal sudah terlanjur berisi transaksi lama dan ingin dikosongkan tanpa menghapus master data:

```bash
CONFIRM=clear-transactions make infra-transactions-clear
```

Command ini hanya truncate tabel transaksi (`transact_*`) dan tidak menghapus role, user, site, vehicle class, device, atau config.

### 5. Infra plus backend services, tanpa web

Jalankan infra dulu, lalu semua backend service lokal:

```bash
make infra-bootstrap
make services
```

Untuk run berikutnya, jika database sudah siap:

```bash
make infra-up
make services
```

`make services` menjalankan:

- `backend-api`
- `anpr-watcher`
- `axle-watcher`
- `cctv-streamer`
- `sync-agent`
- `wb-agent`

### 6. Infra plus web, tanpa backend services

Jalankan infra dulu, lalu web:

```bash
make infra-up
make web
```

Jika dependency web belum terinstall:

```bash
make web-install
make web
```

Default web port:

- Web: `http://localhost:3000`

Untuk mengganti port:

```bash
WEB_PORT=3001 make web
```

### 7. Backend service satuan

Jika hanya ingin menjalankan service tertentu:

```bash
make infra-up
make backend-api
make anpr-watcher
make axle-watcher
make cctv-streamer
make sync-agent
make wb-agent
```

Jalankan command service satuan di terminal terpisah karena prosesnya long-running.

### 8. Cek, logs, restart, dan stop

```bash
make infra-ps
make infra-logs
make infra-restart
make infra-down
```

Command Docker langsung:

```bash
docker compose \
  -p jatanlin-revamp \
  --env-file .env \
  -f infra/compose/docker-compose.yml \
  ps

docker compose \
  -p jatanlin-revamp \
  --env-file .env \
  -f infra/compose/docker-compose.yml \
  logs -f

docker compose \
  -p jatanlin-revamp \
  --env-file .env \
  -f infra/compose/docker-compose.yml \
  down
```

Untuk stop infra dan hapus volume database/object storage/cache lokal:

```bash
make infra-clean
```

### 9. Local DNS reverse proxy

Nginx edge proxy sudah termasuk di `infra-up`. Untuk hostname lokal, tambahkan entry dari:

```bash
make dns-hosts-print
```

Expected local URLs:

- `http://site.jatanlin.test`
- `http://api.site.jatanlin.test`
- `http://hasura.site.jatanlin.test`
- `http://minio.site.jatanlin.test`
- `http://console.minio.site.jatanlin.test`

Jika port `80` sudah dipakai:

```bash
EDGE_HTTP_PORT=8088 make infra-up
```

Lalu akses dengan port tersebut, misalnya `http://site.jatanlin.test:8088`.

### Catatan Docker

Mode full Docker sudah tersedia lewat `make docker-bootstrap` atau `make docker-up`. Untuk integrasi browser, pastikan hostname dari `make dns-hosts-print` sudah masuk ke `/etc/hosts`.

## VEAM License

Flow awal yang dipakai sekarang adalah generate file lisensi, lalu upload manual dari website. Validasi via USB akan dilakukan setelah flow upload manual aman.

Generate file lisensi untuk site aktif di `site.json`:

```bash
make veam-license-generate
```

Generate dengan parameter custom tetap bisa, tapi default-nya akan mengikuti `site.json`:

```bash
SITE_ID=628f033e-49b2-4ba0-b1e8-12af4b3895ee \
SITE_CODE=MST-25-00001 \
SITE_NAME="Mampang Revamp Local" \
VEAM_LICENSE_ID=VEAM2-MST-25-00001-2026-07-28 \
VEAM_ISSUED_BY="Activa Digital" \
VEAM_ISSUED_AT=2026-07-28 \
VEAM_EXPIRES_AT=2027-12-31 \
VEAM_MODULES=PWS,TIIC,DMC \
VEAM_MAX_DEVICES=5 \
VEAM_HARDWARE_ID= \
make veam-license-generate
```

Parameter yang bisa dikirim saat generate:

- `SITE_ID`: UUID site yang akan dilisensikan.
- `SITE_CODE`: kode site, dipakai untuk default `VEAM_LICENSE_ID`.
- `SITE_NAME`: nama pemilik/site yang masuk ke field `issued_to`.
- `VEAM_LICENSE_ID`: ID lisensi. Default: `VEAM2-${SITE_CODE}-${VEAM_ISSUED_AT}`.
- `VEAM_ISSUED_BY`: penerbit lisensi. Default: `Activa Digital`.
- `VEAM_ISSUED_AT`: tanggal terbit format `YYYY-MM-DD`. Default: tanggal hari ini.
- `VEAM_EXPIRES_AT`: tanggal kedaluwarsa format `YYYY-MM-DD`. Default: `2027-12-31`.
- `VEAM_MODULES`: daftar module dipisah koma. Default: `PWS,TIIC,DMC`.
- `VEAM_MAX_DEVICES`: maksimum device. Default: `5`.
- `VEAM_HARDWARE_ID`: opsional untuk binding hardware/USB nanti. Kosong berarti tidak dikunci ke hardware tertentu.
- `VEAM_GENERATE_OUT`: path output file `.veam`. Default: `services/backend/data/license.veam`.
- `VEAM_PUBLIC_KEY_OUT`: path output public key. Default: `services/backend/data/license.public_key_b64`.

Output default:

- File lisensi: `services/backend/data/license.veam`
- Public key: `services/backend/data/license.public_key_b64`

Jika Docker stack sedang berjalan, command ini juga otomatis update `system_runtime_config.VEAM_PUBLIC_KEY_B64` di database dan restart `backend-api` supaya file hasil generate bisa langsung divalidasi backend.

Login fallback via USB:

- Backend selalu cek stored license lebih dulu.
- Jika stored license belum aktif atau belum ada, backend scan USB untuk file `.veam`.
- Di Docker macOS, `/Volumes` host dimount ke container sebagai `/host/Volumes`, sehingga file seperti `/Volumes/V-GEN/license.veam` akan terbaca sebagai `/host/Volumes/V-GEN/license.veam`.
- Di Docker Windows + WSL, removable drive perlu dimount dulu ke WSL, lalu dimount ke container sebagai `/host/usb`, sehingga USB seperti `E:\license.veam` akan terbaca sebagai `/host/usb/license.veam`.
- Di Docker Ubuntu/Linux, removable drive biasanya ada di `/media` atau `/run/media` dan bisa dimount ke container sebagai `/host/media` atau `/host/run-media`.
- File metadata macOS seperti `._license.veam` diabaikan.
- Fallback ini aktif default lewat `VEAM_LOGIN_USB_CHECK_ENABLED=true`. Set ke `false` jika ingin memaksa login hanya dari stored license.

Untuk Windows + WSL, jalankan target helper ini setelah USB dicolok atau setelah WSL/Docker restart:

```bash
make veam-usb-redeploy
make veam-usb-scan
```

Default target menganggap USB ada di drive `E:` dan akan mount ke `/mnt/e`. Jika drive letter berbeda:

```bash
VEAM_USB_DRIVE=F: VEAM_USB_HOST_MOUNT=/mnt/f make veam-usb-redeploy
make veam-usb-scan
```

Expected scan result:

```json
{
  "found": true,
  "path": "/host/usb/license.veam"
}
```

Target helper juga bisa dipakai untuk macOS atau Ubuntu/Linux dengan override path USB:

```bash
VEAM_USB_MODE=macos VEAM_USB_HOST_MOUNT=/Volumes VEAM_USB_CONTAINER_MOUNT=/host/Volumes make veam-usb-redeploy
VEAM_USB_MODE=linux VEAM_USB_HOST_MOUNT=/media VEAM_USB_CONTAINER_MOUNT=/host/media make veam-usb-redeploy
VEAM_USB_MODE=linux VEAM_USB_HOST_MOUNT=/run/media VEAM_USB_CONTAINER_MOUNT=/host/run-media make veam-usb-redeploy
```

Upload dan validasi via website:

1. Buka `http://site.jatanlin.test/system/license`.
2. Klik atau drag file `services/backend/data/license.veam`.
3. Jika valid, status lisensi berubah menjadi aktif.

Untuk cek status dari backend API:

```bash
curl http://api.site.jatanlin.test/veam/status
```

Untuk validasi command line terhadap lisensi yang tersimpan di backend data local:

```bash
make veam-license-check
```

Target check ini otomatis memakai `services/backend/data/license.public_key_b64` jika file tersebut ada.

Catatan: generator VEAM membuat key pair baru setiap kali dijalankan. Karena itu public key hasil generate harus sama dengan `VEAM_PUBLIC_KEY_B64` yang dipakai backend. Target `make veam-license-generate` sudah menangani update runtime config Docker dan restart `backend-api` secara otomatis jika Postgres container aktif.

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
