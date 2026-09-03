# Dokumentasi API ETLE

Integrasi pengiriman data pelanggaran dari Jatanlin ke sistem ETLE Korlantas Polri.

## Catatan Umum

- Payload pengiriman data **tidak berubah** dibanding API integrasi ETLE sebelumnya; hanya **endpoint dan kredensial** yang berubah.
- Kredensial (`usertoken`, `passtoken`, `client_secret`) diberikan oleh tim ETLE Korlantas atau helpdesk ETLE, **setelah master data kamera divalidasi**.
- Setiap awal integrasi wajib dilakukan pendataan master kamera. Masing-masing Polda atau Polres/ta mengirimkan data alamat kamera sesuai format yang ditentukan ke Subdit Dakgar Korlantas.
- Untuk uji coba koneksi API, gunakan contoh request di bawah.

## Master Data Kamera

Format yang dikirim ke Subdit Dakgar Korlantas:

| No | Polda/Polres | DeviceName | LocationName | IP Address | Latitude | Longitude |
|----|--------------|------------|--------------|------------|----------|-----------|
| 1 | Polresta Palembang | DPN Bank BNI (10.45.35.225) | Jl. Alamsyah Ratu Prawiranegara, Karang Jaya, Kec. Gandus, Kota Palembang, Sumatera Selatan 30139 | 10.45.35.225 | -3.0024916 | 104.7189044 |

### Master kamera Jatanlin

Data ini disimpan di [site.json](../site.json) pada blok `etle`, lalu disebar ke file `.env` dengan `make site-apply`.

| Nama Kamera | Tipe Kamera | Longitude | Latitude | Lokasi | Wilayah | Provinsi | Pengadilan | Kejaksaan |
|-------------|-------------|-----------|----------|--------|---------|----------|------------|-----------|
| Jatanlin1 | ANPR Camera | — | — | — | Korlantas | — | — | — |

Pemetaan kolom tabel di atas ke payload API ETLE:

| Kolom tabel | Field site.json | Env | Field payload ETLE |
|-------------|-----------------|-----|--------------------|
| Nama Kamera | `etle.deviceName` | `ETLE_DEVICE_NAME` | `deviceName` |
| Tipe Kamera | `etle.cameraType` | `ETLE_CAMERA_TYPE` | — (metadata, tidak dikirim) |
| Longitude | `etle.longitude` | `ETLE_LON` | `lon` |
| Latitude | `etle.latitude` | `ETLE_LAT` | `lat` |
| Lokasi | `etle.locationName` | `ETLE_LOCATION_NAME` | `locationName` |
| Wilayah | `etle.satwil` | `ETLE_SATWIL` | `satwil` |
| Wilayah hukum — Provinsi | `etle.jurisdiction.province` | `ETLE_PROVINCE` | — (metadata) |
| Wilayah hukum — Pengadilan | `etle.jurisdiction.court` | `ETLE_COURT` | — (metadata) |
| Wilayah hukum — Kejaksaan | `etle.jurisdiction.prosecutor` | `ETLE_PROSECUTOR` | — (metadata) |
| — | `etle.nrp` | `ETLE_NRP` | `NRP` |

---

## 1. GET ACCESS_TOKEN

```
POST https://api-etle.polri.go.id/user/login
Content-Type: application/json
```

**Request**

```json
{
  "usertoken": "user_tes",
  "passtoken": "user_tes",
  "client_secret": "c3vjh3NUcosv3IjqFfUB22wBxh3GZQmp",
  "client_id": "integrasi"
}
```

**Response**

```json
{
  "status": 200,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

`access_token` adalah JWT; masa berlakunya dibaca dari claim `exp` (pada contoh ±12 jam).

## 2. POST DATA VIOLATION (Kamera Mobile/Handheld)

```
POST https://api-etle.polri.go.id/violation/insert
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request**

```json
{
  "datas": [
    {
      "deviceName": "TES HANDHELD",
      "locationName": "GOSIGAP DITLANTAS POLDA",
      "locationDescription": "Jln. Pemuda ABC",
      "lat": "-6.200000",
      "lon": "106.816666",
      "NRP": "100101",
      "satwil": "POLDA XYZ",
      "plate": "B7XX",
      "plateColor": "Unknown",
      "plateImageUrl": "-",
      "vehicleType": "-",
      "vehicleColor": "-",
      "vehicleImageUrl": "http://36.91.109.82/etle/foto_frame/010045035227/2024/10/01/1_20241001090334345_H10__3019_BG8467US.jpg",
      "videoUrl": "not available",
      "violationCode": "PS",
      "violationName": "Tidak Menggunakan Seatbelt",
      "captureTime": 1727748214000
    }
  ]
}
```

