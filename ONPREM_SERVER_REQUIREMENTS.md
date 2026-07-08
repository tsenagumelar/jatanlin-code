# Kebutuhan Server On-Premise Jatanlin/WIM

Dokumen ini merangkum kebutuhan server, prerequisite, dan requirement deployment on-premise untuk aplikasi Jatanlin/WIM pada repository ini.

## Ringkasan Aplikasi

Aplikasi terdiri dari beberapa komponen utama:

- `jatanlin-web-apps`: aplikasi web operator berbasis Next.js.
- `jatanlin-backend-services`: backend Go untuk API, ANPR watcher, AXLE watcher, dimension processing, dan CCTV recorder.
- `jatanlin-wb-agent`: service .NET 8 untuk integrasi WServer/WIM.
- PostgreSQL: database utama aplikasi.
- Hasura GraphQL: layer GraphQL untuk web.
- MinIO: object storage untuk file XML, image ANPR/AXLE, attachment, dan video CCTV.
- NATS JetStream: queue dan cache retry.
- FTP server: endpoint penerimaan file ANPR dan AXLE.

Target deployment yang tersedia di repo menggunakan Docker Compose/Portainer stack.

Ada dua profil deployment:

- Gate/area: menjalankan web, backend, database, Hasura, MinIO, NATS, FTP, ANPR watcher, AXLE watcher, CCTV service, dan WB agent karena terhubung langsung ke device lapangan.
- Data Center: menjalankan web, API backend, MinIO, Hasura, dan PostgreSQL. Data Center tidak menjalankan service device/watcher karena data dikirim atau disinkronkan dari masing-masing gate.

## Rekomendasi Spesifikasi Server

### Minimum untuk 1 Lokasi / 1 Gate

Spesifikasi ini cukup untuk demo, pilot, atau traffic rendah.

| Komponen | Minimum                                                       |
| -------- | ------------------------------------------------------------- |
| CPU      | 4 core                                                        |
| RAM      | 8 GB                                                          |
| Storage  | 250 GB SSD/HDD                                                |
| Network  | 1 Gbps LAN                                                    |
| OS       | Ubuntu Server 22.04/24.04 LTS atau distro Linux server setara |

### Rekomendasi Produksi untuk 1 Lokasi

Spesifikasi ini lebih aman untuk operasi harian dengan CCTV recording, penyimpanan image, dan retensi data beberapa bulan.

| Komponen | Rekomendasi                                                   |
| -------- | ------------------------------------------------------------- |
| CPU      | 8 core                                                        |
| RAM      | 16 GB                                                         |
| Storage  | 500 GB SSD/HDD                                                |
| Network  | 1 Gbps LAN                                                    |
| OS       | Ubuntu Server 22.04/24.04 LTS atau distro Linux server setara |
| UPS      | Disarankan, minimal untuk graceful shutdown                   |

### Rekomendasi Data Center

Data Center menerima data dari beberapa gate, sehingga sizing harus mengikuti jumlah gate, jumlah transaksi, dan retensi data pusat.

| Skala Data Center   |    CPU |   RAM | Storage awal |
| ------------------- | -----: | ----: | -----------: |
| Kecil, 1-3 gate     | 8 core | 16 GB | 1 TB SSD/HDD |
| Menengah, 4-10 gate | 8 core | 16 GB | 2 TB SSD/HDD |
| Besar, >10 gate     | 8 core | 16 GB | 4 TB SSD/HDD |

Untuk Data Center produksi, storage perlu lebih besar dari gate karena menjadi agregator data transaksi, image, attachment, dan data historis dari semua gate.

## Requirement Software Server

Jika menggunakan deployment Docker/Portainer, host server minimal membutuhkan:

| Software              | Versi/Requirement                                        |
| --------------------- | -------------------------------------------------------- |
| Linux Server          | Ubuntu Server 22.04/24.04 LTS disarankan                 |
| Docker Engine         | Versi stabil terbaru                                     |
| Docker Compose Plugin | Versi stabil terbaru                                     |
| Portainer             | Opsional, tetapi stack repo disiapkan untuk Portainer    |
| Git                   | Untuk clone/update repository                            |
| OpenSSL               | Untuk generate secret/certificate                        |
| NTP/Chrony            | Wajib agar timestamp transaksi, sensor, dan CCTV sinkron |

