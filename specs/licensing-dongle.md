# Dongle/USB Licensing Specification

## Tujuan

Menambahkan mekanisme lisensi berbasis dongle USB sebagai syarat akses aplikasi Jatanlin pada mode on-premise tanpa internet, dengan kemampuan sinkronisasi status lisensi ke vendor saat internet tersedia.

## Ruang Lingkup

- Berlaku untuk komponen:
  - `jatanlin-web-apps`
  - `jatanlin-backend-services`
  - `jatanlin-wb-agent`
- Berlaku untuk deployment on-premise dengan kondisi:
  - offline penuh
  - online sesekali/intermittent
- Tidak mencakup billing system detail (invoice/payment gateway), tetapi mencakup interface status pembayaran untuk lock/unlock lisensi.

## Prinsip Desain

- Offline-first: aplikasi tetap dapat memvalidasi lisensi tanpa internet.
- Hardware-rooted: lisensi terikat ke dongle fisik, bukan hanya file software.
- Signed-license: semua data lisensi diverifikasi dengan tanda tangan digital vendor.
- Graceful enforcement: ada mode `LOCKED`, `GRACE_PERIOD`, dan `ACTIVE`.
- Auditability: semua keputusan lisensi dapat diaudit dari log dan event.

## Definisi Status Lisensi

- `ACTIVE`: lisensi valid, aplikasi berjalan normal.
- `GRACE_PERIOD`: lisensi melewati batas check-in online, namun masih diizinkan sementara.
- `EXPIRED`: lisensi melewati tanggal berakhir; aplikasi terkunci.
- `REVOKED`: lisensi dicabut vendor; aplikasi terkunci.
- `DONGLE_MISMATCH`: lisensi tidak cocok dengan dongle terpasang; aplikasi terkunci.
- `NO_DONGLE`: dongle tidak terdeteksi; aplikasi terkunci.
- `INVALID_SIGNATURE`: file lisensi/CRL tidak valid; aplikasi terkunci.

## Komponen Arsitektur

1. License Authority (Vendor Side)
- Men-generate pasangan kunci signing vendor (`vendor_private_key`, `vendor_public_key`).
- Menerbitkan file lisensi signed per customer/site.
- Menerbitkan revocation list (CRL) signed.

2. License Runtime (On-Prem)
- Service lokal untuk:
  - deteksi dongle
  - challenge-response ke dongle
  - verifikasi signature lisensi
  - evaluasi policy lock/unlock
  - expose status lisensi via local API

3. Application Enforcers
- Backend API gate.
- WB Agent gate.
- Web UI gate.

4. Sync Reporter (Optional saat internet tersedia)
- Mengirim heartbeat status lisensi ke endpoint vendor.
- Mengambil update CRL terbaru.

## Kebutuhan Hardware

## 1) Dongle USB

- Tipe: secure USB dongle/hardware token yang mendukung challenge-response kriptografi.
- Minimum capability:
  - menyimpan secret/private key di secure element
  - operasi sign/HMAC tanpa expose secret
  - identifier unik perangkat (dongle_id)
- Rekomendasi:
  - dukungan driver Linux/Windows sesuai environment deployment
  - SDK stabil untuk .NET dan Go (atau akses via local daemon tunggal)

## 2) Host On-Prem

- Port USB fisik dedicated untuk dongle lisensi.
- UPS direkomendasikan agar mengurangi false lock karena restart listrik.

## 3) Opsional Redundansi

- 1 dongle utama + 1 dongle cadangan per site (dengan policy transfer resmi vendor).

## Kebutuhan Software

## 1) Vendor Signing Tools

- CLI internal untuk:
  - generate lisensi signed
  - rotate key
  - generate CRL signed

## 2) License Runtime Service

- Disarankan service terpisah `jatanlin-license-runtime` (local only).
- Menyediakan endpoint lokal (localhost/private network), contoh:
  - `GET /license/status`
  - `POST /license/challenge`
  - `POST /license/reload`
  - `GET /license/audit`

## 3) Integrasi ke Aplikasi

- `jatanlin-backend-services`:
  - middleware validasi status lisensi untuk endpoint operasional.
- `jatanlin-wb-agent`:
  - block capture/insert saat status lock.
- `jatanlin-web-apps`:
  - menampilkan status lisensi
  - redirect ke halaman lock jika status tidak aktif.

## 4) Kriptografi

- Signature lisensi: Ed25519 (disarankan) atau RSA-2048 minimal.
- Hash: SHA-256.
- Semua kunci publik vendor di-embed read-only di aplikasi.

## Format License File

