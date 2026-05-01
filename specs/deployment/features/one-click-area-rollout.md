# Deployment Feature: One-Click Area Rollout

## Objective

Membuat satu script orchestrator untuk rollout instance aplikasi Jatanlin per area, cukup dengan satu file config input agar seluruh komponen area terdeploy dengan konfigurasi yang sesuai.

## Feature Requirements

### 1. Single Command Deployment

- Operator menjalankan 1 command, contoh:
  - `./deploy/rollout-area.sh --config configs/area-mampang.env`
- Script mengeksekusi seluruh tahapan deployment end-to-end tanpa intervensi manual kecuali approval yang memang diwajibkan.

### 2. Config-Driven Provisioning

- Semua nilai environment dibaca dari file config area.
- Validasi mandatory config dijalankan sebelum proses deploy dimulai.
- Config wajib memuat:
  - identitas area (`SITE_CODE`, `SITE_NAME`, `SITE_REGION`)
  - network/port mapping
  - image tag tiap service
  - credential database/minio/jwt
  - endpoint FTP/RTSP/device yang dipakai area

### 3. Automated Portainer Setup

- Jika Portainer belum terpasang, script otomatis install dan start Portainer.
- Jika sudah ada, script hanya verifikasi health dan akses API.
- Stack area dideploy melalui Portainer API (bukan langkah manual UI).

### 4. Full Stack Deployment per Area

- Komponen minimum yang dideploy:
  - `web`
  - `general-api`
  - `anpr` (mencakup `dimension` processor)
  - `axle`
  - `cctv`
  - `wb`
  - `postgresql`
  - `minio`
  - `ftp`
  - `hasura`
  - `nats`
- Semua service berada dalam network Docker yang sama per area.

### 5. Environment Injection

- File config area dipetakan ke env masing-masing container.
- Nilai secret diprioritaskan dari secret store/CI variable; fallback `.env` lokal hanya untuk non-production.
- Script menghasilkan file runtime `stack.rendered.yml` untuk audit deployment (tanpa menuliskan secret plaintext ke log).

### 6. Post-Deploy Verification

- Script memverifikasi:
  - container status `running`
  - health endpoint web, general-api, anpr, axle, cctv, wb, hasura
  - koneksi PostgreSQL
  - konektivitas NATS
  - akses bucket MinIO
  - akses FTP
- Jika verifikasi gagal, hasil deploy ditandai `DEGRADED/FAILED` dengan ringkasan root cause.

### 7. Update & Re-Deploy

- Script mendukung mode:
  - `install` (first deployment)
  - `upgrade` (update image/env)
  - `validate` (cek config only)
- Re-deploy wajib menjaga persistence volume DB/MinIO agar data tidak hilang.

### 8. First-Time Database Bootstrap & Default Admin

- Pada deployment pertama (`install`), script wajib menjalankan:
  - migration database dari baseline hingga versi terbaru
  - seed master data minimum yang dibutuhkan aplikasi
  - pembuatan user admin default area berdasarkan config
- Default admin tidak boleh hardcoded; wajib berasal dari config deployment.
- Proses seed wajib idempotent, sehingga re-run tidak membuat duplikasi master data/user.

## Non-Functional Requirements

- Waktu deployment target: <= 15 menit untuk host baru dengan jaringan normal.
- Idempotency: eksekusi ulang config yang sama menghasilkan state stack yang sama.
- Security:
  - Tidak mencetak secret di stdout.
  - Wajib TLS untuk endpoint eksternal bila tersedia.
- Reliability: jika langkah non-kritikal gagal, proses lanjut dengan warning; jika kritikal gagal, stop aman.

## Technical Specification

## A. Struktur File Deployment

