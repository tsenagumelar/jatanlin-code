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

**Response**

```json
{
  "success": true,
  "data": {
    "rowCount": 14,
    "rows": [
      { "violation_code": "HB", "violation_name": "Menggunakan HP Dalam Berkendara" },
      { "violation_code": "DB", "violation_name": "Pelanggaran Dilarang Berhenti" },
      { "violation_code": "CL", "violation_name": "Pelanggaran Cross Lane" },
      { "violation_code": "PL", "violation_name": "Pelanggaran Penumpang Lebih" },
      { "violation_code": "GG", "violation_name": "Pelanggaran Ganjil Genap" },
      { "violation_code": "JB", "violation_name": "Terobos Jalur Busway" },
      { "violation_code": "JE", "violation_name": "Terobos Jalur Emergency" },
      { "violation_code": "PS", "violation_name": "Tidak Menggunakan Seatbelt" },
      { "violation_code": "LM", "violation_name": "Menerobos Lampu Merah" },
      { "violation_code": "PO", "violation_name": "Melanggar Batas Kecepatan" },
      { "violation_code": "PH", "violation_name": "Tidak Menggunakan Helm" },
      { "violation_code": "LA", "violation_name": "Lawan Arah" },
      { "violation_code": "PV", "violation_name": "Pelanggaran Verboden" },
      { "violation_code": "PU", "violation_name": "Pelanggaran U-Turn" }
    ]
  }
}
```

> **Penting:** kode pelanggaran yang dipakai Jatanlin adalah **`TM` — "Pelanggaran Muatan Lebih"**. Kode ini **belum muncul** di response `master/list` di atas (dokumentasi API ETLE belum diperbarui), namun tetap dikirim pada field `violationCode`. Nilainya dapat diubah lewat `ETLE_VIOLATION_CODE` dan `ETLE_VIOLATION_NAME`.

---

## Implementasi di Jatanlin

### Alur

1. Operator menekan **Verifikasi** di halaman verifikasi ([apps/web/src/modules/jatanlin/verify/index.tsx](../apps/web/src/modules/jatanlin/verify/index.tsx)).
2. Hasil verifikasi disimpan ke `transact_vehicle_status`, termasuk kolom baru `is_violation` dan `overload_percentage`.
3. Halaman memanggil `POST /api/etle/publish` dengan `statusId`.
4. Route handler ([apps/web/app/api/etle/publish/route.ts](../apps/web/app/api/etle/publish/route.ts)) menjalankan, berurutan:
   - **Kirim ke ETLE** — hanya bila `is_violation = true`, status `verified`, dan `ETLE_ENABLED=true`.
   - **Push ke Data Center** — mirror `transact_vehicle_actual` + `transact_vehicle_status` ke `POST /api/sync/mirror/batch`, sehingga baris yang baru diverifikasi tidak perlu menunggu interval sync-agent (30 detik).
   - **Simpan response code** ke baris status: `etle_status_code`, `etle_message`, `etle_sent_at`, `dc_sync_status_code`, `dc_sync_message`, `dc_synced_at`.
5. Kegagalan ETLE/sync **tidak membatalkan** verifikasi yang sudah tersimpan — operator hanya menerima toast peringatan, dan penyebabnya tercatat di kolom `*_message`.

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

URL gambar dibangun dari layout objek yang ditulis sync-agent ke bucket Data Center:

```
{site_code}/{source_table}/{source_id}/{attachment_type}/{file_name}
```

Bila gambar dipublikasikan di tempat lain, isi `ETLE_PUBLIC_IMAGE_BASE_URL` untuk menimpa base URL tersebut.

> Gambar baru bisa diakses ETLE setelah sync attachment selesai. Bila verifikasi terjadi sebelum attachment ter-upload, URL sudah terbentuk tetapi objeknya menyusul pada siklus sync berikutnya.

### Konfigurasi

Isi nilai asli hanya di `.env` dan `apps/web/.env` (keduanya gitignored) — **jangan** di `.env.example`.

| Env | Keterangan |
|-----|------------|
| `ETLE_ENABLED` | `true` untuk mengaktifkan pengiriman ke ETLE |
| `ETLE_BASE_URL` | Default `https://api-etle.polri.go.id` |
| `ETLE_USER_TOKEN` / `ETLE_PASS_TOKEN` / `ETLE_CLIENT_SECRET` | Kredensial dari tim ETLE |
| `ETLE_CLIENT_ID` | Default `integrasi` |
| `ETLE_VIOLATION_CODE` / `ETLE_VIOLATION_NAME` | Default `TM` / `Pelanggaran Muatan Lebih` |
| `ETLE_TIMEOUT_MS` | Timeout request, default 20000 |
| `ETLE_PUBLIC_IMAGE_BASE_URL` | Opsional, override base URL gambar |
| `ETLE_DEVICE_NAME`, `ETLE_LOCATION_NAME`, `ETLE_LAT`, `ETLE_LON`, `ETLE_NRP`, `ETLE_SATWIL`, … | Master kamera, dikelola lewat `site.json` + `make site-apply` |
| `HASURA_URL` / `HASURA_ADMIN_SECRET` | Akses Hasura dari route handler (kosong = pakai `NEXT_PUBLIC_*`) |

### Migrasi database

Kolom baru ditambahkan oleh:

- [infra/database/007_add_verification_violation_etle_fields.sql](../infra/database/007_add_verification_violation_etle_fields.sql) — sisi site
- [data-center/infra/database/003_add_vehicle_status_violation_fields.sql](../data-center/infra/database/003_add_vehicle_status_violation_fields.sql) — sisi Data Center

Jalankan `make infra-migrate` (site) dan `data-center/scripts/db-migrate.sh` (Data Center), lalu **reload metadata Hasura** agar kolom baru muncul di GraphQL.