**Response**

```json
{
  "status": 1112
}
```

Catatan field:

- `captureTime` — epoch **milidetik** saat capture.
- `plateImageUrl` / `vehicleImageUrl` — URL harus bisa diakses server ETLE. Isi `-` bila tidak tersedia.
- `videoUrl` — isi `"not available"` bila tidak ada.

## 3. GET MASTER VIOLATION CODE/NAME

```
GET https://api-etle.polri.go.id/master/list
Content-Type: application/json
```

**Response** — dicek langsung ke endpoint live pada 2026-09-03, `rowCount: 35`:

```json
{
  "success": true,
  "data": {
    "rowCount": 35,
    "rows": [
      { "violation_code": "DB", "violation_name": "Pelanggaran Dilarang Berhenti" },
      { "violation_code": "CL", "violation_name": "Pelanggaran Cross Lane" },
      { "violation_code": "PL", "violation_name": "Pelanggaran Penumpang Lebih" },
      { "violation_code": "GG", "violation_name": "Pelanggaran Ganjil Genap" },
      { "violation_code": "JB", "violation_name": "Terobos Jalur Busway" },
      { "violation_code": "JE", "violation_name": "Terobos Jalur Emergency" },
      { "violation_code": "PS", "violation_name": "Tidak Menggunakan Seatbelt" },
      { "violation_code": "LM", "violation_name": "Menerobos Lampu Merah" },
      { "violation_code": "PO", "violation_name": "Melanggar Batas Kecepatan" },
      { "violation_code": "PU", "violation_name": "Pelanggaran U-Turn" },
      { "violation_code": "PV", "violation_name": "Pelanggaran Verboden" },
      { "violation_code": "HB", "violation_name": "Menggunakan HP Dalam Berkendara" },
      { "violation_code": "TT", "violation_name": "TNKB Tidak Sah" },
      { "violation_code": "PM", "violation_name": "Penumpang Tidak Pakai Helm" },
      { "violation_code": "MH", "violation_name": "Melanggar Hak Pejalan Kaki Atau Pesepeda" },
      { "violation_code": "LP", "violation_name": "Melanggar Larangan Parkir" },
      { "violation_code": "TM", "violation_name": "Melanggar Tata Cara Muatan" },
      { "violation_code": "LA", "violation_name": "Lawan Arah" },
      { "violation_code": "PH", "violation_name": "Tidak Menggunakan Helm" },
      { "violation_code": "JC", "violation_name": "Kendaraan Roda Dua Masuk Jalur Cepat" },
      { "violation_code": "PK", "violation_name": "Persyaratan Teknis KBM" },
      { "violation_code": "PT", "violation_name": "Persyaratan Teknis dan Laik Jalan SPM" },
      { "violation_code": "ST", "violation_name": "STNK, atau STCK Tidak Sah" },
      { "violation_code": "MP", "violation_name": "Tidak mematuhi perintah yang diberikan oleh petugas polri" },
      { "violation_code": "LR", "violation_name": "Melanggar Jam operasional" },
      { "violation_code": "BD", "violation_name": "Berhenti dalam keadaan darurat" },
      { "violation_code": "LU", "violation_name": "Lampu Utama Malam Hari" },
      { "violation_code": "LS", "violation_name": "Tanpa menyalakan lampu utama pada siang hari." },
      { "violation_code": "BL", "violation_name": "Tata Cara Mengemudi" },
      { "violation_code": "PB", "violation_name": "Perlengkapan yang dapat membahayakan keselamatan" },
      { "violation_code": "LT", "violation_name": "Melarang Penggunaan Trotoar selain untuk Pejalan Kaki" },
      { "violation_code": "MO", "violation_name": "Mengangkut orang" },
      { "violation_code": "KA", "violation_name": "Di Perlintasan Kereta Api" },
      { "violation_code": "SR", "violation_name": "Penggunaan Rotator/Sirine" },
      { "violation_code": "MR", "violation_name": "Melanggar Rambu" }
    ]
  }
}
```