```text
deploy/
  rollout-area.sh                 # orchestrator utama
  lib/
    preflight.sh                  # check dependency host
    config-loader.sh              # parse + validate config
    portainer.sh                  # install/check/deploy stack via API
    render-stack.sh               # template -> stack yaml final
    verify.sh                     # post-deploy checks
  templates/
    stack.area.yml.tpl            # template stack gabungan seluruh service
  configs/
    area.example.env              # template config area
```

## B. Alur Eksekusi Script

1. Preflight
- Cek `docker`, `curl`, `jq`, koneksi host, disk minimum.
- Cek port bentrok (80/443/3000/4000/5432/9000/9001 dll sesuai config).

2. Load & Validate Config
- Parse file config area.
- Validasi mandatory keys dan format (`URL`, `PORT`, `UUID`, boolean).

3. Prepare Secrets
- Ambil secret dari environment runtime atau secret manager.
- Pastikan secret minimum terisi: `DB_PASSWORD`, `JWT_SECRET`, `MINIO_SECRET_KEY`.

4. Ensure Portainer
- Install/start Portainer jika belum ada.
- Login API dan siapkan endpoint stack deployment.

5. Render Stack
- Render `stack.area.yml.tpl` dengan nilai config area.
- Simpan artifact render untuk audit.

6. Deploy/Update Stack
- Buat stack baru atau update stack existing di Portainer API.
- Attach volume persisten dan network area.

7. Run Migration/Bootstrap
- Jalankan migration DB backend (`migrations/*.sql`) sesuai strategi yang dipilih.
- Inisialisasi bucket MinIO (`anpr`, `axle`, `attachment`, dll).
- Jalankan seed master data baseline (role, konfigurasi awal, reference data minimum).
- Buat default admin area dari config (`DEFAULT_ADMIN_USERNAME`, `DEFAULT_ADMIN_PASSWORD`).
- Password default admin harus di-hash sebelum disimpan ke database.

8. Verify
- Health check endpoint:
  - web `/login` atau `/health` jika tersedia
  - general API `/health`
  - ANPR service health
  - AXLE service health
  - CCTV service health
  - WB service health
  - Hasura `/healthz`
  - NATS connectivity check
  - DB readiness
  - MinIO readiness
  - FTP readiness
- Cetak ringkasan hasil deploy.

## C. Deployment Config Contract (MVP)

Contoh kunci config:

- Area identity:
  - `AREA_CODE`
  - `SITE_CODE`
  - `SITE_NAME`
  - `SITE_REGION`
- Host/network:
  - `HOST_PUBLIC_URL`
  - `WEB_PORT`
  - `API_PORT`
  - `HASURA_PORT`
  - `NATS_PORT`
  - `FTP_PORT`
  - `POSTGRES_PORT`
  - `MINIO_API_PORT`
  - `MINIO_CONSOLE_PORT`
- Images:
  - `WEB_IMAGE`
  - `GENERAL_API_IMAGE`
  - `ANPR_IMAGE`
  - `AXLE_IMAGE`
  - `CCTV_IMAGE`
  - `WB_IMAGE`
  - `HASURA_IMAGE`
  - `NATS_IMAGE`
  - `FTP_IMAGE`
- Database:
  - `POSTGRES_DB`
  - `POSTGRES_USER`
  - `POSTGRES_PASSWORD`
- Bootstrap data & default admin:
  - `RUN_DB_MIGRATION_ON_INSTALL` (`true/false`)
  - `RUN_MASTER_SEED_ON_INSTALL` (`true/false`)
  - `DEFAULT_ADMIN_USERNAME`
  - `DEFAULT_ADMIN_PASSWORD`
  - `DEFAULT_ADMIN_FULL_NAME`
  - `DEFAULT_ADMIN_EMAIL` (opsional)
- App security:
  - `JWT_SECRET`
  - `AUTH_ENABLED`
- MinIO:
  - `MINIO_ROOT_USER`
  - `MINIO_ROOT_PASSWORD`
  - `ANPR_MINIO_BUCKET`
  - `AXLE_MINIO_BUCKET`
  - `ATTACHMENT_MINIO_BUCKET`