Jika service dijalankan tanpa Docker, tambahan runtime yang dibutuhkan:

| Komponen            | Runtime                           |
| ------------------- | --------------------------------- |
| Web                 | Node.js 23 sesuai Dockerfile, npm |
| Backend             | Go 1.24.x                         |
| WB Agent            | .NET 8 runtime/SDK                |
| Database            | PostgreSQL 15                     |
| CCTV real recording | `ffmpeg` tersedia di runtime      |

Catatan penting: service CCTV memanggil binary `ffmpeg` untuk merekam RTSP. Jika memakai container backend Go yang ada saat ini, pastikan image runtime memasang `ffmpeg` sebelum mode CCTV real digunakan.

## Service yang Berjalan di Server

### Gate/Area

Deployment area menjalankan service berikut:

| Service         | Fungsi                        | Port internal          |
| --------------- | ----------------------------- | ---------------------- |
| `postgres`      | Database utama                | 5432                   |
| `hasura`        | GraphQL API/subscription      | 8080                   |
| `minio`         | Object storage API            | 9000                   |
| `minio console` | Admin console MinIO           | 9001                   |
| `nats`          | Queue/cache JetStream         | 4222                   |
| `ftp`           | Upload/polling file ANPR/AXLE | 21 + passive ports     |
| `web`           | UI operator                   | 3000                   |
| `api-service`   | Backend API Go                | 4000                   |
| `anpr-service`  | Watcher FTP ANPR              | tidak expose publik    |
| `axle-service`  | Watcher FTP AXLE              | tidak expose publik    |
| `cctv-service`  | Recorder/trigger CCTV         | 8090 bila HTTP enabled |
| `wb-service`    | Integrasi WServer/WIM         | 5000                   |

Default mapping port pada `deploy/configs/area.example.env`:

| Variable             | Default | Keterangan         |
| -------------------- | ------: | ------------------ |
| `WEB_PORT`           |   13000 | akses web operator |
| `API_PORT`           |   14000 | backend API        |
| `WB_PORT`            |   15000 | WB agent API       |
| `HASURA_PORT`        |   18080 | Hasura GraphQL     |
| `NATS_PORT`          |   14222 | NATS               |
| `FTP_PORT`           |   10021 | FTP command port   |
| `POSTGRES_PORT`      |   15432 | PostgreSQL         |
| `MINIO_API_PORT`     |   19000 | MinIO API          |
| `MINIO_CONSOLE_PORT` |   19001 | MinIO console      |

FTP passive ports `21100-21110` juga perlu dibuka jika device ANPR/AXLE mengirim atau mengambil file melalui FTP mode passive.

### Data Center

Deployment Data Center hanya menjalankan service inti untuk menerima, menyimpan, dan menampilkan data hasil sinkronisasi dari gate.

| Service         | Fungsi                                       | Port internal |
| --------------- | -------------------------------------------- | ------------- |
| `postgres`      | Database pusat/agregasi data semua gate      | 5432          |
| `hasura`        | GraphQL API/subscription pusat               | 8080          |
| `minio`         | Object storage pusat untuk file hasil sync   | 9000          |
| `minio console` | Admin console MinIO                          | 9001          |
| `web`           | UI dashboard/monitoring Data Center          | 3000          |
| `api-service`   | Backend API pusat dan endpoint penerima sync | 4000          |

Service yang tidak diperlukan di Data Center:

- `anpr-service`
- `axle-service`
- `cctv-service`
- `wb-service`
- `ftp`
- `nats`, kecuali mekanisme sync pusat di kemudian hari membutuhkan queue.

Default mapping port Data Center dapat mengikuti port yang sama dengan area, tetapi biasanya cukup membuka:

| Variable             | Keterangan                                     |
| -------------------- | ---------------------------------------------- |
| `WEB_PORT`           | akses dashboard Data Center                    |
| `API_PORT`           | endpoint backend/API penerima sync dari gate   |
| `HASURA_PORT`        | Hasura GraphQL pusat                           |
| `POSTGRES_PORT`      | PostgreSQL, sebaiknya hanya internal/VPN/admin |
| `MINIO_API_PORT`     | MinIO API untuk object/file hasil sync         |
| `MINIO_CONSOLE_PORT` | MinIO console, sebaiknya hanya admin           |

## Requirement Network dan Firewall

### Akses dari Operator

Minimal operator browser perlu akses ke:

- Web UI: `http://<server-ip>:WEB_PORT`
- Hasura GraphQL/WebSocket: `http://<server-ip>:HASURA_PORT/v1/graphql`
- Backend API: `http://<server-ip>:API_PORT`
- MinIO asset URL: `http://<server-ip>:MINIO_API_PORT` jika file dibuka langsung dari browser

Untuk produksi, disarankan memakai reverse proxy dan HTTPS sehingga operator cukup mengakses domain internal, misalnya:

- `https://jatanlin-area.local`
- `https://api.jatanlin-area.local`
- `https://graphql.jatanlin-area.local`
- `https://storage.jatanlin-area.local`

### Akses dari Device/Sensor

Server perlu konektivitas ke atau dari perangkat berikut:

| Device         | Arah koneksi                                 | Protocol/Port                     | Keterangan                      |
| -------------- | -------------------------------------------- | --------------------------------- | ------------------------------- |
| ANPR           | server poll ke FTP atau device upload ke FTP | FTP 21/passive                    | file XML dan image ANPR         |
| AXLE/VAC       | server poll ke FTP atau device upload ke FTP | FTP 21/passive                    | file XML dan image axle/dimensi |
| CCTV/IP Camera | server ke kamera                             | RTSP 554, ONVIF HTTP bila dipakai | rekaman video pendukung         |
| WIM/WServer    | WB agent ke WServer                          | TCP, default config 65002         | capture berat kendaraan         |
| NTP server     | semua host/device                            | UDP 123                           | sinkronisasi waktu              |

Pastikan semua device memakai timezone/waktu yang sinkron. Selisih waktu besar dapat membuat session matching gagal atau data masuk ke session yang salah.

### IP Statis Device Gate

Untuk deployment Gate/Area, semua perangkat lapangan sebaiknya memakai IP statis dalam subnet lokal yang sama. Berdasarkan konfigurasi contoh di repo, subnet yang dipakai adalah `10.0.43.0/24`.

Default IP plan:

| Perangkat | IP statis | Variable/config terkait | Keterangan |
| --- | --- | --- | --- |
| WIM/WServer | `10.0.43.10` | `WIM_IP`, `NEXT_PUBLIC_WIM_IP`, `WServer__Host` | device jembatan timbang, default port WServer `65002` |
| CCTV camera | `10.0.43.20` | `CCTV_IP`, `NEXT_PUBLIC_CCTV_IP`, `RTSP_URL`, `CCTV_RTSP_URL`, `ONVIF_ENDPOINT` | kamera CCTV bukti, RTSP default port `554` |
| ANPR camera | `10.0.43.30` | `ANPR_IP`, `NEXT_PUBLIC_ANPR_IP` | kamera pengenal plat nomor |
| AXLE/VAC device | `10.0.43.40` | `AXLE_IP`, `NEXT_PUBLIC_AXLE_IP` | kamera/sensor penghitung sumbu atau VAC |
| Gateway/server lokal | `10.0.43.100` | `GATEWAY_IP`, `ANPR_FTP_HOST`, `AXLE_FTP_HOST` | gateway jaringan lokal atau host service FTP area |

Contoh nilai konfigurasi:

```env
WIM_IP=10.0.43.10
ANPR_IP=10.0.43.30
AXLE_IP=10.0.43.40
CCTV_IP=10.0.43.20
GATEWAY_IP=10.0.43.100

NEXT_PUBLIC_WIM_IP=10.0.43.10
NEXT_PUBLIC_ANPR_IP=10.0.43.30
NEXT_PUBLIC_AXLE_IP=10.0.43.40
NEXT_PUBLIC_CCTV_IP=10.0.43.20

WServer__Host=10.0.43.10
WServer__Port=65002

RTSP_URL=rtsp://<user>:<password>@10.0.43.20:554/profile1
CCTV_RTSP_URL=rtsp://<user>:<password>@10.0.43.20:554/profile1
ONVIF_ENDPOINT=http://10.0.43.20/onvif/device_service

ANPR_FTP_HOST=10.0.43.100:10021
AXLE_FTP_HOST=10.0.43.100:10021
```

