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
- WB agent jalur session-aware saat ini sudah menyimpan `transact_weighing.session_id` dan update row existing berdasarkan `session_id`.
- ANPR watcher saat ini sudah memakai ownership row per `session_id` untuk jalur insert session-aware, dengan rule pemilihan payload terbaik berbasis confidence lalu kelengkapan data.
- AXLE watcher saat ini sudah membawa `session_id` di queue payload dan jalur insert session-aware juga sudah memakai ownership row per `session_id`, dengan rule pemilihan payload berbasis validitas axle, kelengkapan data, dan recency.
- Dimension processing saat ini masih bergantung pada ANPR image/external ID untuk insert `transact_dimension`, sehingga masih ter-couple ke keberhasilan ANPR.
- ANPR dan AXLE watcher saat ini sama-sama memakai batas bawah waktu `frame_time >= session.started_at`; selama session masih `IN_PROGRESS`, watcher tetap dapat scan ulang source untuk menemukan data yang masuk setelah session dimulai.
- ANPR dan AXLE sudah memiliki dummy mode berbasis session aktif, dengan insert dummy idempotent menggunakan key stabil berbasis `session_id`.
- WB agent sekarang juga memiliki session listener otomatis untuk mode real maupun dummy, membaca `transact_wim_session` langsung dari PostgreSQL pada site yang sama.
- CCTV streamer sekarang juga memiliki session listener otomatis untuk mode real maupun dummy, membaca `transact_wim_session` langsung dari PostgreSQL pada site yang sama.

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
  -> ANPR watcher listens FTP ANPR independently during active session
  -> WB agent captures weighing independently during active session
  -> AXLE watcher listens FTP AXLE independently during active session
  -> CCTV recorder captures independently during active session
  -> Dimension processor listens ANPR data in the same session, then processes ANPR image
  -> Web verification composes available data by session_id
```

Penjelasan target:

- ANPR, WB, AXLE, dan CCTV adalah source paralel berbasis session aktif.
- Begitu session `IN_PROGRESS` terdeteksi, masing-masing service mulai listen source-nya sendiri sampai session selesai.
- Dimension adalah pengecualian yang eksplisit: dimension tidak berjalan bebas seperti source lain, tetapi menunggu data ANPR baru dengan `session_id` yang sama lalu memproses image ANPR tersebut.
- Dependency dimension ke ANPR adalah dependency source data, bukan dependency urutan proses seluruh session.
- Pada flow final yang dituju, `length` kendaraan diprioritaskan dari AXLE, sedangkan dimension dari ANPR image dipakai terutama untuk `width` dan `height`.

## Rules Target

- `transact_wim_session.id` adalah correlation key utama untuk seluruh capture dalam satu proses kendaraan.
- Semua data capture yang terjadi saat session aktif harus menyimpan `session_id` jika schema table mendukungnya.
- Untuk flow session-driven baru, tiap source hanya boleh memiliki maksimal 1 row operasional per `session_id`.
- Definisi source operasional adalah: `ANPR`, `WB`, `AXLE`, `CCTV`, dan `DIMENSION`.
- Jika source menerima data baru saat row source untuk `session_id` tersebut sudah ada, service harus meng-update row yang sama, bukan membuat row baru.
- `Mulai Ulang` saat session masih `IN_PROGRESS` tidak boleh membuat row source tambahan untuk session yang sama; aksi tersebut hanya boleh mengulang monitoring step UI dan membiarkan source melanjutkan update row existing.
- `Mulai Ulang` hanya boleh membuat session baru jika session sebelumnya sudah ditutup dengan status final seperti `COMPLETED`, `CANCELLED`, atau status akhir lain yang disepakati schema.
- Jika satu source tidak mendeteksi data sampai timeout/window selesai, service/orchestrator tetap harus membuat placeholder row di table source tersebut.
- Placeholder row minimal berisi `id` dan `session_id`; field source seperti plate, weight, axle count, filepath, MinIO object, dan confidence boleh `NULL`.
- Placeholder row harus memakai `NULL` untuk field kosong, bukan empty string, terutama pada field unik seperti `external_id`.
- Tidak boleh ada sumber data yang menjadi gate wajib untuk sumber data lain. ANPR gagal tidak boleh menghentikan weighing, AXLE, atau CCTV.
- ANPR, WB, dan AXLE harus mulai listen dari saat session menjadi `IN_PROGRESS` sampai session selesai.
- CCTV juga harus berjalan berdasarkan session aktif, bukan keberhasilan ANPR.
- Dimension harus listen terhadap data ANPR baru dalam `session_id` yang sama, lalu membuat hasil dimension dari image ANPR tersebut.
- `transact_vehicle_actual.actual_length` harus memprioritaskan hasil AXLE bila tersedia.
- `transact_vehicle_actual.actual_width` dan `transact_vehicle_actual.actual_height` diprioritaskan dari dimension ANPR image.
- Capture parsial adalah kondisi valid. Satu session boleh hanya memiliki sebagian dari ANPR, weighing, AXLE, dimension, atau CCTV.
- Correlation data harus memakai `session_id` lebih dulu, lalu fallback window waktu hanya untuk discovery atau legacy compatibility.
- Setiap source harus punya dua lapis idempotency:
  - idempotency ownership row: satu row per `session_id + source`
  - idempotency payload/device: update hanya jika payload baru memang representasi terbaru atau lebih lengkap untuk row source tersebut
- `session_id + source` adalah key bisnis utama untuk flow baru, sedangkan `external_id`, `record_id`, filename, atau device message ID menjadi key pendukung untuk dedup payload.
- Placeholder insert harus idempotent per `session_id + source`, sehingga retry timeout tidak membuat lebih dari satu placeholder untuk source yang sama dalam satu session.
- Dummy mode per source boleh dipakai untuk development/testing, tetapi tetap harus mengikuti lifecycle session aktif yang sama seperti mode real.
- Jika dummy mode suatu source aktif, source tersebut tidak boleh membaca source eksternal aslinya; data harus berasal dari generator dummy yang menulis ke table produksi yang sama.
- Dummy insert harus tetap idempotent per `session_id + source` atau key dummy stabil lain agar polling/retry tidak membuat duplicate.
- Service harus memakai timeout agar session tidak menggantung karena sensor/device tidak merespons.
- Missing data harus dicatat sebagai status/verifikasi, bukan dianggap kegagalan seluruh proses.
- UI verifikasi harus bisa melakukan adjustment manual untuk data yang missing, timeout, invalid, atau tidak cocok.
- `transact_vehicle_actual` harus bisa dibuat/diupdate dari data yang tersedia, tidak boleh mengharuskan ANPR sebagai parent tunggal jika flow paralel diterapkan.

## Mekanisme Ownership Row per Source

Flow target per source di dalam satu session:

```text
session IN_PROGRESS
  -> source mendeteksi session aktif
  -> source memastikan row untuk session_id + source sudah ada
  -> jika belum ada: insert placeholder
  -> jika data valid datang: update row existing dengan field yang tersedia
  -> jika data tambahan datang lagi: update row yang sama bila lebih baru/lebih lengkap
  -> saat timeout source tercapai tanpa data lengkap: pertahankan row existing sebagai partial/missing
  -> session completed: source berhenti menulis ke session tersebut
