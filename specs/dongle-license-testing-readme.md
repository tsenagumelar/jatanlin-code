# Dongle License Testing README

Dokumen ini menjelaskan:

1. Data apa yang harus diprogram ke USB dongle.
2. Bentuk file lisensi yang harus disiapkan.
3. Command untuk test enforcement lisensi pada implementasi saat ini (`MOCK`).
4. Prosedur test saat integrasi dongle fisik sudah aktif.

## A. Status Implementasi Saat Ini

- `jatanlin-backend-services` dan `jatanlin-wb-agent` saat ini masih membaca status lisensi dari config (`MOCK`), bukan dari USB dongle langsung.
- Karena itu, test yang sudah bisa dijalankan sekarang adalah test lock/unlock gate aplikasi.
- Setelah adapter dongle runtime dibuat, skenario fisik (cabut/pasang/mismatch dongle) bisa dijalankan penuh.

Referensi kode:

- `jatanlin-backend-services/internal/license/service.go`
- `jatanlin-backend-services/internal/api/server.go`
- `jatanlin-wb-agent/Services/LicenseStateService.cs`
- `jatanlin-wb-agent/Program.cs`

## B. Data yang Harus Diset ke USB Dongle

Minimal isi/properti yang wajib ada di dongle:

1. `dongle_id` unik
- Contoh format: `DGL-8F13A2C9`
- Harus stabil (tidak berubah tiap colok).
- Harus bisa dibaca runtime aplikasi.

2. Secret kriptografi di secure element
- Opsi A: private key (untuk `sign(challenge)`).
- Opsi B: HMAC key (untuk `hmac(challenge)`).
- Secret tidak boleh bisa diexport ke host.

3. Fungsi challenge-response
- Input: random challenge (32 byte, misalnya).
- Output: signature/HMAC dari challenge.
- Digunakan untuk membuktikan dongle asli hadir.

Opsional disarankan:

- serial number hardware
- vendor certificate/public metadata
- label site (`SITE_CODE`) jika vendor SDK mendukung

Yang tidak disimpan di dongle:

- file lisensi `license.jlic`
- file revocation `revocations.jcrl`
- private key vendor signing lisensi

## C. Bentuk File Lisensi yang Harus Disiapkan

Contoh payload (mengikuti spec `licensing-dongle.md`):

```json
{
  "license_id": "LIC-2026-000123",
  "customer_id": "CUST-PT-ABC",
  "site_id": "SITE-JKT-01",
  "product": "JATANLIN_SUITE",
  "edition": "ONPREM",
  "features": [
    "WEB_DASHBOARD",
    "WB_AGENT",
    "ANPR_AXLE_PIPELINE"
  ],
  "issued_at": "2026-05-09T00:00:00Z",
  "not_before": "2026-05-09T00:00:00Z",
  "expires_at": "2027-05-08T23:59:59Z",
  "checkin_interval_hours": 168,
  "grace_period_hours": 336,
  "bound_dongle_ids": [
    "DGL-8F13A2C9"
  ],
  "offline_policy": {
    "allow_offline": true,
    "require_dongle_presence": true
  },
  "signature": "<signature-by-vendor-private-key>"
}
```

Catatan:

- `bound_dongle_ids` harus berisi `dongle_id` yang benar-benar diprogram ke dongle.
- Jika ID tidak cocok, status wajib `DONGLE_MISMATCH`.

## D. Test yang Bisa Dijalankan Sekarang (Mode MOCK)

## D.1 Backend Services

Masuk folder backend:

```bash
cd jatanlin-backend-services
```

Set lisensi `ACTIVE`:

```bash
export LICENSE_RUNTIME_ENABLED=true
export LICENSE_MOCK_STATUS=ACTIVE
```

Jalankan API:

```bash
go run cmd/api/main.go
```

Cek status:

```bash
curl -i http://localhost:4000/api/license/status
```

Expected:

- HTTP `200`
- `mode: "MOCK"`
- `status: "ACTIVE"`
- `is_allowed: true`

Test endpoint write (contoh login):

```bash
curl -i -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Expected:

- Tidak ditolak oleh license guard (bukan `423`).

Uji kondisi lock:

```bash
export LICENSE_MOCK_STATUS=NO_DONGLE
go run cmd/api/main.go
```

Ulangi request write yang sama.

Expected lock:

- HTTP `423 Locked`
- Body mengandung:
  - `message: "license is locked"`
  - payload status lisensi

## D.2 WB Agent

Edit `jatanlin-wb-agent/appsettings.json`:

```json
"License": {
  "Enabled": true,
  "MockStatus": "ACTIVE"
}
```

Jalankan WB agent:

```bash
cd jatanlin-wb-agent
dotnet run --project WServerApi.csproj
```

Cek status:

```bash
curl -i http://localhost:5000/license/status
```

Expected:

- HTTP `200`
- `mode: "MOCK"`
- `status: "ACTIVE"`
- `is_allowed: true`

Ubah ke lock:

```json
"License": {
  "Enabled": true,
  "MockStatus": "NO_DONGLE"
}
```

Restart service, lalu test endpoint write/capture (contoh):

```bash
curl -i -X POST "http://localhost:5000/ws/wim/capture?direction=RIGHT&timeoutSeconds=45"
```

Expected:

- HTTP `423 Locked`
- Endpoint write/capture diblokir oleh middleware lisensi.

## D.3 Matrix Status yang Wajib Diuji

Jalankan ulang test untuk semua status:

- `ACTIVE` -> allowed
- `GRACE_PERIOD` -> allowed
- `EXPIRED` -> locked (`423`)
- `REVOKED` -> locked (`423`)
- `NO_DONGLE` -> locked (`423`)
- `DONGLE_MISMATCH` -> locked (`423`)
- `INVALID_SIGNATURE` -> locked (`423`)

## E. Test Saat Dongle Fisik Sudah Terintegrasi

Bagian ini dijalankan setelah runtime benar-benar membaca dongle.

## E.1 Checklist Pra-UAT

1. Dongle terdeteksi OS (`lsusb` di Linux, Device Manager di Windows).
2. `dongle_id` bisa dibaca dari SDK/daemon.
3. `license.jlic` berisi `bound_dongle_ids` yang sesuai.
4. Service runtime lisensi aktif.
5. Endpoint `/license/status` menampilkan mode non-mock (misalnya `RUNTIME`/`HARDWARE` sesuai implementasi).

## E.2 Skenario UAT

1. Dongle valid terpasang
- Expected: status `ACTIVE`, write/capture sukses.

2. Dongle dicabut saat service hidup
- Expected: status transisi ke `NO_DONGLE`.
- Endpoint write/capture langsung `423`.

3. Dongle berbeda ID dipasang
- Expected: status `DONGLE_MISMATCH`.
- Tetap `423`.

4. Dongle valid dipasang kembali
- Expected: status kembali `ACTIVE`.
- Write/capture kembali normal.

5. Simulasi lisensi revoke/expired
- Expected:
  - `REVOKED` -> `423`
  - `EXPIRED` -> `423`

## E.3 Contoh Command Verifikasi Cepat (Setelah Integrasi Fisik)

Status polling:

```bash
watch -n 1 "curl -s http://localhost:4000/api/license/status"
```

Atau jika `watch` tidak tersedia:

```bash
while true; do
  date
  curl -s http://localhost:4000/api/license/status
  echo
  sleep 1