Aturan implementasi:

- IP device harus dibuat static dari device langsung atau DHCP reservation di router.
- Jangan gunakan DHCP dinamis untuk ANPR, AXLE/VAC, CCTV, WIM, server, atau gateway.
- Pastikan tidak ada IP conflict di subnet `10.0.43.0/24`.
- Dokumentasikan MAC address, serial number, lokasi fisik, dan IP setiap device.
- Server Gate/Area harus bisa `ping` atau minimal membuka koneksi ke setiap device sesuai port yang dipakai.
- Jika subnet lapangan berbeda, gunakan mapping yang sama secara konsep dan update semua env/config terkait.
- Data Center tidak perlu mengikuti IP plan `10.0.43.xxx` karena tidak terhubung langsung ke device gate.

### Akses Sinkronisasi Gate ke Data Center

Data Center tidak perlu akses langsung ke device ANPR, AXLE, CCTV, atau WIM. Koneksi yang dibutuhkan adalah dari masing-masing gate ke endpoint Data Center.

Minimal konektivitas gate ke Data Center:

| Dari                      | Ke                                           | Protocol/Port                                     | Keterangan                           |
| ------------------------- | -------------------------------------------- | ------------------------------------------------- | ------------------------------------ |
| Gate backend/sync service | Data Center API                              | HTTP/HTTPS ke `API_PORT` atau reverse proxy       | pengiriman data transaksi dan status |
| Gate backend/sync service | Data Center Hasura, jika sync lewat GraphQL  | HTTP/HTTPS ke `HASURA_PORT` atau reverse proxy    | mutation/query sinkronisasi          |
| Gate backend/sync service | Data Center MinIO, jika file disync langsung | HTTP/HTTPS ke `MINIO_API_PORT` atau reverse proxy | upload image/video/XML/attachment    |
| Admin/operator pusat      | Data Center Web                              | HTTP/HTTPS ke `WEB_PORT` atau reverse proxy       | dashboard pusat                      |

Disarankan koneksi gate ke Data Center memakai VPN/private network atau HTTPS dengan allowlist IP gate.

## Prerequisite Infrastruktur

Sebelum deployment, siapkan:

- IP statis untuk server on-prem.
- DNS internal atau hostname, jika menggunakan domain.
- Akses admin ke server Linux.
- Docker Engine dan Docker Compose sudah terpasang.
- Port firewall sudah dibuka sesuai mapping port.
- NTP/Chrony aktif pada server dan device.
- Storage data memiliki kapasitas dan mount point yang jelas.
- Backup target tersedia, misalnya NAS, disk eksternal, atau S3-compatible storage lain.
- Akun/credential final untuk PostgreSQL, Hasura admin secret, JWT secret, MinIO, NATS, FTP, device ANPR/AXLE, RTSP, dan WServer.
- Sertifikat TLS jika aplikasi diekspos melalui HTTPS.

Untuk Data Center, credential device lapangan tidak diperlukan. Yang wajib disiapkan adalah credential database pusat, Hasura, JWT, MinIO, API sync token/secret, dan akses jaringan dari setiap gate.

## Prerequisite Device dan Integrasi Gate/Area

Bagian ini berlaku untuk server Gate/Area. Data Center tidak membutuhkan akses langsung ke ANPR, AXLE, CCTV, atau WIM karena data diterima dari hasil sinkronisasi masing-masing gate.

### ANPR

- Device ANPR dapat menghasilkan XML dan image sesuai format yang diproses backend.
- FTP host, username, password, dan directory ANPR sudah ditentukan.
- Backend dapat membaca file dari directory `ANPR_FTP_DIR`.
- Jika memakai MinIO, bucket ANPR tersedia, default `anpr`.
- Pastikan mode dummy dimatikan untuk produksi: `ANPR_DUMMY_ENABLED=false`.

