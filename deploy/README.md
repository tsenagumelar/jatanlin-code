# Deploy Commands

## FTP Local Mac

Jalankan FTP lokal untuk testing ANPR/AXLE:

```bash
docker compose -f deploy/docker-compose.ftp-local.yml up -d
```

Konfigurasi backend jika backend jalan langsung di Mac:

```env
ANPR_FTP_HOST="localhost:10021"
ANPR_FTP_USER="ftpuser"
ANPR_FTP_PASS="ftppass"
ANPR_FTP_DIR="/ftp/ftpuser/anpr/"

AXLE_FTP_HOST="localhost:10021"
AXLE_FTP_USER="ftpuser"
AXLE_FTP_PASS="ftppass"
AXLE_FTP_DIR="/axle"
```

Jika backend jalan di container Docker terpisah, pakai host ini:

```env
ANPR_FTP_HOST="host.docker.internal:10021"
AXLE_FTP_HOST="host.docker.internal:10021"
```

Folder data lokal:

- `deploy/ftp-local-data/anpr`
- `deploy/ftp-local-data/axle`

## 1) Siapkan Config Area

```bash
cp deploy/configs/area.example.env deploy/configs/area-<area_code>.env
```

Edit file `deploy/configs/area-<area_code>.env` sesuai kebutuhan site.

## 2) Validate Config (tanpa deploy)

```bash
./deploy/rollout-area.sh --config deploy/configs/area-<area_code>.env --mode validate
```

## 3) First Install (one-click deploy + migration + seed + default admin)

```bash
./deploy/rollout-area.sh --config deploy/configs/area-<area_code>.env --mode install
```

## 4) Upgrade Deployment

```bash
./deploy/rollout-area.sh --config deploy/configs/area-<area_code>.env --mode upgrade
```

## 5) Deploy tanpa verification

```bash
./deploy/rollout-area.sh --config deploy/configs/area-<area_code>.env --mode install --skip-verify
```

## Troubleshooting Port Conflict

Jika muncul error `bind: address already in use`, ganti mapping port di file config area.

Contoh port aman default ada di `deploy/configs/area.example.env`:
- `WEB_PORT=13000`
- `API_PORT=14000`
- `WB_PORT=15000`
- `HASURA_PORT=18080`
- `NATS_PORT=14222`
- `FTP_PORT=10021`
- `POSTGRES_PORT=15432`
- `MINIO_API_PORT=19000`
- `MINIO_CONSOLE_PORT=19001`

Kalau deploy sebelumnya gagal setengah jalan, cleanup dulu:

```bash
docker compose -f deploy/out/<area_code>/stack.rendered.yml -p jatanlin-<area_code> down
```

## 6) Build & Push Semua Image

Tag `latest`:

```bash
./deploy/build-and-push-images.sh latest
```

Tag versi custom:

```bash
./deploy/build-and-push-images.sh v1.0.0
```

Image yang dipublish:

- `taufansena/jtn-web:<tag>`
- `taufansena/jtn-api-service:<tag>`
- `taufansena/jtn-anpr-service:<tag>`
- `taufansena/jtn-axle-service:<tag>`
- `taufansena/jtn-cctv-service:<tag>`
- `taufansena/jtn-wb-service:<tag>`
