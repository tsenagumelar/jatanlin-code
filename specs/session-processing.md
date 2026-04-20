# Session Processing Model

## Tujuan

Session processing adalah kontrak lintas area untuk menghubungkan data ANPR, weighing/WB, AXLE, dimension, dan CCTV ke satu proses kendaraan. Model target harus paralel dan toleran terhadap data parsial, supaya kegagalan satu sensor tidak menghentikan capture sensor lain.

## Validasi dari Code Saat Ini

- Web membuat dan mengubah `transact_wim_session` melalui Hasura GraphQL.
- Frontend membaca data operasional melalui query/subscription Hasura.
- Backend Go membaca session aktif dari PostgreSQL lewat `SessionService.GetActiveSession()` dengan filter `status = 'IN_PROGRESS'`.
- Backend service saat ini bukan subscriber Hasura langsung; Hasura menjadi layer GraphQL ke PostgreSQL, sedangkan watcher/service mengecek state session dari database.
- Flow lama masih ANPR-driven: ANPR watcher dapat trigger WB agent dan CCTV setelah file ANPR valid masuk dalam window session.
- ANPR insert sudah membawa `session_id` saat ada session aktif.
- CCTV dapat menerima dan menyimpan `session_id` jika trigger mengirimkannya.
- WB agent saat ini belum menerima/menyimpan `session_id` dari endpoint capture; insert `transact_weighing.session_id` masih `NULL`.
- AXLE watcher saat ini memakai active session untuk filter window, tetapi payload/insert AXLE belum konsisten menyimpan `session_id`.
- Dimension processing saat ini masih bergantung pada ANPR image/external ID untuk insert `transact_dimension`, sehingga masih ter-couple ke keberhasilan ANPR.

## Masalah Flow Lama

Flow sequence lama adalah:

```text
Web creates IN_PROGRESS session
  -> ANPR captured
  -> WB weighing triggered
  -> AXLE processed
  -> Dimension calculated
  -> CCTV captured
  -> Vehicle actual/verification
```

Kelemahan utama flow ini: jika ANPR tidak tercapture oleh sensor, proses downstream dapat ikut tidak tercapture. Padahal secara domain, data weighing, AXLE, dimension, atau CCTV masih valid untuk disimpan walaupun plat nomor gagal dibaca.

## Target Flow Paralel

Flow target adalah session-driven parallel capture:

```text
Web creates IN_PROGRESS session via Hasura/PostgreSQL
  -> ANPR watcher processes ANPR independently
  -> WB agent captures weighing independently
  -> AXLE watcher processes AXLE independently
  -> Dimension processor processes available dimension source independently
  -> CCTV recorder captures independently
  -> Web verification composes available data by session_id
```

## Rules Target

- `transact_wim_session.id` adalah correlation key utama untuk seluruh capture dalam satu proses kendaraan.
- Semua data capture yang terjadi saat session aktif harus menyimpan `session_id` jika schema table mendukungnya.
- Jika satu source tidak mendeteksi data sampai timeout/window selesai, service/orchestrator tetap harus membuat placeholder row di table source tersebut.
- Placeholder row minimal berisi `id` dan `session_id`; field source seperti plate, weight, axle count, filepath, MinIO object, dan confidence boleh `NULL`.
- Placeholder row harus memakai `NULL` untuk field kosong, bukan empty string, terutama pada field unik seperti `external_id`.
- Tidak boleh ada sumber data yang menjadi gate wajib untuk sumber data lain. ANPR gagal tidak boleh menghentikan weighing, AXLE, dimension, atau CCTV.
- Capture parsial adalah kondisi valid. Satu session boleh hanya memiliki sebagian dari ANPR, weighing, AXLE, dimension, atau CCTV.
- Correlation data harus memakai `session_id` lebih dulu, lalu fallback window waktu hanya untuk discovery atau legacy compatibility.
- Setiap source harus idempotent berdasarkan key stabil: `session_id + external_id`, `session_id + device record id`, atau key source lain yang tidak berubah.
- Placeholder insert harus idempotent per `session_id + source`, sehingga retry timeout tidak membuat lebih dari satu placeholder untuk source yang sama dalam satu session.
- Service harus memakai timeout agar session tidak menggantung karena sensor/device tidak merespons.
- Missing data harus dicatat sebagai status/verifikasi, bukan dianggap kegagalan seluruh proses.
- UI verifikasi harus bisa melakukan adjustment manual untuk data yang missing, timeout, invalid, atau tidak cocok.
- `transact_vehicle_actual` harus bisa dibuat/diupdate dari data yang tersedia, tidak boleh mengharuskan ANPR sebagai parent tunggal jika flow paralel diterapkan.