### AXLE/VAC

- Device AXLE/VAC dapat menghasilkan XML dan image sesuai format yang diproses backend.
- FTP host, username, password, dan directory AXLE sudah ditentukan.
- Backend dapat membaca file dari directory `AXLE_FTP_DIR`.
- Bucket AXLE tersedia, default `axle`.
- Pastikan mode dummy dimatikan untuk produksi: `AXLE_DUMMY_ENABLED=false`.

### CCTV

- Kamera menyediakan RTSP URL yang stabil.
- Credential RTSP/ONVIF valid.
- Server dapat mengakses IP kamera dari network on-prem.
- `ffmpeg` tersedia di runtime `cctv-service`.
- Bucket attachment tersedia, default `attachment`.
- Pastikan mode dummy dimatikan untuk produksi: `CCTV_TRIGGER_DUMMY=false`.

### WIM/WServer

- IP dan port WServer dapat diakses dari server.
- Default appsettings menggunakan host `10.0.43.10` dan port `65002`; sesuaikan dengan device lapangan.
- Username/password WServer valid jika auto-login digunakan.
- Direction kendaraan sesuai konfigurasi lapangan, misalnya `LEFT` atau `RIGHT`.
- Pastikan mode dummy dimatikan untuk produksi: `WEIGHING_TRIGGER_DUMMY=false` dan `WB__DummyEnabled=false` jika menggunakan konfigurasi .NET nested.

## Environment Variable Wajib

Konfigurasi area dibuat dari:

```bash
cp deploy/configs/area.example.env deploy/configs/area-<area_code>.env
```

Variable yang wajib disesuaikan untuk produksi:

### Identitas Lokasi

- `AREA_CODE`
- `SITE_CODE`
- `SITE_NAME`
- `SITE_REGION`
- `SITE_LOCATION`

### Image dan Platform

- `WEB_IMAGE`
- `GENERAL_API_IMAGE`
- `ANPR_IMAGE`
- `AXLE_IMAGE`
- `CCTV_IMAGE`
- `WB_IMAGE`
- `SERVICE_PLATFORM`

Gunakan `linux/amd64` untuk server Intel/AMD umum, atau `linux/arm64/v8` untuk ARM64.

### Secret dan Security

- `POSTGRES_PASSWORD`
- `HASURA_GRAPHQL_ADMIN_SECRET`
- `HASURA_GRAPHQL_JWT_SECRET`
- `JWT_SECRET`
- `MINIO_ROOT_USER`
- `MINIO_ROOT_PASSWORD`
- `NATS_USER`
- `NATS_PASSWORD`
- `ANPR_FTP_PASS`
- `AXLE_FTP_PASS`

Jangan gunakan nilai contoh seperti `change-me-admin-secret`, `postgres`, `minioadmin123`, atau `admin123` di produksi.

### Endpoint Integrasi

- `WIM_IP`
- `ANPR_IP`
- `AXLE_IP`
- `CCTV_IP`
- `GATEWAY_IP`
- `NEXT_PUBLIC_WIM_IP`
- `NEXT_PUBLIC_ANPR_IP`
- `NEXT_PUBLIC_AXLE_IP`
- `NEXT_PUBLIC_CCTV_IP`
- `ANPR_FTP_HOST`
- `ANPR_FTP_USER`
- `ANPR_FTP_PASS`
- `ANPR_FTP_DIR`
- `AXLE_FTP_HOST`
- `AXLE_FTP_USER`
- `AXLE_FTP_PASS`
- `AXLE_FTP_DIR`
- `RTSP_URL`
- `CCTV_RTSP_URL`
- `ONVIF_ENDPOINT`
- `WServer__Host` / `WServer:Host` atau konfigurasi ekuivalen untuk WB agent
- `WServer__Port` / `WServer:Port` atau konfigurasi ekuivalen untuk WB agent

### Mode Produksi

Untuk produksi, set:

```env
AUTH_ENABLED=true
ANPR_DUMMY_ENABLED=false
AXLE_DUMMY_ENABLED=false
CCTV_TRIGGER_DUMMY=false
WEIGHING_TRIGGER_DUMMY=false
```