```

Aturan detail:

- Insert pertama untuk satu source dalam satu session harus dianggap sebagai pembuatan ownership row source tersebut.
- Ownership row boleh langsung berupa data valid jika payload pertama sudah lengkap.
- Jika payload pertama belum ada atau timeout lebih dulu, ownership row dibuat sebagai placeholder.
- Semua payload berikutnya untuk source yang sama dan `session_id` yang sama harus melakukan update ke ownership row tersebut.
- Update tidak boleh menghapus data valid lama dengan nilai `NULL` dari payload baru yang lebih kosong.
- Update boleh mengganti nilai lama jika payload baru lebih otoritatif, lebih baru, atau lebih lengkap sesuai rule source.
- Setelah session berstatus final, source tidak boleh insert row baru lagi untuk session itu.

Aturan evaluasi payload baru:

- ANPR:
  - jika `confidence` payload baru lebih tinggi dari row existing, update diperbolehkan
  - jika `confidence` sama, pilih payload yang lebih lengkap
  - jika `confidence` lebih rendah, jangan timpa row existing kecuali row existing masih placeholder atau field penting masih kosong
- AXLE:
  - untuk saat ini tidak memakai confidence sebagai dasar update
  - keputusan update harus memakai urutan prioritas:
    - payload yang mengubah placeholder menjadi data nyata
    - payload dengan field lebih lengkap
    - payload dengan `total_axles` valid dan metadata lebih lengkap
    - payload dengan `captured_at` lebih baru jika tingkat kelengkapannya setara

## Mekanisme Timeout dan Finalisasi

- Web tetap menunggu kelengkapan data sampai batas waktu finalisasi, target saat ini maksimal 1 menit pada step akhir.
- Selama periode tunggu itu, source backend tetap boleh meng-update ownership row miliknya masing-masing.
- Jika sampai timeout finalisasi masih ada source yang belum lengkap, web tetap harus:
  - menyusun `transact_vehicle_actual` dari data yang tersedia
  - menandai source yang belum lengkap sebagai missing/partial sesuai status operasional
  - mengubah session menjadi completed
- Setelah session completed, backend watcher/service tidak boleh lagi mengisi session tersebut kecuali ada policy late-arrival yang eksplisit.

## Mekanisme Mulai Ulang

- `Mulai Ulang` saat belum ada session aktif:
  - web membuat session baru
  - seluruh source mulai dari ownership row baru untuk session baru itu
- `Mulai Ulang` saat ada session aktif dan statusnya masih non-final:
  - web tidak membuat session baru
  - web hanya mereset step visual/monitoring agar operator dapat menunggu lagi
  - backend source tetap memakai `session_id` yang sama dan hanya boleh update ownership row existing
- `Mulai Ulang` setelah session sebelumnya completed:
  - web membuat session baru
  - source tidak boleh lagi menulis ke session lama

## Mapping Idempotency per Source

| Source | Ownership row | Key payload pendukung | Strategi update |
| --- | --- | --- | --- |
| ANPR | `session_id` | `external_id`, plate, capture time, confidence | Update row session yang sama jika confidence lebih tinggi atau payload lebih lengkap |
| WB | `session_id` | `record_id`, timestamp device | Update row session yang sama jika hasil timbang lebih lengkap/final |
| AXLE | `session_id` | `external_id`, capture time | Update row session yang sama jika metadata axle lebih lengkap |
| CCTV | `session_id` | filename, filepath, recording start time | Update row session yang sama saat file rekaman final tersedia |
| DIMENSION | `session_id` | source ANPR id, processed_at, installation profile | Update row session yang sama saat hasil width/height tersedia |

## Dampak ke Database

- Table capture untuk flow baru harus mendukung query dan upsert berbasis `session_id`.
- Kolom non-identitas harus nullable agar placeholder dan partial update dapat berjalan.
- Database idealnya memiliki unique constraint atau unique partial index yang memastikan satu row per source per `session_id`.
- Jika constraint database belum bisa ditambahkan segera, service tetap wajib menjalankan guard aplikasi dengan pola update-or-insert berbasis `session_id`.

## Source Responsibility

| Source | Target responsibility | Tidak boleh |
| --- | --- | --- |
| Web | Create/start/complete session, monitor semua source, compose verification | Menunggu ANPR sebelum mulai membaca source lain |
| ANPR watcher | Listen FTP ANPR selama session aktif, simpan plate/image jika tersedia dan link ke `session_id` | Trigger wajib untuk WB/CCTV |
| WB agent | Listen session aktif dari DB, jalankan capture weighing per session, lalu insert/update `transact_weighing.session_id` | Bergantung pada ANPR capture |
| AXLE watcher | Listen FTP AXLE selama session aktif dan insert `session_id` | Hanya menyimpan data tanpa session pada flow session aktif |
| Dimension processor | Listen data ANPR baru dalam session, lalu hitung `width`/`height` dari image ANPR sesuai installation contract dan link ke session | Menjadi gate untuk WB/AXLE/CCTV atau menjadi source utama `length` bila AXLE tersedia |
| CCTV recorder | Listen session aktif dari DB, jalankan recording per session dengan `session_id` | Hanya aktif setelah ANPR sukses |

## Session Lifecycle

- Web membuat row `transact_wim_session` via Hasura dengan status awal yang disepakati, lalu mengubahnya menjadi `IN_PROGRESS` untuk memulai capture.
- Status `IN_PROGRESS` adalah sinyal aktif bagi service/watcher untuk memproses data session.
- Masing-masing service boleh memulai capture lewat polling DB active session, trigger explicit dari web/backend, atau mekanisme event DB, tetapi source of truth tetap row session di PostgreSQL.
- Lifecycle listener target:
  - `IN_PROGRESS` mulai: ANPR watcher, WB agent, AXLE watcher, dan CCTV recorder mulai/siap listen source masing-masing.
  - Selama `IN_PROGRESS`: source dapat menerima 0..n data, retry, timeout, atau placeholder sesuai rules source.
  - Dimension mulai bekerja ketika ada data ANPR baru yang terkait ke `session_id` yang sama.
  - `COMPLETED`/selesai: service berhenti mengaitkan data baru ke session tersebut kecuali ada policy late-arrival yang terdokumentasi.
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
- Dimension insert perlu mendukung `session_id` dan tetap boleh memakai ANPR ID sebagai source dependency utama saat ini.
- Trigger legacy WB/CCTV dari endpoint atau ANPR masih ada untuk compatibility, tetapi source of truth flow baru harus tetap session listener DB.
- Web processing state perlu menampilkan semua source secara independen dan tidak menganggap ANPR sebagai syarat lanjut.