> **Update 2026-09-03:** kode `TM` **sudah resmi terdaftar** di `master/list`, dengan nama baku **"Melanggar Tata Cara Muatan"** — bukan "Pelanggaran Muatan Lebih" yang dipakai sebagai default sebelumnya (waktu itu ditebak karena dokumentasi lama belum mencantumkan `TM`). `ETLE_VIOLATION_NAME` sudah disamakan ke nilai resmi ini. `violationCode`/`violationName` tetap dapat diubah lewat `ETLE_VIOLATION_CODE` / `ETLE_VIOLATION_NAME`.

---

## Implementasi di Jatanlin

Scope integrasi ini **hanya mengirim ke ETLE dan mencatat hasilnya** — bukan trigger sync ke
Data Center. Sync ke Data Center sudah berjalan sendiri sebagai background service
([services/backend/cmd/sync-agent](../services/backend/cmd/sync-agent)) pada interval
`DATA_CENTER_SYNC_INTERVAL_SEC` (default 30 detik), jadi kolom-kolom baru di bawah ikut
terbawa otomatis pada siklus sync berikutnya tanpa perlu kode tambahan.

### Alur

1. Operator menekan **Verifikasi** di halaman verifikasi ([apps/web/src/modules/jatanlin/verify/index.tsx](../apps/web/src/modules/jatanlin/verify/index.tsx)).
2. Hasil verifikasi disimpan ke `transact_vehicle_status`, termasuk kolom baru `is_violation` dan `overload_percentage`.
3. Bila status disimpan sebagai `verified`, halaman memanggil `POST /api/etle/send` dengan `statusId`.
4. Route handler ([apps/web/app/api/etle/send/route.ts](../apps/web/app/api/etle/send/route.ts)):
   - Mengambil ulang baris status via Hasura (memakai `apolloClient` yang sudah ada di [apps/web/src/graphql/apollo-client.ts](../apps/web/src/graphql/apollo-client.ts) — tidak ada koneksi terpisah).
   - Berhenti (tanpa error) bila `is_violation = false`, status bukan `verified`, atau `ETLE_ENABLED=false`.
   - Mengirim ke ETLE lewat [apps/web/src/utils/etle.ts](../apps/web/src/utils/etle.ts).
   - Menyimpan response code ke baris status: `etle_status_code`, `etle_message`, `etle_sent_at` (mutation `UpdateVehicleStatusDocument` yang sudah ada di [transact-vehicle-status.ts](../apps/web/src/graphql/hooks/transact-vehicle-status.ts)).
5. Kegagalan ETLE **tidak membatalkan** verifikasi yang sudah tersimpan — operator hanya menerima toast peringatan, dan penyebabnya tercatat di `etle_message`.

Kredensial ETLE hanya dibaca di sisi server (tanpa prefix `NEXT_PUBLIC_`) sehingga tidak pernah dikirim ke browser.

### Sumber data payload

| Field ETLE | Sumber |
|------------|--------|
| `plate` | `transact_vehicle_actual.actual_plat_no`, fallback plat hasil ANPR |
| `vehicleType` | `transact_axle_capture.vehicle_category` / `vehicle_body_type` |
| `plateImageUrl` | Objek `anpr_plate_image` di bucket MinIO Data Center |
| `vehicleImageUrl` | Objek `anpr_full_image` di bucket MinIO Data Center |
| `captureTime` | `transact_anpr_capture.captured_at` (epoch ms) |
| `violationCode` / `violationName` | `ETLE_VIOLATION_CODE` / `ETLE_VIOLATION_NAME` |
| `deviceName`, `locationName`, `lat`, `lon`, `NRP`, `satwil` | Master kamera dari `site.json` (lihat tabel pemetaan di atas) |

URL gambar dibangun dari layout objek yang ditulis **background sync-agent** ke bucket MinIO Data Center:

```
{site_code}/{source_table}/{source_id}/{attachment_type}/{file_name}
```

Bila gambar dipublikasikan di tempat lain, isi `ETLE_PUBLIC_IMAGE_BASE_URL` untuk menimpa base URL tersebut.