### Environment Data Center

Untuk Data Center, variable device/gate berikut tidak wajib karena servicenya tidak dijalankan:

- `ANPR_FTP_HOST`, `ANPR_FTP_USER`, `ANPR_FTP_PASS`, `ANPR_FTP_DIR`
- `AXLE_FTP_HOST`, `AXLE_FTP_USER`, `AXLE_FTP_PASS`, `AXLE_FTP_DIR`
- `RTSP_URL`
- `WServer__Host`, `WServer__Port`, dan credential WServer
- `NATS_URL`, kecuali sync pusat memakai queue

Variable yang tetap wajib:

- `DATABASE_URL`
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
- `HASURA_GRAPHQL_ADMIN_SECRET`
- `HASURA_GRAPHQL_JWT_SECRET`
- `JWT_SECRET`
- `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`
- `WEB_IMAGE`, `GENERAL_API_IMAGE`
- `SITE_CODE` atau kode identitas Data Center, misalnya `DC-001`

Tambahkan secret khusus sinkronisasi jika endpoint API pusat menerima push data dari gate, misalnya `SYNC_API_TOKEN` atau nama variable yang dipakai implementasi sync.

## Deployment

### Gate/Area

Alur deployment Gate/Area yang tersedia:

1. Siapkan config area.

   ```bash
   cp deploy/configs/area.example.env deploy/configs/area-<area_code>.env
   ```

2. Edit semua variable pada `deploy/configs/area-<area_code>.env`.

3. Validasi config.

   ```bash
   ./deploy/rollout-area.sh --config deploy/configs/area-<area_code>.env --mode validate
   ```

4. Install pertama kali, termasuk migration dan seed jika diaktifkan.

   ```bash
   ./deploy/rollout-area.sh --config deploy/configs/area-<area_code>.env --mode install
   ```

5. Upgrade deployment berikutnya.

   ```bash
   ./deploy/rollout-area.sh --config deploy/configs/area-<area_code>.env --mode upgrade
   ```

### Data Center

Untuk Data Center, gunakan konfigurasi deployment terpisah yang hanya mengaktifkan service:

- `web`
- `api-service`
- `hasura`
- `postgres`
- `minio`

Jika berangkat dari template area, service berikut harus dinonaktifkan atau tidak dimasukkan ke stack Data Center:

- `anpr-service`
- `axle-service`
- `cctv-service`
- `wb-service`
- `ftp`
- `nats`, kecuali implementasi sync pusat membutuhkan queue.

## Health Check dan Verifikasi

Setelah deployment Gate/Area, verifikasi minimal:

```bash
curl http://<server-ip>:<API_PORT>/health
curl http://<server-ip>:<WB_PORT>/
curl http://<server-ip>:<HASURA_PORT>/v1/version
curl http://<server-ip>:<MINIO_API_PORT>/minio/health/live
```

Untuk Data Center, verifikasi minimal:

```bash
curl http://<dc-server-ip>:<API_PORT>/health
curl http://<dc-server-ip>:<HASURA_PORT>/v1/version
curl http://<dc-server-ip>:<MINIO_API_PORT>/minio/health/live
```

Checklist fungsional:

- Web operator dapat dibuka.
- Login user admin berhasil.
- Hasura dapat query database.
- PostgreSQL menerima migration dan seed master data.
- MinIO bucket `anpr`, `axle`, dan `attachment` tersedia.
- NATS JetStream aktif.
- ANPR watcher dapat membaca FTP ANPR.
- AXLE watcher dapat membaca FTP AXLE.
- CCTV recorder dapat merekam RTSP dan upload file.
- WB agent dapat login/capture dari WServer.
- Satu session kendaraan menghasilkan data ANPR, AXLE, WB, CCTV, dan dimension sesuai flow.

Checklist khusus Data Center:

- Web dashboard Data Center dapat dibuka.
- API backend pusat dapat menerima request dari gate.
- Hasura pusat dapat query database pusat.
- PostgreSQL pusat menerima data hasil sync dari minimal satu gate.
- MinIO pusat menerima file hasil sync dari minimal satu gate.
- Data transaksi dari gate tampil di dashboard pusat.
- Tidak ada service device gate yang berjalan di Data Center kecuali memang dibutuhkan khusus.