done
```

Saat polling berjalan, lakukan cabut/pasang dongle dan lihat perubahan `status` realtime.

## F. Troubleshooting

- `mode` tetap `MOCK`:
  - integrasi dongle belum aktif, atau masih pakai service mock.
- Status tidak berubah setelah edit env/config:
  - restart proses service.
- Semua write gagal `423`:
  - cek `LICENSE_RUNTIME_ENABLED`, `LICENSE_MOCK_STATUS`, atau mapping `bound_dongle_ids`.
- Port konflik:
  - backend default `4000`
  - wb-agent default `5000`

## G. Skenario Khusus: Hanya Punya USB Biasa (Kosong)

Bagian ini untuk kondisi belum punya secure dongle, hanya flashdisk/USB biasa agar flow lisensi bisa jalan dulu (PoC).

Penting:

- Ini hanya untuk development/UAT internal.
- Tidak aman untuk production karena USB biasa bisa diclone.

## G.1 Konsep Sederhana

USB biasa dipakai sebagai identitas sementara:

1. Ambil ID USB (serial device atau UUID partisi).
2. Jadikan ID itu sebagai `dongle_id` sementara.
3. Cocokkan dengan `bound_dongle_ids` di lisensi.
4. Jika cocok -> `ACTIVE`, jika tidak ada USB -> `NO_DONGLE`, jika beda -> `DONGLE_MISMATCH`.

## G.2 Step-by-Step (Awam)

1. Colok USB kosong ke komputer/server.
2. Ambil ID USB.
3. Catat ID tersebut sebagai `dongle_id` sementara.
4. Masukkan ID itu ke `bound_dongle_ids` file lisensi.
5. Jalankan aplikasi dan cek status lisensi.
6. Cabut USB untuk memastikan status berubah ke `NO_DONGLE`.

## G.3 Command Ambil ID USB di Linux

Lihat daftar block device:

```bash
lsblk -o NAME,SIZE,FSTYPE,LABEL,UUID,MOUNTPOINT
```

Ambil serial device (ganti `/dev/sdb` sesuai device USB Anda):

```bash
udevadm info --query=all --name=/dev/sdb | grep -E "ID_SERIAL=|ID_SERIAL_SHORT="
```

Jika serial tidak ada, pakai UUID partisi sebagai fallback:

```bash
blkid /dev/sdb1
```

Contoh nilai yang dipakai sebagai `dongle_id` sementara:

- `USB_SERIAL:SanDisk_Ultra_4C530001230101117223`
- atau `USB_UUID:3E7A-1C2D`

## G.4 Contoh Binding di License File

Masukkan ID USB sementara ke lisensi:

```json
{
  "bound_dongle_ids": [
    "USB_SERIAL:SanDisk_Ultra_4C530001230101117223"
  ]
}
```

## G.5 Cara Test Manual di Implementasi Saat Ini (MOCK)

Karena runtime saat ini masih mock, simulasi status dilakukan manual:

- USB dianggap terpasang/valid:
  - `LICENSE_MOCK_STATUS=ACTIVE`
- USB dicabut:
  - `LICENSE_MOCK_STATUS=NO_DONGLE`
- USB lain (ID beda):
  - `LICENSE_MOCK_STATUS=DONGLE_MISMATCH`

Command backend:

```bash
cd jatanlin-backend-services
export LICENSE_RUNTIME_ENABLED=true
export LICENSE_MOCK_STATUS=ACTIVE
go run cmd/api/main.go
```

Cek status:

```bash
curl -i http://localhost:4000/api/license/status
```

Ubah simulasi ke USB dicabut:

```bash
export LICENSE_MOCK_STATUS=NO_DONGLE
go run cmd/api/main.go
```

Test endpoint write:

```bash
curl -i -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Expected:

- `ACTIVE` -> request write tidak diblokir license guard.
- `NO_DONGLE`/`DONGLE_MISMATCH` -> HTTP `423 Locked`.

## G.6 Rekomendasi Lanjutan

Setelah PoC USB biasa berhasil:

1. Buat adapter runtime baca ID USB otomatis (tanpa set manual env).
2. Migrasi ke secure USB dongle (challenge-response kriptografi).