> Route ini tidak menunggu ataupun memicu sync attachment — ia hanya menyusun URL sesuai layout
> yang sudah disepakati. Bila verifikasi terjadi sebelum sync-agent sempat menyalin attachment
> ke Data Center, URL yang dikirim ke ETLE akan 404 sampai siklus sync berikutnya selesai.

### Konfigurasi

Isi nilai asli hanya di `.env` dan `apps/web/.env` (keduanya gitignored) — **jangan** di `.env.example`.

| Env | Keterangan |
|-----|------------|
| `ETLE_ENABLED` | `true` untuk mengaktifkan pengiriman ke ETLE |
| `ETLE_BASE_URL` | Default `https://api-etle.polri.go.id` |
| `ETLE_USER_TOKEN` / `ETLE_PASS_TOKEN` / `ETLE_CLIENT_SECRET` | Kredensial dari tim ETLE |
| `ETLE_CLIENT_ID` | Default `integrasi` |
| `ETLE_VIOLATION_CODE` / `ETLE_VIOLATION_NAME` | Default `TM` / `Melanggar Tata Cara Muatan` (nama resmi dari `master/list`) |
| `ETLE_TIMEOUT_MS` | Timeout request, default 20000 |
| `ETLE_PUBLIC_IMAGE_BASE_URL` | Opsional, override base URL gambar |
| `ETLE_DEVICE_NAME`, `ETLE_LOCATION_NAME`, `ETLE_LAT`, `ETLE_LON`, `ETLE_NRP`, `ETLE_SATWIL`, … | Master kamera, dikelola lewat `site.json` + `make site-apply` |
| `DATA_CENTER_MINIO_ENDPOINT` / `DATA_CENTER_MINIO_BUCKET` / `DATA_CENTER_MINIO_USE_SSL` | Dipakai murni untuk menyusun URL gambar di atas |

Tidak ada env Hasura terpisah — route memakai `NEXT_PUBLIC_HASURA_URL` / `NEXT_PUBLIC_HASURA_SECRET` yang sama dengan browser, lewat `apolloClient`.

> **Catatan penting untuk deployment Docker:** `NEXT_PUBLIC_*` di-inline oleh Next.js saat `next build`
> (lihat [apps/web/Dockerfile](../apps/web/Dockerfile)), bukan dibaca ulang saat container jalan. Default
> `NEXT_PUBLIC_HASURA_URL` di [infra/compose/docker-compose.yml](../infra/compose/docker-compose.yml) adalah
> `http://localhost:18080/v1/graphql` — itu benar untuk browser (mengakses lewat port yang di-expose ke host),
> tapi **tidak reachable dari dalam container `web` sendiri** (di jaringan Docker, Hasura ada di
> `http://hasura:8080`, bukan `localhost:18080`). Route `/api/etle/send` akan gagal connect ke Hasura di
> deployment Docker default sampai ini diselaraskan — misalnya build image dengan `NEXT_PUBLIC_HASURA_URL`
> yang reachable dari kedua sisi (lewat `edge-proxy` + hostname di [infra/nginx/hosts.local](../infra/nginx/hosts.local),
> yang sudah disiapkan untuk kebutuhan serupa), atau jalankan web app di luar Docker saat menguji fitur ini.

### Migrasi database

Kolom baru ditambahkan oleh [infra/database/007_add_verification_violation_etle_fields.sql](../infra/database/007_add_verification_violation_etle_fields.sql):
`is_violation`, `overload_percentage`, `etle_status_code`, `etle_message`, `etle_sent_at` pada `transact_vehicle_status`.

Jalankan `make infra-migrate`, lalu **reload metadata Hasura** agar kolom baru muncul di GraphQL,
dan jalankan ulang `graphql-codegen` di `apps/web` agar tipe `Transact_Vehicle_Status_Set_Input`
ikut memuat kolom baru (menghapus kebutuhan cast `as any`/`as Record<string, unknown>` di kode).

Data Center **tidak** diubah skemanya di sini — sync-agent yang sudah berjalan mengirim seluruh
kolom `transact_vehicle_status` (termasuk yang baru) lewat `SELECT *`, tapi karena backend Data
Center mem-parsing payload dengan daftar kolom eksplisit, kolom baru ini untuk saat ini
**diabaikan secara diam-diam** di sisi Data Center (tidak error, hanya belum tersimpan di sana)
sampai skemanya menyusul di iterasi berikutnya.