Contoh `license.jlic` (payload JSON + signature detached atau envelope):

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
  "max_users": 100,
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
  "signature": "<base64-signature-by-vendor-private-key>"
}
```

## Format Revocation List (CRL)

Contoh `revocations.jcrl`:

```json
{
  "crl_version": 3,
  "issued_at": "2026-05-09T10:00:00Z",
  "revoked_license_ids": [
    "LIC-2026-000123"
  ],
  "reason": "PAYMENT_DEFAULT",
  "signature": "<base64-signature-by-vendor-private-key>"
}
```

## Alur Validasi Lisensi

1. Runtime load `license.jlic` dari storage lokal.
2. Verifikasi signature lisensi dengan `vendor_public_key`.
3. Cek `not_before` dan `expires_at`.
4. Deteksi dongle dan baca `dongle_id`.
5. Pastikan `dongle_id` termasuk di `bound_dongle_ids`.
6. Lakukan challenge-response kriptografi ke dongle.
7. Evaluasi revocation dari CRL lokal.
8. Hitung policy check-in:
  - jika melewati `checkin_interval_hours` namun belum melewati grace, status `GRACE_PERIOD`
  - jika melewati grace, status `EXPIRED` atau `REVOKED` sesuai kondisi
9. Publish status final ke seluruh komponen aplikasi.

## Enforcement Policy

## Rule Umum

- Jika status `ACTIVE`: semua fungsi berjalan.
- Jika status `GRACE_PERIOD`:
  - proses utama masih berjalan
  - tampilkan warning dan countdown.
- Jika status `LOCKED` (`EXPIRED`, `REVOKED`, `NO_DONGLE`, `DONGLE_MISMATCH`, `INVALID_SIGNATURE`):
  - block login baru
  - block action write/capture
  - izinkan read-only page terbatas untuk export audit (opsional by policy).

## Rule per Komponen

1. Web Apps
- Route private wajib cek status lisensi dari backend/runtime.
- Halaman lock menampilkan:
  - alasan lock
  - `license_id`
  - waktu evaluasi terakhir
  - instruksi kontak vendor.

2. Backend Services
- Middleware global untuk endpoint mutate/operasional.
- Endpoint health tetap bisa diakses internal untuk observability.
- Saat lock, response code disarankan `423 Locked`.

3. WB Agent
- Saat lock, endpoint capture mengembalikan gagal terstruktur.
- Listener session tidak menjalankan command ke WServer jika lock.

## Online Sync Saat Internet Tersedia

- Interval heartbeat default: setiap 6 jam.
- Data minimum yang dikirim:
  - `license_id`
  - `site_id`
  - timestamp UTC
  - status (`ACTIVE/GRACE/LOCKED`)
  - hash fingerprint host (non-PII).
- Endpoint vendor mengembalikan:
  - status payment/revocation
  - CRL terbaru (jika ada)
  - update policy optional.

Jika internet tidak tersedia:
- system tetap jalan dengan policy offline.
- event sync failure dicatat lokal.

## Kebutuhan Proses Operasional

## 1) Provisioning Awal

1. Vendor menyiapkan dongle dan mencatat `dongle_id`.
2. Vendor menerbitkan lisensi signed terikat `site_id` + `dongle_id`.
3. Tim deployment memasang runtime service + file lisensi di server on-prem.
4. UAT: cabut/pasang dongle, simulasi offline, simulasi expiry.

## 2) Renewal

1. Vendor menerbitkan file lisensi baru sebelum expiry.
2. Site import lisensi baru via UI admin/CLI lokal.
3. Runtime reload dan audit event `LICENSE_RENEWED`.

## 3) Revocation / Lock

Mode online:
1. Vendor menandai lisensi `REVOKED`.
2. Saat check-in berikutnya, runtime menerima CRL dan lock.

Mode offline:
1. Vendor mengirim paket CRL signed melalui channel resmi.
2. Site import CRL manual.
3. Runtime lock sesuai isi CRL.

## 4) Recovery Dongle Rusak/Hilang

1. License lama direvoke.
2. Dongle pengganti diterbitkan dengan license rebind.
3. Site melakukan aktivasi ulang dan verifikasi audit.

## Non-Functional Requirements

- Availability lokal validasi lisensi: 99.9% pada host on-prem.
- Waktu validasi startup: maksimal 2 detik (tanpa internet).
- Waktu re-check runtime: setiap 60 detik (configurable).
- Semua keputusan lock/unlock tercatat dengan timestamp UTC.
- Tidak ada secret dongle/private key vendor yang tersimpan plaintext di repo.

## Security Requirements

- Private key vendor hanya di environment vendor (HSM/secure vault direkomendasikan).
- Anti-tamper minimum:
  - signature verification di lebih dari satu titik runtime
  - integrity check binary saat startup (opsional tahap 2)
  - obfuscation untuk komponen client (opsional tahap 2)
- Semua file lisensi/CRL ditolak jika signature invalid.
- Clock tampering mitigation:
  - simpan `last_seen_utc` monotonik lokal
  - jika waktu sistem mundur signifikan, masuk mode warning/lock by policy.

## Logging dan Audit

Event wajib:
- `LICENSE_VALIDATED`
- `LICENSE_STATUS_CHANGED`
- `DONGLE_CONNECTED`
- `DONGLE_REMOVED`
- `CHECKIN_SUCCESS`
- `CHECKIN_FAILED`
- `CRL_IMPORTED`
- `LICENSE_LOCKED`
- `LICENSE_UNLOCKED`

Setiap event minimum berisi:
- timestamp UTC
- hostname/site_id
- license_id
- status sebelumnya dan status baru (jika ada perubahan)
- reason code.

## Config Variables (Draft)

- `LICENSE_RUNTIME_ENABLED=true`
- `LICENSE_FILE_PATH=/etc/jatanlin/license.jlic`
- `LICENSE_CRL_PATH=/etc/jatanlin/revocations.jcrl`
- `LICENSE_RECHECK_SECONDS=60`
- `LICENSE_HEARTBEAT_ENABLED=true`
- `LICENSE_HEARTBEAT_URL=https://license.vendor.tld/api/checkin`
- `LICENSE_HEARTBEAT_INTERVAL_HOURS=6`
- `LICENSE_FAIL_OPEN=false`
- `LICENSE_GRACE_OVERRIDE_HOURS=` (optional, emergency only)