## Backup dan Retensi

Minimal backup yang perlu disiapkan:

- PostgreSQL dump harian.
- Backup volume PostgreSQL sebelum upgrade besar.
- Backup data MinIO sesuai policy retensi.
- Backup file konfigurasi area dan secret ke tempat aman.
- Snapshot VM/disk jika infrastruktur mendukung.

Contoh target backup:

- harian: PostgreSQL dump;
- mingguan: full backup PostgreSQL + MinIO;
- sebelum upgrade: snapshot atau backup manual;
- retensi: minimal 14-30 hari untuk backup operasional.

Pastikan restore pernah diuji, bukan hanya backup dibuat.

## Security Hardening

Untuk produksi:

- Gunakan HTTPS melalui reverse proxy.
- Jangan expose PostgreSQL, NATS, MinIO console, dan Hasura console ke jaringan luas tanpa pembatasan.
- Batasi firewall hanya dari subnet operator/device yang diperlukan.
- Gunakan password kuat dan unik untuk setiap service.
- Rotasi secret secara berkala.
- Set `AUTH_ENABLED=true`.
- Pastikan `HASURA_GRAPHQL_ADMIN_SECRET` tidak dipakai langsung dari browser.
- Matikan mode dummy seluruh device.
- Gunakan user non-root untuk operasi server bila memungkinkan.
- Aktifkan log rotation untuk container dan host.

## Risiko dan Catatan Implementasi

- Frontend saat ini memiliki konfigurasi `NEXT_PUBLIC_*`; semua variable dengan prefix ini terekspos ke browser. Jangan menaruh secret di variable frontend.
- Beberapa nilai contoh di repository masih memakai credential dummy. Semua harus diganti saat deployment.
- CCTV real mode membutuhkan `ffmpeg`; pastikan image/container menyediakannya.
- Port default dapat bentrok dengan service lain. Jika bentrok, ubah mapping port pada config area.
- Untuk multi-lokasi atau traffic tinggi, pertimbangkan memisahkan database/object storage dari node aplikasi.

## Checklist Go-Live

### Gate/Area

- [ ] Server Linux siap dengan IP statis.
- [ ] Docker dan Docker Compose berjalan.
- [ ] NTP aktif di server dan semua device.
- [ ] Firewall membuka port yang diperlukan saja.
- [ ] IP statis device sudah mengikuti IP plan gate atau sudah didokumentasikan jika berbeda.
- [ ] Config area sudah memakai secret produksi.
- [ ] Dummy mode dimatikan.
- [ ] ANPR FTP test berhasil.
- [ ] AXLE FTP test berhasil.
- [ ] RTSP CCTV test berhasil.
- [ ] WServer/WIM capture test berhasil.
- [ ] Migration dan seed database berhasil.
- [ ] Web operator dapat digunakan dari workstation operator.
- [ ] Backup dan restore test sudah dilakukan.
- [ ] Monitoring log container dan disk usage tersedia.

### Data Center

- [ ] Server Data Center siap dengan IP statis atau domain internal.
- [ ] Docker dan Docker Compose berjalan.
- [ ] NTP aktif di server Data Center.
- [ ] Firewall hanya membuka port web/API/Hasura/MinIO yang diperlukan.
- [ ] Credential PostgreSQL, Hasura, JWT, MinIO, dan sync API sudah memakai secret produksi.
- [ ] Service yang berjalan hanya `web`, `api-service`, `hasura`, `postgres`, dan `minio`.
- [ ] Gate dapat mengakses endpoint sync Data Center melalui VPN/HTTPS.
- [ ] Test sync dari minimal satu gate berhasil.
- [ ] Data transaksi dan file dari gate tampil di dashboard pusat.
- [ ] Backup PostgreSQL dan MinIO pusat sudah dijadwalkan.
- [ ] Restore test Data Center sudah dilakukan.
- [ ] Monitoring resource, disk usage, dan log container tersedia.