- Hasura:
  - `HASURA_GRAPHQL_DATABASE_URL`
  - `HASURA_GRAPHQL_ADMIN_SECRET`
  - `HASURA_GRAPHQL_JWT_SECRET`
- NATS:
  - `NATS_URL`
  - `NATS_USER`
  - `NATS_PASSWORD`
- FTP:
  - `FTP_USER`
  - `FTP_PASS`
  - `FTP_ROOT_DIR`
- Device/source integration:
  - `ANPR_FTP_HOST`, `ANPR_FTP_USER`, `ANPR_FTP_PASS`, `ANPR_FTP_DIR`
  - `AXLE_FTP_HOST`, `AXLE_FTP_USER`, `AXLE_FTP_PASS`, `AXLE_FTP_DIR`
  - `RTSP_URL`

## D. Portainer Stack Strategy

- Direkomendasikan menggabungkan service area dalam satu stack bernama `jatanlin-<area_code>`.
- Service naming convention:
  - `jtn-<area_code>-web`
  - `jtn-<area_code>-api-service`
  - `jtn-<area_code>-anpr-service`
  - `jtn-<area_code>-axle-service`
  - `jtn-<area_code>-cctv-service`
  - `jtn-<area_code>-wb-service`
  - `jtn-<area_code>-hasura`
  - `jtn-<area_code>-nats`
  - `jtn-<area_code>-ftp`
  - `jtn-<area_code>-postgres`
  - `jtn-<area_code>-minio`
- Semua service pakai restart policy `unless-stopped`.

## E. Data Persistence

- PostgreSQL volume wajib persisten per area.
- MinIO volume wajib persisten per area.
- NATS JetStream volume wajib persisten per area.
- FTP data volume wajib persisten per area bila FTP lokal dipakai sebagai source.
- Upgrade image tidak boleh recreate volume kecuali mode explicit `--reset-data`.
- Mode `--reset-data` harus memerlukan konfirmasi eksplisit karena destruktif.

## F. Security & Secret Handling

- File `configs/*.env` tidak boleh di-commit jika berisi secret nyata.
- Sediakan `configs/area.example.env` dengan placeholder.
- Script masking log untuk key sensitif (`PASSWORD`, `SECRET`, `TOKEN`).
- Untuk production, direkomendasikan integrasi ke secret manager (Vault/SSM/etc).

## G. Failure Handling

- Kategori error:
  - `CONFIG_ERROR`
  - `INFRA_ERROR`
  - `DEPLOY_ERROR`
  - `VERIFY_ERROR`
- Jika deploy service gagal di tengah jalan:
  - simpan status partial
  - rollback optional ke versi stack sebelumnya (`--rollback-on-fail`)
- Semua error ditulis ke log file deploy dengan timestamp.
- Jika migration/seed/admin bootstrap gagal, status deployment dianggap `FAILED` walaupun container sudah `running`.

## H. Acceptance Criteria

- Dengan satu file config valid, script dapat deploy stack area lengkap dari host kosong.
- Hasil deploy menghasilkan semua service `running` dan health check `pass`.
- Setelah deploy pertama selesai, schema DB sudah termigrasi penuh dan master data baseline tersedia.
- Setelah deploy pertama selesai, user admin default dari config dapat login ke aplikasi area.
- Re-run script dengan config sama tidak membuat resource duplicate.
- Pergantian config image tag melakukan rolling update berhasil.

## Open Decisions

- Apakah `wb` berjalan penuh sebagai container di stack area atau tetap memerlukan host/device edge tertentu.
- Apakah FTP di area wajib dikelola stack ini atau hanya mode optional saat vendor menyediakan FTP external.
- Pilihan reverse proxy/TLS termination standar (Traefik, Nginx, atau LB eksternal).
- Mekanisme migration DB: auto on deploy vs command terpisah untuk kontrol lebih ketat.