## Source Responsibility

| Source | Target responsibility | Tidak boleh |
| --- | --- | --- |
| Web | Create/start/complete session, monitor semua source, compose verification | Menunggu ANPR sebelum mulai membaca source lain |
| ANPR watcher | Simpan plate/image jika tersedia dan link ke `session_id` | Trigger wajib untuk WB/CCTV |
| WB agent | Capture weighing dan insert `transact_weighing.session_id` | Bergantung pada ANPR capture |
| AXLE watcher | Capture AXLE dalam session window dan insert `session_id` | Hanya menyimpan data tanpa session pada flow session aktif |
| Dimension processor | Hitung dimension dari source yang tersedia dan link ke session | Wajib bergantung pada ANPR jika source lain tersedia |
| CCTV recorder | Record video/image session dengan `session_id` | Hanya aktif setelah ANPR sukses |

## Session Lifecycle

- Web membuat row `transact_wim_session` via Hasura dengan status awal yang disepakati, lalu mengubahnya menjadi `IN_PROGRESS` untuk memulai capture.
- Status `IN_PROGRESS` adalah sinyal aktif bagi service/watcher untuk memproses data session.
- Masing-masing service boleh memulai capture lewat polling DB active session, trigger explicit dari web/backend, atau mekanisme event DB, tetapi source of truth tetap row session di PostgreSQL.
- Session selesai saat web/operator mengubah status menjadi completed/cancelled/timeout sesuai schema yang tersedia.
- Setelah session selesai, service tidak boleh menulis capture baru ke session tersebut kecuali ada mekanisme late-arrival yang eksplisit dan audit trail jelas.

## Capture State

Status konseptual per source:

- `PENDING`: session aktif, source belum menghasilkan data.
- `CAPTURED`: source menghasilkan data dan tersimpan dengan `session_id`.
- `MISSING`: source tidak menghasilkan data sampai timeout/window selesai; tetap harus ada placeholder row `id + session_id`.
- `TIMEOUT`: service/device tidak merespons dalam batas waktu.
- `INVALID`: data masuk tetapi tidak valid atau confidence rendah.
- `MANUAL_ADJUSTED`: operator mengubah atau mengisi data saat verifikasi.
- `VERIFIED`: data diterima untuk hasil akhir.

Jika schema belum memiliki kolom status per source, status ini tetap menjadi kontrak UI/service dan harus dipetakan ke table/status yang tersedia saat implementasi.

## Gap Implementasi yang Harus Ditutup

- Schema capture harus nullable untuk semua field non-esensial supaya placeholder row bisa dibuat.
- Migration `20250104_nullable_session_placeholders.sql` menjadi baseline untuk kontrak placeholder row.
- Endpoint WB capture perlu menerima `session_id`/`sessionId` dan meneruskannya ke model `Vehicle`.
- `WeighingInsertService` perlu mengisi `transact_weighing.session_id` dari active session/request.
- AXLE queue payload dan insert perlu membawa `session_id` saat session aktif.
- Dimension insert perlu mendukung `session_id` dan tidak hanya bergantung pada ANPR ID untuk flow paralel.
- Trigger CCTV perlu berasal dari session start atau orchestration paralel, bukan hanya dari ANPR handler.
- Web processing state perlu menampilkan semua source secara independen dan tidak menganggap ANPR sebagai syarat lanjut.