## Dampak ke Arsitektur Existing

- Tambah service baru: `jatanlin-license-runtime` (direkomendasikan).
- `jatanlin-backend-services` dan `jatanlin-wb-agent` menjadi enforcement point utama.
- `jatanlin-web-apps` menjadi presentation layer untuk status lisensi dan halaman lock.
- Deployment perlu SOP baru untuk lifecycle dongle + license file.

## Fase Implementasi

## Phase 1 (MVP)

- Validasi offline dongle + signature lisensi.
- Enforcement lock dasar di backend + wb-agent + web login gate.
- Audit log lokal.

## Phase 2

- Heartbeat online + auto fetch CRL.
- Admin UI import license/CRL.
- Monitoring dashboard status lisensi per site.

## Phase 3

- Hardening anti-tamper lanjutan.
- Redundant dongle policy.
- Integrasi billing workflow otomatis.

## Acceptance Criteria

1. Tanpa dongle, aplikasi tidak bisa menjalankan operasi write/capture.
2. Dengan dongle valid + lisensi aktif, aplikasi berjalan normal tanpa internet.
3. Saat lisensi expired/revoked, aplikasi masuk mode lock sesuai policy.
4. Saat internet tersedia, heartbeat check-in terkirim dan tercatat.
5. Import CRL offline yang valid harus dapat memaksa lock tanpa internet.
6. Semua transisi status lisensi tercatat di audit log.

## Sample PoC: YubiKey 5C NFC

## Tujuan PoC

Memvalidasi bahwa arsitektur license gate dapat berjalan end-to-end sebelum pembelian batch dongle.

## Scope PoC (Tahap Menunggu Dongle)

- Implementasi gate status lisensi mode mock di:
  - backend API
  - WB agent
- Endpoint status lisensi lokal tersedia untuk integrasi web:
  - `GET /api/license/status` (backend)
  - `GET /license/status` (wb-agent)
- Simulasi lock menggunakan env/config status:
  - `ACTIVE`
  - `GRACE_PERIOD`
  - `EXPIRED`
  - `REVOKED`
  - `NO_DONGLE`

## Scope PoC (Saat Dongle Sudah Datang)

1. Setup YubiKey mode smart card (PIV/CCID) pada host target.
2. Generate challenge dari runtime, minta signature dari YubiKey.
3. Verifikasi signature di runtime.
4. Mapping `device identity` ke `bound_dongle_ids` lisensi.
5. Uji cabut-pasang dongle saat runtime:
  - operasi write/capture harus lock saat dongle hilang
  - operasi kembali aktif saat dongle valid kembali

## Skenario Uji Minimum

1. `LICENSE_STATUS=ACTIVE`: login + capture WB + upload attachment harus berhasil.
2. `LICENSE_STATUS=REVOKED`: endpoint write mengembalikan `423 Locked`.
3. Mode offline (tanpa internet) dengan status valid tetap berjalan.
4. Restart service tidak mengubah keputusan lock jika status tetap sama.

## Kriteria Lulus PoC

1. Gate lisensi konsisten di backend dan wb-agent.
2. Tidak ada bypass write endpoint saat status lock.
3. Endpoint status lisensi dapat dibaca web untuk menampilkan alasan lock.
4. Setelah integrasi dongle asli, challenge-signature berhasil diverifikasi dari service lokal.
